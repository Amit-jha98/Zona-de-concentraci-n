import { readFile, writeFile } from "node:fs/promises";
import {
  EXAM_LESSONS,
  GATE_LESSONS,
  GATE_SECTIONS,
} from "../src/data/gate/index.js";
const parse = async (path) => JSON.parse(await readFile(path, "utf8"));
const analysis = await parse("public/gate-pyq-analysis.json");
const concepts = await parse("public/gate-topic-videos.json");
const videos = await parse("public/gate-topic-practice-videos.json");
const topics = [];
for (const lesson of EXAM_LESSONS) {
  const note = await parse("public/gate-exam-notes/" + lesson.id + ".json");
  const candidates = [
    ...(concepts.lessons[lesson.id]?.items || []),
    ...(videos.lessons[lesson.id]?.items || []),
  ];
  if (!candidates.some((v) => v.duration >= 120 && v.duration <= 1800))
    throw new Error("Missing short video: " + lesson.id);
  topics.push({
    id: lesson.id,
    section: lesson.sectionTitle,
    title: lesson.title,
    originalQuestions: lesson.quiz.length + note.advancedQuiz.length,
    pyqQuestions: note.pyqIds.length,
    noteWords: (
      lesson.notes.join(" ") +
      " " +
      note.examGuide.map((s) => s.body).join(" ")
    ).split(/\s+/).length,
    noteSections: note.examGuide.length,
    shortVideos: new Set(candidates.map((v) => v.id)).size,
    priority: note.pyqAnalysis.priority,
  });
}
const report = {
  syllabusSections: GATE_SECTIONS.length,
  csConcepts: GATE_LESSONS.length,
  aptitudeConcepts: EXAM_LESSONS.length - GATE_LESSONS.length,
  sourcePapers: analysis.papers.length,
  pyqs: analysis.totalQuestions,
  originalQuestions: topics.reduce((s, t) => s + t.originalQuestions, 0),
  newlyAuthoredQuestions: 494,
  totalQuestions: 455 + topics.reduce((s, t) => s + t.originalQuestions, 0),
  vviTopics: topics.filter((t) => t.priority === "vvi").length,
  topicsWithVideo: topics.filter((t) => t.shortVideos).length,
  focusedPracticeVideoTopics: Object.values(videos.lessons).filter(
    (v) => v.items.length,
  ).length,
  focusedPracticeUniqueVideos: new Set(
    Object.values(videos.lessons).flatMap((v) => v.items.map((v) => v.id)),
  ).size,
  noteWordRange: [
    Math.min(...topics.map((t) => t.noteWords)),
    Math.max(...topics.map((t) => t.noteWords)),
  ],
  notes:
    "Word counts include worked examples and selected supplied-PYQ walkthroughs. Lecture matches are based on checked metadata, not full-content editorial review. No Gemini calls are used in course authoring/builds.",
  topics,
};
await writeFile("docs/gate-course-audit.json", JSON.stringify(report, null, 2));
const ranked = analysis.topics
  .filter((t) => t.sectionId !== "aptitude")
  .sort(
    (a, b) =>
      b.meanMarks - a.meanMarks ||
      b.years.length - a.years.length ||
      a.title.localeCompare(b.title),
  );
const lines = [
  "# GATE CS 2027 course review",
  "",
  "Source: your supplied CS_GATE2027_Syllabus.pdf and all seven complete papers in docs/PYQ (2023–2026). All 455 questions remain linked to their original images and final keys.",
  "",
  "## Content changes",
  "",
  "All 146 CS concepts and four General Aptitude supplements now have a mental model, a repeatable solving procedure, worked patterns, edge cases and prerequisite links. Three new MCQ/MSQ/NAT questions are authored for every concept; 44 recurring concepts receive an additional transfer problem. There are 794 original questions plus 455 PYQs (1,249 total), and ten full mocks.",
  "",
  "Notes include selected actual PYQ walkthroughs when mapped questions exist. Original questions are explicitly labelled. Topics absent from these papers retain syllabus coverage and original practice; no historical question is invented.",
  "",
  "## Priority evidence",
  "",
  analysis.methodology,
  "",
  "| CS concept | Primary questions | Distinct years | Year-balanced mean marks |",
  "|---|---:|---:|---:|",
  ...ranked
    .slice(0, 20)
    .map(
      (t) =>
        "| " +
        t.title +
        " | " +
        t.primaryCount +
        " | " +
        t.years.length +
        " | " +
        t.meanMarks.toFixed(2) +
        " |",
    ),
  "",
  "This is a revision order for the supplied sample, not a predicted question list. Complete prerequisites and every syllabus section before relying on priority revision.",
  "",
  "## How to use one topic",
  "",
  "1. Read the mental model and check the formula's assumptions.",
  "2. Follow the three-step procedure without looking at the worked answer.",
  "3. Watch a short concept clip; use the problem-solving mode to compare intermediate steps.",
  "4. Solve the foundation check, original MCQ/MSQ/NAT drills and linked PYQs. For MSQ, justify rejected options as well as chosen ones.",
  "5. Attempt the transfer problem where present, then revise errors before taking a full mock.",
  "",
  "## Video scope",
  "",
  "All 150 concepts have short candidates (2–30 minutes). The separate practice catalog has " +
    report.focusedPracticeUniqueVideos +
    " distinct metadata-checked clips across " +
    report.focusedPracticeVideoTopics +
    " topics. Remaining topics retain their concept clips and a focused live problem-search query. No long-course filler is substituted. Availability and the depth of a specific lecture can change; titles are not proof of full topic coverage.",
  "",
  "## Complete evidence",
  "",
  "- [Every topic's resource counts](gate-course-audit.json)",
  "- [All 455 question analyses and topic priorities](PYQ/course-analysis.md)",
  "- [Paper provenance and scoring](PYQ/README.md)",
  "",
  "Gemini is reserved for explicit student doubts. This audit, notes, questions, analysis and compilation consume no Gemini quota.",
];
await writeFile("docs/GATE_2027_REVIEW.md", lines.join("\n") + "\n");
console.log(JSON.stringify({ ...report, topics: undefined }));
