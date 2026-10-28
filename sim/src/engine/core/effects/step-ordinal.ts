// stepOrdinal (04 s5): move an ordinal track along its steps. Steps past an end are lost (PA-04).
import type { GameState, Ruleset } from "../types.ts";
import { entry, find, type EffectOf, type EffectResult } from "./common.ts";

export function stepOrdinal(ruleset: Ruleset, state: GameState, effect: EffectOf<"stepOrdinal">): EffectResult {
  const track = find(ruleset.tracks, effect.track, "track");
  if (track.kind !== "ordinal") throw new RangeError(`stepOrdinal needs an ordinal track, got "${track.id}"`);
  const before = state.tracks[track.id];
  const index = track.steps.indexOf(String(before));
  if (typeof before !== "string" || index === -1) throw new RangeError(`Track "${track.id}" has no step value`);
  const wanted = index + (effect.direction === "next" ? effect.steps : -effect.steps);
  const to = Math.min(track.steps.length - 1, Math.max(0, wanted));
  const after = track.steps[to] ?? before;
  const lost = Math.abs(wanted - to);
  return {
    state: { ...state, tracks: { ...state.tracks, [track.id]: after } },
    entries: [entry(state, effect, "EffectApplied", { track: track.id, before, after, lost }, lost > 0 ? "PA-04" : effect.assumptionRef)],
  };
}
