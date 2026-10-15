// API functions may be bundled separately from the Vite frontend build. Install
// native tools before either builder starts, so includeFiles can always find them.
if (process.env.VERCEL === "1" && !process.env.YT_DLP_PATH) {
  await import("./setup-downloader.mjs");
}
