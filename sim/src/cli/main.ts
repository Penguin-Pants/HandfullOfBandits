// CLI entry: `npm run sim -- <command> [args]`.
import { readFileSync, writeFileSync } from "node:fs";
import { runBatch } from "./batch.ts";
import { fileURLToPath } from "node:url";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, readPackageDir } from "../package/load.ts";
import { exportCommand } from "./export.ts";
import { fuzz } from "./fuzz.ts";
import { replayExperiment, replayFile, replaySession } from "./replay.ts";
import { runExperiment } from "./experiment.ts";
import { qualify } from "./qualification.ts";
import { ANALYSIS_VERSION, compareVersions, pct, renderComparisons, writeAnalysis } from "./experiment-analysis.ts";
import type { GameRecord } from "./experiment.ts";
import { archiveExperiment } from "./experiment-artifacts.ts";
import { join } from "node:path";
import { experimentCoverage } from "./experiment-coverage.ts";
import { resolvePlayer } from "./player-registry.ts";
import { CURRENT } from "./strategies/scenario-a.ts";
import { validateCommand } from "./validate.ts";
import { diffCommand } from "./diff.ts";

const usage = [
  "Usage: sim validate <package-dir>",
  "       sim diff <old-package-dir> <new-package-dir>",
  "       sim replay <file.json> [--package <dir>]",
  "       sim replay <sessionId> [--db <file>]",
  "       sim fuzz [--seeds N] [--package <dir>]",
  "       sim batch --games N --strategy <state>,<pkk> [--swap-seats] [--seed N] [--scenario scenario-a] [--package <dir>] [--out <csv>]",
  "       sim experiment run <manifest.json> --out <new-dir> | --out <interrupted-dir> --resume",
  "       sim experiment replay <experiment-dir> [--game <gameId>]",
  "       sim experiment analyze <experiment-dir>",
  "       sim experiment archive <experiment-dir>",
  "       sim experiment compare <experiment-dir> <experiment-dir>... --out <file.md>",
  "       sim experiment qualify <out.json> [--players <id,id>] [--package <dir>]",
  "       sim export <sessionId...> [--db <file>] [--with-states] [--format json|markdown|csv] [--out <file or folder>]",
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
} else if (command === "diff" && target !== undefined && args[2] !== undefined) {
  print(diffCommand(target, args[2]));
} else if (command === "replay" && target !== undefined) {
  print(target.endsWith(".json") ? replayFile(target, flag("--package", kurdish)) : replaySession(target, flag("--db", fileURLToPath(new URL("../../playtest.sqlite", import.meta.url)))));
} else if (command === "export" && target !== undefined) {
  const ids = args.slice(1).filter((a, i, all) => !a.startsWith("--") && !["--db", "--out", "--format"].includes(all[i - 1] ?? ""));
  const db = flag("--db", fileURLToPath(new URL("../../playtest.sqlite", import.meta.url)));
  const format = flag("--format", "json");
  if (format !== "json" && format !== "markdown" && format !== "csv") print({ exitCode: 1, lines: ["error: format must be json, markdown or csv"] });
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
} else if (command === "experiment") {
  const [, action, path] = args;
  const known = new Set(["--out", "--game", "--players", "--package"]);
  const bad = action === "compare" ? args.slice(3).filter((a) => a.startsWith("--") && !known.has(a)) : args.slice(3).filter((a, i, all) => a.startsWith("--") ? !known.has(a) && a !== "--resume" : !known.has(all[i - 1] ?? ""));
  if (bad.length > 0 || path === undefined) print({ exitCode: 2, lines: [usage] });
  else if (action === "run" && args.includes("--out")) {
    runExperiment(path, flag("--out", ""), { log: (line) => { console.log(line); }, resume: args.includes("--resume") })
      .then((o) => { print({ exitCode: 0, lines: [`experiment ${o.experimentHash} in ${o.dir}: ${JSON.stringify(o.byStatus)}`] }); })
      .catch((e: unknown) => { print({ exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] }); });
  } else if (action === "replay") {
    try {
      print(replayExperiment(path, args.includes("--game") ? flag("--game", "") : null));
    } catch (e) {
      print({ exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] });
    }
  }
  else if (action === "analyze") {
    try {
      const { path: out, analysis } = writeAnalysis(path, experimentCoverage(path));
      print({ exitCode: 0, lines: [`wrote ${out}`, ...analysis.conditions.map((c) => `${c.id}: State roster average ${pct(c.roster.mean)} [${pct(c.roster.low)}, ${pct(c.roster.high)}]`)] });
    } catch (e) {
      print({ exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] });
    }
  } else if (action === "compare" && args.includes("--out")) {
    const dirs = args.slice(2).filter((a, i, all) => a !== "--out" && all[i - 1] !== "--out");
    const results = dirs.flatMap((d) => JSON.parse(readFileSync(join(d, "results.json"), "utf8")) as GameRecord[]);
    const rows = compareVersions(results, 2000, 1);
    writeFileSync(flag("--out", "compare.md"), `# Paired player-version comparison\n\nSources: ${dirs.join(", ")}. Pairs share condition, opponent and game seed; bootstrap over seeds (2,000 draws, seed 1).\n\n${renderComparisons(rows)}`, "utf8");
    print({ exitCode: 0, lines: [renderComparisons(rows)] });
  } else if (action === "archive") {
    try {
      const ids = (JSON.parse(readFileSync(join(path, "schedule.json"), "utf8")) as { gameId: string }[]).map((j) => j.gameId);
      const review = (JSON.parse(readFileSync(join(path, `analysis-v${String(ANALYSIS_VERSION)}`, "analysis.json"), "utf8")) as { review: { all: string[] } }).review.all;
      const a = archiveExperiment(path, ids, review);
      print({ exitCode: 0, lines: [`archived ${String(a.games)} games (${String(a.bytes)} bytes); ${String(review.length)} review journals kept`] });
    } catch (e) {
      print({ exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] });
    }
  } else if (action === "qualify") {
    const loaded = loadPackage(readPackageDir(flag("--package", kurdish)));
    if (!loaded.ok) print({ exitCode: 1, lines: ["error: the package does not load"] });
    else {
      const ids = args.includes("--players") ? flag("--players", "").split(",") : CURRENT.map((f) => `${f.id}@${String(f.version)}`);
      const report = qualify(createEngine(coinHandlers), loaded.ruleset, ids.map(resolvePlayer));
      writeFileSync(path, `${JSON.stringify(report, null, 1)}\n`, "utf8");
      print({ exitCode: Object.values(report.players).every((p) => p.passed) ? 0 : 1, lines: [`suite ${report.suiteHash}`, ...Object.entries(report.players).map(([id, p]) => `${p.passed ? "PASS" : "FAIL"} ${id} (${String(p.applicable)} fixtures)${p.failures.length > 0 ? `: ${p.failures.join(", ")}` : ""}`)] });
    }
  }
  else print({ exitCode: 2, lines: [usage] });
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
