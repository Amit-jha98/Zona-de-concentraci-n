import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { CHANNELS } from "../src/data/library.js";
import {
  decodeText,
  durationSeconds,
  uniqueVideos,
  VIDEO_ID,
} from "../shared/video.js";

export class ServiceError extends Error {
  constructor(message, status = 502, code = "UPSTREAM_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const downloaderPath = () =>
  process.env.YT_DLP_PATH ||
  (existsSync(
    resolve(".tools", process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"),
  )
    ? resolve(".tools", process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp")
    : "yt-dlp");

export function runTool(
  args,
  { timeout = 55000, signal, maxBytes = 5_000_000 } = {},
) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(
      downloaderPath(),
      [
        "--ignore-config",
        "--no-warnings",
        "--no-color",
        "--js-runtimes",
        `node:${process.execPath}`,
        ...args,
      ],
      { windowsHide: true, shell: false, signal },
    );
    let output = "",
      stderr = "",
      finished = false;
    const finish = (error, value) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolveResult(value);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(
        new ServiceError(
          "YouTube took too long to respond. Retry or connect a YouTube API key in Settings.",
          504,
          "TIMEOUT",
        ),
      );
    }, timeout);
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (Buffer.byteLength(output) > maxBytes) {
        child.kill();
        finish(
          new ServiceError(
            "YouTube returned an oversized response. Try a more specific search.",
          ),
        );
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk).slice(-6000);
    });
    child.on("error", (error) =>
      finish(
        error.name === "AbortError"
          ? error
          : new ServiceError(
              "Live discovery needs the local search helper or a YouTube Data API key. Run npm run setup:downloads, or connect a key in Settings.",
              503,
              "SETUP_REQUIRED",
            ),
      ),
    );
    child.on("close", (code) => {
      if (code === 0) finish(null, output);
      else
        finish(
          new ServiceError(
            /429|rate.limit|confirm.*bot|sign in/i.test(stderr)
              ? "YouTube temporarily limited this connection. Connect a YouTube API key in Settings or try again later."
              : "YouTube could not complete this request. Try again, open the video on YouTube, or connect an API key in Settings.",
            502,
            "YOUTUBE_UNAVAILABLE",
          ),
        );
    });
  });
}

const cache = new Map();
const pending = new Map();
export async function cached(key, action, ttl = 10 * 60_000) {
  const now = Date.now(),
    hit = cache.get(key);
  if (hit && hit.expires > now) return hit.value;
  if (pending.has(key)) return pending.get(key);
  const promise = Promise.resolve()
    .then(action)
    .then((value) => {
      if (cache.size >= 250) cache.delete(cache.keys().next().value);
      cache.set(key, { value, expires: Date.now() + ttl });
      return value;
    })
    .finally(() => pending.delete(key));
  pending.set(key, promise);
  return promise;
}

async function google(resource, params, key) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${resource}`);
  Object.entries({ ...params, key }).forEach(
    ([k, v]) => v != null && url.searchParams.set(k, String(v)),
  );
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(18000) });
  } catch {
    throw new ServiceError(
      "Cannot reach YouTube. Check your connection and retry.",
      503,
      "OFFLINE",
    );
  }
  const data = await response.json();
  if (!response.ok) {
    const reason = data.error?.errors?.[0]?.reason;
    throw new ServiceError(
      reason === "quotaExceeded" || reason === "dailyLimitExceeded"
        ? "Your YouTube API quota is exhausted. Try later or use another project key."
        : response.status === 400 || response.status === 403
          ? "YouTube rejected the API key or search cursor. Check the key restrictions in Google Cloud and retry."
          : "YouTube is temporarily unavailable. Retry shortly.",
      response.status === 403 ? 429 : 502,
      reason || "API_ERROR",
    );
  }
  return data;
}

export async function searchVideos({
  query,
  pageToken = "",
  order = "relevance",
  duration = "any",
  language = "",
  key = "",
}) {
  const identity = createHash("sha256").update(key).digest("hex").slice(0, 16);
  const cacheKey = JSON.stringify({
    query,
    pageToken,
    order,
    duration,
    language,
    identity,
  });
  return cached(cacheKey, async () => {
    if (key) {
      if (pageToken.startsWith("local:"))
        throw new ServiceError(
          "Search provider changed. Refresh the results to continue.",
          400,
          "CURSOR_CHANGED",
        );
      const data = await google(
        "search",
        {
          part: "snippet",
          type: "video",
          q: query,
          maxResults: 24,
          order,
          videoEmbeddable: "true",
          safeSearch: "moderate",
          videoDuration: duration === "concept" ? "medium" : duration,
          relevanceLanguage: language || undefined,
          pageToken: pageToken || undefined,
        },
        key,
      );
      const ids = data.items
        .map((item) => item.id.videoId)
        .filter((id) => VIDEO_ID.test(id || ""));
      const details = ids.length
        ? await google(
            "videos",
            {
              part: "contentDetails,statistics,snippet,status",
              id: ids.join(","),
            },
            key,
          )
        : { items: [] };
      const items = uniqueVideos(
        details.items
          .filter((item) => item.status?.embeddable !== false)
          .map((item) => ({
            id: item.id,
            title: decodeText(item.snippet.title),
            channel: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            duration: durationSeconds(item.contentDetails.duration),
            views: item.statistics?.viewCount
              ? Number(item.statistics.viewCount)
              : null,
            thumbnail:
              item.snippet.thumbnails?.medium?.url ||
              item.snippet.thumbnails?.default?.url,
            source: "youtube-api",
          })),
      );
      return {
        items,
        nextPageToken: data.nextPageToken || null,
        provider: "YouTube Data API",
        fetchedAt: new Date().toISOString(),
      };
    }
    if (pageToken && !/^local:\d+$/.test(pageToken))
      throw new ServiceError(
        "Search provider changed. Refresh the results to continue.",
        400,
        "CURSOR_CHANGED",
      );
    const start = pageToken ? Number(pageToken.split(":")[1]) : 1;
    if (!Number.isInteger(start) || start < 1 || start > 1000)
      throw new ServiceError(
        "Invalid search page. Start a new search.",
        400,
        "INVALID_CURSOR",
      );
    // yt-dlp uses YouTube continuation internally. Real playlist ranges, never rotating query strings.
    const raw = await runTool([
      "--flat-playlist",
      "--lazy-playlist",
      "--dump-json",
      "--skip-download",
      "--socket-timeout",
      "15",
      "--retries",
      "1",
      "--playlist-start",
      String(start),
      "--playlist-end",
      String(start + 23),
      "--",
      `${order === "date" ? "ytsearchdateall" : "ytsearchall"}:${query}`,
    ]);
    const entries = raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    let items = uniqueVideos(
      entries
        .filter((entry) => !entry.is_live)
        .map((entry) => ({
          id: entry.id,
          title: entry.title,
          channel: entry.channel || entry.uploader || "YouTube",
          channelId: entry.channel_id,
          duration: entry.duration || null,
          views: entry.view_count ?? null,
          description: entry.description || "",
          publishedAt: entry.upload_date
            ? `${entry.upload_date.slice(0, 4)}-${entry.upload_date.slice(4, 6)}-${entry.upload_date.slice(6, 8)}T00:00:00Z`
            : null,
          thumbnail: `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
          source: "youtube-search",
        })),
    );
    if (duration === "concept")
      items = items.filter((v) => v.duration >= 120 && v.duration <= 1800);
    else if (duration === "short")
      items = items.filter((v) => v.duration && v.duration < 240);
    else if (duration === "medium")
      items = items.filter((v) => v.duration >= 240 && v.duration <= 1200);
    else if (duration === "long")
      items = items.filter((v) => v.duration > 1200);
    return {
      items,
      nextPageToken:
        entries.length === 24 && start + 24 <= 1000
          ? `local:${start + 24}`
          : null,
      provider: "YouTube search",
      fetchedAt: new Date().toISOString(),
      notice: language
        ? "Language preference is available with a YouTube API key."
        : undefined,
    };
  });
}

const xmlText = (entry, tag) =>
  decodeText(
    entry
      .match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`))?.[1]
      ?.replace(/<!\[CDATA\[|\]\]>/g, "")
      .trim() || "",
  );
export function parseFeed(xml, channel) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, entry]) => {
      const id = xmlText(entry, "yt:videoId");
      return {
        id,
        title: xmlText(entry, "title"),
        channel: channel.name,
        channelId: channel.id,
        subject: channel.subject,
        publishedAt: xmlText(entry, "published"),
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        description: xmlText(entry, "media:description"),
        source: "channel-feed",
      };
    })
    .filter((v) => VIDEO_ID.test(v.id));
}

export async function recentUploads() {
  return cached(
    "recent-uploads",
    async () => {
      const results = await Promise.allSettled(
        CHANNELS.map(async (channel) => {
          const response = await fetch(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`,
            { signal: AbortSignal.timeout(12000) },
          );
          if (!response.ok) throw new Error("Feed unavailable");
          const videos = parseFeed(await response.text(), channel);
          return channel.subject === "all"
            ? videos.filter((v) =>
                /comput|program|software|algorithm|data |network|database|discrete|linear algebra|probability|calculus|logic|system|intelligence|machine learning/i.test(
                  v.title + " " + v.description.slice(0, 800),
                ),
              )
            : videos;
        }),
      );
      const ok = results.filter((r) => r.status === "fulfilled");
      if (!ok.length)
        throw new ServiceError(
          "Cannot refresh channel uploads right now. Your saved videos and GATE lessons are still available.",
          503,
          "FEED_UNAVAILABLE",
        );
      return {
        items: uniqueVideos(ok.flatMap((r) => r.value)).sort(
          (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
        ),
        fetchedAt: new Date().toISOString(),
        provider: "YouTube channel feeds",
        channelsAvailable: ok.length,
        channelsTotal: CHANNELS.length,
      };
    },
    5 * 60_000,
  );
}

export async function videoMetadata(id) {
  return cached(
    `video:${id}`,
    async () => {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
        { signal: AbortSignal.timeout(12000) },
      );
      if (!response.ok)
        throw new ServiceError(
          "This video is unavailable, private, or cannot be embedded. Open it on YouTube to check.",
          404,
          "VIDEO_UNAVAILABLE",
        );
      const data = await response.json();
      return {
        id,
        title: data.title,
        channel: data.author_name,
        thumbnail: data.thumbnail_url,
        source: "youtube",
      };
    },
    60 * 60_000,
  );
}
