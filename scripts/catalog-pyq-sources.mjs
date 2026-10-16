import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const sources = [
  ["2024-cs1-paper", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS124S5.pdf"],
  ["2024-cs2-paper", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS224S6.pdf"],
  ["2024-cs1-key", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS1FinalAnswerKey.pdf"],
  ["2024-cs2-key", "https://gate2024.iisc.ac.in/wp-content/uploads/2024/CS2FinalAnswerKey.pdf"],
  ["2025-cs1-paper", "https://gate2025.iitr.ac.in/doc/2025/2025_QP/CS1.pdf"],
  ["2025-cs2-paper", "https://gate2025.iitr.ac.in/doc/2025/2025_QP/CS2.pdf"],
  ["2025-cs1-key", "https://gate2025.iitr.ac.in/doc/2025/2025_Key/CS1_Keys.pdf"],
  ["2025-cs2-key", "https://gate2025.iitr.ac.in/doc/2025/2025_Key/CS2_Keys.pdf"],
];
const manifest = await Promise.all(sources.map(async ([id, url]) => {
  const bytes = await readFile(`docs/PYQ/official/${id}.pdf`);
  return { id, url, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
}));
await writeFile("docs/PYQ/official/sources.json", JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ catalogued: manifest.length, networkRequests: 0 }));
