// Coerce (research 06 s4.4; PA-05): in a Neutral or Support space with an Underground Guerrilla and
// no Displacement marker, Activate one Guerrilla. With no Coercion marker there, shift one level
// toward Neutral if at Support, then place a Coercion marker. A marker already there blocks the shift.
import { param } from "../../../core/params.ts";
import { SINGLE_FACE } from "../../../core/state.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { activate, count, markers, pay, space } from "../common.ts";
import { FACE, FACTION, MARKER, PIECE } from "../ids.ts";

const ruleRef = "06 s4.4";

function costOf(ruleset: Ruleset, loc: string): number {
  const pop = space(ruleset, loc)?.pop ?? 0;
  return pop >= param(ruleset, "coerce.highPopFrom", "number") ? param(ruleset, "coerce.costHighPop", "number") : param(ruleset, "coerce.costPerSpace", "number");
}

export const coerce: ActionHandler = {
  id: "pkk.coerce",
  faction: FACTION.pkk,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state: GameState, part) {
    const out: Violation[] = [];
    for (const loc of part.locations) {
      const level = state.spaces[loc]?.level ?? null;
      if (level === null || level < 0) out.push(at(loc, "coerceLevel", "Coerce needs a Neutral or Support space.", ruleRef));
      if (count(state, loc, PIECE.guerrilla, FACE.underground) === 0) out.push(at(loc, "coerceGuerrilla", "Coerce needs an Underground Guerrilla.", ruleRef));
      if (markers(state, loc, MARKER.displacement) > 0) out.push(at(loc, "coerceDisplaced", "No Coerce in a space with a Displacement marker (06 s3.4).", ruleRef));
    }
    return out;
  },
  cost: (ruleset, _state, part, options) => (options.free ? 0 : part.locations.reduce((sum, loc) => sum + costOf(ruleset, loc), 0)),
  execute(ctx, part, options) {
    for (const loc of part.locations) {
      if (!options.free) pay(ctx, FACTION.pkk, costOf(ctx.ruleset, loc), ruleRef, loc);
      activate(ctx, loc, 1, ruleRef);
      if (markers(ctx.state, loc, MARKER.coercion) > 0) {
        ctx.log("EffectSkipped", { effect: "coerceShift", space: loc, reason: "block" }, ruleRef, "PA-05");
        continue;
      }
      if ((ctx.state.spaces[loc]?.level ?? 0) > 0) ctx.apply({ type: "shiftLevel", space: loc, direction: "neutral", steps: 1, ruleRef, assumptionRef: "PA-05" });
      ctx.apply({ type: "placeMarker", marker: MARKER.coercion, space: loc, side: SINGLE_FACE, ruleRef, assumptionRef: "PA-05" });
    }
  },
};
