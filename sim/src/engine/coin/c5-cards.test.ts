import { describe, expect, it } from "vitest";
import { codes, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf, withCard } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";

// T-EVT per side for the C5 cards (11 P3b-07; encoding docs/prototype/34, DEC-75).
// S0 board in C5: Diyarbakır City has State Control and Police; Botan has Police but no Control;
// Hakkari has State Control and Police, removed in tests that need a Control space without Police.
// Legitimacy is 5 so no side meets the track ends.
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const c5 = (s: GameState): GameState => setTrack({ ...s, turn: { ...s.turn, campaign: "C5" } }, "legitimacy", 5);
const board = (faction: "state" | "pkk", card: string): GameState => c5(withCard(turnOf(faction), card));
const track = (s: GameState, id: string): unknown => s.tracks[id];
const marker = (s: GameState, id: string, m: string): number => Object.values(s.spaces[id]?.markers[m] ?? {}).reduce((a, n) => a + n, 0);
const onMap = (s: GameState, m: string): number => ruleset.spaces.reduce((a, x) => a + marker(s, x.id, m), 0);
const units = (s: GameState, id: string, piece: string): number => Object.values(pieces(s, id, piece)).reduce((a, n) => a + n, 0);
const filed = (s: GameState): boolean => s.flags["closureCase"] === true;
const legal = (s: GameState, value: string): GameState => setTrack(s, "legalSpace", value);
const covert = (s: GameState, n: number): GameState => ["hakkari", "botan", "dersim"].slice(0, n).reduce((b, id) => setMarkers(b, id, "covert", 1), s);
const STOP = 1;
const SECOND = 0;

describe("Susurluk Car Crash (DK-079)", () => {
  it("U: 1 Covert marker revealed at random (State Harm, Legitimacy -2), then Legitimacy +1", () => {
    const { state } = play(covert(board("state", "DK-079"), 2), event("state", "unshaded"));
    expect([onMap(state, "covert"), onMap(state, "stateHarm"), track(state, "legitimacy")]).toEqual([1, 1, 4]);
  });

  it("S: the executor may reveal a second marker or stop after 1 (DEC-75 point 1); Europe +1", () => {
    const two = play(covert(board("pkk", "DK-079"), 3), event("pkk", "shaded", [SECOND])).state;
    expect([onMap(two, "covert"), onMap(two, "stateHarm"), track(two, "legitimacy"), track(two, "europe")]).toEqual([1, 2, 1, 2]);
    const one = play(covert(board("pkk", "DK-079"), 3), event("pkk", "shaded", [STOP])).state;
    expect([onMap(one, "covert"), onMap(one, "stateHarm"), track(one, "legitimacy"), track(one, "europe")]).toEqual([2, 1, 3, 2]);
  });

  it("S: with no Covert marker on the map, no reveal; Europe still +1", () => {
    const { state } = play(board("pkk", "DK-079"), event("pkk", "shaded", [SECOND]));
    expect([onMap(state, "stateHarm"), track(state, "legitimacy"), track(state, "europe")]).toEqual([0, 5, 2]);
  });
});

describe("Susurluk Commission Report (DK-080)", () => {
  const harmed = (faction: "state" | "pkk"): GameState => setMarkers(setMarkers(board(faction, "DK-080"), "diyarbakir-city", "stateHarm", 1), "hakkari", "stateHarm", 1);

  it("U: reveal 1, then the State may pay 1 Resource to remove a State Harm marker", () => {
    const before = harmed("state");
    const { state } = play(before, event("state", "unshaded", [["diyarbakir-city"]]));
    expect([marker(state, "diyarbakir-city", "stateHarm"), track(state, "resources.state")]).toEqual([0, Number(track(before, "resources.state")) - 1]);
    const kept = play(before, event("state", "unshaded", [[]])).state;
    expect([marker(kept, "diyarbakir-city", "stateHarm"), track(kept, "resources.state")]).toEqual([1, track(before, "resources.state")]);
  });

  it("U: the removal needs State Control and Police, as Civic Action (DEC-75 point 11)", () => {
    const noControl = setMarkers(harmed("state"), "botan", "stateHarm", 1);
    expect(codes(noControl, event("state", "unshaded", [["botan"]]))).toEqual(["badAnswer"]);
    const noPolice = setPieces(harmed("state"), "hakkari", "police", 0);
    expect(codes(noPolice, event("state", "unshaded", [["hakkari"]]))).toEqual(["badAnswer"]);
    expect(codes(harmed("state"), event("state", "unshaded", [["hakkari"]]))).toEqual([]);
  });

  it("comes after DK-079 in the deck (08 s8)", () => {
    expect(ruleset.cards["DK-080"]?.chainAfter).toEqual(["DK-079"]);
  });

  it("U: with 0 State Resources, no removal is offered", () => {
    const { state } = play(setTrack(harmed("state"), "resources.state", 0), event("state", "unshaded"));
    expect(marker(state, "diyarbakir-city", "stateHarm")).toBe(1);
  });

  it("S: reveals (stop after 1 or reveal 2), then Guard Abuse in every Guard space with Harm (DEC-57)", () => {
    const withGuards = ["hakkari", "botan", "dersim", "agri"].reduce((g, id) => setPieces(g, id, "guards", 1), covert(board("pkk", "DK-080"), 2));
    const guarded = setTrack(setMarkers(withGuards, "dersim", "pkkHarm", 1), "legitimacy", 10);
    const { state } = play(guarded, event("pkk", "shaded", [SECOND]));
    // Hakkari and Botan now hold State Harm from the reveals, Dersim PKK Harm; Ağrı has no Harm and keeps its Guard.
    expect([onMap(state, "covert"), units(state, "hakkari", "guards"), units(state, "botan", "guards"), units(state, "dersim", "guards"), units(state, "agri", "guards")]).toEqual([0, 0, 0, 0, 1]);
    // Two reveals at -2 each, then Guard Abuse -1 in each of 3 spaces.
    expect(track(state, "legitimacy")).toBe(10 - 2 * 2 - 3);
    const one = play(guarded, event("pkk", "shaded", [STOP])).state;
    expect([onMap(one, "covert"), track(one, "legitimacy")]).toEqual([1, 10 - 2 - 2]);
  });
});

describe("HADEP Congress Flag Case (DK-085)", () => {
  it("U: files a case and sets Legal Space to Prosecuted", () => {
    const { state } = play(legal(board("state", "DK-085"), "open"), event("state", "unshaded"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([true, "prosecuted"]);
  });

  it("U: with a case already filed and Legal Space Open, only Legal Space moves", () => {
    const pending = { ...legal(board("state", "DK-085"), "open"), flags: { closureCase: true } };
    const { state } = play(pending, event("state", "unshaded"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([true, "prosecuted"]);
  });

  it("U: while Legal Space is Banned, nothing happens (DEC-75 point 5)", () => {
    const { state } = play(legal(board("state", "DK-085"), "banned"), event("state", "unshaded"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([false, "banned"]);
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(legal(board("pkk", "DK-085"), "open"), event("pkk", "unshaded"))).toEqual(["sideRestricted"]);
  });

  it("S: Legitimacy -1, Europe +1", () => {
    const { state } = play(board("pkk", "DK-085"), event("pkk", "shaded"));
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([4, 2]);
  });
});

describe("Strasbourg Judgments (DK-086)", () => {
  it("U: State Resources -3 and 1 State Harm marker removed (executor's choice)", () => {
    const before = setTrack(setMarkers(setMarkers(board("state", "DK-086"), "hakkari", "stateHarm", 1), "botan", "stateHarm", 1), "resources.state", 10);
    const { state } = play(before, event("state", "unshaded", [["hakkari"]]));
    expect([marker(state, "hakkari", "stateHarm"), marker(state, "botan", "stateHarm"), track(state, "resources.state")]).toEqual([0, 1, 7]);
  });

  it("U: with 2 Resources, Resources stop at 0 and the removal still applies (05 s5 item 3)", () => {
    const poor = setTrack(setMarkers(board("state", "DK-086"), "hakkari", "stateHarm", 1), "resources.state", 2);
    const { state } = play(poor, event("state", "unshaded", [["hakkari"]]));
    expect([marker(state, "hakkari", "stateHarm"), track(state, "resources.state")]).toEqual([0, 0]);
  });

  it("U: with no State Harm marker on the map, Resources -3 still applies", () => {
    const { state } = play(setTrack(board("state", "DK-086"), "resources.state", 10), event("state", "unshaded", [[]]));
    expect([onMap(state, "stateHarm"), track(state, "resources.state")]).toEqual([0, 7]);
  });

  it("S: Legitimacy -1 per 2 State Harm markers, not Disputed, round down, maximum -3; Europe +1", () => {
    const after = (n: number): unknown => {
      const ids = ["hakkari", "botan", "dersim", "van-bitlis", "agri", "mardin-batman", "diyarbakir-rural", "bingol-mus"].slice(0, n);
      const s = ids.reduce((b, id) => setMarkers(b, id, "stateHarm", 1), setMarkers(board("pkk", "DK-086"), "diyarbakir-city", "disputedHarm", 3));
      return track(play(s, event("pkk", "shaded")).state, "legitimacy");
    };
    expect([0, 1, 2, 3, 5, 6, 8].map(after)).toEqual([5, 5, 4, 4, 3, 2, 2]);
    expect(track(play(board("pkk", "DK-086"), event("pkk", "shaded")).state, "europe")).toBe(2);
  });
});

describe("Migration Commission Report (DK-087)", () => {
  const received = (n = 1): GameState => setMarkers(setMarkers(board("state", "DK-087"), "diyarbakir-city", "reception", n), "botan", "reception", 1);

  it("U: Relief for up to 2 Reception markers at 1 Resource each, both from one space allowed", () => {
    const before = received(2);
    const { state } = play(before, event("state", "unshaded", [["diyarbakir-city"], ["diyarbakir-city"]]));
    expect([marker(state, "diyarbakir-city", "reception"), track(state, "resources.state")]).toEqual([0, Number(track(before, "resources.state")) - 2]);
    const one = play(before, event("state", "unshaded", [["diyarbakir-city"], []])).state;
    expect(marker(one, "diyarbakir-city", "reception")).toBe(1);
  });

  it("U: Relief needs State Control and Police, as Civic Action (DEC-75 point 11)", () => {
    expect(codes(received(), event("state", "unshaded", [["botan"], []]))).toEqual(["badAnswer"]);
    const noPolice = setPieces(setMarkers(received(), "hakkari", "reception", 1), "hakkari", "police", 0);
    expect(codes(noPolice, event("state", "unshaded", [["hakkari"], []]))).toEqual(["badAnswer"]);
  });

  it("U: with 1 State Resource, only one Relief", () => {
    const { state } = play(setTrack(received(2), "resources.state", 1), event("state", "unshaded", [["diyarbakir-city"]]));
    expect([marker(state, "diyarbakir-city", "reception"), track(state, "resources.state")]).toEqual([1, 0]);
  });

  it("S: Legitimacy -1 per 2 Displacement markers (New and Old); 1 Reception marker in Western Cities", () => {
    const displaced = setMarkers(setMarkers(board("pkk", "DK-087"), "hakkari", "displacement", 1, "new"), "botan", "displacement", 1, "old");
    const { state } = play(displaced, event("pkk", "shaded"));
    expect([track(state, "legitimacy"), marker(state, "western-cities", "reception")]).toEqual([4, 1]);
  });
});

describe("C5 Propaganda (DK-099)", () => {
  it("is a Propaganda card, not deck-eligible", () => {
    expect([ruleset.cards["DK-099"]?.type, ruleset.cards["DK-099"]?.deckEligible]).toEqual(["propaganda", false]);
  });
});
