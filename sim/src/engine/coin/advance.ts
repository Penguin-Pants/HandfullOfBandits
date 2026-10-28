// Advance (05 s3): move the game on when no choice is open. In setup it reveals the first card
// (research 10 s1 step 6); in a Propaganda round it runs the current phase with no choice.
import type { CommandHandler } from "../core/types.ts";
import { PHASE } from "./phases.ts";
import { advancePropaganda, propagandaViolations } from "./propaganda/pipeline.ts";
import { revealNext } from "./turn.ts";

const ruleRef = "05 s3";

export const advanceHandler: CommandHandler = {
  ruleRef,
  check(ruleset, state) {
    if (state.turn.phase === PHASE.setup) return [];
    if (state.turn.phase === PHASE.propaganda) return propagandaViolations(ruleset, state, null);
    return [{ code: "nothingToAdvance", message: `Nothing to advance in phase "${state.turn.phase}". Choose an action.`, ruleRef, location: null }];
  },
  execute(ctx) {
    if (ctx.state.turn.phase === PHASE.propaganda) advancePropaganda(ctx);
    else revealNext(ctx);
  },
};
