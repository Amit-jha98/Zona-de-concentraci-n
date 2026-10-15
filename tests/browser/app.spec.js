import { test, expect } from "@playwright/test";
const items = [
  {
    id: "XB4MIexjvY0",
    title: "Dijkstra algorithm explained",
    channel: "Abdul Bari",
    duration: 1115,
    views: 10000,
    publishedAt: "2026-09-01T10:00:00Z",
    subject: "algorithms",
  },
  {
    id: "0IAPZzGSbME",
    title: "Introduction to algorithms",
    channel: "Abdul Bari",
    duration: 950,
    views: 50000,
    subject: "algorithms",
  },
];
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    let result = {};
    if (url.pathname === "/api/uploads")
      result = {
        items,
        channelsTotal: 6,
        channelsAvailable: 6,
        fetchedAt: new Date().toISOString(),
      };
    else if (url.pathname === "/api/search")
      result = url.searchParams.get("pageToken")
        ? {
            items: [
              items[1],
              {
                ...items[0],
                id: "aircAruvnKk",
                title: "More focused concepts",
              },
            ],
            nextPageToken: null,
          }
        : {
            items,
            nextPageToken: "next-real-page",
            provider: "YouTube test fixture",
          };
    else if (url.pathname.startsWith("/api/video/"))
      result = items.find((v) => url.pathname.endsWith(v.id)) || items[0];
    else if (url.pathname === "/api/health")
      result = { ok: true, downloads: { available: true, version: "test" } };
    else if (url.pathname === "/api/downloads")
      result = {
        id: "00000000-0000-4000-8000-000000000001",
        videoId: items[0].id,
        quality: "720",
        status: "queued",
        progress: 0,
      };
    else if (url.pathname.includes("/api/downloads/"))
      result = {
        id: "00000000-0000-4000-8000-000000000001",
        status: "complete",
        progress: 100,
      };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(result),
    });
  });
  await page.route("**/www.youtube.com/iframe_api", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    window.YT={PlayerState:{PLAYING:1,ENDED:0},Player:function(el,config){
      window.__testPlayer={config,position:42,duration:1115};
      this.getCurrentTime=()=>window.__testPlayer.position;this.getDuration=()=>1115;
      this.seekTo=(t)=>{window.__testPlayer.position=t};this.destroy=()=>{};
      setTimeout(()=>config.events.onReady(),10);
    }};window.onYouTubeIframeAPIReady();
  `,
    }),
  );
});

test("discovery renders real video cards and saving persists across reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore");
  await page
    .getByRole("button", {
      name: "Save Dijkstra algorithm explained",
      exact: true,
    })
    .click();
  await page.goto("/#/saved");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Saved for later",
  );
  await expect(
    page.getByRole("button", {
      name: "Dijkstra algorithm explained",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Dijkstra algorithm explained",
      exact: true,
    }),
  ).toBeVisible();
});

test("search consumes continuation tokens and deduplicates page overlaps", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox")
    .count()
    .then(async (count) => {
      const input = count
        ? page.getByRole("searchbox")
        : page.getByLabel("Search videos, topics or paste a YouTube link");
      await input.fill("Dijkstra");
      await input.press("Enter");
    });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Dijkstra",
  );
  await expect(page.locator(".video-card")).toHaveCount(2);
  const nextRequest = page.waitForRequest((r) =>
    r.url().includes("pageToken=next-real-page"),
  );
  await page
    .getByRole("button", { name: "Load more videos", exact: true })
    .click();
  await nextRequest;
  await expect(page.locator(".video-card")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "Load more videos", exact: true }),
  ).toHaveCount(0);
});

test("GATE lesson quiz explains mistakes, persists success, and advances progress", async ({
  page,
}) => {
  await page.goto("/#/lesson/propositional-logic");
  await expect(
    page.getByRole("heading", { name: "Propositional logic", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Practice", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Complete & continue" }),
  ).toBeDisabled();
  await page.getByRole("radio").nth(0).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("status")).toContainText("Not quite");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await page.getByRole("button", { name: "Complete & continue" }).click();
  await expect(page).toHaveURL(/first-order-logic/);
  await page.goto("/#/gate");
  await expect(page.locator(".gate-summary")).toContainText(
    "1 of 146 complete",
  );
  await page.reload();
  await expect(page.locator(".gate-summary")).toContainText(
    "1 of 146 complete",
  );
});

test("topic search finds previously omitted concepts and lesson notes export", async ({
  page,
}) => {
  await page.goto("/#/gate");
  await page.getByLabel("Find a syllabus topic").fill("LU decomposition");
  await expect(
    page.getByRole("button", { name: /LU decomposition/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /LU decomposition/ }).click();
  await expect(
    page.getByRole("heading", { name: "LU decomposition", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download notes", exact: true })
    .click();
  await expect((await download).suggestedFilename()).toBe(
    "lu-decomposition-notes.md",
  );
});

test("watch history is based on playback and notes use actual player time", async ({
  page,
}) => {
  await page.goto("/#/watch/XB4MIexjvY0");
  await expect(page.locator(".watch-title")).toHaveText(items[0].title);
  await expect
    .poll(() => page.evaluate(() => !!window.__testPlayer))
    .toBe(true);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("edubrowse_v2_history") || "[]").length,
    ),
  ).toBe(0);
  await page.evaluate(() =>
    window.__testPlayer.config.events.onStateChange({ data: 1 }),
  );
  await page.getByRole("button", { name: "Add a note", exact: true }).click();
  await page.getByLabel("Your note").fill("Relax each outgoing edge.");
  await page.getByRole("button", { name: "Save timestamped note" }).click();
  await expect(page.getByRole("dialog")).toContainText("0:42");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("edubrowse_v2_history"))[0].id,
    ),
  ).toBe(items[0].id);
});

test("downloads have a real queued and completed file flow", async ({
  page,
}) => {
  await page.goto("/#/watch/XB4MIexjvY0");
  await expect(page.locator(".watch-title")).toHaveText(items[0].title);
  await page.getByRole("button", { name: "Download", exact: true }).click();
  await page
    .getByRole("button", { name: "Download video", exact: true })
    .click();
  await expect(page).toHaveURL(/downloads/);
  await expect(page.getByRole("link", { name: "Save file" })).toHaveAttribute(
    "href",
    "/api/downloads/00000000-0000-4000-8000-000000000001/file",
  );
});

test("settings persist, dialogs close with Escape, backup export excludes keys", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Theme", exact: true })
    .selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByLabel("YouTube Data API key", { exact: true })
    .fill("test-session-key");
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((v) => v.includes("test-session-key")),
    ),
  ).toBe(false);
});

test("key layouts fit viewport and core navigation remains accessible", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    "/",
    "/#/gate",
    "/#/lesson/ipv4-fragmentation",
    "/#/saved",
    "/#/downloads",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open navigation menu", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-home.png`,
    fullPage: false,
    scale: "css",
  });
});

test("malformed browser storage does not crash the application", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("edubrowse_v2_gate", '{"broken":null}');
    localStorage.setItem("edubrowse_v2_saved", "{}");
    localStorage.setItem("edubrowse_v2_notes", "{oops");
  });
  await page.goto("/#/gate");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "GATE Computer Science",
  );
  await expect(page.locator(".gate-summary")).toContainText(
    "0 of 146 complete",
  );
});
