// `sim setup-sheet <package-dir> [--variant <name>] [--scenario <id>] [--out <file.md>]` (audit Plan 4 V4):
// the printable setup sheet of a package scenario or of a saved variant, in the rule 10.2 layout.
// `--rules <prototype-rules.md>` writes the package's Starting Position into rule 10.2 (P4-2; make print).
import { readFileSync, writeFileSync } from "node:fs";
import { derive } from "../engine/coin/derive.ts";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { createEngine } from "../engine/index.ts";
import { setupSheet } from "../export/setup-sheet.ts";
import { loadPackage, packageContent, readPackageDir } from "../package/load.ts";
import { loadVariant } from "../package/variant.ts";
import { formatIssue } from "./validate.ts";

const RULE = "## 10.2 Starting Position";

/** Rules text with the rule 10.2 body (heading to the next heading) set to the sheet's Starting Position. */
function withRule(rules: string, sheet: string): string | null {
  const eol = rules.includes("\r\n") ? "\r\n" : "\n";
  const lf = rules.replaceAll("\r\n", "\n");
  const at = lf.indexOf(`\n${RULE}\n`);
  if (at < 0) return null;
  const from = at + RULE.length + 2;
  const next = lf.indexOf("\n## ", from);
  const body = (sheet.split("## Starting Position\n")[1] ?? "").trim();
  return `${lf.slice(0, from)}\n${body}\n${next < 0 ? "" : lf.slice(next)}`.replaceAll("\n", eol);
}

/**
 * The sheet text, or the load errors. The start position is the engine's (seed 0: setup does not draw).
 * With `rules`, the sheet's Starting Position replaces the rule 10.2 body of that file instead.
 */
export function setupSheetCommand(dir: string, variant: string | null, scenarioId: string, out: string | null, rules: string | null = null): { readonly exitCode: number; readonly lines: readonly string[] } {
  const loaded = variant === null ? loadPackage(readPackageDir(dir)) : loadVariant(dir, variant);
  if (!loaded.ok) return { exitCode: 1, lines: [`error: ${dir}${variant === null ? "" : ` variant ${variant}`} does not load`, ...loaded.issues.filter((i) => i.level === "error").map(formatIssue)] };
  const scenario = loaded.ruleset.scenarios[scenarioId];
  if (scenario === undefined) return { exitCode: 1, lines: [`error: unknown scenario "${scenarioId}"`] };
  const { state } = createEngine(coinHandlers).start(loaded.ruleset, scenarioId, 0);
  const view = derive(loaded.ruleset, state);
  const text = setupSheet(packageContent(loaded.data), loaded.hash, scenarioId, { available: scenario.available, scores: view.scores, margins: view.margins, harm: view.harm, control: view.control });
  if (rules !== null) {
    const before = readFileSync(rules, "utf8");
    const after = withRule(before, text);
    if (after === null) return { exitCode: 1, lines: [`error: ${rules} has no "${RULE}" section`] };
    if (after === before) return { exitCode: 0, lines: [`${rules} is up to date`] };
    writeFileSync(rules, after);
    return { exitCode: 0, lines: [`wrote ${rules}`] };
  }
  if (out === null) return { exitCode: 0, lines: [text.trimEnd()] };
  writeFileSync(out, text, { flag: "wx" });
  return { exitCode: 0, lines: [`wrote ${out}`] };
}
