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
async function get(url, accept = headers.Accept) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { ...headers, Accept: accept },
        signal: AbortSignal.timeout(60000),
      });
      if (response.ok) return response;
      await response.body?.cancel();
      lastError = new Error(
        `Download failed (${response.status}) from ${new URL(url).hostname}`,
      );
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = new Error(
        `Cannot fetch downloader tools from ${new URL(url).hostname}: ${error.cause?.code || error.message}`,
      );
    }
    if (attempt < 2)
      await new Promise((done) => setTimeout(done, 1000 * (attempt + 1)));
  }
  throw lastError;
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
  const sums = await (
    await get(checksums.url, "application/octet-stream")
  ).text();
  const expected = sums
    .split("\n")
    .map((s) => s.trim().split(/\s+/))
    .find((parts) => parts[1]?.replace(/^\*/, "") === asset)?.[0];
  if (!expected || !/^[a-f0-9]{64}$/i.test(expected))
    throw new Error("Official checksum missing. Installation stopped.");
  const bytes = Buffer.from(
    await (await get(binary.url, "application/octet-stream")).arrayBuffer(),
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
  await writeFile(
    resolve(".tools", "downloader.json"),
    JSON.stringify({
      asset,
      version: release.tag_name,
      sha256: expected.toLowerCase(),
    }) + "\n",
  );
  console.log(
    `Installed official yt-dlp ${release.tag_name}; SHA-256 verified. Restart the app server if it is running.`,
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
