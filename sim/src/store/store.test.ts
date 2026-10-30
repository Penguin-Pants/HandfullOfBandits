import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LogEntry } from "../engine/core/types.ts";
import { migrate, openStore, type Db } from "./migrate.ts";
import { commitAction, getAction, listActions, type ActionInput } from "./repos/actions.ts";
import { editAnnotationText, listAnnotations, saveAnnotation, type AnnotationInput } from "./repos/annotations.ts";
import { listCategories } from "./repos/categories.ts";
import { listCommands } from "./repos/commands.ts";
import { listEntries } from "./repos/log-entries.ts";
import { loadPackageContent, savePackageVersion } from "./repos/packages.ts";
import { createSession, getSession } from "./repos/sessions.ts";
import { loadState } from "./repos/states.ts";

// P1-11 store integration tests on a temp file (06 s3, s5).
let dir: string;
let db: Db;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "hob-store-"));
  db = openStore(join(dir, "store.sqlite"));
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const count = (table: string): number => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
const entry = (kind: LogEntry["kind"], data: LogEntry["data"]): LogEntry & { text: string } => ({ kind, stateSeq: 1, ruleRef: "debug.adjustTrack", assumptionRef: null, data, text: `${kind}.` });

function started() {
  savePackageVersion(db, {
    packageHash: "p".repeat(64), packageId: "tiny", version: "0.1.0", rulesetVersion: "R1", schemaVersion: 1,
    parentVersion: null, changeDescription: null, content: '{"manifest.yaml":{}}', appVersion: "0.0.0",
  });
  return createSession(
    db,
    { name: "Test", packageHash: "p".repeat(64), scenarioId: "start", seed: 9, options: {}, appVersion: "0.0.0", codeFingerprint: "f".repeat(64), modules: [], excludedCards: [] },
    {
      faction: null, cardId: null, campaign: "C1", propagandaRound: 0, cardIndex: 0, phase: "setup", box: null, summary: "Setup",
      stateAfter: { hash: "s0", content: '{"seq":0}', derived: { scores: { blue: 2 } } }, status: "committed", commands: [],
      entries: [{ ...entry("PhaseStarted", { phase: "setup" }), stateSeq: 0 }],
    },
  );
}

function action(sessionId: string, over: Partial<ActionInput> = {}): ActionInput {
  return {
    sessionId, kind: "advance", faction: "blue", cardId: null, campaign: "C1", propagandaRound: 0, cardIndex: 0, phase: "setup", box: null,
    summary: "Blue Resources +2", stateHashBefore: "s0", stateAfter: { hash: "s1", content: '{"seq":1}', derived: {} }, status: "committed",
    commands: [{ type: "AdjustTrackDebug", payload: { type: "AdjustTrackDebug", track: "cash.blue", delta: 2 }, validation: { ok: true }, rngBefore: [1, 2, 3, 4] }],
    entries: [entry("ValidationPassed", { command: "AdjustTrackDebug" }), entry("EffectApplied", { track: "cash.blue", before: 5, after: 7 })],
    ...over,
  };
}

describe("migrate", () => {
  it("creates every 06 s3 table and seeds the 07 s5 categories once", () => {
    const tables = (db.prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name").all() as { name: string }[]).map((t) => t.name);
    expect(tables).toEqual([
      "actions", "annotation_revisions", "annotations", "annotations_fts", "annotations_fts_config", "annotations_fts_data", "annotations_fts_docsize", "annotations_fts_idx", "branches", "categories", "commands", "log_entries", "metrics",
      "package_versions", "regression_cases", "regression_runs", "sessions", "states",
    ]);
    expect(db.pragma("user_version", { simple: true })).toBe(2);
    expect(migrate(db)).toBe(2);
    const categories = listCategories(db);
    expect(categories).toHaveLength(15);
    expect(categories[0]).toEqual({ category_id: "balance", label: "Balance concern", hotkey: "Alt+1", color: null, sort: 1, active: 1 });
  });

  it("turns on WAL mode and foreign keys", () => {
    expect(db.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
  });
});

describe("package versions", () => {
  it("stores content once per hash and reads it back", () => {
    started();
    savePackageVersion(db, { packageHash: "p".repeat(64), packageId: "x", version: "9", rulesetVersion: "R9", schemaVersion: 1, parentVersion: null, changeDescription: null, content: "{}", appVersion: "9" });
    expect(count("package_versions")).toBe(1);
    expect(loadPackageContent(db, "p".repeat(64))).toBe('{"manifest.yaml":{}}');
    expect(loadPackageContent(db, "nope")).toBeNull();
  });
});

describe("sessions", () => {
  it("creates the session, its main branch and the setup action A1", () => {
    const s = started();
    expect(s.actionId).toBe(`${s.sessionId}-A1`);
    expect(s.entryIds).toEqual([`${s.sessionId}-A1-E1`]);
    expect(getSession(db, s.sessionId)).toMatchObject({ status: "active", current_branch_id: s.branchId, head_action_id: s.actionId, seed: 9 });
    expect(getAction(db, s.actionId)).toMatchObject({ kind: "setup", seq: 1, branch_seq: 1, state_hash_before: null, state_hash_after: "s0" });
    expect(loadState(db, "s0")).toEqual({ content: '{"seq":0}', derived: '{"scores":{"blue":2}}' });
  });

  it("rolls back the session when the setup fails", () => {
    expect(() => createSession(db, { name: "x", packageHash: "unknown", scenarioId: "s", seed: 1, options: {}, appVersion: "0", codeFingerprint: "f", modules: [], excludedCards: [] }, action("x"))).toThrow();
    expect([count("sessions"), count("branches"), count("actions")]).toEqual([0, 0, 0]);
  });
});

describe("commitAction", () => {
  it("writes action, command, entries and state, and moves the session head (P1-11 accept)", () => {
    const s = started();
    const c = commitAction(db, action(s.sessionId));
    expect(c).toEqual({ actionId: `${s.sessionId}-A2`, commandIds: [`${s.sessionId}-A2-C1`], entryIds: [`${s.sessionId}-A2-E1`, `${s.sessionId}-A2-E2`] });
    expect(getAction(db, c.actionId)).toMatchObject({ seq: 2, branch_seq: 2, state_hash_before: "s0", state_hash_after: "s1", status: "committed" });
    expect(listCommands(db, c.actionId)[0]).toMatchObject({ type: "AdjustTrackDebug", payload: '{"type":"AdjustTrackDebug","track":"cash.blue","delta":2}', rng_before: "[1,2,3,4]" });
    expect(listEntries(db, c.actionId).map((e) => [e.kind, e.state_seq, e.data])).toEqual([
      ["ValidationPassed", 1, '{"command":"AdjustTrackDebug"}'],
      ["EffectApplied", 1, '{"track":"cash.blue","before":5,"after":7}'],
    ]);
    expect(loadState(db, "s1")?.content).toBe('{"seq":1}');
    expect(getSession(db, s.sessionId)?.head_action_id).toBe(c.actionId);
    expect(listActions(db, s.branchId).map((a) => a.action_id)).toEqual([s.actionId, c.actionId]);
  });

  it("stores a repeated state once", () => {
    const s = started();
    commitAction(db, action(s.sessionId, { stateAfter: { hash: "s0", content: '{"seq":0}', derived: {} } }));
    expect(count("states")).toBe(1);
  });

  it("leaves no rows when an error is thrown mid-commit", () => {
    const s = started();
    const before = ["actions", "commands", "log_entries", "states"].map(count);
    // The second entry has no kind: its insert fails after the state, action, command and first entry.
    const bad = action(s.sessionId, { entries: [entry("ValidationPassed", {}), { ...entry("EffectApplied", {}), kind: null as unknown as LogEntry["kind"] }] });
    expect(() => commitAction(db, bad)).toThrow();
    expect(["actions", "commands", "log_entries", "states"].map(count)).toEqual(before);
    expect(getSession(db, s.sessionId)?.head_action_id).toBe(s.actionId);
  });

  it("rejects an unknown session", () => {
    expect(() => commitAction(db, action("nope"))).toThrow('Unknown session "nope"');
  });
});

describe("annotations", () => {
  function note(sessionId: string, branchId: string, over: Partial<AnnotationInput> = {}): AnnotationInput {
    return { sessionId, branchId, anchor: "session", actionId: null, stateHash: null, decisionId: null, context: { a: 1 }, categoryIds: [], text: "first", ...over };
  }

  it("saves a note linked to an action and lists it", () => {
    const s = started();
    const id = saveAnnotation(db, note(s.sessionId, s.branchId, { anchor: "executed", actionId: s.actionId, stateHash: "s0", categoryIds: ["balance"] }));
    expect(listAnnotations(db, s.sessionId)).toEqual([expect.objectContaining({ annotation_id: id, anchor: "executed", action_id: s.actionId, category_ids: '["balance"]', status: "open" })]);
  });

  it("rejects an unknown category", () => {
    const s = started();
    expect(() => saveAnnotation(db, note(s.sessionId, s.branchId, { categoryIds: ["nope"] }))).toThrow('Unknown category "nope"');
    expect(count("annotations")).toBe(0);
  });

  it("keeps the old text as a revision on edit", () => {
    const s = started();
    const id = saveAnnotation(db, note(s.sessionId, s.branchId));
    editAnnotationText(db, id, "second");
    editAnnotationText(db, id, "third");
    expect(listAnnotations(db, s.sessionId)[0]?.text).toBe("third");
    expect(db.prepare("SELECT n, text FROM annotation_revisions ORDER BY n").all()).toEqual([{ n: 1, text: "first" }, { n: 2, text: "second" }]);
  });

  it("replaces a second debrief and keeps one per session (T-ANN-08 store part)", () => {
    const s = started();
    const first = saveAnnotation(db, note(s.sessionId, s.branchId, { anchor: "debrief", stateHash: "s0" }));
    const second = saveAnnotation(db, note(s.sessionId, s.branchId, { anchor: "debrief", stateHash: "s0", text: "again" }));
    expect(second).toBe(first);
    expect(listAnnotations(db, s.sessionId).map((a) => a.text)).toEqual(["again"]);
  });
});
