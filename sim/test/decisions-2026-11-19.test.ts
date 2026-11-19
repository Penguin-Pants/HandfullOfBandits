// Designer decisions of 2026-11-19 (docs/audit/OPEN_QUESTIONS.md, section "Decisions (2026-11-19)").
// The Op Only revision of decision 5 is in decisions.test.ts, Decision 5 block.
import { describe, expect, it } from "vitest";
import type { AnyCommand, GameState } from "../src/engine/core/types.ts";
import { codes, op, pieces, play, ruleset, setPieces, setTrack, turnOf, withCard, withRoll } from "./board.ts";

const garrison = (perLocation: Record<string, unknown>, box = "limitedOp"): AnyCommand => op("state", box, { op: "state.garrison", locations: ["mardin"], perLocation: { mardin: perLocation } });

describe("Decision 18 (m-17): every selected location must change, by the Operation or its Special Activity there", () => {
  // One generic check (chooseOperationHandler): a dry run of the whole command on the real board.
  const NO_EFFECT = "locationNoEffect";

  it("Rally in Europe at the track end (5) with no Europe Ban marker is refused", () => {
    const rally = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["europe"], perLocation: { europe: {} } });
    expect(codes(setTrack(turnOf("pkk"), "europe", 5), rally)).toEqual([NO_EFFECT]);
    expect(codes(setTrack(turnOf("pkk"), "europe", 4), rally)).toEqual([]);
  });

  it("Rally flip with only Underground Guerrillas is refused, unless the Rally or its SA changes the space", () => {
    const flip = (extra: Record<string, unknown> = {}): AnyCommand => op("pkk", "limitedOp", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "flip" } }, ...extra });
    expect(codes(turnOf("pkk"), flip())).toEqual([NO_EFFECT]);
    expect(codes(setPieces(turnOf("pkk"), "sirnak", "guerrilla", 1, "active"), flip())).toEqual([]);
    // Agitation in the same space changes it (Codex review on #125).
    expect(codes(turnOf("pkk"), flip({ subActions: [{ action: "agitate", space: "sirnak", params: { shifts: 1 } }] }))).toEqual([]);
    const extort = (sa: string): AnyCommand => op("pkk", "opSa", { op: "pkk.rally", locations: ["syria-bekaa"], perLocation: { "syria-bekaa": { option: "flip" } }, sa: { action: "pkk.extort", locations: [sa], perLocation: {}, timing: "after" } });
    expect(codes(turnOf("pkk"), extort("syria-bekaa"))).toEqual([]);
    expect(codes(turnOf("pkk"), extort("kdp-zone"))).toEqual([NO_EFFECT]);
  });

  it("Assault that removes nothing (1 Troop in a Mountain) is refused, unless Air Mobility brings Troops in", () => {
    const board = setPieces(setPieces(setPieces(turnOf("state"), "hakkari", "guerrilla", 0), "hakkari", "guerrilla", 1, "active"), "hakkari", "troops", 1);
    expect(codes(board, op("state", "limitedOp", { op: "state.assault", locations: ["hakkari"], perLocation: {} }))).toEqual([NO_EFFECT]);
    expect(codes(setPieces(board, "hakkari", "troops", 2), op("state", "limitedOp", { op: "state.assault", locations: ["hakkari"], perLocation: {} }))).toEqual([]);
    const lifted = (timing: string): AnyCommand => op("state", "opSa", { op: "state.assault", locations: ["hakkari"], perLocation: {}, sa: { action: "state.air-mobility", locations: ["diyarbakir-city", "hakkari"], perLocation: { hakkari: { moves: [{ from: "diyarbakir-city", count: 1 }] } }, timing } });
    expect(codes(board, lifted("before"))).toEqual([]);
    expect(codes(board, lifted("after"))).toEqual([]);
  });

  it("Sweep with nothing to move or activate is refused, also when an unused Air Mobility location names it", () => {
    const sweep = (moves: unknown[]): AnyCommand => op("state", "limitedOp", { op: "state.sweep", locations: ["elazig"], perLocation: { elazig: { moves } } });
    expect(codes(turnOf("state"), sweep([]))).toEqual([NO_EFFECT]);
    expect(codes(turnOf("state"), sweep([{ from: "bingol-tunceli", count: 1 }]))).toEqual([]);
    // Codex review on #125: listing Elazig as an Air Mobility location that moves nothing there is not a change.
    const loophole = op("state", "opSa", { op: "state.sweep", locations: ["elazig"], perLocation: { elazig: { moves: [] } }, sa: { action: "state.air-mobility", locations: ["elazig", "diyarbakir-city", "mardin"], perLocation: { mardin: { moves: [{ from: "diyarbakir-city", count: 1 }] } }, timing: "after" } });
    expect(codes(turnOf("state"), loophole)).toEqual([NO_EFFECT]);
  });

  it("Diplomacy against a track already at its end is refused: Europe 0, Syria Hostile", () => {
    const train = (target: string): AnyCommand => op("state", "opSa", { op: "state.train", locations: ["diyarbakir-city"], perLocation: { "diyarbakir-city": { option: "place", troops: 1 } }, sa: { action: "state.diplomacy", locations: [target], perLocation: {}, timing: "after" } });
    expect(codes(setTrack(turnOf("state"), "europe", 0), train("europe"))).toContain("diplomacyNoEffect");
    expect(codes(setTrack(turnOf("state"), "posture.syria", "hostile"), train("syria-bekaa"))).toContain("diplomacyNoEffect");
    expect(codes(turnOf("state"), train("europe"))).toEqual([]);
  });

  it("Garrison that moves no Police into its space and activates nothing is refused", () => {
    const hidden = turnOf("state");
    expect(codes(setPieces(hidden, "mardin", "guerrilla", 0), garrison({ moves: [] }))).toEqual([NO_EFFECT]);
    expect(codes(hidden, garrison({ moves: [], activate: 0 }))).toEqual([NO_EFFECT]);
    expect(codes(hidden, garrison({ moves: [] }))).toEqual([]);
  });

  it("a ceasefire record marker is not a change: a useless Assault stays refused during Declared", () => {
    const board = setTrack(setPieces(setPieces(setPieces(turnOf("state"), "hakkari", "guerrilla", 0), "hakkari", "guerrilla", 1, "active"), "hakkari", "troops", 1), "ceasefire", "declared");
    expect(codes(board, op("state", "limitedOp", { op: "state.assault", locations: ["hakkari"], perLocation: {} }))).toEqual([NO_EFFECT]);
  });

  it("a free Event Operation obeys the check too (DK-011 free Sweep in Sirnak)", () => {
    const sweep = (s: GameState): string[] => codes(withCard(s, "DK-011"), { type: "ChooseEvent", faction: "state", side: "unshaded", answers: [{ locations: ["sirnak"], perLocation: { sirnak: { moves: [] } } }] });
    expect(sweep(turnOf("state"))).toEqual([]);
    expect(sweep(setPieces(turnOf("state"), "sirnak", "guerrilla", 0))).toEqual([NO_EFFECT]);
  });

  it("Host Pressure replan counts only replacements that change something, Agitation included (DEC-54)", () => {
    // Host Pressure closes the KDP Zone. Nothing is Available and Europe is capped, so a flip of
    // Underground-only Guerrillas changes nothing; a flip plus Agitation in Sirnak (PKK Base) does.
    const board = (pkk: number): GameState => {
      const s = setTrack(setTrack(setPieces(turnOf("pkk"), "kdp-zone", "guerrilla", 1, "active"), "posture.kdp", "tolerant"), "europe", 5);
      return setTrack({ ...s, pools: { ...s.pools, guerrilla: { ...s.pools["guerrilla"], available: 0 }, pkkBase: { ...s.pools["pkkBase"], available: 0 } } } as GameState, "resources.pkk", pkk);
    };
    const rally = op("pkk", "opSa", { op: "pkk.rally", locations: ["kdp-zone"], perLocation: { "kdp-zone": { option: "flip" } }, sa: { action: "pkk.host-pressure", locations: ["kdp-zone"], perLocation: {}, timing: "before" } });
    // 3 Resources: Host Pressure costs 2, so 1 is left and flip plus Agitation (2) is unaffordable: the Operation ends.
    const poor = play(withRoll(board(3), 1), rally);
    expect(poor.state.tracks["posture.kdp"]).toBe("restricted");
    expect([poor.state.pending, poor.entries.some((e) => e.data["reason"] === "noLegalReplacement")]).toEqual([null, true]);
    // 10 Resources: flip plus Agitation in Sirnak is a legal replacement, so the decision opens and accepts it.
    const rich = play(withRoll(board(10), 1), rally).state;
    expect(rich.pending?.resume?.kind).toBe("operation");
    const replace = op("pkk", "opSa", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "flip" } }, subActions: [{ action: "agitate", space: "sirnak", params: { shifts: 1 } }] });
    expect(codes(rich, replace)).toEqual([]);
  });

  it("an Attack is never judged by its die: the check skips a dry run that rolls", () => {
    const board = setPieces(turnOf("pkk"), "hakkari", "guerrilla", 1);
    expect(codes(board, op("pkk", "limitedOp", { op: "pkk.attack", locations: ["hakkari"], perLocation: {} }))).toEqual([]);
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
