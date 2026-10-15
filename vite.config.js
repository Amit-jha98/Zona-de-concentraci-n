import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { apiHandler } from "./server/api.mjs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "edubrowse-api",
      configureServer(server) {
        server.middlewares.use(apiHandler);
      },
      configurePreviewServer(server) {
        server.middlewares.use(apiHandler);
      },
    },
  ],
  server: { host: "127.0.0.1" },
  build: { chunkSizeWarningLimit: 650 },
});
