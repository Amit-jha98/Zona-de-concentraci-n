import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { generateGemini } from "../server/gemini-client.mjs";
import { GATE_LESSONS } from "../src/data/gate/index.js";
import { officialAnswer, gradeQuestion } from "../shared/exam.js";

const catalog = JSON.parse(await readFile("docs/PYQ/extracted/catalog.json", "utf8"));
const topics = [...GATE_LESSONS.map((lesson) => ({ id: lesson.id, title: lesson.title, section: lesson.sectionTitle })),
  { id: "ga-verbal", title: "Verbal ability, grammar and comprehension", section: "General Aptitude" },
  { id: "ga-quantitative", title: "Quantitative aptitude and data interpretation", section: "General Aptitude" },
  { id: "ga-reasoning", title: "Analytical and logical reasoning", section: "General Aptitude" },
  { id: "ga-spatial", title: "Spatial and visual reasoning", section: "General Aptitude" }];
const topicIds = new Set(topics.map((topic) => topic.id));
await mkdir("docs/PYQ/analysis", { recursive: true });
const requested = process.argv.find((arg) => arg.startsWith("--paper="))?.slice(8);
const retry = process.argv.includes("--retry-mismatches");
const questions = catalog.flatMap((paper) => paper.questions).filter((question) => !requested || question.paperId === requested);
const pending = [];
for (const question of questions) {
  const path = `docs/PYQ/analysis/${question.id}.json`;
  if (!existsSync(path)) pending.push(question);
  else if (retry && JSON.parse(await readFile(path, "utf8")).reviewStatus !== "key-matched") pending.push(question);
}
const batchSize = Number(process.env.PYQ_BATCH_SIZE || 4);
const batches = [];
while (pending.length) batches.push(pending.splice(0, batchSize));
console.log(JSON.stringify({ batches: batches.length, questions: batches.reduce((n, batch) => n + batch.length, 0), model: process.env.GEMINI_PYQ_MODEL || "gemini-3-flash-preview" }));
async function analyse(batch) {
  const parts = [{ text: `You are building a carefully worked GATE CS previous-year question bank from the student's PDFs. Read each ORIGINAL QUESTION IMAGE, including every diagram, code snippet, qualifier and all options. The extracted text is only a navigation aid; images are authoritative. Independently solve every question before answering. Never infer an answer from its position or invent a missing diagram. Map each question to one primary course lesson, and at most two secondary lessons, from this allowed registry: ${JSON.stringify(topics)}.
Return ONLY a JSON object {"questions":[...]}. Each entry must have exactly these fields:
id (given question id), prompt (clean complete question stem, not answer options; Markdown, $LaTeX$ and fenced code allowed), options (four strings in original A/B/C/D order for MCQ/MSQ; [] for NAT), lessonIds (primary first), hasDiagram (boolean), solvedAnswer (array of ZERO-BASED correct option indices for MCQ/MSQ; decimal STRING for NAT), solution (a complete worked explanation in Markdown, normally 3-7 numbered steps, showing substitutions/calculations/proofs, and explaining EACH option for MSQ; no hand-waving or generic advice), pitfall (specific mistake to avoid), testedConcept (short description), uncertainty (empty string if confident, otherwise the exact ambiguity).
For questions numbered 1-10 choose a ga-* primary topic even when they use a CS-adjacent mathematical technique. Preserve numerical units and rounding. Use ASCII decimal strings for numerical answers. Do not include an official-key claim; the importer checks your independently solved answer separately. ${retry ? "For this retry, compare your derivation carefully to the supplied official key. If there is a genuine conflict, explicitly state it in uncertainty rather than inventing reasoning." : ""}` }];
  for (const question of batch) {
    parts.push({ text: `QUESTION ${question.id} | ${question.type}, ${question.marks} marks\nExtracted text: ${question.prompt}${retry ? `\nOfficial key: ${question.officialKey}` : ""}` });
    for (const image of question.images) parts.push({ inlineData: { mimeType: "image/webp", data: (await readFile(`public${image.src}`)).toString("base64") } });
  }
  const response = await generateGemini({ contents: [{ role: "user", parts }], maxOutputTokens: 16384, model: process.env.GEMINI_PYQ_MODEL || "gemini-3-flash-preview", signal: AbortSignal.timeout(240000) });
  const data = JSON.parse(response.text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, ""));
  if (!Array.isArray(data.questions) || data.questions.length !== batch.length) throw new Error("Wrong question count in model response");
  for (const source of batch) {
    const generated = data.questions.find((question) => question.id === source.id);
    if (!generated || generated.prompt?.length < 20 || generated.solution?.length < 100 || !generated.lessonIds?.length || generated.lessonIds.some((id) => !topicIds.has(id)) || (source.type !== "NAT" && generated.options?.length !== 4)) throw new Error(`Incomplete structured answer: ${source.id}`);
    const accepted = officialAnswer(source.type, source.officialKey);
    const keyMatched = gradeQuestion({ ...source, accepted }, generated.solvedAnswer).correct;
    const output = { ...source, ...generated, accepted, reviewStatus: keyMatched ? "key-matched" : "answer-mismatch", generationModel: response.model };
    await writeFile(`docs/PYQ/analysis/${source.id}.json`, JSON.stringify(output, null, 2));
    console.log(JSON.stringify({ id: source.id, topic: generated.lessonIds[0], review: output.reviewStatus, ...(generated.uncertainty ? { uncertainty: generated.uncertainty } : {}) }));
  }
}
let index = 0;
let nextRequest = 0;
const workers = Array.from({ length: Number(process.env.PYQ_CONCURRENCY || 1) }, async () => {
  while (index < batches.length) {
    const batch = batches[index++];
    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        const wait = Math.max(0, nextRequest - Date.now());
        nextRequest = Math.max(nextRequest, Date.now()) + 15000;
        if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
        await analyse(batch); break;
      }
      catch (error) {
        console.log(JSON.stringify({ batch: batch.map((question) => question.id), attempt: attempt + 1, status: error.upstreamStatus, error: error.message }));
        if (attempt === 5) throw error;
        await new Promise((resolve) => setTimeout(resolve, error.retryAfterMs || 10000 * (attempt + 1)));
      }
    }
  }
});
await Promise.all(workers);
