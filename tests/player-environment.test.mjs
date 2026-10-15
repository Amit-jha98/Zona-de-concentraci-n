import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createPlaybackWakeLock,
  createPlayerFullscreen,
} from "../src/services/playerEnvironment.js";

const settle = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function environment() {
  const document = new EventTarget();
  document.visibilityState = "visible";
  const window = new EventTarget();
  window.matchMedia = () => ({ matches: true });
  const locks = [];
  const navigator = {
    maxTouchPoints: 1,
    wakeLock: {
      request: async () => {
        const lock = new EventTarget();
        lock.released = false;
        lock.release = async () => {
          lock.released = true;
          lock.dispatchEvent(new Event("release"));
        };
        locks.push(lock);
        return lock;
      },
    },
  };
  return { document, window, navigator, locks };
}
function visibility(env, state) {
  env.document.visibilityState = state;
  env.document.dispatchEvent(new Event("visibilitychange"));
}

test("wake lock follows playback and visibility, without duplicate locks", async () => {
  const env = environment();
  const controller = createPlaybackWakeLock(env);
  controller.setPlaying(true);
  controller.setPlaying(true);
  await settle();
  assert.equal(env.locks.length, 1);
  visibility(env, "hidden");
  assert.equal(env.locks[0].released, true);
  visibility(env, "visible");
  await settle();
  assert.equal(env.locks.length, 2);
  controller.setPlaying(false);
  assert.equal(env.locks[1].released, true);
  visibility(env, "hidden");
  visibility(env, "visible");
  await settle();
  assert.equal(env.locks.length, 2);
  controller.destroy();
});

test("a late wake lock is released after pause, then resume can acquire again", async () => {
  const env = environment();
  const pending = deferred();
  const request = env.navigator.wakeLock.request;
  let calls = 0;
  env.navigator.wakeLock.request = () =>
    ++calls === 1 ? pending.promise : request();
  const controller = createPlaybackWakeLock(env);
  controller.setPlaying(true);
  controller.setPlaying(false);
  controller.setPlaying(true);
  const oldLock = await request();
  pending.resolve(oldLock);
  await settle();
  assert.equal(oldLock.released, true);
  assert.equal(calls, 2);
  assert.equal(env.locks[1].released, false);
  controller.destroy();
  assert.equal(env.locks[1].released, true);
});

test("leaving a page releases pending locks and removes visibility listeners", async () => {
  const env = environment();
  const pending = deferred();
  const lock = await env.navigator.wakeLock.request();
  env.navigator.wakeLock.request = () => pending.promise;
  const controller = createPlaybackWakeLock(env);
  controller.setPlaying(true);
  controller.destroy();
  pending.resolve(lock);
  await settle();
  assert.equal(lock.released, true);
  visibility(env, "visible");
  env.window.dispatchEvent(new Event("pageshow"));
  await settle();
  assert.equal(env.locks.length, 1);
});

test("wake locks are released and restored for page cache transitions", async () => {
  const env = environment();
  const controller = createPlaybackWakeLock(env);
  controller.setPlaying(true);
  await settle();
  env.window.dispatchEvent(new Event("pagehide"));
  assert.equal(env.locks[0].released, true);
  visibility(env, "visible");
  await settle();
  assert.equal(env.locks.length, 1);
  env.window.dispatchEvent(new Event("pageshow"));
  await settle();
  assert.equal(env.locks.length, 2);
  controller.destroy();
});

test("OS revocation and permission rejection do not cause retry loops", async () => {
  const env = environment();
  const controller = createPlaybackWakeLock(env);
  controller.setPlaying(true);
  await settle();
  await env.locks[0].release();
  await settle();
  assert.equal(env.locks.length, 1);
  let requests = 0;
  env.navigator.wakeLock.request = async () => {
    requests++;
    throw new Error("Battery policy");
  };
  visibility(env, "visible");
  await settle();
  await settle();
  assert.equal(requests, 1);
  controller.destroy();
  delete env.navigator.wakeLock;
  const unsupported = createPlaybackWakeLock(env);
  unsupported.setPlaying(true);
  await settle();
  unsupported.destroy();
});

function fullscreenEnvironment({ mobile = true } = {}) {
  const env = environment();
  env.window.matchMedia = () => ({ matches: mobile });
  const iframe = {};
  const frame = {
    contains: (element) => element === iframe,
    requestFullscreen: async () => enter(frame),
  };
  const enter = (element) => {
    env.document.fullscreenElement = element;
    env.document.dispatchEvent(new Event("fullscreenchange"));
  };
  env.document.exitFullscreen = async () => enter(null);
  const orientations = [];
  let unlocks = 0;
  const screen = {
    orientation: {
      lock: async (type) => {
        orientations.push(type);
      },
      unlock: () => {
        unlocks++;
      },
    },
  };
  const changes = [];
  const controller = createPlayerFullscreen({
    ...env,
    screen,
    frame,
    onChange: (value) => changes.push(value),
  });
  return {
    ...env,
    frame,
    iframe,
    enter,
    orientations,
    screen,
    changes,
    controller,
    unlocks: () => unlocks,
  };
}

test("mobile fullscreen requests landscape and restores/unlocks portrait on exit", async () => {
  const env = fullscreenEnvironment();
  assert.equal(await env.controller.toggle(), true);
  assert.deepEqual(env.orientations, ["landscape"]);
  assert.equal(await env.controller.toggle(), true);
  await settle();
  assert.deepEqual(env.orientations, ["landscape", "portrait"]);
  assert.deepEqual(env.changes, [true, false]);
  assert.equal(env.document.fullscreenElement, null);
  assert.ok(env.unlocks() >= 1);
  env.controller.destroy();
});

test("YouTube iframe fullscreen is observed; unrelated fullscreen is ignored", async () => {
  const env = fullscreenEnvironment();
  env.enter({});
  assert.deepEqual(env.changes, []);
  assert.deepEqual(env.orientations, []);
  env.enter(env.iframe);
  assert.deepEqual(env.orientations, ["landscape"]);
  env.enter(null);
  await settle();
  assert.deepEqual(env.orientations, ["landscape", "portrait"]);
  env.controller.destroy();
});

test("desktop fullscreen never locks orientation", async () => {
  const env = fullscreenEnvironment({ mobile: false });
  await env.controller.toggle();
  await env.controller.toggle();
  assert.deepEqual(env.orientations, []);
  assert.equal(env.unlocks(), 0);
  env.controller.destroy();
});

test("denied orientation requests do not break fullscreen or leave locks on disposal", async () => {
  const env = fullscreenEnvironment();
  const pending = deferred();
  env.screen.orientation.lock = () => pending.promise;
  await env.controller.toggle();
  await env.controller.toggle();
  const before = env.unlocks();
  env.controller.destroy();
  assert.ok(env.unlocks() > before);
  pending.reject(new Error("Not supported"));
  await settle();
  assert.equal(env.document.fullscreenElement, null);
});

test("late portrait completion cannot unlock a newer fullscreen session", async () => {
  const env = fullscreenEnvironment();
  const portrait = deferred();
  env.screen.orientation.lock = (type) =>
    type === "portrait" ? portrait.promise : Promise.resolve();
  await env.controller.toggle();
  await env.controller.toggle();
  await env.controller.toggle();
  const before = env.unlocks();
  portrait.resolve();
  await settle();
  assert.equal(env.unlocks(), before);
  env.controller.destroy();
  assert.equal(env.document.fullscreenElement, null);
  assert.ok(env.unlocks() > before);
});

test("late fullscreen requests exit safely after the player is removed", async () => {
  const env = fullscreenEnvironment();
  const pending = deferred();
  env.frame.requestFullscreen = async () => {
    await pending.promise;
    env.enter(env.frame);
  };
  const request = env.controller.toggle();
  env.controller.destroy();
  pending.resolve();
  assert.equal(await request, false);
  assert.equal(env.document.fullscreenElement, null);
  assert.deepEqual(env.orientations, []);
});

test("fullscreen denial returns failure without an unhandled rejection", async () => {
  const env = fullscreenEnvironment();
  env.frame.requestFullscreen = async () => {
    throw new Error("Denied");
  };
  assert.equal(await env.controller.toggle(), false);
  env.controller.destroy();
});
