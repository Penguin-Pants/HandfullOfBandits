import { describe, expect, it } from "vitest";
import { codes, op, pieces, play, setPieces, setTrack, turnOf, withCard, withRoll } from "../../../../test/board.ts";

// Regressions for PR review findings on the operation framework (penguin-pants/handfulofbandits#20).
const stateTurn = turnOf("state");
const pkkTurn = turnOf("pkk");

describe("operation review fixes", () => {
  it("checks Civic Action on the board after Train places Police", () => {
    const noPolice = setPieces(stateTurn, "elazig", "police", 0);
    const plan = op("state", "limitedOp", {
      op: "state.train",
      locations: ["elazig"],
      perLocation: { elazig: { option: "place", troops: 0, police: 1 } },
      subActions: [{ action: "civicAction", space: "elazig", params: { shifts: 1 } }],
    });
    expect(codes(noPolice, plan)).toEqual([]);
    expect(play(noPolice, plan).state.spaces["elazig"]?.level).toBe(2);
  });

  it("rejects a repeated Special Activity location", () => {
    const board = setPieces(pkkTurn, "bingol-tunceli", "guerrilla", 1);
    const sa = { action: "pkk.extort", locations: ["bingol-tunceli", "bingol-tunceli"], perLocation: {}, timing: "after" };
    expect(codes(board, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri-igdir"], sa }))).toContain("duplicateLocation");
  });

  it("lets Rally grow place a chosen count up to Pop + Bases", () => {
    const plan = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "grow", count: 1 } } });
    expect(pieces(play(pkkTurn, plan).state, "sirnak", "guerrilla")).toEqual({ underground: 3, active: 0 });
    expect(codes(pkkTurn, op("pkk", "limitedOp", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "grow", count: 4 } } }))).toEqual(["rallyGrowCount"]);
  });

  it("pays an Op from income an earlier SA gave", () => {
    const board = setTrack(setPieces(pkkTurn, "bingol-tunceli", "guerrilla", 3), "resources.pkk", 0);
    const sa = { action: "pkk.extort", locations: ["bingol-tunceli"], perLocation: {}, timing: "before" };
    expect(codes(board, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri-igdir"], sa }))).toEqual([]);
  });

  it("skips an SA after an Op when the rolled Op made it illegal", () => {
    // Validation stops at the first roll (Hakkari); the Attack in Şırnak then activates every
    // Guerrilla there, so Extort in Şırnak has no Underground Guerrilla when it runs.
    const board = setPieces(withRoll(pkkTurn, 6), "sirnak", "troops", 0);
    const sa = { action: "pkk.extort", locations: ["sirnak"], perLocation: {}, timing: "after" };
    const plan = op("pkk", "opSa", { op: "pkk.attack", locations: ["hakkari", "sirnak"], sa });
    expect(codes(board, plan)).toEqual([]);
    const result = play(board, plan);
    expect(result.state.tracks["resources.pkk"]).toBe(3);
    expect(result.entries.some((e) => e.data["effect"] === "specialActivity")).toBe(true);
  });

  it("returns violations, not an exception, for Train in an unknown space", () => {
    expect(codes(stateTurn, op("state", "limitedOp", { op: "state.train", locations: ["sea"], perLocation: { sea: { option: "place", troops: 1, police: 0 } } }))).toEqual(["trainDomestic"]);
  });

  it("checks Agitate on the board after Rally places its Guerrilla", () => {
    // Bingöl-Tunceli: 1 Troop, 1 Police, 2 Guerrillas (tied). Rally adds a third: PKK Control, so Agitate is legal.
    const board = setPieces(pkkTurn, "bingol-tunceli", "guerrilla", 2);
    const plan = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["bingol-tunceli"], perLocation: { "bingol-tunceli": { option: "place" } }, subActions: [{ action: "agitate", space: "bingol-tunceli", params: { shifts: 1 } }] });
    expect(codes(board, plan)).toEqual([]);
    expect(play(board, plan).state.spaces["bingol-tunceli"]?.level).toBe(-1);
  });

  it("rejects repeated locations in an event's free action", () => {
    const board = withCard(pkkTurn, "DK-002");
    const answer = { locations: ["sirnak", "sirnak"], perLocation: {}, sa: { locations: ["sirnak"], perLocation: {} } };
    expect(codes(board, { type: "ChooseEvent", faction: "pkk", side: "shaded", answers: [answer] })).toEqual(["badAnswer"]);
  });

  it("moves each March group one step: arrivals in a later origin stay put", () => {
    let board = setPieces(setPieces(pkkTurn, "sirnak", "guerrilla", 2), "hakkari", "guerrilla", 0);
    board = setPieces(board, "hakkari", "guerrilla", 2, "active");
    const plan = op("pkk", "opOnly", { op: "pkk.march", locations: ["hakkari", "van-rural"], perLocation: { hakkari: { moves: [{ from: "sirnak", count: 2 }] }, "van-rural": { moves: [{ from: "hakkari", count: 2 }] } } });
    const { state } = play(board, plan);
    expect(pieces(state, "hakkari", "guerrilla")).toEqual({ underground: 2, active: 0 });
    expect(pieces(state, "van-rural", "guerrilla")).toEqual({ underground: 0, active: 2 });
  });
});
