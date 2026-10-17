import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isAllowedVideo,
  isAllowedQuery,
  allowedVideos,
} from "../shared/contentPolicy.js";
import { STARTER_VIDEOS } from "../src/data/library.js";
import { getCategory, CATEGORIES } from "../src/data/library.js";
import { SELF_IMPROVEMENT_SOURCES } from "../shared/selfImprovement.js";
import { EXAM_LESSONS } from "../src/data/gate/index.js";

test("each supported domain qualifies independently and categories stay separate", () => {
  for (const [title, scope, metadata = {}] of [
    ["Python programming in Hindi", "cs"],
    ["Dijkstra algorithm explained", "cs"],
    ["JEE exam preparation: revision plan", "exam"],
    ["GATE CS previous year questions", "exam"],
    [
      "A simple way to break a bad habit",
      "self-improvement",
      { channelId: SELF_IMPROVEMENT_SOURCES[0].id, duration: 565 },
    ],
    ["Public speaking and communication skills", "soft-skills"],
    ["Tell me about yourself: job interview", "soft-skills"],
    ["Badnam Kar Diya | New Hindi Song", "music"],
    ["Focus: instrumental music for studying", "music"],
    ["नया गाना | संगीत", "music"],
  ])
    assert.ok(isAllowedVideo({ title, ...metadata }, scope), title);
  assert.equal(isAllowedVideo({ title: "Python tutorial" }, "music"), false);
  assert.equal(
    isAllowedVideo({ title: "Build a music player app in React" }, "music"),
    false,
  );
  assert.equal(isAllowedVideo({ title: "New Hindi song" }, "cs"), false);
  assert.equal(
    isAllowedVideo({ title: "Untitled track", categoryId: "10" }, "music"),
    true,
  );
});

test("unrelated videos cannot qualify through descriptions, channel names or claimed labels", () => {
  for (const title of [
    "Cricket match highlights",
    "PUBG gameplay",
    "Minecraft survival episode 12",
    "New movie trailer",
    "Celebrity gossip",
    "Easy pasta recipe",
    "Daily travel vlog",
    "Funny prank compilation",
    "Makeup tutorial",
    "Yoga for beginners",
    "Me at the zoo",
    "Music video reaction",
    "Python coding prank",
    "GATE exam funny prank",
    "Python eats a deer",
    "React to a new song",
    "Java island tourism",
    "He beats me in chess",
    "My favorite playlist",
  ])
    assert.equal(
      isAllowedVideo({
        title,
        description: "computer science programming motivation song exam prep",
        channel: "freeCodeCamp.org",
        subject: "cs",
        contentDomains: ["cs"],
        policyVersion: 1,
      }),
      false,
      title,
    );
  assert.equal(
    isAllowedVideo({ title: "Cooking tutorial", categoryId: "27" }),
    false,
  );
  assert.equal(
    isAllowedVideo({ title: "Cricket match highlights", categoryId: "10" }),
    false,
  );
});

test("legitimate crossovers survive and unrelated query checks run before search", () => {
  for (const title of [
    "Build a Minecraft clone with JavaScript",
    "Game development with Python",
    "Movie soundtrack official song",
    "GATE CS exam preparation",
  ]) {
    assert.ok(isAllowedVideo({ title }), title);
    assert.ok(isAllowedQuery(title), title);
  }
  for (const query of [
    "cricket highlights",
    "movies",
    "PUBG gameplay",
    "cooking recipes",
    "celebrity gossip",
  ])
    assert.equal(isAllowedQuery(query), false, query);
  assert.ok(
    isAllowedQuery("Arijit Singh"),
    "ambiguous names search, but results must qualify",
  );
  assert.equal(
    allowedVideos([{ title: "Funny video" }, { title: "SQL tutorial" }]).length,
    1,
  );
});

test("self-improvement requires an original publisher, substantive length and a relevant topic", () => {
  const original = {
    title: "How to build healthy habits",
    channelId: SELF_IMPROVEMENT_SOURCES[0].id,
    duration: 600,
  };
  assert.ok(isAllowedVideo(original, "self-improvement"));
  assert.ok(
    isAllowedVideo(original, "motivation"),
    "old scope resolves to the strict replacement",
  );
  for (const update of [
    { channelId: "UC_fake_channel_000000001", channel: "TED" },
    { channelId: undefined, channel: "TED" },
    { duration: 299 },
    { duration: null },
    { isShort: true },
    { isLive: true },
    { title: "Habits #shorts" },
    { title: "Habits motivational edit compilation" },
    { title: "Black holes and dark matter" },
  ])
    assert.equal(
      isAllowedVideo({ ...original, ...update }, "self-improvement"),
      false,
      JSON.stringify(update),
    );
  assert.equal(
    isAllowedVideo({
      title: "Powerful motivational video for exams",
      duration: 1200,
      channel: "Motivation factory",
    }),
    false,
  );
});

test("category aliases resolve consistently and removed categories are absent rather than fabricated", () => {
  assert.equal(getCategory("motivation")?.id, "self-improvement");
  assert.equal(getCategory("unknown-category"), undefined);
  for (const id of ["music", "self-improvement", "soft-skills"])
    assert.ok(getCategory(id)?.query);
  assert.equal(new Set(CATEGORIES.map((c) => c.id)).size, CATEGORIES.length);
});

test("the scope policy preserves every starter and short-video coverage for all syllabus and aptitude lessons", () => {
  for (const video of STARTER_VIDEOS)
    assert.ok(isAllowedVideo(video), video.title);
  const catalog = JSON.parse(
    readFileSync("public/gate-topic-videos.json", "utf8"),
  );
  assert.equal(Object.keys(catalog.lessons).length, EXAM_LESSONS.length);
  for (const [id, entry] of Object.entries(catalog.lessons))
    assert.ok(
      entry.items.some((video) => isAllowedVideo(video)),
      id,
    );
});
