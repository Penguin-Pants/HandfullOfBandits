import { describe, expect, it } from "vitest";
import { codes, op, pieces, play, setLevel, setMarkers, setPieces, setTrack, turnOf, withRoll } from "../../../../../test/board.ts";

// T-VAL and T-OPS for PKK Operations: one fixture per rule line of research 06 s4 (11 P2-07).
const start = turnOf("pkk");
const res = (s: typeof start): unknown => s.tracks["resources.pkk"];
const rally = (box: string, perLocation: Record<string, unknown>, extra: Record<string, unknown> = {}): ReturnType<typeof op> =>
  op("pkk", box, { op: "pkk.rally", locations: Object.keys(perLocation), perLocation, ...extra });

describe("Rally (06 s4.1)", () => {
  it("places 1 Underground Guerrilla for 1 Resource", () => {
    const { state } = play(start, rally("limitedOp", { dersim: { option: "place" } }));
    expect(pieces(state, "dersim", "guerrilla")).toEqual({ underground: 1, active: 0 });
    expect(res(state)).toBe(4);
  });

  it("selects the Europe track: Europe +1; with the Ban marker it costs 2 and stops at 3", () => {
    expect(play(start, rally("limitedOp", { europe: {} })).state.tracks["europe"]).toBe(2);
    const banned = setMarkers(start, "europe", "ban", 1);
    expect(res(play(banned, rally("limitedOp", { europe: {} })).state)).toBe(3);
    expect(codes(setTrack(banned, "europe", 3), rally("limitedOp", { europe: {} }))).toEqual(["rallyEuropeCap"]);
  });

  it("replaces 2 Guerrillas with a Base, never in Western Cities", () => {
    const { state } = play(start, rally("limitedOp", { hakkari: { option: "base" } }));
    expect(pieces(state, "hakkari", "pkkBase")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 0 });
    const west = setPieces(start, "western-cities", "guerrilla", 2);
    expect(codes(west, rally("limitedOp", { "western-cities": { option: "base" } }))).toEqual(["rallyBaseStacking"]);
  });

  it("at a Base places up to Pop + Bases (external box Pop 1), or flips all Underground", () => {
    expect(pieces(play(start, rally("limitedOp", { botan: { option: "grow" } })).state, "botan", "guerrilla")).toEqual({ underground: 5, active: 0 });
    expect(pieces(play(start, rally("limitedOp", { "kdp-zone": { option: "grow" } })).state, "kdp-zone", "guerrilla")).toEqual({ underground: 5, active: 0 });
    const active = setPieces(setPieces(start, "botan", "guerrilla", 0), "botan", "guerrilla", 2, "active");
    expect(pieces(play(active, rally("limitedOp", { botan: { option: "flip" } })).state, "botan", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(codes(start, rally("limitedOp", { hakkari: { option: "grow" } }))).toEqual(["rallyNeedsBase"]);
  });

  it("rejects a Displacement space and a City at Support, except Western Cities (03 s2.1)", () => {
    expect(codes(setMarkers(start, "dersim", "displacement", 1, "new"), rally("limitedOp", { dersim: {} }))).toEqual(["rallyDisplaced"]);
    expect(codes(setLevel(start, "diyarbakir-city", 1), rally("limitedOp", { "diyarbakir-city": {} }))).toEqual(["rallyCity"]);
    expect(codes(start, rally("limitedOp", { "western-cities": {} }))).toEqual([]);
  });

  it("follows the host posture: closed at Restricted; a Base needs Host (07 s5.1)", () => {
    expect(codes(setTrack(start, "posture.kdp", "restricted"), rally("limitedOp", { "kdp-zone": {} }))).toEqual(["rallyHost"]);
    expect(codes(start, rally("limitedOp", { "puk-zone": {} }))).toEqual([]);
    const two = setPieces(start, "puk-zone", "guerrilla", 2);
    expect(codes(two, rally("limitedOp", { "puk-zone": { option: "base" } }))).toEqual(["rallyBaseHost"]);
    expect(codes(start, rally("limitedOp", { iran: {} }))).toEqual(["rallyWhere"]);
  });

  it("adds Agitate in one space with a PKK Base or PKK Control: 1 per shift (07 s1.3)", () => {
    const { state } = play(start, rally("limitedOp", { botan: { option: "place" } }, { subActions: [{ action: "agitate", space: "botan", params: { shifts: 1 } }] }));
    expect(state.spaces["botan"]?.level).toBe(-2);
    expect(res(state)).toBe(3);
    expect(codes(start, rally("limitedOp", { dersim: {} }, { subActions: [{ action: "agitate", space: "dersim", params: { shifts: 1 } }] }))).toEqual(["agitateWhere"]);
    const harmed = setMarkers(start, "botan", "pkkHarm", 1);
    expect(codes(harmed, rally("limitedOp", { botan: {} }, { subActions: [{ action: "agitate", space: "botan", params: { shifts: 1 } }] }))).toEqual(["agitateBlocked"]);
  });
});

describe("March (06 s4.2)", () => {
  const march = (dest: string, moves: unknown[], box = "limitedOp"): ReturnType<typeof op> => op("pkk", box, { op: "pkk.march", locations: [dest], perLocation: { [dest]: { moves } } });

  it("moves a group one step for 1 Resource per destination; stays Underground when not exposed", () => {
    const { state } = play(start, march("van-bitlis", [{ from: "hakkari", count: 2 }]));
    expect(pieces(state, "van-bitlis", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(res(state)).toBe(4);
    expect(codes(start, march("agri", [{ from: "hakkari", count: 1 }]))).toEqual(["marchAdjacent"]);
    expect(codes(start, march("western-cities", [{ from: "hakkari", count: 1 }]))).toEqual(["marchWhere"]);
  });

  it("activates a group entering a Support space when group + State pieces > 3", () => {
    const board = setPieces(start, "sanliurfa", "police", 2);
    expect(pieces(play(board, march("sanliurfa", [{ from: "mardin-batman", count: 1 }])).state, "sanliurfa", "guerrilla")).toEqual({ underground: 1, active: 0 });
    const more = setPieces(start, "sanliurfa", "police", 3);
    expect(pieces(play(more, march("sanliurfa", [{ from: "mardin-batman", count: 1 }])).state, "sanliurfa", "guerrilla")).toEqual({ underground: 0, active: 1 });
  });

  it("activates a group crossing into or out of a box when group + State pieces > 3", () => {
    const board = setPieces(start, "kdp-zone", "guerrilla", 4);
    const { state } = play(board, march("hakkari", [{ from: "kdp-zone", count: 2 }]));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 2 });
  });

  it("at Restricted costs 1 more and the group Activates; Hostile is closed (07 s5.1)", () => {
    const restricted = setTrack(start, "posture.kdp", "restricted");
    const { state } = play(restricted, march("kdp-zone", [{ from: "hakkari", count: 1 }]));
    expect(pieces(state, "kdp-zone", "guerrilla")).toEqual({ underground: 3, active: 1 });
    expect(res(state)).toBe(3);
    expect(codes(setTrack(start, "posture.kdp", "hostile"), march("kdp-zone", [{ from: "hakkari", count: 1 }]))).toEqual(["marchHost"]);
  });

  it("enters Syria-Bekaa at Restricted under PA-16 option allow", () => {
    const syria = setTrack(start, "posture.syria", "restricted");
    const { entries } = play(syria, march("syria-bekaa", [{ from: "mardin-batman", count: 1 }]));
    expect(entries.some((e) => e.assumptionRef === "PA-16")).toBe(true);
  });

  it("named and unnamed faces share one supply per origin", () => {
    const moves = (face?: string): unknown[] => [{ from: "hakkari", count: 2, ...(face === undefined ? {} : { face }) }];
    const plan = op("pkk", "opOnly", { op: "pkk.march", locations: ["van-bitlis", "botan"], perLocation: { "van-bitlis": { moves: moves("underground") }, botan: { moves: moves() } } });
    expect(pieces(start, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(codes(start, plan)).toContain("marchGuerrillas");
  });

  it("Limited Op: one destination", () => {
    const plan = op("pkk", "limitedOp", { op: "pkk.march", locations: ["van-bitlis", "botan"], perLocation: { "van-bitlis": { moves: [{ from: "hakkari", count: 1 }] }, botan: { moves: [{ from: "hakkari", count: 1 }] } } });
    expect(codes(start, plan)).toContain("limitedOneLocation");
  });
});

describe("Attack (06 s4.3)", () => {
  const attack = (loc: string, perLocation: Record<string, unknown> = {}): ReturnType<typeof op> => op("pkk", "limitedOp", { op: "pkk.attack", locations: [loc], perLocation: { [loc]: perLocation } });

  it("activates all Guerrillas; a roll at or below their number removes 2 State pieces, Troops first, with attrition", () => {
    const { state } = play(withRoll(start, 2), attack("hakkari"));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "police")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 0 });
    expect(res(state)).toBe(4);
  });

  it("removes Police first on request, then Troops; no attrition for Police", () => {
    const { state } = play(withRoll(start, 2), attack("hakkari", { prefer: "police" }));
    expect(pieces(state, "hakkari", "police")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 1 });
  });

  it("misses on a roll above the Guerrillas; still Activates them", () => {
    const { state } = play(withRoll(start, 3), attack("hakkari"));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 2 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 2 });
  });

  it("on a roll of 1 also places 1 Underground Guerrilla", () => {
    const { state } = play(withRoll(start, 1), attack("hakkari", { prefer: "police" }));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 1, active: 1 });
  });

  it("takes Guards after Troops and Police, then Bases", () => {
    const board = setPieces(setPieces(setPieces(start, "hakkari", "troops", 0), "hakkari", "police", 0), "hakkari", "guards", 1);
    const based = setPieces(board, "hakkari", "stateBase", 1);
    const { state } = play(withRoll(based, 1), attack("hakkari"));
    expect(pieces(state, "hakkari", "guards")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "stateBase")).toEqual({ default: 0 });
  });

  it("needs Guerrillas and State pieces", () => {
    expect(codes(start, attack("dersim"))).toEqual(["attackWhere"]);
  });
});

describe("Coerce (06 s4.4, PA-05)", () => {
  const coerce = (loc: string): ReturnType<typeof op> => op("pkk", "limitedOp", { op: "pkk.coerce", locations: [loc] });

  it("in a Neutral space Activates one Guerrilla and places a Coercion marker, no shift", () => {
    const { state } = play(start, coerce("mardin-batman"));
    expect(pieces(state, "mardin-batman", "guerrilla")).toEqual({ underground: 0, active: 1 });
    expect(state.spaces["mardin-batman"]?.markers["coercion"]).toEqual({ default: 1 });
    expect(state.spaces["mardin-batman"]?.level).toBe(0);
    expect(res(state)).toBe(3);
  });

  it("at Support shifts one level toward Neutral before the marker", () => {
    const board = setPieces(start, "adiyaman", "guerrilla", 1);
    const { state } = play(board, coerce("adiyaman"));
    expect(state.spaces["adiyaman"]?.level).toBe(0);
    expect(res(state)).toBe(4);
  });

  it("an existing Coercion marker blocks the shift; activation still happens (PA-05)", () => {
    const board = setMarkers(setPieces(start, "adiyaman", "guerrilla", 1), "adiyaman", "coercion", 1);
    const { state, entries } = play(board, coerce("adiyaman"));
    expect(state.spaces["adiyaman"]?.level).toBe(1);
    expect(pieces(state, "adiyaman", "guerrilla")).toEqual({ underground: 0, active: 1 });
    expect(entries.some((e) => e.assumptionRef === "PA-05")).toBe(true);
  });

  it("rejects Opposition, no Underground Guerrilla and Displacement", () => {
    expect(codes(start, coerce("hakkari"))).toEqual(["coerceLevel"]);
    expect(codes(start, coerce("dersim"))).toEqual(["coerceGuerrilla"]);
    expect(codes(setMarkers(start, "mardin-batman", "displacement", 1, "old"), coerce("mardin-batman"))).toEqual(["coerceDisplaced"]);
  });
});
