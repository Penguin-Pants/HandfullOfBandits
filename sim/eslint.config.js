import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import local from "./eslint/boundaries.js";

const testFiles = ["**/*.test.ts"];

export default defineConfig(
  { ignores: ["node_modules", "test/fixtures"] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // T-ARCH: module boundaries (03 s5).
  {
    files: ["**/src/**/*.ts"],
    ignores: testFiles,
    plugins: { local },
    rules: { "local/boundaries": "error" },
  },
  // T-ARCH: engine purity (05 s8). No clock, random, timers, network, files or process.
  {
    files: ["**/src/engine/**/*.ts"],
    ignores: testFiles,
    rules: {
      "no-restricted-globals": [
        "error",
        ...[
          "Date",
          "performance",
          "setTimeout",
          "setInterval",
          "setImmediate",
          "clearTimeout",
          "clearInterval",
          "clearImmediate",
          "queueMicrotask",
          "fetch",
          "XMLHttpRequest",
          "WebSocket",
          "process",
          "crypto",
          "require",
          // Global objects give a second path to every name above.
          "globalThis",
          "global",
          "self",
          "window",
        ].map((name) => ({ name, message: "Banned in engine code (05 s8)." })),
      ],
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "Use the seeded RNG in engine core (05 s8)." },
      ],
    },
  },
);
