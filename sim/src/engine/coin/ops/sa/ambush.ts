import { modifierLimit } from "../../../core/modifiers.ts";
import { MOD } from "../../modifiers.ts";
// Ambush (research 06 s5.1; PA-06): in up to 2 Attack spaces with an Underground Guerrilla, the
// Attack there has no roll: 1 Guerrilla Activates and 1 State piece goes, with no attrition.
// The Attack handler resolves it (attack.ts).
// Ambush is checked on the board before the Attack, so it uses timing `before` (DEC-16).
import { param } from "../../../core/params.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { count } from "../common.ts";
import { FACE, FACTION, PIECE } from "../ids.ts";

const ruleRef = "06 s5.1";

export const ambush: ActionHandler = {
  id: "pkk.ambush",
  faction: FACTION.pkk,
  kind: "sa",
  ruleRef,
  accompanies: ["pkk.attack"],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    const max = modifierLimit(state, MOD.ambush, "maxSpaces", param(ruleset, "ambush.maxSpaces", "number"));
    if (part.locations.length > max) out.push(at(null, "ambushSpaces", `Ambush selects at most ${String(max)} Attack spaces.`, ruleRef));
    for (const loc of part.locations) {
      if (!options.opLocations.includes(loc)) out.push(at(loc, "ambushNotAttack", "Ambush selects Attack spaces only.", ruleRef));
      if (count(state, loc, PIECE.guerrilla, FACE.underground) === 0) out.push(at(loc, "ambushGuerrilla", "Ambush needs an Underground Guerrilla (use timing before).", ruleRef));
    }
    return out;
  },
  cost: () => 0,
  execute: () => undefined,
};
