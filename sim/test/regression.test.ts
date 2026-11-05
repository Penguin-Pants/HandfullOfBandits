// P4-06 regression cases from notes and runs against a target version (07 s9; 09 s7). Accept: same,
// changed and incompatible results reported. Also the per-round metric diff of two branches (09 s6).
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { scriptedPolicy } from "../src/cli/play.ts";
import { checkMetrics, compareCommand, createCase, createCommand, listCommand, metricFacts, reportLines, runCase, runCommand, type CaseInputs, type Expectation } from "../src/cli/regression.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { listEntries } from "../src/store/repos/log-entries.ts";
import { getCase, listRuns } from "../src/store/repos/regression.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob regression "));
const dbFile = join(dir, "store.sqlite");
const db = openStore(dbFile);
const service = new SessionService(db, join(kurdishDir, "..", ".."));
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function step(sessionId: string): string {
  const { head } = service.session(sessionId);
  return service.submit(sessionId, scriptedPolicy(engine, ruleset, head.state), head.actionId, head.stateHash).actionId;
}
const note = (sessionId: string, actionId: string | null, text: string): string =>
  service.annotate(sessionId, { anchor: actionId === null ? "session" : "executed", actionId, text, categoryIds: [], focus: { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null } });
const roundsDone = (sessionId: string): number => (db.prepare("SELECT COUNT(*) AS n FROM metrics WHERE session_id = ?").get(sessionId) as { n: number }).n;

/** A package copy with text replacements in one file. */
function variant(name: string, file: string, edits: readonly [string, string][]): string {
  const out = join(dir, name);
  cpSync(kurdishDir, out, { recursive: true });
  const path = join(out, file);
  let text = readFileSync(path, "utf8");
  for (const [from, to] of edits) {
    if (!text.includes(from)) throw new Error(`${file} has no ${from}`);
    text = text.replaceAll(from, to);
  }
  writeFileSync(path, text);
  return out;
}

// Scenario A until one Propaganda round is done, then to the next action that changes a space.
const { sessionId, head: setup } = service.createSession({ dir: kurdishDir, scenarioId: "scenario-a", seed: 3, name: "regression" });
const played: string[] = [];
while (roundsDone(sessionId) === 0) played.push(step(sessionId));
do played.push(step(sessionId));
while (!listEntries(db, played.at(-1) ?? "").some((e) => e.kind === "EffectApplied" && e.data.includes('"space"')));
const target = played.at(-1) ?? "";
const noteId = note(sessionId, target, "Rally felt too cheap\nmore text");
const made = createCase(db, noteId, null);

describe("P4-06 case from a note (07 s9 items 1 and 2)", () => {
  it("stores the inputs, the command range to the note's action and the label", () => {
    const c = getCase(db, made.caseId);
    const session = service.session(sessionId).session;
    expect(c).toMatchObject({ source_session_id: sessionId, source_action_id: target, source_annotation_id: noteId, package_hash: session.package_hash, seed: 3, scenario_id: "scenario-a", options: session.options, label: "Rally felt too cheap" });
    expect(JSON.parse(c?.command_range ?? "")).toEqual({ first: `${played[0] ?? ""}-C1`, last: expect.stringMatching(new RegExp(`^${target}-C\\d+$`)) as unknown });
    expect(made.commands).toBeGreaterThanOrEqual(played.length);
  });

  it("takes expectations from the stored run: the action's state changes and effects, every round and no outcome before the end", () => {
    const list = JSON.parse(getCase(db, made.caseId)?.expectations ?? "[]") as Expectation[];
    const types = new Set(list.map((e) => e.type));
    expect(types).toEqual(new Set(["stateFact", "logFact", "metric"]));
    expect(list.filter((e) => e.type === "metric" && e.key === "scores.state").map((e) => (e.type === "metric" ? e.round : 0))).toEqual([1]);
    expect(made.expectations).toBe(list.length);
  });

  it("refuses a note with no action and the setup action", () => {
    expect(() => createCase(db, note(sessionId, null, "general"), null)).toThrow(/links no action/);
    expect(() => createCase(db, note(sessionId, setup.actionId, "setup"), null)).toThrow(/setup action/);
    expect(() => createCase(db, "nope", null)).toThrow(/No note nope/);
  });
});

describe("P4-06 run against a target version (09 s7.2)", () => {
  it("reports same under the unchanged package and stores the run", () => {
    const { exitCode, lines } = runCommand(made.caseId, kurdishDir, dbFile);
    expect(lines[1]).toBe("same");
    expect(exitCode).toBe(0);
    expect(listRuns(db, made.caseId).map((r) => r.outcome)).toEqual(["same"]);
  });

  it("reports changed with the per-round metric diff, old against new", () => {
    const next = variant("threshold", join("scenarios", "scenario-a.yaml"), [["  state: 49\n", "  state: 47\n"]]);
    const { exitCode, lines } = runCommand(made.caseId, next, dbFile);
    expect(exitCode).toBe(1);
    expect(lines[1]).toBe("changed");
    expect(lines).toContainEqual(expect.stringMatching(/^ {2}~ round 1 margins\.state: -?\d+ to -?\d+$/));
    expect(lines.some((l) => l.includes("scores.state"))).toBe(false);
    const run = listRuns(db, made.caseId).at(-1);
    expect(run?.outcome).toBe("changed");
    expect(JSON.parse(run?.diff ?? "{}")).toMatchObject({ deckOrderDiffers: false, extraRounds: [] });
  });

  it("reports incompatible at the first command the target rules reject, with its violations, and never forces it", () => {
    const next = variant("broke", join("scenarios", "scenario-a.yaml"), [["resources.state: 12", "resources.state: 0"], ["resources.pkk: 5", "resources.pkk: 0"]]);
    const { exitCode, lines } = runCommand(made.caseId, next, dbFile);
    expect(exitCode).toBe(1);
    expect(lines[1]).toBe("incompatible");
    expect(lines[2]).toMatch(/^ {2}command .+-C\d+ is not valid under the target rules$/);
    expect(lines.some((l) => l.startsWith("  violation "))).toBe(true);
    const run = listRuns(db, made.caseId).at(-1);
    expect(run?.outcome).toBe("incompatible");
    expect(JSON.parse(run?.first_failure ?? "{}")).toMatchObject({ commandId: expect.stringMatching(/-C\d+$/) as unknown });
  });

  it("replays only to the stored last command, as a pending action can grow after the case", () => {
    const short = createCase(db, noteId, "short");
    const previous = played.at(-2) ?? "";
    const last = (db.prepare("SELECT command_id FROM commands WHERE action_id = ? ORDER BY n DESC LIMIT 1").get(previous) as { command_id: string }).command_id;
    db.prepare("UPDATE regression_cases SET command_range = ? WHERE case_id = ?").run(JSON.stringify({ first: `${played[0] ?? ""}-C1`, last }), short.caseId);
    expect(runCommand(short.caseId, kurdishDir, dbFile).lines[1]).toBe("changed");
    db.prepare("UPDATE regression_cases SET command_range = ? WHERE case_id = ?").run(JSON.stringify({ first: null, last: "nope" }), short.caseId);
    expect(runCommand(short.caseId, kurdishDir, dbFile).lines).toEqual([`error: Case ${short.caseId}: command nope is not on the path to ${target}.`]);
    db.prepare("DELETE FROM regression_runs WHERE case_id = ?").run(short.caseId);
    db.prepare("DELETE FROM regression_cases WHERE case_id = ?").run(short.caseId);
  });

  it("names a package that does not load", () => {
    const broken = join(dir, "broken");
    cpSync(kurdishDir, broken, { recursive: true });
    writeFileSync(join(broken, "parameters.yaml"), "- {id: harm.limit\n");
    const { exitCode, lines } = runCommand(made.caseId, broken, dbFile);
    expect(exitCode).toBe(1);
    expect(lines[0]).toBe(`error: ${broken} does not load`);
  });

  it("lists the case with its latest outcome; unknown cases and stores are errors", () => {
    expect(listCommand(dbFile).lines).toEqual([`${made.caseId} incompatible ${target} Rally felt too cheap`]);
    expect(runCommand("nope", kurdishDir, dbFile)).toEqual({ exitCode: 1, lines: ["error: No case nope."] });
    expect(createCommand(noteId, join(dir, "none.sqlite"), null).lines).toEqual([`error: no store at ${join(dir, "none.sqlite")}`]);
  });
});

describe("P4-06 runCase branches", () => {
  const stored = (): CaseInputs => ({ scenarioId: "scenario-a", seed: 3, options: {}, steps: [], expectations: [], deck: engine.start(ruleset, "scenario-a", 3).state.deck });

  it("is incompatible when the scenario or an option is missing", () => {
    expect(runCase(engine, ruleset, { ...stored(), scenarioId: "scenario-z" })).toMatchObject({ outcome: "incompatible", firstFailure: { commandId: null, reason: "missing scenario scenario-z" } });
    expect(runCase(engine, ruleset, { ...stored(), options: { nope: 1 } })).toMatchObject({ outcome: "incompatible", firstFailure: { reason: "missing option nope in scenario scenario-a" } });
  });

  it("flags a changed deck order as its own result", () => {
    const r = runCase(engine, ruleset, { ...stored(), deck: { piles: [] } });
    expect(r).toMatchObject({ outcome: "same", diff: { deckOrderDiffers: true } });
    expect(reportLines(r)).toEqual(["same", "  deck order differs"]);
  });

  it("checks state, log and outcome facts", () => {
    const expectations: Expectation[] = [
      { type: "stateFact", path: "tracks.legitimacy", value: 99 },
      { type: "logFact", kind: "EffectApplied", ruleRef: "x", data: {} },
      { type: "outcome", winner: "pkk", labels: [] },
    ];
    const r = runCase(engine, ruleset, { ...stored(), expectations });
    expect(r.outcome).toBe("changed");
    expect(r.diff.mismatches.map((m) => [m.expected.type, m.actual])).toEqual([["stateFact", 10], ["logFact", null], ["outcome", null]]);
  });

  it("reports an engine exception as error", () => {
    const bad = { ...ruleset, scenarios: { ...ruleset.scenarios, "scenario-a": { ...ruleset.scenarios["scenario-a"], campaigns: 5 } } } as unknown as typeof ruleset;
    expect(runCase(engine, bad, stored())).toMatchObject({ outcome: "error", firstFailure: { commandId: null } });
  });
});

describe("P4-06 per-round metric diff (09 s6 compare two branches)", () => {
  const m = (round: number, state: number) => ({ round, scores: { state, pkk: 1 }, margins: {}, harm: {}, postures: {} });

  it("lists the differing keys per round and the rounds only the new run has", () => {
    expect(checkMetrics(metricFacts([m(1, 5)]), [m(1, 6), m(2, 7)])).toEqual({
      mismatches: [{ expected: { type: "metric", round: 1, key: "scores.state", value: 5 }, actual: 6 }],
      extraRounds: [2],
    });
    expect(checkMetrics(metricFacts([m(1, 5), m(2, 5)]), [m(1, 5)]).mismatches.map((x) => [x.expected.type === "metric" ? x.expected.key : "", x.actual])).toContainEqual(["scores.state", null]);
  });

  it("compares the stored rounds on two paths", () => {
    expect(compareCommand(target, target, dbFile)).toEqual({ exitCode: 0, lines: ["same"] });
    const early = played[0] ?? "";
    expect(compareCommand(early, target, dbFile).lines).toEqual(["changed", "  + rounds 1 (not in the old run)"]);
  });
});
