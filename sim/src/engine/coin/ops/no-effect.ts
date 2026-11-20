// Decision 18 (m-17; rules 3.1): each selected location must change, by the Operation or its
// Special Activity there. Callers compare the board before and after a dry run of the action.
import { canonicalJson } from "../../core/canonical.ts";
import type { GameState, LogEntry } from "../../core/types.ts";
import { EUROPE_SPACE, TRACK } from "./ids.ts";

export const NO_EFFECT = "locationNoEffect";

/**
 * Locations whose pieces, faces, markers and level (Europe: the Europe track) are the same in `after`
 * and that no piece entered or left in `entries`. Pieces that leave as others arrive change a space
 * even when its count and faces end the same (March A to B, B to C).
 */
export function unchangedLocations(before: GameState, after: GameState, locations: readonly string[], entries: readonly LogEntry[]): string[] {
  const moved = new Set(entries.flatMap((e) => (e.kind === "EffectApplied" && e.data["effect"] === "movePieces" ? [e.data["from"], e.data["to"]].filter((x) => typeof x === "string") : [])));
  const changed = (loc: string): boolean => moved.has(loc) || (loc === EUROPE_SPACE ? before.tracks[TRACK.europe] !== after.tracks[TRACK.europe] : canonicalJson(before.spaces[loc] ?? null) !== canonicalJson(after.spaces[loc] ?? null));
  return locations.filter((loc) => !changed(loc));
}

/** A dry run that rolled a die is not judged, so legality never shows a random result. */
export function rolled(entries: readonly LogEntry[]): boolean {
  return entries.some((e) => e.kind === "DieRolled");
}

export function noEffectMessage(loc: string): string {
  return `Nothing in ${loc} would change. Select only locations that the Operation or its Special Activity changes (rules 3.1).`;
}
