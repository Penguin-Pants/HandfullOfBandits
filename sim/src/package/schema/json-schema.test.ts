import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { jsonSchemaFiles, packageFileSchemas } from "./index.ts";

// P1-04 step 2: committed JSON Schema files match the Zod schemas. Fix: `make schema`.
const dir = new URL("../../../../game-packages/_schema/", import.meta.url);

describe("JSON Schema files", () => {
  const files = jsonSchemaFiles();

  it("has one file per package schema", () => {
    expect(Object.keys(files).sort()).toEqual(Object.keys(packageFileSchemas).map((f) => `${f}.schema.json`).sort());
  });

  it("matches the committed files in game-packages/_schema", () => {
    expect(readdirSync(dir).sort()).toEqual(Object.keys(files).sort());
    for (const [name, text] of Object.entries(files)) {
      // Windows checkouts may turn LF into CRLF.
      expect(readFileSync(new URL(name, dir), "utf8").replaceAll("\r\n", "\n"), name).toBe(text);
    }
  });

  it("rejects unknown keys in the editor too", () => {
    const manifest = JSON.parse(files["manifest.schema.json"] ?? "{}") as { additionalProperties?: unknown };
    expect(manifest.additionalProperties).toBe(false);
  });
});
