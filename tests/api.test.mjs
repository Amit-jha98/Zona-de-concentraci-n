import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { searchVideos } from "../server/youtube.mjs";
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
