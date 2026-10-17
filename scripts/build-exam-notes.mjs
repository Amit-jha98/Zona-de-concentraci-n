import { readFile, writeFile, mkdir } from "node:fs/promises";
import { EXAM_LESSONS } from "../src/data/gate/index.js";
import { gradeQuestion } from "../shared/exam.js";
import mathematics from "./notes/mathematics.mjs";
import hardware from "./notes/hardware.mjs";
import algorithms from "./notes/algorithms.mjs";
import theory from "./notes/theory.mjs";
import systems from "./notes/systems.mjs";
import networks from "./notes/networks.mjs";
import depth, { prerequisites } from "./depth/index.mjs";
import { answerLabel } from "../shared/exam.js";
import { createHash } from "node:crypto";
import challenges from "./depth/challenges.mjs";
const content = {
  ...mathematics,
  ...hardware,
  ...algorithms,
  ...theory,
  ...systems,
  ...networks,
};
const bank = JSON.parse(await readFile("public/gate-pyq-bank.json", "utf8"));
const analysis = JSON.parse(
  await readFile("public/gate-pyq-analysis.json", "utf8"),
);
await mkdir("public/gate-exam-notes", { recursive: true });
for (const lesson of EXAM_LESSONS) {
  const entry = content[lesson.id];
  const expanded = depth[lesson.id];
  if (!expanded || expanded.questions.length !== 3 || expanded.steps.length < 3)
    throw new Error("Missing authored depth for " + lesson.id);
  if (
    !entry ||
    entry.method.length < 100 ||
    entry.solution.length < 80 ||
    !Number.isFinite(entry.answer)
  )
    throw new Error(`Incomplete exam guide: ${lesson.id}`);
  const answer = String(entry.answer);
  const question = {
    id: `${lesson.id}-exam-1`,
    lessonIds: [lesson.id],
    source: "original",
    type: "NAT",
    marks: 2,
    prompt: entry.prompt,
    options: [],
    accepted: { kind: "number", ranges: [[entry.answer, entry.answer]] },
    solution: entry.solution,
    pitfall: entry.conditions,
  };
  if (!gradeQuestion(question, answer).correct)
    throw new Error(`Invalid original answer ${lesson.id}`);
  const pyqs = bank.questions.filter((q) => q.lessonIds.includes(lesson.id));
  const drills = [
    ...expanded.questions,
    ...(challenges[lesson.id] ? [challenges[lesson.id]] : []),
  ].map((item, index) => {
    let { answer, tolerance = 0, ...body } = item;
    // Stable MCQ rotation avoids a predictable correct-position pattern. MSQ
    // order is retained because its explanation may refer to original labels.
    if (item.type === "MCQ") {
      const shift = createHash("sha256").update(lesson.id).digest()[0] % 4;
      body = {
        ...body,
        options: [
          ...body.options.slice(shift),
          ...body.options.slice(0, shift),
        ],
      };
      answer = answer.map((value) => (value - shift + 4) % 4);
    }
    const accepted =
      item.type === "NAT"
        ? { kind: "number", ranges: [[answer - tolerance, answer + tolerance]] }
        : { kind: "choice", alternatives: [answer] };
    const result = {
      ...body,
      id: lesson.id + "-depth-" + (index + 1),
      lessonIds: [lesson.id],
      source: "original",
      accepted,
      solvedAnswer: item.type === "NAT" ? String(answer) : answer,
      testedConcept: lesson.title,
      difficulty: index >= 3 ? "transfer" : "application",
    };
    if (!gradeQuestion(result, result.solvedAnswer).correct)
      throw new Error("Invalid drill " + result.id);
    return result;
  });
  const exemplars = [];
  for (const type of ["NAT", "MSQ", "MCQ"]) {
    const q = pyqs.find((q) => q.type === type);
    if (q && exemplars.length < 2) exemplars.push(q);
  }
  for (const q of pyqs)
    if (exemplars.length < 2 && !exemplars.includes(q)) exemplars.push(q);
  const stats = analysis.topics.find((t) => t.id === lesson.id);
  const walkthroughs = [
    {
      title: "Worked question patterns",
      body: drills
        .map(
          (q, i) =>
            "#### Pattern " +
            (i + 1) +
            " · " +
            q.type +
            (q.difficulty === "transfer" ? " · Transfer problem" : "") +
            "\n\n" +
            q.prompt +
            "\n\n" +
            q.options
              .map((o, j) => "- **" + String.fromCharCode(65 + j) + ".** " + o)
              .join("\n") +
            "\n\n**Answer: " +
            answerLabel(q) +
            ".** " +
            q.solution,
        )
        .join("\n\n"),
    },
    ...(exemplars.length
      ? [
          {
            title: "Work through the supplied PYQs",
            body: exemplars
              .map(
                (q) =>
                  "#### GATE " +
                  q.year +
                  " " +
                  q.set +
                  " · Q" +
                  q.number +
                  " · " +
                  q.type +
                  "\n\n[Open the original question and try it](/#/lesson/" +
                  lesson.id +
                  "?tab=practice)\n\n**What is tested:** " +
                  q.testedConcept +
                  ". Refer to the original image for complete givens and diagrams.\n\n" +
                  q.solution,
              )
              .join("\n\n"),
          },
        ]
      : []),
  ];
  const value = {
    version: 2,
    lessonId: lesson.id,
    prerequisites: (prerequisites[lesson.id] || "").split(" ").filter(Boolean),
    pyqAnalysis: stats,
    videoPlan: {
      conceptQuery: lesson.videoQuery,
      practiceQuery:
        expanded.videoFocus.split(" ").slice(0, 3).join(" ") +
        " GATE solved questions",
      focus: expanded.videoFocus,
      checkpoints: expanded.steps,
      task: "Pause before the instructor's calculation. Write the intermediate state, predict the next step, then compare the assumptions with the worked solution.",
    },
    examGuide: [
      {
        title: "Mental model and derivation",
        body: expanded.theory + "\n\n**Key relationship:** " + lesson.formula,
      },
      {
        title: "A repeatable solving procedure",
        body: expanded.steps.map((step, i) => i + 1 + ". " + step).join("\n"),
      },
      { title: "Approach the exam question", body: entry.method },
      {
        title: "Worked problem",
        body: `${entry.prompt}\n\n**Answer: ${answer}.** ${entry.solution}`,
      },
      {
        title: "Conditions and edge cases",
        body: `${entry.conditions}\n\n${lesson.pitfall}`,
      },
      ...walkthroughs,
    ],
    advancedQuiz: [question, ...drills],
    pyqIds: pyqs.map((q) => q.id),
    sourcePapers: [...new Set(pyqs.map((q) => `GATE ${q.year} ${q.set}`))],
  };
  await writeFile(
    `public/gate-exam-notes/${lesson.id}.json`,
    JSON.stringify(value),
  );
}
console.log(
  JSON.stringify({
    guides: EXAM_LESSONS.length,
    examDrills: EXAM_LESSONS.length * 4 + Object.keys(challenges).length,
    newlyAuthoredQuestions:
      EXAM_LESSONS.length * 3 + Object.keys(challenges).length,
    apiRequests: 0,
  }),
);
