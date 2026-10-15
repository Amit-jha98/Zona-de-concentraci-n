import { createHash } from "node:crypto";
import { mkdir, writeFile, chmod, rename } from "node:fs/promises";
import { resolve } from "node:path";

const asset =
  process.platform === "win32"
    ? "yt-dlp.exe"
    : process.platform === "darwin"
      ? "yt-dlp_macos"
      : "yt-dlp_linux";
const headers = {
  "User-Agent": "EduBrowse-CS-setup",
  Accept: "application/vnd.github+json",
};
async function get(url) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(120000),
  });
  if (!response.ok)
    throw new Error(
      `Download failed (${response.status}) from ${new URL(url).hostname}`,
    );
  return response;
}
try {
  const release = await (
    await get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
  ).json();
  const binary = release.assets.find((a) => a.name === asset);
  const checksums = release.assets.find((a) => a.name === "SHA2-256SUMS");
  if (!binary || !checksums)
    throw new Error(
      "No supported official binary for this platform. Set YT_DLP_PATH manually.",
    );
  const sums = await (await get(checksums.browser_download_url)).text();
  const expected = sums
    .split("\n")
    .map((s) => s.trim().split(/\s+/))
    .find((parts) => parts[1]?.replace(/^\*/, "") === asset)?.[0];
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected))
    throw new Error("Official checksum missing. Installation stopped.");
  const bytes = Buffer.from(
    await (await get(binary.browser_download_url)).arrayBuffer(),
  );
  if (createHash("sha256").update(bytes).digest("hex") !== expected)
    throw new Error("Checksum mismatch. Installation stopped.");
  await mkdir(".tools", { recursive: true });
  const path = resolve(
    ".tools",
    process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp",
  );
  await writeFile(`${path}.tmp`, bytes);
  await chmod(`${path}.tmp`, 0o755);
  await rename(`${path}.tmp`, path);
  console.log(
    `Installed official yt-dlp ${release.tag_name}; SHA-256 verified. Restart the app server if it is running.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
