// setFlag (04 s5): set a structural switch.
import type { GameState } from "../types.ts";
import { entry, type EffectOf, type EffectResult } from "./common.ts";

export function setFlag(state: GameState, effect: EffectOf<"setFlag">): EffectResult {
  const before = Object.hasOwn(state.flags, effect.flag) ? (state.flags[effect.flag] ?? null) : null;
  return {
    state: { ...state, flags: { ...state.flags, [effect.flag]: effect.value } },
    entries: [entry(state, effect, "EffectApplied", { flag: effect.flag, before, after: effect.value })],
  };
}
