// Experiment analysis and reports (19 s9, s10; 20 Phase 7). Per-cell State win rates with 95%
// Wilson intervals over completed games; incomplete games are counted separately and never as
// losses. The equal-weight roster average describes this roster only; its interval resamples
// shared game-seed groups across cells (one draw per seed, repeats stay grouped). Version
// comparisons use paired per-seed differences. Warning levels are review triggers, not pass/fail.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Coverage } from "./experiment-coverage.ts";
import type { Manifest } from "./experiment-manifest.ts";
import type { GameRecord } from "./experiment.ts";
import { SearchRng } from "./player-observation.ts";

export const ANALYSIS_VERSION = 2;
const Z95 = 1.959964;

/** 95% Wilson score interval for k successes in n trials; n = 0 gives [0, 1]. */
export function wilson(k: number, n: number, z = Z95): { readonly low: number; readonly high: number } {
  if (n === 0) return { low: 0, high: 1 };
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { low: Math.max(0, (c - r) / d), high: Math.min(1, (c + r) / d) };
}

function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return Number.NaN;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return (sorted[lo] ?? 0) + ((sorted[hi] ?? 0) - (sorted[lo] ?? 0)) * (i - lo);
}

const margin = (g: GameRecord, f: string): number => g.result?.standings.find((s) => s.faction === f)?.margin ?? Number.NaN;
/** State margin minus PKK margin; positive favors the State. */
export const marginDiff = (g: GameRecord): number => margin(g, "state") - margin(g, "pkk");
const cellKey = (g: Pick<GameRecord, "conditionId" | "state" | "pkk">): string => `${g.conditionId}|${g.state}|${g.pkk}`;

export interface CellSummary {
  readonly condition: string;
  readonly state: string;
  readonly pkk: string;
  readonly scheduled: number;
  readonly completed: number;
  /** Completed first plays (repeat 0): the trials behind the rate and interval. */
  readonly primary: number;
  /** Seed groups with repeated player seeds, and those whose winner changed. */
  readonly repeatSensitivity: { readonly groups: number; readonly winnerChanged: number };
  readonly incomplete: Readonly<Record<string, number>>;
  readonly stateWins: number;
  readonly stateWinRate: number;
  readonly ci: { readonly low: number; readonly high: number };
  readonly marginDiff: { readonly mean: number; readonly p10: number; readonly p50: number; readonly p90: number };
  readonly earlyWins: Readonly<Record<string, number>>;
  /** Completed games where the faction ended at or above its threshold. */
  readonly thresholdReached: Readonly<Record<string, number>>;
  /** Completed games where the faction ended with Harm above the limit. */
  readonly harmPenalty: Readonly<Record<string, number>>;
}

export function summarizeCells(results: readonly GameRecord[], thresholds: Readonly<Record<string, number>>, harmLimit: number): CellSummary[] {
  const groups = new Map<string, GameRecord[]>();
  for (const g of results) groups.set(cellKey(g), [...(groups.get(cellKey(g)) ?? []), g]);
  return [...groups.values()].map((games) => {
    const first = games[0] as GameRecord;
    const done = games.filter((g) => g.status === "complete");
    // Win rate and Wilson interval use one play per game seed: repeated player seeds share a deck
    // and are not independent trials (19 s7). Repeats appear only in the sensitivity count.
    const primary = done.filter((g) => g.repeat === 0);
    const wins = primary.filter((g) => g.result?.winner === "state").length;
    const groups = new Map<number, Set<string | null>>();
    for (const g of done) groups.set(g.seed, (groups.get(g.seed) ?? new Set()).add(g.result?.winner ?? null));
    const repeated = [...groups.entries()].filter(([seedId]) => done.filter((g) => g.seed === seedId).length > 1);
    const diffs = done.map(marginDiff).sort((a, b) => a - b);
    const incomplete: Record<string, number> = {};
    for (const g of games.filter((x) => x.status !== "complete")) incomplete[g.status] = (incomplete[g.status] ?? 0) + 1;
    const per = (pred: (g: GameRecord, f: string) => boolean): Record<string, number> => Object.fromEntries(["state", "pkk"].map((f) => [f, done.filter((g) => pred(g, f)).length]));
    return {
      condition: first.conditionId, state: first.state, pkk: first.pkk, scheduled: games.length, completed: done.length, primary: primary.length, incomplete,
      stateWins: wins, stateWinRate: primary.length === 0 ? Number.NaN : wins / primary.length, ci: wilson(wins, primary.length),
      repeatSensitivity: { groups: repeated.length, winnerChanged: repeated.filter(([, w]) => w.size > 1).length },
      marginDiff: { mean: diffs.reduce((a, b) => a + b, 0) / Math.max(1, diffs.length), p10: quantile(diffs, 0.1), p50: quantile(diffs, 0.5), p90: quantile(diffs, 0.9) },
      earlyWins: per((g, f) => g.result?.endReason === "victory check" && g.result.winner === f),
      thresholdReached: per((g, f) => (g.result?.standings.find((s) => s.faction === f)?.score ?? 0) >= (thresholds[f] ?? Infinity)),
      harmPenalty: per((g, f) => (g.result?.standings.find((s) => s.faction === f)?.harm ?? 0) > harmLimit),
    };
  });
}

/**
 * Equal-weight mean of per-cell State win rates and its 95% percentile bootstrap interval.
 * Each draw resamples game seeds (clusters) once and applies them to every cell.
 */
export function rosterAverage(results: readonly GameRecord[], samples: number, seed: number): { readonly mean: number; readonly low: number; readonly high: number; readonly cells: number } {
  const done = results.filter((g) => g.status === "complete");
  const cells = [...new Set(done.map(cellKey))];
  const bySeed = new Map<number, GameRecord[]>();
  for (const g of done) bySeed.set(g.seed, [...(bySeed.get(g.seed) ?? []), g]);
  const seeds = [...bySeed.keys()].sort((a, b) => a - b);
  const average = (draw: readonly number[]): number => {
    const wins = new Map<string, number>();
    const n = new Map<string, number>();
    for (const s of draw) for (const g of bySeed.get(s) ?? []) {
      n.set(cellKey(g), (n.get(cellKey(g)) ?? 0) + 1);
      if (g.result?.winner === "state") wins.set(cellKey(g), (wins.get(cellKey(g)) ?? 0) + 1);
    }
    const rates = cells.filter((c) => (n.get(c) ?? 0) > 0).map((c) => (wins.get(c) ?? 0) / (n.get(c) ?? 1));
    // No completed game: no estimate (NaN), never an apparent 0% or 100%.
    return rates.length === 0 ? Number.NaN : rates.reduce((a, b) => a + b, 0) / rates.length;
  };
  const rng = new SearchRng(seed);
  const draws = Array.from({ length: samples }, () => average(seeds.map(() => seeds[rng.int(seeds.length)] ?? 0))).filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
  return { mean: average(seeds), low: quantile(draws, 0.025), high: quantile(draws, 0.975), cells: cells.length };
}

/** Paired per-seed difference in State win indicator between two cells (A minus B), with bootstrap CI. */
export function pairedDifference(results: readonly GameRecord[], a: string, b: string, samples: number, seed: number): { readonly pairs: number; readonly mean: number; readonly low: number; readonly high: number } {
  const value = (key: string): Map<number, number> => {
    const m = new Map<number, number[]>();
    for (const g of results) if (cellKey(g) === key && g.status === "complete") m.set(g.seed, [...(m.get(g.seed) ?? []), g.result?.winner === "state" ? 1 : 0]);
    return new Map([...m].map(([s, xs]) => [s, xs.reduce((x, y) => x + y, 0) / xs.length]));
  };
  const va = value(a);
  const vb = value(b);
  const diffs = [...va.keys()].filter((s) => vb.has(s)).sort((x, y) => x - y).map((s) => (va.get(s) ?? 0) - (vb.get(s) ?? 0));
  const mean = (xs: readonly number[]): number => (xs.length === 0 ? Number.NaN : xs.reduce((x, y) => x + y, 0) / xs.length);
  if (diffs.length === 0) return { pairs: 0, mean: Number.NaN, low: Number.NaN, high: Number.NaN };
  const rng = new SearchRng(seed);
  const draws = Array.from({ length: samples }, () => mean(diffs.map(() => diffs[rng.int(diffs.length)] ?? 0))).sort((x, y) => x - y);
  return { pairs: diffs.length, mean: mean(diffs), low: quantile(draws, 0.025), high: quantile(draws, 0.975) };
}

export interface Warnings { readonly cell: readonly string[]; readonly roster: readonly string[]; readonly margin: readonly string[] }

/** Review triggers (19 s10): a cell at the cell level for either faction, a roster average above the level, recurring large margin gaps. */
export function reviewTriggers(cells: readonly CellSummary[], roster: { mean: number }, w: Manifest["analysis"]["warnings"]): Warnings {
  const level = w.cellWinPercent / 100;
  const cell = cells.filter((c) => c.completed > 0 && (c.stateWinRate >= level || 1 - c.stateWinRate >= level)).map((c) => `${c.state} vs ${c.pkk} (${c.condition}): State ${(100 * c.stateWinRate).toFixed(1)}%`);
  const r = w.rosterAveragePercent / 100;
  const rosterFlags = [...(roster.mean > r ? [`State roster average ${(100 * roster.mean).toFixed(1)}% > ${String(w.rosterAveragePercent)}%`] : []), ...(1 - roster.mean > r ? [`PKK roster average ${(100 * (1 - roster.mean)).toFixed(1)}% > ${String(w.rosterAveragePercent)}%`] : [])];
  const margin = cells.filter((c) => Math.abs(c.marginDiff.p50) >= w.marginGap).map((c) => `${c.state} vs ${c.pkk} (${c.condition}): median margin difference ${c.marginDiff.p50.toFixed(1)}`);
  return { cell, roster: rosterFlags, margin };
}

/** Five closest finishes, five largest gaps, five seeded-random games, every failure; deduplicated (19 s10). */
export function reviewSelection(results: readonly GameRecord[], seed: number): { readonly closest: string[]; readonly largest: string[]; readonly random: string[]; readonly failures: string[]; readonly all: string[] } {
  const done = results.filter((g) => g.status === "complete");
  const closest = [...done].sort((a, b) => Math.abs(marginDiff(a)) - Math.abs(marginDiff(b)) || a.gameId.localeCompare(b.gameId)).slice(0, 5).map((g) => g.gameId);
  const largest = [...done].sort((a, b) => Math.abs(marginDiff(b)) - Math.abs(marginDiff(a)) || a.gameId.localeCompare(b.gameId)).slice(0, 5).map((g) => g.gameId);
  const rng = new SearchRng(seed);
  const random = rng.shuffle(done.map((g) => g.gameId).sort()).slice(0, 5);
  const failures = results.filter((g) => g.status !== "complete").map((g) => g.gameId);
  return { closest, largest, random, failures, all: [...new Set([...closest, ...largest, ...random, ...failures])] };
}

export interface ScoringRoutes {
  readonly games: number;
  /** Mean final components over completed games. */
  readonly state: { readonly support: number; readonly legitimacy: number };
  readonly pkk: { readonly opposition: number; readonly bases: number };
  /** Winners' mean components. */
  readonly stateWinners: { readonly support: number; readonly legitimacy: number; readonly games: number };
  readonly pkkWinners: { readonly opposition: number; readonly bases: number; readonly games: number };
}

/** Final score composition of each completed game, from the replayed final state. */
export function scoringRoutes(coverage: Coverage, results: readonly GameRecord[]): ScoringRoutes {
  const rows = results.filter((g) => g.status === "complete").flatMap((g) => { const f = coverage.finals[g.gameId]; return f === undefined ? [] : [f]; });
  const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const sw = rows.filter((r) => r.winner === "state");
  const pw = rows.filter((r) => r.winner === "pkk");
  return {
    games: rows.length,
    state: { support: mean(rows.map((r) => r.support)), legitimacy: mean(rows.map((r) => r.legitimacy)) },
    pkk: { opposition: mean(rows.map((r) => r.opposition)), bases: mean(rows.map((r) => r.bases)) },
    stateWinners: { support: mean(sw.map((r) => r.support)), legitimacy: mean(sw.map((r) => r.legitimacy)), games: sw.length },
    pkkWinners: { opposition: mean(pw.map((r) => r.opposition)), bases: mean(pw.map((r) => r.bases)), games: pw.length },
  };
}

export interface Analysis {
  readonly analysisVersion: number;
  readonly experiment: string;
  readonly stage: string;
  readonly experimentHash: string;
  readonly scheduled: number;
  readonly byStatus: Readonly<Record<string, number>>;
  readonly conditions: readonly { readonly id: string; readonly cells: readonly CellSummary[]; readonly roster: ReturnType<typeof rosterAverage>; readonly warnings: Warnings }[];
  readonly review: ReturnType<typeof reviewSelection>;
  readonly routes: ScoringRoutes;
}

/** Analyze one experiment directory. Deterministic for the same artifacts. */
export function analyzeExperiment(dir: string, coverage: Coverage): Analysis {
  const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as Manifest;
  const identity = JSON.parse(readFileSync(join(dir, "identity.json"), "utf8")) as { experimentHash: string };
  const results = JSON.parse(readFileSync(join(dir, "results.json"), "utf8")) as GameRecord[];
  const byStatus: Record<string, number> = {};
  for (const g of results) byStatus[g.status] = (byStatus[g.status] ?? 0) + 1;
  const { samples, seed } = manifest.analysis.bootstrap;
  const included = results.filter((g) => !manifest.analysis.exclusions.includes(g.gameId));
  // Roster averages and their triggers use qualified-versus-qualified cells only (19 s4).
  const roles = existsSync(join(dir, "players.json")) ? JSON.parse(readFileSync(join(dir, "players.json"), "utf8")) as Record<string, { role: string }> : {};
  const qualified = (g: GameRecord): boolean => roles[g.state]?.role === "qualified" && roles[g.pkk]?.role === "qualified";
  return {
    analysisVersion: ANALYSIS_VERSION, experiment: manifest.id, stage: manifest.stage, experimentHash: identity.experimentHash, scheduled: results.length, byStatus,
    conditions: manifest.conditions.map((c) => {
      const mine = included.filter((g) => g.conditionId === c.id);
      const cells = summarizeCells(mine, manifest.expected.thresholds, manifest.expected.harmLimit);
      const roster = rosterAverage(mine.filter(qualified), samples, seed);
      return { id: c.id, cells, roster, warnings: reviewTriggers(cells, roster, manifest.analysis.warnings) };
    }),
    review: reviewSelection(included, seed),
    routes: scoringRoutes(coverage, included),
  };
}

/** Percent with one decimal; "n/a" for an unavailable (NaN) estimate. */
export const pct = (x: number): string => (Number.isNaN(x) ? "n/a" : `${(100 * x).toFixed(1)}%`);

/** Markdown report for one analysis, with its coverage ledger. */
export function renderReport(a: Analysis, coverage: Coverage | null): string {
  const out: string[] = [`# Experiment ${a.experiment} (${a.stage})`, "", `Experiment hash \`${a.experimentHash}\`. Analysis version ${String(a.analysisVersion)}.`, "", "## Completion", "", `Scheduled ${String(a.scheduled)} games: ${Object.entries(a.byStatus).map(([k, v]) => `${k} ${String(v)}`).join(", ")}. Incomplete games are not losses and are excluded from win rates.`, ""];
  for (const c of a.conditions) {
    out.push(`## Condition ${c.id}`, "", "State win rate per cell, 95% Wilson interval, completed games (n). Rows: State player; columns: PKK player.", "");
    const states = [...new Set(c.cells.map((x) => x.state))];
    const pkks = [...new Set(c.cells.map((x) => x.pkk))];
    out.push(`| State \\ PKK | ${pkks.join(" | ")} |`, `|---|${pkks.map(() => "---").join("|")}|`);
    for (const s of states) out.push(`| ${s} | ${pkks.map((p) => { const x = c.cells.find((y) => y.state === s && y.pkk === p); return x === undefined ? "" : `${pct(x.stateWinRate)} [${pct(x.ci.low)}, ${pct(x.ci.high)}] n=${String(x.primary)}${Object.keys(x.incomplete).length > 0 ? ` (+${String(x.scheduled - x.completed)} incomplete)` : ""}`; }).join(" | ")} |`);
    const rep = c.cells.reduce((n, x) => ({ groups: n.groups + x.repeatSensitivity.groups, changed: n.changed + x.repeatSensitivity.winnerChanged }), { groups: 0, changed: 0 });
    if (rep.groups > 0) out.push("", `Player-seed sensitivity: the winner changed in ${String(rep.changed)} of ${String(rep.groups)} repeated seed groups.`);
    out.push("", `Equal-weight roster average (this roster only, not a human win probability): State ${pct(c.roster.mean)} [${pct(c.roster.low)}, ${pct(c.roster.high)}] over ${String(c.roster.cells)} qualified-versus-qualified cells; seed-cluster bootstrap. Cell rates and intervals use the first play per seed.`, "");
    out.push("| Cell | Margin diff mean (p10 / p50 / p90) | Early wins S/P | Threshold reached S/P | Harm > 6 S/P |", "|---|---|---|---|---|");
    for (const x of c.cells) out.push(`| ${x.state} vs ${x.pkk} | ${x.marginDiff.mean.toFixed(1)} (${x.marginDiff.p10.toFixed(0)} / ${x.marginDiff.p50.toFixed(0)} / ${x.marginDiff.p90.toFixed(0)}) | ${String(x.earlyWins["state"])}/${String(x.earlyWins["pkk"])} | ${String(x.thresholdReached["state"])}/${String(x.thresholdReached["pkk"])} | ${String(x.harmPenalty["state"])}/${String(x.harmPenalty["pkk"])} |`);
    const w = [...c.warnings.cell, ...c.warnings.roster, ...c.warnings.margin];
    out.push("", "Review triggers (not balance pass/fail):", "", ...(w.length === 0 ? ["- none"] : w.map((x) => `- ${x}`)), "");
  }
  const r = a.routes;
  out.push("## Scoring routes", "", `Mean final components over ${String(r.games)} completed games: State Support ${r.state.support.toFixed(1)} + Legitimacy ${r.state.legitimacy.toFixed(1)}; PKK Opposition ${r.pkk.opposition.toFixed(1)} + domestic Bases ${r.pkk.bases.toFixed(1)}.`, `State winners (${String(r.stateWinners.games)}): Support ${r.stateWinners.support.toFixed(1)}, Legitimacy ${r.stateWinners.legitimacy.toFixed(1)}. PKK winners (${String(r.pkkWinners.games)}): Opposition ${r.pkkWinners.opposition.toFixed(1)}, Bases ${r.pkkWinners.bases.toFixed(1)}.`, "");
  out.push("## Review selection", "", `Closest: ${a.review.closest.join(", ")}`, "", `Largest gaps: ${a.review.largest.join(", ")}`, "", `Seeded random: ${a.review.random.join(", ")}`, "", `Failures: ${a.review.failures.length === 0 ? "none" : a.review.failures.join(", ")}`, "");
  if (coverage !== null) {
    const by = (st: string): number => coverage.ledger.filter((l) => l.status === st).length;
    out.push("## Coverage ledger", "", `${String(by("natural exposure"))} natural, ${String(by("reviewed fixture"))} fixture only, ${String(by("not applicable"))} not applicable, ${String(by("unresolved"))} unresolved.`, "", "| Mechanic | Area | Status | Games |", "|---|---|---|---|");
    for (const l of coverage.ledger) out.push(`| ${l.label} | ${l.area} | ${l.status} | ${String(l.games)} |`);
    const d = coverage.diagnostics;
    out.push("", "## Diagnostics", "", `Pass share: State ${pct(d.passShare["state"] ?? 0)}, PKK ${pct(d.passShare["pkk"] ?? 0)}. Longest First Eligible streak: ${String(d.maxFirstEligibleStreak)} cards. Mean unused Resources at the end: State ${(d.meanUnusedResources["state"] ?? 0).toFixed(1)}, PKK ${(d.meanUnusedResources["pkk"] ?? 0).toFixed(1)}. Games with a 3-Pass streak: ${JSON.stringify(d.passStreak3Games)}. Stop-rule flags: ${JSON.stringify(d.stopRuleFlags)}.`, "", `Boxes by faction: ${JSON.stringify(d.boxesByFaction)}`, "");
  }
  return `${out.join("\n")}\n`;
}

/** Write analysis.json, coverage.json and report.md under `<dir>/analysis-v<n>/`; never overwrite. */
export function writeAnalysis(dir: string, coverage: Coverage): { readonly path: string; readonly analysis: Analysis } {
  const analysis = analyzeExperiment(dir, coverage);
  const out = join(dir, `analysis-v${String(ANALYSIS_VERSION)}`);
  if (existsSync(out)) throw new Error(`${out} exists; analysis output is never overwritten`);
  mkdirSync(out);
  writeFileSync(join(out, "analysis.json"), `${JSON.stringify(analysis, null, 1)}\n`);
  writeFileSync(join(out, "coverage.json"), `${JSON.stringify(coverage, null, 1)}\n`);
  writeFileSync(join(out, "report.md"), renderReport(analysis, coverage));
  return { path: out, analysis };
}

export interface VersionComparison {
  readonly condition: string;
  /** The seat whose player differs between the two cells. */
  readonly seat: "state" | "pkk";
  readonly opponent: string;
  readonly newer: string;
  readonly older: string;
  /** Paired difference in State win indicator, newer minus older (positive: more State wins). */
  readonly stateWinDiff: ReturnType<typeof pairedDifference>;
}

/**
 * Paired comparisons of player versions over pooled results (19 s10: paired per-seed differences).
 * Two cells pair when they share condition, opponent and family and differ only in version.
 */
export function compareVersions(results: readonly GameRecord[], samples: number, seed: number): VersionComparison[] {
  const family = (id: string): string => id.replace(/@\d+$/, "");
  const cells = [...new Map(results.map((g) => [cellKey(g), g])).values()];
  const out: VersionComparison[] = [];
  for (const a of cells) for (const b of cells) {
    if (a.conditionId !== b.conditionId || cellKey(a) >= cellKey(b)) continue;
    for (const seat of ["state", "pkk"] as const) {
      const other = seat === "state" ? "pkk" : "state";
      if (a[other] !== b[other] || a[seat] === b[seat] || family(a[seat]) !== family(b[seat])) continue;
      const version = (id: string): number => Number(/@(\d+)$/.exec(id)?.[1] ?? 0);
      const [newer, older] = version(a[seat]) > version(b[seat]) ? [a, b] : [b, a];
      out.push({ condition: a.conditionId, seat, opponent: a[other], newer: newer[seat], older: older[seat], stateWinDiff: pairedDifference(results, cellKey(newer), cellKey(older), samples, seed) });
    }
  }
  return out.sort((x, y) => x.seat.localeCompare(y.seat) || x.newer.localeCompare(y.newer) || x.opponent.localeCompare(y.opponent));
}

/** Markdown table of version comparisons. */
export function renderComparisons(rows: readonly VersionComparison[]): string {
  const lines = ["| Seat | Newer | Older | Opponent | Paired seeds | State win diff (newer - older) | 95% CI |", "|---|---|---|---|---|---|---|"];
  for (const r of rows) {
    const d = r.stateWinDiff;
    lines.push(d.pairs === 0 ? `| ${r.seat} | ${r.newer} | ${r.older} | ${r.opponent} | 0 | n/a | n/a |` : `| ${r.seat} | ${r.newer} | ${r.older} | ${r.opponent} | ${String(d.pairs)} | ${(100 * d.mean).toFixed(1)} pts | [${(100 * d.low).toFixed(1)}, ${(100 * d.high).toFixed(1)}] |`);
  }
  return `${lines.join("\n")}\n`;
}
