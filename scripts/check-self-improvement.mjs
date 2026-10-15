import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { searchVideos, videoMetadata } from "../server/youtube.mjs";
import {
  SELF_IMPROVEMENT_QUERY,
  SELF_IMPROVEMENT_SOURCES,
  isTrustedSelfImprovement,
} from "../shared/selfImprovement.js";

const results = await searchVideos({
  query: SELF_IMPROVEMENT_QUERY,
  scope: "self-improvement",
});
assert.ok(results.items.length > 0, "No institutional talks returned");
assert.ok(results.items.every(isTrustedSelfImprovement));
const example = await videoMetadata(results.items[0].id);
assert.ok(
  isTrustedSelfImprovement(example),
  "Playback must independently verify the original channel and duration",
);
const report = {
  checkedAt: new Date().toISOString(),
  count: results.items.length,
  sources: SELF_IMPROVEMENT_SOURCES.map(({ id, name, reference }) => ({
    id,
    name,
    reference,
    results: results.items.filter((v) => v.channelId === id).length,
  })),
  hasNextPage: !!results.nextPageToken,
  notice: results.notice,
  sample: results.items
    .slice(0, 9)
    .map(({ id, title, channel, channelId, duration }) => ({
      id,
      title,
      channel,
      channelId,
      duration,
    })),
  playback: {
    id: example.id,
    title: example.title,
    channelId: example.channelId,
    duration: example.duration,
  },
};
console.log(JSON.stringify(report));
if (process.argv.includes("--record"))
  await writeFile(
    "docs/self-improvement-verification.json",
    JSON.stringify(report, null, 2) + "\n",
  );
