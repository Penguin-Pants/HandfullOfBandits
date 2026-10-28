import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { adjustTrackDebug } from "../../test/debug-command.ts";
import { loadPackage, readPackageDir } from "../package/load.ts";
import { derive } from "./coin/derive.ts";
import { canonicalHash } from "./core/canonical.ts";
import { setupState } from "./core/state.ts";
import type { AnyCommand, CommandHandler, GameState } from "./core/types.ts";
import { createEngine } from "./index.ts";

// P1-10 and T-DET on the tiny package (P1-06).
const loaded = loadPackage(readPackageDir(fileURLToPath(new URL("../../test/packages/tiny", import.meta.url))));
if (!loaded.ok) throw new Error(JSON.stringify(loaded.issues));
const ruleset = loaded.ruleset;

// Test-only: places soldiers, so a command can change Control.
const placeSoldiers: CommandHandler = {
  ruleRef: "test.place",
  check: () => [],
  resolve: (_r, _s, command) => [
    { type: "placePieces", piece: "soldier", count: 2, space: String(command["space"]), state: null, ruleRef: "test.place", assumptionRef: null },
  ],
};
const engine = createEngine({ AdjustTrackDebug: adjustTrackDebug, PlaceSoldiers: placeSoldiers });
const debug = { type: "AdjustTrackDebug", track: "cash.blue", delta: 2 };

function applied(state: GameState, command: AnyCommand) {
  const result = engine.apply(ruleset, state, command);
  if (!result.ok) throw new Error(JSON.stringify(result.validation.violations));
  return result.transition;
}

describe("start", () => {
  const first = engine.start(ruleset, "start", 9);

  it("returns the scenario start position with its hash and no open Decision", () => {
    expect(first.state).toEqual(setupState(ruleset, "start", 9));
    expect(first.stateHash).toBe(canonicalHash(first.state));
    expect(first.pending).toBeNull();
    expect(first.logEntries).toEqual([{ kind: "PhaseStarted", stateSeq: 0, ruleRef: null, assumptionRef: null, data: { phase: "setup", scenario: "start" } }]);
  });

  it("matches tiny hand math: support city 1 x pop 2, opposition hills 1 x pop 1", () => {
    expect(derive(ruleset, first.state).scores).toEqual({ blue: 2, red: 1 });
    expect(first.state.tracks).toEqual({ "cash.blue": 5, "cash.red": 3, border: "open", standing: 0 });
  });

  it("gives the same hash for the same seed and a new hash for a new seed (T-DET)", () => {
    expect(engine.start(ruleset, "start", 9).stateHash).toBe(first.stateHash);
    expect(engine.start(ruleset, "start", 10).stateHash).not.toBe(first.stateHash);
  });
});

describe("validate", () => {
  const { state } = engine.start(ruleset, "start", 9);

  it("previews the effects of a legal command", () => {
    expect(engine.validate(ruleset, state, debug)).toEqual({
      ok: true,
      violations: [],
      warnings: [],
      preview: { effects: [{ type: "adjustTrack", track: "cash.blue", delta: 2, ruleRef: "debug.adjustTrack", assumptionRef: null }] },
    });
  });

  it("rejects a command type with no handler", () => {
    const result = engine.validate(ruleset, state, { type: "Advance" });
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual([{ code: "unknownCommand", message: 'No handler for command "Advance".', ruleRef: null, location: null }]);
    expect(result.preview.effects).toEqual([]);
  });

  it("does not register the debug command in an engine that was not given it", () => {
    expect(createEngine({}).validate(ruleset, state, debug).violations.map((v) => v.code)).toEqual(["unknownCommand"]);
  });

  it("does not take a handler from an Object property", () => {
    expect(engine.validate(ruleset, state, { type: "constructor" }).violations.map((v) => v.code)).toEqual(["unknownCommand"]);
  });

  it("returns the handler's violations", () => {
    const result = engine.validate(ruleset, state, { type: "AdjustTrackDebug", track: "border", delta: 0.5 });
    expect(result.violations.map((v) => v.code)).toEqual(["unknownTrack", "badDelta"]);
  });
});

describe("apply", () => {
  const start = engine.start(ruleset, "start", 9);

  it("returns a new state, its hash and entries with before and after values", () => {
    const t = applied(start.state, debug);
    expect(t.state.tracks["cash.blue"]).toBe(7);
    expect(t.state.meta.stateSeq).toBe(1);
    expect(t.stateHash).toBe(canonicalHash(t.state));
    expect(t.stateHash).not.toBe(start.stateHash);
    expect(t.pending).toBeNull();
    expect(t.logEntries).toEqual([
      { kind: "ValidationPassed", stateSeq: 1, ruleRef: "debug.adjustTrack", assumptionRef: null, data: { command: "AdjustTrackDebug" } },
      { kind: "EffectApplied", stateSeq: 1, ruleRef: "debug.adjustTrack", assumptionRef: null, data: { effect: "adjustTrack", track: "cash.blue", before: 5, after: 7, lost: 0 } },
    ]);
  });

  it("does not change its input", () => {
    const copy = structuredClone(start.state);
    applied(start.state, debug);
    expect(start.state).toEqual(copy);
  });

  it("gives the same transition for the same state and command (T-DET)", () => {
    expect(applied(start.state, debug)).toEqual(applied(start.state, debug));
    const twice = applied(applied(start.state, debug).state, debug);
    expect(twice.state.meta.stateSeq).toBe(2);
    expect(twice.stateHash).toBe(applied(applied(start.state, debug).state, debug).stateHash);
  });

  it("rejects an invalid command with no new state", () => {
    const result = engine.apply(ruleset, start.state, { type: "AdjustTrackDebug", track: "nope", delta: 1 });
    expect(result.ok).toBe(false);
    expect("transition" in result).toBe(false);
    expect(result.validation.violations.map((v) => v.code)).toEqual(["unknownTrack"]);
  });

  it("logs a Control change after the effects (05 s5.1 item 4)", () => {
    // Farm starts with 1 soldier and 1 rebel: no Control. Two more soldiers give Blue Control.
    const t = applied(start.state, { type: "PlaceSoldiers", space: "farm" });
    expect(t.logEntries.at(-1)).toEqual({ kind: "ControlChanged", stateSeq: 1, ruleRef: "coin.control", assumptionRef: null, data: { space: "farm", before: null, after: "blue" } });
    expect(t.logEntries.filter((e) => e.kind === "ControlChanged")).toHaveLength(1);
  });
});
