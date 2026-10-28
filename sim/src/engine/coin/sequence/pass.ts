// Pass (research 05 s3.2): no action on this card, the faction gains its pass income.
import type { CommandHandler, Effect, Ruleset } from "../../core/types.ts";
import { BOX, placeCylinder, sequenceViolations } from "./ct.ts";

const ruleRef = "05 s3.2";

function income(ruleset: Ruleset, faction: string): Effect[] {
  const track = ruleset.factions.find((f) => f.id === faction)?.resourcesTrack ?? null;
  const amount = ruleset.sequence.passIncome[faction] ?? 0;
  return track === null || amount === 0 ? [] : [{ type: "adjustTrack", track, delta: amount, ruleRef, assumptionRef: null }];
}

export const passHandler: CommandHandler = {
  ruleRef,
  check: (ruleset, state, command) => sequenceViolations(ruleset, state, command["faction"], BOX.pass),
  execute(ctx, command) {
    const placed = placeCylinder(ctx.state, String(command["faction"]), BOX.pass);
    ctx.write(() => placed.state);
    ctx.log(placed.entry.kind, placed.entry.data, placed.entry.ruleRef);
    ctx.apply(...income(ctx.ruleset, String(command["faction"])));
  },
};
