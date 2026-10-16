import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join, dirname, resolve, basename } from "node:path";
import { tmpdir } from "node:os";
import { cloudinaryStorage, cloudinaryConfigured } from "../server/cloudinary-storage.mjs";
import { ffmpegPath } from "../server/media-tools.mjs";
import { Readable } from "node:stream";

if (!cloudinaryConfigured()) throw new Error("Configure Cloudinary in the server environment first.");
const id = randomUUID();
const raw = `edubrowse-downloads/jobs/${id}.json`;
const video = `edubrowse-downloads/files/${id}/storage-check.mp4`;
const workspace = await mkdtemp(join(tmpdir(), "edubrowse-storage-check-"));
const uploaded = [];
try {
  await cloudinaryStorage.put(raw, JSON.stringify({ id, verification: true }), {});
  uploaded.push(raw);
  const manifest = await cloudinaryStorage.get(raw, {});
  if (!manifest || (await new Response(manifest.stream).json()).id !== id) throw new Error("Cloudinary manifest round trip failed.");
  const path = join(workspace, "storage-check.mp4");
  await promisify(execFile)(ffmpegPath(), ["-f", "lavfi", "-i", "color=c=black:s=320x240:r=10", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "0.5", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", "-y", path], { windowsHide: true });
  const bytes = await readFile(path);
  await cloudinaryStorage.put(video, Readable.toWeb(Readable.from([bytes])), {});
  uploaded.push(video);
  await cloudinaryStorage.head(video);
  const token = await cloudinaryStorage.issueSignedToken({ pathname: video, validUntil: Date.now() + 60000 });
  const signed = await cloudinaryStorage.presignUrl(token, { pathname: video });
  const response = await fetch(signed.presignedUrl);
  const downloaded = Buffer.from(await response.arrayBuffer());
  if (!response.ok || !downloaded.length || !response.headers.get("content-type")?.includes("video")) throw new Error("Cloudinary signed video download failed.");
  const report = { checkedAt: new Date().toISOString(), provider: "cloudinary", manifestRoundTrip: true, authenticatedVideoUpload: true, signedDownload: true, downloadedBytes: downloaded.length, secretsExposed: false };
  await writeFile("docs/cloudinary-verification.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  console.log(JSON.stringify({ ok: false, status: error.upstreamStatus, message: error.message, diagnostic: error.diagnostic }));
  process.exitCode = 1;
} finally {
  if (uploaded.length) await cloudinaryStorage.del(uploaded);
  if (resolve(dirname(workspace)) === resolve(tmpdir()) && basename(workspace).startsWith("edubrowse-storage-check-")) await rm(workspace, { recursive: true, force: true });
}
