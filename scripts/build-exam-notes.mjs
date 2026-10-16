import { readFile, writeFile, mkdir } from "node:fs/promises";
import { EXAM_LESSONS } from "../src/data/gate/index.js";
import { gradeQuestion } from "../shared/exam.js";
import mathematics from "./notes/mathematics.mjs";
import hardware from "./notes/hardware.mjs";
import algorithms from "./notes/algorithms.mjs";
import theory from "./notes/theory.mjs";
import systems from "./notes/systems.mjs";
import networks from "./notes/networks.mjs";
const content = { ...mathematics, ...hardware, ...algorithms, ...theory, ...systems, ...networks };
const bank = JSON.parse(await readFile("public/gate-pyq-bank.json", "utf8"));
await mkdir("public/gate-exam-notes", { recursive: true });
for (const lesson of EXAM_LESSONS) {
  const entry = content[lesson.id];
  if (!entry || entry.method.length < 100 || entry.solution.length < 80 || !Number.isFinite(entry.answer)) throw new Error(`Incomplete exam guide: ${lesson.id}`);
  const answer = String(entry.answer);
  const question = {
    id: `${lesson.id}-exam-1`, lessonIds: [lesson.id], source: "original",
    type: "NAT", marks: 2, prompt: entry.prompt, options: [],
    accepted: { kind: "number", ranges: [[entry.answer, entry.answer]] },
    solution: entry.solution, pitfall: entry.conditions,
  };
  if (!gradeQuestion(question, answer).correct) throw new Error(`Invalid original answer ${lesson.id}`);
  const pyqs = bank.questions.filter((q) => q.lessonIds.includes(lesson.id));
  const value = {
    version: 1, lessonId: lesson.id,
    examGuide: [
      { title: "Approach the exam question", body: entry.method },
      { title: "Worked problem", body: `${entry.prompt}\n\n**Answer: ${answer}.** ${entry.solution}` },
      { title: "Conditions and edge cases", body: `${entry.conditions}\n\n${lesson.pitfall}` },
    ],
    advancedQuiz: [question],
    pyqIds: pyqs.map((q) => q.id),
    sourcePapers: [...new Set(pyqs.map((q) => `GATE ${q.year} ${q.set}`))],
  };
  await writeFile(`public/gate-exam-notes/${lesson.id}.json`, JSON.stringify(value));
}
console.log(JSON.stringify({ guides: EXAM_LESSONS.length, additionalOriginalQuestions: EXAM_LESSONS.length, apiRequests: 0 }));
