// `sim setup-sheet <package-dir> [--variant <name>] [--scenario <id>] [--out <file.md>]` (audit Plan 4 V4):
// the printable setup sheet of a package scenario or of a saved variant, in the rule 10.2 layout.
import { writeFileSync } from "node:fs";
import { derive } from "../engine/coin/derive.ts";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { createEngine } from "../engine/index.ts";
import { setupSheet } from "../export/setup-sheet.ts";
import { loadPackage, packageContent, readPackageDir } from "../package/load.ts";
import { loadVariant } from "../package/variant.ts";
import { formatIssue } from "./validate.ts";

/** The sheet text, or the load errors. The start position is the engine's (seed 0: setup does not draw). */
export function setupSheetCommand(dir: string, variant: string | null, scenarioId: string, out: string | null): { readonly exitCode: number; readonly lines: readonly string[] } {
  const loaded = variant === null ? loadPackage(readPackageDir(dir)) : loadVariant(dir, variant);
  if (!loaded.ok) return { exitCode: 1, lines: [`error: ${dir}${variant === null ? "" : ` variant ${variant}`} does not load`, ...loaded.issues.filter((i) => i.level === "error").map(formatIssue)] };
  const scenario = loaded.ruleset.scenarios[scenarioId];
  if (scenario === undefined) return { exitCode: 1, lines: [`error: unknown scenario "${scenarioId}"`] };
  const { state } = createEngine(coinHandlers).start(loaded.ruleset, scenarioId, 0);
  const view = derive(loaded.ruleset, state);
  const text = setupSheet(packageContent(loaded.data), loaded.hash, scenarioId, { available: scenario.available, scores: view.scores, margins: view.margins, harm: view.harm, control: view.control });
  if (out === null) return { exitCode: 0, lines: [text.trimEnd()] };
  writeFileSync(out, text, { flag: "wx" });
  return { exitCode: 0, lines: [`wrote ${out}`] };
}
