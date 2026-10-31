// Lasting card effects (research 05 s5 items 5 and 6). Values remain package data.
import type { Exec } from "./exec.ts";
import type { GameState, Modifier } from "./types.ts";
export function hasModifier(state: GameState, id: string): boolean { return state.modifiers.some(m => m.id === id); }
export function modifierLimit(state: GameState, id: string, key: string, fallback: number): number {
  const n = state.modifiers.find(m => m.id === id)?.params[key];
  return typeof n === "number" && Number.isSafeInteger(n) ? n : fallback;
}
export function addModifier(ctx: Exec, modifier: Modifier): void {
  if (!Object.hasOwn(ctx.ruleset.cards, modifier.sourceCard)) throw new RangeError(`Unknown modifier source card ${modifier.sourceCard}`);
  ctx.write(s => ({...s, modifiers: [...s.modifiers.filter(m => m.id !== modifier.id), modifier]}));
  ctx.log("EffectApplied", {effect: "addModifier", id: modifier.id, card: modifier.sourceCard, duration: modifier.duration, params: modifier.params}, "05 s5");
}
export function discardMomentum(ctx: Exec): void {
  const discarded = ctx.state.modifiers.filter(m => m.duration === "untilReset");
  ctx.write(s => ({...s, modifiers: s.modifiers.filter(m => m.duration === "game")}));
  for (const m of discarded) ctx.log("EffectApplied", {effect: "discardMomentum", modifier: m.id, card: m.sourceCard}, "05 s6.8");
}
