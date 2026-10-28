// flipMarker (04 s5): turn one marker in a space to `side`, from the first other side present.
import type { GameState, Ruleset } from "../types.ts";
import { addToSpace, checkFace, entry, faceKeys, find, type EffectOf, type EffectResult } from "./common.ts";

export function flipMarker(ruleset: Ruleset, state: GameState, effect: EffectOf<"flipMarker">): EffectResult {
  const marker = find(ruleset.markers, effect.marker, "marker");
  find(ruleset.spaces, effect.space, "space");
  const to = checkFace(marker.sides, effect.side, marker.id);
  const faces = state.spaces[effect.space]?.markers[marker.id] ?? {};
  const from = faceKeys(marker.sides).find((side) => side !== to && (faces[side] ?? 0) > 0);
  if (from === undefined) {
    return { state, entries: [entry(state, effect, "EffectSkipped", { marker: marker.id, space: effect.space, side: to, reason: "absent" })] };
  }
  const next = addToSpace(addToSpace(state, effect.space, "markers", marker.id, from, -1), effect.space, "markers", marker.id, to, 1);
  return { state: next, entries: [entry(state, effect, "EffectApplied", { marker: marker.id, space: effect.space, from, to })] };
}
