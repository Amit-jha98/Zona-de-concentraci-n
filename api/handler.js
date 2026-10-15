import { apiHandler } from "../server/api.mjs";

// Vercel rewrites every /api/* URL here. Preserve filters and continuation
// cursors while restoring the router's original path.
export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const route = url.searchParams.get("__path");
  if (route !== null) {
    url.pathname = `/api/${route}`;
    url.searchParams.delete("__path");
    req.url = url.pathname + url.search;
  }
  await apiHandler(req, res, () => {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "API route not found.", code: "NOT_FOUND" }),
    );
  });
}
