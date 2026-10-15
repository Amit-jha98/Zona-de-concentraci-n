import { useState, useCallback } from "react";
import { read, write } from "../services/storage.js";

export function useStorage(key, fallback, validate) {
  const [state, setState] = useState(() => read(key, fallback, validate));
  const [error, setError] = useState(false);
  const update = useCallback(
    (value) => {
      setState((previous) => {
        const next = typeof value === "function" ? value(previous) : value;
        if (Object.is(previous, next)) return previous;
        if (!write(key, next)) queueMicrotask(() => setError(true));
        return next;
      });
    },
    [key],
  );
  return [state, update, error];
}
