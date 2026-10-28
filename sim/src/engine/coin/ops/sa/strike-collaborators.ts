// Strike Collaborators (research 06 s5.3): after Law 3175, in up to 2 spaces with an Underground
// Guerrilla and a Village Guard, pay 1 each, remove up to 2 Guards in total, Activate one
// Guerrilla and place a PKK Harm marker in each; Europe -1 once. Per location: `guards` to remove.
import { param } from "../../../core/params.ts";
import { SINGLE_FACE } from "../../../core/state.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler, type ActionPart } from "../action.ts";
import { activate, count, pay } from "../common.ts";
import { FACE, FACTION, FLAG, MARKER, PIECE, TRACK } from "../ids.ts";
import { asCount } from "../plan.ts";

const ruleRef = "06 s5.3";

function guards(part: ActionPart, loc: string): number | null {
  return asCount(part.perLocation[loc]?.["guards"], 1);
}

export const strikeCollaborators: ActionHandler = {
  id: "pkk.strike-collaborators",
  faction: FACTION.pkk,
  kind: "sa",
  ruleRef,
  accompanies: ["pkk.rally", "pkk.march", "pkk.coerce"],
  check(ruleset, state, part) {
    const out: Violation[] = [];
    if (state.flags[FLAG.law3175] !== true) out.push(at(null, "strikeLaw", "Strike Collaborators needs the Law 3175 event (06 s5.3).", ruleRef));
    const maxSpaces = param(ruleset, "strike.maxSpaces", "number");
    if (part.locations.length > maxSpaces) out.push(at(null, "strikeSpaces", `Select at most ${String(maxSpaces)} spaces.`, ruleRef));
    let total = 0;
    for (const loc of part.locations) {
      const n = guards(part, loc);
      if (count(state, loc, PIECE.guerrilla, FACE.underground) === 0 || count(state, loc, PIECE.guards) === 0) {
        out.push(at(loc, "strikeWhere", "Strike Collaborators needs an Underground Guerrilla and a Village Guard.", ruleRef));
      }
      if (n === null || n > count(state, loc, PIECE.guards)) out.push(at(loc, "strikeGuards", "Not that many Guards here.", ruleRef));
      total += n ?? 0;
    }
    const max = param(ruleset, "strike.maxGuards", "number");
    if (total > max) out.push(at(null, "strikeGuards", `Remove at most ${String(max)} Guards in total.`, ruleRef));
    return out;
  },
  cost: (ruleset, _state, part) => part.locations.length * param(ruleset, "strike.costPerSpace", "number"),
  execute(ctx, part) {
    for (const loc of part.locations) {
      pay(ctx, FACTION.pkk, param(ctx.ruleset, "strike.costPerSpace", "number"), ruleRef, loc);
      const n = guards(part, loc) ?? 0;
      if (n > 0) ctx.apply({ type: "removePieces", piece: PIECE.guards, state: null, count: n, space: loc, to: "available", ruleRef, assumptionRef: null });
      activate(ctx, loc, 1, ruleRef);
      ctx.apply({ type: "placeMarker", marker: MARKER.pkkHarm, space: loc, side: SINGLE_FACE, ruleRef, assumptionRef: null });
    }
    if (part.locations.length > 0) ctx.apply({ type: "adjustTrack", track: TRACK.europe, delta: -param(ctx.ruleset, "strike.europeLoss", "number"), ruleRef, assumptionRef: null });
  },
};
