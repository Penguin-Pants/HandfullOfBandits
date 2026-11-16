import { describe, expect, it } from "vitest";
import { codes, engine, pieces, play, ruleset, setPieces, setTrack, turnOf, withCard, withRoll } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";

// T-EVT (11 P2-09, moved from P2-05): one fixture per side of the 8 S0 cards (research 08; deck CSV).
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const state0 = turnOf("state");
const pkk0 = turnOf("pkk");
const on = (s: GameState, card: string): GameState => withCard(s, card);
const t = (s: GameState, track: string): unknown => s.tracks[track];

describe("T-EVT: S0 cards", () => {
  // DK-001 and DK-002 name Eruh and a raid in Siirt (DD-22). The 1984 setup holds no pieces in Siirt, so these tests place the old Botan force there.
  const atSiirt = (s: GameState): GameState => setPieces(setPieces(setPieces(s, "siirt", "troops", 2), "siirt", "police", 1), "siirt", "guerrilla", 2);

  it("DK-001 U: 2 Troops in Hakkari or Siirt, State Resources +2", () => {
    const { state } = play(on(state0, "DK-001"), event("state", "unshaded", ["Siirt"]));
    expect(pieces(state, "siirt", "troops")).toEqual({ default: 2 });
    expect(t(state, "resources.state")).toBe(14);
  });

  it("DK-001 S: 2 Underground Guerrillas in Hakkari, 1 in Siirt, Siirt one level toward Opposition", () => {
    const { state } = play(on(pkk0, "DK-001"), event("pkk", "shaded"));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 4, active: 0 });
    expect(pieces(state, "siirt", "guerrilla")).toEqual({ underground: 1, active: 0 });
    expect(state.spaces["siirt"]?.level).toBe(-2);
  });

  it("DK-002 U: free Garrison with Activation in Siirt, no cost", () => {
    // Siirt (Mountain): 2 Police = 2, so 2 / 2 = 1 Activation.
    const board = setPieces(setPieces(on(state0, "DK-002"), "siirt", "guerrilla", 2), "van-rural", "police", 1);
    const plan = { locations: ["siirt"], perLocation: { siirt: { moves: [{ from: "van-rural", count: 1 }, { from: "sirnak", count: 1 }] } } };
    const { state } = play(board, event("state", "unshaded", [plan]));
    expect(pieces(state, "siirt", "guerrilla")).toEqual({ underground: 1, active: 1 });
    expect(t(state, "resources.state")).toBe(12);
    expect(codes(on(state0, "DK-002"), event("state", "unshaded", [{ locations: ["hakkari"], perLocation: {} }]))).toEqual(["eventConstraint"]);
  });

  it("DK-002 S: 1 Guerrilla placed, then free Attack in Siirt with Ambush: no roll, 1 Activation, 1 removal (PA-06), no cost", () => {
    const board = withRoll(atSiirt(on(pkk0, "DK-002")), 6);
    const { state } = play(board, event("pkk", "shaded", [{ locations: ["siirt"], perLocation: {}, sa: { locations: ["siirt"], perLocation: {} } }]));
    expect(pieces(state, "siirt", "troops")).toEqual({ default: 1 });
    expect(pieces(state, "siirt", "guerrilla")).toEqual({ underground: 2, active: 1 });
    expect(t(state, "resources.pkk")).toBe(5);
  });

  it("DK-002 S: places 1 Underground Guerrilla in Siirt first, so Ambush works after a Sweep (playtest D9)", () => {
    const swept = setPieces(setPieces(atSiirt(on(pkk0, "DK-002")), "siirt", "guerrilla", 0), "siirt", "guerrilla", 2, "active");
    const plan = { locations: ["siirt"], perLocation: {}, sa: { locations: ["siirt"], perLocation: {} } };
    expect(codes(swept, event("pkk", "shaded", [plan]))).toEqual([]);
  });

  it("DK-003 U: up to 2 Guards in each of up to 2 controlled Mountain or Plain spaces with Police", () => {
    const law = { ...on(state0, "DK-003"), flags: { law3175: true }, pools: { ...state0.pools, guards: { available: 16, outOfPlay: 0 } } };
    const { state } = play(law, event("state", "unshaded", [["bingol-tunceli", "elazig"], 2, 1]));
    expect(pieces(state, "bingol-tunceli", "guards")).toEqual({ default: 2 });
    expect(pieces(state, "elazig", "guards")).toEqual({ default: 1 });
    expect(codes(law, event("state", "unshaded", [["sirnak"]]))).toEqual(["badAnswer"]);
  });

  it("DK-003 U: each count question names the space it is for (UC-9)", () => {
    const law = { ...on(state0, "DK-003"), flags: { law3175: true }, pools: { ...state0.pools, guards: { available: 16, outOfPlay: 0 } } };
    const asked = (answers: unknown[]): unknown => engine.validate(ruleset, law, event("state", "unshaded", answers)).violations[0]?.question;
    expect(asked([["bingol-tunceli", "elazig"]])).toMatchObject({ kind: "count", space: "bingol-tunceli" });
    expect(asked([["bingol-tunceli", "elazig"], 2])).toMatchObject({ kind: "count", space: "elazig" });
  });

  it("DK-003 S: State Resources -3; shift one space with a Guard and no PKK Harm toward Opposition", () => {
    const board = setPieces(on(pkk0, "DK-003"), "bingol-tunceli", "guards", 1);
    const { state } = play(board, event("pkk", "shaded", [["bingol-tunceli"]]));
    expect(t(state, "resources.state")).toBe(9);
    expect(state.spaces["bingol-tunceli"]?.level).toBe(-1);
  });

  it("DK-003 S: with no Guard on the map, a Mountain space with State Control can shift (playtest D9)", () => {
    const { state } = play(on(pkk0, "DK-003"), event("pkk", "shaded", [["bingol-tunceli"]]));
    expect(state.spaces["bingol-tunceli"]?.level).toBe(-1);
  });

  it("DK-005 U: KDP posture one more step toward Hostile", () => {
    expect(t(play(on(state0, "DK-005"), event("state", "unshaded")).state, "posture.kdp")).toBe("tolerant");
  });

  it("DK-005 S: up to 3 Guerrillas from the KDP Zone to Hakkari, Underground; PKK Resources +1", () => {
    const board = setPieces(setPieces(on(pkk0, "DK-005"), "kdp-zone", "guerrilla", 1), "kdp-zone", "guerrilla", 2, "active");
    const { state } = play(board, event("pkk", "shaded", ["Hakkari", 3]));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 5, active: 0 });
    expect(t(state, "resources.pkk")).toBe(6);
  });

  it("DK-005 S: or places 2 Underground Guerrillas in the PUK Zone (playtest D9)", () => {
    const { state } = play(on(pkk0, "DK-005"), event("pkk", "shaded", ["Place 2 in the PUK Zone"]));
    expect(pieces(state, "puk-zone", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(t(state, "resources.pkk")).toBe(6);
  });

  it("DK-008 U: Europe -1, PKK Resources -1", () => {
    const { state } = play(on(state0, "DK-008"), event("state", "unshaded"));
    expect([t(state, "europe"), t(state, "resources.pkk")]).toEqual([0, 4]);
  });

  it("DK-008 S: Europe -1, PKK Resources +1 (playtest D9)", () => {
    const { state } = play(on(pkk0, "DK-008"), event("pkk", "shaded"));
    expect([t(state, "europe"), t(state, "resources.pkk")]).toEqual([0, 6]);
  });

  it("DK-012 U: State Resources +4; 2 Troops in any Mountain spaces", () => {
    const { state } = play(on(state0, "DK-012"), event("state", "unshaded", [1, ["agri-igdir", "bingol-tunceli"]]));
    expect(t(state, "resources.state")).toBe(16);
    expect([pieces(state, "agri-igdir", "troops"), pieces(state, "bingol-tunceli", "troops")]).toEqual([{ default: 2 }, { default: 2 }]);
  });

  it("DK-012 S: Europe +1, PKK Resources +1", () => {
    const { state } = play(on(pkk0, "DK-012"), event("pkk", "shaded"));
    expect([t(state, "europe"), t(state, "resources.pkk")]).toEqual([2, 6]);
  });

  it("DK-014 U: Legitimacy +1", () => {
    expect(t(play(on(state0, "DK-014"), event("state", "unshaded")).state, "legitimacy")).toBe(11);
  });

  it("DK-014 S: Europe +1", () => {
    expect(t(play(on(pkk0, "DK-014"), event("pkk", "shaded")).state, "europe")).toBe(2);
  });

  it("DK-100 U: Legitimacy +1, State Resources +1", () => {
    const { state } = play(on(state0, "DK-100"), event("state", "unshaded"));
    expect([t(state, "legitimacy"), t(state, "resources.state")]).toEqual([11, 13]);
  });

  it("DK-100 S: Syria one step toward Host, or Europe +1 if Syria is already Host (playtest D9); PKK Resources +1", () => {
    const host = play(on(pkk0, "DK-100"), event("pkk", "shaded"));
    expect([t(host.state, "posture.syria"), t(host.state, "europe"), t(host.state, "resources.pkk")]).toEqual(["host", 2, 6]);
    const restricted = play(setTrack(on(pkk0, "DK-100"), "posture.syria", "restricted"), event("pkk", "shaded")).state;
    expect([t(restricted, "posture.syria"), t(restricted, "europe")]).toEqual(["tolerant", 1]);
  });
});

describe("Event execution rules (05 s5)", () => {
  it("asks for a missing answer with the question", () => {
    const result = engine.validate(ruleset, on(state0, "DK-001"), event("state", "unshaded"));
    expect(result.violations[0]).toMatchObject({ code: "needsAnswer", question: { kind: "option", options: ["Hakkari", "Siirt"] } });
  });

  it("places the cylinder in the Event box; the responder may take Op + SA or Pass", () => {
    const { state } = play(on(pkk0, "DK-014"), event("pkk", "shaded"));
    expect(state.initiative.boxes["pkk"]).toBe("event");
    expect(codes(state, event("state", "unshaded"))).toEqual(["boxNotAllowed"]);
  });

  it("rejects the Propaganda card and an event out of turn", () => {
    expect(codes(on(pkk0, "DK-016"), event("pkk", "unshaded"))).toEqual(["noEvent"]);
    expect(codes(on(pkk0, "DK-014"), event("state", "unshaded"))).toEqual(["notEligible"]);
  });
});

describe("Card reveal and Always lines (05 s5 item 7)", () => {
  it("Advance in setup reveals the first card; the next card comes when both factions acted", () => {
    const start = engine.start(ruleset, "full-campaign", 1).state;
    const first = play(start, { type: "Advance" }).state;
    expect(first.deck.currentCard).toBe(start.deck.piles[0]?.[0]);
    expect(first.turn).toMatchObject({ phase: "card", cardIndex: 1 });
    const second = play(play(first, { type: "Pass", faction: "pkk" }).state, { type: "Pass", faction: "state" }).state;
    expect(second.deck.currentCard).toBe(start.deck.piles[0]?.[1]);
    expect(second.deck.played).toEqual([start.deck.piles[0]?.[0]]);
  });

  it("DK-003 Always moves the 16 Guards to Available on reveal and sets Law 3175", () => {
    const start = engine.start(ruleset, "full-campaign", 1).state;
    const ordered = { ...start, deck: { ...start.deck, piles: [["DK-003", "DK-016"]] } };
    const { state } = play(ordered, { type: "Advance" });
    expect(state.pools["guards"]).toEqual({ available: 16, outOfPlay: 0 });
    expect(state.flags["law3175"]).toBe(true);
  });

  it("DK-005 Always sets the KDP posture from Host to Tolerant only", () => {
    const start = engine.start(ruleset, "full-campaign", 1).state;
    const ordered = { ...start, deck: { ...start.deck, piles: [["DK-005", "DK-016"]] } };
    expect(play(ordered, { type: "Advance" }).state.tracks["posture.kdp"]).toBe("tolerant");
    const restricted = setTrack(ordered, "posture.kdp", "restricted");
    expect(play(restricted, { type: "Advance" }).state.tracks["posture.kdp"]).toBe("restricted");
  });

  it("Advance is not legal during card play", () => {
    expect(codes(on(pkk0, "DK-014"), { type: "Advance" })).toEqual(["nothingToAdvance"]);
  });
});
