import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { buildContext } from "../src/annotate/context.ts";
import { derive } from "../src/engine/coin/derive.ts";
import { canonicalHash, canonicalJson } from "../src/engine/core/canonical.ts";
import type { GameState, LogEntry, Ruleset } from "../src/engine/core/types.ts";
import { createEngine } from "../src/engine/index.ts";
import { loadPackage, packageContent, readPackageDir } from "../src/package/load.ts";
import { openStore } from "../src/store/migrate.ts";
import { commitAction, getAction, listActions } from "../src/store/repos/actions.ts";
import { listAnnotations, saveAnnotation } from "../src/store/repos/annotations.ts";
import { listCommands } from "../src/store/repos/commands.ts";
import { listEntries } from "../src/store/repos/log-entries.ts";
import { loadPackageContent, savePackageVersion } from "../src/store/repos/packages.ts";
import { createSession, getSession } from "../src/store/repos/sessions.ts";
import { loadState } from "../src/store/repos/states.ts";
import { adjustTrackDebug } from "./debug-command.ts";

// IC-1 (11 s2, Phase 1 exit): load tiny, start a session in the store, apply one command, save a
// note anchored to the action, reload from disk, verify hashes and note links.
const dir = mkdtempSync(join(tmpdir(), "hob-ic1-"));
const file = join(dir, "store.sqlite");
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

const engine = createEngine({ AdjustTrackDebug: adjustTrackDebug });
const command = { type: "AdjustTrackDebug", track: "cash.blue", delta: 2 };
// The session service renders entry text in P2-11. Here a plain form is enough.
const withText = (entries: readonly LogEntry[]) => entries.map((e) => ({ ...e, text: `${e.kind} ${JSON.stringify(e.data)}` }));
const stateInput = (ruleset: Ruleset, state: GameState, hash: string) => ({ hash, content: canonicalJson(state), derived: derive(ruleset, state) });

/** Everything IC-1 writes, done the way the session service will (P2-11). */
function playSession() {
  const loaded = loadPackage(readPackageDir(fileURLToPath(new URL("packages/tiny", import.meta.url))));
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.issues));
  const { ruleset, data, hash } = loaded;
  const db = openStore(file);
  const m = data.manifest;
  savePackageVersion(db, {
    packageHash: hash, packageId: m.packageId, version: m.version, rulesetVersion: m.rulesetVersion, schemaVersion: m.schemaVersion,
    parentVersion: null, changeDescription: m.changeDescription, content: canonicalJson(packageContent(data)), appVersion: "0.0.0",
  });
  const start = engine.start(ruleset, "start", 9);
  const turn = start.state.turn;
  const session = createSession(
    db,
    { name: "IC-1", packageHash: hash, scenarioId: "start", seed: 9, options: {}, appVersion: "0.0.0", codeFingerprint: "0".repeat(64), modules: [], excludedCards: [] },
    {
      faction: null, cardId: null, campaign: turn.campaign, propagandaRound: turn.propagandaRound, cardIndex: turn.cardIndex, phase: turn.phase,
      box: null, summary: "Setup tiny start", stateAfter: stateInput(ruleset, start.state, start.stateHash), status: "committed", commands: [],
      entries: withText(start.logEntries),
    },
  );
  const result = engine.apply(ruleset, start.state, command);
  if (!result.ok) throw new Error(JSON.stringify(result.validation.violations));
  const t = result.transition;
  const action = commitAction(db, {
    sessionId: session.sessionId, kind: "advance", faction: "blue", cardId: null, campaign: turn.campaign, propagandaRound: turn.propagandaRound,
    cardIndex: turn.cardIndex, phase: turn.phase, box: null, summary: "Debug: Blue Resources +2", stateHashBefore: start.stateHash,
    stateAfter: stateInput(ruleset, t.state, t.stateHash), status: "committed",
    commands: [{ type: command.type, payload: command, validation: result.validation, rngBefore: start.state.rng }],
    entries: withText(t.logEntries),
  });
  const view = (state: GameState, stateHash: string) => ({ state, stateHash, derived: derive(ruleset, state) });
  const context = buildContext({
    ruleset, packageId: m.packageId, packageVersion: m.version, sessionId: session.sessionId, branchId: session.branchId, appVersion: "0.0.0",
    head: view(t.state, t.stateHash), lastActionId: action.actionId, activeFaction: null, currentCardTitle: null,
    focus: { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null },
    action: { actionId: action.actionId, kind: "advance", command, validation: result.validation, entries: t.logEntries, before: view(start.state, start.stateHash), after: view(t.state, t.stateHash) },
    legalChoices: null, ruleSources: {},
  });
  const headBeforeNote = getSession(db, session.sessionId)?.head_action_id;
  const noteId = saveAnnotation(db, {
    sessionId: session.sessionId, branchId: session.branchId, anchor: "executed", actionId: action.actionId, stateHash: t.stateHash,
    decisionId: null, context, categoryIds: ["balance"], text: "Two Resources feel like a lot.",
  });
  const headAfterNote = getSession(db, session.sessionId)?.head_action_id;
  db.close();
  return { hash, session, action, noteId, startHash: start.stateHash, afterHash: t.stateHash, headBeforeNote, headAfterNote };
}

describe("IC-1 Phase 1 exit", () => {
  const run = playSession();
  const db = openStore(file);
  afterAll(() => {
    db.close();
  });

  it("reloads the package from the store with the same hash and Ruleset", () => {
    const content = loadPackageContent(db, run.hash);
    if (content === null) throw new Error("package content missing");
    expect(canonicalHash(JSON.parse(content))).toBe(run.hash);
    const reloaded = loadPackage({ files: JSON.parse(content) as Record<string, unknown>, issues: [] });
    expect(reloaded.ok && reloaded.hash).toBe(run.hash);
  });

  it("reloads the session at its head: the debug action after the setup action", () => {
    expect(getSession(db, run.session.sessionId)).toMatchObject({ status: "active", head_action_id: run.action.actionId, seed: 9, scenario_id: "start" });
    expect(listActions(db, run.session.branchId).map((a) => [a.action_id, a.kind, a.state_hash_before, a.state_hash_after])).toEqual([
      [run.session.actionId, "setup", null, run.startHash],
      [run.action.actionId, "advance", run.startHash, run.afterHash],
    ]);
  });

  it("stores states whose content hashes to their key", () => {
    for (const hash of [run.startHash, run.afterHash]) {
      const stored = loadState(db, hash);
      if (stored === null) throw new Error(`state ${hash} missing`);
      expect(canonicalHash(JSON.parse(stored.content))).toBe(hash);
    }
    const after = JSON.parse(loadState(db, run.afterHash)?.content ?? "null") as GameState;
    expect(after.tracks["cash.blue"]).toBe(7);
  });

  it("replays the stored command from the stored package to the same hashes (T-DET)", () => {
    const reloaded = loadPackage({ files: JSON.parse(loadPackageContent(db, run.hash) ?? "{}") as Record<string, unknown>, issues: [] });
    if (!reloaded.ok) throw new Error(JSON.stringify(reloaded.issues));
    const start = engine.start(reloaded.ruleset, "start", 9);
    expect(start.stateHash).toBe(run.startHash);
    const stored = listCommands(db, run.action.actionId)[0];
    const replay = engine.apply(reloaded.ruleset, start.state, JSON.parse(stored?.payload ?? "{}") as { type: string });
    expect(replay.ok && replay.transition.stateHash).toBe(run.afterHash);
  });

  it("keeps the log entries with before and after values", () => {
    expect(listEntries(db, run.action.actionId).map((e) => [e.entry_id, e.kind])).toEqual([
      [`${run.action.actionId}-E1`, "ValidationPassed"],
      [`${run.action.actionId}-E2`, "EffectApplied"],
    ]);
    expect(JSON.parse(listEntries(db, run.action.actionId)[1]?.data ?? "{}")).toMatchObject({ before: 5, after: 7 });
  });

  it("links the note to the action and its state (T-ANN-01 store part, T-ANN-03)", () => {
    const [note] = listAnnotations(db, run.session.sessionId);
    expect(note).toMatchObject({ annotation_id: run.noteId, anchor: "executed", action_id: run.action.actionId, state_hash: run.afterHash, category_ids: '["balance"]' });
    expect(note?.created_at).toMatch(/^\d{4}-\d\d-\d\dT/);
    const context = JSON.parse(note?.context ?? "{}") as Record<string, unknown>;
    expect(context).toMatchObject({ session_id: run.session.sessionId, action_id: run.action.actionId, state_hash: run.afterHash, last_action_id: run.action.actionId });
    expect(getAction(db, run.action.actionId)?.state_hash_after).toBe(context["state_hash"]);
  });

  it("does not move the head or change the state when a note is saved (T-ANN-04)", () => {
    expect(run.headAfterNote).toBe(run.headBeforeNote);
    expect(getSession(db, run.session.sessionId)?.head_action_id).toBe(run.action.actionId);
  });
});
