import { describe, expect, it } from "vitest";
import { codes, op, pieces, play, setPieces, setTrack, turnOf, withRoll } from "../../../../test/board.ts";

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
    const board = setPieces(pkkTurn, "dersim", "guerrilla", 1);
    const sa = { action: "pkk.extort", locations: ["dersim", "dersim"], perLocation: {}, timing: "after" };
    expect(codes(board, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri"], sa }))).toContain("duplicateLocation");
  });

  it("lets Rally grow place a chosen count up to Pop + Bases", () => {
    const plan = op("pkk", "limitedOp", { op: "pkk.rally", locations: ["botan"], perLocation: { botan: { option: "grow", count: 1 } } });
    expect(pieces(play(pkkTurn, plan).state, "botan", "guerrilla")).toEqual({ underground: 3, active: 0 });
    expect(codes(pkkTurn, op("pkk", "limitedOp", { op: "pkk.rally", locations: ["botan"], perLocation: { botan: { option: "grow", count: 4 } } }))).toEqual(["rallyGrowCount"]);
  });

  it("pays an Op from income an earlier SA gave", () => {
    const board = setTrack(setPieces(pkkTurn, "dersim", "guerrilla", 3), "resources.pkk", 0);
    const sa = { action: "pkk.extort", locations: ["dersim"], perLocation: {}, timing: "before" };
    expect(codes(board, op("pkk", "opSa", { op: "pkk.rally", locations: ["agri"], sa }))).toEqual([]);
  });

  it("skips an SA after an Op when the rolled Op made it illegal", () => {
    // Validation stops at the first roll (Hakkari); the Attack in Botan then activates every
    // Guerrilla there, so Extort in Botan has no Underground Guerrilla when it runs.
    const board = setPieces(withRoll(pkkTurn, 6), "botan", "troops", 0);
    const sa = { action: "pkk.extort", locations: ["botan"], perLocation: {}, timing: "after" };
    const plan = op("pkk", "opSa", { op: "pkk.attack", locations: ["hakkari", "botan"], sa });
    expect(codes(board, plan)).toEqual([]);
    const result = play(board, plan);
    expect(result.state.tracks["resources.pkk"]).toBe(3);
    expect(result.entries.some((e) => e.data["effect"] === "specialActivity")).toBe(true);
  });
});
