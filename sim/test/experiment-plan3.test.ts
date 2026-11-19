// Audit Plan 3 (docs/audit/playtest-readiness-audit.md section 6.7): run-versus-run comparison (A1).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compareRuns, renderRunComparison } from "../src/cli/experiment-analysis.ts";
import { cardRows, renderCardCoverage } from "../src/cli/experiment-cards.ts";
import { cardRun } from "../src/cli/experiment-coverage.ts";
import { readJournal } from "../src/cli/experiment-artifacts.ts";
import { runExperiment } from "../src/cli/experiment.ts";
import { newManifest, parseManifest, runtimeIdentity, type Manifest } from "../src/cli/experiment-manifest.ts";
import type { GameRecord } from "../src/cli/experiment.ts";
import { devManifest, tempDir, writeManifest } from "./experiment-helpers.ts";
import { kurdish, kurdishDir } from "./kurdish-package.ts";

const main = fileURLToPath(new URL("../src/cli/main.ts", import.meta.url));
const runs = fileURLToPath(new URL("../experiments/runs/", import.meta.url));

function game(cell: [string, string, string], seed: number, winner: string | null, status = "complete", repeat = 0): GameRecord {
  return { gameId: `${cell.join("~")}~${String(seed)}~r${String(repeat)}`, conditionId: cell[0], state: cell[1], pkk: cell[2], seed, repeat, status: status as GameRecord["status"], reason: "", commands: 1, startHash: "", finalHash: "", ms: 1, decisions: 1, transitions: 0, liveRejected: 0,
    result: status !== "complete" ? null : { winner, endReason: "final scoring", round: 2, labels: [], cardsPlayed: [], standings: [] } };
}
const A: [string, string, string] = ["default", "S-A@1", "P-A@1"];
const B: [string, string, string] = ["default", "S-B@1", "P-A@1"];

describe("experiment compare --paired (audit Plan 3 A1)", () => {
  it("pairs games by cell and seed and ignores unpaired, incomplete and repeated plays", () => {
    const base = [game(A, 1, "pkk"), game(A, 2, "pkk"), game(A, 3, "state"), game(A, 4, "state"), game(A, 5, null, "failed")];
    const variant = [game(A, 1, "state"), game(A, 2, "state"), game(A, 3, "state"), game(A, 5, "state"), game(A, 1, "pkk", "complete", 1), game(A, 9, "state")];
    const c = compareRuns(base, variant, 500, 1);
    expect(c.cells).toHaveLength(1);
    expect(c.cells[0]).toMatchObject({ condition: "default", state: "S-A@1", pkk: "P-A@1", pairs: 3, variant: 1 });
    expect(c.cells[0]?.base).toBeCloseTo(1 / 3, 10);
    expect(c.cells[0]?.diff).toBeCloseTo(2 / 3, 10);
    expect(c.unpaired).toEqual({ base: 1, variant: 2 });
    expect(c.roster).toMatchObject({ cells: 1, seeds: 3 });
    expect(c.roster.mean).toBeCloseTo(2 / 3, 10);
    expect(c.roster.low).toBe(0); // a draw of seed 3 only
    expect(c.roster.high).toBe(1);
  });

  it("averages roster cells with equal weight and leaves excluded cells out of the roster only", () => {
    const base = [1, 2].flatMap((s) => [game(A, s, "pkk"), game(B, s, "pkk")]);
    const variant = [1, 2].flatMap((s) => [game(A, s, "state"), game(B, s, "pkk")]);
    expect(compareRuns(base, variant, 200, 1).roster.mean).toBeCloseTo(0.5, 10);
    const onlyA = compareRuns(base, variant, 200, 1, (g) => g.state === "S-A@1");
    expect(onlyA.roster).toMatchObject({ cells: 1, mean: 1 });
    expect(onlyA.cells).toHaveLength(2);
  });

  it("reports n/a, never a number, when no game pairs", () => {
    const c = compareRuns([game(A, 1, "state")], [game(A, 2, "state")], 200, 1);
    expect(c.cells).toEqual([]);
    expect(Number.isNaN(c.roster.mean)).toBe(true);
    expect(renderRunComparison(c, "a", "b", { samples: 200, seed: 1 })).toContain("**n/a pp [n/a, n/a]**");
  });

  it("is deterministic for the same bootstrap seed", () => {
    const base = Array.from({ length: 12 }, (_, i) => game(A, i, i % 3 === 0 ? "state" : "pkk"));
    const variant = Array.from({ length: 12 }, (_, i) => game(A, i, i % 2 === 0 ? "state" : "pkk"));
    expect(compareRuns(base, variant, 300, 7)).toEqual(compareRuns(base, variant, 300, 7));
  });

  // Doc 41 section 1 (scratch script, RNG not recorded): +16.7 [+10.4, +22.9], +10.8 [+5.0, +17.1],
  // +6.2 [+0.8, +11.7]. The means must match exactly. With 15 seeds of 16 cells a paired mean moves
  // in steps of 1/240 (0.42 pp), so each interval end may differ by at most one step.
  it.each([
    ["dd25-v4b", 40 / 240, 0.104, 0.229],
    ["dd25-v4b-thresholds-46-35", 26 / 240, 0.05, 0.171],
    ["dd25-v4b-variant-a", 15 / 240, 0.008, 0.117],
  ])("reproduces the doc 41 paired change of 43/38 against %s through the CLI", (base, mean, low, high) => {
    const out = join(tempDir(), "compare.md");
    const run = spawnSync(process.execPath, [main, "experiment", "compare", join(runs, base), join(runs, "dd25-v4b-thresholds-43-38"), "--paired", "--out", out], { encoding: "utf8" });
    expect(run.status, run.stderr + run.stdout).toBe(0);
    expect(readFileSync(out, "utf8").trimEnd()).toBe(run.stdout.trimEnd());
    const m = /Paired change: \*\*([+-][\d.]+) pp \[([+-][\d.]+), ([+-][\d.]+)\]\*\*/.exec(run.stdout);
    expect(m).not.toBeNull();
    const [x, lo, hi] = [m?.[1], m?.[2], m?.[3]].map((v) => Number(v) / 100);
    expect(Math.abs((x ?? 0) - mean)).toBeLessThanOrEqual(0.0005 + 1e-9); // printed to 0.1 pp
    expect(Math.abs((lo ?? 0) - low)).toBeLessThanOrEqual(1 / 240 + 0.0005);
    expect(Math.abs((hi ?? 0) - high)).toBeLessThanOrEqual(1 / 240 + 0.0005);
    expect(run.stdout).toContain("over 16 qualified-versus-qualified cells and 15 seeds");
  }, 60000);

  it("rejects --paired with other than two directories", () => {
    const run = spawnSync(process.execPath, [main, "experiment", "compare", join(runs, "dd25-v4b"), "--paired", "--out", join(tempDir(), "x.md")], { encoding: "utf8" });
    expect(run.status).toBe(2);
  });
});

/** A study file: a manifest with no package hash, no expected values and no supersedes. */
function study(overrides: Partial<Manifest> = {}): Record<string, unknown> {
  const draft: Record<string, unknown> = { ...devManifest({ seeds: { registry: "development", blocks: [{ from: 41, count: 1 }] }, ...overrides }), package: { dir: kurdishDir } };
  delete draft["expected"];
  delete draft["supersedes"];
  return draft;
}

describe("experiment new (audit Plan 3 A2)", () => {
  it("fills the package hash, thresholds, Harm limit and fingerprints, and the manifest runs with no manual hash", () => {
    const dir = tempDir("hob study ");
    const draft = writeManifest(dir, study(), "study.json");
    mkdirSync(join(dir, "manifests"));
    const out = join(dir, "manifests", "made.json");
    const made = spawnSync(process.execPath, [main, "experiment", "new", draft, "--out", out], { encoding: "utf8" });
    expect(made.status, made.stderr + made.stdout).toBe(0);
    const m = parseManifest(readFileSync(out, "utf8"));
    const runtime = runtimeIdentity();
    expect(m.package.hash).toBe(kurdish.hash);
    expect(m.package.dir).not.toContain("\\");
    expect(m.expected).toEqual({ thresholds: { state: 49, pkk: 32 }, harmLimit: 6, engineFingerprint: runtime.engineFingerprint, playerFingerprint: runtime.playerFingerprint });
    expect(m.supersedes).toBeNull();
    const run = spawnSync(process.execPath, [main, "experiment", "run", out, "--out", join(dir, "run")], { encoding: "utf8" });
    expect(run.status, run.stderr + run.stdout).toBe(0);
    expect(run.stdout).toContain("\"complete\":1");
  }, 120000);

  it("keeps values the study file gives, including null fingerprints", () => {
    const dir = tempDir();
    const m = newManifest(writeManifest(dir, { ...study(), expected: { engineFingerprint: null, playerFingerprint: null } }, "study.json"), join(dir, "m.json"));
    expect(m.expected).toMatchObject({ engineFingerprint: null, playerFingerprint: null, harmLimit: 6 });
  });

  it("writes nothing for a study that fails validation, and never overwrites a file", () => {
    const dir = tempDir();
    const bad = writeManifest(dir, study({ matchups: [{ state: "P-RANDOM@1", pkk: "S-RANDOM@1" }] }), "bad.json");
    expect(() => newManifest(bad, join(dir, "bad-out.json"))).toThrow(/not the state seat/);
    expect(existsSync(join(dir, "bad-out.json"))).toBe(false);
    const good = writeManifest(dir, study(), "good.json");
    newManifest(good, join(dir, "out.json"));
    expect(() => newManifest(good, join(dir, "out.json"))).toThrow(/already exists/);
    expect(() => newManifest(writeManifest(dir, { ...study(), package: { dir: kurdishDir, hash: "0".repeat(64) } }, "stale.json"), join(dir, "stale-out.json"))).toThrow(/does not match/);
  });

  it("accepts a manifest with no supersedes field as null", () => {
    const m: Record<string, unknown> = { ...devManifest() };
    delete m["supersedes"];
    expect(parseManifest(JSON.stringify(m)).supersedes).toBeNull();
  });
});

describe("experiment cards (audit Plan 3 A3)", () => {
  it("names the card side a command plays and nothing for other commands", () => {
    const before = { deck: { currentCard: "DK-001" } } as unknown as Parameters<typeof cardRun>[1];
    expect(cardRun({ type: "ChooseEvent", faction: "pkk", side: "shaded" }, before)).toBe("DK-001 shaded");
    expect(cardRun({ type: "PlayPivotal", faction: "pkk", card: "DK-015" }, before)).toBe("DK-015 pivotal");
    expect(cardRun({ type: "Pass", faction: "pkk" }, before)).toBeNull();
  });

  it("lists every package card side once, counts Propaganda by reveal and never invents a no-effect count for a reveal", () => {
    const cards = Object.values(kurdish.ruleset.cards);
    const rows = cardRows(cards, { "DK-001 unshaded": { runs: 3, noEffect: 3 }, "DK-001 shaded": { runs: 2, noEffect: 1 }, "DK-015 pivotal": { runs: 4, noEffect: 0 } }, { "DK-016": 5 });
    expect(rows).toHaveLength(189); // 90 cards x 2 sides, 4 Pivotals, 5 Propaganda (audit section 3.1)
    expect(rows.find((r) => r.id === "DK-016")).toMatchObject({ side: "propaganda", runs: 5, noEffect: null });
    expect(rows.find((r) => r.id === "DK-015")).toMatchObject({ side: "pivotal", runs: 4 });
    const text = renderCardCoverage(rows, ["run"], 1);
    expect(text).toContain("Event sides that ran: 2 of 180, 1 with an effect at least once. Pivotals played: 1 of 4.");
    expect(text).toContain("DK-098 pivotal");
  });

  it("counts every Event and Pivotal play of a real run through the CLI", async () => {
    const dir = tempDir("hob cards ");
    const run = join(dir, "run");
    await runExperiment(writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 51, count: 2 }] } })), run);
    const out = join(dir, "cards.md");
    const cli = spawnSync(process.execPath, [main, "experiment", "cards", run, "--out", out], { encoding: "utf8" });
    expect(cli.status, cli.stderr + cli.stdout).toBe(0);
    const games = (JSON.parse(readFileSync(join(run, "results.json"), "utf8")) as GameRecord[]).map((g) => g.gameId);
    const commands = games.flatMap((id) => readJournal(run, id).flatMap((e) => (e.t === "step" ? [e.command] : [])));
    const table = readFileSync(out, "utf8").split("\n").filter((l) => /^\| DK-/.test(l)).map((l) => l.split("|").map((x) => x.trim()));
    const sum = (side: (s: string) => boolean): number => table.filter((c) => side(c[5] ?? "")).reduce((n, c) => n + Number(c[6]), 0);
    expect(table).toHaveLength(189);
    expect(commands.filter((c) => c.type === "ChooseEvent").length).toBeGreaterThan(0);
    expect(sum((s) => s === "unshaded" || s === "shaded")).toBe(commands.filter((c) => c.type === "ChooseEvent").length);
    expect(sum((s) => s === "pivotal")).toBe(commands.filter((c) => c.type === "PlayPivotal").length);
    expect(sum((s) => s === "propaganda")).toBeGreaterThan(0);
    expect(spawnSync(process.execPath, [main, "experiment", "cards", run, "--paired", "--out", out], { encoding: "utf8" }).status).toBe(2);
    for (const c of table) if (c[7] !== "n/a") expect(Number(c[7])).toBeLessThanOrEqual(Number(c[6]));
  }, 120000);
});
