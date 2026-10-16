import { mkdir, writeFile } from "node:fs/promises";

await mkdir("docs/PYQ/official", { recursive: true });
const files = [
  ["2024-cs1-paper", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS124S5.pdf"],
  ["2024-cs2-paper", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS224S6.pdf"],
  ["2024-cs1-key", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS1FinalAnswerKey.pdf"],
  ["2024-cs2-key", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS2FinalAnswerKey.pdf"],
  ["2025-cs1-paper", "https://gate2027.iitm.ac.in/static/doc/download/2025/CS1.pdf"],
  ["2025-cs2-paper", "https://gate2027.iitm.ac.in/static/doc/download/2025/CS2.pdf"],
  ["2025-cs1-key", "https://gate2027.iitm.ac.in/static/doc/download/2025/CS1_Keys.pdf"],
  ["2025-cs2-key", "https://gate2027.iitm.ac.in/static/doc/download/2025/CS2_Keys.pdf"],
];
const results = await Promise.allSettled(files.map(async ([id, url]) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 5).toString() !== "%PDF-") throw new Error(`${id}: not a PDF`);
  await writeFile(`docs/PYQ/official/${id}.pdf`, bytes);
  return { id, url, bytes: bytes.length };
}));
const manifest = results.map((result, index) => result.status === "fulfilled" ? result.value : { id: files[index][0], url: files[index][1], error: result.reason.message });
await writeFile("docs/PYQ/official/sources.json", JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
