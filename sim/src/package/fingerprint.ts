// Code fingerprints (04 s10.3 item 3; DEC-19): one SHA-256 over a source tree. The engine
// fingerprint covers all rules-execution code: the engine entry files and engine/core, coin and
// modules. Experiments (19 s2) also fingerprint player and runner code with the same function.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("../", import.meta.url));

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".ts") && !e.name.endsWith(".test.ts") ? [join(dir, e.name)] : []))
    .sort();
}

/**
 * Hash of the non-test TypeScript files directly in `dir` (relative to src/) and, recursively,
 * in its `folders`; `only` limits the direct files. Paths are relative to `dir` with forward slashes; line endings are normalized.
 */
export function sourceFingerprint(dir: string, folders: readonly string[], only: readonly string[] | null = null): string {
  const root = join(srcDir, dir, "/");
  const hash = createHash("sha256");
  const direct = readdirSync(root, { withFileTypes: true }).filter((e) => e.isFile() && e.name.endsWith(".ts") && !e.name.endsWith(".test.ts") && (only === null || only.includes(e.name))).map((e) => join(root, e.name)).sort();
  for (const file of [...direct, ...folders.flatMap((folder) => files(join(root, folder)))]) {
    hash.update(file.slice(root.length).replaceAll("\\", "/"));
    hash.update(readFileSync(file, "utf8").replaceAll("\r\n", "\n"));
  }
  return hash.digest("hex");
}

let cached: string | null = null;

/** Hash of every non-test engine source file in a fixed order. */
export function codeFingerprint(): string {
  cached ??= sourceFingerprint("engine", ["core", "coin", "modules"]);
  return cached;
}
