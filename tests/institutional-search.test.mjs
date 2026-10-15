import test from "node:test";
import assert from "node:assert/strict";
import { searchVideos, videoMetadata } from "../server/youtube.mjs";
import {
  SELF_IMPROVEMENT_SOURCES,
  SELF_IMPROVEMENT_QUERY,
} from "../shared/selfImprovement.js";
import { isAllowedVideo } from "../shared/contentPolicy.js";

test("institutional search enforces publisher and length, balances sources, and continues each real cursor independently", async () => {
  const originalFetch = globalThis.fetch;
  const requests = [],
    records = new Map();
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname.endsWith("/search")) {
      const source = SELF_IMPROVEMENT_SOURCES.find(
        (s) => s.id === parsed.searchParams.get("channelId"),
      );
      assert.ok(
        source,
        "search must be restricted to an approved original publisher",
      );
      const index = SELF_IMPROVEMENT_SOURCES.indexOf(source);
      const next = parsed.searchParams.get("pageToken");
      requests.push({ source, query: parsed.searchParams.get("q"), next });
      const entries = [
        {
          channelId: source.id,
          channelTitle: source.name,
          title: "Habits, happiness and sleep explained",
          duration: "PT10M",
        },
        {
          channelId: "UC_fake_account_000000001",
          channelTitle: source.name,
          title: "Healthy habits explained",
          duration: "PT12M",
        },
        {
          channelId: source.id,
          channelTitle: source.name,
          title: "Healthy habits #shorts",
          duration: "PT1M",
        },
      ].map((entry, n) => {
        const id = `a${String(index * 100 + (next ? 10 : 0) + n).padStart(10, "0")}`;
        records.set(id, {
          id,
          snippet: entry,
          contentDetails: { duration: entry.duration },
          status: { embeddable: true },
        });
        return { id: { videoId: id } };
      });
      return Response.json({
        items: entries,
        ...(index === 0 && !next
          ? { nextPageToken: "actual-ted-continuation" }
          : {}),
      });
    }
    return Response.json({
      items: parsed.searchParams
        .get("id")
        .split(",")
        .map((id) => records.get(id)),
    });
  };
  try {
    const args = {
      query: SELF_IMPROVEMENT_QUERY,
      scope: "self-improvement",
      key: "institutional-pagination-test",
    };
    const first = await searchVideos(args);
    assert.equal(first.items.length, 3);
    assert.ok(
      first.items.every((video) => isAllowedVideo(video, "self-improvement")),
    );
    assert.deepEqual(
      first.items.map((v) => v.channelId),
      SELF_IMPROVEMENT_SOURCES.map((s) => s.id),
    );
    assert.deepEqual(
      requests.map((r) => r.query),
      SELF_IMPROVEMENT_SOURCES.map((s) => s.query),
    );
    assert.match(first.nextPageToken, /^sources:/);
    const next = await searchVideos({
      ...args,
      pageToken: first.nextPageToken,
    });
    assert.equal(next.items.length, 1);
    assert.equal(next.nextPageToken, null);
    assert.equal(requests.length, 4);
    assert.equal(requests.at(-1).next, "actual-ted-continuation");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("invalid source cursors fail before upstream work", async () => {
  for (const pageToken of [
    "local:25",
    "sources:invalid",
    `sources:${Buffer.from(JSON.stringify({ v: 1, p: [""] })).toString("base64url")}`,
  ])
    await assert.rejects(
      searchVideos({ query: "sleep", scope: "self-improvement", pageToken }),
      (error) => error.code === "INVALID_CURSOR",
    );
});

test("direct self-improvement playback hydrates actual publisher and duration rather than trusting oEmbed's author name", async () => {
  const originalFetch = globalThis.fetch;
  let fakePublisher = false;
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    if (parsed.pathname === "/oembed")
      return Response.json({
        title: "A simple way to break a bad habit",
        author_name: "TED",
      });
    assert.ok(parsed.searchParams.get("part").includes("contentDetails"));
    return Response.json({
      items: [
        {
          id: "arj7oStGLkU",
          snippet: {
            title: "A simple way to break a bad habit",
            channelId: fakePublisher
              ? "UC_fake_account_000000001"
              : SELF_IMPROVEMENT_SOURCES[0].id,
          },
          contentDetails: { duration: "PT9M25S" },
          status: { embeddable: true },
        },
      ],
    });
  };
  try {
    const approved = await videoMetadata(
      "arj7oStGLkU",
      "self-improvement-metadata-original",
    );
    assert.equal(approved.duration, 565);
    assert.ok(approved.contentDomains.includes("self-improvement"));
    fakePublisher = true;
    await assert.rejects(
      videoMetadata("arj7oStGLkU", "self-improvement-metadata-spoof"),
      (error) => error.code === "CONTENT_NOT_ALLOWED",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
