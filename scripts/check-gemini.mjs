import { generateGemini } from "../server/gemini-client.mjs";
import { readFile } from "node:fs/promises";
import { createCanvas, loadImage } from "@napi-rs/canvas";
try {
  let picture;
  if (process.argv.includes("--image")) {
    const image = await loadImage(await readFile("public/pyq/2023-cs/q11-1.webp"));
    const canvas = createCanvas(image.width, image.height);
    canvas.getContext("2d").drawImage(image, 0, 0);
    picture = canvas.toBuffer("image/png");
  }
  const parts = picture ? [{ text: "Summarize this question in one sentence." }, { inlineData: { mimeType: "image/png", data: picture.toString("base64") } }] : [{ text: process.argv.includes("--solve") ? "Solve this compiler question: S1 front end is hardware independent. S2 back end is target hardware dependent. S3 back end is source language dependent. Which statements are true? Give a short worked explanation." : "Reply with exactly READY." }];
  const result = await generateGemini({ contents: [{ role: "user", parts }], maxOutputTokens: 2048, fetchImpl: async (...args) => {
    const response = await fetch(...args);
    if (!response.ok) {
      const data = await response.clone().json();
      console.log(JSON.stringify({ status: response.status, upstream: data.error?.message?.replaceAll(process.env.GEMINI_API_KEY, "[redacted]") }));
    }
    return response;
  } });
  console.log(JSON.stringify({ ok: true, model: result.model, reply: result.text }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, code: error.code, message: error.message }));
  process.exitCode = 1;
}
