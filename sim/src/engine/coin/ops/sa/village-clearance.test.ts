import { describe, expect, it } from "vitest";
import type { GameState } from "../../../core/types.ts";
import { netChange } from "../../stop-rules.ts";
import { codes, engine, inCampaign, op, pieces, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf } from "../../../../../test/board.ts";

// T-OPS, T-VAL and T-PERV for Village Clearance (11 P3b-02; research 06 s3.4, 07 s3, 09 s7.1;
// approved text docs/prototype/27; PA-18). Hakkari in S0: Mountain, Pop 1, Passive Opposition,
// 2 Troops, 1 Police, 2 Underground Guerrillas, State Control.
const ready = (s: GameState = turnOf("state")): GameState => { const t = setTrack(s, "emergencyRule", "ohal"); return inCampaign(ruleset, t, "C3"); };
const clear = (target = "hakkari", reception: string | null = "diyarbakir-city", opAction = "state.sweep", timing = "after") =>
  op("state", "opSa", { op: opAction, locations: [target], sa: { action: "state.village-clearance", locations: [target], perLocation: reception === null ? {} : { [target]: { reception } }, timing } });
const legitimacy = (s: GameState): unknown => s.tracks["legitimacy"];
const level = (s: GameState, id: string): number | null | undefined => s.spaces[id]?.level;
const marker = (s: GameState, id: string, m: string): Readonly<Record<string, number>> => s.spaces[id]?.markers[m] ?? {};

describe("Village Clearance effects (06 s3.4)", () => {
  it("applies the seven effects in order", () => {
    const board = setMarkers(ready(), "hakkari", "office", 1);
    const { state, entries } = play(board, clear());
    const steps = entries.filter((e) => e.kind === "EffectApplied" && (e.ruleRef ?? "").startsWith("06 s3.4")).map((e) => [e.ruleRef, e.data["effect"], e.data["marker"] ?? e.data["track"] ?? ""].map((x) => JSON.stringify(x)).join(":"));
    expect(steps).toEqual([
      '"06 s3.4 effect 1":"shiftLevel":""',
      '"06 s3.4 effect 2":"adjustTrack":"legitimacy"',
      '"06 s3.4 effect 3":"placeMarker":"displacement"',
      '"06 s3.4 effect 4":"placeMarker":"stateHarm"',
      '"06 s3.4 effect 5":"placeMarker":"reception"',
      '"06 s3.4 effect 6":"setPieceState":""',
      '"06 s3.4 effect 7":"adjustTrack":"legitimacy"',
    ]);
    expect(level(state, "hakkari")).toBe(0);
    expect(legitimacy(state)).toBe(10 - 2 - 1);
    expect(marker(state, "hakkari", "displacement")["new"]).toBe(1);
    expect(marker(state, "hakkari", "stateHarm")).toEqual({ default: 1 });
    expect(marker(state, "diyarbakir-city", "reception")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 2 });
  });

  it("costs Legitimacy 2 x Pop and no Resources; no Office means no extra cost", () => {
    const board = setPieces(setPieces(setLevel(ready(), "mardin-batman", -2), "mardin-batman", "troops", 2), "mardin-batman", "guerrilla", 0);
    const { state } = play(board, clear("mardin-batman", "western-cities"));
    expect(legitimacy(state)).toBe(10 - 8);
    expect(level(state, "mardin-batman")).toBe(-1);
    expect(state.tracks["resources.state"]).toBe(12 - 2);
    expect(marker(state, "western-cities", "reception")).toEqual({ default: 1 });
  });

  it("at Neutral leaves the level unchanged and still applies the other effects", () => {
    const { state, entries } = play(setLevel(ready(), "hakkari", 0), clear());
    expect(level(state, "hakkari")).toBe(0);
    expect(entries.some((e) => e.data["effect"] === "shiftLevel")).toBe(false);
    expect(legitimacy(state)).toBe(8);
  });

  it("with no Reception marker available costs Legitimacy 1 instead and needs no Reception choice", () => {
    const empty = { ...ready(), markerPools: { ...ready().markerPools, reception: 0 } };
    expect(codes(empty, clear("hakkari", null))).toEqual([]);
    const { state } = play(empty, clear("hakkari", null));
    expect(legitimacy(state)).toBe(10 - 2 - 1);
  });

  it("a State Harm marker already present blocks the shift; the other effects apply (PA-18)", () => {
    const { state, entries } = play(setMarkers(ready(), "hakkari", "stateHarm", 1), clear());
    expect(level(state, "hakkari")).toBe(-1);
    expect(entries.some((e) => e.kind === "EffectSkipped" && e.data["reason"] === "block" && e.assumptionRef === "PA-18")).toBe(true);
    expect(marker(state, "hakkari", "displacement")["new"]).toBe(1);
  });

  it("accompanies Garrison, and runs before the Op when chosen", () => {
    expect(codes(ready(), clear("hakkari", "diyarbakir-city", "state.garrison"))).toEqual([]);
    expect(codes(ready(), clear("hakkari", "diyarbakir-city", "state.sweep", "before"))).toEqual([]);
    expect(codes(ready(), clear("hakkari", "diyarbakir-city", "state.assault"))).toContain("saNotWithOp");
  });

  it("blocks Rally there afterwards (07 s3.2 item 3)", () => {
    const { state } = play(ready(), clear());
    const pkk = { ...state, turn: { ...state.turn, phase: "card" }, initiative: { ...state.initiative, firstEligible: "pkk", secondEligible: "state", actedThisCard: [] } };
    expect(codes(pkk, op("pkk", "limitedOp", { op: "pkk.rally", locations: ["hakkari"], perLocation: { hakkari: { option: "place" } } }))).toContain("rallyDisplaced");
  });
});

describe("Village Clearance conditions (06 s3.4)", () => {
  it("needs OHAL or OHAL Extended Powers", () => {
    expect(codes(setTrack(ready(), "emergencyRule", "martialLaw"), clear())).toEqual(["clearanceStep"]);
    expect(codes(setTrack(ready(), "emergencyRule", "normalizing"), clear())).toEqual(["clearanceStep"]);
    expect(codes(setTrack(ready(), "emergencyRule", "ohalExtendedPowers"), clear())).toEqual([]);
    expect(engine.validate(ruleset, setTrack(ready(), "emergencyRule", "martialLaw"), clear()).violations[0]?.message).toBe("Village Clearance: Emergency Rule is Martial Law. Needs OHAL or OHAL Extended Powers (06 s3.4 condition 1).");
  });

  it("needs the C3 switch (DEC-68; 10 s6.2)", () => {
    const c2 = inCampaign(ruleset, ready(), "C2");
    expect(codes(c2, clear())).toEqual(["clearancePowers"]);
    expect(engine.validate(ruleset, c2, clear()).violations[0]?.message).toBe("Village Clearance is available from Campaign C3 (06 s3.4 condition 2).");
    expect(codes(ready(), clear())).toEqual([]);
  });

  it("targets exactly one Mountain or Plain space that the Op selected", () => {
    const two = op("state", "opSa", { op: "state.sweep", locations: ["hakkari", "botan"], sa: { action: "state.village-clearance", locations: ["hakkari", "botan"], perLocation: {}, timing: "after" } });
    expect(codes(ready(), two)).toContain("clearanceSpaces");
    const other = op("state", "opSa", { op: "state.sweep", locations: ["botan"], sa: { action: "state.village-clearance", locations: ["hakkari"], perLocation: { hakkari: { reception: "diyarbakir-city" } }, timing: "after" } });
    expect(codes(ready(), other)).toEqual(["clearanceOpSpace"]);
    expect(codes(ready(), clear("diyarbakir-city"))).toContain("clearanceTerrain");
  });

  it("needs State Control, Troops and Police", () => {
    expect(codes(setPieces(ready(), "hakkari", "police", 0), clear())).toEqual(["clearanceWhere"]);
    expect(codes(setPieces(ready(), "hakkari", "guerrilla", 4), clear())).toEqual(["clearanceWhere"]);
    expect(codes(setPieces(setPieces(ready(), "hakkari", "troops", 0), "hakkari", "police", 3), clear("hakkari", "diyarbakir-city", "state.garrison"))).toEqual(["clearanceWhere"]);
  });

  it("needs Neutral or Opposition and no Displacement marker", () => {
    expect(codes(setLevel(ready(), "hakkari", 1), clear())).toEqual(["clearanceLevel"]);
    expect(codes(setMarkers(ready(), "hakkari", "displacement", 1, "old"), clear())).toEqual(["clearanceDisplaced"]);
  });

  it("needs Legitimacy (2 x Pop) + 1 or more", () => {
    expect(codes(setTrack(ready(), "legitimacy", 3), clear())).toEqual([]);
    expect(codes(setTrack(ready(), "legitimacy", 2), clear())).toEqual(["clearanceLegitimacy"]);
  });

  it("needs a Reception space with a receptionTarget tag while Reception markers are available", () => {
    expect(codes(ready(), clear("hakkari", null))).toEqual(["clearanceReception"]);
    expect(codes(ready(), clear("hakkari", "elazig"))).toEqual(["clearanceReception"]);
  });
});

describe("T-PERV: Village Clearance never raises the State's relative margin (09 s7.1)", () => {
  // Cases from the 09 s7.1 table, with the target at State Control and enough Legitimacy.
  const cases: readonly { id: string; pop: number; lvl: number }[] = [
    { id: "mardin-batman", pop: 4, lvl: -2 },
    { id: "mardin-batman", pop: 4, lvl: -1 },
    { id: "hakkari", pop: 1, lvl: -2 },
    { id: "diyarbakir-rural", pop: 2, lvl: 0 },
  ];
  for (const c of cases) {
    it(`Pop ${String(c.pop)}, level ${String(c.lvl)}: relative change is negative`, () => {
      const base = setPieces(setPieces(setPieces(setLevel(ready(), c.id, c.lvl), c.id, "troops", 3), c.id, "police", 2), c.id, "guerrilla", 1);
      expect(ruleset.spaces.find((s) => s.id === c.id)?.pop).toBe(c.pop);
      const op0 = play(base, op("state", "limitedOp", { op: "state.sweep", locations: [c.id] })).state;
      const both = play(base, clear(c.id)).state;
      expect(netChange(ruleset, op0, both, "state")).toBeLessThan(0);
      expect(both.spaces[c.id]?.markers["displacement"]?.["new"]).toBe(1);
    });
  }
});
