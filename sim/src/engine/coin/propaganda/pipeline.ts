// Propaganda round (research 05 s6): phases from sequence.yaml run in order. `Advance` runs the
// current phase with no choice; `PropagandaChoice` runs it with one. After the Agitation phase of
// the final round, final scoring ends the game (05 s6.6 item 3).
import type { Exec } from "../../core/exec.ts";
import type { AnyCommand, CommandHandler, GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";
import { derive } from "../derive.ts";
import { resources } from "../ops/common.ts";
import { FACTION, TRACK } from "../ops/ids.ts";
import { asObject } from "../ops/plan.ts";
import { PHASE } from "../phases.ts";
import { finalScoring } from "../victory.ts";
import { FINAL_AFTER, propagandaPhases } from "./registry.ts";

const ruleRef = "05 s6";

/** Start a Propaganda round when its card is revealed. */
export function startRound(ctx: Exec): void {
  ctx.write((s) => ({ ...s, turn: { ...s.turn, phase: PHASE.propaganda, propagandaRound: s.turn.propagandaRound + 1, step: 0 } }));
  ctx.log("PhaseStarted", { phase: PHASE.propaganda, round: ctx.state.turn.propagandaRound, next: currentId(ctx.ruleset, ctx.state) }, ruleRef);
}

function currentId(ruleset: Ruleset, state: GameState): string | null {
  return ruleset.sequence.propagandaPhases[state.turn.step] ?? null;
}

export function propagandaViolations(ruleset: Ruleset, state: GameState, choice: JsonObject | null): Violation[] {
  const id = currentId(ruleset, state);
  const phase = id === null ? undefined : propagandaPhases[id];
  if (state.turn.phase !== PHASE.propaganda || phase === undefined) return [{ code: "notPropaganda", message: "No Propaganda phase is open.", ruleRef, location: null }];
  return phase.check(ruleset, state, choice);
}

/** Round metrics (research 12 s4 per-round fields; DEC-34). */
function metrics(ctx: Exec): void {
  const view = derive(ctx.ruleset, ctx.state);
  const factions = [FACTION.state, FACTION.pkk];
  ctx.log(
    "RoundMetrics",
    {
      round: ctx.state.turn.propagandaRound,
      campaign: ctx.state.turn.campaign,
      scores: { ...view.scores },
      margins: { ...view.margins },
      harm: { ...view.harm },
      income: Object.fromEntries(factions.map((f) => [f, ctx.state.history[`income.${f}`] ?? 0])),
      resources: Object.fromEntries(factions.map((f) => [f, resources(ctx.ruleset, ctx.state, f)])),
      legitimacy: Number(ctx.state.tracks[TRACK.legitimacy]),
      europe: Number(ctx.state.tracks[TRACK.europe]),
      emergencyRule: String(ctx.state.tracks[TRACK.emergencyRule]),
      postures: { syria: String(ctx.state.tracks[TRACK.syria]), kdp: String(ctx.state.tracks[TRACK.kdp]), puk: String(ctx.state.tracks[TRACK.puk]) },
    },
    "12 s4",
  );
}

function runPhase(ctx: Exec, choice: JsonObject | null): void {
  const id = currentId(ctx.ruleset, ctx.state) ?? "";
  const phase = propagandaPhases[id];
  if (phase === undefined) return;
  ctx.log("PhaseStarted", { phase: id, round: ctx.state.turn.propagandaRound }, phase.ruleRef);
  phase.run(ctx, choice);
  ctx.log("PhaseEnded", { phase: id }, phase.ruleRef);
  if (ctx.state.ended !== null) return;
  ctx.write((s) => ({ ...s, turn: { ...s.turn, step: s.turn.step + 1 } }));
  if (id === FINAL_AFTER) {
    metrics(ctx);
    const final = ctx.ruleset.scenarios[ctx.state.meta.scenarioId]?.finalRound ?? 0;
    if (ctx.state.turn.propagandaRound >= final) finalScoring(ctx);
  }
}

export const propagandaChoiceHandler: CommandHandler = {
  ruleRef,
  check(ruleset, state, command: AnyCommand) {
    const id = currentId(ruleset, state);
    if (command["phase"] !== id) return [{ code: "wrongPhase", message: `The open Propaganda phase is ${id ?? "none"}.`, ruleRef, location: null }];
    const choice = asObject(command["choice"]);
    if (choice === null) return [{ code: "badChoice", message: "choice must be an object.", ruleRef, location: null }];
    return propagandaViolations(ruleset, state, choice);
  },
  execute(ctx, command) {
    runPhase(ctx, asObject(command["choice"]));
  },
};

/** Advance in a Propaganda round: run the current phase with no choice. */
export function advancePropaganda(ctx: Exec): void {
  runPhase(ctx, null);
}
