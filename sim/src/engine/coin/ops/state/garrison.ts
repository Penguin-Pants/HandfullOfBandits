// Garrison (research 06 s2.2): move up to 6 Police among domestic spaces (never into or out of
// Western Cities), then Activate in one space with Police. The plan's one location is the
// activation space; its `moves` list the Police moves. Limited Op: every move ends there.
import { param } from "../../../core/params.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler, type ActionPart } from "../action.ts";
import { activate, count, hasTag, pay, space, terrainRate } from "../common.ts";
import { FACTION, PIECE, TAG } from "../ids.ts";
import { asMoves, asString } from "../plan.ts";

const ruleRef = "06 s2.2";

function moves(part: ActionPart): { from: string; to: string | null; count: number }[] | null {
  const loc = part.locations[0];
  return loc === undefined ? null : asMoves(part.perLocation[loc]?.["moves"]);
}

export const garrison: ActionHandler = {
  id: "state.garrison",
  faction: FACTION.state,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    const target = part.locations[0];
    const list = moves(part);
    if (part.locations.length !== 1 || target === undefined) return [at(null, "garrisonOneSpace", "Garrison activates in one space: select it as the only location.", ruleRef)];
    if (list === null) return [at(target, "badMoves", "Moves must be [{from, to, count}].", ruleRef)];
    const required = asString(options.constraints["activationSpace"]);
    if (required !== null && target !== required) out.push(at(target, "eventConstraint", `The event requires Activation in ${required}.`, "05 s5"));
    const domestic = (id: string): boolean => space(ruleset, id)?.kind === "domestic" && !hasTag(ruleset, id, TAG.noLandLinks);
    const leaving = new Map<string, number>();
    let moved = 0;
    let arriving = 0;
    for (const m of list) {
      const to: string = m.to ?? target;
      if (!domestic(m.from) || !domestic(to)) out.push(at(to, "garrisonWhere", "Police move among domestic spaces, never into or out of Western Cities.", ruleRef));
      if (options.limited && to !== target) out.push(at(to, "limitedOneDestination", "A Limited Op moves every piece to one destination (05 s3.1).", "05 s3.1"));
      leaving.set(m.from, (leaving.get(m.from) ?? 0) + m.count);
      moved += m.count;
      if (to === target) arriving += m.count;
    }
    for (const [from, n] of leaving) if (n > count(state, from, PIECE.police)) out.push(at(from, "garrisonPolice", `Only ${String(count(state, from, PIECE.police))} Police are here.`, ruleRef));
    const max = param(ruleset, "garrison.maxPolice", "number");
    if (moved > max) out.push(at(null, "garrisonMax", `Move at most ${String(max)} Police.`, ruleRef));
    if (count(state, target, PIECE.police) - (leaving.get(target) ?? 0) + arriving === 0) out.push(at(target, "garrisonNeedsPolice", "Activation needs a space with Police.", ruleRef));
    return out;
  },
  cost: (ruleset, _state, _part, options) => (options.free ? 0 : param(ruleset, "garrison.cost", "number")),
  execute(ctx, part, options) {
    const target = part.locations[0] ?? "";
    if (!options.free) pay(ctx, FACTION.state, param(ctx.ruleset, "garrison.cost", "number"), ruleRef);
    for (const m of moves(part) ?? []) {
      ctx.apply({ type: "movePieces", piece: PIECE.police, state: null, toState: null, count: m.count, from: m.from, to: m.to ?? target, ruleRef, assumptionRef: null });
    }
    // PA-07: count pieces after the moves.
    const detectors = count(ctx.state, target, PIECE.police) + count(ctx.state, target, PIECE.guards);
    activate(ctx, target, terrainRate(ctx.ruleset, target, detectors), ruleRef, "PA-07");
  },
};
