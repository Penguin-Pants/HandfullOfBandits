// Phases 6 and 7 (20): statistics, review selection, coverage ledger and checkpoint snapshots.
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { analyzeExperiment, pairedDifference, renderReport, reviewSelection, reviewTriggers, rosterAverage, summarizeCells, wilson, writeAnalysis } from "../src/cli/experiment-analysis.ts";
import { archiveExperiment, readJournal } from "../src/cli/experiment-artifacts.ts";
import { replayExperiment } from "../src/cli/replay.ts";
import { cpSync, readFileSync, rmSync } from "node:fs";
import { experimentCoverage, MECHANICS } from "../src/cli/experiment-coverage.ts";
import { runExperiment, type GameRecord } from "../src/cli/experiment.ts";
import { snapshot } from "../src/cli/game-runner.ts";
import { engine, ruleset } from "./board.ts";
import { devManifest, tempDir, writeManifest } from "./experiment-helpers.ts";

function game(cell: [string, string, string], seed: number, winner: string | null, status = "complete", diff = 0): GameRecord {
  return { gameId: `${cell.join("~")}~${String(seed)}`, conditionId: cell[0], state: cell[1], pkk: cell[2], seed, repeat: 0, status: status as GameRecord["status"], reason: "", commands: 1, startHash: "", finalHash: "", ms: 1, decisions: 1, transitions: 0, liveRejected: 0,
    result: status !== "complete" ? null : { winner, endReason: "final scoring", round: 2, labels: [], cardsPlayed: [], standings: [{ faction: "state", score: 40, harm: 0, margin: diff }, { faction: "pkk", score: 20, harm: 0, margin: 0 }] } };
}
const A: [string, string, string] = ["b", "S-A@1", "P-A@1"];
const B: [string, string, string] = ["b", "S-B@1", "P-A@1"];

describe("statistics (19 s10)", () => {
  it("Wilson intervals match known values, including zero and all wins", () => {
    const w = wilson(5, 10);
    expect(w.low).toBeCloseTo(0.2366, 4);
    expect(w.high).toBeCloseTo(0.7634, 4);
    expect(wilson(0, 20).low).toBe(0);
    expect(wilson(0, 20).high).toBeCloseTo(0.1611, 4);
    expect(wilson(20, 20).high).toBe(1);
    expect(wilson(20, 20).low).toBeCloseTo(0.8389, 4);
    expect(wilson(0, 0)).toEqual({ low: 0, high: 1 });
    // About seven points either side near 50% at 200 games (19 s10).
    const h = wilson(100, 200);
    expect(h.high - 0.5).toBeCloseTo(0.068, 2);
  });

  it("counts incomplete games separately and never as losses", () => {
    const [cell] = summarizeCells([game(A, 1, "state"), game(A, 2, "pkk"), game(A, 3, null, "timeout")], { state: 49, pkk: 30 }, 6);
    expect(cell).toMatchObject({ scheduled: 3, completed: 2, stateWins: 1, stateWinRate: 0.5, incomplete: { timeout: 1 } });
  });

  it("averages cells with equal weight and resamples seeds as clusters across cells", () => {
    // Cell A: State wins seeds 1-5 of 10; cell B: 10 of 10 on 20 seeds would weigh more if pooled.
    const results = [...Array.from({ length: 10 }, (_, i) => game(A, i + 1, i < 5 ? "state" : "pkk")), ...Array.from({ length: 10 }, (_, i) => game(B, i + 1, "state"))];
    const r = rosterAverage(results, 500, 1);
    expect(r.mean).toBeCloseTo(0.75, 10);
    expect(r.cells).toBe(2);
    expect(r.low).toBeLessThan(0.75);
    expect(r.high).toBeGreaterThan(0.75);
    // Perfectly seed-correlated cells: a draw of the same seeds moves both cells together.
    const correlated = [...Array.from({ length: 10 }, (_, i) => game(A, i + 1, i < 5 ? "state" : "pkk")), ...Array.from({ length: 10 }, (_, i) => game(B, i + 1, i < 5 ? "state" : "pkk"))];
    const c = rosterAverage(correlated, 500, 1);
    const independentHalfWidth = rosterAverage(correlated.slice(0, 10), 500, 1);
    expect(c.high - c.low).toBeCloseTo(independentHalfWidth.high - independentHalfWidth.low, 1);
  });

  it("is deterministic for the same analysis seed", () => {
    const results = Array.from({ length: 30 }, (_, i) => game(A, i + 1, i % 3 === 0 ? "state" : "pkk"));
    expect(rosterAverage(results, 300, 7)).toEqual(rosterAverage(results, 300, 7));
  });

  it("pairs per-seed outcomes when comparing two versions against the same opponent and seeds", () => {
    const results = [...Array.from({ length: 10 }, (_, i) => game(A, i + 1, i < 3 ? "state" : "pkk")), ...Array.from({ length: 10 }, (_, i) => game(B, i + 1, i < 8 ? "state" : "pkk"))];
    const d = pairedDifference(results, "b|S-B@1|P-A@1", "b|S-A@1|P-A@1", 500, 1);
    expect(d.pairs).toBe(10);
    expect(d.mean).toBeCloseTo(0.5, 10);
    expect(d.low).toBeGreaterThan(0);
  });

  it("raises the review triggers and selects reviewed games reproducibly, without duplicates", () => {
    const results = [...Array.from({ length: 10 }, (_, i) => game(A, i + 1, "state", "complete", 20 + i)), game(A, 11, null, "failed")];
    const cells = summarizeCells(results, { state: 49, pkk: 30 }, 6);
    const t = reviewTriggers(cells, rosterAverage(results, 200, 1), { cellWinPercent: 80, rosterAveragePercent: 60, marginGap: 10 });
    expect(t.cell).toHaveLength(1);
    expect(t.roster[0]).toContain("State roster average");
    expect(t.margin).toHaveLength(1);
    const sel = reviewSelection(results, 3);
    expect(sel).toEqual(reviewSelection(results, 3));
    expect(sel.closest[0]).toBe("b~S-A@1~P-A@1~1");
    expect(sel.largest[0]).toBe("b~S-A@1~P-A@1~10");
    expect(sel.failures).toEqual(["b~S-A@1~P-A@1~11"]);
    expect(new Set(sel.all).size).toBe(sel.all.length);
  });
});

describe("experiment analysis and coverage on real artifacts (20 Phases 6 and 7)", () => {
  let dir = "";
  beforeAll(async () => {
    const root = tempDir();
    dir = join(root, "run");
    await runExperiment(writeManifest(root, devManifest({ conditions: [{ id: "baseline", options: { hotPursuit: "allow", syriaMarchRestricted: "allow" } }, { id: "deny", options: { hotPursuit: "deny", syriaMarchRestricted: "deny" } }], seeds: { registry: "development", blocks: [{ from: 61, count: 4 }] } })), dir);
  }, 120000);

  it("reports each option condition separately and never pools them", () => {
    const a = analyzeExperiment(dir, experimentCoverage(dir));
    expect(a.conditions.map((c) => c.id)).toEqual(["baseline", "deny"]);
    for (const c of a.conditions) expect(c.cells.reduce((n, x) => n + x.scheduled, 0)).toBe(4);
    expect(a.scheduled).toBe(8);
    expect(analyzeExperiment(dir, experimentCoverage(dir))).toEqual(a);
  });

  it("writes the report once and refuses to overwrite it", () => {
    const { path } = writeAnalysis(dir, experimentCoverage(dir));
    expect(path).toContain("analysis-v1");
    expect(() => writeAnalysis(dir, experimentCoverage(dir))).toThrow(/never overwritten/);
  });

  it("builds a ledger with one entry per mechanic and only allowed categories", () => {
    const c = experimentCoverage(dir);
    expect(c.ledger.map((l) => l.id)).toEqual(MECHANICS.map((m) => m.id));
    for (const l of c.ledger) expect(["natural exposure", "reviewed fixture", "not applicable", "unresolved"]).toContain(l.status);
    expect(c.ledger.find((l) => l.id === "V-first-check-skipped")?.games).toBe(8);
    expect(renderReport(analyzeExperiment(dir, c), c)).toContain("## Coverage ledger");
  });

  it("checkpoint snapshots equal values derived by replay, and mandatory Always lines apply once", () => {
    const results = analyzeExperiment(dir, experimentCoverage(dir)).scheduled;
    expect(results).toBe(8);
    const job = (JSON.parse(JSON.stringify(readJournal(dir, "baseline~S-RANDOMv1~P-RANDOMv1~61~r0")[0])) as { job: { seed: number } }).job;
    let s = engine.start(ruleset, "scenario-a", job.seed).state;
    let checked = 0;
    let law = 0;
    for (const e of readJournal(dir, "baseline~S-RANDOMv1~P-RANDOMv1~61~r0")) {
      if (e.t !== "step") continue;
      const r = engine.apply(ruleset, s, e.command);
      expect.assert(r.ok);
      s = r.transition.state;
      law += r.transition.logEntries.filter((x) => x.kind === "EffectApplied" && x.data["effect"] === "transferPool").length;
      for (const c of e.checkpoints) { expect(c.data).toEqual(snapshot(ruleset, s)); checked++; }
    }
    expect(checked).toBeGreaterThanOrEqual(3);
    expect(law).toBeLessThanOrEqual(1);
  });

  it("archives every game so replay and coverage work without the per-game journals", () => {
    const coverage = experimentCoverage(dir);
    const ids = analyzeExperiment(dir, coverage).review.all;
    const schedule = (JSON.parse(readFileSync(join(dir, "schedule.json"), "utf8")) as { gameId: string }[]).map((j) => j.gameId);
    const copy = join(tempDir(), "copy");
    cpSync(dir, copy, { recursive: true });
    expect(archiveExperiment(copy, schedule, ids).games).toBe(8);
    expect(() => archiveExperiment(copy, schedule, ids)).toThrow(/never overwritten/);
    rmSync(join(copy, "games"), { recursive: true });
    expect(replayExperiment(copy).lines.at(-1)).toBe("8/8 games identical");
    const again = experimentCoverage(copy);
    expect(again.ledger).toEqual(coverage.ledger);
    expect(again.finals).toEqual(coverage.finals);
  });
});
