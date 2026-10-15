import * as Blob from "@vercel/blob";
import { createReadStream, existsSync } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import {
  downloaderPath,
  runTool,
  videoMetadata,
  ServiceError,
} from "./youtube.mjs";
import { ffmpegPath, ffmpegLocationArgs, mediaFormat } from "./media-tools.mjs";
import { VIDEO_ID } from "../shared/video.js";

const PREFIX = "edubrowse-downloads/";
export const CLOUD_DOWNLOAD_LIMITS = {
  maxBytes: 150 * 1024 * 1024,
  timeoutMs: 270000,
  retentionMs: 86400000,
};
const validJobId = (id) => /^[a-f0-9-]{36}$/.test(id || "");
const configured = () =>
  Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
const missingStorage = () =>
  new ServiceError(
    "Downloads need storage on this deployment. Connect a Private Vercel Blob store to this project, then redeploy.",
    503,
    "DOWNLOAD_STORAGE_REQUIRED",
  );
const missingJob = () =>
  new ServiceError(
    "This download is no longer available. Prepare the video again.",
    404,
    "JOB_NOT_FOUND",
  );
const publicJob = ({ filePath: _filePath, ...job }) => job;

async function ensureTools() {
  if (!existsSync(downloaderPath()) || !existsSync(ffmpegPath()))
    throw new ServiceError(
      "Download tools are missing from the deployment. Use npm run build:vercel as the Vercel build command and redeploy.",
      503,
      "DOWNLOAD_TOOLS_MISSING",
    );
}

// The invocation stays alive until this finishes; no detached background job or
// subsequent request depends on an instance's memory or ephemeral filesystem.
export async function renderCloudMedia(
  videoId,
  quality,
  { directory, signal },
) {
  let output;
  try {
    output = await runTool(
      [
        "--no-playlist",
        "--no-progress",
        "--abort-on-unavailable-fragments",
        "--socket-timeout",
        "15",
        "--retries",
        "1",
        "--fragment-retries",
        "1",
        ...ffmpegLocationArgs(),
        "--merge-output-format",
        "mp4",
        "--remux-video",
        "mp4",
        "--max-filesize",
        "75M",
        "--match-filters",
        "duration <= 18000 & !is_live",
        "-f",
        mediaFormat(quality),
        "-o",
        join(directory, "video.%(ext)s"),
        "--",
        `https://www.youtube.com/watch?v=${videoId}`,
      ],
      { timeout: 225000, signal, maxBytes: 500000 },
    );
  } catch (error) {
    if (error.code === "YOUTUBE_UNAVAILABLE")
      throw new ServiceError(
        "YouTube did not allow this download from the hosted server. Try another video or retry later.",
        502,
        "DOWNLOAD_UPSTREAM_BLOCKED",
      );
    throw error;
  }
  const path = join(directory, "video.mp4");
  const info = await stat(path).catch(() => null);
  if (!info?.isFile() || !info.size) {
    if (/max.filesize|larger than/i.test(output || ""))
      throw new ServiceError(
        "This video exceeds the hosted download size limit. Try 360p or a shorter video.",
        413,
        "DOWNLOAD_TOO_LARGE",
      );
    throw new ServiceError(
      "YouTube did not provide a complete video file. Try another video or a lower quality.",
      502,
      "DOWNLOAD_INCOMPLETE",
    );
  }
  if (info.size > CLOUD_DOWNLOAD_LIMITS.maxBytes)
    throw new ServiceError(
      "This video exceeds the hosted download size limit. Try 360p or a shorter video.",
      413,
      "DOWNLOAD_TOO_LARGE",
    );
  return { path, size: info.size };
}

export function createCloudDownloadService({
  blob = Blob,
  render = renderCloudMedia,
  approve = videoMetadata,
  isConfigured = configured,
  tools = ensureTools,
  now = Date.now,
} = {}) {
  let active = false;
  const requireStorage = () => {
    if (!isConfigured()) throw missingStorage();
  };
  const readJob = async (id) => {
    requireStorage();
    if (!validJobId(id)) throw missingJob();
    let data;
    try {
      const result = await blob.get(`${PREFIX}jobs/${id}.json`, {
        access: "private",
        useCache: false,
        abortSignal: AbortSignal.timeout(15000),
      });
      if (!result?.stream) throw missingJob();
      data = await new Response(result.stream).json();
    } catch (error) {
      if (error.name === "BlobNotFoundError") throw missingJob();
      throw error;
    }
    if (
      data.id !== id ||
      !VIDEO_ID.test(data.videoId || "") ||
      !["360", "720", "1080"].includes(data.quality) ||
      data.filePath !==
        `${PREFIX}files/${id}/${data.videoId}-${data.quality}p.mp4` ||
      !Number.isFinite(Date.parse(data.expiresAt))
    )
      throw missingJob();
    return data;
  };
  const expired = (job) => Date.parse(job.expiresAt) <= now();
  return {
    async status() {
      const result = { mode: "cloud", maxSizeMB: 150, preparationSeconds: 270 };
      if (!isConfigured())
        return {
          ...result,
          available: false,
          message: missingStorage().message,
        };
      try {
        await tools();
        return { ...result, available: true, ffmpeg: true, message: "" };
      } catch (error) {
        return { ...result, available: false, message: error.message };
      }
    },
    async create(
      videoId,
      quality = "720",
      key = "",
      { signal: clientSignal } = {},
    ) {
      if (
        !VIDEO_ID.test(videoId || "") ||
        !["360", "720", "1080"].includes(quality)
      )
        throw new ServiceError(
          "Choose a valid YouTube video and quality.",
          400,
          "INVALID_DOWNLOAD",
        );
      requireStorage();
      if (active)
        throw new ServiceError(
          "A video is being prepared. Please retry in a few minutes.",
          429,
          "DOWNLOAD_BUSY",
        );
      active = true;
      const signal = clientSignal
        ? AbortSignal.any([
            clientSignal,
            AbortSignal.timeout(CLOUD_DOWNLOAD_LIMITS.timeoutMs),
          ])
        : AbortSignal.timeout(CLOUD_DOWNLOAD_LIMITS.timeoutMs);
      let workspace,
        committed = false;
      const created = [];
      try {
        await tools();
        const video = await approve(videoId, key);
        signal.throwIfAborted();
        workspace = await mkdtemp(join(tmpdir(), "edubrowse-download-"));
        const media = await render(videoId, quality, {
          directory: workspace,
          signal,
        });
        signal.throwIfAborted();
        const info = await stat(media.path);
        if (
          resolve(dirname(media.path)) !== resolve(workspace) ||
          !info.isFile() ||
          !info.size ||
          info.size > CLOUD_DOWNLOAD_LIMITS.maxBytes
        )
          throw new ServiceError(
            "This video exceeds the hosted download size limit. Try 360p or a shorter video.",
            413,
            "DOWNLOAD_TOO_LARGE",
          );
        const id = randomUUID(),
          filename = `${videoId}-${quality}p.mp4`;
        const filePath = `${PREFIX}files/${id}/${filename}`;
        created.push(filePath);
        const stream = createReadStream(media.path);
        try {
          await blob.put(filePath, Readable.toWeb(stream), {
            access: "private",
            contentType: "video/mp4",
            addRandomSuffix: false,
            multipart: true,
            abortSignal: signal,
          });
        } finally {
          stream.destroy();
        }
        signal.throwIfAborted();
        const job = {
          id,
          videoId,
          quality,
          title: video.title,
          thumbnail: video.thumbnail,
          status: "complete",
          progress: 100,
          filename,
          filePath,
          size: info.size,
          storage: "vercel-blob",
          createdAt: new Date(now()).toISOString(),
          expiresAt: new Date(
            now() + CLOUD_DOWNLOAD_LIMITS.retentionMs,
          ).toISOString(),
        };
        const jobPath = `${PREFIX}jobs/${id}.json`;
        created.push(jobPath);
        await blob.put(jobPath, JSON.stringify(job), {
          access: "private",
          contentType: "application/json",
          addRandomSuffix: false,
          abortSignal: signal,
        });
        signal.throwIfAborted();
        committed = true;
        return publicJob(job);
      } catch (error) {
        if (signal.aborted)
          throw new ServiceError(
            clientSignal?.aborted
              ? "Download preparation was cancelled."
              : "Preparing this video took too long. Try 360p or a shorter video.",
            clientSignal?.aborted ? 499 : 504,
            clientSignal?.aborted ? "DOWNLOAD_CANCELLED" : "DOWNLOAD_TIMEOUT",
          );
        if (error.name?.startsWith("Blob"))
          throw new ServiceError(
            "Download storage is unavailable. Check that a Private Vercel Blob store is connected to this deployment, then retry.",
            503,
            "DOWNLOAD_STORAGE_ERROR",
          );
        throw error;
      } finally {
        if (!committed && created.length)
          await blob
            .del(created, { abortSignal: AbortSignal.timeout(5000) })
            .catch(() => {});
        // Only remove the fresh, verified child of the OS temporary directory.
        if (
          workspace &&
          resolve(dirname(workspace)) === resolve(tmpdir()) &&
          basename(workspace).startsWith("edubrowse-download-")
        )
          await rm(workspace, { recursive: true, force: true }).catch(() => {});
        active = false;
      }
    },
    async get(id) {
      const job = await readJob(id);
      return publicJob(
        expired(job)
          ? {
              ...job,
              status: "expired",
              error: "This download expired. Prepare the video again.",
            }
          : job,
      );
    },
    async file(id, key = "") {
      const job = await readJob(id);
      if (expired(job))
        throw new ServiceError(
          "This download expired. Prepare the video again.",
          410,
          "DOWNLOAD_EXPIRED",
        );
      await approve(job.videoId, key);
      try {
        await blob.head(job.filePath, {
          abortSignal: AbortSignal.timeout(15000),
        });
      } catch (error) {
        if (error.name === "BlobNotFoundError") throw missingJob();
        throw error;
      }
      const token = await blob.issueSignedToken({
        pathname: job.filePath,
        operations: ["get"],
        validUntil: Math.min(Date.parse(job.expiresAt), now() + 15 * 60000),
        abortSignal: AbortSignal.timeout(15000),
      });
      const { presignedUrl } = await blob.presignUrl(token, {
        operation: "get",
        pathname: job.filePath,
        access: "private",
      });
      return { redirect: blob.getDownloadUrl(presignedUrl) };
    },
    async cancel(id) {
      const job = await readJob(id);
      await blob.del([job.filePath, `${PREFIX}jobs/${id}.json`], {
        abortSignal: AbortSignal.timeout(15000),
      });
    },
    async cleanup() {
      requireStorage();
      let cursor,
        deleted = 0;
      for (let page = 0; page < 5; page++) {
        const data = await blob.list({
          prefix: PREFIX,
          limit: 200,
          ...(cursor ? { cursor } : {}),
          abortSignal: AbortSignal.timeout(15000),
        });
        const old = data.blobs.filter(
          (item) =>
            item.pathname.startsWith(PREFIX) &&
            now() - new Date(item.uploadedAt).getTime() >=
              CLOUD_DOWNLOAD_LIMITS.retentionMs,
        );
        if (old.length) {
          await blob.del(
            old.map((item) => item.url),
            { abortSignal: AbortSignal.timeout(15000) },
          );
          deleted += old.length;
        }
        if (!data.hasMore) break;
        cursor = data.cursor;
      }
      return { deleted };
    },
  };
}

export const cloudDownloads = createCloudDownloadService();
