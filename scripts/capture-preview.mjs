import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("docs/screenshots", { recursive: true });
const results = [];
for (const [name, viewport, mobile] of [
  ["desktop", { width: 1440, height: 1000 }, false],
  ["mobile", { width: 390, height: 844 }, true],
]) {
  const context = await browser.newContext({
    viewport,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.querySelectorAll(".video-card").length >= 11,
  );
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll(".feed-section")][0]?.querySelector(
        ".video-card",
      ) || document.querySelector(".feed-unavailable"),
    { timeout: 20000 },
  );
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 3000)),
    ]),
  );
  await page
    .waitForFunction(
      () => {
        const images = [
          ...document.querySelectorAll(".feed-section img"),
        ].slice(0, 3);
        return (
          images.length > 0 &&
          images.every((img) => img.complete && img.naturalWidth > 0)
        );
      },
      null,
      { timeout: 15000 },
    )
    .catch(() => {});
  const loadedImages = await page.evaluate(
    () =>
      [...document.images].filter((img) => img.complete && img.naturalWidth > 0)
        .length,
  );
  await page.screenshot({
    path: `docs/screenshots/${name}-explore.png`,
    scale: "css",
  });
  await page.goto("http://127.0.0.1:4173/#/gate", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("heading", { name: /GATE Computer Science/ }).waitFor();
  await page.screenshot({
    path: `docs/screenshots/${name}-gate.png`,
    scale: "css",
  });
  await page.goto("http://127.0.0.1:4173/#/lesson/ipv4-fragmentation", {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByRole("heading", { name: "IPv4 fragmentation", exact: true })
    .waitFor();
  await page.screenshot({
    path: `docs/screenshots/${name}-lesson.png`,
    scale: "css",
  });
  await page.getByRole("tab", { name: "Watch & learn" }).click();
  await page.locator(".lesson-video-grid .video-card").first().waitFor();
  const topicVideos = await page
    .locator(".lesson-video-grid .video-card")
    .count();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page
    .getByRole("heading", { name: "IPv4 fragmentation", exact: true })
    .waitFor();
  const offlineNotes = await page.locator(".concept-content").isVisible();
  results.push({
    name,
    loadedImages,
    topicVideos,
    overflow,
    offlineNotes,
    errors,
  });
  await context.close();
}
await browser.close();
await writeFile(
  "docs/browser-verification.json",
  JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2),
);
console.log(JSON.stringify(results));
