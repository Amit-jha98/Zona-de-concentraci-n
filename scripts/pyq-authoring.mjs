import { readFile, mkdir, writeFile } from "node:fs/promises";
import { officialAnswer, gradeQuestion } from "../shared/exam.js";
import { LESSON_BY_ID } from "../src/data/gate/index.js";

// This utility formats human-authored entries. It never contacts an AI service.
export async function authorPaper(paperId, entries) {
  const catalog = JSON.parse(await readFile("docs/PYQ/extracted/catalog.json", "utf8"));
  const paper = catalog.find((item) => item.id === paperId);
  const transcriptions = JSON.parse(await readFile("docs/PYQ/transcriptions.json", "utf8"));
  if (!paper) throw new Error(`Unknown paper ${paperId}`);
  await mkdir("docs/PYQ/authored", { recursive: true });
  const output = [];
  for (const [number, value] of Object.entries(entries)) {
    const source = paper.questions.find((question) => question.number === Number(number));
    const { topic, solution, prompt, options, answer, secondary = [], pitfall = "", diagram = false } = value;
    if (!source || !LESSON_BY_ID[topic] || secondary.some((id) => !LESSON_BY_ID[id]) || solution.length < 100) throw new Error(`Incomplete authored entry ${paperId} Q${number}`);
    const accepted = officialAnswer(source.type, source.officialKey);
    const solvedAnswer = answer ?? (accepted.kind === "number" ? String(accepted.ranges[0][0]) : accepted.kind === "choice" ? accepted.alternatives[0] : []);
    if (!gradeQuestion({ ...source, accepted }, solvedAnswer).correct) throw new Error(`Authored answer disagrees with key: ${source.id}`);
    const split = source.prompt.split(/\([A-D]\)/);
    const transcription = transcriptions[source.id] || {};
    const printable = (text) => [...text].filter((char) => char >= " " || char === "\n" || char === "\t").join("").normalize("NFKC");
    const cleaned = printable(split[0]).replace(/Q\s*\.\s*\d+\s*/g, "").trim();
    const parsedOptions = split.slice(1).map((text) => printable(text).trim());
    output.push({ ...source, prompt: prompt || transcription.prompt || cleaned, options: source.type === "NAT" ? [] : options || transcription.options || (parsedOptions.length === 4 ? parsedOptions : ["A", "B", "C", "D"].map((label) => `Option (${label}) in the original question below`)), lessonIds: [topic, ...secondary], accepted, solvedAnswer, solution, pitfall, hasDiagram: diagram || transcription.hasDiagram, testedConcept: LESSON_BY_ID[topic].title, uncertainty: "", reviewStatus: "authored", reviewNote: "Worked solution authored against the supplied paper and final answer key. Original question images retained for diagrams and typesetting." });
  }
  await writeFile(`docs/PYQ/authored/${paperId}.json`, JSON.stringify(output, null, 2));
  console.log(JSON.stringify({ paperId, authored: output.length }));
}
