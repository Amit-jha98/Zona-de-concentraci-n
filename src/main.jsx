import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { migrateLegacyData } from "./services/stateValidation.js";
import { Analytics } from "@vercel/analytics/react";

migrateLegacyData();
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline caching is optional; the online app remains fully usable.
    });
  });
}
