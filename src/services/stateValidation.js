import { VIDEO_ID, uniqueVideos, durationSeconds } from "../../shared/video.js";
import { isRecord, read, write } from "./storage.js";
export const videoList = (value) =>
  Array.isArray(value) &&
  value.length <= 1000 &&
  value.every(
    (v) =>
      isRecord(v) &&
      VIDEO_ID.test(v.id || "") &&
      typeof v.title === "string" &&
      v.title.length <= 2000,
  );
export const progressValid = (value) =>
  isRecord(value) &&
  Object.keys(value).length <= 1000 &&
  Object.values(value).every(
    (v) =>
      isRecord(v) &&
      (v.completed == null || typeof v.completed === "boolean") &&
      (v.personalNote == null ||
        (typeof v.personalNote === "string" &&
          v.personalNote.length <= 10000)) &&
      (v.answers == null ||
        (isRecord(v.answers) &&
          Object.values(v.answers).every(
            (a) =>
              isRecord(a) &&
              Number.isInteger(a.answer) &&
              a.answer >= 0 &&
              a.answer <= 3 &&
              typeof a.correct === "boolean",
          ))),
  );
export const notesValid = (value) =>
  isRecord(value) &&
  Object.entries(value).every(
    ([id, list]) =>
      VIDEO_ID.test(id) &&
      Array.isArray(list) &&
      list.length <= 1000 &&
      list.every(
        (n) =>
          isRecord(n) &&
          typeof n.id === "string" &&
          typeof n.text === "string" &&
          n.text.length <= 10000 &&
          Number.isFinite(n.seconds) &&
          n.seconds >= 0 &&
          n.seconds <= 86400,
      ),
  );
export const settingsValid = (value) =>
  isRecord(value) &&
  ["light", "dark", "system"].includes(value.theme) &&
  typeof value.autoRefresh === "boolean" &&
  [15, 30, 60].includes(value.refreshMinutes);

// Preserve user-created legacy data. The old checklist shipped with pre-completed
// topics, so it cannot be treated as evidence of progress in the new lesson track.
export function migrateLegacyData() {
  try {
    const marker = "edubrowse_v2_migrated";
    if (read(marker, false)) return;
    for (const [oldKey, newKey] of [
      ["edubrowse_bookmarks", "edubrowse_v2_saved"],
      ["edubrowse_history", "edubrowse_v2_history"],
    ]) {
      if (localStorage.getItem(newKey) == null) {
        const old = read(oldKey, [], Array.isArray);
        write(
          newKey,
          uniqueVideos(old)
            .filter((v) => typeof v.title === "string")
            .slice(0, 1000),
        );
      }
    }
    if (localStorage.getItem("edubrowse_v2_notes") == null) {
      const notes = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("edubrowse_notes_")) continue;
        const id = key.slice("edubrowse_notes_".length);
        if (!VIDEO_ID.test(id)) continue;
        const old = read(key, [], Array.isArray);
        notes[id] = old
          .filter((n) => isRecord(n) && typeof n.text === "string")
          .slice(0, 1000)
          .map((n, index) => ({
            id: String(n.id || `legacy-${index}`),
            text: n.text.slice(0, 10000),
            seconds: durationSeconds(n.timestamp || "0:00"),
            createdAt: n.createdAt || null,
          }));
      }
      write("edubrowse_v2_notes", notes);
    }
    write(marker, true);
  } catch {
    /* Private/disabled storage: the rest of the app uses memory. */
  }
}
