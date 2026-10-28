// Ambush (research 06 s5.1; PA-06 replaced): in up to 2 Attack spaces with an Underground
// Guerrilla, Attack resolves as normal and Ambush removes 1 extra State piece in the Attack order.
// Ambush is checked on the board before the Attack, so it uses timing `before` (DEC-16).
import { param } from "../../../core/params.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { count } from "../common.ts";
import { FACE, FACTION, PIECE } from "../ids.ts";
import { removeInAttackOrder } from "../pkk/attack.ts";

const ruleRef = "06 s5.1";

export const ambush: ActionHandler = {
  id: "pkk.ambush",
  faction: FACTION.pkk,
  kind: "sa",
  ruleRef,
  accompanies: ["pkk.attack"],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    const max = param(ruleset, "ambush.maxSpaces", "number");
    if (part.locations.length > max) out.push(at(null, "ambushSpaces", `Ambush selects at most ${String(max)} Attack spaces.`, ruleRef));
    for (const loc of part.locations) {
      if (!options.opLocations.includes(loc)) out.push(at(loc, "ambushNotAttack", "Ambush selects Attack spaces only.", ruleRef));
      if (count(state, loc, PIECE.guerrilla, FACE.underground) === 0) out.push(at(loc, "ambushGuerrilla", "Ambush needs an Underground Guerrilla (use timing before).", ruleRef));
    }
    return out;
  },
  cost: () => 0,
  execute(ctx, part) {
    for (const loc of part.locations) {
      removeInAttackOrder(ctx, loc, param(ctx.ruleset, "ambush.extraRemoval", "number"), false, ruleRef, "PA-06");
    }
  },
};
