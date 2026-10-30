// CLI entry: `npm run sim -- <command> [args]`.
import { fileURLToPath } from "node:url";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, readPackageDir } from "../package/load.ts";
import { exportCommand } from "./export.ts";
import { fuzz } from "./fuzz.ts";
import { replayFile, replaySession } from "./replay.ts";
import { validateCommand } from "./validate.ts";

const usage = [
  "Usage: sim validate <package-dir>",
  "       sim replay <file.json> [--package <dir>]",
  "       sim replay <sessionId> [--db <file>]",
  "       sim fuzz [--seeds N] [--package <dir>]",
  "       sim export <sessionId...> [--db <file>] [--with-states] [--format json|markdown] [--out <file>]",
].join("\n");
const args = process.argv.slice(2);
const [command, target] = args;
const flag = (name: string, fallback: string): string => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? fallback) : fallback;
};
const kurdish = fileURLToPath(new URL("../../../game-packages/kurdish-coin/0.1.0", import.meta.url));

function print(result: { exitCode: number; lines: readonly string[] }): void {
  for (const line of result.lines) console.log(line);
  process.exitCode = result.exitCode;
}

if (command === "validate" && target !== undefined) {
  print(validateCommand(target));
} else if (command === "replay" && target !== undefined) {
  print(target.endsWith(".json") ? replayFile(target, flag("--package", kurdish)) : replaySession(target, flag("--db", fileURLToPath(new URL("../../playtest.sqlite", import.meta.url)))));
} else if (command === "export" && target !== undefined) {
  const ids = args.slice(1).filter((a, i, all) => !a.startsWith("--") && !["--db", "--out", "--format"].includes(all[i - 1] ?? ""));
  const db = flag("--db", fileURLToPath(new URL("../../playtest.sqlite", import.meta.url)));
  const format = flag("--format", "json");
  if (format !== "json" && format !== "markdown") print({ exitCode: 1, lines: ["error: format must be json or markdown"] });
  else print(exportCommand(ids, db, args.includes("--with-states"), args.includes("--out") ? flag("--out", "export.json") : null, "0.1.0", format));
} else if (command === "fuzz") {
  const loaded = loadPackage(readPackageDir(flag("--package", kurdish)));
  if (!loaded.ok) {
    print({ exitCode: 1, lines: ["error: the package does not load"] });
  } else {
    const report = fuzz(createEngine(coinHandlers), loaded.ruleset, "s0", Number(flag("--seeds", "50")), () => performance.now());
    const lines = [`${String(report.games)} games, ${String(report.steps)} commands, apply mean ${report.applyMs.mean.toFixed(2)} ms, max ${report.applyMs.max.toFixed(2)} ms`];
    for (const f of report.failures) lines.push(`FAIL seed ${String(f.seed)}: ${f.reason}\n${JSON.stringify(f.commands)}`);
    print({ exitCode: report.failures.length === 0 ? 0 : 1, lines });
  }
} else {
  console.error(usage);
  process.exitCode = 2;
}
