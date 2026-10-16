import { ServiceError } from "./youtube.mjs";

export const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);
export async function generateGemini({
  contents,
  system,
  json = false,
  maxOutputTokens = 4096,
  model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  signal,
  fetchImpl = fetch,
  key = process.env.GEMINI_API_KEY,
}) {
  if (!key) throw new ServiceError("The topic tutor is not configured yet. Add GEMINI_API_KEY to the server environment.", 503, "GEMINI_NOT_CONFIGURED");
  if (!/^gemini-[a-z0-9.-]+$/.test(model)) throw new ServiceError("The configured Gemini model name is invalid.", 503, "GEMINI_MODEL_INVALID");
  let response;
  try {
    const inputs = contents.map((message) => ({ type: message.role === "model" ? "model_output" : "user_input", content: message.parts.map((part) => part.inlineData ? { type: "image", mime_type: part.inlineData.mimeType, data: part.inlineData.data } : { type: "text", text: part.text }) }));
    response = await fetchImpl("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: signal || AbortSignal.timeout(55000),
      body: JSON.stringify({
        model,
        store: false,
        ...(system ? { system_instruction: system } : {}),
        input: inputs.length === 1 ? inputs[0].content : inputs,
        generation_config: { temperature: 0.2, max_output_tokens: maxOutputTokens },
        ...(json ? { response_format: { type: "text", mime_type: "application/json" } } : {}),
      }),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ServiceError("Gemini could not be reached. Please try again.", 502, "GEMINI_UNAVAILABLE");
  }
  if (!response.ok) {
    const status = response.status;
    const details = await response.json().catch(() => ({}));
    const error = new ServiceError(
      status === 429 ? "The tutor has reached its request limit. Please try again shortly."
        : [401, 403].includes(status) ? "Gemini access was denied. Check the server API key and project access."
          : status === 404 ? "The configured Gemini model is unavailable. Check GEMINI_MODEL on the server."
            : "Gemini could not complete this response. Please try again.",
      status === 429 ? 429 : 502,
      status === 429 ? "GEMINI_RATE_LIMITED" : "GEMINI_UPSTREAM_ERROR",
    );
    error.upstreamStatus = status;
    const retry = details.error?.details?.find((item) => item.retryDelay)?.retryDelay;
    error.retryAfterMs = /^\d+(?:\.\d+)?s$/.test(retry || "") ? Math.min(120000, Math.ceil(parseFloat(retry) * 1000)) : status === 429 ? 60000 : 10000;
    throw error;
  }
  const result = await response.json();
  const text = result.steps?.filter((step) => step.type === "model_output").flatMap((step) => step.content || []).filter((part) => part.type === "text").map((part) => part.text || "").join("").trim();
  if (!text || result.status !== "completed") throw new ServiceError("The tutor could not finish a useful answer. Try asking a shorter question.", 502, "GEMINI_INCOMPLETE");
  return { text, model, usage: result.usage };
}
