import {
  createDownload,
  getDownload,
  getDownloadFile,
  cancelDownload,
} from "../server/downloads.mjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const job = await createDownload(process.argv[2] || "jNQXAC9IVRw", "360");
console.log(JSON.stringify({ started: job.id }));
const started = Date.now();
while (Date.now() - started < 90000) {
  const current = await getDownload(job.id);
  if (!["queued", "downloading"].includes(current.status)) {
    if (current.status === "complete") {
      const file = await getDownloadFile(current.id);
      const bytes = await readFile(file.path);
      console.log(
        JSON.stringify({
          status: current.status,
          bytes: file.size,
          fileHeader: bytes.subarray(0, 12).toString("hex"),
          filename: file.filename,
        }),
      );
      await mkdir("docs", { recursive: true });
      await writeFile(
        "docs/download-verification.json",
        JSON.stringify(
          {
            checkedAt: new Date().toISOString(),
            videoId: current.videoId,
            status: "complete",
            bytes: file.size,
            filename: file.filename,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(JSON.stringify(current));
      await mkdir("docs", { recursive: true });
      await writeFile(
        "docs/download-verification.json",
        JSON.stringify(
          {
            checkedAt: new Date().toISOString(),
            videoId: current.videoId,
            status: current.status,
            error: current.error,
          },
          null,
          2,
        ),
      );
    }
    break;
  }
  await new Promise((r) => setTimeout(r, 1000));
}
const final = await getDownload(job.id);
if (["queued", "downloading"].includes(final.status)) {
  await cancelDownload(final.id);
  console.log("Test timed out; cancelled.");
}
