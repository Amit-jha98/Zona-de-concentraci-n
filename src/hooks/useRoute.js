import { useEffect, useState } from "react";
export function getRoute() {
  const raw = window.location.hash.slice(1) || "/";
  try {
    const url = new URL(raw, window.location.origin);
    return { path: url.pathname, params: Object.fromEntries(url.searchParams) };
  } catch {
    return { path: "/", params: {} };
  }
}
export function navigate(path) {
  if (window.location.hash === `#${path}`) return;
  window.location.hash = path;
}
export function useRoute() {
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const handle = () => {
      setRoute(getRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);
  return route;
}
