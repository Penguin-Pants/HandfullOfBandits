// setPieceState (04 s5): flip pieces in a space from one state to another.
import type { GameState, LogEntry, Ruleset } from "../types.ts";
import { addToSpace, checkFace, entry, find, type EffectOf, type EffectResult } from "./common.ts";

export function setPieceState(ruleset: Ruleset, state: GameState, effect: EffectOf<"setPieceState">): EffectResult {
  const piece = find(ruleset.pieces, effect.piece, "piece");
  find(ruleset.spaces, effect.space, "space");
  const from = checkFace(piece.states, effect.from, piece.id);
  const to = checkFace(piece.states, effect.to, piece.id);
  const present = state.spaces[effect.space]?.pieces[piece.id]?.[from] ?? 0;
  const wanted = effect.count === "all" ? present : effect.count;
  const n = Math.min(wanted, present);
  const at = { piece: piece.id, space: effect.space, from, to };
  const entries: LogEntry[] = [];
  let next = state;
  if (n > 0) {
    next = addToSpace(addToSpace(state, effect.space, "pieces", piece.id, from, -n), effect.space, "pieces", piece.id, to, n);
    entries.push(entry(state, effect, "EffectApplied", { ...at, count: n }));
  }
  if (n < wanted) entries.push(entry(state, effect, "EffectSkipped", { ...at, count: wanted - n, reason: "absent" }));
  return { state: next, entries };
}
