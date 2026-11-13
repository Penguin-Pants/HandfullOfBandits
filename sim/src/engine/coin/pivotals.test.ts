import { describe, expect, it } from "vitest";
import { codes, engine, inCampaign, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";

// T-SEQ and T-EVT for the remaining Pivotals (11 P3b-06b; approved text docs/prototype/31 s1 to s4,
// DEC-67). S0 board, card DK-001 revealed by Advance, State First Eligible, PKK Second Eligible.
const OPPOSED = ["botan", "hakkari", "mardin-batman", "diyarbakir-rural", "sanliurfa", "van-bitlis"];
const reveal = (campaign: string, hands: Record<string, string[]>, prepare: (s: GameState) => GameState = (s) => s): GameState => {
  const base = inCampaign(ruleset, turnOf("state"), campaign);
  const s = prepare({ ...base, hands: { state: [], pkk: [], ...hands }, deck: { ...base.deck, currentCard: null, piles: [["DK-001", "DK-014"]] }, turn: { ...base.turn, phase: "setup" } });
  return play(s, { type: "Advance" }).state;
};
/** Total Opposition 2 x (1 + 2 + 2 + 2 + 2 + 4) = 26. */
const opposed = (s: GameState): GameState => OPPOSED.reduce((b, id) => setLevel(b, id, -2), s);
const pivotal = (faction: string, card: string, answers: unknown[] = []): AnyCommand => ({ type: "PlayPivotal", faction, card, answers });
const offered = (s: GameState): unknown[] => (s.pending?.answers ?? []).filter((a) => a !== "decline").map((a) => (a as { card: string }).card);

describe("Pivotal window (05 s4; doc 31 s1)", () => {
  it("offers a held Pivotal only from its earliest Campaign and with its precondition", () => {
    expect(offered(reveal("C3", { pkk: ["DK-054"] }, opposed))).toEqual(["DK-054"]);
    expect(reveal("C2", { pkk: ["DK-054"] }, opposed).turn.phase).toBe("card");
    expect(reveal("C3", { pkk: ["DK-054"] }).turn.phase).toBe("card");
  });

  it("offers both eligible cards of one faction; it plays one, and only one per card", () => {
    const prepare = (s: GameState): GameState => setTrack(setTrack(opposed(s), "emergencyRule", "ohalExtendedPowers"), "posture.syria", "tolerant");
    const open = reveal("C5", { state: ["DK-076", "DK-098"] }, prepare);
    expect(open.pending?.faction).toBe("state");
    expect(offered(open)).toEqual(["DK-076", "DK-098"]);
    const after = play(open, pivotal("state", "DK-098")).state;
    expect(after.hands["state"]).toEqual(["DK-076"]);
    expect(after.deck.currentCard).toBe("DK-098");
    expect(after.turn.phase).toBe("card");
  });

  it("names the Campaign or the precondition when a held card is not playable", () => {
    const open = reveal("C3", { pkk: ["DK-054"], state: ["DK-076", "DK-098"] }, opposed);
    expect(open.pending?.faction).toBe("pkk");
    expect(codes(open, pivotal("pkk", "DK-015"))).toEqual(["pivotalPriority"]);
    const state = { ...open, pending: open.pending === null ? null : { ...open.pending, faction: "state" } };
    expect(codes(state, pivotal("state", "DK-076"))).toEqual(["pivotalCampaign"]);
    const c5 = inCampaign(ruleset, state, "C5");
    expect(engineMessage(c5, pivotal("state", "DK-098"))).toBe("Coercive Diplomacy on Syria needs: Syria posture is Tolerant or Restricted, and Legitimacy is 5 or more.");
  });
});

describe("Serhildan (DK-054)", () => {
  const open = (prepare: (s: GameState) => GameState = (s) => s): GameState => reveal("C3", { pkk: ["DK-054"] }, (s) => prepare(setLevel(opposed(s), "botan", -1)));

  it("shifts up to 3 spaces with PKK pieces and no Office toward Opposition; Europe +1", () => {
    const board = open();
    const { state } = play(board, pivotal("pkk", "DK-054", [["botan"]]));
    expect(state.spaces["botan"]?.level).toBe(-2);
    expect(state.tracks["europe"]).toBe(Number(board.tracks["europe"]) + 1);
    expect(state.deck.currentCard).toBe("DK-054");
  });

  it("needs Mardin-Batman or Botan at Opposition", () => {
    expect(open((s) => setLevel(setLevel(s, "mardin-batman", 0), "botan", 0)).turn.phase).toBe("card");
  });

  it("refuses a space with an Office", () => {
    const board = open((s) => setMarkers(s, "botan", "office", 1));
    expect(codes(board, pivotal("pkk", "DK-054", [["botan"]]))).toEqual(["badAnswer"]);
  });
});

describe("Coercive Diplomacy on Syria (DK-098)", () => {
  it("sets Syria to Hostile: Guerrillas Activate and the Leadership goes Abroad", () => {
    const board = reveal("C5", { state: ["DK-098"] }, (s) => setTrack(s, "posture.syria", "tolerant"));
    const { state } = play(board, pivotal("state", "DK-098"));
    expect(state.tracks["posture.syria"]).toBe("hostile");
    expect(state.spaces["syria-bekaa"]?.markers["leadership"]).toMatchObject({ present: 0, abroad: 1 });
    expect(state.spaces["syria-bekaa"]?.pieces["guerrilla"]).toMatchObject({ underground: 0 });
  });

  it("needs Legitimacy 5 or more", () => {
    expect(reveal("C5", { state: ["DK-098"] }, (s) => setTrack(setTrack(s, "posture.syria", "tolerant"), "legitimacy", 4)).turn.phase).toBe("card");
  });
});

describe("Area Domination (DK-076)", () => {
  const open = (): GameState => reveal("C4", { state: ["DK-076"] }, (s) => setTrack(opposed(s), "emergencyRule", "ohalExtendedPowers"));
  const sweep = (sa: unknown) => ({ locations: ["botan"], perLocation: { botan: { moves: [{ from: "hakkari", count: 2 }] } }, sa });
  const clearance = { locations: ["botan"], perLocation: { botan: { reception: "diyarbakir-city" } } };

  it("free Sweep, Village Clearance after it at normal cost, then free Assault in the Sweep spaces", () => {
    const board = open();
    const { state } = play(board, pivotal("state", "DK-076", [sweep(clearance), { locations: ["botan"], perLocation: {} }]));
    expect(state.spaces["botan"]?.markers["displacement"]?.["new"]).toBe(1);
    expect(state.tracks["legitimacy"]).toBeLessThan(Number(board.tracks["legitimacy"]));
    expect(state.tracks["resources.state"]).toBe(board.tracks["resources.state"]);
    // Village Clearance Activates both Guerrillas; 4 Troops in a Mountain space remove 2 (Base last).
    expect(state.spaces["botan"]?.pieces["guerrilla"]).toEqual({ underground: 0, active: 0 });
    expect(state.spaces["botan"]?.pieces["pkkBase"]).toEqual({ default: 1 });
  });

  it("Village Clearance at normal cost pays US Lending Conditions; refused when the State cannot pay (DEC-69 point 9)", () => {
    const lending = (s: GameState): GameState => ({ ...s, modifiers: [{ id: "lending-conditions", sourceCard: "DK-074", duration: "untilReset", params: { resources: 2 } }] });
    const board = lending(open());
    const { state } = play(board, pivotal("state", "DK-076", [sweep(clearance), { locations: ["botan"], perLocation: {} }]));
    expect(state.tracks["resources.state"]).toBe(Number(board.tracks["resources.state"]) - 2);
    expect(codes(setTrack(board, "resources.state", 1), pivotal("state", "DK-076", [sweep(clearance), { locations: ["botan"], perLocation: {} }]))).toEqual(["cannotPay"]);
  });

  it("Village Clearance may be left out", () => {
    const { state } = play(open(), pivotal("state", "DK-076", [sweep({ locations: [], perLocation: {} }), null]));
    expect(state.spaces["botan"]?.markers["displacement"]?.["new"] ?? 0).toBe(0);
    expect(state.spaces["botan"]?.pieces["troops"]).toEqual({ default: 4 });
  });

  it("warns before the free Assault breaks a Reciprocal Restraint ceasefire (DEC-66)", () => {
    const board = setTrack(open(), "ceasefire", "reciprocalRestraint");
    const result = engine.validate(ruleset, board, pivotal("state", "DK-076", [sweep(null), { locations: ["botan"], perLocation: {} }]));
    expect(result.ok).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("refuses an Assault outside the Sweep spaces", () => {
    const board = setPieces(open(), "agri", "guerrilla", 1, "active");
    expect(codes(board, pivotal("state", "DK-076", [sweep(null), { locations: ["agri"], perLocation: {} }]))).toEqual(["eventConstraint"]);
  });
});

function engineMessage(state: GameState, command: AnyCommand): string | undefined {
  try {
    play(state, command);
  } catch (e) {
    return (JSON.parse((e as Error).message) as { message: string }[])[0]?.message;
  }
  return undefined;
}

describe("board at an open question (engine.questionState)", () => {
  const open = reveal("C4", { state: ["DK-076"] }, (s) => setTrack(opposed(s), "emergencyRule", "ohalExtendedPowers"));
  const sweep = { locations: ["hakkari"], perLocation: {} };
  const active = (s: GameState | null): number => s?.spaces["hakkari"]?.pieces["guerrilla"]?.["active"] ?? -1;

  it("gives the board after the answers so far: the Sweep of Area Domination has activated Guerrillas before the Assault question", () => {
    expect(active(open)).toBe(0);
    expect(active(engine.questionState(ruleset, open, pivotal("state", "DK-076")))).toBe(0);
    expect(active(engine.questionState(ruleset, open, pivotal("state", "DK-076", [sweep])))).toBe(1);
  });

  it("changes no state, and gives null when no question is open", () => {
    const before = JSON.stringify(open);
    engine.questionState(ruleset, open, pivotal("state", "DK-076", [sweep]));
    expect(JSON.stringify(open)).toBe(before);
    expect(engine.questionState(ruleset, open, pivotal("state", "DK-076", [sweep, null]))).toBeNull();
    expect(engine.questionState(ruleset, open, pivotal("pkk", "DK-076", [sweep]))).toBeNull();
    expect(engine.questionState(ruleset, open, { type: "NoSuchCommand" })).toBeNull();
  });
});
