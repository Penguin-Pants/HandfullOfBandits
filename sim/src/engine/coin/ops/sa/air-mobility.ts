import { modifierLimit } from "../../../core/modifiers.ts";
import { MOD } from "../../modifiers.ts";
// Air Mobility (research 06 s3.1; PA-14): move up to 4 Troops among up to 3 domestic spaces
// (origins and destinations together, Western Cities included), never an external box.
// SA locations: every space involved. Per destination: `moves: [{from, count}]`.
import { param } from "../../../core/params.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { count, space } from "../common.ts";
import { FACTION, PIECE } from "../ids.ts";
import { asMoves } from "../plan.ts";

const ruleRef = "06 s3.1";

export const airMobility: ActionHandler = {
  id: "state.air-mobility",
  faction: FACTION.state,
  kind: "sa",
  ruleRef,
  accompanies: "any",
  check(ruleset, state, part) {
    const out: Violation[] = [];
    const maxSpaces = modifierLimit(state, MOD.strikeForce, "maxSpaces", param(ruleset, "airMobility.maxSpaces", "number"));
    const maxTroops = modifierLimit(state, MOD.strikeForce, "maxTroops", param(ruleset, "airMobility.maxTroops", "number"));
    if (part.locations.length > maxSpaces) out.push(at(null, "airMobilitySpaces", `Air Mobility uses at most ${String(maxSpaces)} spaces, origins included.`, ruleRef));
    let moved = 0;
    const leaving = new Map<string, number>();
    for (const loc of part.locations) {
      if (space(ruleset, loc)?.kind !== "domestic") out.push(at(loc, "airMobilityExternal", "Air Mobility never uses an external box (PA-14).", ruleRef));
      const list = asMoves(part.perLocation[loc]?.["moves"]);
      if (list === null) {
        out.push(at(loc, "badMoves", "Moves must be [{from, count}].", ruleRef));
        continue;
      }
      for (const m of list) {
        if (!part.locations.includes(m.from)) out.push(at(m.from, "airMobilityOrigin", "List each origin among the Air Mobility spaces.", ruleRef));
        leaving.set(m.from, (leaving.get(m.from) ?? 0) + m.count);
        moved += m.count;
      }
    }
    if (moved > maxTroops) out.push(at(null, "airMobilityTroops", `Move at most ${String(maxTroops)} Troops.`, ruleRef));
    for (const [from, n] of leaving) if (n > count(state, from, PIECE.troops)) out.push(at(from, "airMobilityTroops", `Only ${String(count(state, from, PIECE.troops))} Troops are here.`, ruleRef));
    return out;
  },
  cost: () => 0,
  execute(ctx, part) {
    for (const loc of part.locations) {
      for (const m of asMoves(part.perLocation[loc]?.["moves"]) ?? []) {
        ctx.apply({ type: "movePieces", piece: PIECE.troops, state: null, toState: null, count: m.count, from: m.from, to: loc, ruleRef, assumptionRef: "PA-14" });
      }
    }
  },
};
