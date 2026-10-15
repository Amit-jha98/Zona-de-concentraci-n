import test from "node:test";
import assert from "node:assert/strict";
import {
  videoList,
  progressValid,
  notesValid,
  settingsValid,
  migrateLegacyData,
} from "../src/services/stateValidation.js";
import { write, read } from "../src/services/storage.js";
function fakeStorage() {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, String(v)),
    key: (i) => [...data.keys()][i],
    get length() {
      return data.size;
    },
  };
}
test("nested malformed progress and notes are rejected before they can crash a lesson", () => {
  assert.equal(progressValid({ topic: { answers: { bad: null } } }), false);
  assert.equal(progressValid({ topic: { completed: "yes" } }), false);
  assert.equal(
    progressValid({ topic: { answers: { q: { answer: 9, correct: true } } } }),
    false,
  );
  assert.equal(notesValid({ fake: [] }), false);
  assert.equal(videoList({}), false);
  assert.equal(
    settingsValid({ theme: "light", autoRefresh: true, refreshMinutes: 0 }),
    false,
  );
});
test("legacy bookmarks and timestamped notes migrate once without inventing completion", () => {
  globalThis.localStorage = fakeStorage();
  localStorage.setItem(
    "edubrowse_bookmarks",
    JSON.stringify([
      { id: "XB4MIexjvY0", title: "My saved lecture" },
      { id: "synthetic", title: "Bad" },
    ]),
  );
  localStorage.setItem(
    "edubrowse_notes_XB4MIexjvY0",
    JSON.stringify([{ id: "n1", text: "My actual note", timestamp: "05:20" }]),
  );
  localStorage.setItem(
    "edubrowse_gate_progress",
    JSON.stringify([{ topics: [{ done: true }] }]),
  );
  migrateLegacyData();
  assert.equal(read("edubrowse_v2_saved", []).length, 1);
  assert.equal(read("edubrowse_v2_notes", {})["XB4MIexjvY0"][0].seconds, 320);
  assert.deepEqual(read("edubrowse_v2_gate", {}), {});
  localStorage.setItem("edubrowse_v2_saved", "[]");
  migrateLegacyData();
  assert.deepEqual(read("edubrowse_v2_saved", []), []);
  assert.ok(localStorage.getItem("edubrowse_bookmarks"));
});
test("blocked browser storage retains data in memory and reports failed persistence", () => {
  globalThis.localStorage = {
    getItem() {
      throw new Error("Blocked");
    },
    setItem() {
      throw new Error("Blocked");
    },
  };
  assert.equal(write("blocked-storage-test", { kept: true }), false);
  // Reads still need to recover the in-memory copy when localStorage itself throws.
  assert.deepEqual(read("blocked-storage-test", {}), { kept: true });
});
