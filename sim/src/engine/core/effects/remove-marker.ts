// removeMarker (04 s5): one marker on a side back to supply.
import type { GameState, Ruleset } from "../types.ts";
import { addToSpace, checkFace, entry, find, type EffectOf, type EffectResult } from "./common.ts";

export function removeMarker(ruleset: Ruleset, state: GameState, effect: EffectOf<"removeMarker">): EffectResult {
  const marker = find(ruleset.markers, effect.marker, "marker");
  find(ruleset.spaces, effect.space, "space");
  const side = checkFace(marker.sides, effect.side, marker.id);
  const at = { marker: marker.id, space: effect.space, side };
  if ((state.spaces[effect.space]?.markers[marker.id]?.[side] ?? 0) === 0) {
    return { state, entries: [entry(state, effect, "EffectSkipped", { ...at, reason: "absent" })] };
  }
  const next = addToSpace(state, effect.space, "markers", marker.id, side, -1);
  return {
    state: { ...next, markerPools: { ...next.markerPools, [marker.id]: (next.markerPools[marker.id] ?? 0) + 1 } },
    entries: [entry(state, effect, "EffectApplied", at)],
  };
}
