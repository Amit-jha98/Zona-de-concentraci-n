import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import {
  searchVideos,
  recentUploads,
  videoMetadata,
} from "../server/youtube.mjs";
import { isAllowedVideo } from "../shared/contentPolicy.js";
import { CATEGORIES } from "../src/data/library.js";

const results = [];
for (const query of [
  "cricket match highlights",
  "PUBG gameplay",
  "cooking recipes",
]) {
  await assert.rejects(
    searchVideos({ query }),
    (e) => e.code === "CONTENT_NOT_ALLOWED",
  );
  results.push({ query, blocked: true });
}
for (const name of ["music", "self-improvement", "soft-skills"]) {
  const category = CATEGORIES.find((c) => c.id === name);
  const started = Date.now();
  try {
    const data = await searchVideos({
      query: category.query,
      scope: category.scope,
    });
    assert.ok(data.items.length > 0, `No live results for ${name}`);
    assert.ok(data.items.every((v) => isAllowedVideo(v, category.scope)));
    results.push({
      name,
      ms: Date.now() - started,
      count: data.items.length,
      excluded: data.excludedCount,
      sample: data.items.slice(0, 3).map(({ id, title }) => ({ id, title })),
    });
  } catch (error) {
    results.push({ name, error: error.message });
    process.exitCode = 1;
  }
  console.log(JSON.stringify(results.at(-1)));
}
const uploads = await recentUploads();
assert.ok(uploads.items.every((v) => isAllowedVideo(v)));
const video = await videoMetadata("XB4MIexjvY0");
assert.ok(isAllowedVideo(video, "cs"));
results.push({
  name: "learning-feeds",
  count: uploads.items.length,
  channels: uploads.channelsAvailable,
});
results.push({ name: "approved-playback", id: video.id, title: video.title });
if (process.argv.includes("--record"))
  await writeFile(
    "docs/content-verification.json",
    JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) +
      "\n",
  );
console.log(JSON.stringify(results.slice(-2)));
