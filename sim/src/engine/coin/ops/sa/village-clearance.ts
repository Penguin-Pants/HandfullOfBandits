// Village Clearance (research 06 s3.4; 07 s3.2; approved text docs/prototype/27). With Sweep or
// Garrison, in one Op space: four conditions, then seven effects in order. Costs Legitimacy; Resources
// only under US Lending Conditions (DK-074). Per location: `reception`, the Diyarbakır City or
// Western Cities space for Reception.
import { param } from "../../../core/params.ts";
import { SINGLE_FACE } from "../../../core/state.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { modifierLimit } from "../../../core/modifiers.ts";
import { MOD } from "../../modifiers.ts";
import { at, type ActionHandler } from "../action.ts";
import { activate, controlOf, count, hasTag, isTerrain, markers, pay, space } from "../common.ts";
import { EMERGENCY, FACE, FACTION, MARKER, PIECE, TAG, TERRAIN, TRACK } from "../ids.ts";
import { asString } from "../plan.ts";
import { availableFrom, SWITCH } from "../../switches.ts";

const ruleRef = "06 s3.4";
const steps: readonly string[] = [EMERGENCY.ohal, EMERGENCY.ohalExtendedPowers];

/** Display name of a refused step: only Martial Law and Normalizing reach the message. */
function stepName(step: string): string {
  const spaced = step.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Legitimacy the clearance costs at once (effect 2): per-Pop cost x Pop of the target, plus the
 * Customs Union Momentum (DK-072). Condition 4 needs this plus 1 (DEC-74). */
function popCost(ruleset: Ruleset, state: GameState, target: string): number {
  return param(ruleset, "clearance.legitimacyPerPop", "number") * (space(ruleset, target)?.pop ?? 0) + modifierLimit(state, MOD.customsUnion, "extra", 0);
}

/** Condition 2: the C3 switch (10 s6.2; DEC-68; OHAL Powers is itself a C3 card). */
function powersReady(state: GameState): boolean {
  return state.flags[SWITCH.villageClearance] === true;
}

export const villageClearance: ActionHandler = {
  id: "state.village-clearance",
  faction: FACTION.state,
  kind: "sa",
  ruleRef,
  accompanies: ["state.sweep", "state.garrison"],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    const step = String(state.tracks[TRACK.emergencyRule]);
    if (!steps.includes(step)) out.push(at(null, "clearanceStep", `Village Clearance: Emergency Rule is ${stepName(step)}. Needs OHAL or OHAL Extended Powers (06 s3.4 condition 1).`, ruleRef));
    if (!powersReady(state)) out.push(at(null, "clearancePowers", `Village Clearance is ${availableFrom(ruleset, SWITCH.villageClearance)} (06 s3.4 condition 2).`, ruleRef));
    if (part.locations.length !== 1) return [...out, at(null, "clearanceSpaces", "Select exactly 1 space for Village Clearance.", ruleRef)];
    const loc = part.locations[0] ?? "";
    const fail = (code: string, message: string): Violation[] => [...out, at(loc, code, message, ruleRef)];
    if (!options.opLocations.includes(loc)) return fail("clearanceOpSpace", "Village Clearance must target a space that the Sweep or Garrison selected.");
    if (space(ruleset, loc)?.kind !== "domestic" || !isTerrain(ruleset, loc, TERRAIN.mountain, TERRAIN.plain)) return fail("clearanceTerrain", "Village Clearance targets a Mountain or Plain space only.");
    if (controlOf(ruleset, state, loc) !== FACTION.state || count(state, loc, PIECE.troops) === 0 || count(state, loc, PIECE.police) === 0) return fail("clearanceWhere", "Village Clearance needs State Control, Troops and Police in the space.");
    if ((state.spaces[loc]?.level ?? 0) > 0) return fail("clearanceLevel", "Village Clearance needs a Neutral or Opposition space.");
    if (markers(state, loc, MARKER.displacement) > 0) return fail("clearanceDisplaced", "This space already has a Displacement marker.");
    const need = popCost(ruleset, state, loc) + 1;
    const legitimacy = Number(state.tracks[TRACK.legitimacy]);
    if (legitimacy < need) return fail("clearanceLegitimacy", `Village Clearance needs Legitimacy ${String(need)} or more. Legitimacy is ${String(legitimacy)}.`);
    const reception = asString(part.perLocation[loc]?.["reception"]);
    if ((state.markerPools[MARKER.reception] ?? 0) > 0 && (reception === null || !hasTag(ruleset, reception, TAG.receptionTarget))) return fail("clearanceReception", "Place Reception in Diyarbakır City or Western Cities.");
    return out;
  },
  // US Lending Conditions (DK-074). An action a card makes free skips it (DEC-69 point 9).
  cost: (_r, state, _p, options) => options.free ? 0 : modifierLimit(state, MOD.lendingConditions, "resources", 0),
  execute(ctx, part, options) {
    const loc = part.locations[0] ?? "";
    pay(ctx, FACTION.state, villageClearance.cost(ctx.ruleset, ctx.state, part, options), ruleRef, loc);
    const ref = (effect: string): string => `${ruleRef} effect ${effect}`;
    const legit = (delta: number, effect: string): void => {
      ctx.apply({ type: "adjustTrack", track: TRACK.legitimacy, delta: -delta, ruleRef: ref(effect), assumptionRef: null });
    };
    if ((ctx.state.spaces[loc]?.level ?? 0) < 0) ctx.apply({ type: "shiftLevel", space: loc, direction: "neutral", steps: 1, ruleRef: ref("1"), assumptionRef: "PA-18" });
    legit(popCost(ctx.ruleset, ctx.state, loc), "2");
    ctx.apply({ type: "placeMarker", marker: MARKER.displacement, space: loc, side: "new", ruleRef: ref("3"), assumptionRef: null });
    ctx.apply({ type: "placeMarker", marker: MARKER.stateHarm, space: loc, side: SINGLE_FACE, ruleRef: ref("4"), assumptionRef: null });
    const reception = asString(part.perLocation[loc]?.["reception"]);
    if ((ctx.state.markerPools[MARKER.reception] ?? 0) > 0 && reception !== null) ctx.apply({ type: "placeMarker", marker: MARKER.reception, space: reception, side: SINGLE_FACE, ruleRef: ref("5"), assumptionRef: null });
    else legit(param(ctx.ruleset, "clearance.receptionShortfallCost", "number"), "5");
    activate(ctx, loc, count(ctx.state, loc, PIECE.guerrilla, FACE.underground), ref("6"));
    if (markers(ctx.state, loc, MARKER.office) > 0) legit(param(ctx.ruleset, "clearance.officeCost", "number"), "7");
  },
};
