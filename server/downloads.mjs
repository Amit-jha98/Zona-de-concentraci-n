import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  mkdir,
  readdir,
  stat,
  unlink,
  readFile,
  writeFile,
  rename,
} from "node:fs/promises";
import { resolve, basename, sep } from "node:path";
import { randomUUID } from "node:crypto";
import {
  downloaderPath,
  runTool,
  ServiceError,
  videoMetadata,
} from "./youtube.mjs";
import { VIDEO_ID } from "../shared/video.js";
import { ffmpegPath, ffmpegLocationArgs, mediaFormat } from "./media-tools.mjs";

const directory = resolve(process.env.DOWNLOAD_DIRECTORY || ".downloads");
const jobs = new Map();
let active = 0;
const MAX_JOBS = 30;
const execFileAsync = promisify(execFile);
let initialization;
let saving = Promise.resolve();
const publicJob = (job) => ({
  id: job.id,
  videoId: job.videoId,
  quality: job.quality,
  status: job.status,
  progress: job.progress,
  error: job.error,
  createdAt: job.createdAt,
  filename: job.status === "complete" ? basename(job.file) : null,
});

function persist() {
  const snapshot = JSON.stringify(
    [...jobs.values()].map(({ child: _child, ...job }) => job),
  );
  saving = saving
    .catch(() => {})
    .then(async () => {
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, "jobs.json.tmp"), snapshot, {
        mode: 0o600,
      });
      await rename(
        resolve(directory, "jobs.json.tmp"),
        resolve(directory, "jobs.json"),
      );
    });
  return saving;
}
export function initializeDownloads() {
  if (!initialization)
    initialization = (async () => {
      await mkdir(directory, { recursive: true });
      const saved = await readFile(resolve(directory, "jobs.json"), "utf8")
        .then(JSON.parse)
        .catch(() => []);
      if (!Array.isArray(saved)) return;
      for (const entry of saved.slice(-MAX_JOBS)) {
        if (
          !entry ||
          !/^[a-f0-9-]{36}$/.test(entry.id || "") ||
          !VIDEO_ID.test(entry.videoId || "") ||
          !["360", "720", "1080"].includes(entry.quality)
        )
          continue;
        const job = { ...entry };
        delete job.child;
        if (job.status === "complete") {
          const filename = basename(job.file || "");
          if (
            !filename.startsWith(job.id + ".") ||
            !/\.(mp4|webm|mkv)$/i.test(filename)
          )
            continue;
          job.file = resolve(directory, filename);
          if (!(await stat(job.file).catch(() => null))?.isFile()) {
            job.status = "expired";
            job.error =
              "The temporary file is no longer available. Download it again.";
          }
        }
        if (["queued", "downloading"].includes(job.status)) {
          job.status = "failed";
          job.error =
            "The server restarted before this download finished. Start it again.";
        }
        jobs.set(job.id, job);
      }
      await persist();
    })();
  return initialization;
}

export async function downloadStatus() {
  try {
    const version = (await runTool(["--version"], { timeout: 5000 })).trim();
    let ffmpeg = false;
    try {
      await execFileAsync(ffmpegPath(), ["-version"], {
        windowsHide: true,
        timeout: 5000,
        maxBuffer: 100000,
      });
      ffmpeg = true;
    } catch {
      /* Single-file formats can still work. */
    }
    return {
      available: true,
      mode: "local",
      version,
      ffmpeg,
      message: ffmpeg
        ? ""
        : "Install FFmpeg and put it on PATH for videos with separate audio and video streams.",
    };
  } catch {
    return {
      available: false,
      mode: "local",
      message:
        "Run npm run setup:downloads in the project folder to enable video downloads and keyless search.",
    };
  }
}

export async function createDownload(videoId, quality = "720", key = "") {
  if (
    !VIDEO_ID.test(videoId || "") ||
    !["360", "720", "1080"].includes(quality)
  )
    throw new ServiceError(
      "Choose a valid YouTube video and download quality.",
      400,
      "INVALID_DOWNLOAD",
    );
  await videoMetadata(videoId, key);
  await initializeDownloads();
  if (!(await downloadStatus()).available)
    throw new ServiceError(
      "Download helper is not installed. Run npm run setup:downloads, then retry.",
      503,
      "SETUP_REQUIRED",
    );
  const existing = [...jobs.values()].find(
    (job) =>
      job.videoId === videoId &&
      job.quality === quality &&
      ["queued", "downloading", "complete"].includes(job.status),
  );
  if (existing) return publicJob(existing);
  if (
    [...jobs.values()].filter((job) =>
      ["queued", "downloading"].includes(job.status),
    ).length >= 8
  )
    throw new ServiceError(
      "Download queue is full. Wait for a current download to finish.",
      429,
      "QUEUE_FULL",
    );
  if (jobs.size >= MAX_JOBS) {
    const old = [...jobs.values()].find(
      (job) => !["queued", "downloading"].includes(job.status),
    );
    if (old) {
      jobs.delete(old.id);
      await removeFiles(old.id);
    }
  }
  await mkdir(directory, { recursive: true });
  const job = {
    id: randomUUID(),
    videoId,
    quality,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  await persist();
  drain();
  return publicJob(job);
}

function drain() {
  if (active >= 2) return;
  const job = [...jobs.values()].find((j) => j.status === "queued");
  if (!job) return;
  active++;
  job.status = "downloading";
  persist().catch(() => {});
  const output = resolve(directory, `${job.id}.%(ext)s`);
  const child = spawn(
    downloaderPath(),
    [
      "--ignore-config",
      "--no-playlist",
      "--no-warnings",
      "--no-color",
      "--newline",
      "--progress",
      "--no-cache-dir",
      "--socket-timeout",
      "20",
      "--retries",
      "2",
      "--fragment-retries",
      "2",
      "--js-runtimes",
      `node:${process.execPath}`,
      "--merge-output-format",
      "mp4",
      ...ffmpegLocationArgs(),
      "--max-filesize",
      "2G",
      "--match-filters",
      "duration <= 18000 & !is_live",
      "-f",
      mediaFormat(job.quality),
      "-o",
      output,
      "--",
      `https://www.youtube.com/watch?v=${job.videoId}`,
    ],
    { shell: false, windowsHide: true },
  );
  job.child = child;
  let errors = "",
    done = false;
  const timer = setTimeout(() => {
    job.error =
      "Download exceeded the 30 minute limit. Retry on a faster connection.";
    child.kill();
  }, 30 * 60_000);
  const finish = async (code) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    active--;
    delete job.child;
    if (job.status !== "cancelled") {
      const files = await readdir(directory).catch(() => []);
      const filename = files.find(
        (file) =>
          file.startsWith(`${job.id}.`) && /\.(mp4|webm|mkv)$/i.test(file),
      );
      if (code === 0 && filename) {
        job.file = resolve(directory, filename);
        job.status = "complete";
        job.progress = 100;
      } else {
        job.status = "failed";
        job.error ||= /ffmpeg|ffprobe/i.test(errors)
          ? "This video has separate audio and video streams. Install FFmpeg and put it on PATH, then retry."
          : /private video|video (?:is )?unavailable|copyright|sign in|confirm.*bot/i.test(
                errors,
              )
            ? "YouTube did not make this video available for download. Try another video or open it on YouTube."
            : "Download failed. The selected format may be unavailable or YouTube may have limited the connection. Try 360p or retry later.";
        await removeFiles(job.id);
      }
    } else await removeFiles(job.id);
    await persist().catch(() => {});
    drain();
  };
  child.stdout.on("data", (buffer) => {
    const matches = [
      ...buffer.toString().matchAll(/\[download\]\s+(\d+(?:\.\d+)?)%/g),
    ];
    if (matches.length) job.progress = Math.min(99, Number(matches.at(-1)[1]));
  });
  child.stderr.on("data", (chunk) => {
    errors = (errors + chunk).slice(-4000);
  });
  child.on("error", () => finish(1));
  child.on("close", (code) => finish(code));
  drain();
}
async function removeFiles(id) {
  for (const file of await readdir(directory).catch(() => []))
    if (file.startsWith(`${id}.`))
      await unlink(resolve(directory, file)).catch(() => {});
}
export async function getDownload(id) {
  await initializeDownloads();
  const job = jobs.get(id);
  if (!job)
    throw new ServiceError(
      "Download was not found. Start a new download if the server restarted.",
      404,
      "JOB_NOT_FOUND",
    );
  return publicJob(job);
}
export async function getDownloadFile(id, key = "") {
  await initializeDownloads();
  const job = jobs.get(id);
  if (
    !job ||
    job.status !== "complete" ||
    !job.file?.startsWith(`${directory}${sep}`)
  )
    throw new ServiceError(
      "The file is not ready. Wait for the download to finish.",
      404,
    );
  await videoMetadata(job.videoId, key);
  return {
    path: job.file,
    size: (await stat(job.file)).size,
    filename: `${job.videoId}-${job.quality}p${job.file.endsWith(".mp4") ? ".mp4" : ".webm"}`,
  };
}
export async function cancelDownload(id) {
  await initializeDownloads();
  const job = jobs.get(id);
  if (!job) return;
  job.status = "cancelled";
  if (job.child) job.child.kill();
  else await removeFiles(id);
  await persist();
}
export function stopDownloads() {
  for (const job of jobs.values()) if (job.child) job.child.kill();
}

export async function cleanExpiredDownloads() {
  await initializeDownloads();
  await mkdir(directory, { recursive: true });
  for (const file of await readdir(directory)) {
    if (!/^[a-f0-9-]{36}\.[\w.-]+$/i.test(file)) continue;
    const path = resolve(directory, file);
    const details = await stat(path);
    if (
      Date.now() - details.mtimeMs > 24 * 60 * 60_000 &&
      ![...jobs.values()].some(
        (j) =>
          path.includes(j.id) && ["queued", "downloading"].includes(j.status),
      )
    ) {
      await unlink(path).catch(() => {});
      const job = [...jobs.values()].find((j) => j.file === path);
      if (job) {
        job.status = "expired";
        job.error =
          "The temporary file expired after 24 hours. Download it again.";
      }
    }
  }
  await persist();
}
