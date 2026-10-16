import { useEffect, useState } from "react";

const cache = new Map();
const pending = new Map();
export function loadExamNotes(id) {
  if (cache.has(id)) return Promise.resolve(cache.get(id));
  if (!pending.has(id)) pending.set(id, (async () => {
    const response = await fetch(`/gate-exam-notes/${encodeURIComponent(id)}.json`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("The exam guide could not load. Check your connection and retry.");
    const value = await response.json();
    if (value.lessonId !== id || !Array.isArray(value.examGuide) || !Array.isArray(value.advancedQuiz)) throw new Error("This exam guide is incomplete. Refresh the app after deployment.");
    cache.set(id, value);
    return value;
  })().finally(() => pending.delete(id)));
  return pending.get(id);
}
export function useExamNotes(id) {
  const [state, setState] = useState({ id, value: cache.get(id), error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    loadExamNotes(id).then((value) => { if (!cancelled) setState({ id, value, error: "" }); })
      .catch((error) => { if (!cancelled) setState({ id, error: error.message }); });
    return () => { cancelled = true; };
  }, [id, revision]);
  const value = state.id === id ? state.value : cache.get(id);
  return { value, error: state.id === id ? state.error : "", loading: !value && !(state.id === id && state.error), retry: () => { setState({ id, error: "" }); setRevision((n) => n + 1); } };
}
