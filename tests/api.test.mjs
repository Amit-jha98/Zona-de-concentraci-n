import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { searchVideos, videoMetadata } from "../server/youtube.mjs";
import { createDownload } from "../server/downloads.mjs";
import { apiHandler } from "../server/api.mjs";

test("official YouTube search forwards real cursors, hydrates duration, and filters unembeddable videos", async () => {
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    seen.push(parsed);
    if (parsed.pathname.endsWith("/search"))
      return Response.json({
        items: [
          { id: { videoId: "XB4MIexjvY0" } },
          { id: { videoId: "aircAruvnKk" } },
        ],
        nextPageToken: "next-official-cursor",
      });
    return Response.json({
      items: [
        {
          id: "XB4MIexjvY0",
          snippet: {
            title: "Dijkstra &amp; graphs",
            channelTitle: "Abdul Bari",
            thumbnails: {
              medium: {
                url: "https://i.ytimg.com/vi/XB4MIexjvY0/mqdefault.jpg",
              },
            },
          },
          contentDetails: { duration: "PT18M35S" },
          statistics: { viewCount: "123" },
          status: { embeddable: true },
        },
        {
          id: "jNQXAC9IVRw",
          snippet: {
            title: "Cricket match highlights",
            description: "Python computer science",
            categoryId: "17",
          },
          contentDetails: { duration: "PT10M" },
          status: { embeddable: true },
        },
        {
          id: "aircAruvnKk",
          snippet: { title: "Not embeddable" },
          contentDetails: { duration: "PT10M" },
          status: { embeddable: false },
        },
      ],
    });
  };
  try {
    const result = await searchVideos({
      query: "test-official-pagination",
      pageToken: "real-upstream-token",
      duration: "concept",
      language: "hi",
      order: "date",
      key: "test-key-only-in-header",
    });
    assert.equal(result.nextPageToken, "next-official-cursor");
    assert.equal(result.items.length, 1);
    assert.equal(result.excludedCount, 1);
    assert.equal(result.items[0].duration, 1115);
    assert.equal(result.items[0].title, "Dijkstra & graphs");
    assert.equal(seen[0].searchParams.get("pageToken"), "real-upstream-token");
    assert.equal(seen[0].searchParams.get("videoDuration"), "medium");
    assert.equal(seen[0].searchParams.get("relevanceLanguage"), "hi");
    assert.ok(!JSON.stringify(result).includes("test-key-only-in-header"));
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("unsupported queries and invalid scopes are rejected without upstream requests", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("Unexpected upstream request");
  };
  try {
    await assert.rejects(
      searchVideos({ query: "cricket match highlights", key: "unused" }),
      (e) => e.status === 403 && e.code === "CONTENT_NOT_ALLOWED",
    );
    await assert.rejects(
      searchVideos({ query: "Python", scope: "sports" }),
      (e) => e.status === 400 && e.code === "INVALID_SCOPE",
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("pasted videos and downloads reject unrelated content before a media process can start", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      title: "Cricket match highlights",
      author_name: "Sports channel",
    });
  try {
    await assert.rejects(
      videoMetadata("jNQXAC9IVRw"),
      (e) => e.status === 403 && e.code === "CONTENT_NOT_ALLOWED",
    );
    await assert.rejects(
      createDownload("jNQXAC9IVRw", "720"),
      (e) => e.status === 403 && e.code === "CONTENT_NOT_ALLOWED",
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("ambiguous song titles use actual YouTube music categories, and scope filters preserve pagination", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    if (path === "/oembed")
      return Response.json({ title: "A new dawn", author_name: "Artist" });
    if (path.endsWith("/search"))
      return Response.json({
        items: [{ id: { videoId: "aircAruvnKk" } }],
        nextPageToken: "music-next-page",
      });
    return Response.json({
      items: [
        {
          id: "aircAruvnKk",
          snippet: { title: "A new dawn", categoryId: "10" },
          status: { embeddable: true },
          contentDetails: { duration: "PT3M" },
        },
      ],
    });
  };
  try {
    const video = await videoMetadata("aircAruvnKk", "music-verification-test");
    assert.deepEqual(video.contentDomains, ["music"]);
    const music = await searchVideos({
      query: "a new dawn",
      key: "music-search-test",
      scope: "music",
    });
    assert.equal(music.items.length, 1);
    const cs = await searchVideos({
      query: "a new dawn",
      key: "music-search-test",
      scope: "cs",
    });
    assert.equal(cs.items.length, 0);
    assert.equal(cs.nextPageToken, "music-next-page");
  } finally {
    globalThis.fetch = realFetch;
  }
});
test("quota exhaustion is actionable and does not silently return a fixed library", async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { error: { errors: [{ reason: "quotaExceeded" }] } },
      { status: 403 },
    );
  try {
    await assert.rejects(
      searchVideos({ query: "test-quota-handling", key: "quota-test-key" }),
      (error) => error.status === 429 && error.message.includes("quota"),
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});
test("API validates input, rejects cross-origin writes, and always returns JSON errors", async () => {
  const server = createServer((req, res) =>
    apiHandler(req, res, () => {
      res.writeHead(404);
      res.end();
    }),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const badSearch = await fetch(base + "/api/search?q=");
    assert.equal(badSearch.status, 400);
    assert.ok((await badSearch.json()).error);
    const outsideScope = await fetch(
      base + "/api/search?q=cricket+match+highlights",
    );
    assert.equal(outsideScope.status, 403);
    assert.equal((await outsideScope.json()).code, "CONTENT_NOT_ALLOWED");
    const unknown = await fetch(base + "/api/nonexistent");
    assert.equal(unknown.status, 404);
    assert.match(unknown.headers.get("content-type"), /json/);
    const origin = await fetch(base + "/api/downloads", {
      method: "POST",
      headers: {
        origin: "https://other.example",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId: "XB4MIexjvY0" }),
    });
    assert.equal(origin.status, 403);
    const malformed = await fetch(base + "/api/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    assert.equal(malformed.status, 400);
    const id = await fetch(base + "/api/video/invalid");
    assert.equal(id.status, 400);
    const download = await fetch(base + "/api/downloads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: "--exec", quality: "720" }),
    });
    assert.equal(download.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
