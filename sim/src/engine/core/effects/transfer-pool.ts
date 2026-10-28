// transferPool (04 s5; research 10 s6.1 Law 3175): pieces between Available and Out of Play.
import type { GameState, Ruleset } from "../types.ts";
import { addToPool, entry, find, type EffectOf, type EffectResult } from "./common.ts";

export function transferPool(ruleset: Ruleset, state: GameState, effect: EffectOf<"transferPool">): EffectResult {
  const piece = find(ruleset.pieces, effect.piece, "piece");
  const present = state.pools[piece.id]?.[effect.from] ?? 0;
  const count = effect.count === "all" ? present : Math.min(effect.count, present);
  const at = { piece: piece.id, from: effect.from, to: effect.to };
  const entries = [];
  let next = state;
  if (count > 0) {
    next = addToPool(addToPool(state, piece.id, effect.from, -count), piece.id, effect.to, count);
    entries.push(entry(state, effect, "EffectApplied", { ...at, count }));
  }
  if (effect.count !== "all" && count < effect.count) entries.push(entry(state, effect, "EffectSkipped", { ...at, count: effect.count - count, reason: "absent" }));
  return { state: next, entries };
}
