// Designer decisions 3 to 14 of 2026-11-12 (docs/audit/OPEN_QUESTIONS.md, section "Decisions").
// One block per row of the table. Decision 1 is in src/engine/coin/propaganda/ceasefire-step.test.ts.
// Boards follow docs/audit/TEST_SCENARIOS.md where a scenario exists there.
import { describe, expect, it } from "vitest";
import { ceasefireOptions } from "../src/engine/coin/propaganda/ceasefire-step.ts";
import { PHASE } from "../src/engine/coin/phases.ts";
import type { AnyCommand, GameState } from "../src/engine/core/types.ts";
import { chipOf } from "../src/ui/board/markers.tsx";
import { words } from "../src/ui/common/names.ts";
import { codes, engine, inCampaign, op, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf, withCard } from "./board.ts";

const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const propaganda = (s: GameState, phase: string): GameState =>
  ({ ...s, deck: { ...s.deck, currentCard: "DK-016" }, turn: { ...s.turn, phase: PHASE.propaganda, propagandaRound: 1, step: ruleset.sequence.propagandaPhases.indexOf(phase) } });
const marker = (s: GameState, space: string, id: string, side = "default"): number => s.spaces[space]?.markers[id]?.[side] ?? 0;
/** The full campaign start in card play, so a Reset has a next Campaign. */
const fullTurn = (faction: "state" | "pkk"): GameState => {
  const s = engine.start(ruleset, "full-campaign", 1).state;
  return { ...s, turn: { ...s.turn, phase: PHASE.card }, initiative: { ...s.initiative, firstEligible: faction, secondEligible: faction === "state" ? "pkk" : "state" } };
};
const law = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, law3175: true } });

describe("Decision 3 (M-01): the block on State acceptance lasts until the next Reset", () => {
  const declared = setTrack(inCampaign(ruleset, fullTurn("state"), "C3"), "ceasefire", "declared");
  const assault = op("state", "limitedOp", { op: "state.assault", locations: ["sirnak"], perLocation: {}, sa: null, subActions: [] });

  it("a State Assault during Declared places the marker and blocks acceptance; Reset removes the marker and the block", () => {
    const active = setPieces(setPieces(declared, "sirnak", "guerrilla", 0), "sirnak", "guerrilla", 2, "active");
    const broken = play(active, assault).state;
    expect([broken.tracks["ceasefire"], marker(broken, "sirnak", "restraintBroken", "state")]).toEqual(["declared", 1]);
    expect(ceasefireOptions(ruleset, broken).accept).toBe(false);
    const reset = play(propaganda(broken, "reset"), { type: "Advance" }).state;
    expect([reset.tracks["ceasefire"], marker(reset, "sirnak", "restraintBroken", "state")]).toEqual(["declared", 0]);
    expect(ceasefireOptions(ruleset, reset).accept).toBe(true);
  });
});

describe("Decision 4 (M-03): one March group is all Guerrillas from one origin to one destination", () => {
  // T-M03: Şanlıurfa at Passive Support with 2 Police; 4 Underground Guerrillas in Mardin.
  const board = setPieces(setPieces(setPieces(turnOf("pkk"), "mardin", "guerrilla", 4), "sanliurfa", "police", 2), "sanliurfa", "guerrilla", 0);
  const march = (moves: unknown[]): AnyCommand => op("pkk", "limitedOp", { op: "pkk.march", locations: ["sanliurfa"], perLocation: { sanliurfa: { moves } } });

  it("four entries of 1 from the same origin are one group of 4: all arrive Active", () => {
    const split = Array.from({ length: 4 }, () => ({ from: "mardin", count: 1 }));
    expect(pieces(play(board, march(split)).state, "sanliurfa", "guerrilla")).toEqual({ underground: 0, active: 4 });
    expect(pieces(play(board, march([{ from: "mardin", count: 4 }])).state, "sanliurfa", "guerrilla")).toEqual({ underground: 0, active: 4 });
  });

  it("two origins into one destination are two groups", () => {
    const two = setPieces(setPieces(board, "mardin", "guerrilla", 1), "adiyaman", "guerrilla", 1);
    const moved = play(two, march([{ from: "mardin", count: 1 }, { from: "adiyaman", count: 1 }])).state;
    expect(pieces(moved, "sanliurfa", "guerrilla")).toEqual({ underground: 2, active: 0 });
  });
});

describe("Decision 5 (M-07), revised 2026-11-19: Op Only takes any number of locations", () => {
  const rally = (box: string, ...locations: string[]): AnyCommand =>
    op("pkk", box, { op: "pkk.rally", locations, perLocation: Object.fromEntries(locations.map((l) => [l, { option: "place" }])) });

  it("First Eligible may take Op Only in one location; the box, not the count, sets next-card order", () => {
    const first = turnOf("pkk");
    expect(first.initiative.firstEligible).toBe("pkk");
    expect(codes(first, rally("opOnly", "bingol-tunceli"))).toEqual([]);
    expect(play(first, rally("opOnly", "bingol-tunceli")).state.initiative.boxes["pkk"]).toBe("opOnly");
  });

  it("a Limited Op still selects one location", () => {
    expect(codes(turnOf("pkk"), rally("limitedOp", "bingol-tunceli", "mardin"))).toEqual(["limitedOneLocation"]);
  });
});

describe("Decision 6 (M-02): the Europe cap marker is the permanent Europe Ban marker", () => {
  const placed = play(setTrack(inCampaign(ruleset, withCard(turnOf("state"), "DK-064"), "C4"), "europe", 5), event("state", "unshaded")).state;

  it("DK-064 places it, Europe stops at 3 and Europe Rally costs 2 and stops at the cap", () => {
    expect([marker(placed, "europe", "europeBan"), placed.tracks["europe"]]).toEqual([1, 3]);
    expect(ruleset.cards["DK-064"]?.unshaded?.text).toContain("Europe Ban marker");
    const rally = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["europe"], perLocation: { europe: {} } });
    const capped = play(setMarkers(turnOf("pkk"), "europe", "europeBan", 1), rally);
    expect(capped.state.tracks["resources.pkk"]).toBe(3);
    expect(codes(setTrack(setMarkers(turnOf("pkk"), "europe", "europeBan", 1), "europe", 3), rally)).toEqual(["rallyEuropeCap"]);
  });

  it("has the name Europe Ban on screen and is not the Legal Politics ban", () => {
    expect(words("europeBan")).toBe("Europe Ban");
    expect(chipOf("europeBan").name).toBe("Europe Ban marker");
    expect(ruleset.markers.map((m) => m.id)).not.toContain("ban");
  });

  it("stays through Legal Politics and Reset", () => {
    const banned = setTrack(setMarkers(fullTurn("state"), "europe", "europeBan", 1), "legalSpace", "banned");
    for (const phase of ["legalPolitics", "reset"]) expect(marker(play(propaganda(banned, phase), { type: "Advance" }).state, "europe", "europeBan")).toBe(1);
  });
});

describe("Decision 7 (M-08): a line 6 filing sets Legal Space to Prosecuted", () => {
  it("the prosecutor files at the limit of 4 Offices and Legal Space goes from Open to Prosecuted", () => {
    const three = ["diyarbakir-city", "western-cities", "mardin"].reduce((b, id) => setMarkers(b, id, "office", 1), setTrack(turnOf("state"), "legalSpace", "open"));
    const { state } = play(propaganda(three, "legalPolitics"), { type: "Advance" });
    expect([state.flags["closureCase"], state.tracks["legalSpace"]]).toEqual([true, "prosecuted"]);
  });
});

describe("Decision 9 (M-10): a faction may take the Event box and apply nothing", () => {
  it("T-M10: the State declines the free Sweep of DK-011, the board does not change and the State keeps First Eligible", () => {
    const board = withCard(turnOf("state"), "DK-011");
    const res = board.tracks["resources.state"];
    const { state } = play(board, event("state", "unshaded", [null]));
    expect(state.initiative.boxes["state"]).toBe("event");
    expect([state.spaces, state.tracks["resources.state"]]).toEqual([board.spaces, res]);
    const next = play(state, { type: "Pass", faction: "pkk" }).state;
    expect(next.initiative.firstEligible).toBe("state");
  });
});

describe("Decision 10 (M-04): Strike Collaborators may go before or after the Operation", () => {
  // T-M04: Diyarbakır hinterland has 1 Guard and no Guerrilla. The Rally places the Guerrilla that strikes.
  const board = setPieces(setPieces(law(turnOf("pkk")), "diyarbakir-rural", "guards", 1), "diyarbakir-rural", "guerrilla", 0);
  const plan = (timing: string): AnyCommand =>
    op("pkk", "opSa", { op: "pkk.rally", locations: ["diyarbakir-rural"], perLocation: { "diyarbakir-rural": { option: "place" } }, sa: { action: "pkk.strike-collaborators", locations: ["diyarbakir-rural"], perLocation: { "diyarbakir-rural": { guards: 1 } }, timing } });

  it("after the Rally the new Guerrilla strikes; before it no Guerrilla is there", () => {
    const { state } = play(board, plan("after"));
    expect([pieces(state, "diyarbakir-rural", "guards"), marker(state, "diyarbakir-rural", "pkkHarm")]).toEqual([{ default: 0 }, 1]);
    expect(codes(board, plan("before"))).not.toEqual([]);
  });
});

describe("Decision 11 (M-05): Reception blocks every shift toward Support", () => {
  it("T-M05: DK-039 unshaded gives Legitimacy +2 and no shift in a City with a Reception marker", () => {
    const board = setMarkers(setTrack(inCampaign(ruleset, withCard(turnOf("state"), "DK-039"), "C3"), "legitimacy", 5), "diyarbakir-city", "reception", 1);
    const { state, entries } = play(board, event("state", "unshaded", [["diyarbakir-city"]]));
    expect([state.tracks["legitimacy"], state.spaces["diyarbakir-city"]?.level]).toEqual([7, 0]);
    expect(entries.some((e) => e.kind === "EffectSkipped" && e.data["reason"] === "block")).toBe(true);
  });

  it("does not block a shift toward Opposition", () => {
    expect(ruleset.markers.find((m) => m.id === "reception")?.blocks).toEqual(["support"]);
  });
});

describe("Decision 12 (M-06): a PKK Harm marker blocks the Coerce shift toward Neutral", () => {
  it("T-M06: no shift, the Coercion marker is placed and the Guerrilla is Active", () => {
    const board = setMarkers(setPieces(turnOf("pkk"), "elazig", "guerrilla", 1), "elazig", "pkkHarm", 1);
    const { state } = play(board, op("pkk", "limitedOp", { op: "pkk.coerce", locations: ["elazig"] }));
    expect([state.spaces["elazig"]?.level, marker(state, "elazig", "coercion"), pieces(state, "elazig", "guerrilla")]).toEqual([1, 1, { underground: 0, active: 1 }]);
  });
});

describe("Decision 13 (M-11), limited by decision 18 (2026-11-19): Rally places as many Guerrillas as are Available", () => {
  const withAvailable = (n: number): GameState => {
    const start = turnOf("pkk");
    return { ...start, pools: { ...start.pools, guerrilla: { ...start.pools["guerrilla"], available: n } } } as GameState;
  };
  const place = (...spaces: string[]): AnyCommand => op("pkk", "opOnly", { op: "pkk.rally", locations: spaces, perLocation: Object.fromEntries(spaces.map((l) => [l, { option: "place" }])) });

  it("a grow plan larger than Available is legal and places what is Available", () => {
    // Sirnak: Pop 1 + 1 PKK Base allows 2; only 1 is Available.
    const grow = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "grow", count: 2 } } });
    expect(codes(withAvailable(1), grow)).toEqual([]);
    expect(play(withAvailable(1), grow).state.pools["guerrilla"]?.available).toBe(0);
  });

  it("a location that would receive nothing is refused (decision 18): 3 place locations with 2 Available", () => {
    expect(codes(withAvailable(2), place("bingol-tunceli", "mardin", "van-rural"))).toEqual(["locationNoEffect"]);
    expect(codes(withAvailable(2), place("bingol-tunceli", "mardin"))).toEqual([]);
  });
});

describe("Decision 14 (M-12): DK-005 stays in C1 and prints the evidence grade of its date", () => {
  it("the card is a C1 card and its Always line prints the grade on reveal", () => {
    const card = ruleset.cards["DK-005"];
    expect(card?.campaign).toBe("C1");
    const notes = (card?.always ?? []).flatMap((e) => (e.type === "note" ? [e.text] : []));
    expect(notes).toEqual(["The date of the KDP break is disputed (1985, 1987 or 1988). October 1985 is a design assumption. Evidence: Low."]);
  });
});
