import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
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
const scopeItems = {
  music: {
    id: "M7lc1UVf-VE",
    title: "A new song | Official music video",
    channel: "Music fixture",
  },
  "self-improvement": {
    id: "jNQXAC9IVRw",
    title: "How to build healthy habits",
    channel: "TED",
    channelId: "UCAuUUnT6oDeKwE6v1NGQxug",
    duration: 565,
  },
  "soft-skills": {
    id: "aqz-KE-bpKQ",
    title: "Communication skills for job interviews",
    channel: "Skills fixture",
  },
};
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
      result = scopeItems[url.searchParams.get("scope")]
        ? {
            items: [scopeItems[url.searchParams.get("scope")]],
            nextPageToken: null,
          }
        : url.searchParams.get("pageToken")
          ? {
              items: [
                items[1],
                {
                  ...items[0],
                  id: "aircAruvnKk",
                  title: "More algorithm concepts",
                },
              ],
              nextPageToken: null,
            }
          : {
              items: [
                ...items,
                {
                  id: "M7lc1UVf-VE",
                  title: "Cricket match highlights",
                  description: "coding song motivation",
                },
              ],
              nextPageToken: "next-real-page",
              provider: "YouTube test fixture",
            };
    else if (url.pathname.startsWith("/api/video/"))
      result =
        [...items, ...Object.values(scopeItems)].find((v) =>
          url.pathname.endsWith(v.id),
        ) || items[0];
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
      this.getVideoData=()=>({video_id:window.__testPlayer.videoId||config.videoId});
      this.stopVideo=()=>{window.__testPlayer.stopped=true};
      setTimeout(()=>config.events.onReady(),10);
    }};window.onYouTubeIframeAPIReady();
  `,
    }),
  );
});

test("home has live music, institutional self-improvement and soft skills, and refreshes each section", async ({
  page,
}) => {
  const counts = { music: 0, "self-improvement": 0, "soft-skills": 0 };
  page.on("request", (request) => {
    const url = new URL(request.url());
    const scope = url.searchParams.get("scope");
    if (url.pathname === "/api/search" && scope in counts) counts[scope]++;
  });
  await page.clock.install();
  await page.goto("/");
  for (const [scope, title] of [
    ["music", "Music for your break"],
    ["self-improvement", "Build a better everyday life"],
    ["soft-skills", "Build skills beyond the screen"],
  ]) {
    const section = page.getByRole("region", { name: title });
    await expect(section.getByRole("heading", { name: title })).toBeVisible();
    await expect(
      section.getByRole("button", {
        name: scopeItems[scope].title,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page.clock.fastForward(15 * 60000);
  await expect
    .poll(() => Object.values(counts).every((n) => n >= 2))
    .toBe(true);
  await page
    .getByRole("region", { name: "Music for your break" })
    .getByRole("button", { name: "View all" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Music & songs",
  );
  await expect(page.locator(".video-card")).toHaveCount(1);
});

test("removing a configured home category cannot crash the rest of the page", async ({
  page,
}) => {
  await page.route("**/src/data/library.js*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body:
        (await response.text()) +
        '\nCATEGORIES.splice(CATEGORIES.findIndex((item) => item.id === "self-improvement"), 1);\n',
    });
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore");
  await expect(
    page.getByRole("region", { name: "Music for your break" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Build skills beyond the screen" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Build a better everyday life" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("legacy motivation links open the replacement category and its topic filters", async ({
  page,
}) => {
  await page.goto("/#/?category=motivation");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Lifestyle & self-improvement",
  );
  const topics = page.getByRole("region", { name: "Self-improvement topics" });
  await expect(topics).toContainText("at least 5 minutes");
  const request = page.waitForRequest(
    (r) =>
      r.url().includes("/api/search?") &&
      new URL(r.url()).searchParams.get("q") === "Sleep",
  );
  await topics.getByRole("button", { name: "Sleep", exact: true }).click();
  await request;
  await expect(page).toHaveURL(/category=self-improvement&topic=Sleep/);
  await expect(page.locator(".video-card")).toHaveCount(1);
});

test("unrelated results and old saved/history items are hidden", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const bad = {
      id: "M7lc1UVf-VE",
      title: "Cricket match highlights",
      description: "computer science",
    };
    localStorage.setItem("edubrowse_v2_saved", JSON.stringify([bad]));
    localStorage.setItem("edubrowse_v2_history", JSON.stringify([bad]));
  });
  await page.goto("/#/search?q=Python");
  await expect(page.locator(".video-card")).toHaveCount(2);
  await expect(page.getByText("Cricket match highlights")).toHaveCount(0);
  await page.goto("/#/saved");
  await expect(page.locator(".video-card")).toHaveCount(0);
  await page.goto("/#/history");
  await expect(page.locator(".video-card")).toHaveCount(0);
});

test("cached metadata cannot bypass a rejected direct video link", async ({
  page,
}) => {
  let playerRequests = 0;
  page.on("request", (r) => {
    if (r.url().includes("iframe_api")) playerRequests++;
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "edubrowse_v2_saved",
      JSON.stringify([
        { id: "M7lc1UVf-VE", title: "Python programming tutorial" },
      ]),
    ),
  );
  await page.route("**/api/video/M7lc1UVf-VE", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        code: "CONTENT_NOT_ALLOWED",
        error:
          "Only CS, exam preparation, motivation, soft skills and music are allowed.",
      }),
    }),
  );
  await page.goto("/#/watch/M7lc1UVf-VE");
  await expect(
    page.getByRole("heading", { name: "Video outside your categories" }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Download", exact: true }),
  ).toHaveCount(0);
  expect(playerRequests).toBe(0);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("edubrowse_v2_history") || "[]").length,
    ),
  ).toBe(0);
});

test("playback waits for metadata approval and stops unapproved player navigation", async ({
  page,
}) => {
  let approve;
  await page.route("**/api/video/XB4MIexjvY0", async (route) => {
    await new Promise((resolve) => {
      approve = resolve;
    });
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(items[0]),
    });
  });
  await page.goto("/#/watch/XB4MIexjvY0");
  await expect(
    page.getByRole("heading", { name: "Checking video" }),
  ).toBeVisible();
  expect(await page.evaluate(() => !!window.__testPlayer)).toBe(false);
  await expect.poll(() => !!approve).toBe(true);
  approve();
  await expect
    .poll(() => page.evaluate(() => !!window.__testPlayer))
    .toBe(true);
  await page.evaluate(() => {
    window.__testPlayer.videoId = "M7lc1UVf-VE";
    window.__testPlayer.config.events.onStateChange({ data: 1 });
  });
  await expect(
    page.getByRole("heading", { name: "Video outside your categories" }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__testPlayer.stopped)).toBe(true);
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

test("Vercel downloads wait for preparation then save through a storage redirect", async ({
  page,
}) => {
  const fileServer = createServer((req, res) => {
    if (req.url === "/redirect") {
      res.writeHead(302, { Location: "/lesson.mp4" });
      return res.end();
    }
    res.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Disposition": 'attachment; filename="lesson.mp4"',
    });
    res.end(
      Buffer.from("00000018667479706d703432000000006d70343269736f6d", "hex"),
    );
  });
  await new Promise((resolve) => fileServer.listen(0, "127.0.0.1", resolve));
  const fileUrl = `http://127.0.0.1:${fileServer.address().port}/redirect`;
  try {
    await page.route("**/api/health", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          hosting: "vercel",
          downloads: { available: true, mode: "cloud", maxSizeMB: 150 },
        }),
      }),
    );
    let finish;
    await page.route("**/api/downloads", async (route) => {
      await new Promise((resolve) => {
        finish = resolve;
      });
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          id: "00000000-0000-4000-8000-000000000001",
          videoId: items[0].id,
          quality: "720",
          status: "complete",
          progress: 100,
          storage: "vercel-blob",
        }),
      });
    });
    await page.route("**/api/downloads/*/link", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ url: fileUrl }),
      }),
    );
    await page.goto("/#/watch/XB4MIexjvY0");
    await page.getByRole("button", { name: "Download", exact: true }).click();
    await expect(page.getByRole("dialog")).toContainText("150 MB");
    await page
      .getByRole("button", { name: "Download video", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Preparing your video",
    );
    await expect(
      page.getByRole("button", { name: "Preparing…", exact: true }),
    ).toBeDisabled();
    await expect.poll(() => !!finish).toBe(true);
    finish();
    await expect(page).toHaveURL(/downloads/);
    const saved = page.waitForEvent("download");
    await page.getByRole("link", { name: "Save file" }).click();
    const download = await saved;
    expect(download.suggestedFilename()).toBe("lesson.mp4");
    expect(await download.failure()).toBe(null);
  } finally {
    fileServer.closeAllConnections();
    await new Promise((resolve) => fileServer.close(resolve));
  }
});

test("an unconfigured Vercel deployment explains the storage setup instead of offering a broken download", async ({
  page,
}) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        hosting: "vercel",
        downloads: {
          available: false,
          mode: "cloud",
          message:
            "Connect a Private Vercel Blob store to this project, then redeploy.",
        },
      }),
    }),
  );
  await page.goto("/#/watch/XB4MIexjvY0");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Private Vercel Blob");
  await expect(
    page.getByRole("button", { name: "Download video", exact: true }),
  ).toBeDisabled();
});

test("a missing deployed API shows deployment guidance without local-server instructions", async ({
  page,
}) => {
  await page.route("**/api/downloads", (route) =>
    route.fulfill({
      status: 404,
      contentType: "text/plain",
      body: "NOT_FOUND",
    }),
  );
  await page.goto("/#/watch/XB4MIexjvY0");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  await page
    .getByRole("button", { name: "Download video", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Redeploy the complete project",
  );
  await expect(page.getByRole("dialog")).not.toContainText("npm run dev");
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
