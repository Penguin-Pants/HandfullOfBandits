import { describe, expect, it } from "vitest";
import { kurdish } from "../../../../test/kurdish-package.ts";
import { createEngine } from "../../index.ts";
import type { GameState } from "../../core/types.ts";
import { coinHandlers } from "../handlers.ts";
import { PHASE } from "../phases.ts";
import { activeFaction, legalBoxes, sequenceViolations } from "./ct.ts";

// T-SEQ (11 P2-03): the CT two-faction track on the Kurdish package.
const { ruleset } = kurdish;
const engine = createEngine(coinHandlers);
const start = engine.start(ruleset, "s0", 1).state;
const inCard = (state: GameState): GameState => ({ ...state, turn: { ...state.turn, phase: PHASE.card } });

/** State after the First Eligible (pkk) placed its cylinder in `box`. */
function afterFirst(box: string): GameState {
  const s = inCard(start);
  return { ...s, initiative: { ...s.initiative, boxes: { ...s.initiative.boxes, pkk: box }, actedThisCard: ["pkk"] } };
}

// Research 05 s2.3 responder matrix: First Eligible box -> Second Eligible boxes.
const matrix: [string, string[]][] = [
  ["opSa", ["event", "limitedOp", "pass"]],
  ["opOnly", ["limitedOp", "pass"]],
  ["limitedOp", ["opOnly", "opSa", "pass"]],
  ["event", ["opSa", "pass"]],
  ["pass", ["event", "limitedOp", "opOnly", "opSa", "pass"]],
];

describe("CT sequence model", () => {
  it("makes the PKK First Eligible at start (05 s2.1, DD-04.6)", () => {
    expect(start.initiative).toEqual({ boxes: { state: null, pkk: null }, firstEligible: "pkk", secondEligible: "state", actedThisCard: [] });
  });

  it("offers every box to the First Eligible", () => {
    expect(activeFaction(inCard(start))).toBe("pkk");
    expect(legalBoxes(ruleset, inCard(start), "pkk")).toEqual(["event", "limitedOp", "opOnly", "opSa", "pass"]);
  });

  it.each(matrix)("after First Eligible %s, the Second Eligible may take %j", (first, cells) => {
    const state = afterFirst(first);
    expect(activeFaction(state)).toBe("state");
    expect(legalBoxes(ruleset, state, "state").sort()).toEqual([...cells].sort());
  });

  it("rejects a box outside the matrix, the wrong faction and play outside a card", () => {
    expect(sequenceViolations(ruleset, afterFirst("opOnly"), "state", "opSa").map((v) => v.code)).toEqual(["boxNotAllowed"]);
    expect(sequenceViolations(ruleset, inCard(start), "state", "pass").map((v) => v.code)).toEqual(["notEligible"]);
    expect(sequenceViolations(ruleset, start, "pkk", "pass").map((v) => v.code)).toEqual(["notCardPlay"]);
  });
});

describe("Pass and eligibility (05 s2.4, s3.2)", () => {
  function play(state: GameState, ...factions: string[]): GameState {
    return factions.reduce((s, faction) => {
      const result = engine.apply(ruleset, s, { type: "Pass", faction });
      if (!result.ok) throw new Error(JSON.stringify(result.validation.violations));
      return result.transition.state;
    }, state);
  }

  it("pays pass income: PKK +1, State +2", () => {
    const once = play(inCard(start), "pkk");
    expect(once.tracks["resources.pkk"]).toBe(6);
    expect(once.initiative).toMatchObject({ boxes: { pkk: "pass", state: null }, actedThisCard: ["pkk"] });
    const both = play(once, "state");
    expect(both.tracks["resources.state"]).toBe(14);
  });

  it("keeps the order when both pass, and clears the boxes for the next card", () => {
    const result = engine.apply(ruleset, play(inCard(start), "pkk"), { type: "Pass", faction: "state" });
    if (!result.ok) throw new Error("pass must be legal");
    expect(result.transition.state.initiative).toEqual({ boxes: { state: null, pkk: null }, firstEligible: "pkk", secondEligible: "state", actedThisCard: [] });
    expect(result.transition.logEntries.map((e) => e.kind)).toContain("EligibilityChanged");
  });

  it.each([
    ["opOnly", "state"],
    ["opSa", "state"],
    ["limitedOp", "pkk"],
    ["event", "pkk"],
    ["pass", "pkk"],
  ])("First Eligible %s: next First Eligible is %s", (box, next) => {
    const after = play(afterFirst(box), "state");
    expect(after.initiative.firstEligible).toBe(next);
    expect(after.initiative.secondEligible).toBe(next === "pkk" ? "state" : "pkk");
  });

  it("rejects a Pass out of turn with no state change", () => {
    const result = engine.apply(ruleset, inCard(start), { type: "Pass", faction: "state" });
    expect(result.ok).toBe(false);
  });
});
