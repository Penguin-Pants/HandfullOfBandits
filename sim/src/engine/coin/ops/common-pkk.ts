// Host posture helpers for PKK actions in external boxes (research 07 s5.1, 06 s4).
import type { GameState, Ruleset } from "../../core/types.ts";
import { count } from "./common.ts";
import { FACTION, FLAG_VACUUM, HOST_OF, PIECE, POSTURE, SYRIA_BOX } from "./ids.ts";

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
