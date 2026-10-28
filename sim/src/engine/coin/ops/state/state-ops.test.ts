import { describe, expect, it } from "vitest";
import { legalOps } from "../../stop-rules.ts";
import { codes, engine, op, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf } from "../../../../../test/board.ts";

// T-VAL and T-OPS for State Operations (11 P2-06; research 06 s2, s7; 07 s1.3).
const start = turnOf("state");
const res = (s: typeof start): unknown => s.tracks["resources.state"];

describe("06 s7 worked example: Sweep in Botan", () => {
  // Botan (Mountain): 4 Troops, 1 Police, 2 Guards, 2 Underground Guerrillas. State has 10 Resources.
  let board = setPieces(setPieces(setPieces(start, "botan", "troops", 2), "botan", "guards", 2), "botan", "pkkBase", 0);
  board = setTrack(board, "resources.state", 10);
  const command = op("state", "opOnly", { op: "state.sweep", locations: ["botan"], perLocation: { botan: { moves: [{ from: "hakkari", count: 2 }] } } });

  it("activates (4 + 1 + 2) / 2 = 3, so both Guerrillas flip Active, for 2 Resources", () => {
    const { state, entries } = play(board, command);
    expect(pieces(state, "botan", "troops")).toEqual({ default: 4 });
    expect(pieces(state, "botan", "guerrilla")).toEqual({ underground: 0, active: 2 });
    expect(res(state)).toBe(8);
    expect(entries.some((e) => e.assumptionRef === "PA-07")).toBe(true);
  });

  it("makes the PKK First Eligible on the next card (05 s2.4)", () => {
    const { state } = play(play(board, command).state, { type: "Pass", faction: "pkk" });
    expect(state.initiative.firstEligible).toBe("pkk");
  });
});

describe("Train (06 s2.1)", () => {
  it("is offered as legal with Police only when no Troops are Available", () => {
    const noTroops = { ...start, pools: { ...start.pools, troops: { available: 0, outOfPlay: start.pools["troops"]?.outOfPlay ?? 0 } } };
    const trains = legalOps(ruleset, noTroops, "state", Number.MAX_SAFE_INTEGER).map((c) => c["plan"] as { op: string; perLocation: Record<string, Record<string, unknown>> });
    expect(trains.some((p) => p.op === "state.train" && Object.values(p.perLocation).some((v) => v["police"] === 1))).toBe(true);
  });

  it("places up to 3 Troops and Police in a City and pays 2", () => {
    const { state } = play(start, op("state", "limitedOp", { op: "state.train", locations: ["diyarbakir-city"], perLocation: { "diyarbakir-city": { option: "place", troops: 2, police: 1 } } }));
    expect(pieces(state, "diyarbakir-city", "troops")).toEqual({ default: 5 });
    expect(pieces(state, "diyarbakir-city", "police")).toEqual({ default: 3 });
    expect(res(state)).toBe(10);
  });

  it("rejects placement outside a City or Base space, and more than 3", () => {
    expect(codes(start, op("state", "limitedOp", { op: "state.train", locations: ["dersim"], perLocation: { dersim: { option: "place", troops: 1, police: 0 } } }))).toEqual(["trainPlaceWhere"]);
    expect(codes(start, op("state", "limitedOp", { op: "state.train", locations: ["elazig"], perLocation: { elazig: { option: "place", troops: 2, police: 2 } } }))).toEqual(["trainPlaceCount"]);
  });

  it("needs Law 3175 for Guards, then places up to 2 in a controlled Mountain or Plain space with Police", () => {
    const plan = op("state", "limitedOp", { op: "state.train", locations: ["dersim"], perLocation: { dersim: { option: "guards", count: 2 } } });
    expect(codes(start, plan)).toEqual(["trainGuardsLaw", "trainSupply"]);
    const law = { ...start, flags: { ...start.flags, law3175: true }, pools: { ...start.pools, guards: { available: 16, outOfPlay: 0 } } };
    expect(pieces(play(law, plan).state, "dersim", "guards")).toEqual({ default: 2 });
    const full = setPieces(law, "dersim", "guards", 2);
    expect(codes(full, plan)).toEqual(["trainGuardsStacking"]);
  });

  it("replaces 2 Police with a State Base in a controlled Mountain or Plain space", () => {
    const board = setPieces(start, "dersim", "police", 2);
    const { state } = play(board, op("state", "limitedOp", { op: "state.train", locations: ["dersim"], perLocation: { dersim: { option: "base" } } }));
    expect(pieces(state, "dersim", "police")).toEqual({ default: 0 });
    expect(pieces(state, "dersim", "stateBase")).toEqual({ default: 1 });
    expect(codes(start, op("state", "limitedOp", { op: "state.train", locations: ["dersim"], perLocation: { dersim: { option: "base" } } }))).toEqual(["trainBasePolice"]);
  });

  it("adds Civic Action in one Train space, even as a Limited Op: Redress 3 then shift 2 (07 s1.3)", () => {
    const board = setMarkers(start, "elazig", "stateHarm", 1);
    const plan = op("state", "limitedOp", {
      op: "state.train",
      locations: ["elazig"],
      perLocation: { elazig: { option: "place", troops: 1, police: 0 } },
      subActions: [{ action: "civicAction", space: "elazig", params: { stateHarm: 1, shifts: 1 } }],
    });
    const { state } = play(board, plan);
    expect(state.spaces["elazig"]?.level).toBe(2);
    expect(state.spaces["elazig"]?.markers["stateHarm"]).toEqual({ default: 0 });
    expect(res(state)).toBe(12 - 2 - 3 - 2);
  });

  it("needs relief for every Reception marker before a shift; Return only in C5 or at Normalizing (07 s3.2, s3.3)", () => {
    const civic = (params: Record<string, number>): ReturnType<typeof op> =>
      op("state", "limitedOp", { op: "state.train", locations: ["elazig"], perLocation: { elazig: { option: "place", troops: 1, police: 0 } }, subActions: [{ action: "civicAction", space: "elazig", params }] });
    const received = setMarkers(start, "elazig", "reception", 1);
    expect(codes(received, civic({ shifts: 1 }))).toEqual(["civicBlocked"]);
    expect(codes(received, civic({ reception: 1, shifts: 1 }))).toEqual([]);
    const displaced = setTrack(setMarkers(start, "elazig", "displacement", 1, "old"), "emergencyRule", "martialLaw");
    expect(codes(displaced, civic({ displacement: 1 }))).toEqual(["civicNoReturn"]);
    expect(codes(setTrack(displaced, "emergencyRule", "normalizing"), civic({ displacement: 1 }))).toEqual([]);
    expect(codes({ ...displaced, turn: { ...displaced.turn, campaign: "C5" } }, civic({ displacement: 1 }))).toEqual([]);
  });

  it("rejects a Civic Action shift that a marker blocks, or that needs State Control", () => {
    const blocked = setMarkers(start, "elazig", "coercion", 1);
    const civic = (space: string): ReturnType<typeof op> =>
      op("state", "limitedOp", { op: "state.train", locations: [space], perLocation: { [space]: { option: "place", troops: 1, police: 0 } }, subActions: [{ action: "civicAction", space, params: { shifts: 1 } }] });
    expect(codes(blocked, civic("elazig"))).toEqual(["civicBlocked"]);
    const lost = setPieces(setPieces(start, "elazig", "guerrilla", 5), "elazig", "pkkBase", 0);
    expect(codes(lost, civic("elazig"))).toContain("civicNeedsControl");
  });
});

describe("Garrison (06 s2.2)", () => {
  it("moves Police, then activates one per Police and Guard in the target (Mountain: per 2), 2 Resources total", () => {
    const board = setPieces(start, "hakkari", "guerrilla", 3);
    const { state } = play(board, op("state", "opOnly", { op: "state.garrison", locations: ["hakkari"], perLocation: { hakkari: { moves: [{ from: "van-bitlis", to: "hakkari", count: 1 }, { from: "agri", to: "dersim", count: 1 }] } } }));
    expect(pieces(state, "hakkari", "police")).toEqual({ default: 2 });
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 1 });
    expect(res(state)).toBe(10);
  });

  it("Limited Op: every move must end in the activation space; no moves into or out of Western Cities; at most 6", () => {
    const plan = (moves: unknown[], box = "limitedOp"): ReturnType<typeof op> => op("state", box, { op: "state.garrison", locations: ["hakkari"], perLocation: { hakkari: { moves } } });
    expect(codes(start, plan([{ from: "agri", to: "dersim", count: 1 }]))).toEqual(["limitedOneDestination"]);
    expect(codes(start, plan([{ from: "western-cities", count: 1 }], "opOnly"))).toEqual(["garrisonWhere"]);
    expect(codes(start, plan([{ from: "agri", count: 2 }], "opOnly"))).toEqual(["garrisonPolice"]);
  });
});

describe("Sweep (06 s2.3)", () => {
  it("rejects Western Cities, external boxes and non-adjacent origins", () => {
    expect(codes(start, op("state", "opOnly", { op: "state.sweep", locations: ["western-cities"] }))).toEqual(["sweepWhere"]);
    expect(codes(start, op("state", "opOnly", { op: "state.sweep", locations: ["kdp-zone"] }))).toEqual(["sweepWhere"]);
    expect(codes(start, op("state", "opOnly", { op: "state.sweep", locations: ["botan"], perLocation: { botan: { moves: [{ from: "agri", count: 1 }] } } }))).toEqual(["sweepAdjacent"]);
  });

  it("costs 1 per space at OHAL Extended Powers", () => {
    const board = setTrack(start, "emergencyRule", "ohalExtendedPowers");
    expect(res(play(board, op("state", "opOnly", { op: "state.sweep", locations: ["botan", "hakkari"] })).state)).toBe(10);
  });
});

describe("Assault (06 s2.4)", () => {
  it("removes Active Guerrillas first, then Bases only when no Guerrilla remains; extra removals are lost (PA-08)", () => {
    let board = setPieces(start, "mardin-batman", "troops", 3);
    board = setPieces(setPieces(board, "mardin-batman", "guerrilla", 0), "mardin-batman", "guerrilla", 1, "active");
    board = setPieces(board, "mardin-batman", "pkkBase", 1);
    const { state, entries } = play(board, op("state", "opOnly", { op: "state.assault", locations: ["mardin-batman"] }));
    expect(pieces(state, "mardin-batman", "guerrilla")).toEqual({ underground: 0, active: 0 });
    expect(pieces(state, "mardin-batman", "pkkBase")).toEqual({ default: 0 });
    expect(entries.some((e) => e.assumptionRef === "PA-08")).toBe(true);
  });

  it("never removes Underground Guerrillas and halves in Mountains", () => {
    let board = setPieces(start, "botan", "troops", 3);
    board = setPieces(setPieces(board, "botan", "guerrilla", 1), "botan", "guerrilla", 2, "active");
    const { state } = play(board, op("state", "opOnly", { op: "state.assault", locations: ["botan"] }));
    expect(pieces(state, "botan", "guerrilla")).toEqual({ underground: 1, active: 1 });
    expect(pieces(state, "botan", "pkkBase")).toEqual({ default: 1 });
    expect(codes(start, op("state", "opOnly", { op: "state.assault", locations: ["botan"] }))).toEqual(["assaultTargets"]);
  });

  it("counts Police as Troops in a City", () => {
    let board = setPieces(start, "diyarbakir-city", "troops", 0);
    board = setPieces(board, "diyarbakir-city", "guerrilla", 2, "active");
    expect(pieces(play(board, op("state", "opOnly", { op: "state.assault", locations: ["diyarbakir-city"] })).state, "diyarbakir-city", "guerrilla")).toEqual({ underground: 0, active: 0 });
  });
});

describe("ChooseOperation sequence and cost layers (05 s4.1)", () => {
  it("rejects a second location in a Limited Op, an SA outside Op + SA, and a plan it cannot pay", () => {
    expect(codes(start, op("state", "limitedOp", { op: "state.assault", locations: ["botan", "hakkari"] }))).toContain("limitedOneLocation");
    const poor = setTrack(start, "resources.state", 1);
    expect(codes(poor, op("state", "opOnly", { op: "state.sweep", locations: ["botan"] }))).toEqual(["cannotPay"]);
    expect(codes(start, op("pkk", "opOnly", { op: "state.sweep", locations: ["botan"] }))).toEqual(["notEligible"]);
    expect(codes(start, op("state", "pass", { op: "state.sweep", locations: ["botan"] }))).toEqual(["notAnOpBox"]);
    expect(codes(start, op("state", "opOnly", { op: "pkk.rally", locations: ["botan"] }))).toEqual(["unknownOp"]);
  });

  it("previews the effects of a legal plan without changing state (05 s4)", () => {
    const plan = op("state", "opOnly", { op: "state.sweep", locations: ["botan"] });
    const result = engine.validate(ruleset, start, plan);
    expect(result.ok).toBe(true);
    expect(result.preview.effects.map((e) => e.type)).toEqual(["adjustTrack", "setPieceState"]);
    expect(res(start)).toBe(12);
  });
});
