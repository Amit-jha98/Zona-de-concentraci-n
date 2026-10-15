import mathematics from "./mathematics.js";
import digital from "./digital.js";
import architecture from "./architecture.js";
import programming from "./programming.js";
import algorithms from "./algorithms.js";
import computation from "./computation.js";
import compilers from "./compilers.js";
import systems from "./systems.js";
import databases from "./databases.js";
import networks from "./networks.js";

// Section names and coverage follow the supplied PDF, not an assumed exam syllabus.
export const GATE_SECTIONS = [
  mathematics,
  digital,
  architecture,
  programming,
  algorithms,
  computation,
  compilers,
  systems,
  databases,
  networks,
];
export const GATE_LESSONS = GATE_SECTIONS.flatMap((item) => item.lessons);
export const LESSON_BY_ID = Object.fromEntries(
  GATE_LESSONS.map((item) => [item.id, item]),
);
export const SYLLABUS_SOURCE = "/CS_GATE2027_Syllabus.pdf";
export const CONTENT_VERSION = 1;
export function lessonMarkdown(lesson) {
  return [
    `# ${lesson.title}`,
    `GATE CS · Section ${GATE_SECTIONS.find((s) => s.id === lesson.sectionId)?.number}: ${lesson.sectionTitle}`,
    "",
    ...lesson.notes.map((text) => text + "\n"),
    "## Key relationship",
    lesson.formula,
    "",
    "## Worked example",
    ...lesson.example.map((step, i) => `${i + 1}. ${step}`),
    "",
    "## Common mistake",
    lesson.pitfall,
    "",
    "## Practice",
    ...lesson.quiz.flatMap((q) => [
      q.question,
      ...q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`),
      "",
      `Answer: ${String.fromCharCode(65 + q.answer)}. ${q.options[q.answer]}`,
      q.explanation,
      "",
    ]),
    `Source syllabus: ${SYLLABUS_SOURCE}`,
    "Practice questions are original concept checks, not official GATE past papers.",
  ].join("\n");
}
