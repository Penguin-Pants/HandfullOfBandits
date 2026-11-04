import { describe, expect, it } from "vitest";
import { codes, play, ruleset, setMarkers, setPieces, setTrack, turnOf } from "../../../../test/board.ts";
import type { GameState } from "../../core/types.ts";
import { PHASE } from "../phases.ts";

// T-PROP for the ceasefire step and Negotiated Outcome (11 P3b-05; research 07 s7.3, s7.4, 09 s5;
// approved text docs/prototype/30, DEC-66). Legal Space Open, so the Legal Politics phase runs.
const at = (s: GameState, ceasefire: string, rounds = 0): GameState => {
  const step = ruleset.sequence.propagandaPhases.indexOf("legalPolitics");
  const b = setTrack(setTrack(setTrack(s, "legalSpace", "open"), "ceasefire", ceasefire), "ceasefireRounds", rounds);
  return { ...b, deck: { ...b.deck, currentCard: "DK-016" }, turn: { ...b.turn, campaign: "C3", phase: PHASE.propaganda, propagandaRound: 2, step } };
};
const run = (s: GameState, ceasefire: Record<string, unknown> | null): GameState =>
  play(s, ceasefire === null ? { type: "Advance" } : ({ type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire } })).state;
const cf = (s: GameState): unknown => s.tracks["ceasefire"];
const rounds = (s: GameState): unknown => s.tracks["ceasefireRounds"];
const guerrillas = (s: GameState): number => ruleset.spaces.filter((x) => x.kind === "domestic").reduce((n, x) => n + Object.values(s.spaces[x.id]?.pieces["guerrilla"] ?? {}).reduce((a, b) => a + b, 0), 0);

describe("Ceasefire step 1: Declared (07 s7.3)", () => {
  it("the State accepts: Reciprocal Restraint, held from now", () => {
    const s = run(at(turnOf("state"), "declared"), { accept: true });
    expect([cf(s), rounds(s)]).toEqual(["reciprocalRestraint", 1]);
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

describe("Ceasefire step 2: Talks vote (07 s7.3, DEC-66 points 1 and 2)", () => {
  it("two yes after a full round of restraint: Talks", () => {
    const s = run(at(turnOf("state"), "reciprocalRestraint", 1), { talks: { state: true, pkk: true } });
    expect([cf(s), rounds(s)]).toEqual(["talks", 1]);
  });

  it("one no keeps Reciprocal Restraint; a new restraint cannot vote yet", () => {
    expect(cf(run(at(turnOf("state"), "reciprocalRestraint", 1), { talks: { state: true, pkk: false } }))).toBe("reciprocalRestraint");
    expect(cf(run(at(turnOf("state"), "reciprocalRestraint", 0), { talks: { state: true, pkk: true } }))).toBe("reciprocalRestraint");
    expect(rounds(run(at(turnOf("state"), "reciprocalRestraint", 1), null))).toBe(2);
  });
});

describe("Ceasefire step 4: leaving (07 s7.3, DEC-66 point 5)", () => {
  it("leaving Talks goes to Reciprocal Restraint; the PKK pays Europe -1 to leave Reciprocal Restraint", () => {
    expect(cf(run(at(turnOf("state"), "talks", 1), { leave: { state: true } }))).toBe("reciprocalRestraint");
    const s = run(setTrack(at(turnOf("state"), "reciprocalRestraint", 1), "europe", 2), { leave: { pkk: true } });
    expect([cf(s), s.tracks["europe"], rounds(s)]).toEqual(["none", 1, 0]);
    expect(cf(run(at(turnOf("state"), "talks", 1), { leave: { state: true, pkk: true } }))).toBe("none");
  });
});

describe("Negotiated Outcome (07 s7.4, 09 s5, DEC-66 points 3 and 4)", () => {
  // S0 domestic Guerrillas: Hakkari 2, Botan 2, Mardin-Batman 1 = 5; half, round up = 3.
  const accept = { outcome: { state: true, pkk: true, removals: { hakkari: 2, "mardin-batman": 1 } } };

  it("both accept after a full Campaign of Talks: concessions, then the game ends with a label", () => {
    const s = run(at(turnOf("state"), "talks", 1), accept);
    expect(s.turn.phase).toBe(PHASE.ended);
    expect([s.tracks["emergencyRule"], s.tracks["legalSpace"], guerrillas(s)]).toEqual(["normalizing", "open", 2]);
    expect(s.ended?.reason).toBe("negotiated outcome");
    expect(s.ended?.labels[0]).toMatch(/^Negotiated outcome( favorable to (State|PKK)|, balanced)$/);
  });

  it("removals must total half the domestic Guerrillas, rounded up", () => {
    const bad = { type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire: { outcome: { state: true, pkk: true, removals: { hakkari: 1 } } } } };
    expect(codes(at(turnOf("state"), "talks", 1), bad)).toEqual(["outcomeRemovals"]);
  });

  it("validates removals on the board after the procedure table: a successor ends Banned first (PR 46 review)", () => {
    const banned = setTrack(at(turnOf("state"), "talks", 1), "legalSpace", "banned");
    const none = { type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire: { outcome: { state: true, pkk: true } } } };
    expect(codes(banned, none)).toEqual(["outcomeRemovals"]);
  });

  it("a refusal keeps Talks; new Talks or a Banned Legal Space cannot end the game", () => {
    expect(cf(run(at(turnOf("state"), "talks", 1), { outcome: { state: true, pkk: false } }))).toBe("talks");
    expect(run(at(turnOf("state"), "talks", 0), accept).turn.phase).not.toBe(PHASE.ended);
  });

  it("Covert markers are revealed unless Talks held two full Campaigns (09 s5 item 2)", () => {
    const covert = setMarkers(at(turnOf("state"), "talks", 1), "dersim", "covert", 1);
    expect(run(covert, accept).tracks["legitimacy"]).toBe(8);
    expect(run(setTrack(covert, "ceasefireRounds", 2), accept).tracks["legitimacy"]).toBe(10);
  });
});

describe("A breach resets the held rounds (07 s7.2)", () => {
  it("ends the ceasefire and the count", () => {
    const board = setPieces(setPieces(setTrack(setTrack({ ...turnOf("state"), turn: { ...turnOf("state").turn, campaign: "C3" } }, "ceasefire", "talks"), "ceasefireRounds", 2), "botan", "guerrilla", 0), "botan", "guerrilla", 2, "active");
    const s = play(board, { type: "ChooseOperation", faction: "state", box: "opOnly", plan: { op: "state.assault", locations: ["botan"], perLocation: {}, sa: null, subActions: [] } }).state;
    expect([cf(s), rounds(s)]).toEqual(["none", 0]);
  });
});
