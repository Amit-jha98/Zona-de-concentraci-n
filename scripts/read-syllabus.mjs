import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const doc = await getDocument({
  data: new Uint8Array(readFileSync("public/CS_GATE2027_Syllabus.pdf")),
  useSystemFonts: true,
}).promise;
let text = "";
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  text += `\nPAGE ${i}\n${content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join("")}`;
}
mkdirSync("docs", { recursive: true });
writeFileSync("docs/syllabus-source.txt", text);
console.log(text);
