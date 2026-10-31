// Host posture helpers for PKK actions in external boxes (research 07 s5.1, 06 s4).
import type { GameState, Ruleset } from "../../core/types.ts";
import { count, space } from "./common.ts";
import { FACTION, FLAG_VACUUM, HOST_OF, OPTION, PIECE, POSTURE, SYRIA_BOX } from "./ids.ts";

/** Host posture of an external box, or null for a box with no host. */
export function postureOf(state: GameState, box: string): string | null {
  const track = HOST_OF[box];
  return track === undefined ? null : String(state.tracks[track]);
}

/** Rally may place Guerrillas in the box: Host or Tolerant (07 s5.1). */
export function rallyGuerrillasOpen(state: GameState, box: string): boolean {
  const p = postureOf(state, box);
  return p === POSTURE.host || p === POSTURE.tolerant;
}

/** Rally may place a Base in the box: Host, or Tolerant in KDP and PUK after Northern Iraq Vacuum. */
export function rallyBaseOpen(state: GameState, box: string): boolean {
  const p = postureOf(state, box);
  return p === POSTURE.host || (p === POSTURE.tolerant && box !== SYRIA_BOX && state.flags[FLAG_VACUUM] === true);
}

/** Guerrillas in a space, all faces. */
export function guerrillas(state: GameState, space: string): number {
  return count(state, space, PIECE.guerrilla);
}

/** State pieces in a space. */
export function statePieces(ruleset: Ruleset, state: GameState, space: string): number {
  return ruleset.pieces.filter((p) => p.faction === FACTION.state).reduce((sum, p) => sum + count(state, space, p.id), 0);
}

type Entry = "open" | "restricted" | "closed";

/** Entry rule for a destination: domestic spaces are open; boxes follow the host posture. */
export function entryToBox(ruleset: Ruleset, state: GameState, dest: string): Entry {
  if (space(ruleset, dest)?.kind !== "external") return "open";
  const posture = postureOf(state, dest);
  if (posture === POSTURE.host || posture === POSTURE.tolerant) return "open";
  if (posture === POSTURE.restricted) {
    if (dest !== SYRIA_BOX) return "restricted";
    const option = ruleset.scenarios[state.meta.scenarioId]?.options[OPTION.syriaMarchRestricted];
    return option === "deny" ? "closed" : "restricted";
  }
  return "closed";
}
