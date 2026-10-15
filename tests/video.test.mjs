import test from "node:test";
import assert from "node:assert/strict";
import {
  extractVideoId,
  durationSeconds,
  formatDuration,
  uniqueVideos,
  rankRelated,
} from "../shared/video.js";
import { parseFeed, cached } from "../server/youtube.mjs";

test("accept canonical, short, embed, mobile, live and shorts YouTube URLs", () => {
  for (const url of [
    "XB4MIexjvY0",
    "https://youtu.be/XB4MIexjvY0?t=3",
    "https://www.youtube.com/watch?feature=share&v=XB4MIexjvY0",
    "youtube.com/shorts/XB4MIexjvY0",
    "https://m.youtube.com/live/XB4MIexjvY0",
    "https://www.youtube-nocookie.com/embed/XB4MIexjvY0",
  ])
    assert.equal(extractVideoId(url), "XB4MIexjvY0", url);
});
test("reject lookalike domains, partial IDs and injection-shaped URLs", () => {
  for (const url of [
    "https://evil.youtube.com/watch?v=XB4MIexjvY0",
    "https://youtube.com.evil.test/watch?v=XB4MIexjvY0",
    "https://evil.test/youtube.com/watch?v=XB4MIexjvY0",
    "https://youtu.be/XB4MIexjvY0more",
    "not a video",
    null,
  ])
    assert.equal(extractVideoId(url), null, url);
});
test("ISO and display durations preserve seconds without inventing unavailable values", () => {
  assert.equal(durationSeconds("PT1H2M3S"), 3723);
  assert.equal(durationSeconds("PT19M"), 1140);
  assert.equal(durationSeconds("1:02:03"), 3723);
  assert.equal(formatDuration(3723), "1:02:03");
  assert.equal(formatDuration("Lecture"), "");
});
test("pagination deduplication retains first metadata and rejects invalid IDs", () => {
  const a = { id: "XB4MIexjvY0", title: "First" };
  assert.deepEqual(
    uniqueVideos([a, { ...a, title: "Second" }, { id: "fake", title: "Bad" }]),
    [a],
  );
});
test("related recommendations never fill with unrelated videos", () => {
  const current = {
    id: "XB4MIexjvY0",
    title: "Dijkstra shortest paths",
    subject: "algorithms",
  };
  const pool = [
    { id: "rfscVS0vtbw", title: "Python tutorial", subject: "web" },
    { id: "0IAPZzGSbME", title: "Algorithms", subject: "algorithms" },
  ];
  assert.deepEqual(
    rankRelated(current, pool).map((v) => v.id),
    ["0IAPZzGSbME"],
  );
});
test("RSS parses only real entries and retains publication timestamps", () => {
  const xml =
    "<feed><entry><yt:videoId>XB4MIexjvY0</yt:videoId><title>A &amp; B</title><published>2026-01-01T00:00:00Z</published></entry><entry><yt:videoId>invalid</yt:videoId></entry></feed>";
  const result = parseFeed(xml, {
    name: "A channel",
    id: "abc",
    subject: "algorithms",
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "A & B");
  assert.equal(result[0].publishedAt, "2026-01-01T00:00:00Z");
});
test("concurrent identical searches coalesce and failed requests are not cached", async () => {
  let calls = 0;
  const result = await Promise.all([
    cached("test-coalesce", async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 5));
      return 42;
    }),
    cached("test-coalesce", () => {
      calls++;
      return 99;
    }),
  ]);
  assert.deepEqual(result, [42, 42]);
  assert.equal(calls, 1);
  await assert.rejects(
    cached("test-failure", () => Promise.reject(new Error("failure"))),
  );
  assert.equal(await cached("test-failure", () => 7), 7);
});
