// adjustTrack (04 s5) for numeric tracks. A change past an end stops there and the excess is
// lost (PA-04). A loss past the low end of a track with `overflow` costs `cost` per unpaid point
// on the overflow track instead; what that track cannot pay is lost (research 04 s3.2, DEC-41).
import type { GameState, LogEntry, Ruleset } from "../types.ts";
import { entry, find, type EffectOf, type EffectResult } from "./common.ts";

function numericValue(state: GameState, id: string): number {
  const value = state.tracks[id];
  if (typeof value !== "number") throw new RangeError(`Track "${id}" has no numeric value`);
  return value;
}

export function adjustTrack(ruleset: Ruleset, state: GameState, effect: EffectOf<"adjustTrack">): EffectResult {
  const track = find(ruleset.tracks, effect.track, "track");
  if (track.kind !== "numeric") throw new RangeError(`adjustTrack needs a numeric track, got "${track.id}"`);
  const before = numericValue(state, track.id);
  const raw = before + effect.delta;
  const after = Math.min(track.max, Math.max(track.min, raw));
  const lost = Math.abs(raw - after);
  let next: GameState = { ...state, tracks: { ...state.tracks, [track.id]: after } };
  const entries: LogEntry[] = [];
  const overflow = raw < track.min ? track.overflow : null;
  if (overflow === null) {
    entries.push(entry(state, effect, "EffectApplied", { track: track.id, before, after, lost }, lost > 0 ? "PA-04" : effect.assumptionRef));
    return { state: next, entries };
  }
  entries.push(entry(state, effect, "EffectApplied", { track: track.id, before, after, lost: 0 }));
  const target = find(ruleset.tracks, overflow.track, "track");
  if (target.kind !== "numeric") throw new RangeError(`Overflow track "${target.id}" is not numeric`);
  const from = numericValue(next, target.id);
  const cost = lost * overflow.cost;
  const paid = Math.min(cost, from - target.min);
  next = { ...next, tracks: { ...next.tracks, [target.id]: from - paid } };
  entries.push(
    entry(state, effect, "EffectApplied", { effect: "overflow", track: target.id, unpaid: lost, cost, before: from, after: from - paid, lost: cost - paid }),
  );
  return { state: next, entries };
}
