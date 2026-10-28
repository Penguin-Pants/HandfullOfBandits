// Stop rule flags (research 12 s9; 05 s10; DEC-34). Rule 3: a harmful action raised its user's
// net margin. Rule 6 proxy: a faction's only legal choice was Pass on 3 cards in a row, for the
// second time in the game. Rule 4 is flagged at game end (victory.ts).
import type { Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import type { AnyCommand, FactionId, GameState, JsonObject, Ruleset } from "../core/types.ts";
import { derive } from "./derive.ts";
import { chooseOperationHandler } from "./ops/choose-operation.ts";
import { neighbors } from "../core/terms.ts";
import { actionHandlers } from "./ops/registry.ts";
import { BOX, legalBoxes } from "./sequence/ct.ts";

const ruleRef = "12 s9";

/** Net margin change for `faction`: its own change minus the opponents' (09 s7). */
export function netChange(ruleset: Ruleset, before: GameState, after: GameState, faction: FactionId): number {
  const a = derive(ruleset, before).margins;
  const b = derive(ruleset, after).margins;
  return Object.keys(b).reduce((sum, f) => sum + (f === faction ? 1 : -1) * ((b[f] ?? 0) - (a[f] ?? 0)), 0);
}

/** Rule 3 after a harmful action (06 s8 item 1). */
export function flagHarmful(ctx: Exec, action: string, faction: FactionId, before: GameState): void {
  const change = netChange(ctx.ruleset, before, ctx.state, faction);
  if (change > 0) ctx.log("StopRuleFlag", { rule: 3, action, faction, netChange: change }, ruleRef); // literal-ok: research 12 s9 stop rule number
}

/** Default one-location plans to probe for a legal non-Pass choice. */
function probes(ruleset: Ruleset, op: string, space: string): JsonObject[] {
  switch (op) {
    case "state.train":
      return [{ option: "place", troops: 1, police: 0 }, { option: "place", troops: 0, police: 1 }, { option: "guards", count: 1 }, { option: "base" }];
    case "pkk.rally":
      return [{ option: "place" }, { option: "flip" }];
    case "pkk.march":
      return neighbors(ruleset, space).flatMap((from) => [{ moves: [{ from, count: 1, face: "underground" }] }, { moves: [{ from, count: 1, face: "active" }] }]);
    default:
      return [{}];
  }
}

/** True when `faction` has a legal choice other than Pass now (05 s1 item 2, limited probe). */
export function hasNonPassChoice(ruleset: Ruleset, state: GameState, faction: FactionId): boolean {
  const boxes = legalBoxes(ruleset, state, faction);
  const card = state.deck.currentCard === null ? undefined : ruleset.cards[state.deck.currentCard];
  if (boxes.includes(BOX.event) && card?.type === "event" && card.encoded) return true;
  return legalOps(ruleset, state, faction).length > 0;
}

/** One-location Operations that are legal now, from default probe plans, in registry and space order. */
export function legalOps(ruleset: Ruleset, state: GameState, faction: FactionId, limit = 1): AnyCommand[] {
  const boxes = legalBoxes(ruleset, state, faction);
  const box = [BOX.limitedOp, BOX.opOnly, BOX.opSa].find((b) => boxes.includes(b));
  const found: AnyCommand[] = [];
  if (box === undefined) return found;
  for (const handler of Object.values(actionHandlers)) {
    if (handler.kind !== "op" || handler.faction !== faction) continue;
    for (const space of ruleset.spaces) {
      for (const choice of probes(ruleset, handler.id, space.id)) {
        const command: AnyCommand = { type: "ChooseOperation", faction, box, plan: { op: handler.id, locations: [space.id], perLocation: { [space.id]: choice }, sa: null, subActions: [] } };
        if (chooseOperationHandler.check(ruleset, state, command).length === 0) found.push(command);
        if (found.length >= limit) return found;
      }
    }
  }
  return found;
}

/** Rule 6 proxy: count Pass-only cards per faction (history), flag the second 3-card streak. */
export function notePassOnly(ctx: Exec, faction: FactionId, passOnly: boolean): void {
  const streakKey = `passOnly.streak.${faction}`;
  const countKey = `passOnly.streaks.${faction}`;
  const streak = passOnly ? (ctx.state.history[streakKey] ?? 0) + 1 : 0;
  const length = param(ctx.ruleset, "stopRule.passStreak", "number");
  const done = streak >= length;
  const streaks = (ctx.state.history[countKey] ?? 0) + (done ? 1 : 0);
  ctx.write((s) => ({ ...s, history: { ...s.history, [streakKey]: done ? 0 : streak, [countKey]: streaks } }));
  if (done && streaks === param(ctx.ruleset, "stopRule.passStreaks", "number")) ctx.log("StopRuleFlag", { rule: 6, faction, streaks }, ruleRef); // literal-ok: research 12 s9 stop rule number
}
