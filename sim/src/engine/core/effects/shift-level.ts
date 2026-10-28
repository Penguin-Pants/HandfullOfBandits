// shiftLevel (04 s5): move a space level one step at a time (research 04 s4.1). A step stops at
// the end of the scale, at a marker that blocks the direction, or past the lowest marker cap
// in the space (DEC-39). The remaining steps are skipped with that reason.
import type { GameState, LogEntry, Ruleset } from "../types.ts";
import { entry, find, total, type EffectOf, type EffectResult } from "./common.ts";

export function shiftLevel(ruleset: Ruleset, state: GameState, effect: EffectOf<"shiftLevel">): EffectResult {
  const space = find(ruleset.spaces, effect.space, "space");
  const current = state.spaces[space.id];
  const before = current?.level ?? null;
  if (current === undefined || before === null || !space.hasSupportScale) {
    return { state, entries: [entry(state, effect, "EffectSkipped", { space: space.id, steps: effect.steps, reason: "noScale" })] };
  }
  const present = ruleset.markers.filter((m) => total(current.markers[m.id]) > 0);
  const cap = Math.min(ruleset.levelRange, ...present.map((m) => m.capsLevel ?? ruleset.levelRange));
  let level = before;
  let moved = 0;
  let reason: string | null = null;
  while (moved < effect.steps) {
    const toward = effect.direction === "neutral" ? -Math.sign(level) : effect.direction === "support" ? 1 : -1;
    const next = level + toward;
    if (toward === 0 || Math.abs(next) > ruleset.levelRange) reason = "end";
    else if (present.some((m) => m.blocks.includes(toward > 0 ? "support" : "opposition"))) reason = "block";
    else if (Math.abs(next) > cap && Math.abs(next) > Math.abs(level)) reason = "cap";
    if (reason !== null) break;
    level = next;
    moved++;
  }
  const entries: LogEntry[] = [];
  if (moved > 0) entries.push(entry(state, effect, "EffectApplied", { space: space.id, before, after: level, steps: moved }));
  if (reason !== null) entries.push(entry(state, effect, "EffectSkipped", { space: space.id, steps: effect.steps - moved, reason }));
  const next: GameState = { ...state, spaces: { ...state.spaces, [space.id]: { ...current, level } } };
  return { state: moved > 0 ? next : state, entries };
}
