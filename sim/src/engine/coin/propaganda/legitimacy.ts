// Legitimacy and Emergency Rule phase (research 05 s6.4 steps 1 to 8; 07 s8.2).
// Choice `{emergencyStep: <step ID>}` moves Emergency Rule one allowed step (step 8); none: no move.
import type { Exec } from "../../core/exec.ts";
import { modifierLimit } from "../../core/modifiers.ts";
import { param } from "../../core/params.ts";
import { SINGLE_FACE } from "../../core/state.ts";
import type { GameState, Ruleset } from "../../core/types.ts";
import { derive } from "../derive.ts";
import { MOD } from "../modifiers.ts";
import { adjustEurope, markers } from "../ops/common.ts";
import { EMERGENCY, FACTION, MARKER, TRACK } from "../ops/ids.ts";
import { asString } from "../ops/plan.ts";
import { violation, type PropagandaPhase } from "./phase.ts";
import { SWITCH } from "../switches.ts";

const ruleRef = "05 s6.4";

/** Markers of one type on the map, all sides counted. */
export function onMap(ruleset: Ruleset, state: GameState, marker: string): number {
  return ruleset.spaces.reduce((sum, s) => sum + markers(state, s.id, marker), 0);
}

/** Emergency Rule steps the State may move to now (07 s8.2 item 3). */
export function emergencyMoves(ruleset: Ruleset, state: GameState): string[] {
  // A package without the Emergency Rule track matches no step, so it has no moves.
  const from = String(state.tracks[TRACK.emergencyRule]);
  const extended = state.flags[SWITCH.extendedPowers] === true;
  if (from === EMERGENCY.ohal) return [EMERGENCY.normalizing, ...(extended ? [EMERGENCY.ohalExtendedPowers] : [])];
  if (from === EMERGENCY.ohalExtendedPowers) return [EMERGENCY.ohal];
  if (from === EMERGENCY.normalizing) return [EMERGENCY.ohal];
  return [];
}

function legit(ctx: Exec, delta: number, step: string): void {
  if (delta !== 0) ctx.apply({ type: "adjustTrack", track: TRACK.legitimacy, delta, ruleRef: `${ruleRef} ${step}`, assumptionRef: null });
}

/** Reveal one face-down Covert marker: it becomes a State Harm marker, Legitimacy -2 (06 s3.5); press reporting Momentum adds `extra` (DK-050). */
export function revealCovert(ctx: Exec, space: string, ref: string): void {
  ctx.apply({ type: "removeMarker", marker: MARKER.covert, space, side: SINGLE_FACE, ruleRef: ref, assumptionRef: null });
  ctx.apply({ type: "placeMarker", marker: MARKER.stateHarm, space, side: SINGLE_FACE, ruleRef: ref, assumptionRef: "PA-09" });
  ctx.apply({ type: "adjustTrack", track: TRACK.legitimacy, delta: -(param(ctx.ruleset, "covert.revealCost", "number") + modifierLimit(ctx.state, MOD.pressReporting, "extra", 0)), ruleRef: ref, assumptionRef: null });
}

/** Reveal one face-down Covert marker picked at random (PA-13); none on the map: nothing. */
export function revealRandomCovert(ctx: Exec, purpose: string, ref: string): void {
  const spaces = ctx.ruleset.spaces.flatMap((s) => Array.from({ length: markers(ctx.state, s.id, MARKER.covert) }, () => s.id));
  if (spaces.length > 0) revealCovert(ctx, ctx.pick(spaces, purpose, ref), ref);
}

export const legitimacyPhase: PropagandaPhase = {
  id: "legitimacy",
  ruleRef,
  check(ruleset, state, choice) {
    const step = choice?.["emergencyStep"];
    if (step === undefined || step === null) return [];
    const moves = emergencyMoves(ruleset, state);
    const to = asString(step);
    return to !== null && moves.includes(to) ? [] : [violation("emergencyStep", `Emergency Rule may move to: ${moves.join(", ") || "none"} (07 s8.2).`, "07 s8.2")];
  },
  run(ctx, choice) {
    const { ruleset } = ctx;
    // 1. Emergency Rule drain.
    const steps = ruleset.tracks.find((t) => t.id === TRACK.emergencyRule);
    const index = steps?.kind === "ordinal" ? steps.steps.indexOf(String(ctx.state.tracks[TRACK.emergencyRule])) : -1;
    legit(ctx, -Number(param(ruleset, "emergencyRule.drain", "list")[index] ?? 0), "step 1");
    // 2. New Displacement: -1 each, flip to Old.
    let flipped = 0;
    for (const s of ruleset.spaces) {
      const n = ctx.state.spaces[s.id]?.markers[MARKER.displacement]?.["new"] ?? 0;
      for (let i = 0; i < n; i++) ctx.apply({ type: "flipMarker", marker: MARKER.displacement, space: s.id, side: "old", ruleRef: `${ruleRef} step 2`, assumptionRef: null });
      flipped += n;
    }
    legit(ctx, -flipped * param(ruleset, "legitimacy.displacementDrain", "number"), "step 2");
    // 3 and 4. Reception and Disputed Harm thresholds.
    if (onMap(ruleset, ctx.state, MARKER.reception) >= param(ruleset, "legitimacy.receptionThreshold", "number")) legit(ctx, -1, "step 3");
    if (onMap(ruleset, ctx.state, MARKER.disputedHarm) >= param(ruleset, "legitimacy.disputedThreshold", "number")) legit(ctx, -1, "step 4");
    // 5. Covert exposure: a random face-down marker is revealed (PA-13).
    if (onMap(ruleset, ctx.state, MARKER.covert) >= param(ruleset, "covert.exposureThreshold", "number")) revealRandomCovert(ctx, "Covert exposure", `${ruleRef} step 5`);
    // 6. Europe adjustment.
    const harm = derive(ruleset, ctx.state).harm;
    const gap = param(ruleset, "europe.harmGap", "number");
    const stateHarm = harm[FACTION.state] ?? 0;
    const pkkHarm = harm[FACTION.pkk] ?? 0;
    const europeDelta = stateHarm - pkkHarm >= gap ? 1 : pkkHarm - stateHarm >= gap ? -1 : 0;
    adjustEurope(ctx, europeDelta, `${ruleRef} step 6`, "PA-04");
    if (Number(ctx.state.tracks[TRACK.europe]) >= param(ruleset, "europe.drainFrom", "number")) legit(ctx, -1, "step 6");
    // 7. Gains.
    const legalOpen = ctx.state.tracks["legalSpace"] === "open" && onMap(ruleset, ctx.state, MARKER.office) >= 2;
    const restraint = ["reciprocalRestraint", "talks"].includes(String(ctx.state.tracks["ceasefire"])) && ruleset.spaces.every((s) => (ctx.state.spaces[s.id]?.markers["restraintBroken"]?.[FACTION.state] ?? 0) === 0);
    legit(ctx, (legalOpen ? 1 : 0) + (restraint ? 1 : 0) + (flipped === 0 ? 1 : 0), "step 7");
    // 8. Emergency Rule step (State choice). Normalizing to OHAL costs Legitimacy (07 s8.2 item 3).
    const to = asString(choice?.["emergencyStep"]);
    if (to !== null) {
      if (ctx.state.tracks[TRACK.emergencyRule] === EMERGENCY.normalizing) legit(ctx, -param(ruleset, "emergencyRule.returnCost", "number"), "step 8");
      ctx.apply({ type: "setTrack", track: TRACK.emergencyRule, value: to, ifEquals: null, ruleRef: "07 s8.2", assumptionRef: null });
    }
  },
};
