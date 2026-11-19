// Designer decisions of 2026-11-19 (docs/audit/OPEN_QUESTIONS.md, section "Decisions (2026-11-19)").
// The Op Only revision of decision 5 is in decisions.test.ts, Decision 5 block.
import { describe, expect, it } from "vitest";
import type { AnyCommand, GameState } from "../src/engine/core/types.ts";
import { codes, op, pieces, play, ruleset, setPieces, setTrack, turnOf } from "./board.ts";

const garrison = (perLocation: Record<string, unknown>, box = "limitedOp"): AnyCommand => op("state", box, { op: "state.garrison", locations: ["mardin"], perLocation: { mardin: perLocation } });

describe("Decision 18 (m-17): every selected location must be able to change something", () => {
  it("Rally in Europe at the track end (5) with no Europe Ban marker is refused", () => {
    const rally = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["europe"], perLocation: { europe: {} } });
    expect(codes(setTrack(turnOf("pkk"), "europe", 5), rally)).toContain("rallyEuropeCap");
    expect(codes(setTrack(turnOf("pkk"), "europe", 4), rally)).toEqual([]);
  });

  it("Rally flip with no Active Guerrilla is refused", () => {
    const flip = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["hakkari"], perLocation: { hakkari: { option: "flip" } } });
    expect(codes(turnOf("pkk"), flip)).toContain("rallyFlipGuerrilla");
    expect(codes(setPieces(turnOf("pkk"), "hakkari", "guerrilla", 1, "active"), flip)).toEqual([]);
  });

  it("Assault that can remove nothing (1 Troop in a Mountain) is refused", () => {
    const assault = op("state", "limitedOp", { op: "state.assault", locations: ["hakkari"], perLocation: {} });
    const board = setPieces(setPieces(turnOf("state"), "hakkari", "guerrilla", 0), "hakkari", "guerrilla", 1, "active");
    expect(codes(setPieces(board, "hakkari", "troops", 1), assault)).toContain("assaultNoEffect");
    expect(codes(setPieces(board, "hakkari", "troops", 2), assault)).toEqual([]);
  });

  it("Rally flip is legal where its Special Activity acts: Extort in the same host box", () => {
    const flip = (sa: string, timing = "after"): AnyCommand => op("pkk", "opSa", { op: "pkk.rally", locations: ["syria-bekaa"], perLocation: { "syria-bekaa": { option: "flip" } }, sa: { action: "pkk.extort", locations: [sa], perLocation: {}, timing } });
    expect(codes(turnOf("pkk"), flip("syria-bekaa"))).toEqual([]);
    expect(codes(turnOf("pkk"), flip("syria-bekaa", "before"))).toEqual([]);
    expect(codes(turnOf("pkk"), flip("kdp-zone"))).toContain("rallyFlipGuerrilla");
  });

  it("Assault is legal where its Special Activity acts: Air Mobility brings Troops into the Mountain space", () => {
    const board = setPieces(setPieces(setPieces(turnOf("state"), "hakkari", "guerrilla", 0), "hakkari", "guerrilla", 1, "active"), "hakkari", "troops", 1);
    const assault = (timing: string): AnyCommand => op("state", "opSa", { op: "state.assault", locations: ["hakkari"], perLocation: {}, sa: { action: "state.air-mobility", locations: ["diyarbakir-city", "hakkari"], perLocation: { hakkari: { moves: [{ from: "diyarbakir-city", count: 1 }] } }, timing } });
    expect(codes(board, assault("before"))).toEqual([]);
    expect(codes(board, assault("after"))).toEqual([]);
  });

  it("Sweep with no Troops moving in and nothing to activate is refused", () => {
    const sweep = (moves: unknown[]): AnyCommand => op("state", "limitedOp", { op: "state.sweep", locations: ["elazig"], perLocation: { elazig: { moves } } });
    expect(codes(turnOf("state"), sweep([]))).toContain("sweepNoEffect");
    expect(codes(turnOf("state"), sweep([{ from: "bingol-tunceli", count: 1 }]))).toEqual([]);
  });

  it("Diplomacy against a track already at its end is refused: Europe 0, Syria Hostile", () => {
    const train = (target: string): AnyCommand => op("state", "opSa", { op: "state.train", locations: ["diyarbakir-city"], perLocation: { "diyarbakir-city": { option: "place", troops: 1 } }, sa: { action: "state.diplomacy", locations: [target], perLocation: {}, timing: "after" } });
    expect(codes(setTrack(turnOf("state"), "europe", 0), train("europe"))).toContain("diplomacyNoEffect");
    expect(codes(setTrack(turnOf("state"), "posture.syria", "hostile"), train("syria-bekaa"))).toContain("diplomacyNoEffect");
    expect(codes(turnOf("state"), train("europe"))).toEqual([]);
  });

  it("Garrison that moves no Police and activates no Guerrilla is refused", () => {
    const hidden = turnOf("state");
    const empty = setPieces(hidden, "mardin", "guerrilla", 0);
    expect(codes(empty, garrison({ moves: [] }))).toContain("garrisonNoEffect");
    expect(codes(hidden, garrison({ moves: [], activate: 0 }))).toContain("garrisonNoEffect");
    expect(codes(hidden, garrison({ moves: [] }))).toEqual([]);
  });
});

describe("Decision 20 (m-11): Garrison activates up to its maximum; the State chooses how many", () => {
  // Mardin is a Plain: 3 Police activate up to 3.
  const board = (): GameState => setPieces(setPieces(turnOf("state"), "mardin", "police", 3), "mardin", "guerrilla", 3);
  const faces = (s: GameState): Readonly<Record<string, number>> => pieces(s, "mardin", "guerrilla");

  it("activates the chosen number", () => {
    expect(faces(play(board(), garrison({ moves: [], activate: 1 })).state)).toMatchObject({ active: 1, underground: 2 });
  });

  it("activates the maximum when no number is given", () => {
    expect(faces(play(board(), garrison({ moves: [] })).state)).toMatchObject({ active: 3, underground: 0 });
  });

  it("refuses a number above the maximum or not a whole number", () => {
    expect(codes(board(), garrison({ moves: [], activate: 4 }))).toContain("garrisonActivate");
    expect(codes(board(), garrison({ moves: [], activate: -1 }))).toContain("garrisonActivate");
  });
});

describe("Decision 22 (m-24): Guerrillas leave Western Cities at Redeploy to a domestic space with a PKK Base", () => {
  const at = (s: GameState): GameState => ({ ...s, turn: { ...s.turn, phase: "propaganda", step: ruleset.sequence.propagandaPhases.indexOf("redeploy") } });
  const choose = (to: string, from = "western-cities"): AnyCommand => ({ type: "PropagandaChoice", phase: "redeploy", choice: { guerrilla: [{ from, to, count: 1 }] } });
  const board = at(setPieces(turnOf("pkk"), "western-cities", "guerrilla", 1));

  it("allows any domestic space with a PKK Base, with no link needed", () => {
    expect(codes(board, choose("sirnak"))).toEqual([]);
  });

  it("refuses a space with no PKK Base, an external box and other non-adjacent moves", () => {
    expect(codes(board, choose("elazig"))).toContain("redeployWhere");
    expect(codes(board, choose("kdp-zone"))).toContain("redeployWhere");
    expect(codes(at(setPieces(turnOf("pkk"), "elazig", "guerrilla", 1)), choose("sirnak", "elazig"))).toContain("redeployWhere");
  });
});
