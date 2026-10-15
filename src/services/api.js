let apiKey = "";
try {
  apiKey = sessionStorage.getItem("edubrowse_api_key") || "";
} catch {
  /* Storage may be disabled. */
}
export function setApiKey(value) {
  apiKey = value.trim();
  try {
    if (apiKey) sessionStorage.setItem("edubrowse_api_key", apiKey);
    else sessionStorage.removeItem("edubrowse_api_key");
  } catch {
    /* In-memory credentials still work. */
  }
}
export function getApiKey() {
  return apiKey;
}
export async function api(path, { signal, method = "GET", body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(65000)])
      : AbortSignal.timeout(65000),
    headers: {
      ...(apiKey ? { "X-YouTube-Key": apiKey } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (
    !(response.headers.get("content-type") || "").includes("application/json")
  )
    throw new Error(
      "The app server is unavailable. Start the project with npm run dev or npm start.",
    );
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.error || `Request failed (${response.status}).`,
    );
    error.code = data.code;
    throw error;
  }
  return data;
}
