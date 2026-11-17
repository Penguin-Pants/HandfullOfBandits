import { describe, expect, it } from "vitest";
import { codes, op, pieces, play, ruleset, setLevel, setMarkers, setPieces, turnOf, withRoll } from "../../../../../test/board.ts";
import { crossBorderOrigins } from "./cross-border.ts";

// T-VAL and T-OPS for Special Activities (11 P2-08; research 06 s3.1, s5.1 to s5.3; PA-06, PA-12, PA-14).
const stateTurn = turnOf("state");
// Pinned so these tests do not follow setup changes: 3 Guerrillas in the KDP Zone.
const pkkTurn = setPieces(turnOf("pkk"), "kdp-zone", "guerrilla", 3);

describe("SA pairing (06 s1 item 2)", () => {
  it("rejects an SA with a Limited Op or Op Only, and an SA its Op does not allow", () => {
    const sa = { action: "pkk.extort", locations: [], perLocation: {}, timing: "after" };
    expect(codes(pkkTurn, op("pkk", "limitedOp", { op: "pkk.rally", locations: ["bingol-tunceli"], sa }))).toEqual(["saNotAllowed"]);
    expect(codes(pkkTurn, op("pkk", "limitedOp", { op: "pkk.rally", locations: ["bingol-tunceli"], sa }))).toEqual(["saNotAllowed"]);
    const ambush = { action: "pkk.ambush", locations: ["hakkari"], perLocation: {}, timing: "before" };
    expect(codes(pkkTurn, op("pkk", "opSa", { op: "pkk.rally", locations: ["hakkari"], sa: ambush }))).toContain("saNotWithOp");
  });
});

describe("Air Mobility (06 s3.1, PA-14)", () => {
  const air = (locations: string[], perLocation: Record<string, unknown>): Record<string, unknown> => ({ action: "state.air-mobility", locations, perLocation, timing: "before" });

  it("moves up to 4 Troops among up to 3 domestic spaces, Western Cities included", () => {
    const plan = op("state", "opSa", { op: "state.sweep", locations: ["sirnak"], sa: air(["western-cities", "diyarbakir-city", "sirnak"], { sirnak: { moves: [{ from: "western-cities", count: 2 }, { from: "diyarbakir-city", count: 2 }] } }) });
    const { state } = play(stateTurn, plan);
    expect(pieces(state, "sirnak", "troops")).toEqual({ default: 6 });
    expect(pieces(state, "western-cities", "troops")).toEqual({ default: 0 });
  });

  it("rejects more than 4 Troops, more than 3 spaces and any external box", () => {
    expect(codes(stateTurn, op("state", "opSa", { op: "state.sweep", locations: ["sirnak"], sa: air(["diyarbakir-city", "sirnak"], { sirnak: { moves: [{ from: "diyarbakir-city", count: 3 }] }, "diyarbakir-city": {} }) }))).toEqual([]);
    const many = setPieces(stateTurn, "diyarbakir-city", "troops", 5);
    expect(codes(many, op("state", "opSa", { op: "state.sweep", locations: ["sirnak"], sa: air(["diyarbakir-city", "sirnak"], { sirnak: { moves: [{ from: "diyarbakir-city", count: 5 }] } }) }))).toEqual(["airMobilityTroops"]);
    expect(codes(stateTurn, op("state", "opSa", { op: "state.sweep", locations: ["sirnak"], sa: air(["a", "b", "c", "d"], {}) }))).toContain("airMobilitySpaces");
    expect(codes(stateTurn, op("state", "opSa", { op: "state.sweep", locations: ["sirnak"], sa: air(["kdp-zone", "hakkari"], { "kdp-zone": { moves: [{ from: "hakkari", count: 1 }] } }) }))).toEqual(["airMobilityExternal"]);
  });
});

describe("Ambush (06 s5.1, PA-06)", () => {
  const plan = (sa: string[]): ReturnType<typeof op> => op("pkk", "opSa", { op: "pkk.attack", locations: ["hakkari"], sa: { action: "pkk.ambush", locations: sa, perLocation: {}, timing: "before" } });

  it("removes one piece even on a miss, then resolves the normal Attack", () => {
    const board = setPieces(withRoll(pkkTurn, 6), "hakkari", "police", 2);
    const { state, entries } = play(board, plan(["hakkari"]));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "police")).toEqual({ default: 2 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 0, active: 2 });
    expect(entries.some((e) => e.kind === "DieRolled" && e.data["purpose"] === "attackResult")).toBe(true);
  });

  it("adds a guaranteed removal to a successful Attack with normal attrition", () => {
    const board = setPieces(withRoll(pkkTurn, 1), "hakkari", "police", 2);
    const { state } = play(board, plan(["hakkari"]));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "police")).toEqual({ default: 1 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 1, active: 1 });
  });

  it("still rolls when the Ambush removes the last State piece", () => {
    const board = setPieces(setPieces(withRoll(pkkTurn, 1), "hakkari", "troops", 1), "hakkari", "police", 0);
    const { state, entries } = play(board, plan(["hakkari"]));
    expect(pieces(state, "hakkari", "troops")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 1, active: 2 });
    expect(entries.some((e) => e.kind === "DieRolled" && e.data["purpose"] === "attackResult")).toBe(true);
  });

  it("selects only Attack spaces with an Underground Guerrilla", () => {
    expect(codes(pkkTurn, plan(["sirnak"]))).toContain("ambushNotAttack");
    const active = setPieces(setPieces(pkkTurn, "hakkari", "guerrilla", 0), "hakkari", "guerrilla", 2, "active");
    expect(codes(active, plan(["hakkari"]))).toContain("ambushGuerrilla");
  });
});

describe("Extort (06 s5.2, PA-12)", () => {
  const sa = (locations: string[]): Record<string, unknown> => ({ action: "pkk.extort", locations, perLocation: {}, timing: "after" });

  it("in each chosen location Activates one Guerrilla and gives +1 Resource", () => {
    const board = setPieces(pkkTurn, "bingol-tunceli", "guerrilla", 3);
    const { state } = play(board, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri-igdir"], sa: sa(["bingol-tunceli", "kdp-zone"]) }));
    expect(pieces(state, "bingol-tunceli", "guerrilla")).toEqual({ underground: 2, active: 1 });
    expect(pieces(state, "kdp-zone", "guerrilla")).toEqual({ underground: 2, active: 1 });
    expect(state.tracks["resources.pkk"]).toBe(5 - 1 + 2);
  });

  it("needs PKK Control, Pop 1+ and no Displacement in a domestic space; Host or Tolerant in a box", () => {
    expect(codes(pkkTurn, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri-igdir"], sa: sa(["hakkari"]) }))).toEqual(["extortControl"]);
    const syria = { ...pkkTurn, tracks: { ...pkkTurn.tracks, "posture.syria": "restricted" } };
    expect(codes(syria, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri-igdir"], sa: sa(["syria-bekaa"]) }))).toEqual(["extortHost"]);
    const displaced = setMarkers(setPieces(pkkTurn, "bingol-tunceli", "guerrilla", 3), "bingol-tunceli", "displacement", 1, "new");
    expect(codes(displaced, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri-igdir"], sa: sa(["bingol-tunceli"]) }))).toEqual(["extortDisplaced"]);
  });
});

describe("Strike Collaborators (06 s5.3)", () => {
  const law = { ...pkkTurn, flags: { ...pkkTurn.flags, law3175: true } };
  const board = setPieces(law, "hakkari", "guards", 2);
  const sa = (perLocation: Record<string, unknown>): Record<string, unknown> => ({ action: "pkk.strike-collaborators", locations: Object.keys(perLocation), perLocation, timing: "before" });

  it("pays 1, removes Guards, Activates one Guerrilla, places a PKK Harm marker, Europe -1", () => {
    const { state } = play(board, op("pkk", "opSa", { op: "pkk.rally", locations: ["bingol-tunceli"], sa: sa({ hakkari: { guards: 2 } }) }));
    expect(pieces(state, "hakkari", "guards")).toEqual({ default: 0 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 1, active: 1 });
    expect(state.spaces["hakkari"]?.markers["pkkHarm"]).toEqual({ default: 1 });
    expect(state.tracks["europe"]).toBe(0);
    expect(state.tracks["resources.pkk"]).toBe(5 - 1 - 1);
  });

  it("needs Law 3175, accompanies Rally, March or Coerce only, and never shifts a level", () => {
    const noLaw = setPieces(pkkTurn, "hakkari", "guards", 2);
    expect(codes(noLaw, op("pkk", "opSa", { op: "pkk.rally", locations: ["bingol-tunceli"], sa: sa({ hakkari: {} }) }))).toEqual(["strikeLaw"]);
    expect(codes(board, op("pkk", "opSa", { op: "pkk.attack", locations: ["hakkari"], sa: sa({ hakkari: {} }) }))).toContain("saNotWithOp");
    const level = setLevel(board, "hakkari", 0);
    expect(play(level, op("pkk", "opSa", { op: "pkk.rally", locations: ["bingol-tunceli"], sa: sa({ hakkari: {} }) })).state.spaces["hakkari"]?.level).toBe(0);
  });
});

describe("Cross-Border origins in stored packages from before DD-22", () => {
  it("uses the crossBorder.origins parameter, and Hakkari with Botan when it is absent", () => {
    expect(crossBorderOrigins(ruleset)).toEqual(["hakkari", "sirnak"]);
    const rest = Object.fromEntries(Object.entries(ruleset.parameters).filter(([id]) => id !== "crossBorder.origins"));
    expect(crossBorderOrigins({ ...ruleset, parameters: rest })).toEqual(["hakkari", "botan"]);
  });
});
