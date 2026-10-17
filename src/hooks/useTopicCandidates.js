import { useEffect, useState } from "react";
import { allowedVideos } from "../../shared/contentPolicy.js";
const catalogs = new Map(),
  pending = new Map();
function loadCatalog(kind) {
  if (catalogs.has(kind)) return Promise.resolve(catalogs.get(kind));
  if (!pending.has(kind))
    pending.set(
      kind,
      fetch(
        kind === "practice"
          ? "/gate-topic-practice-videos.json"
          : "/gate-topic-videos.json",
        { signal: AbortSignal.timeout(10000) },
      )
        .then(async (response) => {
          if (!response.ok) throw new Error("Topic catalog unavailable");
          const value = await response.json();
          catalogs.set(kind, value);
          return value;
        })
        .finally(() => pending.delete(kind)),
    );
  return pending.get(kind);
}
export function useTopicCandidates(id, kind = "concept") {
  const [state, setState] = useState({ id, kind, items: [], loading: true });
  useEffect(() => {
    let current = true;
    loadCatalog(kind)
      .then((data) => {
        if (current)
          setState({
            id,
            kind,
            items: allowedVideos(data.lessons?.[id]?.items),
            loading: false,
            checkedAt: data.lessons?.[id]?.checkedAt,
          });
      })
      .catch(() => {
        if (current) setState({ id, kind, items: [], loading: false });
      });
    return () => {
      current = false;
    };
  }, [id, kind]);
  return state.id === id && state.kind === kind
    ? state
    : { items: [], loading: true };
}
