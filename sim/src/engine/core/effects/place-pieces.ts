// placePieces (04 s5): Available pieces onto a face. Places what supply and stacking allow (05 s7).
import { SINGLE_FACE } from "../state.ts";
import type { GameState, Ruleset } from "../types.ts";
import { addToPool, addToSpace, checkFace, entry, find, stackingRoom, type EffectOf, type EffectResult } from "./common.ts";

export function placePieces(ruleset: Ruleset, state: GameState, effect: EffectOf<"placePieces">): EffectResult {
  const piece = find(ruleset.pieces, effect.piece, "piece");
  const face = checkFace(piece.states, effect.state ?? piece.placedAs ?? SINGLE_FACE, piece.id);
  const available = state.pools[piece.id]?.available ?? 0;
  const room = stackingRoom(ruleset, state, effect.space, piece.id);
  const count = Math.min(effect.count, available, room);
  const at = { piece: piece.id, space: effect.space, face };
  const entries = [];
  let next = state;
  if (count > 0) {
    next = addToPool(addToSpace(state, effect.space, "pieces", piece.id, face, count), piece.id, "available", -count);
    entries.push(entry(state, effect, "EffectApplied", { ...at, count }));
  }
  if (count < effect.count) {
    const reason = available < room ? "supply" : "stacking";
    entries.push(entry(state, effect, "EffectSkipped", { ...at, count: effect.count - count, reason }));
  }
  return { state: next, entries };
}
