import { describe, expect, it } from "vitest";
import { createExec } from "../../../core/exec.ts";
import type { GameState } from "../../../core/types.ts";
import { checkStandings } from "../../victory.ts";
import { revealCovert } from "../../propaganda/legitimacy.ts";
import { codes, engine, op, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf } from "../../../../../test/board.ts";

// T-OPS, T-VAL and T-VIC for Covert Action (11 P3b-03; research 06 s3.5, 05 s6.4 step 5, 09 s3;
// approved text docs/prototype/28). Hakkari in S0: 2 Troops, 1 Police, 2 Underground Guerrillas,
// State Control. Botan holds the Sweep, so the SA space need not be an Op space.
const c3 = (s: GameState = turnOf("state")): GameState => ({ ...s, turn: { ...s.turn, campaign: "C3" } });
const covert = (target = "hakkari", opAction = "state.sweep", opSpace = "botan") =>
  op("state", "opSa", { op: opAction, locations: [opSpace], sa: { action: "state.covert-action", locations: [target], perLocation: {}, timing: "before" } });
const marker = (s: GameState, id: string, m: string): number => Object.values(s.spaces[id]?.markers[m] ?? {}).reduce((a, b) => a + b, 0);

describe("Covert Action effects (06 s3.5)", () => {
  it("removes 1 Underground Guerrilla without Activation and places 1 Covert marker, at no Resources or Legitimacy cost", () => {
    const board = c3();
    const { state, entries } = play(board, covert());
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 1, active: 0 });
    expect(marker(state, "hakkari", "covert")).toBe(1);
    expect(state.tracks["legitimacy"]).toBe(10);
    expect(state.tracks["resources.state"]).toBe(12 - 2);
    expect(entries.filter((e) => (e.ruleRef ?? "").startsWith("06 s3.5") && e.kind === "EffectApplied").map((e) => e.data["effect"])).toEqual(["removePieces", "placeMarker"]);
  });

  it("accompanies Garrison too, and refuses Assault", () => {
    expect(codes(c3(), covert("hakkari", "state.garrison", "hakkari"))).toEqual([]);
    expect(codes(c3(), covert("hakkari", "state.assault", "hakkari"))).toContain("saNotWithOp");
  });
});

describe("Covert Action conditions (06 s3.5)", () => {
  it("is available from C3", () => {
    expect(codes(turnOf("state"), covert())).toEqual(["covertCampaign"]);
    expect(codes({ ...turnOf("state"), turn: { ...turnOf("state").turn, campaign: "C4" } }, covert())).toEqual([]);
  });

  it("needs Legitimacy 4 or more", () => {
    expect(codes(setTrack(c3(), "legitimacy", 4), covert())).toEqual([]);
    expect(codes(setTrack(c3(), "legitimacy", 3), covert())).toEqual(["covertLegitimacy"]);
    expect(engine.validate(ruleset, setTrack(c3(), "legitimacy", 3), covert()).violations[0]?.message).toBe("Covert Action needs Legitimacy 4 or more. Legitimacy is 3.");
  });

  it("targets exactly 1 space with State Control, Police and an Underground Guerrilla", () => {
    const two = op("state", "opSa", { op: "state.sweep", locations: ["botan"], sa: { action: "state.covert-action", locations: ["hakkari", "mardin-batman"], perLocation: {}, timing: "before" } });
    expect(codes(c3(), two)).toEqual(["covertSpaces"]);
    expect(codes(setPieces(c3(), "hakkari", "police", 0), covert())).toEqual(["covertWhere"]);
    expect(codes(setPieces(c3(), "hakkari", "guerrilla", 4), covert())).toEqual(["covertWhere"]);
    const active = setPieces(setPieces(c3(), "hakkari", "guerrilla", 0), "hakkari", "guerrilla", 2, "active");
    expect(codes(active, covert())).toEqual(["covertWhere"]);
  });

  it("never targets a space with an Office", () => {
    expect(codes(setMarkers(c3(), "hakkari", "office", 1), covert())).toEqual(["covertOffice"]);
  });

  it("is refused when no Covert marker is available", () => {
    const empty = { ...c3(), markerPools: { ...c3().markerPools, covert: 0 } };
    expect(codes(empty, covert())).toEqual(["covertSupply"]);
  });
});

describe("T-VIC: Covert marker check penalty and reveal (09 s3 step 1, 06 s3.5)", () => {
  it("each unrevealed marker costs the State 2 at a check, and none at final scoring", () => {
    const { state } = play(c3(), covert());
    const score = (s: GameState, final: boolean): number | undefined => checkStandings(ruleset, s, final).find((x) => x.faction === "state")?.score;
    const before = score(c3(), false) ?? 0;
    expect(score(state, false)).toBe(before - 2);
    expect(score(state, true)).toBe(before);
  });

  it("a revealed marker becomes State Harm and costs Legitimacy 2", () => {
    const { state } = play(c3(), covert());
    const ctx = createExec(ruleset, state);
    revealCovert(ctx, "hakkari", "06 s3.5");
    expect(marker(ctx.state, "hakkari", "covert")).toBe(0);
    expect(marker(ctx.state, "hakkari", "stateHarm")).toBe(1);
    expect(ctx.state.tracks["legitimacy"]).toBe(8);
  });
});
