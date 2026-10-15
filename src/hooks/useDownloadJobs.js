import { useEffect } from "react";
import { api } from "../services/api.js";
export function useDownloadJobs(jobs, setJobs) {
  const signature = jobs
    .filter((j) => ["queued", "downloading", "complete"].includes(j.status))
    .map((j) => j.id)
    .join(",");
  const hasActive = jobs.some((j) =>
    ["queued", "downloading"].includes(j.status),
  );
  useEffect(() => {
    if (!signature) return;
    const controller = new AbortController();
    let busy = false;
    const poll = async () => {
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      const results = await Promise.allSettled(
        signature.split(",").map(async (id) => {
          try {
            return await api(`/downloads/${id}`, { signal: controller.signal });
          } catch (e) {
            if (e.code === "JOB_NOT_FOUND")
              return { id, status: "failed", error: e.message };
            throw e;
          }
        }),
      );
      if (!controller.signal.aborted)
        setJobs((previous) => {
          let changed = false;
          const next = previous.map((job) => {
            const update = results.find(
              (result) =>
                result.status === "fulfilled" && result.value.id === job.id,
            )?.value;
            if (
              update &&
              (update.status !== job.status ||
                update.progress !== job.progress ||
                update.error !== job.error)
            ) {
              changed = true;
              return { ...job, ...update };
            }
            return job;
          });
          return changed ? next : previous;
        });
      busy = false;
    };
    poll();
    const timer = hasActive ? setInterval(poll, 2000) : null;
    document.addEventListener("visibilitychange", poll);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [signature, hasActive, setJobs]);
}
