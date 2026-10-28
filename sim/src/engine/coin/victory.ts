// Victory check, final scoring and the outcome record sheet (research 09 s3, s4, s6; PA-10).
import type { Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import { setupState } from "../core/state.ts";
import type { FactionId, GameResult, GameState, JsonObject, Ruleset } from "../core/types.ts";
import { control, derive } from "./derive.ts";
import { markers } from "./ops/common.ts";
import { FACTION, MARKER, PIECE, TRACK } from "./ops/ids.ts";
import { PHASE } from "./phases.ts";
import { revealCovert } from "./propaganda/legitimacy.ts";
import type { PropagandaPhase } from "./propaganda/phase.ts";

interface Standing {
  readonly faction: FactionId;
  readonly score: number;
  readonly harm: number;
  readonly threshold: number;
  readonly margin: number;
}

function covert(ruleset: Ruleset, state: GameState): number {
  return ruleset.spaces.reduce((sum, s) => sum + markers(state, s.id, MARKER.covert), 0);
}

/** Scores and Harm at a victory check: each face-down Covert marker counts as revealed (09 s3 step 1). */
export function checkStandings(ruleset: Ruleset, state: GameState, final: boolean): Standing[] {
  const view = derive(ruleset, state);
  const thresholds = ruleset.scenarios[state.meta.scenarioId]?.thresholds ?? {};
  const hidden = final ? 0 : covert(ruleset, state);
  const limit = param(ruleset, "harm.limit", "number");
  const factor = param(ruleset, "victory.finalHarmFactor", "number");
  return ruleset.factions
    .filter((f) => f.kind === "player")
    .map((f) => {
      const isState = f.id === FACTION.state;
      const score = (view.scores[f.id] ?? 0) - (isState ? hidden * param(ruleset, "victory.covertCheckPenalty", "number") : 0);
      const harm = (view.harm[f.id] ?? 0) + (isState ? hidden : 0);
      const threshold = thresholds[f.id] ?? 0;
      const margin = score - threshold - (final ? factor * Math.max(0, harm - limit) : 0);
      return { faction: f.id, score, harm, threshold, margin };
    });
}

/** Higher margin wins; ties: lower Harm count, then the PKK (09 s4 item 5; PA-10). */
function rank(standings: readonly Standing[]): Standing[] {
  return [...standings].sort((a, b) => b.margin - a.margin || a.harm - b.harm || Number(b.faction === FACTION.pkk) - Number(a.faction === FACTION.pkk));
}

function band(ruleset: Ruleset, end: number, start: number, gapParam: string): string {
  const gap = param(ruleset, gapParam, "number");
  return end - start >= gap ? "improving" : start - end >= gap ? "deteriorating" : "mixed";
}

/** Outcome record sheet (09 s6): board measures against the scenario setup. Record only (DD-14.5). */
export function recordSheet(ruleset: Ruleset, state: GameState): JsonObject {
  const setup = setupState(ruleset, state.meta.scenarioId, state.meta.seed);
  const harmful = (s: GameState): number =>
    ruleset.spaces.reduce((sum, sp) => sum + [MARKER.stateHarm, MARKER.pkkHarm, MARKER.disputedHarm, MARKER.displacement, MARKER.reception].reduce((n, m) => n + markers(s, sp.id, m), 0), 0);
  const statePop = (s: GameState): number => {
    const c = control(ruleset, s);
    return ruleset.spaces.filter((sp) => sp.kind === "domestic" && c[sp.id] === FACTION.state).reduce((sum, sp) => sum + sp.pop, 0);
  };
  const leverage = (s: GameState): number =>
    ruleset.spaces.reduce((sum, sp) => sum + Object.values(s.spaces[sp.id]?.pieces[PIECE.pkkBase] ?? {}).reduce((a, n) => a + n, 0), 0) + (derive(ruleset, s).totals["totalOpposition"] ?? 0);
  const offices = ruleset.spaces.reduce((sum, sp) => sum + markers(state, sp.id, MARKER.office), 0);
  const legal = String(state.tracks["legalSpace"]);
  const access = legal === "open" && offices >= 2 ? "improving" : legal === "prosecuted" || legal === "open" ? "mixed" : "deteriorating";
  // Civilian life improves when harm falls, so the sign is reversed.
  return {
    protectedCivilianLife: band(ruleset, harmful(setup), harmful(state), "recordSheet.civilianGap"),
    legitimatePoliticalAccess: access,
    stateInstitutionalEffectiveness: band(ruleset, statePop(state), statePop(setup), "recordSheet.boardGap"),
    pkkOrganizationalLeverage: band(ruleset, leverage(state), leverage(setup), "recordSheet.boardGap"),
    emergencyRule: String(state.tracks[TRACK.emergencyRule]),
    postures: { syria: String(state.tracks[TRACK.syria]), kdp: String(state.tracks[TRACK.kdp]), puk: String(state.tracks[TRACK.puk]) },
    ceasefire: String(state.tracks["ceasefire"]),
  };
}

function endGame(ctx: Exec, result: GameResult, standings: readonly Standing[]): void {
  ctx.write((s) => ({ ...s, ended: result, turn: { ...s.turn, phase: PHASE.ended } }));
  ctx.log("GameEnded", { winner: result.winner, reason: result.reason, labels: [...result.labels], standings: standings.map((s) => ({ ...s })), recordSheet: result.recordSheet }, "09 s4");
  const limit = param(ctx.ruleset, "harm.limit", "number");
  const winner = standings.find((s) => s.faction === result.winner);
  if (winner !== undefined && winner.harm > limit) ctx.log("StopRuleFlag", { rule: 4, faction: winner.faction, harm: winner.harm, limit }, "12 s9"); // literal-ok: research 12 s9 stop rule number
}

/** Labels for a result (09 s4; 10-mvp-scope s2.1 for test scenarios). */
function labels(ctx: Exec, ranked: readonly Standing[]): string[] {
  const [first, second] = ranked;
  const diff = first !== undefined && second !== undefined ? first.margin - second.margin : 0;
  const out = [diff <= param(ctx.ruleset, "victory.narrowMax", "number") ? "narrow" : "clear"];
  if (ctx.ruleset.scenarios[ctx.state.meta.scenarioId]?.testOnly === true) out.push("test result, not comparable");
  return out;
}

/** Final scoring (09 s4): reveal Covert markers, recompute, final margins, tie order. */
export function finalScoring(ctx: Exec): void {
  for (const s of ctx.ruleset.spaces) for (let i = markers(ctx.state, s.id, MARKER.covert); i > 0; i--) revealCovert(ctx, s.id, "09 s4 item 1");
  const standings = checkStandings(ctx.ruleset, ctx.state, true);
  ctx.log("ScoreCheck", { final: true, standings: standings.map((s) => ({ ...s })) }, "09 s4");
  const ranked = rank(standings);
  const start = checkStandings(ctx.ruleset, setupState(ctx.ruleset, ctx.state.meta.scenarioId, ctx.state.meta.seed), true);
  const change = Object.fromEntries(standings.map((s) => [s.faction, s.score - (start.find((t) => t.faction === s.faction)?.score ?? 0)]));
  endGame(ctx, { winner: ranked[0]?.faction ?? null, reason: "final scoring", labels: labels(ctx, ranked), recordSheet: { ...recordSheet(ctx.ruleset, ctx.state), scoreChangeFromStart: change } }, standings);
}

export const victoryPhase: PropagandaPhase = {
  id: "victory",
  ruleRef: "05 s6.1",
  check: () => [],
  run(ctx) {
    if (ctx.state.turn.propagandaRound <= 1) {
      ctx.log("EffectSkipped", { effect: "victoryCheck", reason: "firstRound" }, "05 s6.1");
      return;
    }
    const limit = param(ctx.ruleset, "harm.limit", "number");
    const standings = checkStandings(ctx.ruleset, ctx.state, false);
    const qualified = standings.filter((s) => s.margin >= 0 && s.harm <= limit);
    ctx.log("ScoreCheck", { final: false, standings: standings.map((s) => ({ ...s })), qualified: qualified.map((s) => s.faction) }, "09 s3");
    const ranked = rank(qualified);
    const winner = ranked[0];
    if (winner === undefined) return;
    ctx.write((s) => ({ ...s, history: { ...s.history, firstQualifyingRound: s.history["firstQualifyingRound"] ?? s.turn.propagandaRound } }));
    endGame(ctx, { winner: winner.faction, reason: "victory check", labels: labels(ctx, rank(standings)), recordSheet: recordSheet(ctx.ruleset, ctx.state) }, standings);
  },
};

