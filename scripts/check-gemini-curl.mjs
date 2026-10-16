import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
const key = process.env.GEMINI_API_KEY;
if (!key || /[\r\n]/.test(key)) throw new Error("Configure a valid server-side Gemini key.");
const payload = { contents: [{ role: "user", parts: [{ text: "Explain why the compiler front end is hardware-independent in two sentences." }] }], generationConfig: { maxOutputTokens: 1024 } };
if (process.argv.includes("--image")) payload.contents[0].parts.push({ inlineData: { mimeType: "image/webp", data: (await readFile("public/pyq/2023-cs/q11-1.webp")).toString("base64") } });
const child = spawn("curl.exe", ["--silent", "--show-error", "--max-time", "65", "--config", "-"], { windowsHide: true });
child.stdin.end(`url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"\nrequest = "POST"\nheader = ${JSON.stringify(`x-goog-api-key: ${key}`)}\nheader = "Content-Type: application/json"\ndata = ${JSON.stringify(JSON.stringify(payload))}\n`);
let output = "";
for await (const chunk of child.stdout) output += chunk;
try {
  const data = JSON.parse(output);
  console.log(JSON.stringify({ ok: !data.error, error: data.error?.message?.replaceAll(key, "[redacted]"), text: data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("") }));
} catch { console.log(JSON.stringify({ ok: false, message: "No JSON response from the system HTTP client" })); }
