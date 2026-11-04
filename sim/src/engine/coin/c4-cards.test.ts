import { describe, expect, it } from "vitest";
import { codes, play, ruleset, setLevel, setMarkers, setTrack, turnOf, withCard } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";

// T-EVT per side for the C4 cards (11 P3b-07; encoding docs/prototype/33, DEC-69).
// S0 board in C4: Diyarbakır City and Western Cities have State Control and Police; Legitimacy is 5
// so no side meets the track ends.
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const c4 = (s: GameState): GameState => setTrack({ ...s, turn: { ...s.turn, campaign: "C4" } }, "legitimacy", 5);
const board = (faction: "state" | "pkk", card: string): GameState => c4(withCard(turnOf(faction), card));
const track = (s: GameState, id: string): unknown => s.tracks[id];
const offices = (s: GameState): string[] => ruleset.spaces.filter((x) => (s.spaces[x.id]?.markers["office"]?.["default"] ?? 0) > 0).map((x) => x.id).sort();
const withOffices = (s: GameState, ...ids: string[]): GameState => ids.reduce((b, id) => setMarkers(b, id, "office", 1), s);
const filed = (s: GameState): boolean => s.flags["closureCase"] === true;
const withCase = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, closureCase: true } });
const legal = (s: GameState, value: string): GameState => setTrack(s, "legalSpace", value);
const card = (id: string) => ruleset.cards[id];

describe("Constitutional Court Dissolves HEP (DK-060)", () => {
  it("U: with a Closure Case marker, line 1 bans the party", () => {
    const pending = withCase(legal(withOffices(board("state", "DK-060"), "diyarbakir-city", "western-cities"), "prosecuted"));
    const { state } = play(pending, event("state", "unshaded"));
    expect([track(state, "legalSpace"), track(state, "successor"), offices(state), filed(state)]).toEqual(["banned", 2, [], false]);
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([3, 2]);
  });

  it("U: with no Closure Case marker, nothing happens", () => {
    const open = legal(withOffices(board("state", "DK-060"), "diyarbakir-city"), "open");
    const { state } = play(open, event("state", "unshaded"));
    expect([track(state, "legalSpace"), offices(state)]).toEqual(["open", ["diyarbakir-city"]]);
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(withCase(board("pkk", "DK-060")), event("pkk", "unshaded"))).toEqual(["sideRestricted"]);
  });

  it("S: Europe +1; Diyarbakır City shifts toward Opposition only without an Office", () => {
    const { state } = play(board("pkk", "DK-060"), event("pkk", "shaded"));
    expect([track(state, "europe"), state.spaces["diyarbakir-city"]?.level]).toEqual([2, -1]);
    const office = play(withOffices(board("pkk", "DK-060"), "diyarbakir-city"), event("pkk", "shaded")).state;
    expect([track(office, "europe"), office.spaces["diyarbakir-city"]?.level]).toEqual([2, 0]);
  });
});

describe("DEP Founded (DK-065)", () => {
  const file = (faction: "state" | "pkk"): AnyCommand => event(faction, "unshaded", [0]);

  it("U: the State may file: Closure Case placed, Legal Space Prosecuted", () => {
    const { state } = play(legal(board("state", "DK-065"), "open"), file("state"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([true, "prosecuted"]);
    const declined = play(legal(board("state", "DK-065"), "open"), event("state", "unshaded", [1])).state;
    expect([filed(declined), track(declined, "legalSpace")]).toEqual([false, "open"]);
  });

  it("U: while Legal Space is Banned, the filing does nothing (owner decision, P3b-07d)", () => {
    const banned = legal(board("state", "DK-065"), "banned");
    const { state } = play(banned, file("state"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([false, "banned"]);
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(board("pkk", "DK-065"), file("pkk"))).toEqual(["sideRestricted"]);
  });

  it("S: while Banned, line 2 returns the successor with Successor - 1 Offices", () => {
    const banned = setTrack(legal(board("pkk", "DK-065"), "banned"), "successor", 3);
    const { state } = play(banned, event("pkk", "shaded"));
    expect([track(state, "legalSpace"), track(state, "successor"), offices(state)]).toEqual(["prosecuted", 0, ["diyarbakir-city", "western-cities"]]);
  });

  it("S: otherwise 1 Office in the line 4 order, not at the line 3 limit (DEC-69 point 1)", () => {
    expect(offices(play(legal(board("pkk", "DK-065"), "open"), event("pkk", "shaded")).state)).toEqual(["diyarbakir-city"]);
    const full = legal(withOffices(board("pkk", "DK-065"), "diyarbakir-city", "western-cities", "mardin-batman"), "prosecuted");
    expect(offices(play(full, event("pkk", "shaded")).state)).toHaveLength(3);
  });

  it("S: both factions may execute it (05 s5 item 1 exception)", () => {
    expect(codes(legal(board("state", "DK-065"), "open"), event("state", "shaded"))).toEqual([]);
    expect(card("DK-065")?.shaded?.owner).toBeNull();
  });
});

describe("Parliament Lifts DEP Immunity (DK-066)", () => {
  it("U: the executor removes 2 Offices; Legitimacy -1", () => {
    const three = withOffices(board("state", "DK-066"), "diyarbakir-city", "western-cities", "mardin-batman");
    const { state } = play(three, event("state", "unshaded", [["western-cities", "mardin-batman"]]));
    expect([offices(state), track(state, "legitimacy")]).toEqual([["diyarbakir-city"], 4]);
    expect(codes(three, event("state", "unshaded", [["western-cities"]]))).toEqual(["badAnswer"]);
  });

  it("U: with fewer than 2 Offices, removes what there is (DEC-69 point 3)", () => {
    const one = withOffices(board("state", "DK-066"), "mardin-batman");
    const { state } = play(one, event("state", "unshaded", [["mardin-batman"]]));
    expect([offices(state), track(state, "legitimacy")]).toEqual([[], 4]);
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(board("pkk", "DK-066"), event("pkk", "unshaded", [[]]))).toEqual(["sideRestricted"]);
  });

  it("S: Legitimacy -2, Europe +1", () => {
    const { state } = play(board("pkk", "DK-066"), event("pkk", "shaded"));
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([3, 2]);
  });
});

describe("HADEP Founded (DK-067)", () => {
  it("U: Open becomes Prosecuted; any other value stays", () => {
    expect(track(play(legal(board("state", "DK-067"), "open"), event("state", "unshaded")).state, "legalSpace")).toBe("prosecuted");
    expect(track(play(legal(board("state", "DK-067"), "banned"), event("state", "unshaded")).state, "legalSpace")).toBe("banned");
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(legal(board("pkk", "DK-067"), "open"), event("pkk", "unshaded"))).toEqual(["sideRestricted"]);
  });

  it("S: while Banned, line 2 without the minus 1 places Successor Offices, minimum 1", () => {
    const banned = setTrack(legal(board("pkk", "DK-067"), "banned"), "successor", 3);
    const { state } = play(banned, event("pkk", "shaded"));
    expect([track(state, "legalSpace"), track(state, "successor"), offices(state)]).toEqual(["prosecuted", 0, ["diyarbakir-city", "mardin-batman", "western-cities"]]);
    const zero = play(setTrack(legal(board("pkk", "DK-067"), "banned"), "successor", 0), event("pkk", "shaded")).state;
    expect(offices(zero)).toEqual(["diyarbakir-city"]);
  });

  it("S: otherwise 1 Office in the line 4 order; ineligible spaces are skipped", () => {
    const active = setLevel(legal(board("state", "DK-067"), "open"), "diyarbakir-city", 2);
    expect(offices(play(active, event("state", "shaded")).state)).toEqual(["western-cities"]);
  });
});

describe("Constitutional Court Dissolves DEP (DK-068)", () => {
  it("follows Parliament Lifts DEP Immunity in the pile", () => {
    expect(card("DK-068")?.chainAfter).toEqual(["DK-066"]);
  });

  it("U: with a Closure Case marker, line 1 bans the party", () => {
    const pending = withCase(legal(withOffices(board("state", "DK-068"), "diyarbakir-city"), "prosecuted"));
    const { state } = play(pending, event("state", "unshaded"));
    expect([track(state, "legalSpace"), track(state, "successor"), offices(state), filed(state)]).toEqual(["banned", 1, [], false]);
  });

  it("U: otherwise a filing: Closure Case placed, Legal Space Prosecuted (DEC-69 point 4)", () => {
    const { state } = play(legal(board("state", "DK-068"), "open"), event("state", "unshaded"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([true, "prosecuted"]);
  });

  it("U: while Banned, nothing happens (DEC-69 point 4)", () => {
    const { state } = play(legal(board("state", "DK-068"), "banned"), event("state", "unshaded"));
    expect([filed(state), track(state, "legalSpace")]).toEqual([false, "banned"]);
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(board("pkk", "DK-068"), event("pkk", "unshaded"))).toEqual(["sideRestricted"]);
  });

  it("S: Europe +1, Legitimacy -1", () => {
    const { state } = play(board("pkk", "DK-068"), event("pkk", "shaded"));
    expect([track(state, "europe"), track(state, "legitimacy")]).toEqual([2, 4]);
  });
});

describe("C4 Propaganda (DK-077)", () => {
  it("is the C4 Propaganda card", () => {
    expect([card("DK-077")?.type, card("DK-077")?.campaign]).toEqual(["propaganda", "C4"]);
  });
});
