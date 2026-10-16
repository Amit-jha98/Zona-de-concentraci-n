import { createReadStream } from "node:fs";
import {
  searchVideos,
  recentUploads,
  videoMetadata,
  ServiceError,
} from "./youtube.mjs";
import { downloadService } from "./download-service.mjs";
import { cloudDownloads } from "./cloud-downloads.mjs";
import { VIDEO_ID } from "../shared/video.js";
import { answerTopicQuestion, createTutorLimiter } from "./tutor.mjs";
import { geminiConfigured } from "./gemini-client.mjs";

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
}
async function readBody(req, limit = 4096) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new ServiceError("Expected JSON.", 415);
  // Vercel's Node adapter may already have consumed and parsed the body.
  if (req.body !== undefined) {
    const raw = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > limit)
      throw new ServiceError("Request is too large.", 413);
    try {
      const value = JSON.parse(raw);
      if (!value || typeof value !== "object" || Array.isArray(value))
        throw new Error();
      return value;
    } catch {
      throw new ServiceError("Invalid JSON object.", 400);
    }
  }
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > limit) throw new ServiceError("Request is too large.", 413);
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
const tutorLimiter = createTutorLimiter();
export async function apiHandler(req, res, next) {
  if (!req.url.startsWith("/api/")) return next?.();
  try {
    const url = new URL(req.url, "http://localhost");
    const route = url.pathname.slice(4);
    const downloads = downloadService();
    const youtubeKey =
      req.headers["x-youtube-key"] || process.env.YOUTUBE_API_KEY || "";
    if (req.headers.origin) {
      const origin = new URL(req.headers.origin);
      if (origin.host !== req.headers.host)
        throw new ServiceError("Cross-origin requests are not allowed.", 403);
    }
    if (route === "/health" && req.method === "GET")
      return send(res, 200, {
        ok: true,
        apiKeyConfigured: Boolean(process.env.YOUTUBE_API_KEY),
        hosting: process.env.VERCEL === "1" ? "vercel" : "local",
        tutor: { configured: geminiConfigured() },
        downloads: await downloads.status(),
      });
    if (route === "/tutor" && req.method === "POST") {
      const data = await readBody(req, 64000);
      const release = tutorLimiter.enter(process.env.VERCEL === "1" ? String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim() : req.socket?.remoteAddress || "local");
      const controller = new AbortController();
      const disconnect = () => { if (!res.writableEnded) controller.abort(); };
      res.on("close", disconnect);
      try {
        const reply = await answerTopicQuestion(data, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(55000)]) });
        if (!res.destroyed) return send(res, 200, reply);
        return;
      } finally {
        res.off("close", disconnect);
        release();
      }
    }
    if (route === "/maintenance/downloads" && req.method === "GET") {
      if (
        !process.env.CRON_SECRET ||
        req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
      )
        throw new ServiceError("Unauthorized.", 401, "UNAUTHORIZED");
      return send(res, 200, await cloudDownloads.cleanup());
    }
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
        pageToken.length > 5000
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
            scope: url.searchParams.get("scope") || "all",
            key: youtubeKey,
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
      return send(res, 200, await videoMetadata(id, youtubeKey));
    }
    if (route === "/downloads" && req.method === "POST") {
      const data = await readBody(req);
      const controller = new AbortController();
      const disconnect = () => {
        if (!res.writableEnded) controller.abort();
      };
      res.on("close", disconnect);
      try {
        const job = await downloads.create(
          data.videoId,
          data.quality,
          youtubeKey,
          { signal: controller.signal },
        );
        if (!res.destroyed)
          return send(res, job.status === "complete" ? 200 : 202, job);
        return;
      } finally {
        res.off("close", disconnect);
      }
    }
    const match = route.match(
      /^\/downloads\/([a-f0-9-]{36})(\/(?:file|link))?$/,
    );
    if (match && req.method === "DELETE" && !match[2]) {
      await downloads.cancel(match[1]);
      return send(res, 200, { cancelled: true });
    }
    if (match && req.method === "GET") {
      if (!match[2]) return send(res, 200, await downloads.get(match[1]));
      const file = await downloads.file(match[1], youtubeKey);
      if (match[2] === "/link")
        return send(res, 200, {
          url: file.redirect || `/api/downloads/${match[1]}/file`,
        });
      if (file.redirect) {
        res.writeHead(302, {
          Location: file.redirect,
          "Cache-Control": "no-store",
          "Referrer-Policy": "no-referrer",
        });
        return res.end();
      }
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
