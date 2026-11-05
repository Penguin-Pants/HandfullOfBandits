import { describe, expect, it } from "vitest";
import { codes, engine, inCampaign, op, pieces, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf, withCard } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";
import type { ActionOptions } from "./ops/action.ts";
import { villageClearance } from "./ops/sa/village-clearance.ts";
import { sweep } from "./ops/state/sweep.ts";

// T-EVT per side for the C4 cards (11 P3b-07; encoding docs/prototype/33, DEC-69).
// S0 board in C4: Diyarbakır City and Western Cities have State Control and Police; Legitimacy is 5
// so no side meets the track ends.
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const c4 = (s: GameState): GameState => setTrack(inCampaign(ruleset, s, "C4"), "legitimacy", 5);
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

// P3b-07e ceasefire cards (doc 33 s2.2, B2; DEC-69 points 5 to 7; DEC-73).
const cf = (s: GameState, value: string): GameState => setTrack(s, "ceasefire", value);
const byPkk = (s: GameState): boolean => s.flags["ceasefireDeclaredByPkk"] === true;
const rb = (s: GameState, side: string): Record<string, number> => Object.fromEntries(ruleset.spaces.filter((x) => (s.spaces[x.id]?.markers["restraintBroken"]?.[side] ?? 0) > 0).map((x) => [x.id, s.spaces[x.id]?.markers["restraintBroken"]?.[side] ?? 0]));
const level = (s: GameState, id: string): number | null | undefined => s.spaces[id]?.level;
const warns = (s: GameState, c: AnyCommand): string[] => engine.validate(ruleset, s, c).warnings.map((w) => w.code);

describe("PKK Unilateral Ceasefire (DK-056)", () => {
  const garrison = { locations: ["botan"], perLocation: { botan: { moves: [{ from: "van-bitlis", count: 1 }] } } };

  it("U: State Resources +3 and a free Garrison at no cost", () => {
    const { state } = play(board("state", "DK-056"), event("state", "unshaded", [garrison]));
    expect([track(state, "resources.state"), state.spaces["botan"]?.pieces["police"]?.["default"]]).toEqual([15, 2]);
  });

  it("S: a PKK declaration (Declared, flag, Europe +1) and up to 2 shifts in domestic spaces with PKK pieces and no Office", () => {
    const { state } = play(board("pkk", "DK-056"), event("pkk", "shaded", [["hakkari", "botan"]]));
    expect([track(state, "ceasefire"), byPkk(state), track(state, "europe")]).toEqual(["declared", true, 2]);
    expect([level(state, "hakkari"), level(state, "botan")]).toEqual([-2, -2]);
  });

  it("S: no shift in a space with an Office or without PKK pieces", () => {
    expect(codes(withOffices(board("pkk", "DK-056"), "hakkari"), event("pkk", "shaded", [["hakkari"]]))).toEqual(["badAnswer"]);
    expect(codes(board("pkk", "DK-056"), event("pkk", "shaded", [["dersim"]]))).toEqual(["badAnswer"]);
  });

  it("S: with a ceasefire in force the declaration does nothing; the shifts still apply (DEC-69 point 5)", () => {
    const { state } = play(cf(board("pkk", "DK-056"), "reciprocalRestraint"), event("pkk", "shaded", [["mardin-batman"]]));
    expect([track(state, "ceasefire"), byPkk(state), track(state, "europe"), level(state, "mardin-batman")]).toEqual(["reciprocalRestraint", false, 1, -1]);
  });
});

describe("Ceasefire Extended at Bar Elias (DK-057)", () => {
  it("follows PKK Unilateral Ceasefire in the pile", () => {
    expect(card("DK-057")?.chainAfter).toEqual(["DK-056"]);
  });

  it("U: at Declared the State may accept: Reciprocal Restraint, Legitimacy +1", () => {
    const declared = cf(board("state", "DK-057"), "declared");
    const accepted = play(declared, event("state", "unshaded", [0])).state;
    expect([track(accepted, "ceasefire"), track(accepted, "legitimacy")]).toEqual(["reciprocalRestraint", 6]);
    const declined = play(declared, event("state", "unshaded", [1])).state;
    expect([track(declined, "ceasefire"), track(declined, "legitimacy")]).toEqual(["declared", 5]);
  });

  it("U: not with the State Restraint Broken marker, as the ceasefire step (DEC-73)", () => {
    const broken = setMarkers(cf(board("state", "DK-057"), "declared"), "botan", "restraintBroken", 1, "state");
    const { state } = play(broken, event("state", "unshaded", [0]));
    expect([track(state, "ceasefire"), track(state, "legitimacy")]).toEqual(["declared", 5]);
  });

  it("U: otherwise no effect", () => {
    const { state } = play(board("state", "DK-057"), event("state", "unshaded"));
    expect([track(state, "ceasefire"), track(state, "legitimacy")]).toEqual(["none", 5]);
  });

  it("S: at None a PKK declaration without its own Europe +1; PUK one step toward Host; Europe +1 (DEC-69 point 6)", () => {
    const { state } = play(board("pkk", "DK-057"), event("pkk", "shaded"));
    expect([track(state, "ceasefire"), byPkk(state), track(state, "posture.puk"), track(state, "europe")]).toEqual(["declared", true, "host", 2]);
    const held = play(cf(board("pkk", "DK-057"), "talks"), event("pkk", "shaded")).state;
    expect([track(held, "ceasefire"), byPkk(held), track(held, "europe")]).toEqual(["talks", false, 2]);
  });
});

describe("President Özal Dies (DK-058)", () => {
  it("U: spoiler at Declared or Reciprocal Restraint: None, no marker, no breach warning; State Resources +2", () => {
    for (const value of ["declared", "reciprocalRestraint"]) {
      const before = { ...cf(board("state", "DK-058"), value), flags: { ceasefireDeclaredByPkk: true } };
      expect(warns(before, event("state", "unshaded"))).toEqual([]);
      const { state } = play(before, event("state", "unshaded"));
      expect([track(state, "ceasefire"), byPkk(state), rb(state, "state"), rb(state, "pkk"), track(state, "resources.state")]).toEqual(["none", false, {}, {}, 14]);
    }
  });

  it("U: Talks is not listed, so Talks stays", () => {
    const { state } = play(cf(board("state", "DK-058"), "talks"), event("state", "unshaded"));
    expect([track(state, "ceasefire"), track(state, "resources.state")]).toEqual(["talks", 14]);
  });

  it("S: State Resources -3, PKK Resources +1", () => {
    const { state } = play(board("pkk", "DK-058"), event("pkk", "shaded"));
    expect([track(state, "resources.state"), track(state, "resources.pkk")]).toEqual([9, 6]);
  });
});

describe("Bingöl Road Killings (DK-059)", () => {
  const harm = (s: GameState): number => s.spaces["bingol-mus"]?.markers["pkkHarm"]?.["default"] ?? 0;

  it("U: PKK Harm in Bingöl-Muş, Ceasefire None, PKK Restraint Broken there, Europe -1, with no breach warning", () => {
    const before = setTrack(cf(board("state", "DK-059"), "reciprocalRestraint"), "europe", 3);
    expect(warns(before, event("state", "unshaded"))).toEqual([]);
    const { state } = play(before, event("state", "unshaded"));
    expect([harm(state), track(state, "ceasefire"), rb(state, "pkk"), track(state, "europe")]).toEqual([1, "none", { "bingol-mus": 1 }, 2]);
  });

  it("U: with Ceasefire None the marker is still placed, but not a second one (DEC-69 point 7)", () => {
    expect(rb(play(board("state", "DK-059"), event("state", "unshaded")).state, "pkk")).toEqual({ "bingol-mus": 1 });
    const placed = setMarkers(board("state", "DK-059"), "hakkari", "restraintBroken", 1, "pkk");
    expect(rb(play(placed, event("state", "unshaded")).state, "pkk")).toEqual({ hakkari: 1 });
  });

  it("S: block only: PKK Harm and Ceasefire None, no marker, Europe unchanged", () => {
    expect(card("DK-059")?.shaded?.blockOnly).toBe(true);
    const { state } = play(cf(board("pkk", "DK-059"), "declared"), event("pkk", "shaded"));
    expect([harm(state), track(state, "ceasefire"), rb(state, "pkk"), track(state, "europe")]).toEqual([1, "none", {}, 1]);
  });
});

describe("Second Unilateral Ceasefire (DK-073)", () => {
  it("U: a free Sweep in one Mountain space; State Resources +2", () => {
    const { state } = play(board("state", "DK-073"), event("state", "unshaded", [{ locations: ["hakkari"], perLocation: {} }]));
    expect(state.spaces["hakkari"]?.pieces["guerrilla"]).toEqual({ underground: 1, active: 1 });
    expect(track(state, "resources.state")).toBe(14);
  });

  it("U: not a non-Mountain space, not two spaces", () => {
    expect(codes(board("state", "DK-073"), event("state", "unshaded", [{ locations: ["mardin-batman"], perLocation: {} }]))).toEqual(["eventConstraint"]);
    expect(codes(board("state", "DK-073"), event("state", "unshaded", [{ locations: ["hakkari", "botan"], perLocation: {} }]))).toEqual(["eventConstraint"]);
  });

  it("S: a PKK declaration; PKK Resources +2", () => {
    const { state } = play(board("pkk", "DK-073"), event("pkk", "shaded"));
    expect([track(state, "ceasefire"), byPkk(state), track(state, "europe"), track(state, "resources.pkk")]).toEqual(["declared", true, 2, 7]);
  });

  it("S: with a ceasefire in force, no declaration and no Europe; Resources still +2 (DEC-69 point 5)", () => {
    const { state } = play(cf(board("pkk", "DK-073"), "declared"), event("pkk", "shaded"));
    expect([track(state, "ceasefire"), byPkk(state), track(state, "europe"), track(state, "resources.pkk")]).toEqual(["declared", false, 1, 7]);
  });
});

// P3b-07f Europe, harm and report cards (doc 33 s2.3, B3; DEC-69 point 8). S0 Europe is 1.
const marker = (s: GameState, id: string, m: string, side = "default"): number => s.spaces[id]?.markers[m]?.[side] ?? 0;

describe("PKK Attacks on Turkish Offices in Europe (DK-061)", () => {
  it("U: Europe -2, Legitimacy +1", () => {
    const { state } = play(setTrack(board("state", "DK-061"), "europe", 3), event("state", "unshaded"));
    expect([track(state, "europe"), track(state, "legitimacy")]).toEqual([1, 6]);
  });

  it("S: PKK Resources +2, Europe -1", () => {
    const { state } = play(setTrack(board("pkk", "DK-061"), "europe", 3), event("pkk", "shaded"));
    expect([track(state, "resources.pkk"), track(state, "europe")]).toEqual([7, 2]);
  });
});

describe("Deputy Shot Dead in Batman (DK-062)", () => {
  it("U: Disputed Harm in Mardin-Batman, Legitimacy +1", () => {
    const { state } = play(board("state", "DK-062"), event("state", "unshaded"));
    expect([marker(state, "mardin-batman", "disputedHarm"), track(state, "legitimacy"), track(state, "europe")]).toEqual([1, 6, 1]);
  });

  it("S: Disputed Harm, one Covert marker revealed at random, Europe +1", () => {
    const covert = setMarkers(board("pkk", "DK-062"), "hakkari", "covert", 1);
    const { state } = play(covert, event("pkk", "shaded"));
    expect([marker(state, "mardin-batman", "disputedHarm"), marker(state, "hakkari", "covert"), marker(state, "hakkari", "stateHarm")]).toEqual([1, 0, 1]);
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([3, 2]);
  });
});

describe("Destruction in Lice (DK-063)", () => {
  it("U is block only: State Harm in Diyarbakır Rural, Reception in Diyarbakır City", () => {
    expect(card("DK-063")?.unshaded?.blockOnly).toBe(true);
    const { state } = play(board("state", "DK-063"), event("state", "unshaded"));
    expect([marker(state, "diyarbakir-rural", "stateHarm"), marker(state, "diyarbakir-city", "reception")]).toEqual([1, 1]);
    expect([track(state, "legitimacy"), level(state, "diyarbakir-city")]).toEqual([5, 0]);
  });

  it("S: the markers, Legitimacy -1, Diyarbakır City toward Opposition", () => {
    const { state } = play(board("pkk", "DK-063"), event("pkk", "shaded"));
    expect([marker(state, "diyarbakir-rural", "stateHarm"), marker(state, "diyarbakir-city", "reception")]).toEqual([1, 1]);
    expect([track(state, "legitimacy"), level(state, "diyarbakir-city")]).toEqual([4, -1]);
  });
});

describe("Germany Bans PKK and ERNK (DK-064)", () => {
  it("follows PKK Attacks on Turkish Offices in Europe in the pile", () => {
    expect(card("DK-064")?.chainAfter).toEqual(["DK-061"]);
  });

  it("U: the Ban marker on the Europe track, Europe above the cap set to it, PKK Resources -2", () => {
    const { state } = play(setTrack(board("state", "DK-064"), "europe", 5), event("state", "unshaded"));
    expect([marker(state, "europe", "ban"), track(state, "europe"), track(state, "resources.pkk")]).toEqual([1, 3, 3]);
    expect(track(play(setTrack(board("state", "DK-064"), "europe", 2), event("state", "unshaded")).state, "europe")).toBe(2);
  });

  it("S: Europe +1, no Ban marker; with a Ban marker already placed, Europe stops at the cap", () => {
    const { state } = play(board("pkk", "DK-064"), event("pkk", "shaded"));
    expect([marker(state, "europe", "ban"), track(state, "europe")]).toEqual([0, 2]);
    const capped = setMarkers(setTrack(board("pkk", "DK-064"), "europe", 3), "europe", "ban", 1);
    expect(track(play(capped, event("pkk", "shaded")).state, "europe")).toBe(3);
  });
});

describe("HRW Forced-Displacement Report (DK-069)", () => {
  const displaced = (faction: "state" | "pkk", newCount: number, oldCount: number): GameState =>
    setMarkers(setMarkers(board(faction, "DK-069"), "hakkari", "displacement", newCount, "new"), "botan", "displacement", oldCount, "old");
  const legitimacyAfter = (faction: "state" | "pkk", side: string, newCount: number, oldCount: number): unknown =>
    track(play(displaced(faction, newCount, oldCount), event(faction, side)).state, "legitimacy");

  it("U: fewer than 2 Displacement markers, Legitimacy +1; otherwise -1", () => {
    expect([legitimacyAfter("state", "unshaded", 0, 0), legitimacyAfter("state", "unshaded", 0, 1)]).toEqual([6, 6]);
    expect([legitimacyAfter("state", "unshaded", 1, 1), legitimacyAfter("state", "unshaded", 0, 2)]).toEqual([4, 4]);
  });

  it("S: Legitimacy -1 per 2 markers, New and Old, round down, maximum -3 (DEC-69 point 8)", () => {
    expect([0, 1, 2, 3, 5, 6, 8].map((n) => legitimacyAfter("pkk", "shaded", Math.ceil(n / 2), Math.floor(n / 2)))).toEqual([5, 5, 4, 4, 3, 2, 2]);
  });

  it("S: Europe +1", () => {
    expect(track(play(displaced("pkk", 1, 1), event("pkk", "shaded")).state, "europe")).toBe(2);
  });

  it("logs the Legitimacy change under the Event rule (05 s5), as other card effects", () => {
    const refs = (faction: "state" | "pkk", side: string): unknown[] =>
      play(displaced(faction, 2, 2), event(faction, side)).entries.filter((e) => e.kind === "EffectApplied" && e.data["track"] === "legitimacy").map((e) => e.ruleRef);
    expect([refs("state", "unshaded"), refs("pkk", "shaded")]).toEqual([["05 s5"], ["05 s5"]]);
  });
});

// P3b-07g: Northern Iraq, Momentum and Guards (doc 33 s2.4, B4, B5).
const units = (s: GameState, id: string, piece: string): number => Object.values(pieces(s, id, piece)).reduce((a, n) => a + n, 0);
const vacuum = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, northernIraqVacuum: true } });

describe("KDP-PUK Civil War (DK-070)", () => {
  it("U: KDP posture one step toward Aligned", () => {
    const { state } = play(setTrack(board("state", "DK-070"), "posture.kdp", "tolerant"), event("state", "unshaded"));
    expect(track(state, "posture.kdp")).toBe("restricted");
  });

  it("S: 2 Guerrillas in the PUK Zone and 1 Base in the chosen zone, posture permitting", () => {
    const open = setTrack(setTrack(board("pkk", "DK-070"), "posture.puk", "host"), "posture.kdp", "host");
    const puk = units(open, "puk-zone", "guerrilla");
    const { state } = play(open, event("pkk", "shaded", [0]));
    expect([units(state, "puk-zone", "guerrilla") - puk, units(state, "kdp-zone", "pkkBase") - units(open, "kdp-zone", "pkkBase")]).toEqual([2, 1]);
    const toPuk = play(open, event("pkk", "shaded", [1])).state;
    expect(units(toPuk, "puk-zone", "pkkBase") - units(open, "puk-zone", "pkkBase")).toBe(1);
  });

  it("S: a closed posture places nothing there; Tolerant takes a Base only after the Vacuum", () => {
    const shut = setTrack(setTrack(board("pkk", "DK-070"), "posture.puk", "restricted"), "posture.kdp", "tolerant");
    const { state } = play(shut, event("pkk", "shaded", [0]));
    expect([units(state, "puk-zone", "guerrilla") - units(shut, "puk-zone", "guerrilla"), units(state, "kdp-zone", "pkkBase") - units(shut, "kdp-zone", "pkkBase")]).toEqual([0, 0]);
    const after = play(vacuum(shut), event("pkk", "shaded", [0])).state;
    expect(units(after, "kdp-zone", "pkkBase") - units(shut, "kdp-zone", "pkkBase")).toBe(1);
  });
});

describe("Operation Steel (DK-071)", () => {
  const ready = (): GameState => setPieces(setPieces(setTrack(vacuum(board("state", "DK-071")), "posture.kdp", "tolerant"), "hakkari", "troops", 6), "botan", "troops", 6);
  const lift = (fromBotan: number) => ({ locations: ["kdp-zone"], perLocation: {}, sa: { locations: ["kdp-zone"], perLocation: { "kdp-zone": { moves: [{ from: "hakkari", count: 6 }, { from: "botan", count: fromBotan }] } } } });
  const assault = (moves: unknown[] = []) => ({ locations: ["kdp-zone"], perLocation: {}, sa: { locations: ["kdp-zone"], perLocation: { "kdp-zone": { moves } } } });

  it("U: the Sweep lift moves up to 10 Troops, above the normal 6 (B5)", () => {
    const { state } = play(ready(), event("state", "unshaded", [lift(4), assault()]));
    expect(pieces(state, "kdp-zone", "troops")).toEqual({ default: 10 });
    expect(units(state, "kdp-zone", "guerrilla")).toBe(0);
    expect(marker(state, "kdp-zone", "disputedHarm")).toBe(1);
  });

  it("U: 11 Troops exceed the card limit; the Assault lifts none", () => {
    expect(codes(ready(), event("state", "unshaded", [lift(5), assault()]))).toEqual(["crossBorderTroops"]);
    expect(codes(ready(), event("state", "unshaded", [lift(4), assault([{ from: "botan", count: 1 }])]))).toEqual(["crossBorderNoLift"]);
  });

  it("S: up to 4 Guerrillas from the KDP Zone to Hakkari or Botan, Underground; Legitimacy -1, Europe +1", () => {
    const pkk = setPieces(setPieces(board("pkk", "DK-071"), "kdp-zone", "guerrilla", 3, "active"), "kdp-zone", "guerrilla", 2);
    const hakkari = units(pkk, "hakkari", "guerrilla");
    const { state } = play(pkk, event("pkk", "shaded", [0, 4]));
    expect([units(state, "hakkari", "guerrilla") - hakkari, units(state, "kdp-zone", "guerrilla")]).toEqual([4, 1]);
    expect(pieces(state, "hakkari", "guerrilla")["active"] ?? 0).toBe(pieces(pkk, "hakkari", "guerrilla")["active"] ?? 0);
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([4, 2]);
    const botan = play(pkk, event("pkk", "shaded", [1, 2])).state;
    expect(units(botan, "botan", "guerrilla") - units(pkk, "botan", "guerrilla")).toBe(2);
  });
});

// Village Clearance in Hakkari (S0: Mountain, Pop 1, Passive Opposition, Troops, Police, State Control).
const clearance = (target = "hakkari") =>
  op("state", "opSa", { op: "state.sweep", locations: [target], sa: { action: "state.village-clearance", locations: [target], perLocation: { [target]: { reception: "diyarbakir-city" } }, timing: "after" } });
const clearable = (s: GameState, legitimacy = 10): GameState => {
  const t = setTrack(setTrack(turnOf("state"), "emergencyRule", "ohal"), "legitimacy", legitimacy);
  return { ...inCampaign(ruleset, t, "C4"), modifiers: s.modifiers };
};

describe("EU-Turkey Customs Union (DK-072)", () => {
  it("U: Legitimacy +2, State Resources +3, no Momentum", () => {
    const before = board("state", "DK-072");
    const { state } = play(before, event("state", "unshaded"));
    expect([track(state, "legitimacy"), track(state, "resources.state"), state.modifiers]).toEqual([7, Number(before.tracks["resources.state"]) + 3, []]);
  });

  it("S: Europe +1; PKK Momentum until Reset", () => {
    const { state } = play(board("pkk", "DK-072"), event("pkk", "shaded"));
    expect([track(state, "europe"), state.modifiers.map((m) => [m.id, m.duration])]).toEqual([2, [["customs-union", "untilReset"]]]);
  });

  it("S: Village Clearance costs Legitimacy 1 more, and condition 4 needs 1 more (DEC-74)", () => {
    const momentum = play(board("pkk", "DK-072"), event("pkk", "shaded")).state;
    expect(track(play(clearable(momentum), clearance()).state, "legitimacy")).toBe(10 - 2 - 1);
    expect(codes(clearable(momentum, 3), clearance())).toEqual(["clearanceLegitimacy"]);
    expect(codes(clearable(momentum, 4), clearance())).toEqual([]);
    expect(codes(clearable(turnOf("state"), 3), clearance())).toEqual([]);
  });
});

describe("US Lending Conditions (DK-074)", () => {
  it("U: State Resources +4", () => {
    const before = board("state", "DK-074");
    expect(track(play(before, event("state", "unshaded")).state, "resources.state")).toBe(Number(before.tracks["resources.state"]) + 4);
  });

  it("S: Legitimacy -1; PKK Momentum until Reset", () => {
    const { state } = play(board("pkk", "DK-074"), event("pkk", "shaded"));
    expect([track(state, "legitimacy"), state.modifiers.map((m) => [m.id, m.duration])]).toEqual([4, [["lending-conditions", "untilReset"]]]);
  });

  it("S: each Village Clearance also costs 2 State Resources; refused when the State cannot pay", () => {
    const momentum = play(board("pkk", "DK-074"), event("pkk", "shaded")).state;
    const ready = clearable(momentum);
    const paid = play(ready, clearance()).state;
    const plain = play(clearable(turnOf("state")), clearance()).state;
    expect(Number(plain.tracks["resources.state"]) - Number(paid.tracks["resources.state"])).toBe(2);
    const sweepCost = sweep.cost(ruleset, ready, { locations: ["hakkari"], perLocation: {} }, { free: false } as ActionOptions);
    expect(codes(setTrack(ready, "resources.state", sweepCost + 1), clearance())).toEqual(["cannotPay"]);
    expect(codes(setTrack(ready, "resources.state", sweepCost + 2), clearance())).toEqual([]);
  });

  it("S: a Village Clearance a card makes free skips the 2 Resources (DEC-69 point 9)", () => {
    const momentum = play(board("pkk", "DK-074"), event("pkk", "shaded")).state;
    const cost = (free: boolean): number => villageClearance.cost(ruleset, momentum, { locations: ["hakkari"], perLocation: {} }, { free } as ActionOptions);
    expect([cost(false), cost(true)]).toEqual([2, 0]);
  });
});

describe("Raid on Two Guard Villages (DK-075)", () => {
  const guarded = (faction: "state" | "pkk", available = 1): GameState => {
    const s = setPieces(setPieces(board(faction, "DK-075"), "hakkari", "guards", 1), "botan", "guards", 1);
    return { ...s, pools: { ...s.pools, guards: { available, outOfPlay: 14 } } };
  };

  it("U: PKK Harm marker and 1 Guard in the chosen Guard space; Europe -1", () => {
    const { state } = play(guarded("state"), event("state", "unshaded", [["botan"]]));
    expect([marker(state, "botan", "pkkHarm"), marker(state, "hakkari", "pkkHarm"), units(state, "botan", "guards"), track(state, "europe")]).toEqual([1, 0, 2, 0]);
  });

  it("U: no Guard Available places none; no Guard space still costs Europe -1", () => {
    const none = play(guarded("state", 0), event("state", "unshaded", [["hakkari"]])).state;
    expect([marker(none, "hakkari", "pkkHarm"), units(none, "hakkari", "guards")]).toEqual([1, 1]);
    const empty = play(board("state", "DK-075"), event("state", "unshaded", [[]])).state;
    expect([ruleset.spaces.filter((x) => marker(empty, x.id, "pkkHarm") > 0), track(empty, "europe")]).toEqual([[], 0]);
  });

  it("U: exactly 1 space", () => {
    expect(codes(guarded("state"), event("state", "unshaded", [["botan", "hakkari"]]))).toEqual(["badAnswer"]);
  });

  it("S: block only, PKK Harm marker in the PKK's chosen space, nothing else", () => {
    expect(card("DK-075")?.shaded?.blockOnly).toBe(true);
    const { state } = play(guarded("pkk"), event("pkk", "shaded", [["hakkari"]]));
    expect([marker(state, "hakkari", "pkkHarm"), units(state, "hakkari", "guards"), track(state, "europe")]).toEqual([1, 1, 1]);
  });
});
