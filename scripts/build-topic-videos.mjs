import { GATE_LESSONS } from "../src/data/gate/index.js";
import { searchVideos } from "../server/youtube.mjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const destination = "public/gate-topic-videos.json";
let previous;
try {
  previous = JSON.parse(await readFile(destination, "utf8"));
} catch {
  previous = { lessons: {} };
}
const output = {
  checkedAt: new Date().toISOString(),
  source:
    "YouTube search metadata; topic matches by title, not an editorial review of lecture contents.",
  lessons: previous.lessons,
};
const queue = GATE_LESSONS.filter(
  (l) =>
    !output.lessons[l.id]?.items?.length ||
    output.lessons[l.id]?.query !== l.videoQuery,
);
let done = 0;
const stopwords = new Set([
  "and",
  "the",
  "for",
  "with",
  "from",
  "design",
  "introduction",
  "basics",
  "concept",
  "cs",
  "gate",
]);
const tokens = (text) =>
  text
    .toLowerCase()
    .match(/[a-z0-9]{3,}/g)
    ?.filter((t) => !stopwords.has(t)) || [];
async function worker() {
  while (queue.length) {
    const lesson = queue.shift();
    try {
      const result = await searchVideos({
        query: lesson.videoQuery,
        duration: "concept",
      });
      const words = tokens(lesson.title);
      const ranked = result.items
        .map((v) => ({
          ...v,
          score:
            words.filter((w) => v.title.toLowerCase().includes(w)).length * 3 +
            (/Gate Smashers|Neso Academy|Abdul Bari|Jenny|NPTEL/i.test(
              v.channel,
            )
              ? 2
              : 0) -
            (/pyq|gate ?20\d\d|problems? [0-9]|questions? based/i.test(v.title)
              ? 2
              : 0),
        }))
        .filter((v) => v.score > 0)
        .sort((a, b) => b.score - a.score);
      output.lessons[lesson.id] = {
        query: lesson.videoQuery,
        checkedAt: result.fetchedAt,
        items: ranked
          .slice(0, 4)
          .map(
            ({ score: _score, description: _description, ...video }) => video,
          ),
      };
    } catch (e) {
      output.lessons[lesson.id] = {
        query: lesson.videoQuery,
        items: [],
        error: e.code || e.message,
      };
    }
    done++;
    await mkdir("public", { recursive: true });
    if (done % 10 === 0 || !queue.length) {
      await writeFile(destination, JSON.stringify(output));
      console.log(
        `Resolved ${done} topics in this run; ${Object.values(output.lessons).filter((v) => v.items?.length).length} topics have focused video candidates; ${queue.length} queued.`,
      );
    }
  }
}
await Promise.all([worker(), worker(), worker()]);
await writeFile(destination, JSON.stringify(output));
const missing = GATE_LESSONS.filter(
  (l) => !output.lessons[l.id]?.items?.length,
).map((l) => ({ id: l.id, title: l.title }));
await mkdir("docs", { recursive: true });
await writeFile(
  "docs/topic-video-report.json",
  JSON.stringify(
    {
      checkedAt: output.checkedAt,
      total: GATE_LESSONS.length,
      resolved: GATE_LESSONS.length - missing.length,
      missing,
      matches: Object.entries(output.lessons)
        .filter(([, v]) => v.items?.length)
        .map(([id, v]) => ({
          id,
          videos: v.items.map((x) => ({
            id: x.id,
            title: x.title,
            duration: x.duration,
          })),
        })),
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ total: GATE_LESSONS.length, missing }));
