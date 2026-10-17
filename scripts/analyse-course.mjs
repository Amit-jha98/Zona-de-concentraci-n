import { readFile, writeFile } from "node:fs/promises";
import {
  EXAM_LESSONS,
  GATE_SECTIONS,
  APTITUDE_SECTION,
} from "../src/data/gate/index.js";
import depth from "./depth/index.mjs";
const bank = JSON.parse(await readFile("public/gate-pyq-bank.json", "utf8"));
const papers = bank.exams
  .filter((exam) => exam.kind !== "mixed")
  .map((exam) => {
    const questions = bank.questions.filter((q) =>
      exam.questionIds.includes(q.id),
    );
    return {
      id: questions[0].paperId,
      year: questions[0].year,
      set: questions[0].set,
      questions: questions.length,
      marks: questions.reduce((s, q) => s + q.marks, 0),
    };
  });
const years = [...new Set(papers.map((p) => p.year))].sort();
const yearMeans = (questions) =>
  Object.fromEntries(
    years.map((year) => [
      year,
      questions
        .filter((q) => q.year === year)
        .reduce((s, q) => s + q.marks, 0) /
        papers.filter((p) => p.year === year).length,
    ]),
  );
const types = (questions) =>
  Object.fromEntries(
    ["MCQ", "MSQ", "NAT"].map((type) => [
      type,
      {
        questions: questions.filter((q) => q.type === type).length,
        marks: questions
          .filter((q) => q.type === type)
          .reduce((s, q) => s + q.marks, 0),
      },
    ]),
  );
const topics = EXAM_LESSONS.map((lesson) => {
  const primary = bank.questions.filter((q) => q.lessonIds[0] === lesson.id);
  const secondary = bank.questions.filter((q) =>
    q.lessonIds.slice(1).includes(lesson.id),
  );
  const yearsSeen = years.filter((year) =>
    primary.some((q) => q.year === year),
  );
  const marksByYear = yearMeans(primary);
  const meanMarks =
    Object.values(marksByYear).reduce((s, m) => s + m, 0) / years.length;
  return {
    id: lesson.id,
    title: lesson.title,
    sectionId: lesson.sectionId,
    sectionTitle: lesson.sectionTitle,
    group: lesson.group,
    primaryCount: primary.length,
    primaryMarks: primary.reduce((s, q) => s + q.marks, 0),
    secondaryCount: secondary.length,
    years: yearsSeen,
    meanMarks,
    marksByYear,
    types: types(primary),
    questionIds: primary.map((q) => q.id),
    secondaryIds: secondary.map((q) => q.id),
    priority:
      yearsSeen.length >= 3 && primary.length >= 4
        ? "vvi"
        : yearsSeen.length >= 2 || meanMarks >= 1
          ? "high"
          : "syllabus",
    method: depth[lesson.id].steps,
    videoFocus: depth[lesson.id].videoFocus,
  };
});
const sections = [...GATE_SECTIONS, APTITUDE_SECTION].map((section) => {
  const questions = bank.questions.filter(
    (q) =>
      EXAM_LESSONS.find((l) => l.id === q.lessonIds[0]).sectionId ===
      section.id,
  );
  return {
    id: section.id,
    title: section.title,
    questions: questions.length,
    marks: questions.reduce((s, q) => s + q.marks, 0),
    marksByYear: yearMeans(questions),
    types: types(questions),
  };
});
const analysis = {
  version: 1,
  source:
    "Supplied seven complete CS papers, 2023–2026; final keys and original question images retained.",
  years,
  papers,
  methodology:
    "Primary topic only receives marks; secondary mappings are learning links. For each year, marks are averaged across its papers, then the four annual means are averaged including zeros. VVI means at least four primary questions across at least three distinct years. High means at least two years or at least one year-balanced mean mark. These describe this sample, not a 2027 prediction; all syllabus topics remain required.",
  totalQuestions: bank.questions.length,
  totalMarks: bank.questions.reduce((s, q) => s + q.marks, 0),
  types: types(bank.questions),
  sections,
  topics,
  questionAnalysis: bank.questions.map((q) => ({
    id: q.id,
    paperId: q.paperId,
    number: q.number,
    type: q.type,
    marks: q.marks,
    lessonId: q.lessonIds[0],
    relatedLessonIds: q.lessonIds.slice(1),
    solutionSteps: q.solution.split(/\n(?=\d+\.)/).length,
  })),
};
await writeFile("public/gate-pyq-analysis.json", JSON.stringify(analysis));
const ranked = [...topics].sort(
  (a, b) =>
    b.meanMarks - a.meanMarks ||
    b.years.length - a.years.length ||
    a.title.localeCompare(b.title),
);
const lines = [
  "# GATE 2027 course: supplied-PYQ analysis",
  "",
  analysis.source,
  "",
  analysis.methodology,
  "",
  "## Complete topic ledger",
  "",
  "| Topic | Primary Qs | Primary marks | Years | Mean marks/year | Priority |",
  "|---|---:|---:|---|---:|---|",
  ...ranked.map(
    (t) =>
      "| " +
      [
        t.title,
        t.primaryCount,
        t.primaryMarks,
        t.years.join(", ") || "None",
        t.meanMarks.toFixed(2),
        t.priority.toUpperCase(),
      ].join(" | ") +
      " |",
  ),
  "",
  "## All 455 questions: method and topic",
  "",
  ...papers.flatMap((p) => [
    "### " + p.year + " " + p.set,
    "",
    ...bank.questions
      .filter((q) => q.paperId === p.id)
      .flatMap((q) => {
        const l = EXAM_LESSONS.find((l) => l.id === q.lessonIds[0]);
        return [
          "#### Q" +
            q.number +
            " · " +
            q.type +
            " · " +
            q.marks +
            " mark(s) · " +
            l.title,
          "",
          "Study: /#/lesson/" + l.id + "?tab=practice",
          "",
          "**Approach:** " + depth[l.id].steps.join(" → "),
          "",
          "**Worked solution:**",
          q.solution,
          "",
        ];
      }),
  ]),
];
await writeFile("docs/PYQ/course-analysis.md", lines.join("\n"));
console.log(
  JSON.stringify({
    analysed: analysis.totalQuestions,
    totalMarks: analysis.totalMarks,
    topics: topics.length,
    vvi: topics.filter((t) => t.priority === "vvi").length,
    top: ranked
      .filter((t) => t.sectionId !== "aptitude")
      .slice(0, 8)
      .map((t) => ({ id: t.id, mean: t.meanMarks })),
  }),
);
