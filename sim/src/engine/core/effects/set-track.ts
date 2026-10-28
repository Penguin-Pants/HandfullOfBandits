// setTrack (04 s5): set a track value, only when the `ifEquals` guard holds. A numeric value past
// an end stops there (PA-04). An ordinal value must be a step ID.
import type { GameState, Ruleset } from "../types.ts";
import { entry, find, type EffectOf, type EffectResult } from "./common.ts";

export function setTrack(ruleset: Ruleset, state: GameState, effect: EffectOf<"setTrack">): EffectResult {
  const track = find(ruleset.tracks, effect.track, "track");
  const before = state.tracks[track.id] ?? null;
  if (effect.ifEquals !== null && before !== effect.ifEquals) {
    return { state, entries: [entry(state, effect, "EffectSkipped", { track: track.id, before, ifEquals: effect.ifEquals, reason: "guard" })] };
  }
  let after: number | string;
  if (track.kind === "numeric") {
    if (typeof effect.value !== "number") throw new RangeError(`Track "${track.id}" needs a number`);
    after = Math.min(track.max, Math.max(track.min, effect.value));
  } else {
    if (typeof effect.value !== "string" || !track.steps.includes(effect.value)) throw new RangeError(`Track "${track.id}" has no step "${String(effect.value)}"`);
    after = effect.value;
  }
  const clamped = after !== effect.value;
  return {
    state: { ...state, tracks: { ...state.tracks, [track.id]: after } },
    entries: [entry(state, effect, "EffectApplied", { track: track.id, before, after }, clamped ? "PA-04" : effect.assumptionRef)],
  };
}
