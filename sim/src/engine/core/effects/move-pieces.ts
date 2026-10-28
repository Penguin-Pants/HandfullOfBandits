// movePieces (04 s5): pieces keep their face, or land on `toState`. Moves what is present and what
// stacking allows.
import type { GameState, LogEntry, Ruleset } from "../types.ts";
import { addToSpace, checkFace, entry, find, sourceFaces, stackingRoom, type EffectOf, type EffectResult } from "./common.ts";

export function movePieces(ruleset: Ruleset, state: GameState, effect: EffectOf<"movePieces">): EffectResult {
  const piece = find(ruleset.pieces, effect.piece, "piece");
  find(ruleset.spaces, effect.from, "space");
  const toState = effect.toState === null ? null : checkFace(piece.states, effect.toState, piece.id);
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
    const arrive = toState ?? face;
    next = addToSpace(addToSpace(next, effect.from, "pieces", piece.id, face, -n), effect.to, "pieces", piece.id, arrive, n);
    entries.push(entry(state, effect, "EffectApplied", { piece: piece.id, from: effect.from, to: effect.to, face, arrive, count: n }));
    left -= n;
    room -= n;
  }
  if (left > 0) {
    const reason = present < effect.count ? "absent" : "stacking";
    entries.push(entry(state, effect, "EffectSkipped", { piece: piece.id, from: effect.from, to: effect.to, count: left, reason }));
  }
  return { state: next, entries };
}
