import { test, expect } from "@playwright/test";

const video = {
  id: "XB4MIexjvY0",
  title: "Dijkstra algorithm explained",
  channel: "Abdul Bari",
  duration: 1115,
  subject: "algorithms",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__device = { orientations: [], unlocks: 0, locks: [], deny: false };
    Object.defineProperty(screen, "orientation", {
      configurable: true,
      value: {
        type: "portrait-primary",
        lock: async (type) => {
          window.__device.orientations.push(type);
          if (window.__device.deny)
            throw new Error("Orientation not supported");
        },
        unlock: () => {
          window.__device.unlocks++;
        },
      },
    });
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: {
        request: async (type) => {
          if (window.__device.deny) throw new Error("Wake lock denied");
          const lock = new EventTarget();
          lock.type = type;
          lock.released = false;
          lock.release = async () => {
            lock.released = true;
            lock.dispatchEvent(new Event("release"));
          };
          window.__device.locks.push(lock);
          return lock;
        },
      },
    });
  });
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({
      json: path.startsWith("/api/video/") ? video : { items: [] },
    });
  });
  await page.route("**/www.youtube.com/iframe_api", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
      window.YT = {
        PlayerState: { PLAYING: 1, PAUSED: 2, BUFFERING: 3, ENDED: 0 },
        Player: function(target, config) {
          const iframe = document.createElement('iframe');
          iframe.title = 'YouTube video player fixture';
          iframe.allowFullscreen = true;
          iframe.srcdoc = '<body style="margin:0;background:#080808;color:#fff"><button onclick="document.documentElement.requestFullscreen()">YouTube fullscreen</button></body>';
          target.replaceWith(iframe);
          window.__testPlayer = { config, iframe };
          this.getCurrentTime = () => 42;
          this.getDuration = () => 1115;
          this.getVideoData = () => ({ video_id: window.__testPlayer.videoId || config.videoId });
          this.destroy = () => iframe.remove();
          this.stopVideo = () => {};
          setTimeout(() => config.events.onReady(), 10);
        }
      };
      window.onYouTubeIframeAPIReady();
    `,
    }),
  );
  await page.goto(`/#/watch/${video.id}`);
  await expect(
    page.getByRole("button", { name: "Enter fullscreen", exact: true }),
  ).toBeEnabled();
});

const playback = (page, state) =>
  page.evaluate((data) => {
    window.__testPlayer.config.events.onStateChange({ data });
  }, state);
const activeLocks = (page) =>
  page.evaluate(
    () => window.__device.locks.filter((lock) => !lock.released).length,
  );

test("app fullscreen fills the viewport and mobile requests landscape then portrait", async ({
  page,
  isMobile,
}) => {
  await page
    .getByRole("button", { name: "Enter fullscreen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement?.className))
    .toBe("player-frame");
  await expect(page.locator(".fullscreen-exit")).toBeVisible();
  const bounds = await page.locator(".player-frame").boundingBox();
  expect(bounds.width).toBeCloseTo(page.viewportSize().width, 0);
  expect(bounds.height).toBeCloseTo(page.viewportSize().height, 0);
  await expect
    .poll(() => page.evaluate(() => window.__device.orientations))
    .toEqual(isMobile ? ["landscape"] : []);
  if (isMobile) {
    await page.setViewportSize({ width: 844, height: 390 });
    const landscape = await page.locator(".youtube-mount").boundingBox();
    expect(landscape.width).toBe(844);
    expect(landscape.height).toBeLessThanOrEqual(390);
  }
  await page.locator(".fullscreen-exit").click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement))
    .toBeNull();
  await expect(
    page.getByRole("button", { name: "Enter fullscreen", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__device.orientations))
    .toEqual(isMobile ? ["landscape", "portrait"] : []);
  if (isMobile) {
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("YouTube's own iframe fullscreen and browser exit trigger orientation handling", async ({
  page,
  isMobile,
}) => {
  await page
    .frameLocator(".youtube-mount iframe")
    .getByRole("button", { name: "YouTube fullscreen" })
    .click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement?.tagName))
    .toBe("IFRAME");
  await expect
    .poll(() => page.evaluate(() => window.__device.orientations))
    .toEqual(isMobile ? ["landscape"] : []);
  await page.evaluate(() => document.exitFullscreen());
  await expect
    .poll(() => page.evaluate(() => window.__device.orientations))
    .toEqual(isMobile ? ["landscape", "portrait"] : []);
  await expect(
    page.getByRole("button", { name: "Enter fullscreen", exact: true }),
  ).toBeVisible();
});

test("screen stays awake through playback and buffering, releases on pause/end/exit", async ({
  page,
}) => {
  expect(await activeLocks(page)).toBe(0);
  await playback(page, 1);
  await expect.poll(() => activeLocks(page)).toBe(1);
  await playback(page, 3);
  expect(await activeLocks(page)).toBe(1);
  expect(await page.evaluate(() => window.__device.locks.length)).toBe(1);
  await playback(page, 2);
  await expect.poll(() => activeLocks(page)).toBe(0);
  await playback(page, 1);
  await expect.poll(() => activeLocks(page)).toBe(1);
  await playback(page, 0);
  await expect.poll(() => activeLocks(page)).toBe(0);
  await playback(page, 1);
  await expect.poll(() => activeLocks(page)).toBe(1);
  await page.evaluate(() => {
    location.hash = "/gate";
  });
  await expect(page.locator(".watch-title")).toHaveCount(0);
  await expect.poll(() => activeLocks(page)).toBe(0);
});

test("hidden pages release the screen and active playback reacquires on return", async ({
  page,
}) => {
  await playback(page, 1);
  await expect.poll(() => activeLocks(page)).toBe(1);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => activeLocks(page)).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => activeLocks(page)).toBe(1);
  await page
    .getByRole("button", { name: "Enter fullscreen", exact: true })
    .click();
  await expect(page.locator(".fullscreen-exit")).toBeVisible();
  await page.evaluate(() =>
    window.__testPlayer.config.events.onError({ data: 100 }),
  );
  await expect(page.locator(".player-error")).toBeVisible();
  await expect.poll(() => activeLocks(page)).toBe(0);
  await page.locator(".fullscreen-exit").click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement))
    .toBeNull();
});

test("content rejection exits fullscreen and releases wake/orientation locks", async ({
  page,
}) => {
  await playback(page, 1);
  await expect.poll(() => activeLocks(page)).toBe(1);
  await page
    .getByRole("button", { name: "Enter fullscreen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(true);
  await page.evaluate(() => {
    window.__testPlayer.videoId = "M7lc1UVf-VE";
  });
  await playback(page, 1);
  await expect(
    page.getByRole("heading", { name: "Video outside your categories" }),
  ).toBeVisible();
  await expect.poll(() => activeLocks(page)).toBe(0);
  await expect
    .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
    .toBe(false);
});

test("denied device APIs leave fullscreen and playback usable", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.evaluate(() => {
    window.__device.deny = true;
  });
  await playback(page, 1);
  await page
    .getByRole("button", { name: "Enter fullscreen", exact: true })
    .click();
  await expect(page.locator(".fullscreen-exit")).toBeVisible();
  await page.locator(".fullscreen-exit").click();
  await playback(page, 2);
  await expect(page.locator(".watch-title")).toHaveText(video.title);
  expect(await activeLocks(page)).toBe(0);
  expect(errors).toEqual([]);
});
