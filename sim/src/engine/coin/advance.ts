// Advance (05 s3): move the game on when no choice is open. In setup it reveals the first card
// (research 10 s1 step 6). Propaganda phases come with P2-10.
import type { CommandHandler } from "../core/types.ts";
import { PHASE } from "./phases.ts";
import { revealNext } from "./turn.ts";

const ruleRef = "05 s3";

export const advanceHandler: CommandHandler = {
  ruleRef,
  check(_ruleset, state) {
    if (state.turn.phase === PHASE.setup) return [];
    return [{ code: "nothingToAdvance", message: `Nothing to advance in phase "${state.turn.phase}". Choose an action.`, ruleRef, location: null }];
  },
  execute(ctx) {
    revealNext(ctx);
  },
};
