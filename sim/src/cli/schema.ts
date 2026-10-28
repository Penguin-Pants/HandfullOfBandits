// Writes game-packages/_schema/*.schema.json from the Zod package schemas (11 P1-04). Run: `make schema`.
// The folder holds generated files only, so files no schema produces are removed.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { jsonSchemaFiles } from "../package/schema/index.ts";

const dir = new URL("../../../game-packages/_schema/", import.meta.url);
const files = jsonSchemaFiles();

mkdirSync(dir, { recursive: true });
for (const name of readdirSync(dir)) {
  if (!(name in files)) rmSync(new URL(name, dir));
}
for (const [name, text] of Object.entries(files)) {
  writeFileSync(new URL(name, dir), text);
}
console.log(`Wrote ${String(Object.keys(files).length)} files to ${fileURLToPath(dir)}`);
