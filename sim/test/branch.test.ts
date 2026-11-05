// P4-04 branch from a past action (06 s3.3, s6 item 6; 09 s7). Accept: the new branch plays and the
// original branch stays intact.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { scriptedPolicy } from "../src/cli/play.ts";
import { exportJson, validateExport } from "../src/export/json.ts";
import { exportMarkdown } from "../src/export/markdown.ts";
import { metricsTable } from "../src/export/metrics.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { lineage, listActions } from "../src/store/repos/actions.ts";
import { createBranch } from "../src/store/repos/sessions.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob-branch-"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(kurdishDir, "..", ".."));
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

/** One scripted step on the session head. */
function step(sessionId: string): string {
  const { head } = service.session(sessionId);
  return service.submit(sessionId, scriptedPolicy(engine, ruleset, head.state), head.actionId, head.stateHash).actionId;
}
const ids = (sessionId: string): string[] => service.history(sessionId).map((h) => h.action.action_id);
const rows = (branchId: string): string => JSON.stringify(listActions(db, branchId));

const { sessionId, head: setup } = service.createSession({ dir: kurdishDir, scenarioId: "scenario-a", seed: 3, name: "branch" });
const main = service.session(sessionId).session.current_branch_id;
const [a2, a3, a4, a5] = [step(sessionId), step(sessionId), step(sessionId), step(sessionId)];
const mainBefore = rows(main);
const a3Hash = service.history(sessionId).find((h) => h.action.action_id === a3)?.action.state_hash_after;

describe("branch from a past action (P4-04)", () => {
  const forked = service.branch(sessionId, a3, a5);

  it("adds a branch row and moves the head to that action's state (09 s7)", () => {
    const { session, head } = service.session(sessionId);
    expect(session.current_branch_id).toBe(forked.branchId);
    expect(head.actionId).toBe(a3);
    expect(head.stateHash).toBe(a3Hash);
    expect(db.prepare("SELECT forked_from_action_id, label FROM branches WHERE branch_id = ?").get(forked.branchId)).toEqual({ forked_from_action_id: a3, label: "branch 2" });
    expect(ids(sessionId)).toEqual([setup.actionId, a2, a3]);
  });

  it("plays on the new branch and leaves the original branch intact", () => {
    const b1 = step(sessionId);
    const b2 = step(sessionId);
    expect(ids(sessionId)).toEqual([setup.actionId, a2, a3, b1, b2]);
    expect(listActions(db, forked.branchId).map((a) => [a.action_id, a.branch_seq])).toEqual([[b1, 1], [b2, 2]]);
    expect(rows(main)).toBe(mainBefore);
    const { session, ruleset: rules } = service.session(sessionId);
    expect(service.replayCheck(session, rules)).toBeNull();
    expect(service.replayCheck({ ...session, head_action_id: a5 }, rules)).toBeNull();
    expect(a4).not.toBe(b1);
  });

  it("undoes back to the fork point, never into the original branch", () => {
    const { head } = service.session(sessionId);
    const first = service.undo(sessionId, head.actionId, head.stateHash);
    const second = service.undo(sessionId, first.head, first.state.stateHash);
    expect(second.head).toBe(a3);
    expect(() => service.undo(sessionId, a3, a3Hash)).toThrow(/Nothing to undo/);
    expect(rows(main)).toBe(mainBefore);
  });

  it("branches from an undone action and keeps its own past (06 s6 item 6)", () => {
    // Branch 2 now holds b1 and b2, both undone; b2 follows b1.
    const [b1, b2] = listActions(db, forked.branchId).map((a) => a.action_id);
    const { head } = service.session(sessionId);
    service.branch(sessionId, b2 ?? "", head.actionId, head.stateHash);
    expect(ids(sessionId)).toEqual([setup.actionId, a2, a3, b1, b2]);
    const { session, ruleset: rules } = service.session(sessionId);
    expect(service.replayCheck(session, rules)).toBeNull();
    step(sessionId);
    expect(service.replayCheck(service.session(sessionId).session, rules)).toBeNull();
  });

  it("refuses a stale head, an unknown action, another session's action and a read-only session", () => {
    const { head } = service.session(sessionId);
    expect(() => service.branch(sessionId, a2, a5)).toThrow(/moved on/);
    expect(() => service.branch(sessionId, "nope", head.actionId, head.stateHash)).toThrow(/Unknown action/);
    const other = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 1, name: "other" });
    expect(() => service.branch(sessionId, other.head.actionId, head.actionId, head.stateHash)).toThrow(/Unknown action/);
    db.prepare("UPDATE sessions SET status = 'readOnly' WHERE session_id = ?").run(other.sessionId);
    expect(() => service.branch(other.sessionId, other.head.actionId, other.head.actionId)).toThrow(/read-only/);
  });

  it("refuses a pending action: its open Operation would continue on the original branch", () => {
    db.prepare("UPDATE actions SET status = 'pending' WHERE action_id = ?").run(a4);
    try {
      expect(() => createBranch(db, { sessionId, actionId: a4, result: null })).toThrow(/pending/);
    } finally {
      db.prepare("UPDATE actions SET status = 'committed' WHERE action_id = ?").run(a4);
    }
  });

  it("branches over HTTP and exports every branch with resolved references", async () => {
    const { head } = service.session(sessionId);
    const res = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/branches`, payload: { actionId: a2, headActionId: head.actionId, headStateHash: head.stateHash } });
    expect(res.statusCode).toBe(201);
    expect(service.session(sessionId).head.actionId).toBe(a2);
    const bad = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/branches`, payload: { actionId: a2 } });
    expect(bad.statusCode).toBe(400);
    const data = exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "2026-11-05T00:00:00Z" });
    expect(data.branches).toHaveLength(4);
    expect(validateExport(data)).toEqual([]);
    expect(validateExport({ ...data, branches: [...data.branches, { branch_id: "x", session_id: sessionId, forked_from_action_id: "gone" }] })).not.toEqual([]);
  });
});

describe("Markdown export of a branched session", () => {
  it("prints the card order of the current branch and the action log by branch", () => {
    const md = exportMarkdown(exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "2026-11-05T00:00:00Z" }));
    const reveals = service.history(sessionId).filter((h) => h.action.status !== "undone").flatMap((h) => h.entries.filter((e) => e.kind === "CardRevealed"))
      .map((e) => JSON.parse(e.data) as { card: string; setAside?: boolean }).filter((d) => d.setAside !== true).map((d) => d.card);
    expect(md).toContain(`Card order: ${reveals.join(", ")}.\n`);
    expect(md).toContain("#### Branch main\n");
    expect(md).toContain(`#### Branch branch 2, from ${a3}\n`);
    expect(md.indexOf(`[${a4};`)).toBeLessThan(md.indexOf("#### Branch branch 2"));
  });
});

describe("lineage", () => {
  const action = (id: string, branch: string, seq: number, before: string | null, after: string) => ({ action_id: id, branch_id: branch, branch_seq: seq, state_hash_before: before, state_hash_after: after });
  it("walks back by state hash inside a branch, then into the action a branch forked from", () => {
    const actions = [action("A1", "m", 1, null, "h1"), action("A2", "m", 2, "h1", "h2"), action("A3", "m", 3, "h2", "h3"), action("A4", "m", 4, "h1", "h4"), action("B1", "b", 1, "h3", "h5")];
    const branches = [{ branch_id: "m", forked_from_action_id: null }, { branch_id: "b", forked_from_action_id: "A3" }];
    expect(lineage(actions, branches, "B1").map((a) => a.action_id)).toEqual(["A1", "A2", "A3", "B1"]);
    expect(lineage(actions, branches, "A4").map((a) => a.action_id)).toEqual(["A1", "A4"]);
  });
  it("throws when an action has no path to setup", () => {
    expect(() => lineage([action("A2", "m", 2, "h1", "h2")], [{ branch_id: "m", forked_from_action_id: null }], "A2")).toThrow(/no path/);
  });
});

describe("metrics round window on a branch", () => {
  it("counts the actions of the round played before the fork", () => {
    const run = service.createSession({ dir: kurdishDir, scenarioId: "scenario-a", seed: 3, name: "metrics branch" });
    const fork = [step(run.sessionId), step(run.sessionId), step(run.sessionId)].at(-1) ?? "";
    while (service.session(run.sessionId).head.state.ended === null) step(run.sessionId);
    const { head } = service.session(run.sessionId);
    service.branch(run.sessionId, fork, head.actionId, head.stateHash);
    while (service.session(run.sessionId).head.state.ended === null) step(run.sessionId);
    const table = metricsTable(exportJson(db, { sessionIds: [run.sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "2026-11-05T00:00:00Z" }));
    const round1 = table.rows.filter((r) => r["round"] === 1);
    // The scripted policy plays the same from the same state, so both branches have the same round 1.
    expect(round1).toHaveLength(2);
    expect(round1[1]?.["action_use"]).toBe(round1[0]?.["action_use"]);
  });
});
