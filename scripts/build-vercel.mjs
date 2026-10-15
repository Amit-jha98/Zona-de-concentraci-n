import { spawnSync } from "node:child_process";
import { ffmpegPath } from "../server/media-tools.mjs";
import { runTool } from "../server/youtube.mjs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Runs on Vercel's Linux build machine, not a developer's Windows machine.
if (!process.env.YT_DLP_PATH) {
  const expectedAsset =
    process.platform === "win32"
      ? "yt-dlp.exe"
      : process.platform === "darwin"
        ? "yt-dlp_macos"
        : "yt-dlp_linux";
  let verified = false;
  try {
    const manifest = JSON.parse(
      await readFile(".tools/downloader.json", "utf8"),
    );
    const bytes = await readFile(
      process.platform === "win32" ? ".tools/yt-dlp.exe" : ".tools/yt-dlp",
    );
    verified =
      manifest.asset === expectedAsset &&
      /^[a-f0-9]{64}$/.test(manifest.sha256) &&
      createHash("sha256").update(bytes).digest("hex") === manifest.sha256;
  } catch {
    /* A clean build installs the official executable below. */
  }
  if (!verified) await import("./setup-downloader.mjs");
}
if (!process.exitCode) {
  await runTool(["--version"], { timeout: 10000 });
  const check = spawnSync(ffmpegPath(), ["-version"], {
    windowsHide: true,
    stdio: "ignore",
    timeout: 10000,
  });
  if (check.status !== 0)
    throw new Error(
      "FFmpeg is missing. Install dependencies with scripts enabled before building.",
    );
  const build = spawnSync(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "build"],
    { stdio: "inherit", windowsHide: true },
  );
  process.exitCode = build.status ?? 1;
}
