import { describe, expect, it } from "vitest";
import { codes, op, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf, withCard, withRoll } from "../../../test/board.ts";
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

// P3b-07i: Syria and northern Iraq (doc 34 s2.2). Free action answers are plans; null skips.
const plan = (locations: string[]) => ({ locations, perLocation: {} });
const leader = (s: GameState, side: "present" | "abroad" | null): GameState =>
  setMarkers(setMarkers(s, "syria-bekaa", "leadership", side === "present" ? 1 : 0, "present"), "syria-bekaa", "leadership", side === "abroad" ? 1 : 0, "abroad");
const side = (s: GameState, face: string): number => s.spaces["syria-bekaa"]?.markers["leadership"]?.[face] ?? 0;
const KDP = 0;
const PUK = 1;

describe("Ankara Process in Northern Iraq (DK-084)", () => {
  it("U: KDP or PUK posture one step toward Hostile, then from Hostile to Aligned", () => {
    const s = setTrack(setTrack(board("state", "DK-084"), "posture.kdp", "tolerant"), "posture.puk", "hostile");
    const kdp = play(s, event("state", "unshaded", [KDP])).state;
    expect([track(kdp, "posture.kdp"), track(kdp, "posture.puk")]).toEqual(["restricted", "hostile"]);
    const puk = play(s, event("state", "unshaded", [PUK])).state;
    expect([track(puk, "posture.kdp"), track(puk, "posture.puk")]).toEqual(["tolerant", "aligned"]);
  });

  it("U: Aligned stays Aligned; a step to Hostile activates Guerrillas there (07 s5.1)", () => {
    const aligned = play(setTrack(board("state", "DK-084"), "posture.kdp", "aligned"), event("state", "unshaded", [KDP])).state;
    expect(track(aligned, "posture.kdp")).toBe("aligned");
    const s = setPieces(setTrack(board("state", "DK-084"), "posture.kdp", "restricted"), "kdp-zone", "guerrilla", 3);
    const hostile = play(s, event("state", "unshaded", [KDP])).state;
    expect([track(hostile, "posture.kdp"), pieces(hostile, "kdp-zone", "guerrilla")["active"]]).toEqual(["hostile", 3]);
  });

  it("S: up to 3 Guerrillas one way between the zones, free and with no posture limit; 1 Base, posture permitting", () => {
    const s = setPieces(setTrack(setTrack(board("pkk", "DK-084"), "posture.kdp", "host"), "posture.puk", "hostile"), "kdp-zone", "guerrilla", 5);
    const before = units(s, "puk-zone", "guerrilla");
    const { state } = play(s, event("pkk", "shaded", [0, 3, KDP]));
    expect([units(state, "kdp-zone", "guerrilla"), units(state, "puk-zone", "guerrilla") - before]).toEqual([2, 3]);
    expect(units(state, "kdp-zone", "pkkBase") - units(s, "kdp-zone", "pkkBase")).toBe(1);
    expect(track(state, "resources.pkk")).toBe(track(s, "resources.pkk"));
    // PUK is Hostile: arrivals are Active (07 s5.1; the text says no "Underground") and no Base goes there.
    expect(pieces(state, "puk-zone", "guerrilla")["underground"] ?? 0).toBe(0);
    const shut = play(s, event("pkk", "shaded", [0, 0, PUK])).state;
    expect(units(shut, "puk-zone", "pkkBase")).toBe(units(s, "puk-zone", "pkkBase"));
  });

  it("S: Guerrillas already Underground in a Hostile zone after Reset (DEC-53) keep their face", () => {
    const s = setPieces(setPieces(setTrack(board("pkk", "DK-084"), "posture.puk", "hostile"), "puk-zone", "guerrilla", 2), "kdp-zone", "guerrilla", 3);
    const moved = play(s, event("pkk", "shaded", [0, 3, KDP])).state;
    expect([pieces(moved, "puk-zone", "guerrilla")["underground"], pieces(moved, "puk-zone", "guerrilla")["active"]]).toEqual([2, 3]);
    const none = play(s, event("pkk", "shaded", [0, 0, KDP])).state;
    expect(pieces(none, "puk-zone", "guerrilla")["underground"]).toBe(2);
  });

  it("S: the other direction; more than 3 Guerrillas is refused", () => {
    const s = setPieces(setTrack(board("pkk", "DK-084"), "posture.puk", "host"), "puk-zone", "guerrilla", 4);
    const { state } = play(s, event("pkk", "shaded", [1, 2, PUK]));
    expect([units(state, "puk-zone", "guerrilla"), units(state, "kdp-zone", "guerrilla") - units(s, "kdp-zone", "guerrilla")]).toEqual([2, 2]);
    // KDP is Host: arrivals keep their face.
    expect(pieces(state, "kdp-zone", "guerrilla")["underground"]).toBe((pieces(s, "kdp-zone", "guerrilla")["underground"] ?? 0) + 2);
    expect(codes(s, event("pkk", "shaded", [1, 4, PUK]))).toEqual(["badAnswer"]);
  });
});

describe("Washington Agreement (DK-089)", () => {
  // Legitimacy 6: no Legitimacy modifier; PUK has no campaign modifier (06 s3.3). A roll of 4 succeeds only with +1.
  const ready = (roll: number): GameState => setTrack(withRoll(board("state", "DK-089"), roll), "legitimacy", 6);

  it("U: a free Diplomacy on KDP or PUK with +1", () => {
    const s = ready(4);
    const { state } = play(s, event("state", "unshaded", [plan(["puk-zone"])]));
    expect([track(state, "posture.puk"), track(state, "resources.state")]).toEqual(["restricted", track(s, "resources.state")]);
    expect(track(play(ready(3), event("state", "unshaded", [plan(["puk-zone"])])).state, "posture.puk")).toBe("tolerant");
  });

  it("U: Syria and Europe are not targets", () => {
    expect(codes(ready(4), event("state", "unshaded", [plan(["europe"])]))).toContain("eventConstraint");
    expect(codes(ready(4), event("state", "unshaded", [plan(["syria-bekaa"])]))).toContain("eventConstraint");
  });

  it("S: State Resources -2; PUK posture one step toward Host, Host stays", () => {
    const s = setTrack(setTrack(board("pkk", "DK-089"), "posture.puk", "hostile"), "resources.state", 10);
    const { state } = play(s, event("pkk", "shaded"));
    expect([track(state, "resources.state"), track(state, "posture.puk")]).toEqual([8, "restricted"]);
    expect(track(play(setTrack(s, "posture.puk", "host"), event("pkk", "shaded")).state, "posture.puk")).toBe("host");
  });
});

describe("PKK Leader Leaves Syria (DK-090)", () => {
  it("U: Restricted goes to Hostile and the Leadership flips to Abroad", () => {
    const { state } = play(leader(setTrack(board("state", "DK-090"), "posture.syria", "restricted"), "present"), event("state", "unshaded"));
    expect([track(state, "posture.syria"), side(state, "present"), side(state, "abroad")]).toEqual(["hostile", 0, 1]);
  });

  it("U: Hostile stays Hostile and the Leadership flips to Abroad", () => {
    const { state } = play(leader(setTrack(board("state", "DK-090"), "posture.syria", "hostile"), "present"), event("state", "unshaded"));
    expect([track(state, "posture.syria"), side(state, "present"), side(state, "abroad")]).toEqual(["hostile", 0, 1]);
  });

  it("U: otherwise one step toward Hostile; the Leadership stays Present", () => {
    const { state } = play(leader(setTrack(board("state", "DK-090"), "posture.syria", "host"), "present"), event("state", "unshaded"));
    expect([track(state, "posture.syria"), side(state, "present")]).toEqual(["tolerant", 1]);
  });

  it("U: after Capture (no marker), Syria still steps to Hostile", () => {
    const { state } = play(leader(setTrack(board("state", "DK-090"), "posture.syria", "restricted"), null), event("state", "unshaded"));
    expect([track(state, "posture.syria"), side(state, "present"), side(state, "abroad")]).toEqual(["hostile", 0, 0]);
  });

  it("S: up to 3 Guerrillas from Syria-Bekaa to one destination, Underground; PKK Resources +2", () => {
    // S0 holds 2 Underground Guerrillas in Syria-Bekaa; the test uses 4 Active ones only.
    const s = setPieces(setPieces(setPieces(board("pkk", "DK-090"), "syria-bekaa", "guerrilla", 0), "syria-bekaa", "guerrilla", 4, "active"), "sanliurfa", "guerrilla", 0);
    const { state } = play(s, event("pkk", "shaded", [1, 3]));
    expect([pieces(state, "sanliurfa", "guerrilla")["underground"], units(state, "syria-bekaa", "guerrilla")]).toEqual([3, 1]);
    expect(track(state, "resources.pkk")).toBe(Number(track(s, "resources.pkk")) + 2);
    const kdp = play(s, event("pkk", "shaded", [2, 2])).state;
    expect(units(kdp, "kdp-zone", "guerrilla") - units(s, "kdp-zone", "guerrilla")).toBe(2);
    expect(codes(s, event("pkk", "shaded", [0, 4]))).toEqual(["badAnswer"]);
  });
});

describe("Adana Minutes (DK-091)", () => {
  it("is a Capability card (U)", () => {
    expect(ruleset.cards["DK-091"]?.type).toBe("capability");
  });

  it("U: all PKK Bases in Syria-Bekaa go to Available", () => {
    const s = setPieces(board("state", "DK-091"), "syria-bekaa", "pkkBase", 3);
    const { state } = play(s, event("state", "unshaded"));
    expect(units(state, "syria-bekaa", "pkkBase")).toBe(0);
    expect(state.pools["pkkBase"]?.available).toBe(Number(s.pools["pkkBase"]?.available) + 3);
  });

  it("U: with Syria Hostile, Host Pressure may not target Syria (DEC-75 point 6: no modifier needed)", () => {
    const start = board("state", "DK-090");
    const hostile = play(leader(setTrack(start, "posture.syria", "restricted"), "present"), event("state", "unshaded")).state;
    const after = play(withCard({ ...hostile, turn: start.turn, initiative: start.initiative }, "DK-091"), event("state", "unshaded")).state;
    const pkk = { ...turnOf("pkk"), spaces: after.spaces, tracks: after.tracks, pools: after.pools, modifiers: after.modifiers };
    const pressure = op("pkk", "opSa", { op: "pkk.rally", locations: ["botan"], sa: { action: "pkk.host-pressure", timing: "after", locations: ["syria-bekaa"] } });
    expect([track(pkk, "posture.syria"), units(pkk, "syria-bekaa", "guerrilla") > 0]).toEqual(["hostile", true]);
    expect(codes(pkk, pressure)).toContain("leadershipAbroad");
  });

  it("S: Hostile moves to Restricted, the Leadership stays Abroad; PKK Resources +1", () => {
    const s = leader(setTrack(board("pkk", "DK-091"), "posture.syria", "hostile"), "abroad");
    const { state } = play(s, event("pkk", "shaded"));
    expect([track(state, "posture.syria"), side(state, "abroad"), track(state, "resources.pkk")]).toEqual(["restricted", 1, Number(track(s, "resources.pkk")) + 1]);
  });

  it("S: if Syria is not Hostile, only PKK Resources +1", () => {
    const s = setTrack(board("pkk", "DK-091"), "posture.syria", "tolerant");
    const { state } = play(s, event("pkk", "shaded"));
    expect([track(state, "posture.syria"), track(state, "resources.pkk")]).toEqual(["tolerant", Number(track(s, "resources.pkk")) + 1]);
  });
});

describe("Arrest in Rome (DK-092)", () => {
  const ready = (face: "present" | "abroad" | null, roll = 4): GameState => setTrack(leader(withRoll(board("state", "DK-092"), roll), face), "legitimacy", 6);

  it("comes after DK-090 in the deck (08 s8)", () => {
    expect(ruleset.cards["DK-092"]?.chainAfter).toEqual(["DK-090"]);
  });

  it("U: with the Leadership Abroad, a free Diplomacy on Europe with +1", () => {
    const { state } = play(ready("abroad"), event("state", "unshaded", [plan(["europe"])]));
    expect(track(state, "europe")).toBe(0);
    expect(codes(ready("abroad"), event("state", "unshaded", [plan(["puk-zone"])]))).toContain("eventConstraint");
  });

  it("U: with the Leadership Present or captured, nothing happens", () => {
    expect(track(play(ready("present"), event("state", "unshaded")).state, "europe")).toBe(1);
    expect(track(play(ready(null), event("state", "unshaded")).state, "europe")).toBe(1);
  });

  it("S: Europe +1, then a free Rally on the Europe track", () => {
    const { state } = play(board("pkk", "DK-092"), event("pkk", "shaded", [plan(["europe"])]));
    expect(track(state, "europe")).toBe(3);
  });

  it("S: at the Ban cap the Rally is refused and may be skipped", () => {
    const capped = setTrack(setMarkers(board("pkk", "DK-092"), "europe", "ban", 1), "europe", 2);
    expect(codes(capped, event("pkk", "shaded", [plan(["europe"])]))).toContain("rallyEuropeCap");
    expect(track(play(capped, event("pkk", "shaded", [null])).state, "europe")).toBe(3);
  });
});

describe("C5 Propaganda (DK-099)", () => {
  it("is a Propaganda card, not deck-eligible", () => {
    expect([ruleset.cards["DK-099"]?.type, ruleset.cards["DK-099"]?.deckEligible]).toEqual(["propaganda", false]);
  });
});
