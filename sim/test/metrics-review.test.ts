// P4-03 metrics review (06 s3.12, s4; DEC-34). Accept: the table matches the research 12 s4 logging
// sheet items 6 to 15. Item 13 is the 07 s4.4 Propaganda prompt answer (P4-14).
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { exportCommand } from "../src/cli/export.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { exportCsv } from "../src/export/csv.ts";
import { exportJson, type CoinSimExport } from "../src/export/json.ts";
import { metricsTable } from "../src/export/metrics.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob-metrics-"));
const file = join(dir, "store.sqlite");
const db = openStore(file);
const service = new SessionService(db, join(kurdishDir, "..", ".."));
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

/** Scenario A to the end with the scripted policy: two Propaganda rounds. */
function playScenarioA(seed: number): string {
  const { sessionId, head } = service.createSession({ dir: kurdishDir, scenarioId: "scenario-a", seed, name: `metrics ${String(seed)}` });
  let state = head.state;
  let headId = head.actionId;
  while (state.ended === null) {
    const res = service.submit(sessionId, scriptedPolicy(engine, ruleset, state), headId);
    state = res.head.state;
    headId = res.actionId;
  }
  return sessionId;
}
const sessionA = playScenarioA(3);
const data = exportJson(db, { sessionIds: [sessionA], withStates: false, appVersion: "0.1.0", exportedAt: "2026-11-05T00:00:00Z" });
const table = metricsTable(data);
const keys = table.columns.map((c) => c.key);

describe("P4-03 metrics table: research 12 s4 items 6 to 15", () => {
  it("has one row per Propaganda round of the session", () => {
    expect(table.rows.map((r) => r["round"])).toEqual([1, 2]);
  });

  it("has columns for every per-round sheet item", () => {
    expect([...new Set(table.columns.map((c) => c.item))].filter((i) => i > 0)).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const named = ["resources.state", "resources.pkk", "legitimacy", "europe", "emergency_rule", "state_step_choice", "posture.syria", "posture.kdp", "posture.puk", "leadership",
      "legal_space", "offices", "closure_filings", "successor_returns", "ceasefire", "restraint_broken.state", "restraint_broken.pkk",
      "harm.state", "harm.pkk", "markers.disputedHarm", "markers.coercion", "markers.displacement.new", "markers.displacement.old", "markers.reception", "markers.covert",
      "score.state", "score.pkk", "threshold.state", "threshold.pkk", "margin.state", "margin.pkk", "action_use", "available.troops", "available.guerrilla"];
    expect(keys).toEqual(expect.arrayContaining(named));
    // Never on the map: no always-zero column beside the closure case flag and Successor track.
    expect(keys.filter((k) => /^markers\.(capability|momentum|closureCase|successor)/.test(k))).toEqual([]);
  });

  it("rows hold the RoundMetrics values of the round", () => {
    for (const row of table.rows) {
      const m = data.metrics.find((x) => x["propaganda_round"] === row["round"])?.["data"] as Record<string, Record<string, unknown>>;
      expect(row["score.state"]).toBe(m["scores"]?.["state"]);
      expect(row["threshold.pkk"]).toBe(m["thresholds"]?.["pkk"]);
      expect(row["margin.pkk"]).toBe(m["margins"]?.["pkk"]);
      expect(row["available.guerrilla"]).toBe(m["available"]?.["guerrilla"]);
      expect(row["legal_space"]).toBe(m["legalSpace"]);
      expect(row["leadership"]).toBe("present");
    }
  });

  it("counts the round's action use only (item 14)", () => {
    const total = (row: Readonly<Record<string, unknown>>): number => String(row["action_use"]).split("; ").reduce((n, x) => n + Number(x.split(" ").at(-1)), 0);
    const factionActions = data.actions.filter((a) => a["status"] === "committed" && a["faction"] !== null);
    // Every action before the last metrics action falls in exactly one round; an Op with an SA counts twice.
    expect(table.rows.reduce((n, r) => n + total(r), 0)).toBeGreaterThanOrEqual(factionActions.filter((a) => Number(a["seq"]) <= Number(data.actions.find((x) => x["action_id"] === data.metrics.at(-1)?.["action_id"])?.["seq"])).length);
    expect(String(table.rows[1]?.["action_use"])).not.toBe("");
  });
});

/** Two rounds with stored round events, as the store holds them (06 s3.4 to s3.6). */
function synthetic(): CoinSimExport {
  const entry = (data: Record<string, unknown>) => ({ kind: "EffectApplied", data });
  // Hashes chain each action to the one before; the undone a6 is off the path to m2.
  const action = (id: string, seq: number, status: string, extra: Record<string, unknown> = {}) => ({
    action_id: id, session_id: "s", branch_id: "b", seq, branch_seq: seq, state_hash_before: seq === 1 ? null : `h${String(seq - 1)}`, state_hash_after: `h${String(seq)}`,
    status, faction: null, kind: "advance", commands: [], entries: [], ...extra,
  });
  const choice = (phase: string, c: Record<string, unknown>) => [{ payload: { type: "PropagandaChoice", phase, choice: c } }];
  const row = (round: number, actionId: string) => ({ session_id: "s", branch_id: "b", propaganda_round: round, action_id: actionId, data: { round, scores: { state: 1, pkk: 2 }, markers: { office: { default: 2 } } } });
  return {
    exportMeta: { schema: "coin-sim-export/1", appVersion: "0", exportedAt: "", filter: { sessionIds: ["s"], withStates: false } },
    packages: [], sessions: [], branches: [], categories: [], states: [], annotations: [], index: { annotations: [] },
    actions: [
      action("a1", 1, "committed", { faction: "pkk", kind: "cardChoice", commands: [{ payload: { type: "ChooseOperation", plan: { op: "pkk.coerce", sa: null } } }] }),
      action("a2", 2, "committed", { commands: choice("legitimacy", { emergencyStep: "ohal" }) }),
      // A filing moves Legal Space Open to Prosecuted: not a successor return.
      action("a3", 3, "committed", { entries: [entry({ effect: "setTrack", track: "legalSpace", before: "open", after: "prosecuted" })] }),
      // The round's metrics action belongs to its round only.
      action("m1", 4, "committed", { entries: [entry({ effect: "setFlag", flag: "closureCase", before: false, after: true })] }),
      // A case already pending is not a new filing.
      action("a5", 5, "committed", { entries: [entry({ effect: "setTrack", track: "legalSpace", before: "banned", after: "prosecuted" }), entry({ effect: "setFlag", flag: "closureCase", before: true, after: true })] }),
      action("a6", 6, "undone", { entries: [entry({ effect: "setFlag", flag: "closureCase", before: false, after: true })] }),
      action("m2", 7, "committed", { state_hash_before: "h5" }),
    ],
    metrics: [row(1, "m1"), row(2, "m2")],
  };
}

describe("P4-03 round events from committed actions (items 7, 9, 14)", () => {
  const rows = metricsTable(synthetic()).rows;
  it("puts each event in its own round", () => {
    expect(rows.map((r) => [r["state_step_choice"], r["closure_filings"], r["successor_returns"], r["action_use"]])).toEqual([
      ["ohal", 1, 0, "pkk.coerce 1"],
      ["none", 0, 1, ""],
    ]);
  });
  it("reads Offices from the marker counts and leaves out metrics rows of undone actions", () => {
    const undone = synthetic();
    const actions = undone.actions.map((a) => (a["action_id"] === "m2" ? { ...a, status: "undone" } : a));
    expect(metricsTable({ ...undone, actions }).rows.map((r) => r["offices"])).toEqual([2]);
  });
});

describe("P4-14 item 13: Propaganda prompt answers", () => {
  // The synthetic rows have no campaign in their data, so the notes carry none either.
  const note = (id: string, actionId: string, text: string, round: number, categories = ["legal-politics-signal"]) => ({ annotation_id: id, session_id: "s", action_id: actionId, text, category_ids: categories, context: { propaganda_round: round } });
  const column = (annotations: Record<string, unknown>[]) => metricsTable({ ...synthetic(), annotations }).rows.map((r) => r["legal_politics_signal"]);
  it("fills each round from the signal note of that round, null without one", () => {
    expect(column([note("n1", "a3", "y", 1), note("n2", "a5", "n", 2)])).toEqual(["y", "n"]);
    expect(column([note("n1", "a5", "n", 2)])).toEqual([null, "n"]);
    expect(column([])).toEqual([null, null]);
  });
  it("counts an answer given after the round's metrics action (Redeploy and Reset follow Agitation)", () => {
    expect(column([note("n1", "m1", "y", 1)])).toEqual(["y", null]);
  });
  it("ignores notes of other categories, other rounds and non y/n text", () => {
    expect(column([note("n1", "a3", "y", 1, ["balance"]), note("n2", "a5", "maybe", 2), note("n3", "a3", "y", 3)])).toEqual([null, null]);
  });
  it("ignores an answer on another branch of the same round", () => {
    const base = synthetic();
    const other = { ...base, actions: [...base.actions, { action_id: "x1", session_id: "s", branch_id: "c", seq: 8, branch_seq: 1, state_hash_before: "h2", state_hash_after: "hx", status: "committed", faction: null, kind: "advance", commands: [], entries: [] }], branches: [{ branch_id: "b", forked_from_action_id: null }, { branch_id: "c", forked_from_action_id: "a2" }] };
    expect(metricsTable({ ...other, annotations: [note("n1", "x1", "y", 1)] }).rows.map((r) => r["legal_politics_signal"])).toEqual([null, null]);
  });
  it("the latest answer in a round wins", () => {
    expect(column([note("n1", "a3", "y", 1), note("n2", "a3", "n", 1)])).toEqual(["n", null]);
  });
});

describe("P4-03 CSV export and API", () => {
  it("metrics.csv has a header of column keys and one row per round", () => {
    const lines = exportCsv(data).metrics.split("\r\n").filter((l) => l !== "");
    expect(lines[0]?.split(",")).toEqual(keys);
    expect(lines).toHaveLength(1 + table.rows.length);
  });

  it("the CLI writes metrics.csv into the folder", () => {
    db.pragma("wal_checkpoint(TRUNCATE)");
    const out = join(dir, "csv out");
    expect(exportCommand([sessionA], file, false, out, "0.1.0", "csv").exitCode).toBe(0);
    expect(readFileSync(join(out, "metrics.csv"), "utf8").split("\r\n")[0]).toBe(keys.join(","));
  });

  it("GET /api/metrics returns the table for the listed sessions, or all sessions", async () => {
    const one = await app.inject({ method: "GET", url: `/api/metrics?sessions=${sessionA}` });
    expect(one.statusCode).toBe(200);
    expect((one.json<{ rows: unknown[] }>()).rows).toHaveLength(2);
    const sessionB = playScenarioA(4);
    const all = await app.inject({ method: "GET", url: "/api/metrics" });
    expect(new Set(all.json<{ rows: { session_id: string }[] }>().rows.map((r) => r.session_id))).toEqual(new Set([sessionA, sessionB]));
  });

  it("GET /api/metrics.csv sends the CSV as a download; an unknown session is 404", async () => {
    const res = await app.inject({ method: "GET", url: `/api/metrics.csv?sessions=${sessionA}` });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain("metrics.csv");
    expect(res.body.split("\r\n")[0]).toBe(keys.join(","));
    expect((await app.inject({ method: "GET", url: "/api/metrics?sessions=nope" })).statusCode).toBe(404);
  });
});

describe("P4-14 item 13 in a played session", () => {
  it("each answer lands in its own round, before or after the metrics action", () => {
    const { sessionId, head } = service.createSession({ dir: kurdishDir, scenarioId: "scenario-a", seed: 5, name: "signal" });
    const focus = { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null } as const;
    const phases = ruleset.sequence.propagandaPhases;
    // Round 1: answered at Redeploy (after the metrics action, which follows Agitation). Round 2: at Agitation (before it).
    const answerAt: Record<number, string> = { 1: "redeploy", 2: "agitation" };
    const answers: Record<number, string> = { 1: "y", 2: "n" };
    const done = new Set<number>();
    let state = head.state;
    let headId = head.actionId;
    while (state.ended === null) {
      const round = state.turn.propagandaRound;
      if (state.turn.phase === "propaganda" && phases[state.turn.step] === answerAt[round] && !done.has(round)) {
        done.add(round);
        service.annotate(sessionId, { anchor: "executed", actionId: headId, text: answers[round] ?? "", categoryIds: ["legal-politics-signal"], focus });
      }
      const res = service.submit(sessionId, scriptedPolicy(engine, ruleset, state), headId);
      state = res.head.state;
      headId = res.actionId;
    }
    expect([...done]).toEqual([1, 2]);
    const played = metricsTable(exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "2026-11-05T00:00:00Z" }));
    expect(played.rows.map((r) => r["legal_politics_signal"])).toEqual(["y", "n"]);
  });
});
