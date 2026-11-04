import { describe, expect, it } from "vitest";
import { codes, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf, withCard } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";
import { agitationCost } from "./ops/pkk/agitation.ts";
import type { ActionOptions } from "./ops/action.ts";
import { sweep } from "./ops/state/sweep.ts";

// T-EVT per side for the C3 cards (11 P3b-07; encoding docs/prototype/32, DEC-68).
// S0 board: Diyarbakır City and Western Cities have State Control and Police; Diyarbakır Rural
// has 1 Police; Legitimacy is set to 5 so no side meets the track ends.
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const c3 = (s: GameState): GameState => setTrack({ ...s, turn: { ...s.turn, campaign: "C3" } }, "legitimacy", 5);
const board = (faction: "state" | "pkk", card: string): GameState => c3(withCard(turnOf(faction), card));
const track = (s: GameState, id: string): unknown => s.tracks[id];
const level = (s: GameState, id: string): number | null | undefined => s.spaces[id]?.level;
const offices = (s: GameState): string[] => ruleset.spaces.filter((x) => (s.spaces[x.id]?.markers["office"]?.["default"] ?? 0) > 0).map((x) => x.id);
const card = (id: string) => ruleset.cards[id];

describe("OHAL Powers (DK-036)", () => {
  it("U: OHAL becomes OHAL Extended Powers; any other step stays", () => {
    const ohal = setTrack(board("state", "DK-036"), "emergencyRule", "ohal");
    expect(track(play(ohal, event("state", "unshaded")).state, "emergencyRule")).toBe("ohalExtendedPowers");
    const martial = board("state", "DK-036");
    expect(track(play(martial, event("state", "unshaded")).state, "emergencyRule")).toBe("martialLaw");
  });

  it("S: Legitimacy -2, Europe +1", () => {
    const { state } = play(board("pkk", "DK-036"), event("pkk", "shaded"));
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([3, 2]);
  });
});

describe("Law 3713 (DK-039)", () => {
  it("U: Legitimacy +2 and one City with State Control and Police shifts toward Support", () => {
    const { state } = play(board("state", "DK-039"), event("state", "unshaded", [["diyarbakir-city"]]));
    expect(track(state, "legitimacy")).toBe(7);
    expect(level(state, "diyarbakir-city")).toBe(1);
  });

  it("U: a City without Police is not offered", () => {
    const noPolice = setPieces(board("state", "DK-039"), "diyarbakir-city", "police", 0);
    expect(codes(noPolice, event("state", "unshaded", [["diyarbakir-city"]]))).toEqual(["badAnswer"]);
    expect(codes(noPolice, event("state", "unshaded", [["western-cities"]]))).toEqual([]);
  });

  it("S: Legitimacy -1, Europe +1", () => {
    const { state } = play(board("pkk", "DK-039"), event("pkk", "shaded"));
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([4, 2]);
  });
});

describe("Election Brings HEP Deputies to Parliament (DK-042)", () => {
  it("follows HEP Founded in the pile", () => {
    expect(card("DK-042")?.chainAfter).toEqual(["DK-037"]);
  });

  it("U: Legitimacy +1; with Legal Space Open, line 4 places 1 Office", () => {
    const open = setTrack(board("state", "DK-042"), "legalSpace", "open");
    const { state } = play(open, event("state", "unshaded"));
    expect(track(state, "legitimacy")).toBe(6);
    expect(offices(state)).toEqual(["diyarbakir-city"]);
  });

  it("U: line 4 respects the line 3 limit, and Prosecuted places nothing", () => {
    let full = setTrack(board("state", "DK-042"), "legalSpace", "open");
    for (const id of ["diyarbakir-city", "western-cities", "mardin-batman", "van-bitlis"]) full = setMarkers(full, id, "office", 1);
    expect(offices(play(full, event("state", "unshaded")).state)).toHaveLength(4);
    const prosecuted = setTrack(board("state", "DK-042"), "legalSpace", "prosecuted");
    expect(offices(play(prosecuted, event("state", "unshaded")).state)).toEqual([]);
  });

  it("U: the PKK may execute it (it removes no Office)", () => {
    expect(codes(setTrack(board("pkk", "DK-042"), "legalSpace", "open"), event("pkk", "unshaded"))).toEqual([]);
  });

  it("S: Mardin-Batman or Diyarbakır Rural without an Office shifts toward Opposition", () => {
    const { state } = play(board("pkk", "DK-042"), event("pkk", "shaded", [["diyarbakir-rural"]]));
    expect(level(state, "diyarbakir-rural")).toBe(-1);
    const office = setMarkers(board("pkk", "DK-042"), "mardin-batman", "office", 1);
    expect(codes(office, event("pkk", "shaded", [["mardin-batman"]]))).toEqual(["badAnswer"]);
  });
});

describe("Prosecutor Files to Close HEP (DK-051)", () => {
  it("follows HEP Founded in the pile", () => {
    expect(card("DK-051")?.chainAfter).toEqual(["DK-037"]);
  });

  it("U: places the Closure Case marker and sets Legal Space to Prosecuted", () => {
    const { state } = play(setTrack(board("state", "DK-051"), "legalSpace", "open"), event("state", "unshaded"));
    expect(state.flags["closureCase"]).toBe(true);
    expect(track(state, "legalSpace")).toBe("prosecuted");
  });

  it("U: with a case already filed, nothing happens (DEC-68)", () => {
    const filed = setTrack({ ...board("state", "DK-051"), flags: { ...turnOf("state").flags, closureCase: true } }, "legalSpace", "prosecuted");
    const { state } = play(filed, event("state", "unshaded"));
    expect([state.flags["closureCase"], track(state, "legalSpace")]).toEqual([true, "prosecuted"]);
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(board("pkk", "DK-051"), event("pkk", "unshaded"))).toEqual(["sideRestricted"]);
  });

  it("S: Europe +1", () => {
    expect(track(play(board("pkk", "DK-051"), event("pkk", "shaded")).state, "europe")).toBe(2);
  });
});

describe("Attack on Boğazköy Gendarme Station (DK-052)", () => {
  it("U: places 2 Police and 1 Troop in Diyarbakır Rural", () => {
    const { state } = play(board("state", "DK-052"), event("state", "unshaded"));
    expect([pieces(state, "diyarbakir-rural", "police"), pieces(state, "diyarbakir-rural", "troops")]).toEqual([{ default: 3 }, { default: 1 }]);
  });

  it("S: free Attack with Ambush in Diyarbakır Rural or an adjacent space only", () => {
    const attack = (loc: string) => event("pkk", "shaded", [{ locations: [loc], perLocation: {}, sa: { locations: [loc], perLocation: {} } }]);
    const ready = setPieces(setPieces(board("pkk", "DK-052"), "mardin-batman", "guerrilla", 2), "hakkari", "guerrilla", 2);
    const { state } = play(ready, attack("mardin-batman"));
    expect(pieces(state, "mardin-batman", "troops")).toEqual({ default: 0 });
    expect(codes(ready, attack("hakkari"))).toEqual(["eventConstraint"]);
  });
});

describe("C3 Propaganda (DK-055)", () => {
  it("is the C3 Propaganda card", () => {
    expect([card("DK-055")?.type, card("DK-055")?.campaign]).toEqual(["propaganda", "C3"]);
  });
});

const marker = (s: GameState, id: string, m: string): number => Object.values(s.spaces[id]?.markers[m] ?? {}).reduce((a, n) => a + n, 0);
const harmCard = (id: string, faction: "state" | "pkk", side: string) => play(board(faction, id), event(faction, side)).state;

describe("Newroz Killings (DK-043)", () => {
  it("U is block only: 2 State Harm markers and nothing else", () => {
    expect(card("DK-043")?.unshaded?.blockOnly).toBe(true);
    const state = harmCard("DK-043", "state", "unshaded");
    expect([marker(state, "mardin-batman", "stateHarm"), marker(state, "botan", "stateHarm")]).toEqual([1, 1]);
    expect([track(state, "legitimacy"), track(state, "europe"), level(state, "mardin-batman")]).toEqual([5, 1, 0]);
  });

  it("S: the markers, Legitimacy -1, Europe +1, Mardin-Batman toward Opposition", () => {
    const state = harmCard("DK-043", "pkk", "shaded");
    expect([marker(state, "mardin-batman", "stateHarm"), marker(state, "botan", "stateHarm")]).toEqual([1, 1]);
    expect([track(state, "legitimacy"), track(state, "europe"), level(state, "mardin-batman")]).toEqual([4, 2, -1]);
  });
});

describe("Şırnak Town Battle (DK-045)", () => {
  it("U is block only: State Harm in Botan, Reception in Diyarbakır City", () => {
    expect(card("DK-045")?.unshaded?.blockOnly).toBe(true);
    const state = harmCard("DK-045", "state", "unshaded");
    expect([marker(state, "botan", "stateHarm"), marker(state, "diyarbakir-city", "reception")]).toEqual([1, 1]);
    expect([track(state, "legitimacy"), level(state, "diyarbakir-city")]).toEqual([5, 0]);
  });

  it("S: the markers, Legitimacy -1, Diyarbakır City toward Opposition", () => {
    const state = harmCard("DK-045", "pkk", "shaded");
    expect([marker(state, "botan", "stateHarm"), marker(state, "diyarbakir-city", "reception")]).toEqual([1, 1]);
    expect([track(state, "legitimacy"), track(state, "europe"), level(state, "diyarbakir-city")]).toEqual([4, 1, -1]);
  });
});

describe("Houses Burned at Kelekçi (DK-048)", () => {
  it("U is block only: State Harm in Diyarbakır Rural", () => {
    expect(card("DK-048")?.unshaded?.blockOnly).toBe(true);
    const state = harmCard("DK-048", "state", "unshaded");
    expect([marker(state, "diyarbakir-rural", "stateHarm"), track(state, "legitimacy"), track(state, "europe")]).toEqual([1, 5, 1]);
  });

  it("S: State Harm, Legitimacy -1, Europe +1", () => {
    const state = harmCard("DK-048", "pkk", "shaded");
    expect([marker(state, "diyarbakir-rural", "stateHarm"), track(state, "legitimacy"), track(state, "europe")]).toEqual([1, 4, 2]);
  });
});

describe("Journalists and Press Staff Killed (DK-049)", () => {
  it("U is block only: Disputed Harm in Diyarbakır City", () => {
    expect(card("DK-049")?.unshaded?.blockOnly).toBe(true);
    const state = harmCard("DK-049", "state", "unshaded");
    expect([marker(state, "diyarbakir-city", "disputedHarm"), track(state, "europe")]).toEqual([1, 1]);
  });

  it("S: Disputed Harm, one Covert marker revealed at random, Europe +1", () => {
    const covert = setMarkers(setMarkers(board("pkk", "DK-049"), "hakkari", "covert", 1), "botan", "covert", 1);
    const { state, entries } = play(covert, event("pkk", "shaded"));
    expect(marker(state, "diyarbakir-city", "disputedHarm")).toBe(1);
    expect(marker(state, "hakkari", "covert") + marker(state, "botan", "covert")).toBe(1);
    expect(marker(state, "hakkari", "stateHarm") + marker(state, "botan", "stateHarm")).toBe(1);
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([3, 2]);
    expect(entries.filter((e) => e.kind === "DieRolled")).toHaveLength(1);
  });

  it("S: with no Covert marker on the map, no reveal", () => {
    const state = harmCard("DK-049", "pkk", "shaded");
    expect([track(state, "legitimacy"), track(state, "europe")]).toEqual([5, 2]);
  });
});

describe("Unattributed Killings in the Southeast (DK-053)", () => {
  it("removes an Office first, from the highest-Pop space, ties in the 07 s10.1 order", () => {
    const tied = setMarkers(setMarkers(board("state", "DK-053"), "botan", "office", 1), "diyarbakir-city", "office", 1);
    const state = play(tied, event("state", "unshaded")).state;
    expect([marker(state, "diyarbakir-city", "office"), marker(state, "botan", "office")]).toEqual([0, 1]);
    expect(marker(state, "diyarbakir-city", "disputedHarm")).toBe(1);
    expect(pieces(state, "mardin-batman", "guerrilla")).toEqual(pieces(tied, "mardin-batman", "guerrilla"));
    const higher = setMarkers(tied, "mardin-batman", "office", 1);
    expect(marker(play(higher, event("state", "unshaded")).state, "mardin-batman", "office")).toBe(0);
  });

  it("with no Office, removes an Underground Guerrilla first from the highest-Pop space", () => {
    const mixed = setPieces(board("state", "DK-053"), "mardin-batman", "guerrilla", 1, "active");
    const state = play(mixed, event("state", "unshaded")).state;
    expect(pieces(state, "mardin-batman", "guerrilla")).toEqual({ underground: 0, active: 1 });
    expect(marker(state, "mardin-batman", "disputedHarm")).toBe(1);
  });

  it("with no target, nothing happens; S still gives Europe +1 (DEC-68)", () => {
    const empty = setPieces(setPieces(board("pkk", "DK-053"), "mardin-batman", "guerrilla", 0), "botan", "guerrilla", 0);
    const state = play(empty, event("pkk", "shaded")).state;
    expect(ruleset.spaces.map((x) => marker(state, x.id, "disputedHarm")).reduce((a, n) => a + n, 0)).toBe(0);
    expect(track(state, "europe")).toBe(2);
  });

  it("both factions may execute both sides (05 s5 item 1 exception, DEC-68)", () => {
    for (const side of ["unshaded", "shaded"]) {
      expect(codes(board("pkk", "DK-053"), event("pkk", side))).toEqual([]);
      expect(codes(board("state", "DK-053"), event("state", side))).toEqual([]);
    }
  });
});

const free = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, northernIraqVacuum: true } });
const lift = (n: number) => ({ locations: ["kdp-zone"], perLocation: {}, sa: { locations: ["kdp-zone"], perLocation: { "kdp-zone": { moves: [{ from: "hakkari", count: n }] } } } });
const zoneAssault = (moves: unknown[] = []) => ({ locations: ["kdp-zone"], perLocation: {}, sa: { locations: ["kdp-zone"], perLocation: { "kdp-zone": { moves } } } });
const guerrillas = (s: GameState, id: string): number => Object.values(pieces(s, id, "guerrilla")).reduce((a, n) => a + n, 0);

describe("KHK 430 (DK-038)", () => {
  const sweepCost = (s: GameState): number => sweep.cost(ruleset, s, { locations: ["botan"], perLocation: {} }, { free: false } as ActionOptions);
  it("U: State Momentum, Sweep costs 1 per space at Martial Law; then a free Garrison", () => {
    const before = board("state", "DK-038");
    const { state } = play(before, event("state", "unshaded", [null]));
    expect([sweepCost(before), sweepCost(state)]).toEqual([2, 1]);
    expect(state.modifiers.map((m) => [m.id, m.duration])).toEqual([["khk-430", "untilReset"]]);
  });

  it("S: Legitimacy -2", () => {
    expect(track(play(board("pkk", "DK-038"), event("pkk", "shaded")).state, "legitimacy")).toBe(3);
  });
});

describe("Operation in Northern Iraq (DK-041)", () => {
  it("follows Northern Iraq Vacuum in the pile", () => {
    expect(card("DK-041")?.chainAfter).toEqual(["DK-040"]);
  });

  it("U: free Sweep with one lift, then free Assault with Cross-Border and Disputed Harm", () => {
    const ready = setTrack(free(board("state", "DK-041")), "posture.kdp", "tolerant");
    const { state } = play(ready, event("state", "unshaded", [lift(2), zoneAssault()]));
    expect(pieces(state, "kdp-zone", "troops")).toEqual({ default: 2 });
    expect(guerrillas(state, "kdp-zone")).toBe(2);
    expect(marker(state, "kdp-zone", "disputedHarm")).toBe(1);
  });

  it("U: the Assault may not lift more Troops (DEC-68)", () => {
    const ready = setTrack(free(board("state", "DK-041")), "posture.kdp", "tolerant");
    expect(codes(ready, event("state", "unshaded", [lift(2), zoneAssault([{ from: "botan", count: 2 }])]))).toEqual(["crossBorderNoLift"]);
  });

  it("S: Legitimacy -1; up to 3 Guerrillas move to the PUK Zone, Underground", () => {
    const ready = setPieces(board("pkk", "DK-041"), "kdp-zone", "guerrilla", 1, "active");
    const { state } = play(ready, event("pkk", "shaded", [3]));
    expect(pieces(state, "puk-zone", "guerrilla")).toEqual({ underground: 3, active: 0 });
    expect(track(state, "legitimacy")).toBe(4);
  });
});

describe("Turkey-Syria Accord (DK-044)", () => {
  it("U: Syria one step toward Hostile; with 2 or more Bases there, remove 1", () => {
    const two = setPieces(setTrack(board("state", "DK-044"), "posture.syria", "tolerant"), "syria-bekaa", "pkkBase", 2);
    const { state } = play(two, event("state", "unshaded"));
    expect([track(state, "posture.syria"), pieces(state, "syria-bekaa", "pkkBase")]).toEqual(["restricted", { default: 1 }]);
    const one = setTrack(board("state", "DK-044"), "posture.syria", "tolerant");
    expect(pieces(play(one, event("state", "unshaded")).state, "syria-bekaa", "pkkBase")).toEqual({ default: 1 });
  });

  it("S: up to 2 Guerrillas to one chosen space, State Resources -2", () => {
    const before = board("pkk", "DK-044");
    const { state } = play(before, event("pkk", "shaded", ["Şanlıurfa", 2]));
    expect([guerrillas(state, "sanliurfa"), guerrillas(state, "syria-bekaa")]).toEqual([2, 0]);
    expect(track(state, "resources.state")).toBe(Number(before.tracks["resources.state"]) - 2);
  });
});

describe("Large Operation with KDP Help (DK-047)", () => {
  const run = (posture: string) => play(setTrack(free(board("state", "DK-047")), "posture.kdp", posture), event("state", "unshaded", [lift(2), zoneAssault()])).state;
  it("U: at Hostile or Aligned, Sweep and Assault ignore the Mountain modifier (DEC-68)", () => {
    const hostile = run("hostile");
    expect([guerrillas(hostile, "kdp-zone"), marker(hostile, "kdp-zone", "disputedHarm")]).toEqual([1, 1]);
  });

  it("U: at Tolerant the Mountain modifier applies", () => {
    expect(guerrillas(run("tolerant"), "kdp-zone")).toBe(2);
  });

  it("S: up to 4 Guerrillas to the PUK Zone or Hakkari, Underground; State Resources -3", () => {
    const before = setPieces(board("pkk", "DK-047"), "kdp-zone", "guerrilla", 1, "active");
    const { state } = play(before, event("pkk", "shaded", ["Hakkari", 4]));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 6, active: 0 });
    expect(track(state, "resources.state")).toBe(Number(before.tracks["resources.state"]) - 3);
  });
});

describe("Özgür Gündem Begins Publication (DK-050)", () => {
  const spend = { coercion: 1, pkkHarm: 0, shifts: 2 };
  it("U: State Momentum, Agitation in Diyarbakır City costs 1 more per shift", () => {
    const { state } = play(board("state", "DK-050"), event("state", "unshaded"));
    expect([agitationCost(ruleset, state, "diyarbakir-city", spend), agitationCost(ruleset, state, "botan", spend)]).toEqual([5, 3]);
    expect(state.modifiers.map((m) => m.duration)).toEqual(["untilReset"]);
  });

  it("S: Europe +1; PKK Momentum, each revealed Covert marker costs Legitimacy 1 more", () => {
    const { state } = play(board("pkk", "DK-050"), event("pkk", "shaded"));
    expect(track(state, "europe")).toBe(2);
    const reveal = setMarkers({ ...board("pkk", "DK-049"), modifiers: state.modifiers }, "hakkari", "covert", 1);
    expect(track(play(reveal, event("pkk", "shaded")).state, "legitimacy")).toBe(2);
  });
});
