// Offline compilation only. Gemini is reserved for explicitly submitted doubts.
for (const paper of ["2023", "2024-cs1", "2024-cs2", "2025-cs1", "2025-cs2", "2026-cs1", "2026-cs2"]) await import(`./author-${paper}.mjs`);
await import("./compile-pyq.mjs");
await import("./build-exam-notes.mjs");
