import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { renderCloudMedia } from "../server/cloud-downloads.mjs";
import { videoMetadata } from "../server/youtube.mjs";

const id = "Or4TCkDdNt8";
const directory = await mkdtemp(join(tmpdir(), "edubrowse-download-check-"));
try {
  const video = await videoMetadata(id);
  const started = Date.now();
  const media = await renderCloudMedia(id, "360", {
    directory,
    signal: AbortSignal.timeout(260000),
  });
  const bytes = await readFile(media.path);
  if (bytes.toString("ascii", 4, 8) !== "ftyp")
    throw new Error("File is not MP4");
  const { stdout } = await promisify(execFile)(
    "ffprobe",
    [
      "-v",
      "quiet",
      "-show_entries",
      "stream=codec_type,codec_name:format=duration,size",
      "-of",
      "json",
      media.path,
    ],
    { windowsHide: true },
  );
  const probe = JSON.parse(stdout);
  if (
    !["video", "audio"].every((type) =>
      probe.streams.some((s) => s.codec_type === type),
    )
  )
    throw new Error("Audio/video missing");
  const report = {
    checkedAt: new Date().toISOString(),
    id,
    title: video.title,
    bytes: bytes.length,
    ms: Date.now() - started,
    mp4: true,
    probe,
    scope:
      "Actual cloud preparation command exercised locally. Vercel Blob upload and deployed cloud egress require the project's storage connection and redeployment.",
  };
  console.log(JSON.stringify(report));
  if (process.argv.includes("--record"))
    await writeFile(
      "docs/cloud-media-verification.json",
      JSON.stringify(report, null, 2) + "\n",
    );
} finally {
  if (
    resolve(dirname(directory)) === resolve(tmpdir()) &&
    basename(directory).startsWith("edubrowse-download-check-")
  )
    await rm(directory, { recursive: true, force: true });
}
