// Attack (research 06 s4.3): Activate all Guerrillas, roll one die; on a roll at or below the
// Guerrillas there, remove up to 2 State pieces (Troops or Police first, PKK choice, then Guards,
// then Bases). One Guerrilla per Troop removed (attrition). A roll of 1 adds 1 Underground Guerrilla.
// Per location: `prefer: police` takes Police before Troops (default Troops); `remove` is how
// many to remove on a hit, 0 to the maximum (default the maximum).
import type { Exec } from "../../../core/exec.ts";
import { param } from "../../../core/params.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { count, pay, space } from "../common.ts";
import { guerrillas, statePieces } from "../common-pkk.ts";
import { FACE, FACTION, PIECE } from "../ids.ts";
import { asCount } from "../plan.ts";

const ruleRef = "06 s4.3";
const AMBUSH = "pkk.ambush";

/** Remove up to `n` State pieces in the Attack order (06 s4.3 item 3). Returns the Troops removed. */
export function removeInAttackOrder(ctx: Exec, loc: string, n: number, preferPolice: boolean, ref: string, assumptionRef: string | null = null): number {
  const order = [...(preferPolice ? [PIECE.police, PIECE.troops] : [PIECE.troops, PIECE.police]), PIECE.guards, PIECE.stateBase];
  let left = n;
  let troops = 0;
  for (const piece of order) {
    const k = Math.min(left, count(ctx.state, loc, piece));
    if (k === 0) continue;
    ctx.apply({ type: "removePieces", piece, state: null, count: k, space: loc, to: "available", ruleRef: ref, assumptionRef });
    if (piece === PIECE.troops) troops += k;
    left -= k;
  }
  return troops;
}

/** Pieces to remove on a hit: the plan's `remove`, else the maximum. Null: not a count in range. */
function removal(ruleset: Parameters<typeof param>[0], value: unknown): number | null {
  const max = param(ruleset, "attack.maxRemoval", "number");
  const n = asCount(value, max);
  return n === null || n > max ? null : n;
}

export const attack: ActionHandler = {
  id: "pkk.attack",
  faction: FACTION.pkk,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    const allowed = options.constraints["spaces"];
    for (const loc of part.locations) {
      if (space(ruleset, loc) === undefined || guerrillas(state, loc) === 0 || statePieces(ruleset, state, loc) === 0) {
        out.push(at(loc, "attackWhere", "Attack needs Guerrillas and State pieces in the space.", ruleRef));
      }
      if (removal(ruleset, part.perLocation[loc]?.["remove"]) === null) out.push(at(loc, "badRemove", `Remove 0 to ${String(param(ruleset, "attack.maxRemoval", "number"))} State pieces.`, ruleRef));
      if (Array.isArray(allowed) && !allowed.includes(loc)) out.push(at(loc, "eventConstraint", `The event allows Attack only in ${allowed.join(", ")}.`, "05 s5"));
    }
    return out;
  },
  cost: (ruleset, _state, part, options) => (options.free ? 0 : part.locations.length * param(ruleset, "attack.costPerSpace", "number")),
  execute(ctx, part, options) {
    for (const loc of part.locations) {
      if (!options.free) pay(ctx, FACTION.pkk, param(ctx.ruleset, "attack.costPerSpace", "number"), ruleRef, loc);
      // Ambush (06 s5.1, PA-06) replaces the Attack here: Activate 1 Underground Guerrilla, no
      // roll, remove State pieces in the Attack order, no attrition and no bonus Guerrilla.
      if (options.sa === AMBUSH && options.saLocations.includes(loc)) {
        ctx.apply({ type: "setPieceState", piece: PIECE.guerrilla, space: loc, from: FACE.underground, to: FACE.active, count: 1, ruleRef: "06 s5.1", assumptionRef: "PA-06" });
        removeInAttackOrder(ctx, loc, param(ctx.ruleset, "ambush.removal", "number"), part.perLocation[loc]?.["prefer"] === PIECE.police, "06 s5.1", "PA-06");
        continue;
      }
      ctx.apply({ type: "setPieceState", piece: PIECE.guerrilla, space: loc, from: FACE.underground, to: FACE.active, count: "all", ruleRef, assumptionRef: null });
      const roll = ctx.roll(`Attack in ${loc}`, ruleRef);
      const hit = roll <= guerrillas(ctx.state, loc);
      ctx.log("DieRolled", { purpose: "attackResult", space: loc, roll, guerrillas: guerrillas(ctx.state, loc), hit }, ruleRef);
      if (hit) {
        const prefer = part.perLocation[loc]?.["prefer"] === PIECE.police;
        const troops = removeInAttackOrder(ctx, loc, removal(ctx.ruleset, part.perLocation[loc]?.["remove"]) ?? 0, prefer, ruleRef);
        if (troops > 0) ctx.apply({ type: "removePieces", piece: PIECE.guerrilla, state: FACE.active, count: troops, space: loc, to: "available", ruleRef: "06 s4.3 item 4", assumptionRef: null });
      }
      if (roll === param(ctx.ruleset, "attack.bonusRoll", "number")) {
        ctx.apply({ type: "placePieces", piece: PIECE.guerrilla, count: 1, space: loc, state: FACE.underground, ruleRef: "06 s4.3 item 5", assumptionRef: null });
      }
    }
  },
};
