// CLI entry: `npm run sim -- <command> [args]`.
import { writeFileSync } from "node:fs";
import { runBatch } from "./batch.ts";
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
  "       sim batch --games N --strategy <state>,<pkk> [--swap-seats] [--seed N] [--scenario scenario-a] [--package <dir>] [--out <csv>]",
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
} else if (command === "batch") {
  try {
    const valueFlags = ["--games","--strategy","--seed","--scenario","--package","--out"];
    for (let i = 1; i < args.length; i++) {
      const option = args[i] ?? "";
      if (option === "--swap-seats") continue;
      if (!valueFlags.includes(option)) throw new RangeError(`Unknown batch option ${option}`);
      const value = args[++i];
      if (value === undefined || value.startsWith("--")) throw new RangeError(`${option} needs a value`);
    }
    const names = flag("--strategy","concentration,sanctuary").split(",");
    if (names.length !== 2 || names.some(n => n === "")) throw new RangeError("strategy must name two policies separated by a comma");
    const loaded = loadPackage(readPackageDir(flag("--package",kurdish)));
    if (!loaded.ok) throw new Error("the package does not load");
    const report = runBatch(createEngine(coinHandlers),loaded.ruleset,{games: Number(flag("--games","10")),strategies: [names[0] ?? "",names[1] ?? ""],swapSeats: args.includes("--swap-seats"),seed: Number(flag("--seed","0")),scenario: flag("--scenario","scenario-a")});
    if (args.includes("--out")) writeFileSync(flag("--out","metrics.csv"),report.csv,"utf8");
    else console.log(report.csv.trimEnd());
    print({exitCode: 0,lines: report.summary});
  } catch (e) {print({exitCode: 1,lines: [`error: ${e instanceof Error ? e.message : String(e)}`]});}
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
