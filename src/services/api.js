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
export async function api(
  path,
  { signal, method = "GET", body, timeoutMs = 65000 } = {},
) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
        : AbortSignal.timeout(timeoutMs),
      headers: {
        ...(apiKey ? { "X-YouTube-Key": apiKey } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "TimeoutError")
      throw new Error(
        path === "/downloads"
          ? "Preparing this video took too long. Try 360p or a shorter video."
          : "The request took too long. Please retry.",
      );
    throw error;
  }
  if (
    !(response.headers.get("content-type") || "").includes("application/json")
  ) {
    const error = new Error(
      response.status === 504
        ? "The hosting provider timed out. Try a shorter video or a lower quality."
        : "The app API is unavailable on this deployment. Redeploy the complete project with its Vercel API function and vercel.json configuration.",
    );
    error.code = "API_UNAVAILABLE";
    throw error;
  }
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.error || `Request failed (${response.status}).`,
    );
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
}
