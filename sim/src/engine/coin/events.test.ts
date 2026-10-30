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
  it("DK-001 U: 2 Troops in Hakkari or Botan, State Resources +2", () => {
    const { state } = play(on(state0, "DK-001"), event("state", "unshaded", ["Botan"]));
    expect(pieces(state, "botan", "troops")).toEqual({ default: 4 });
    expect(t(state, "resources.state")).toBe(14);
  });

  it("DK-001 S: 2 Underground Guerrillas in Hakkari, 1 in Botan, Botan one level toward Opposition", () => {
    const { state } = play(on(pkk0, "DK-001"), event("pkk", "shaded"));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 4, active: 0 });
    expect(pieces(state, "botan", "guerrilla")).toEqual({ underground: 3, active: 0 });
    expect(state.spaces["botan"]?.level).toBe(-2);
  });

  it("DK-002 U: free Garrison with Activation in Botan, no cost", () => {
    // Botan (Mountain): 1 + 2 Police = 3, so 3 / 2 = 1 Activation.
    const plan = { locations: ["botan"], perLocation: { botan: { moves: [{ from: "van-bitlis", count: 1 }, { from: "mardin-batman", count: 1 }] } } };
    const { state } = play(on(state0, "DK-002"), event("state", "unshaded", [plan]));
    expect(pieces(state, "botan", "guerrilla")).toEqual({ underground: 1, active: 1 });
    expect(t(state, "resources.state")).toBe(12);
    expect(codes(on(state0, "DK-002"), event("state", "unshaded", [{ locations: ["hakkari"], perLocation: {} }]))).toEqual(["eventConstraint"]);
  });

  it("DK-002 S: free Attack in Botan with Ambush: Attack as normal plus 1 extra removal (PA-06), no cost", () => {
    const board = withRoll(on(pkk0, "DK-002"), 6);
    const { state } = play(board, event("pkk", "shaded", [{ locations: ["botan"], perLocation: {}, sa: { locations: ["botan"], perLocation: {} } }]));
    expect(pieces(state, "botan", "troops")).toEqual({ default: 1 });
    expect(pieces(state, "botan", "guerrilla")).toEqual({ underground: 0, active: 2 });
    expect(t(state, "resources.pkk")).toBe(5);
  });

  it("DK-003 U: up to 2 Guards in each of up to 2 controlled Mountain or Plain spaces with Police", () => {
    const law = { ...on(state0, "DK-003"), flags: { law3175: true }, pools: { ...state0.pools, guards: { available: 16, outOfPlay: 0 } } };
    const { state } = play(law, event("state", "unshaded", [["dersim", "elazig"], 2, 1]));
    expect(pieces(state, "dersim", "guards")).toEqual({ default: 2 });
    expect(pieces(state, "elazig", "guards")).toEqual({ default: 1 });
    expect(codes(law, event("state", "unshaded", [["botan"]]))).toEqual(["badAnswer"]);
  });

  it("DK-003 U: each count question names the space it is for (UC-9)", () => {
    const law = { ...on(state0, "DK-003"), flags: { law3175: true }, pools: { ...state0.pools, guards: { available: 16, outOfPlay: 0 } } };
    const asked = (answers: unknown[]): unknown => engine.validate(ruleset, law, event("state", "unshaded", answers)).violations[0]?.question;
    expect(asked([["dersim", "elazig"]])).toMatchObject({ kind: "count", space: "dersim" });
    expect(asked([["dersim", "elazig"], 2])).toMatchObject({ kind: "count", space: "elazig" });
  });

  it("DK-003 S: State Resources -3; shift one space with a Guard and no PKK Harm toward Opposition", () => {
    const board = setPieces(on(pkk0, "DK-003"), "dersim", "guards", 1);
    const { state } = play(board, event("pkk", "shaded", [["dersim"]]));
    expect(t(state, "resources.state")).toBe(9);
    expect(state.spaces["dersim"]?.level).toBe(-1);
    // No Guard on the map: the shift does as much as it can (nothing), the cost still applies.
    expect(t(play(on(pkk0, "DK-003"), event("pkk", "shaded", [[]])).state, "resources.state")).toBe(9);
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

  it("DK-008 U: Europe -1, PKK Resources -1", () => {
    const { state } = play(on(state0, "DK-008"), event("state", "unshaded"));
    expect([t(state, "europe"), t(state, "resources.pkk")]).toEqual([0, 4]);
  });

  it("DK-008 S: block only, Europe -1", () => {
    const { state } = play(on(pkk0, "DK-008"), event("pkk", "shaded"));
    expect([t(state, "europe"), t(state, "resources.pkk")]).toEqual([0, 5]);
  });

  it("DK-012 U: State Resources +4; 2 Troops in any Mountain spaces", () => {
    const { state } = play(on(state0, "DK-012"), event("state", "unshaded", [1, ["agri", "dersim"]]));
    expect(t(state, "resources.state")).toBe(16);
    expect([pieces(state, "agri", "troops"), pieces(state, "dersim", "troops")]).toEqual([{ default: 2 }, { default: 2 }]);
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

  it("DK-100 S: Syria one step toward Host (no effect at Host, PA-04); PKK Resources +1", () => {
    const host = play(on(pkk0, "DK-100"), event("pkk", "shaded"));
    expect([t(host.state, "posture.syria"), t(host.state, "resources.pkk")]).toEqual(["host", 6]);
    expect(host.entries.some((e) => e.data["track"] === "posture.syria" && e.assumptionRef === "PA-04")).toBe(true);
    expect(t(play(setTrack(on(pkk0, "DK-100"), "posture.syria", "restricted"), event("pkk", "shaded")).state, "posture.syria")).toBe("tolerant");
  });
});

describe("Event execution rules (05 s5)", () => {
  it("asks for a missing answer with the question", () => {
    const result = engine.validate(ruleset, on(state0, "DK-001"), event("state", "unshaded"));
    expect(result.violations[0]).toMatchObject({ code: "needsAnswer", question: { kind: "option", options: ["Hakkari", "Botan"] } });
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
    const start = engine.start(ruleset, "s0", 1).state;
    const first = play(start, { type: "Advance" }).state;
    expect(first.deck.currentCard).toBe(start.deck.piles[0]?.[0]);
    expect(first.turn).toMatchObject({ phase: "card", cardIndex: 1 });
    const second = play(play(first, { type: "Pass", faction: "pkk" }).state, { type: "Pass", faction: "state" }).state;
    expect(second.deck.currentCard).toBe(start.deck.piles[0]?.[1]);
    expect(second.deck.played).toEqual([start.deck.piles[0]?.[0]]);
  });

  it("DK-003 Always moves the 16 Guards to Available on reveal and sets Law 3175", () => {
    const start = engine.start(ruleset, "s0", 1).state;
    const ordered = { ...start, deck: { ...start.deck, piles: [["DK-003", "DK-016"]] } };
    const { state } = play(ordered, { type: "Advance" });
    expect(state.pools["guards"]).toEqual({ available: 16, outOfPlay: 0 });
    expect(state.flags["law3175"]).toBe(true);
  });

  it("DK-005 Always sets the KDP posture from Host to Tolerant only", () => {
    const start = engine.start(ruleset, "s0", 1).state;
    const ordered = { ...start, deck: { ...start.deck, piles: [["DK-005", "DK-016"]] } };
    expect(play(ordered, { type: "Advance" }).state.tracks["posture.kdp"]).toBe("tolerant");
    const restricted = setTrack(ordered, "posture.kdp", "restricted");
    expect(play(restricted, { type: "Advance" }).state.tracks["posture.kdp"]).toBe("restricted");
  });

  it("Advance is not legal during card play", () => {
    expect(codes(on(pkk0, "DK-014"), { type: "Advance" })).toEqual(["nothingToAdvance"]);
  });
});
