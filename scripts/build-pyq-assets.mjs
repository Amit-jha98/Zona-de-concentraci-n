import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import { readFile, mkdir, writeFile } from "node:fs/promises";

const papers = [
  { id: "2023-cs", year: 2023, set: "CS", paper: "gate_pyq_2023cs_.pdf", key: "CS_ANS_GATE_2023.pdf" },
  ...[2024, 2025].flatMap((year) => [1, 2].map((set) => ({ id: `${year}-cs${set}`, year, set: `CS${set}`, paper: `official/${year}-cs${set}-paper.pdf`, key: `official/${year}-cs${set}-key.pdf` }))),
  { id: "2026-cs1", year: 2026, set: "CS1", paper: "gate_pyq_2026_fornoon_CS1.pdf", key: "CS1_Keys.pdf" },
  { id: "2026-cs2", year: 2026, set: "CS2", paper: "gate_pyq_2026_afternoon_CS2.pdf", key: "2026_CS2_Keys.pdf" },
];
const load = async (path) => getDocument({ data: new Uint8Array(await readFile(`docs/PYQ/${path}`)), useSystemFonts: false, standardFontDataUrl: new URL("../node_modules/pdfjs-dist/standard_fonts/", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") + "/" }).promise;
await mkdir("public/pyq", { recursive: true });
await mkdir("docs/PYQ/extracted", { recursive: true });
const catalog = [];
const keysOnly = process.argv.includes("--keys-only");
const previousCatalog = keysOnly ? JSON.parse(await readFile("docs/PYQ/extracted/catalog.json", "utf8")) : null;
for (const source of papers) {
  const pdf = await load(source.paper);
  const keyPdf = await load(source.key);
  let keyText = "";
  for (let page = 1; page <= keyPdf.numPages; page++) {
    const content = await (await keyPdf.getPage(page)).getTextContent();
    keyText += content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join("") + "\n";
  }
  const keys = {};
  for (const line of keyText.split("\n")) {
    const match = line.trim().match(/^(\d{1,2})\s+\d+\s+(MCQ|MSQ|NAT)\s+(?:GA|CS(?:\s*-\s*[12]|[12])?)\s+(.+?)\s+([12])\s*$/);
    if (!match) continue;
    keys[Number(match[1])] = { type: match[2], officialKey: match[3].trim(), marks: Number(match[4]) };
  }
  if (Object.keys(keys).length !== 65) throw new Error(`${source.id}: expected 65 official keys, got ${Object.keys(keys).length}`);
  if (keysOnly) {
    const paper = previousCatalog.find((paper) => paper.id === source.id);
    const questions = paper.questions.map((question) => ({ ...question, ...keys[question.number] }));
    catalog.push({ ...paper, questions });
    await writeFile(`docs/PYQ/extracted/${source.id}-questions.json`, JSON.stringify(questions, null, 2));
    await writeFile(`docs/PYQ/extracted/${source.id}-questions.txt`, questions.map((q) => `${q.id} | ${q.type} ${q.marks}m | KEY ${q.officialKey}\n${q.prompt}`).join("\n\n"));
    await pdf.destroy();
    await keyPdf.destroy();
    console.log(JSON.stringify({ id: source.id, keys: Object.keys(keys).length }));
    continue;
  }
  await mkdir(`public/pyq/${source.id}`, { recursive: true });
  const pages = [];
  const markers = [];
  for (let number = 1; number <= pdf.numPages; number++) {
    const page = await pdf.getPage(number);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const items = content.items.filter((item) => item.str?.trim()).map((item) => {
      const [x, baseline] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
      return { text: item.str, x, y: baseline - item.height, baseline, height: item.height };
    });
    const candidates = items.flatMap((item) => {
      const label = items.filter((other) => Math.abs(other.baseline - item.baseline) < 2 && other.x >= item.x && other.x < item.x + 34).sort((a, b) => a.x - b.x).map((other) => other.text).join("");
      const match = label.match(/^Q\s*\.\s*(\d{1,2})\b/);
      if (!match || /Carry|–\s*Q|[-−]\s*Q/i.test(item.text)) return [];
      const line = items.filter((other) => Math.abs(other.baseline - item.baseline) < 3).map((other) => other.text).join(" ");
      if (/Carry|mark\s+Each|mark\s+each/i.test(line)) return [];
      return [{ number: Number(match[1]), page: number, top: item.y, x: item.x }];
    });
    // A question label is always in the left margin. Ignore references to Q.n
    // inside prose and the repeated range headers at section boundaries.
    for (const marker of candidates.filter((marker) => marker.x < viewport.width * 0.23)) {
      if (marker.number >= 1 && marker.number <= 65 && !markers.some((old) => old.number === marker.number)) markers.push(marker);
    }
    pages.push({ number, width: viewport.width, height: viewport.height, items });
  }
  markers.sort((a, b) => a.number - b.number);
  if (markers.length !== 65) throw new Error(`${source.id}: found ${markers.length} question markers: ${markers.map((item) => item.number).join(",")}`);
  // Some PDFs vertically centre Q.n beside a multi-line opening paragraph.
  // Walk back through that paragraph; using the label's y-coordinate alone
  // crops away givens (e.g. the 4 MHz clock in 2024 CS2 Q11).
  for (const marker of markers) {
    const data = pages[marker.page - 1];
    const rows = [...new Set(data.items.filter((item) => item.x > data.width * 0.18 && item.height > 3 && item.y > 55 && item.y <= marker.top + 5).map((item) => Math.round(item.y)))].sort((a, b) => b - a);
    let top = marker.top;
    for (const row of rows) {
      if (top - row > 27) break;
      top = Math.min(top, row);
    }
    marker.top = top;
  }
  const questions = [];
  for (let index = 0; index < markers.length; index++) {
    const start = markers[index];
    const next = markers[index + 1];
    const lastPage = next ? next.page - (next.top < 130 ? 1 : 0) : pages.length;
    const images = [];
    const transcripts = [];
    for (let number = start.page; number <= lastPage; number++) {
      const data = pages[number - 1];
      const top = number === start.page ? Math.max(42, start.top - 9) : 62;
      const bottom = next?.page === number ? Math.max(top, next.top - 16) : data.height - 82;
      if (bottom - top < 20) continue;
      const text = data.items.filter((item) => item.y >= top && item.y < bottom)
        .sort((a, b) => Math.abs(a.baseline - b.baseline) < 3 ? a.x - b.x : a.baseline - b.baseline)
        .map((item) => item.text).join(" ");
      if (number > start.page && text.trim().split(/\s+/).length < 8) continue;
      transcripts.push(text);
      const scale = 1.8;
      const canvas = createCanvas(Math.ceil(data.width * scale), Math.ceil((bottom - top) * scale));
      const context = canvas.getContext("2d");
      const page = await pdf.getPage(number);
      await page.render({ canvasContext: context, viewport: page.getViewport({ scale }), transform: [1, 0, 0, 1, 0, -top * scale] }).promise;
      // Keep the whole question/table while trimming unused page space after it.
      // The watermark within the retained source remains part of the image.
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let lastInk = canvas.height - 1;
      for (; lastInk > 40; lastInk--) {
        let dark = 0;
        for (let x = 0; x < canvas.width; x += 3) {
          const at = (lastInk * canvas.width + x) * 4;
          if (pixels[at] < 140 && pixels[at + 1] < 140 && pixels[at + 2] < 140) dark++;
        }
        if (dark > 3) break;
      }
      const cropped = createCanvas(canvas.width, Math.min(canvas.height, lastInk + 18));
      cropped.getContext("2d").drawImage(canvas, 0, 0);
      const filename = `q${String(start.number).padStart(2, "0")}-${images.length + 1}.webp`;
      await writeFile(`public/pyq/${source.id}/${filename}`, cropped.toBuffer("image/webp", 88));
      images.push({ src: `/pyq/${source.id}/${filename}`, width: cropped.width, height: cropped.height, page: number });
    }
    if (!images.length) throw new Error(`${source.id} Q${start.number}: no source image`);
    questions.push({ id: `${source.id}-q${start.number}`, paperId: source.id, year: source.year, set: source.set, number: start.number, ...keys[start.number], prompt: transcripts.join("\n"), images });
  }
  await writeFile(`docs/PYQ/extracted/${source.id}-questions.json`, JSON.stringify(questions, null, 2));
  await writeFile(`docs/PYQ/extracted/${source.id}-questions.txt`, questions.map((q) => `${q.id} | ${q.type} ${q.marks}m | KEY ${q.officialKey}\n${q.prompt}`).join("\n\n"));
  catalog.push({ ...source, title: `GATE ${source.year} ${source.set}`, questionCount: questions.length, totalMarks: questions.reduce((n, q) => n + q.marks, 0), durationMinutes: 180, questions });
  console.log(JSON.stringify({ id: source.id, questions: questions.length, marks: catalog.at(-1).totalMarks, imageCount: questions.reduce((n, q) => n + q.images.length, 0) }));
  await pdf.destroy();
  await keyPdf.destroy();
}
await writeFile("docs/PYQ/extracted/catalog.json", JSON.stringify(catalog, null, 2));
