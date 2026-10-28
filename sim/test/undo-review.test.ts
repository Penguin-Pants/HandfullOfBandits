import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { listActions } from "../src/store/repos/actions.ts";
import { listEntries } from "../src/store/repos/log-entries.ts";
import { kurdishDir } from "./kurdish-package.ts";

// P2-17 server side: undo (06 s6, T-ANN-05, undoneAfterRandom) and review filters (T-ANN-06).
const dir = mkdtempSync(join(tmpdir(), "hob-undo-"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(kurdishDir, "..", ".."));
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const focus = { panel: "board" as const, selectedSpace: null, selectedPieces: [], hoveredActionId: null };
const { sessionId, head: setup } = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 5, name: "undo" });
const revealed = service.submit(sessionId, { type: "Advance" }, setup.actionId);
const attack = { type: "ChooseOperation", faction: "pkk", box: "limitedOp", plan: { op: "pkk.attack", locations: ["hakkari"], perLocation: {}, sa: null, subActions: [] } };
const attacked = service.submit(sessionId, attack, revealed.actionId);
const noteId = service.annotate(sessionId, { anchor: "executed", actionId: attacked.actionId, text: "Attack odds feel high.", categoryIds: ["balance"], focus: { ...focus, selectedSpace: "hakkari" } });

describe("undo (06 s6)", () => {
  const result = service.undo(sessionId, attacked.actionId);

  it("marks the action undone, moves the head back and restores the board (T-UI-04 server part)", () => {
    expect(result).toMatchObject({ undone: attacked.actionId, head: revealed.actionId, undoneAfterRandom: true });
    expect(result.state.stateHash).toBe(revealed.head.stateHash);
    const session = service.session(sessionId);
    expect(session.head.actionId).toBe(revealed.actionId);
    expect(listActions(db, session.session.current_branch_id).map((a) => a.status)).toEqual(["committed", "committed", "undone"]);
    const last = listEntries(db, attacked.actionId).at(-1);
    expect(last?.kind).toBe("Undo");
    expect(JSON.parse(last?.data ?? "{}")).toMatchObject({ undoneAfterRandom: true });
  });

  it("keeps the note with its original before and after states (T-ANN-05)", () => {
    const note = service.annotations(sessionId).find((n) => n.annotation_id === noteId);
    expect(note?.state_hash).toBe(attacked.head.stateHash);
    expect(service.state(attacked.head.stateHash).state.meta.stateSeq).toBeGreaterThan(0);
    expect(service.stateView(sessionId, revealed.head.stateHash).spaces).toHaveLength(18);
  });

  it("gives the next action a new ID, and the replay check skips the undone action", () => {
    const pass = service.submit(sessionId, { type: "Pass", faction: "pkk" }, revealed.actionId);
    expect(pass.actionId).not.toBe(attacked.actionId);
    const { session, ruleset } = service.session(sessionId);
    expect(service.replayCheck(session, ruleset)).toBeNull();
  });

  it("rejects an undo with a stale head and an undo of the setup", () => {
    expect(() => service.undo(sessionId, "old")).toThrow(/moved on/);
    const fresh = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 6, name: "x" });
    expect(() => service.undo(fresh.sessionId, fresh.head.actionId)).toThrow(/Nothing to undo/);
  });
});

describe("review (07 s7, T-ANN-06)", () => {
  it("filters by space using the selected space or the action's locations, and searches text", () => {
    service.annotate(sessionId, { anchor: "proposed", actionId: null, text: "March into Botan?", categoryIds: [], focus, proposed: { type: "ChooseOperation", faction: "state", box: "opOnly", plan: { op: "state.sweep", locations: ["botan"], perLocation: {}, sa: null, subActions: [] } } });
    expect(service.review({ space: "hakkari" }).map((r) => r.annotationId)).toEqual([noteId]);
    expect(service.review({ space: "botan" }).map((r) => r.text)).toEqual(["March into Botan?"]);
    expect(service.review({ q: "ODDS" }).map((r) => r.annotationId)).toEqual([noteId]);
    expect(service.review({ category: "general" }).map((r) => r.text)).toEqual(["March into Botan?"]);
    expect(service.review({ anchor: "executed", category: "balance" })).toHaveLength(1);
  });
});
