// movePieces (04 s5): pieces keep their face. Moves what is present and what stacking allows.
import type { GameState, LogEntry, Ruleset } from "../types.ts";
import { addToSpace, entry, find, sourceFaces, stackingRoom, type EffectOf, type EffectResult } from "./common.ts";

export function movePieces(ruleset: Ruleset, state: GameState, effect: EffectOf<"movePieces">): EffectResult {
  const piece = find(ruleset.pieces, effect.piece, "piece");
  find(ruleset.spaces, effect.from, "space");
  const entries: LogEntry[] = [];
  let next = state;
  let left = effect.count;
  let room = stackingRoom(ruleset, state, effect.to, piece.id);
  let present = 0;
  for (const face of sourceFaces(piece.states, effect.state, piece.id)) {
    const here = next.spaces[effect.from]?.pieces[piece.id]?.[face] ?? 0;
    present += here;
    const n = Math.min(left, here, room);
    if (n === 0) continue;
    next = addToSpace(addToSpace(next, effect.from, "pieces", piece.id, face, -n), effect.to, "pieces", piece.id, face, n);
    entries.push(entry(state, effect, "EffectApplied", { piece: piece.id, from: effect.from, to: effect.to, face, count: n }));
    left -= n;
    room -= n;
  }
  if (left > 0) {
    const reason = present < effect.count ? "absent" : "stacking";
    entries.push(entry(state, effect, "EffectSkipped", { piece: piece.id, from: effect.from, to: effect.to, count: left, reason }));
  }
  return { state: next, entries };
}
