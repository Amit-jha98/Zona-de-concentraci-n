import { useEffect, useState } from "react";
import { allowedVideos } from "../../shared/contentPolicy.js";
let catalog;
let pending;
function loadCatalog() {
  if (catalog) return Promise.resolve(catalog);
  if (!pending)
    pending = fetch("/gate-topic-videos.json", {
      signal: AbortSignal.timeout(10000),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Topic catalog unavailable");
        const value = await response.json();
        catalog = value;
        return value;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  return pending;
}
export function useTopicCandidates(id) {
  const [state, setState] = useState(() => ({
    items: allowedVideos(catalog?.lessons?.[id]?.items),
    loading: !catalog,
    checkedAt: catalog?.lessons?.[id]?.checkedAt,
  }));
  useEffect(() => {
    let current = true;
    loadCatalog()
      .then((data) => {
        if (current)
          setState({
            items: allowedVideos(data.lessons?.[id]?.items),
            loading: false,
            checkedAt: data.lessons?.[id]?.checkedAt,
          });
      })
      .catch(() => {
        if (current) setState({ items: [], loading: false });
      });
    return () => {
      current = false;
    };
  }, [id]);
  return state;
}
