import { ESLint } from "eslint";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

// T-ARCH: module boundaries (03 s5) and engine purity (05 s8).
// Fixtures under test/fixtures/arch/src mirror the sim/src layout.
// A file named bad-* must fail an architecture rule. Any other file must pass.

const simRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRoot = "test/fixtures/arch/src";

const archRules = new Set([
  "no-restricted-globals",
  "no-restricted-properties",
  "local/boundaries",
]);

let archErrors: Map<string, string[]>;

beforeAll(async () => {
  const eslint = new ESLint({ cwd: simRoot, ignore: false });
  const results = await eslint.lintFiles([fixtureRoot]);
  archErrors = new Map(
    results.map((result) => [
      relative(join(simRoot, fixtureRoot), result.filePath).split(sep).join("/"),
      result.messages
        .filter((message) => message.ruleId !== null && archRules.has(message.ruleId))
        .map((message) => message.message),
    ]),
  );
}, 60_000);

describe("architecture lint", () => {
  it("lints every fixture", () => {
    expect(archErrors.size).toBe(21);
  });

  it.each([
    "engine/core/bad-crypto-other.ts",
    "engine/core/bad-dynamic-template.ts",
    "engine/core/bad-fs.ts",
    "engine/core/bad-global-object.ts",
    "engine/core/bad-globals.ts",
    "engine/core/bad-random-import.ts",
    "engine/core/bad-reexport.ts",
    "engine/core/bad-upward.ts",
    "package/bad-module.ts",
    "shared/bad-folder.ts",
    "store/bad-dynamic.ts",
    "store/bad-unknown.ts",
    "store/bad-value.ts",
    "ui/bad-engine.ts",
  ])("rejects %s", (file) => {
    expect(archErrors.get(file)).not.toEqual([]);
  });

  it("reports each banned engine global", () => {
    expect(archErrors.get("engine/core/bad-globals.ts")).toHaveLength(3);
  });

  it.each([
    "engine/coin/ok.ts",
    "engine/core/hash-ok.ts",
    "engine/core/ok.ts",
    "engine/modules/registry.ts",
    "engine/modules/rule.ts",
    "package/registry-ok.ts",
    "store/type-ok.ts",
  ])("accepts %s", (file) => {
    expect(archErrors.get(file)).toEqual([]);
  });
});
