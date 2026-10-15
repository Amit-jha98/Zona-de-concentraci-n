import test from "node:test";
import assert from "node:assert/strict";
import {
  GATE_SECTIONS,
  GATE_LESSONS,
  LESSON_BY_ID,
  lessonMarkdown,
} from "../src/data/gate/index.js";
import { readFileSync } from "node:fs";
import { VIDEO_ID } from "../shared/video.js";

test("PDF syllabus has exactly ten distinct, ordered sections", () => {
  assert.deepEqual(
    GATE_SECTIONS.map((s) => s.number),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.equal(new Set(GATE_SECTIONS.map((s) => s.id)).size, 10);
});
test("every concept has substantive notes, a worked example, a pitfall, a video query and explained practice", () => {
  assert.ok(GATE_LESSONS.length >= 140);
  assert.equal(
    new Set(GATE_LESSONS.map((l) => l.id)).size,
    GATE_LESSONS.length,
  );
  const questionIds = new Set();
  for (const lesson of GATE_LESSONS) {
    assert.equal(LESSON_BY_ID[lesson.id], lesson);
    assert.ok(lesson.notes.length >= 3, lesson.id);
    assert.ok(lesson.notes.join(" ").length >= 400, lesson.id);
    assert.ok(lesson.example.length >= 3, lesson.id);
    assert.ok(lesson.pitfall.length > 25, lesson.id);
    assert.ok(lesson.videoQuery.length >= 15, lesson.id);
    assert.ok(lesson.quiz.length > 0, lesson.id);
    for (const q of lesson.quiz) {
      assert.ok(!questionIds.has(q.id), q.id);
      questionIds.add(q.id);
      assert.equal(q.options.length, 4, q.id);
      assert.equal(new Set(q.options).size, 4, q.id);
      assert.ok(
        Number.isInteger(q.answer) &&
          q.answer >= 0 &&
          q.answer < q.options.length,
        q.id,
      );
      assert.ok(q.explanation.length >= 80, q.id);
    }
  }
});
test("previously missing syllabus concepts have explicit lessons", () => {
  for (const id of [
    "first-order-logic",
    "monoids",
    "groups",
    "graph-matching",
    "generating-functions",
    "lu-decomposition",
    "limits",
    "mean-value-theorem",
    "integration",
    "normal-distribution",
    "poisson-distribution",
    "tabular-minimization",
    "microprogrammed-control",
    "memory-interfacing",
    "c-pointers",
    "runtime-environments",
    "constant-propagation",
    "liveness-analysis",
    "common-subexpressions",
    "file-systems",
    "tuple-calculus",
    "ipv4-fragmentation",
    "nat",
    "socket-api",
    "http",
  ])
    assert.ok(LESSON_BY_ID[id], id);
});
test("markdown exports the complete example, correct answer and explanation", () => {
  const lesson = LESSON_BY_ID["propositional-logic"],
    text = lessonMarkdown(lesson);
  assert.ok(text.includes(lesson.notes[2]));
  assert.ok(text.includes(lesson.example[2]));
  assert.ok(text.includes(lesson.quiz[0].explanation));
  assert.ok(text.includes("Answer: B."));
});
test("every lesson ships with real, short topic-video candidates rather than a subject-wide marathon", () => {
  const catalog = JSON.parse(
    readFileSync("public/gate-topic-videos.json", "utf8"),
  );
  for (const lesson of GATE_LESSONS) {
    const entry = catalog.lessons[lesson.id];
    assert.ok(entry?.items?.length, lesson.id);
    for (const video of entry.items) {
      assert.ok(VIDEO_ID.test(video.id), lesson.id);
      assert.ok(video.duration >= 120 && video.duration <= 1800, lesson.id);
      assert.ok(video.title?.length > 5, lesson.id);
    }
  }
});
