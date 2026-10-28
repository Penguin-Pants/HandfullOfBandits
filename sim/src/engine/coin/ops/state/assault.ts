// Assault (research 06 s2.4): remove one PKK piece per Troop (Mountain: per 2; City: Police count
// as Troops). Active Guerrillas first; Bases only when no Guerrilla remains; never Underground.
// Removals above the removable pieces are lost (PA-08). KDP and PUK Zones: Cross-Border (3a).
import { param } from "../../../core/params.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { count, isTerrain, pay, space, terrainRate } from "../common.ts";
import { FACE, FACTION, PIECE, TERRAIN } from "../ids.ts";

const ruleRef = "06 s2.4";

/** Removals the Assault makes in a space. */
export function assaultRemovals(ruleset: Ruleset, state: GameState, loc: string): number {
  const police = isTerrain(ruleset, loc, TERRAIN.city) ? count(state, loc, PIECE.police) : 0;
  return terrainRate(ruleset, loc, count(state, loc, PIECE.troops) + police);
}

/** Active Guerrillas, or Bases with no Guerrilla present. */
function targets(state: GameState, loc: string): number {
  const active = count(state, loc, PIECE.guerrilla, FACE.active);
  return active > 0 ? active : count(state, loc, PIECE.guerrilla) === 0 ? count(state, loc, PIECE.pkkBase) : 0;
}

export const assault: ActionHandler = {
  id: "state.assault",
  faction: FACTION.state,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part) {
    const out: Violation[] = [];
    for (const loc of part.locations) {
      if (space(ruleset, loc)?.kind !== "domestic") out.push(at(loc, "assaultWhere", "Assault selects domestic spaces (Cross-Border comes in Phase 3a).", ruleRef));
      else if (count(state, loc, PIECE.troops) === 0 && assaultRemovals(ruleset, state, loc) === 0) out.push(at(loc, "assaultTroops", "Assault needs Troops (Police count in a City).", ruleRef));
      else if (targets(state, loc) === 0) out.push(at(loc, "assaultTargets", "No Active PKK piece is here. Underground Guerrillas protect Bases.", ruleRef));
    }
    return out;
  },
  cost: (ruleset, _state, part, options) => (options.free ? 0 : part.locations.length * param(ruleset, "assault.costPerSpace", "number")),
  execute(ctx, part, options) {
    for (const loc of part.locations) {
      if (!options.free) pay(ctx, FACTION.state, param(ctx.ruleset, "assault.costPerSpace", "number"), ruleRef, loc);
      let left = assaultRemovals(ctx.ruleset, ctx.state, loc);
      const active = Math.min(left, count(ctx.state, loc, PIECE.guerrilla, FACE.active));
      if (active > 0) ctx.apply({ type: "removePieces", piece: PIECE.guerrilla, state: FACE.active, count: active, space: loc, to: "available", ruleRef, assumptionRef: null });
      left -= active;
      const bases = count(ctx.state, loc, PIECE.guerrilla) === 0 ? Math.min(left, count(ctx.state, loc, PIECE.pkkBase)) : 0;
      if (bases > 0) ctx.apply({ type: "removePieces", piece: PIECE.pkkBase, state: null, count: bases, space: loc, to: "available", ruleRef, assumptionRef: null });
      left -= bases;
      if (left > 0) ctx.log("EffectSkipped", { effect: "assault", space: loc, count: left, reason: "noTarget" }, ruleRef, "PA-08");
    }
  },
};
