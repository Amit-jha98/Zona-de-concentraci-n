import { readFile, readdir, writeFile, mkdir, access } from "node:fs/promises";
import { EXAM_LESSONS, LESSON_BY_ID } from "../src/data/gate/index.js";
import { officialAnswer, gradeQuestion } from "../shared/exam.js";

const catalog = JSON.parse(await readFile("docs/PYQ/extracted/catalog.json", "utf8"));
const corrections = JSON.parse(await readFile("docs/PYQ/reviewed-corrections.json", "utf8"));
const ids = new Set(EXAM_LESSONS.map((lesson) => lesson.id));
const authored = new Map();
for (const file of await readdir("docs/PYQ/authored").catch(() => [])) {
  if (file.endsWith(".json")) for (const question of JSON.parse(await readFile(`docs/PYQ/authored/${file}`, "utf8"))) authored.set(question.id, question);
}
const questions = [];
const problems = [];
for (const paper of catalog) for (const source of paper.questions) {
  const generated = authored.get(source.id);
  if (!generated) { problems.push(`${source.id}: no worked solution`); continue; }
  const question = { ...generated, ...corrections[source.id], id: source.id, paperId: source.paperId, year: source.year, set: source.set, number: source.number, marks: source.marks, type: source.type, officialKey: source.officialKey, images: source.images, accepted: officialAnswer(source.type, source.officialKey) };
  if (!gradeQuestion(question, question.solvedAnswer).correct || !question.lessonIds?.length || question.lessonIds.some((id) => !ids.has(id)) || question.solution?.length < 100 || question.uncertainty || question.type !== "NAT" && question.options?.length !== 4) { problems.push(`${source.id}: unresolved answer, topic or explanation`); continue; }
  if (question.number <= 10 && !question.lessonIds[0].startsWith("ga-")) { problems.push(`${source.id}: aptitude mapping missing`); continue; }
  for (const image of source.images) await access(`public${image.src}`);
  delete question.generationModel;
  question.sourceFirst = Boolean(question.hasDiagram) || /\b(?:figure|diagram|circuit|C program|code snippet|assembly|Karnaugh|syntax.directed|following grammar)\b/i.test(question.prompt);
  questions.push(question);
}
if (problems.length) { console.error(problems.join("\n")); throw new Error(`Question bank not published: ${problems.length} unresolved questions`); }
if (questions.length !== 455 || new Set(questions.map((q) => q.id)).size !== 455) throw new Error("Expected 455 unique questions");
const exams = catalog.map((paper) => ({ id: paper.id, kind: "paper", title: paper.title, durationMinutes: 180, totalMarks: 100, questionIds: paper.questions.map((q) => q.id) }));
// Deterministic, disjoint mixed papers: preserve 5+5 aptitude and 25+30 CS
// one/two-mark distributions and spread selections across years and sections.
const used = new Set();
const sectionTargets = { mathematics: 13, digital: 6, architecture: 9, programming: 8, algorithms: 9, computation: 7, compilers: 6, systems: 9, databases: 9, networks: 9, aptitude: 15 };
for (let set = 1; set <= 3; set++) {
  const chosen = [];
  const sectionCounts = new Map();
  const sectionMarks = new Map();
  const paperCounts = new Map();
  for (const [ga, marks, count] of [[true, 1, 5], [true, 2, 5], [false, 1, 25], [false, 2, 30]]) {
    for (let index = 0; index < count; index++) {
      const pool = questions.filter((q) => !used.has(q.id) && (q.number <= 10) === ga && q.marks === marks);
      const balance = (q) => {
        const section = LESSON_BY_ID[q.lessonIds[0]].sectionId;
        return (sectionMarks.get(section) || 0) / sectionTargets[section];
      };
      pool.sort((a, b) => balance(a) - balance(b) || (sectionCounts.get(a.lessonIds[0]) || 0) - (sectionCounts.get(b.lessonIds[0]) || 0) || (paperCounts.get(a.paperId) || 0) - (paperCounts.get(b.paperId) || 0) || a.number - b.number || a.id.localeCompare(b.id));
      const q = pool[0];
      if (!q) throw new Error("Not enough questions for balanced mixed papers");
      chosen.push(q.id); used.add(q.id);
      sectionCounts.set(q.lessonIds[0], (sectionCounts.get(q.lessonIds[0]) || 0) + 1);
      const section = LESSON_BY_ID[q.lessonIds[0]].sectionId;
      sectionMarks.set(section, (sectionMarks.get(section) || 0) + q.marks);
      paperCounts.set(q.paperId, (paperCounts.get(q.paperId) || 0) + 1);
    }
  }
  exams.push({ id: `mixed-${set}`, kind: "mixed", title: `Mixed PYQ mock ${set}`, durationMinutes: 180, totalMarks: 100, questionIds: chosen });
}
await mkdir("public/gate-exam-notes", { recursive: true });
await writeFile("public/gate-pyq-bank.json", JSON.stringify({ version: 1, attribution: "Original GATE questions and final answer keys: respective organizing institutes. Worked explanations and topic mappings: EduBrowse study material; not official institute solutions.", questions, exams }));
const coverage = EXAM_LESSONS.map((lesson) => ({ id: lesson.id, title: lesson.title, primary: questions.filter((q) => q.lessonIds[0] === lesson.id).length, total: questions.filter((q) => q.lessonIds.includes(lesson.id)).length }));
await writeFile("docs/PYQ/coverage.json", JSON.stringify({ questions: questions.length, papers: catalog.length, mocks: exams.length, topics: coverage }, null, 2));
console.log(JSON.stringify({ questions: questions.length, exams: exams.length, coveredTopics: coverage.filter((item) => item.total).length }));
