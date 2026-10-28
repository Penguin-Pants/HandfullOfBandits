// Code fingerprint (04 s10.3 item 3; DEC-19): one SHA-256 over all rules-execution code.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const engineDir = fileURLToPath(new URL("../engine/", import.meta.url));
const FOLDERS = ["core", "coin", "modules"];

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".ts") && !e.name.endsWith(".test.ts") ? [join(dir, e.name)] : []))
    .sort();
}

let cached: string | null = null;

/** Hash of every non-test engine source file in a fixed order, line endings normalized. */
export function codeFingerprint(): string {
  if (cached !== null) return cached;
  const hash = createHash("sha256");
  for (const folder of FOLDERS) {
    for (const file of files(join(engineDir, folder))) {
      hash.update(file.slice(engineDir.length).replaceAll("\\", "/"));
      hash.update(readFileSync(file, "utf8").replaceAll("\r\n", "\n"));
    }
  }
  cached = hash.digest("hex");
  return cached;
}
