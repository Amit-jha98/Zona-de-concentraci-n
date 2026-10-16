import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

await mkdir("docs/PYQ/extracted", { recursive: true });
for (const name of (await readdir("docs/PYQ")).filter((name) => /\.pdf$/i.test(name))) {
  const pdf = await getDocument({ data: new Uint8Array(await readFile(join("docs/PYQ", name))), useSystemFonts: true }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push({ page: i, text: content.items.map((item) => item.str + (item.hasEOL ? "\n" : " ")).join("") });
  }
  const stem = basename(name, ".pdf");
  await writeFile(join("docs/PYQ/extracted", `${stem}.json`), JSON.stringify({ source: name, pages }, null, 2));
  await writeFile(join("docs/PYQ/extracted", `${stem}.txt`), pages.map((page) => `\n--- PAGE ${page.page} ---\n${page.text}`).join("\n"));
  console.log(JSON.stringify({ source: name, pages: pages.length, characters: pages.reduce((n, page) => n + page.text.length, 0) }));
  await pdf.destroy();
}
