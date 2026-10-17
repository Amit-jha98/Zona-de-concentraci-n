import { useEffect, useState } from "react";
let cached, pending;
async function load() {
  if (cached) return cached;
  if (!pending)
    pending = fetch("/gate-pyq-analysis.json", {
      signal: AbortSignal.timeout(15000),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("PYQ analysis could not load.");
        const value = await response.json();
        if (value.version !== 1 || !Array.isArray(value.topics))
          throw new Error("PYQ analysis is incomplete.");
        cached = value;
        return value;
      })
      .finally(() => {
        pending = null;
      });
  return pending;
}
export default function useCourseAnalysis() {
  const [value, setValue] = useState(cached),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) {
          setValue(data);
          setError("");
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  return {
    value,
    error,
    retry: () => {
      setError("");
      setRevision((n) => n + 1);
    },
  };
}
