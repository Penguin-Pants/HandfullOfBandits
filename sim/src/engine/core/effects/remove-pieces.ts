// removePieces (04 s5): pieces from a space to a pool. Removes what is present.
import type { GameState, LogEntry, Ruleset } from "../types.ts";
import { addToPool, addToSpace, entry, find, sourceFaces, type EffectOf, type EffectResult } from "./common.ts";

export function removePieces(ruleset: Ruleset, state: GameState, effect: EffectOf<"removePieces">): EffectResult {
  const piece = find(ruleset.pieces, effect.piece, "piece");
  find(ruleset.spaces, effect.space, "space");
  const entries: LogEntry[] = [];
  let next = state;
  let left = effect.count;
  for (const face of sourceFaces(piece.states, effect.state, piece.id)) {
    const n = Math.min(left, next.spaces[effect.space]?.pieces[piece.id]?.[face] ?? 0);
    if (n === 0) continue;
    next = addToPool(addToSpace(next, effect.space, "pieces", piece.id, face, -n), piece.id, effect.to, n);
    entries.push(entry(state, effect, "EffectApplied", { piece: piece.id, space: effect.space, face, count: n, to: effect.to }));
    left -= n;
  }
  if (left > 0) entries.push(entry(state, effect, "EffectSkipped", { piece: piece.id, space: effect.space, count: left, reason: "absent" }));
  return { state: next, entries };
}
