// UI build and dev server (DEC-03). `npm run ui` serves src/ui with /api proxied to the local server.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/ui",
  plugins: [react()],
  build: { outDir: "../../dist/ui", emptyOutDir: true },
  server: { host: "127.0.0.1", proxy: { "/api": "http://127.0.0.1:5174" } },
});
