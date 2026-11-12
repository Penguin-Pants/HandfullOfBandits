import { describe, expect, it } from "vitest";
import { inCampaign, play, ruleset, setMarkers, setPieces, setTrack, turnOf } from "../../../../test/board.ts";
import type { GameState } from "../../core/types.ts";
import { PHASE } from "../phases.ts";
import { ceasefireOptions } from "./ceasefire-step.ts";

// T-PROP for the ceasefire step (11 P3b-05; research 07 s7.3; rules 8.6). A ceasefire is temporary
// (decision 1, 2026-11-12). Legal Space Open, so the Legal Politics phase runs.
const at = (s: GameState, ceasefire: string): GameState => {
  const step = ruleset.sequence.propagandaPhases.indexOf("legalPolitics");
  const c = inCampaign(ruleset, setTrack(setTrack(s, "legalSpace", "open"), "ceasefire", ceasefire), "C3");
  return { ...c, deck: { ...c.deck, currentCard: "DK-016" }, turn: { ...c.turn, phase: PHASE.propaganda, propagandaRound: 2, step } };
};
const run = (s: GameState, ceasefire: Record<string, unknown> | null): GameState =>
  play(s, ceasefire === null ? { type: "Advance" } : ({ type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire } })).state;
const cf = (s: GameState): unknown => s.tracks["ceasefire"];

describe("Ceasefire track (rules 8.6)", () => {
  it("has three steps: None, Declared, Reciprocal Restraint", () => {
    expect(ruleset.tracks.find((t) => t.id === "ceasefire")).toMatchObject({ kind: "ordinal", steps: ["none", "declared", "reciprocalRestraint"] });
  });
});

describe("Ceasefire step 1: Declared (07 s7.3)", () => {
  it("the State accepts: Reciprocal Restraint", () => {
    expect(cf(run(at(turnOf("state"), "declared"), { accept: true }))).toBe("reciprocalRestraint");
  });

  it("no State acceptance with a State Restraint Broken marker", () => {
    const s = run(setMarkers(at(turnOf("state"), "declared"), "botan", "restraintBroken", 1, "state"), { accept: true });
    expect(cf(s)).toBe("declared");
  });

  it("the PKK ends its own declaration: None, Europe -1; keeping it is the default", () => {
    const own = { ...at(turnOf("state"), "declared"), flags: { ...turnOf("state").flags, ceasefireDeclaredByPkk: true } };
    const ended = run(setTrack(own, "europe", 2), { pkkEnd: true });
    expect([cf(ended), ended.tracks["europe"]]).toEqual(["none", 1]);
    expect(cf(run(own, null))).toBe("declared");
  });
});

describe("Ceasefire step 2: leaving (07 s7.3)", () => {
  it("the PKK pays Europe -1 to leave Reciprocal Restraint; the State pays nothing", () => {
    const board = setTrack(at(turnOf("state"), "reciprocalRestraint"), "europe", 2);
    const pkk = run(board, { leave: { pkk: true } });
    expect([cf(pkk), pkk.tracks["europe"]]).toEqual(["none", 1]);
    const state = run(board, { leave: { state: true } });
    expect([cf(state), state.tracks["europe"], state.tracks["legitimacy"]]).toEqual(["none", 2, board.tracks["legitimacy"]]);
  });

  it("Reciprocal Restraint stays when no faction leaves", () => {
    expect(cf(run(at(turnOf("state"), "reciprocalRestraint"), null))).toBe("reciprocalRestraint");
  });
});

describe("A ceasefire never ends the game (rules 8.6, decision 1)", () => {
  it("Reciprocal Restraint held through three ceasefire steps stays Reciprocal Restraint and the game goes on", () => {
    let s = at(turnOf("state"), "reciprocalRestraint");
    for (let i = 0; i < 3; i++) {
      const next = run(s, null);
      expect([cf(next), next.ended, next.turn.phase]).toEqual(["reciprocalRestraint", null, PHASE.propaganda]);
      s = { ...next, turn: s.turn };
    }
  });

  it("the step offers only acceptance and leaving, and keeps no count of rounds held", () => {
    const held = run(at(turnOf("state"), "reciprocalRestraint"), null);
    expect(ceasefireOptions(ruleset, held)).toEqual({ accept: false, leave: true });
    expect(ceasefireOptions(ruleset, at(turnOf("state"), "declared"))).toEqual({ accept: true, leave: false });
    expect(Object.keys(held.tracks).filter((t) => t.startsWith("ceasefire"))).toEqual(["ceasefire"]);
  });

  it("the step removes no Guerrillas and changes no Emergency Rule or Legal Space", () => {
    const before = at(turnOf("state"), "reciprocalRestraint");
    const after = run(before, { leave: { state: true } });
    expect([after.tracks["emergencyRule"], after.tracks["legalSpace"], after.spaces["hakkari"]?.pieces["guerrilla"]]).toEqual([before.tracks["emergencyRule"], before.tracks["legalSpace"], before.spaces["hakkari"]?.pieces["guerrilla"]]);
  });
});

describe("A breach ends the ceasefire (07 s7.2)", () => {
  it("State Assault during Reciprocal Restraint: Ceasefire to None", () => {
    const board = setPieces(setPieces(setTrack(inCampaign(ruleset, turnOf("state"), "C3"), "ceasefire", "reciprocalRestraint"), "botan", "guerrilla", 0), "botan", "guerrilla", 2, "active");
    const s = play(board, { type: "ChooseOperation", faction: "state", box: "opOnly", plan: { op: "state.assault", locations: ["botan"], perLocation: {}, sa: null, subActions: [] } }).state;
    expect(cf(s)).toBe("none");
  });
});
