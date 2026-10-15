import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "../services/api.js";
import { uniqueVideos } from "../../shared/video.js";

export function useVideos(
  query,
  {
    order = "relevance",
    duration = "any",
    language = "",
    enabled = true,
    revision = 0,
  } = {},
) {
  const identity = JSON.stringify([query, order, duration, language, revision]);
  const [state, setState] = useState({
    items: [],
    loading: false,
    loadingMore: false,
    error: "",
    nextPageToken: null,
    fetchedAt: null,
    provider: "",
  });
  const sequence = useRef(0);
  const controller = useRef(null);
  const busy = useRef(false);
  const request = useCallback(
    async (pageToken = "") => {
      const generation = sequence.current;
      if (busy.current) return;
      busy.current = true;
      const abort = new AbortController();
      controller.current = abort;
      setState((prev) => ({
        ...(prev.identity === identity
          ? prev
          : { items: [], nextPageToken: null }),
        identity,
        error: "",
        loading: !pageToken,
        loadingMore: !!pageToken,
      }));
      try {
        const params = new URLSearchParams({
          q: query,
          order,
          duration,
          language,
          ...(pageToken ? { pageToken } : {}),
        });
        const result = await api(`/search?${params}`, { signal: abort.signal });
        if (sequence.current !== generation) return;
        setState((prev) => ({
          ...result,
          identity,
          items: uniqueVideos(
            pageToken ? [...prev.items, ...result.items] : result.items,
          ),
          loading: false,
          loadingMore: false,
          error: "",
        }));
      } catch (error) {
        if (sequence.current === generation && error.name !== "AbortError")
          setState((prev) => ({
            ...prev,
            loading: false,
            loadingMore: false,
            error: error.message,
          }));
      } finally {
        if (sequence.current === generation) busy.current = false;
      }
    },
    [query, order, duration, language, identity],
  );
  const cancel = useCallback(() => {
    sequence.current++;
    controller.current?.abort();
    busy.current = false;
  }, []);
  useEffect(() => {
    cancel();
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled && enabled && query) request();
    });
    return () => {
      cancelled = true;
      cancel();
    };
  }, [request, enabled, revision, query, cancel]);
  const visible =
    state.identity === identity
      ? state
      : {
          items: [],
          loading: enabled && !!query,
          loadingMore: false,
          error: "",
          nextPageToken: null,
        };
  return {
    ...visible,
    loadMore: () =>
      visible.nextPageToken &&
      !visible.loading &&
      request(visible.nextPageToken),
    refresh: () => {
      if (!visible.loading && !visible.loadingMore) request();
    },
  };
}
