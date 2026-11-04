import { describe, expect, it } from "vitest";
import { codes, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf } from "../../../../test/board.ts";
import type { AnyCommand, GameState } from "../../core/types.ts";
import { PHASE } from "../phases.ts";

// T-PROP for Legal Politics (11 P3b-04; research 07 s6.3, s6.4, 05 s6.5; approved text
// docs/prototype/29, DEC-65). S0 board: Hakkari and Dersim are Pop 1, so never on the line 4 list.
const at = (state: GameState): GameState => {
  const step = ruleset.sequence.propagandaPhases.indexOf("legalPolitics");
  return { ...state, deck: { ...state.deck, currentCard: "DK-016" }, turn: { ...state.turn, phase: PHASE.propaganda, propagandaRound: 1, step } };
};
const open = (s: GameState = turnOf("state")): GameState => at(setTrack(s, "legalSpace", "open"));
const offices = (s: GameState, ...ids: string[]): GameState => ids.reduce((b, id) => setMarkers(b, id, "office", 1), s);
const withCase = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, closureCase: true } });
const advance: AnyCommand = { type: "Advance" };
const file: AnyCommand = { type: "PropagandaChoice", phase: "legalPolitics", choice: { closureFiling: true } };
const where = (s: GameState): string[] => ruleset.spaces.filter((x) => (s.spaces[x.id]?.markers["office"]?.["default"] ?? 0) > 0).map((x) => x.id);

describe("Legal Politics procedure table (07 s6.4)", () => {
  it("is skipped while Legal Space is Absent", () => {
    const { state, entries } = play(at(turnOf("state")), advance);
    expect(where(state)).toEqual([]);
    expect(entries.some((e) => e.kind === "EffectSkipped" && e.data["effect"] === "legalPolitics")).toBe(true);
  });

  it("line 4 places 1 Office in the first eligible space", () => {
    expect(where(play(open(), advance).state)).toEqual(["diyarbakir-city"]);
  });

  it("line 4 skips spaces at an Active level, under PKK Control or with an Office", () => {
    let board = setLevel(open(), "diyarbakir-city", 2);
    board = setPieces(setPieces(board, "western-cities", "guerrilla", 9), "western-cities", "police", 0);
    board = setPieces(setPieces(board, "western-cities", "troops", 0), "western-cities", "stateBase", 0);
    board = offices(board, "mardin-batman");
    expect(where(play(board, advance).state)).toEqual(["mardin-batman", "van-bitlis"]);
  });

  it("line 6: reaching the limit in line 4 files a case in the same phase (DEC-65 point 2)", () => {
    const { state } = play(offices(open(), "diyarbakir-city", "western-cities", "mardin-batman"), advance);
    expect(where(state)).toHaveLength(4);
    expect(state.flags["closureCase"]).toBe(true);
  });

  it("line 5 removes an Office outside the list first, then the latest in the list (DEC-65 point 1)", () => {
    const board = at(setTrack(offices(turnOf("state"), "diyarbakir-city", "western-cities", "mardin-batman", "van-bitlis", "hakkari"), "legalSpace", "prosecuted"));
    const { state } = play(board, advance);
    expect([...where(state)].sort()).toEqual(["diyarbakir-city", "mardin-batman", "western-cities"]);
  });

  it("line 1 bans the party when a case was pending at phase start", () => {
    const { state } = play(withCase(offices(open(), "diyarbakir-city", "western-cities", "mardin-batman")), advance);
    expect(state.tracks["legalSpace"]).toBe("banned");
    expect(state.tracks["successor"]).toBe(3);
    expect(where(state)).toEqual([]);
    expect(state.tracks["legitimacy"]).toBe(8);
    expect(state.tracks["europe"]).toBe(2);
    expect(state.flags["closureCase"]).toBe(false);
  });

  it("the ban keeps Europe at 3 while the Ban marker is on the track (04 s3.6)", () => {
    const board = setMarkers(setTrack(withCase(offices(open(), "diyarbakir-city")), "europe", 3), "europe", "ban", 1);
    expect(play(board, advance).state.tracks["europe"]).toBe(3);
  });

  it("line 2 returns a successor with Successor - 1 Offices, minimum 1 (DEC-65 point 4)", () => {
    const banned = at(setTrack(setTrack(turnOf("state"), "legalSpace", "banned"), "successor", 3));
    const { state } = play(banned, advance);
    expect(state.tracks["legalSpace"]).toBe("prosecuted");
    expect(where(state)).toEqual(expect.arrayContaining(["diyarbakir-city", "western-cities"]));
    expect(where(state)).toHaveLength(2);
    expect(state.tracks["successor"]).toBe(0);
    const zero = at(setTrack(setTrack(turnOf("state"), "legalSpace", "banned"), "successor", 0));
    expect(where(play(zero, advance).state)).toEqual(["diyarbakir-city"]);
  });

  it("line 2 places as many Offices as eligible spaces allow (DEC-65 point 3)", () => {
    const list = ["diyarbakir-city", "western-cities", "mardin-batman", "van-bitlis", "sanliurfa", "bingol-mus", "diyarbakir-rural", "botan", "agri", "adiyaman"];
    const board = list.reduce((b, id) => setLevel(b, id, 2), at(setTrack(setTrack(turnOf("state"), "legalSpace", "banned"), "successor", 4)));
    expect(where(play(board, advance).state)).toEqual(["elazig"]);
  });

  it("two runs of the table on the same board give identical Offices (research M-007)", () => {
    const board = offices(open(), "western-cities");
    expect(play(board, advance).state.spaces).toEqual(play(board, advance).state.spaces);
  });
});

describe("Closure filing (07 s6.3)", () => {
  it("the State files: Closure Case placed, Legal Space Prosecuted; no ban until the next phase", () => {
    const { state } = play(offices(open(), "diyarbakir-city"), file);
    expect(state.flags["closureCase"]).toBe(true);
    expect(state.tracks["legalSpace"]).toBe("prosecuted");
    expect(where(state)).toHaveLength(2);
  });

  it("needs Legal Space Open or Prosecuted, an Office and no pending case", () => {
    expect(codes(at(turnOf("state")), file)).toEqual(["closureSpace"]);
    expect(codes(at(setTrack(offices(turnOf("state"), "diyarbakir-city"), "legalSpace", "banned")), file)).toEqual(["closureSpace"]);
    expect(codes(open(), file)).toEqual(["closureOffice"]);
    expect(codes(withCase(offices(open(), "diyarbakir-city")), file)).toEqual(["closurePending"]);
    expect(codes(open(), advance)).toEqual([]);
  });
});
