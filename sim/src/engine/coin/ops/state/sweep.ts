// Sweep (research 06 s2.3): in each selected domestic space (not Western Cities) Troops move in
// from adjacent spaces, one step, then Activate one Guerrilla per Troop, Police and Guard there
// (Mountain: per 2). Per location: `moves: [{from, count}]`. KDP and PUK Zones: Cross-Border (3a).
import { param } from "../../../core/params.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { activate, adjacent, count, hasTag, pay, space, terrainRate } from "../common.ts";
import { EMERGENCY, FACTION, PIECE, TAG, TRACK } from "../ids.ts";
import { asMoves } from "../plan.ts";

const ruleRef = "06 s2.3";

function costPerSpace(ruleset: Ruleset, state: GameState): number {
  return state.tracks[TRACK.emergencyRule] === EMERGENCY.ohalExtendedPowers ? param(ruleset, "sweep.costOhalExtended", "number") : param(ruleset, "sweep.costPerSpace", "number");
}

export const sweep: ActionHandler = {
  id: "state.sweep",
  faction: FACTION.state,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part) {
    const out: Violation[] = [];
    const leaving = new Map<string, number>();
    for (const loc of part.locations) {
      if (space(ruleset, loc)?.kind !== "domestic" || hasTag(ruleset, loc, TAG.noLandLinks)) {
        out.push(at(loc, "sweepWhere", "Sweep selects domestic spaces other than Western Cities.", ruleRef));
        continue;
      }
      const list = asMoves(part.perLocation[loc]?.["moves"]);
      if (list === null) {
        out.push(at(loc, "badMoves", "Moves must be [{from, count}].", ruleRef));
        continue;
      }
      for (const m of list) {
        if (!adjacent(ruleset, m.from, loc)) out.push(at(loc, "sweepAdjacent", `Troops move one step only: ${m.from} is not adjacent.`, ruleRef));
        leaving.set(m.from, (leaving.get(m.from) ?? 0) + m.count);
      }
    }
    for (const [from, n] of leaving) if (n > count(state, from, PIECE.troops)) out.push(at(from, "sweepTroops", `Only ${String(count(state, from, PIECE.troops))} Troops are here.`, ruleRef));
    return out;
  },
  cost: (ruleset, state, part, options) => (options.free ? 0 : part.locations.length * costPerSpace(ruleset, state)),
  execute(ctx, part, options) {
    const cost = costPerSpace(ctx.ruleset, ctx.state);
    for (const loc of part.locations) {
      if (!options.free) pay(ctx, FACTION.state, cost, ruleRef, loc);
      for (const m of asMoves(part.perLocation[loc]?.["moves"]) ?? []) {
        ctx.apply({ type: "movePieces", piece: PIECE.troops, state: null, toState: null, count: m.count, from: m.from, to: loc, ruleRef, assumptionRef: null });
      }
    }
    for (const loc of part.locations) {
      // PA-07: count pieces after the moves.
      const detectors = count(ctx.state, loc, PIECE.troops) + count(ctx.state, loc, PIECE.police) + count(ctx.state, loc, PIECE.guards);
      activate(ctx, loc, terrainRate(ctx.ruleset, loc, detectors), ruleRef, "PA-07");
    }
  },
};
