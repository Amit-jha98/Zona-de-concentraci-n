import { createReadStream } from "node:fs";
import {
  searchVideos,
  recentUploads,
  videoMetadata,
  ServiceError,
} from "./youtube.mjs";
import {
  createDownload,
  getDownload,
  getDownloadFile,
  downloadStatus,
  cancelDownload,
} from "./downloads.mjs";
import { VIDEO_ID } from "../shared/video.js";

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new ServiceError("Expected JSON.", 415);
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 4096) throw new ServiceError("Request is too large.", 413);
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Expected an object");
    return value;
  } catch {
    throw new ServiceError("Invalid JSON object.", 400);
  }
}

let activeSearches = 0;
export async function apiHandler(req, res, next) {
  if (!req.url.startsWith("/api/")) return next?.();
  try {
    const url = new URL(req.url, "http://localhost");
    const route = url.pathname.slice(4);
    if (req.headers.origin) {
      const origin = new URL(req.headers.origin);
      if (origin.host !== req.headers.host)
        throw new ServiceError("Cross-origin requests are not allowed.", 403);
    }
    if (route === "/health" && req.method === "GET")
      return send(res, 200, {
        ok: true,
        apiKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY),
        downloads: await downloadStatus(),
      });
    if (route === "/search" && req.method === "GET") {
      const query = (url.searchParams.get("q") || "").trim();
      const order = url.searchParams.get("order") || "relevance";
      const duration = url.searchParams.get("duration") || "any";
      const language = url.searchParams.get("language") || "";
      const pageToken = url.searchParams.get("pageToken") || "";
      if (
        !query ||
        query.length > 250 ||
        !["relevance", "date"].includes(order) ||
        !["any", "concept", "short", "medium", "long"].includes(duration) ||
        !["", "en", "hi"].includes(language) ||
        pageToken.length > 1000
      )
        throw new ServiceError("Invalid search options.", 400);
      if (activeSearches >= 4)
        throw new ServiceError(
          "Search is busy. Please retry in a moment.",
          429,
        );
      activeSearches++;
      try {
        return send(
          res,
          200,
          await searchVideos({
            query,
            pageToken,
            order,
            duration,
            language,
            key:
              req.headers["x-youtube-key"] || process.env.YOUTUBE_API_KEY || "",
          }),
        );
      } finally {
        activeSearches--;
      }
    }
    if (route === "/uploads" && req.method === "GET")
      return send(res, 200, await recentUploads());
    if (route.startsWith("/video/") && req.method === "GET") {
      const id = route.split("/")[2];
      if (!VIDEO_ID.test(id || ""))
        throw new ServiceError("Invalid YouTube video ID.", 400);
      return send(res, 200, await videoMetadata(id));
    }
    if (route === "/downloads" && req.method === "POST") {
      const data = await readBody(req);
      return send(res, 202, await createDownload(data.videoId, data.quality));
    }
    const match = route.match(/^\/downloads\/([a-f0-9-]{36})(\/file)?$/);
    if (match && req.method === "DELETE" && !match[2]) {
      await cancelDownload(match[1]);
      return send(res, 200, { cancelled: true });
    }
    if (match && req.method === "GET") {
      if (!match[2]) return send(res, 200, await getDownload(match[1]));
      const file = await getDownloadFile(match[1]);
      res.writeHead(200, {
        "Content-Type": file.filename.endsWith(".mp4")
          ? "video/mp4"
          : "video/webm",
        "Content-Length": file.size,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      const stream = createReadStream(file.path);
      stream.on("error", () => res.destroy());
      res.on("close", () => stream.destroy());
      return stream.pipe(res);
    }
    send(res, 404, { error: "API route not found." });
  } catch (error) {
    if (!res.headersSent)
      send(res, error.status || 502, {
        error:
          error instanceof ServiceError
            ? error.message
            : "The request could not be completed. Please retry.",
        code: error.code || "SERVER_ERROR",
      });
    else res.destroy();
  }
}
