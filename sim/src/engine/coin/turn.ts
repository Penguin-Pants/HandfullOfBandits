// Turn flow after each accepted command (research 05 s2.2 steps 5 and 6).
import type { Exec } from "../core/exec.ts";
import { adjustEligibility, cardComplete } from "./sequence/ct.ts";

/** When both factions have acted on the card, adjust eligibility for the next card. */
export function afterCommand(ctx: Exec): void {
  if (!cardComplete(ctx.state)) return;
  const { state, entry } = adjustEligibility(ctx.ruleset, ctx.state);
  ctx.write(() => state);
  ctx.log(entry.kind, entry.data, entry.ruleRef);
}
