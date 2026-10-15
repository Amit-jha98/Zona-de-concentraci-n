import { GATE_SECTIONS, GATE_LESSONS } from "../src/data/gate/index.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const videos = JSON.parse(
  await readFile("public/gate-topic-videos.json", "utf8"),
);
const lines = [
  "# Supplied GATE CS 2027 syllabus coverage",
  "",
  "Source: public/CS_GATE2027_Syllabus.pdf. Extracted text: docs/syllabus-source.txt.",
  "",
  `${GATE_SECTIONS.length} sections, ${GATE_LESSONS.length} concept lessons, ${GATE_LESSONS.reduce((n, l) => n + l.quiz.length, 0)} original explained practice questions. Every lesson has three concept paragraphs, a key relationship, a worked example, a common mistake and a personal revision note.`,
  "",
  "Every concept has initial YouTube lecture candidates between 2 and 30 minutes, plus live topic search. Candidate metadata and titles were checked against YouTube; this is not a full editorial review of every lecture. Publication or regional restrictions can subsequently change availability.",
  "",
  "General Aptitude is not included in the supplied PDF, so the track does not present it as covered.",
  "",
  "| PDF section | Concept lessons | Concepts with short video candidates |",
  "| --- | ---: | ---: |",
  ...GATE_SECTIONS.map(
    (s) =>
      `| ${s.number}. ${s.title} | ${s.lessons.length} | ${s.lessons.filter((l) => videos.lessons[l.id]?.items?.length).length} |`,
  ),
  "",
  ...GATE_SECTIONS.flatMap((s) => [
    `## ${s.number}. ${s.title}`,
    "",
    ...s.groups.flatMap((g) => [
      `### ${g.title}`,
      "",
      ...s.lessons
        .filter((l) => l.group === g.title)
        .map(
          (l) =>
            `- ${l.title} — lesson ID: \`${l.id}\`; ${videos.lessons[l.id]?.items?.length || 0} short lecture choices; explained practice included.`,
        ),
      "",
    ]),
  ]),
];
await mkdir("docs", { recursive: true });
await writeFile("docs/syllabus-coverage.md", lines.join("\n"));
console.log(`Coverage report written for all ${GATE_LESSONS.length} lessons.`);
