import { describe, expect, it } from "vitest";
import { codes, engine, op, play, ruleset, setMarkers, setPieces, setTrack, turnOf, withRoll } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";

// T-VAL and T-OPS for ceasefire declaration, restrictions and breach (11 P3b-05; research 07 s7.1,
// s7.2; 05 s4 item 6; approved text docs/prototype/30, DEC-66).
const c3 = (s: GameState): GameState => ({ ...s, turn: { ...s.turn, campaign: "C3" } });
const at = (s: GameState, ceasefire: string): GameState => setTrack(c3(s), "ceasefire", ceasefire);
const declare = (faction = "pkk"): AnyCommand => ({ type: "DeclareCeasefire", faction });
const rb = (s: GameState, side: string): number => ruleset.spaces.reduce((n, x) => n + (s.spaces[x.id]?.markers["restraintBroken"]?.[side] ?? 0), 0);
const warnings = (s: GameState, c: AnyCommand): string[] => engine.validate(ruleset, s, c).warnings.map((w) => w.message);
const attack = op("pkk", "opOnly", { op: "pkk.attack", locations: ["hakkari"] });
const coerce = op("pkk", "opOnly", { op: "pkk.coerce", locations: ["mardin-batman"] });
const rallyBase = op("pkk", "opOnly", { op: "pkk.rally", locations: ["hakkari"], perLocation: { hakkari: { option: "base" } } });
const rallyPlace = op("pkk", "opOnly", { op: "pkk.rally", locations: ["hakkari"], perLocation: { hakkari: { option: "place" } } });
const assault = op("state", "opOnly", { op: "state.assault", locations: ["botan"] });
const activeBotan = (s: GameState): GameState => setPieces(setPieces(s, "botan", "guerrilla", 0), "botan", "guerrilla", 2, "active");

describe("Declare Ceasefire (07 s7.1)", () => {
  it("from C3 in the Limited Op box: Ceasefire to Declared, Europe +1", () => {
    const { state } = play(c3(turnOf("pkk")), declare());
    expect(state.tracks["ceasefire"]).toBe("declared");
    expect(state.tracks["europe"]).toBe(2);
    expect(state.initiative.boxes["pkk"]).toBe("limitedOp");
  });

  it("needs C3, no ceasefire in force, the PKK and an open Limited Op box", () => {
    expect(codes(turnOf("pkk"), declare())).toEqual(["ceasefireCampaign"]);
    expect(codes(at(turnOf("pkk"), "declared"), declare())).toEqual(["ceasefireActive"]);
    expect(codes(c3(turnOf("state")), declare("state"))).toContain("ceasefireFaction");
    const second = { ...c3(turnOf("state")), initiative: { ...c3(turnOf("state")).initiative, boxes: { ...c3(turnOf("state")).initiative.boxes, state: "limitedOp" }, actedThisCard: ["state"] } };
    expect(engine.validate(ruleset, second, declare()).violations.map((v) => v.message)).toEqual(["Declare Ceasefire uses the Limited Op box."]);
  });
});

describe("Ceasefire restrictions and breach (07 s7.2)", () => {
  it("PKK Attack while Declared breaks it: PKK Restraint Broken, Ceasefire None, Europe -1, with a warning first", () => {
    const board = setTrack(withRoll(at(turnOf("pkk"), "declared"), 6), "europe", 2);
    expect(warnings(board, attack)).toEqual(["This breaks the ceasefire: PKK Restraint Broken, Ceasefire to None, Europe -1."]);
    const { state } = play(board, attack);
    expect([state.tracks["ceasefire"], state.tracks["europe"], rb(state, "pkk")]).toEqual(["none", 1, 1]);
  });

  it("Coerce and a domestic Base are forbidden only from Reciprocal Restraint", () => {
    expect(warnings(at(turnOf("pkk"), "declared"), coerce)).toEqual([]);
    expect(play(at(turnOf("pkk"), "reciprocalRestraint"), coerce).state.tracks["ceasefire"]).toBe("none");
    expect(warnings(at(turnOf("pkk"), "talks"), rallyBase)).toHaveLength(1);
    expect(warnings(at(turnOf("pkk"), "talks"), rallyPlace)).toEqual([]);
    expect(play(at(turnOf("pkk"), "talks"), rallyPlace).state.tracks["ceasefire"]).toBe("talks");
  });

  it("State Assault while Declared places the State marker only; from Reciprocal Restraint it breaks it, Legitimacy -2", () => {
    const declared = activeBotan(at(turnOf("state"), "declared"));
    expect(warnings(declared, assault)).toEqual(["This places the State Restraint Broken marker. The State can no longer accept this ceasefire."]);
    const one = play(declared, assault).state;
    expect([one.tracks["ceasefire"], one.tracks["legitimacy"], rb(one, "state")]).toEqual(["declared", 10, 1]);
    const restraint = activeBotan(at(turnOf("state"), "reciprocalRestraint"));
    expect(warnings(restraint, assault)).toEqual(["This breaks the ceasefire: State Restraint Broken, Ceasefire to None, Legitimacy -2."]);
    const two = play(restraint, assault).state;
    expect([two.tracks["ceasefire"], two.tracks["legitimacy"], rb(two, "state")]).toEqual(["none", 8, 1]);
  });

  it("places at most one Restraint Broken marker per faction; no restriction applies with no ceasefire", () => {
    const marked = setMarkers(activeBotan(at(turnOf("state"), "declared")), "dersim", "restraintBroken", 1, "state");
    expect(rb(play(marked, assault).state, "state")).toBe(1);
    expect(warnings(activeBotan(c3(turnOf("state"))), assault)).toEqual([]);
  });
});
