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
import aptitude from "./aptitude.js";

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
export const APTITUDE_SECTION = aptitude;
export const EXAM_LESSONS = [...GATE_LESSONS, ...aptitude.lessons];
export const LESSON_BY_ID = Object.fromEntries(
  EXAM_LESSONS.map((item) => [item.id, item]),
);
export const SYLLABUS_SOURCE = "/CS_GATE2027_Syllabus.pdf";
export const CONTENT_VERSION = 2;
export function lessonMarkdown(lesson) {
  return [
    `# ${lesson.title}`,
    `GATE CS · Section ${[...GATE_SECTIONS, aptitude].find((s) => s.id === lesson.sectionId)?.number}: ${lesson.sectionTitle}`,
    "",
    ...lesson.notes.map((text) => text + "\n"),
    ...(lesson.prerequisites?.length?["## Prerequisites",lesson.prerequisites.map(id=>LESSON_BY_ID[id].title).join(", "),""]:[]),
    ...(lesson.pyqAnalysis?["## Evidence from your supplied papers",lesson.pyqAnalysis.primaryCount+" primary questions; "+lesson.pyqAnalysis.primaryMarks+" total primary marks; "+lesson.pyqAnalysis.years.length+" of four years. Year-balanced mean marks: "+lesson.pyqAnalysis.meanMarks.toFixed(2)+". This is observed recurrence, not a prediction.",""]:[]),
    ...(lesson.examGuide ? ["## GATE examination guide", ...lesson.examGuide.map((item) => `### ${item.title}\n${item.body}\n`)] : []),
    ...(lesson.videoPlan?["## Video study plan",lesson.videoPlan.focus,...lesson.videoPlan.checkpoints.map((step,i)=>(i+1)+". "+step),"Find worked examples: https://www.youtube.com/results?search_query="+encodeURIComponent(lesson.videoPlan.practiceQuery),""]:[]),
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
    "Concept checks above are original practice. Topic-mapped official PYQs and further exam-level practice are available in the app's Practice tab.",
  ].join("\n");
}
