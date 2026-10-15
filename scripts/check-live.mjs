import {
  recentUploads,
  searchVideos,
  videoMetadata,
} from "../server/youtube.mjs";
import { STARTER_VIDEOS } from "../src/data/library.js";
import { writeFile } from "node:fs/promises";
const results = {};
for (const [name, action] of [
  ["uploads", () => recentUploads()],
  [
    "search",
    () =>
      searchVideos({
        query: "Dijkstra algorithm Abdul Bari",
        duration: "concept",
      }),
  ],
  ["metadata", () => videoMetadata("XB4MIexjvY0")],
]) {
  const start = Date.now();
  try {
    const data = await action();
    results[name] = data;
    console.log(
      JSON.stringify({
        name,
        ms: Date.now() - start,
        count: data.items?.length,
        next: data.nextPageToken,
        provider: data.provider,
        title: data.title,
        sample: data.items
          ?.slice(0, 2)
          .map((v) => ({ id: v.id, title: v.title, duration: v.duration })),
      }),
    );
  } catch (error) {
    results[name] = { error: error.message, code: error.code };
    console.log(
      JSON.stringify({ name, error: error.message, code: error.code }),
    );
  }
}
if (process.argv.includes("--verify-library")) {
  const verified = await Promise.allSettled(
    STARTER_VIDEOS.map((v) => videoMetadata(v.id)),
  );
  console.log(
    JSON.stringify({
      library: verified.map((r, i) => ({
        id: STARTER_VIDEOS[i].id,
        ...(r.status === "fulfilled" ? r.value : { error: r.reason.message }),
      })),
    }),
  );
  await writeFile(
    "docs/library-verification.json",
    JSON.stringify(
      verified.filter((r) => r.status === "fulfilled").map((r) => r.value),
      null,
      2,
    ),
  );
}
if (process.argv.includes("--record"))
  await writeFile(
    "docs/live-verification.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        results: Object.fromEntries(
          Object.entries(results).map(([key, value]) => [
            key,
            value.items
              ? {
                  count: value.items.length,
                  provider: value.provider,
                  channelsAvailable: value.channelsAvailable,
                  channelsTotal: value.channelsTotal,
                  nextPageToken: value.nextPageToken,
                  sample: value.items.slice(0, 6).map((v) => ({
                    id: v.id,
                    title: v.title,
                    duration: v.duration,
                  })),
                }
              : value,
          ]),
        ),
      },
      null,
      2,
    ),
  );
