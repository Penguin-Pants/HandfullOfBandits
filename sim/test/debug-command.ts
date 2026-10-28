// Test-only command `AdjustTrackDebug` (11 P1-10). Production code never registers it.
import type { CommandHandler, Effect, Violation } from "../src/engine/core/types.ts";

const ruleRef = "debug.adjustTrack";

export const adjustTrackDebug: CommandHandler = {
  ruleRef,
  check(ruleset, _state, command) {
    const { track, delta } = command;
    const violations: Violation[] = [];
    if (!ruleset.tracks.some((t) => t.id === track && t.kind === "numeric")) {
      violations.push({ code: "unknownTrack", message: `"${String(track)}" is not a numeric track.`, ruleRef, location: null });
    }
    if (!Number.isSafeInteger(delta)) {
      violations.push({ code: "badDelta", message: `Delta "${String(delta)}" is not an integer.`, ruleRef, location: null });
    }
    return violations;
  },
  resolve(_ruleset, _state, command): readonly Effect[] {
    const { track, delta } = command;
    return [{ type: "adjustTrack", track: String(track), delta: Number(delta), ruleRef, assumptionRef: null }];
  },
};
