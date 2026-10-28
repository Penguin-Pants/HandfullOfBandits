// placeMarker (04 s5): one marker from supply onto a side. No supply: skip and log
// "supply exhausted" (PA-09). The Harm warning comes with victory terms in P1-09 (DEC-41).
import type { GameState, Ruleset } from "../types.ts";
import { addToSpace, checkFace, entry, find, type EffectOf, type EffectResult } from "./common.ts";

export function placeMarker(ruleset: Ruleset, state: GameState, effect: EffectOf<"placeMarker">): EffectResult {
  const marker = find(ruleset.markers, effect.marker, "marker");
  find(ruleset.spaces, effect.space, "space");
  const side = checkFace(marker.sides, effect.side, marker.id);
  const at = { marker: marker.id, space: effect.space, side };
  const supply = state.markerPools[marker.id] ?? 0;
  if (supply === 0) return { state, entries: [entry(state, effect, "EffectSkipped", { ...at, reason: "supply" }, "PA-09")] };
  const next = addToSpace(state, effect.space, "markers", marker.id, side, 1);
  return {
    state: { ...next, markerPools: { ...next.markerPools, [marker.id]: supply - 1 } },
    entries: [entry(state, effect, "EffectApplied", at)],
  };
}
