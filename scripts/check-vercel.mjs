const supplied = process.argv[2];
if (!supplied)
  throw new Error(
    "Usage: node scripts/check-vercel.mjs https://your-project.vercel.app",
  );
const base = new URL(supplied);
if (
  base.protocol !== "https:" &&
  !["localhost", "127.0.0.1"].includes(base.hostname)
)
  throw new Error("Use an HTTPS deployment URL.");
for (const [path, expected] of [
  ["/api/health", 200],
  ["/api/search?q=cricket+match+highlights", 403],
]) {
  const response = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(30000),
  });
  if (
    !(response.headers.get("content-type") || "").includes("application/json")
  ) {
    console.error(
      `${path}: HTTP ${response.status}; API function is missing or misrouted.`,
    );
    process.exitCode = 1;
    continue;
  }
  const data = await response.json();
  if (
    response.status !== expected ||
    (path === "/api/health" &&
      (data.hosting !== "vercel" ||
        !data.downloads?.available ||
        data.downloads.mode !== "cloud"))
  )
    process.exitCode = 1;
  console.log(
    JSON.stringify({
      path,
      status: response.status,
      ...(path === "/api/health"
        ? { hosting: data.hosting, downloads: data.downloads, tutor: data.tutor }
        : { code: data.code }),
    }),
  );
}
