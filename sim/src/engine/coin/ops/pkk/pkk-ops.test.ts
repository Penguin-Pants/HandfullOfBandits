import { describe, expect, it } from "vitest";
import { rollDie } from "../../../core/rng.ts";
import { codes, engine, op, pieces, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf, withCard, withRoll } from "../../../../../test/board.ts";

// T-VAL and T-OPS for PKK Operations: one fixture per rule line of research 06 s4 (11 P2-07).
// Pinned so these operation tests do not follow setup changes: no Guerrillas in Şanlıurfa or Van hinterland, 3 in the KDP Zone.
const start = setPieces(setPieces(setPieces(turnOf("pkk"), "sanliurfa", "guerrilla", 0), "van-rural", "guerrilla", 0), "kdp-zone", "guerrilla", 3);
const res = (s: typeof start): unknown => s.tracks["resources.pkk"];
const rally = (box: string, perLocation: Record<string, unknown>, extra: Record<string, unknown> = {}): ReturnType<typeof op> =>
  op("pkk", box, { op: "pkk.rally", locations: Object.keys(perLocation), perLocation, ...extra });

describe("Rally (06 s4.1)", () => {
  it("places 1 Underground Guerrilla for 1 Resource", () => {
    const { state } = play(start, rally("limitedOp", { "bingol-tunceli": { option: "place" } }));
    expect(pieces(state, "bingol-tunceli", "guerrilla")).toEqual({ underground: 1, active: 0 });
    expect(res(state)).toBe(4);
  });

  it("selects the Europe track: Europe +1; with the Europe Ban marker it costs 2 and stops at 3", () => {
    expect(play(start, rally("limitedOp", { europe: {} })).state.tracks["europe"]).toBe(2);
    const banned = setMarkers(start, "europe", "europeBan", 1);
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

  it("at a Base places up to Pop + Bases (external box Pop 1) and can flip Guerrillas", () => {
    expect(pieces(play(start, rally("limitedOp", { sirnak: { option: "grow" } })).state, "sirnak", "guerrilla")).toEqual({ underground: 4, active: 0 });
    expect(pieces(play(start, rally("limitedOp", { "kdp-zone": { option: "grow" } })).state, "kdp-zone", "guerrilla")).toEqual({ underground: 5, active: 0 });
    const active = setPieces(setPieces(start, "sirnak", "guerrilla", 0), "sirnak", "guerrilla", 2, "active");
    expect(pieces(play(active, rally("limitedOp", { sirnak: { option: "flip" } })).state, "sirnak", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(codes(start, rally("limitedOp", { hakkari: { option: "grow" } }))).toEqual(["rallyNeedsBase"]);
  });

  it("flips Active Guerrillas Underground in multiple spaces without Bases", () => {
    const empty = setPieces(setPieces(start, "hakkari", "guerrilla", 0), "mardin", "guerrilla", 0);
    const board = setPieces(setPieces(empty, "hakkari", "guerrilla", 2, "active"), "mardin", "guerrilla", 1, "active");
    const command = rally("opOnly", { hakkari: { option: "flip" }, "mardin": { option: "flip" } });
    expect(codes(board, command)).toEqual([]);
    const { state } = play(board, command);
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(pieces(state, "mardin", "guerrilla")).toEqual({ underground: 1, active: 0 });
    expect(res(state)).toBe(3);
  });

  it("requires a Guerrilla to choose the flip option, and an Active one to change anything (decision 18)", () => {
    const empty = setPieces(setPieces(start, "bingol-tunceli", "guerrilla", 0), "bingol-tunceli", "guerrilla", 0, "active");
    const command = rally("limitedOp", { "bingol-tunceli": { option: "flip" } });
    expect(codes(empty, command)).toEqual(["rallyFlipGuerrilla"]);
    expect(codes(setPieces(empty, "bingol-tunceli", "guerrilla", 1), command)).toEqual(["locationNoEffect"]);
    expect(codes(setPieces(empty, "bingol-tunceli", "guerrilla", 1, "active"), command)).toEqual([]);
  });

  it("rejects a Displacement space and a City at Support, except Western Cities (03 s2.1)", () => {
    expect(codes(setMarkers(start, "bingol-tunceli", "displacement", 1, "new"), rally("limitedOp", { "bingol-tunceli": {} }))).toEqual(["rallyDisplaced"]);
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
    const { state } = play(start, rally("limitedOp", { sirnak: { option: "place" } }, { subActions: [{ action: "agitate", space: "sirnak", params: { shifts: 1 } }] }));
    expect(state.spaces["sirnak"]?.level).toBe(-2);
    expect(res(state)).toBe(3);
    expect(codes(start, rally("limitedOp", { "bingol-tunceli": {} }, { subActions: [{ action: "agitate", space: "bingol-tunceli", params: { shifts: 1 } }] }))).toEqual(["agitateWhere"]);
    const harmed = setMarkers(start, "sirnak", "pkkHarm", 1);
    expect(codes(harmed, rally("limitedOp", { sirnak: {} }, { subActions: [{ action: "agitate", space: "sirnak", params: { shifts: 1 } }] }))).toEqual(["agitateBlocked"]);
  });
});

describe("March (06 s4.2)", () => {
  const march = (dest: string, moves: unknown[], box = "limitedOp"): ReturnType<typeof op> => op("pkk", box, { op: "pkk.march", locations: [dest], perLocation: { [dest]: { moves } } });

  it("moves a group one step for 1 Resource per destination; stays Underground when not exposed", () => {
    const { state } = play(start, march("van-rural", [{ from: "hakkari", count: 2 }]));
    expect(pieces(state, "van-rural", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(res(state)).toBe(4);
    expect(codes(start, march("agri-igdir", [{ from: "hakkari", count: 1 }]))).toEqual(["marchAdjacent"]);
    expect(codes(start, march("western-cities", [{ from: "hakkari", count: 1 }]))).toEqual(["marchWhere"]);
  });

  it("activates a group entering a Support space when group + State pieces > 3", () => {
    const board = setPieces(start, "sanliurfa", "police", 2);
    expect(pieces(play(board, march("sanliurfa", [{ from: "mardin", count: 1 }])).state, "sanliurfa", "guerrilla")).toEqual({ underground: 1, active: 0 });
    const more = setPieces(start, "sanliurfa", "police", 3);
    expect(pieces(play(more, march("sanliurfa", [{ from: "mardin", count: 1 }])).state, "sanliurfa", "guerrilla")).toEqual({ underground: 0, active: 1 });
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
    const { entries } = play(syria, march("syria-bekaa", [{ from: "mardin", count: 1 }]));
    expect(entries.some((e) => e.assumptionRef === "PA-16")).toBe(true);
  });

  it("named and unnamed faces share one supply per origin", () => {
    const moves = (face?: string): unknown[] => [{ from: "hakkari", count: 2, ...(face === undefined ? {} : { face }) }];
    const plan = op("pkk", "opOnly", { op: "pkk.march", locations: ["van-rural", "sirnak"], perLocation: { "van-rural": { moves: moves("underground") }, sirnak: { moves: moves() } } });
    expect(pieces(start, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(codes(start, plan)).toContain("marchGuerrillas");
  });

  it("accepts a destination whose Guerrillas leave as others arrive (A to B, B to C; decision 18)", () => {
    const board = setPieces(setPieces(setPieces(start, "sirnak", "guerrilla", 2), "hakkari", "guerrilla", 2), "van-rural", "guerrilla", 2);
    const plan = op("pkk", "opOnly", { op: "pkk.march", locations: ["hakkari", "van-rural"], perLocation: { hakkari: { moves: [{ from: "sirnak", count: 2 }] }, "van-rural": { moves: [{ from: "hakkari", count: 2 }] } } });
    expect(codes(board, plan)).toEqual([]);
    const { state } = play(board, plan);
    expect(pieces(state, "sirnak", "guerrilla")).toEqual({ underground: 0, active: 0 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(pieces(state, "van-rural", "guerrilla")).toEqual({ underground: 4, active: 0 });
  });

  it("accepts the same March as a free Event action (events.ts free action; decision 18)", () => {
    const card = ruleset.cards["DK-001"];
    if (card?.shaded === undefined || card.shaded === null) throw new Error("DK-001");
    const r = { ...ruleset, cards: { ...ruleset.cards, "DK-001": { ...card, shaded: { ...card.shaded, effects: [{ type: "freeAction" as const, action: "pkk.march", constraints: {} }] } } } };
    const board = withCard(setPieces(setPieces(setPieces(start, "sirnak", "guerrilla", 2), "hakkari", "guerrilla", 2), "van-rural", "guerrilla", 2), "DK-001");
    const answer = { locations: ["hakkari", "van-rural"], perLocation: { hakkari: { moves: [{ from: "sirnak", count: 2 }] }, "van-rural": { moves: [{ from: "hakkari", count: 2 }] } } };
    const result = engine.apply(r, board, { type: "ChooseEvent", faction: "pkk", side: "shaded", answers: [answer] });
    expect(result.ok ? result.transition.state.pending?.prompt ?? null : result.validation.violations.map((v) => v.code)).toBeNull();
    if (!result.ok) throw new Error("free March");
    expect(pieces(result.transition.state, "van-rural", "guerrilla")).toEqual({ underground: 4, active: 0 });
  });

  it("Limited Op: one destination", () => {
    const plan = op("pkk", "limitedOp", { op: "pkk.march", locations: ["van-rural", "sirnak"], perLocation: { "van-rural": { moves: [{ from: "hakkari", count: 1 }] }, sirnak: { moves: [{ from: "hakkari", count: 1 }] } } });
    expect(codes(start, plan)).toContain("limitedOneLocation");
  });
});

describe("Attack (06 s4.3)", () => {
  const attack = (loc: string, perLocation: Record<string, unknown> = {}): ReturnType<typeof op> => op("pkk", "limitedOp", { op: "pkk.attack", locations: [loc], perLocation: { [loc]: perLocation } });

  it("removes up to the chosen count on a hit, from 0 to 2", () => {
    const { state } = play(withRoll(start, 2), attack("hakkari", { remove: 1 }));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 1 });
    expect(codes(start, attack("hakkari", { remove: 3 }))).toEqual(["badRemove"]);
  });

  it("activates all Guerrillas; a roll less than or equal to their number removes 2 State pieces, Troops first, with attrition", () => {
    const { state } = play(withRoll(start, 2), attack("hakkari"));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "police")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 0 });
    expect(res(state)).toBe(4);
  });

  it.each([
    [1, 0, 2, 1],
    [2, 0, 2, 0],
    [3, 0, 4, 0],
    [4, 0, 4, 0],
    [5, 2, 4, 0],
    [6, 2, 4, 0],
  ])("4 Guerrillas versus 2 Troops, roll %i: resolves success, return fire and bonus with one die", (roll, troops, active, underground) => {
    const board = withRoll(setPieces(start, "hakkari", "guerrilla", 4), roll);
    const result = play(board, attack("hakkari"));
    expect(pieces(result.state, "hakkari", "troops")).toEqual({default: troops});
    expect(pieces(result.state, "hakkari", "guerrilla")).toEqual({active, underground});
    expect(result.state.rng).toEqual(rollDie(board.rng).rng);
  });

  it("uses Troops before removals, not Troops removed or remaining, at the equality boundary", () => {
    const board = withRoll(setPieces(setPieces(start, "hakkari", "guerrilla", 6), "hakkari", "troops", 5), 5);
    const {state} = play(board, attack("hakkari"));
    expect(pieces(state, "hakkari", "troops")).toEqual({default: 3});
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({active: 4, underground: 0});
  });

  it("resolves both an Ambush Attack and an ordinary Attack with a roll in each space", () => {
    const board = withRoll(setPieces(setPieces(start, "hakkari", "guerrilla", 4), "sirnak", "guerrilla", 4), 4);
    const {state} = play(board, op("pkk", "opSa", {op: "pkk.attack", locations: ["hakkari", "sirnak"], sa: {action: "pkk.ambush", timing: "before", locations: ["hakkari"], perLocation: {}}}));
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({active: 4, underground: 0});
    expect(pieces(state, "hakkari", "troops")).toEqual({default: 0});
    expect(pieces(state, "sirnak", "guerrilla")).toEqual({active: 4, underground: 0});
    expect(pieces(state, "sirnak", "troops")).toEqual({default: 0});
    expect(state.rng).toEqual(rollDie(rollDie(board.rng).rng).rng);
  });

  it("has no attrition when only Police are removed, even if the die is less than or equal to the Troop count", () => {
    const board = withRoll(setPieces(start, "hakkari", "police", 2), 2);
    const {state} = play(board, attack("hakkari", {prefer: "police"}));
    expect(pieces(state, "hakkari", "troops")).toEqual({default: 2});
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({active: 2, underground: 0});
  });

  it("has no attrition when the PKK chooses zero removals on a successful Attack", () => {
    const {state} = play(withRoll(start, 2), attack("hakkari", {remove: 0}));
    expect(pieces(state, "hakkari", "troops")).toEqual({default: 2});
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({active: 2, underground: 0});
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
    expect(codes(start, attack("bingol-tunceli"))).toEqual(["attackWhere"]);
  });
});

describe("Coerce (06 s4.4, PA-05)", () => {
  const coerce = (loc: string): ReturnType<typeof op> => op("pkk", "limitedOp", { op: "pkk.coerce", locations: [loc] });

  it("in a Neutral space Activates one Guerrilla and places a Coercion marker, no shift", () => {
    const { state } = play(start, coerce("mardin"));
    expect(pieces(state, "mardin", "guerrilla")).toEqual({ underground: 0, active: 1 });
    expect(state.spaces["mardin"]?.markers["coercion"]).toEqual({ default: 1 });
    expect(state.spaces["mardin"]?.level).toBe(0);
    expect(res(state)).toBe(4);
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
    expect(codes(start, coerce("bingol-tunceli"))).toEqual(["coerceGuerrilla"]);
    expect(codes(setMarkers(start, "mardin", "displacement", 1, "old"), coerce("mardin"))).toEqual(["coerceDisplaced"]);
  });
});
