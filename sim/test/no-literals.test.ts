import { ESLint } from "eslint";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

// P1-08: handlers hold no game numbers (04 s4.5). Lint rule local/no-game-literals scans
// engine/coin and engine/modules. Fixtures under test/fixtures/literals/src mirror sim/src.
// A file named bad-* must fail the rule. Any other file must pass.

const simRoot = fileURLToPath(new URL("..", import.meta.url));
const fixtureRoot = "test/fixtures/literals/src";

let errors: Map<string, string[]>;

beforeAll(async () => {
  const eslint = new ESLint({ cwd: simRoot, ignore: false });
  const results = await eslint.lintFiles([fixtureRoot]);
  errors = new Map(
    results.map((result) => [
      relative(join(simRoot, fixtureRoot), result.filePath).split(sep).join("/"),
      result.messages.filter((message) => message.ruleId === "local/no-game-literals").map((message) => message.message),
    ]),
  );
}, 60_000);

describe("game literal scan", () => {
  it("lints every fixture", () => {
    expect(errors.size).toBe(10);
  });

  it.each([
    "engine/coin/bad-bigint.ts",
    "engine/coin/bad-far-comment.ts",
    "engine/coin/bad-fraction.ts",
    "engine/coin/bad-negative.ts",
    "engine/coin/bad-three.ts",
    "engine/modules/bad-three.ts",
  ])("rejects %s", (file) => {
    expect(errors.get(file)).toHaveLength(1);
  });

  it("names the literal and the fix", () => {
    expect(errors.get("engine/coin/bad-three.ts")).toEqual([
      'Numeric literal 3 in a handler. Read it with param() (04 s4.5) or allow it with "// literal-ok: <reason>".',
    ]);
  });

  it("rejects an allow comment with no reason and the literal it fails to allow", () => {
    expect(errors.get("engine/coin/bad-no-reason.ts")).toEqual([
      "An allow comment needs a reason: // literal-ok: <reason>.",
      'Numeric literal 6 in a handler. Read it with param() (04 s4.5) or allow it with "// literal-ok: <reason>".',
    ]);
  });

  it.each(["engine/coin/ok-allowed.ts", "engine/coin/ok-counters.ts", "engine/core/ok-core.ts"])("accepts %s", (file) => {
    expect(errors.get(file)).toEqual([]);
  });
});
