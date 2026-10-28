// Pass (research 05 s3.2): no action on this card, the faction gains its pass income.
import type { CommandHandler, Effect } from "../../core/types.ts";
import { BOX, placeCylinder, sequenceViolations } from "./ct.ts";

const ruleRef = "05 s3.2";

export const passHandler: CommandHandler = {
  ruleRef,
  check: (ruleset, state, command) => sequenceViolations(ruleset, state, command["faction"], BOX.pass),
  resolve(ruleset, _state, command): readonly Effect[] {
    const faction = String(command["faction"]);
    const track = ruleset.factions.find((f) => f.id === faction)?.resourcesTrack ?? null;
    const income = ruleset.sequence.passIncome[faction] ?? 0;
    return track === null || income === 0 ? [] : [{ type: "adjustTrack", track, delta: income, ruleRef, assumptionRef: null }];
  },
  execute(ctx, command) {
    const placed = placeCylinder(ctx.state, String(command["faction"]), BOX.pass);
    ctx.write(() => placed.state);
    ctx.log(placed.entry.kind, placed.entry.data, placed.entry.ruleRef);
    ctx.apply(...passHandler.resolve(ctx.ruleset, ctx.state, command));
  },
};
