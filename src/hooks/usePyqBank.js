import { useEffect, useState } from "react";

let cached;
let pending;
export async function loadPyqBank() {
  if (cached) return cached;
  if (!pending) pending = (async () => {
    const response = await fetch("/gate-pyq-bank.json", { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("The question bank could not load. Check your connection and retry.");
    const value = await response.json();
    if (value.version !== 1 || !Array.isArray(value.questions) || !Array.isArray(value.exams)) throw new Error("The question bank is incomplete. Refresh the app after deployment.");
    cached = value;
    return value;
  })().finally(() => { pending = null; });
  return pending;
}
export function usePyqBank(enabled = true) {
  const [bank, setBank] = useState(cached || null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadPyqBank().then((value) => { if (!cancelled) { setBank(value); setError(""); } })
      .catch((error) => { if (!cancelled) setError(error.message); });
    return () => { cancelled = true; };
  }, [enabled, revision]);
  return { bank, loading: enabled && !bank && !error, error, retry: () => { setError(""); setRevision((value) => value + 1); } };
}
