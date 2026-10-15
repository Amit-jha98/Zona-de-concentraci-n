export const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function extractVideoId(value) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (VIDEO_ID.test(input)) return input;
  try {
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`,
    );
    const host = url.hostname.toLowerCase();
    let id;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "music.youtube.com",
        "www.youtube-nocookie.com",
        "youtube-nocookie.com",
      ].includes(host)
    ) {
      const parts = url.pathname.split("/").filter(Boolean);
      id =
        parts[0] === "watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live", "v"].includes(parts[0])
            ? parts[1]
            : null;
    }
    return VIDEO_ID.test(id || "") ? id : null;
  } catch {
    return null;
  }
}

export function durationSeconds(value) {
  if (Number.isFinite(value)) return Math.max(0, value);
  if (typeof value !== "string") return 0;
  const iso = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
  if (iso) return (+iso[1] || 0) * 3600 + (+iso[2] || 0) * 60 + (+iso[3] || 0);
  if (!/^\d+(?::\d{1,2}){1,2}$/.test(value)) return 0;
  return value.split(":").reduce((total, part) => total * 60 + +part, 0);
}

export function formatDuration(value) {
  const n = Math.floor(durationSeconds(value));
  if (!n) return "";
  return n >= 3600
    ? `${Math.floor(n / 3600)}:${String(Math.floor(n / 60) % 60).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`
    : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}
export function relativeDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  const days = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(value)) / 86400000),
  );
  if (!days) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function uniqueVideos(items) {
  const map = new Map();
  for (const item of items)
    if (
      item &&
      VIDEO_ID.test(item.id || "") &&
      typeof item.title === "string" &&
      !map.has(item.id)
    )
      map.set(item.id, item);
  return [...map.values()];
}

export function decodeText(text = "") {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

export function rankRelated(video, videos, limit = 10) {
  const words = (text) =>
    new Set((text || "").toLowerCase().match(/[a-z0-9]{3,}/g) || []);
  const tokens = words(video.title);
  return uniqueVideos(videos)
    .filter((v) => v.id !== video.id)
    .map((v) => ({
      ...v,
      relevance:
        (v.subject === video.subject ? 20 : 0) +
        [...words(v.title)].filter((t) => tokens.has(t)).length * 3,
    }))
    .filter((v) => v.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}
