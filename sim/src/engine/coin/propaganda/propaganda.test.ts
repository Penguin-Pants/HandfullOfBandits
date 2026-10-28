import { describe, expect, it } from "vitest";
import { codes, play, ruleset, setMarkers, setPieces, setTrack, turnOf } from "../../../../test/board.ts";
import { createExec } from "../../core/exec.ts";
import type { AnyCommand, GameState } from "../../core/types.ts";
import { PHASE } from "../phases.ts";
import { flagHarmful, netChange, notePassOnly } from "../stop-rules.ts";
import { checkStandings } from "../victory.ts";
import { income } from "./resources.ts";

// T-PROP, T-VIC, T-PERV (11 P2-10; research 05 s6, 09 s3 to s7, 12 s9).
const s0 = turnOf("pkk");
/** `state` at the start of Propaganda phase `phase` of round `round`. */
function at(state: GameState, phase: string, round = 1): GameState {
  const step = ruleset.sequence.propagandaPhases.indexOf(phase);
  return { ...state, deck: { ...state.deck, currentCard: "DK-016" }, turn: { ...state.turn, phase: PHASE.propaganda, propagandaRound: round, step } };
}
const advance = { type: "Advance" };
const choice = (phase: string, c: Record<string, unknown>): AnyCommand => ({ type: "PropagandaChoice", phase, choice: c });
const t = (s: GameState, k: string): unknown => s.tracks[k];

describe("T-PROP: Resources (05 s6.2)", () => {
  it("hand-computed income on the 1984 setup: State 8 + 10/2 + Elazığ 2 + Van-Bitlis 4 = 19; PKK 1 + 2 + 2 + 0 = 5", () => {
    expect(income(ruleset, s0)).toEqual({ state: 19, pkk: 5 });
    const { state } = play(at(s0, "resources"), advance);
    expect([t(state, "resources.state"), t(state, "resources.pkk")]).toEqual([31, 10]);
  });

  it("drops host and Leadership income when Syria turns Restricted, adds Europe income", () => {
    const board = setTrack(setTrack(s0, "posture.syria", "restricted"), "europe", 4);
    expect(income(ruleset, board).pkk).toBe(1 + 1 + 0 + 2);
  });
});

describe("T-PROP: Upkeep (05 s6.3)", () => {
  const guarded = setPieces(setPieces(s0, "dersim", "guards", 2), "agri", "guards", 1);
  it("pays 1 per 2 Guards, round up", () => {
    expect(t(play(at(guarded, "upkeep"), advance).state, "resources.state")).toBe(10);
  });
  it("asks for Guard removals when the State cannot pay, then pays for the rest", () => {
    const poor = at(setTrack(guarded, "resources.state", 1), "upkeep");
    expect(codes(poor, advance)).toEqual(["needsAnswer"]);
    const { state } = play(poor, choice("upkeep", { removeGuards: { dersim: 1 } }));
    expect(state.spaces["dersim"]?.pieces["guards"]).toEqual({ default: 1 });
    expect(t(state, "resources.state")).toBe(0);
  });
  it("rejects Guard removals when the State can pay in full", () => {
    expect(codes(at(guarded, "upkeep"), choice("upkeep", { removeGuards: { dersim: 2 } }))).toEqual(["upkeepPaid"]);
  });
});

describe("T-PROP: Legitimacy (05 s6.4)", () => {
  it("1984 setup: Martial Law -1, no New Displacement +1: stays 10", () => {
    expect(t(play(at(s0, "legitimacy"), advance).state, "legitimacy")).toBe(10);
  });

  it("hand-computed fixture: -1 drain, -2 New Displacement, -1 Reception 3+, Europe 4: -1, = 5; markers flip to Old", () => {
    let board = setMarkers(setMarkers(s0, "dersim", "displacement", 1, "new"), "agri", "displacement", 1, "new");
    board = setMarkers(setMarkers(board, "diyarbakir-city", "reception", 2), "western-cities", "reception", 1);
    board = setTrack(board, "europe", 4);
    const { state } = play(at(board, "legitimacy"), advance);
    expect(t(state, "legitimacy")).toBe(5);
    expect(state.spaces["dersim"]?.markers["displacement"]).toEqual({ new: 0, old: 1 });
  });

  it("moves Europe +1 when State Harm leads by 3, and allows only 07 s8.2 Emergency steps", () => {
    const harmed = setMarkers(s0, "dersim", "stateHarm", 3);
    expect(t(play(at(harmed, "legitimacy"), advance).state, "europe")).toBe(2);
    expect(codes(at(s0, "legitimacy"), choice("legitimacy", { emergencyStep: "ohal" }))).toEqual(["emergencyStep"]);
    const ohal = setTrack(s0, "emergencyRule", "ohal");
    expect(t(play(at(ohal, "legitimacy"), choice("legitimacy", { emergencyStep: "normalizing" })).state, "emergencyRule")).toBe("normalizing");
  });
});

describe("T-PROP: Civic Action and Agitation (05 s6.6)", () => {
  it("caps State spending at Legitimacy / 2 and needs Troops, Police and Control", () => {
    const spend = (space: string, shifts: number): AnyCommand => choice("civicAction", { spaces: { [space]: { shifts } } });
    expect(codes(at(s0, "civicAction"), spend("elazig", 1))).toEqual([]);
    expect(codes(at(setTrack(s0, "legitimacy", 3), "civicAction"), spend("elazig", 1))).toEqual(["civicCap"]);
    expect(codes(at(s0, "civicAction"), spend("sanliurfa", 1))).toEqual(["civicNeedsTroops"]);
    expect(play(at(s0, "civicAction"), spend("elazig", 1)).state.spaces["elazig"]?.level).toBe(2);
  });

  it("PKK Agitation needs a PKK piece and no State Control", () => {
    const spend = (space: string): AnyCommand => choice("agitation", { spaces: { [space]: { shifts: 1 } } });
    expect(play(at(s0, "agitation"), spend("botan")).state.spaces["botan"]?.level).toBe(-2);
    expect(codes(at(s0, "agitation"), spend("hakkari"))).toEqual(["agitateWhere"]);
  });

  it("ends the final round after Agitation: metrics row, final scoring, test-result label (S0)", () => {
    // Margins -26 (PKK) and -28 (State): a difference of 2 is "narrow" (09 s4).
    const { state, entries } = play(at(s0, "agitation"), advance);
    expect(state.turn.phase).toBe("ended");
    expect(state.ended).toMatchObject({ winner: "pkk", reason: "final scoring", labels: ["narrow", "test result, not comparable"] });
    expect(state.ended?.recordSheet).toMatchObject({ protectedCivilianLife: "mixed", scoreChangeFromStart: { state: 0, pkk: 0 } });
    const metrics = entries.find((e) => e.kind === "RoundMetrics");
    expect(metrics?.data).toMatchObject({ round: 1, scores: { state: 21, pkk: 4 }, harm: { state: 0, pkk: 0 } });
  });
});

describe("T-VIC (09 s3, s4; PA-10)", () => {
  it("skips the Victory phase in the first round", () => {
    const { entries } = play(at(s0, "victory"), advance);
    expect(entries.some((e) => e.data["reason"] === "firstRound")).toBe(true);
  });

  it("counts face-down Covert markers at a check: State -2 score and +1 Harm each", () => {
    const board = setMarkers(s0, "dersim", "covert", 2);
    expect(checkStandings(ruleset, board, false).find((s) => s.faction === "state")).toMatchObject({ score: 17, harm: 2 });
  });

  it("final margin subtracts 2 per Harm point above the limit", () => {
    const board = setMarkers(setMarkers(s0, "dersim", "pkkHarm", 6), "agri", "coercion", 2);
    expect(checkStandings(ruleset, board, true).find((s) => s.faction === "pkk")).toMatchObject({ harm: 8, margin: 4 - 30 - 4 });
  });

  it("a qualifying faction wins at a later check; Harm above the limit blocks it", () => {
    const won = setTrack(setLevel4(s0), "legitimacy", 20);
    const { state } = play(at(won, "victory", 2), advance);
    expect(state.ended).toMatchObject({ winner: "state", reason: "victory check" });
    const harmed = setMarkers(won, "dersim", "stateHarm", 7);
    expect(play(at(harmed, "victory", 2), advance).state.ended).toBeNull();
  });
});

/** Every domestic space at Active Support: State score 2 x 32 + Legitimacy. */
function setLevel4(state: GameState): GameState {
  return { ...state, spaces: Object.fromEntries(Object.entries(state.spaces).map(([id, s]) => [id, s.level === null ? s : { ...s, level: 2 }])) };
}

describe("T-PERV and stop rules (09 s7; 12 s9)", () => {
  it("Strike Collaborators has no score reward: net change 0, no rule 3 flag", () => {
    const law = { ...s0, flags: { ...s0.flags, law3175: true } };
    const board = setPieces(law, "hakkari", "guards", 2);
    const sa = { action: "pkk.strike-collaborators", locations: ["hakkari"], perLocation: {}, timing: "before" };
    const { state, entries } = play(board, { type: "ChooseOperation", faction: "pkk", box: "opSa", plan: { op: "pkk.rally", locations: ["dersim"], perLocation: {}, sa, subActions: [] } });
    expect(netChange(ruleset, board, state, "pkk")).toBe(0);
    expect(entries.some((e) => e.kind === "StopRuleFlag")).toBe(false);
  });

  it("flags rule 3 when a harmful action raises its user's net margin", () => {
    const ctx = createExec(ruleset, s0);
    ctx.write((s) => setTrack(s, "legitimacy", 12));
    flagHarmful(ctx, "state.covert-action", "state", s0);
    expect(ctx.entries.map((e) => e.data["rule"])).toEqual([3]);
  });

  it("flags rule 6 on the second 3-card Pass-only streak", () => {
    const ctx = createExec(ruleset, s0);
    for (let i = 0; i < 6; i++) notePassOnly(ctx, "pkk", true);
    expect(ctx.entries.map((e) => e.data["rule"])).toEqual([6]);
  });
});
