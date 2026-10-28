// Upkeep phase (research 05 s6.3): the State pays 1 per 2 Village Guards on the map, round up.
// If it cannot pay in full it removes Guards of its choice until the rest are paid for:
// choice `{removeGuards: {space: n}}`.
import { param } from "../../core/params.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";
import { count, pay, resources } from "../ops/common.ts";
import { FACTION, PIECE } from "../ops/ids.ts";
import { asCount, asObject } from "../ops/plan.ts";
import { violation, type PropagandaPhase } from "./phase.ts";

const ruleRef = "05 s6.3";

function guards(ruleset: Ruleset, state: GameState): number {
  return ruleset.spaces.reduce((sum, s) => sum + count(state, s.id, PIECE.guards), 0);
}

function due(ruleset: Ruleset, n: number): number {
  return Math.ceil(n / param(ruleset, "upkeep.guardsPerResource", "number"));
}

function removals(choice: JsonObject | null): Map<string, number> | null {
  const o = asObject(choice?.["removeGuards"] ?? {});
  if (o === null) return null;
  const out = new Map<string, number>();
  for (const [space, v] of Object.entries(o)) {
    const n = asCount(v);
    if (n === null) return null;
    out.set(space, n);
  }
  return out;
}

export const upkeepPhase: PropagandaPhase = {
  id: "upkeep",
  ruleRef,
  check(ruleset, state, choice) {
    const remove = removals(choice);
    if (remove === null) return [violation("badChoice", "removeGuards must map spaces to counts.", ruleRef)];
    const out: Violation[] = [];
    let removed = 0;
    for (const [space, n] of remove) {
      if (n > count(state, space, PIECE.guards)) out.push(violation("upkeepGuards", `Not that many Guards in ${space}.`, ruleRef, space));
      removed += n;
    }
    const owed = due(ruleset, guards(ruleset, state)) > resources(ruleset, state, FACTION.state);
    if (removed > 0 && !owed) out.push(violation("upkeepPaid", "The State can pay upkeep in full, so it must pay and keep its Guards.", ruleRef));
    const left = guards(ruleset, state) - removed;
    if (due(ruleset, left) > resources(ruleset, state, FACTION.state)) {
      out.push({ ...violation("needsAnswer", `The State cannot pay upkeep for ${String(left)} Guards. Remove Guards until it can.`, ruleRef), question: { kind: "spaces", prompt: "Remove Guards (removeGuards: {space: count})", options: ruleset.spaces.filter((s) => count(state, s.id, PIECE.guards) > 0).map((s) => s.id), min: 0, max: left } });
    }
    return out;
  },
  run(ctx, choice) {
    for (const [space, n] of removals(choice) ?? new Map<string, number>()) {
      if (n > 0) ctx.apply({ type: "removePieces", piece: PIECE.guards, state: null, count: n, space, to: "available", ruleRef, assumptionRef: null });
    }
    pay(ctx, FACTION.state, due(ctx.ruleset, guards(ctx.ruleset, ctx.state)), ruleRef);
  },
};
