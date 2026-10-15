import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { apiHandler } from "./api.mjs";
import { cleanExpiredDownloads, stopDownloads } from "./downloads.mjs";

const root = resolve("dist");
if (!existsSync(resolve(root, "index.html"))) {
  console.error("Build the app first: npm run build");
  process.exit(1);
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};
const server = createServer((req, res) =>
  apiHandler(req, res, async () => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405);
        return res.end();
      }
      const path = resolve(
        root,
        `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`,
      );
      if (path !== root && !path.startsWith(root + sep)) {
        res.writeHead(403);
        return res.end();
      }
      let file = path;
      const info = await stat(path).catch(() => null);
      if (!info?.isFile()) {
        if (extname(path)) {
          res.writeHead(404);
          return res.end("Not found");
        }
        file = resolve(root, "index.html");
      }
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Cache-Control": file.includes(`${sep}assets${sep}`)
          ? "public, max-age=31536000, immutable"
          : "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      });
      if (req.method === "HEAD") return res.end();
      const stream = createReadStream(file);
      stream.on("error", () => res.destroy());
      res.on("close", () => stream.destroy());
      stream.pipe(res);
    } catch {
      res.writeHead(400);
      res.end("Bad request");
    }
  }),
);
server.listen(
  Number(process.env.PORT || 4173),
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `EduBrowse CS: http://${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 4173}`,
    ),
);
cleanExpiredDownloads().catch(() => {});
const cleanup = setInterval(
  () => cleanExpiredDownloads().catch(() => {}),
  60 * 60_000,
);
cleanup.unref();
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    stopDownloads();
    server.close(() => process.exit(0));
  });
