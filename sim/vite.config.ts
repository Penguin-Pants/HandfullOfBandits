// UI build and dev server (DEC-03). `npm run ui` serves src/ui with /api proxied to the local server.
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/ui",
  publicDir: fileURLToPath(new URL("../game-packages/kurdish-coin/0.1.0/map", import.meta.url)),
  plugins: [react()],
  build: { outDir: "../../dist/ui", emptyOutDir: true },
  server: { host: "127.0.0.1", proxy: { "/api": "http://127.0.0.1:5174" } },
});
