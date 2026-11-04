// ChooseEvent (research 05 s2.2 step 3, s5): the faction executes one side of the current card.
// `answers` hold its choices in execution order (PA-01, DEC-51).
import { createExec, PreviewStop, type Exec } from "../core/exec.ts";
import type { AnyCommand, CommandHandler, GameState, Ruleset, Violation } from "../core/types.ts";
import { AnswerNeeded, runEffects } from "./events.ts";
import { asList } from "./ops/plan.ts";
import { notePassOnly } from "./stop-rules.ts";
import { restraintWarningsOf } from "./ceasefire.ts";
import { BOX, placeCylinder, sequenceViolations } from "./sequence/ct.ts";

const ruleRef = "05 s5";
const SIDES = ["unshaded", "shaded"] as const;

function run(ctx: Exec, command: AnyCommand): void {
  const faction = String(command["faction"]);
  const side = SIDES.find((s) => s === command["side"]) ?? "unshaded";
  const card = ctx.state.deck.currentCard ?? "";
  notePassOnly(ctx, faction, false);
  const placed = placeCylinder(ctx.state, faction, BOX.event);
  ctx.write(() => placed.state);
  ctx.log(placed.entry.kind, { ...placed.entry.data, card, side }, placed.entry.ruleRef);
  const effects = ctx.ruleset.cards[card]?.[side]?.effects ?? [];
  runEffects({ ctx, faction, answers: asList(command["answers"]), ruleRef: `${card} ${side}` }, effects);
}

function check(ruleset: Ruleset, state: GameState, command: AnyCommand): Violation[] {
  const sequence = sequenceViolations(ruleset, state, command["faction"], BOX.event);
  if (sequence.length > 0) return sequence;
  const card = state.deck.currentCard === null ? undefined : ruleset.cards[state.deck.currentCard];
  const v = (code: string, message: string): Violation[] => [{ code, message, ruleRef, location: null }];
  if (card === undefined || !["event", "capability", "momentum"].includes(card.type)) return v("noEvent", "The current card has no Event to execute.");
  const side = SIDES.find((s) => s === command["side"]);
  if (side === undefined) return v("badSide", "Choose side unshaded or shaded.");
  const data = card[side];
  if (!card.encoded || data === null) return v("notEncoded", `${card.id} ${side} is not encoded.`);
  if (data.executors !== null && !data.executors.includes(String(command["faction"]))) return v("sideRestricted", "The PKK may not execute this side: it places a Closure Case, bans the legal party, removes Offices or moves Legal Space (05 s5 item 1).");
  if (command["answers"] !== undefined && !Array.isArray(command["answers"])) return v("badAnswer", "Answers must be a list.");
  // Dry run: finds a missing or bad answer; stops quietly at the first die roll (05 s4).
  const ctx = createExec(ruleset, state, true);
  try {
    run(ctx, command);
  } catch (e) {
    if (e instanceof AnswerNeeded) return [e.violation];
    if (!(e instanceof PreviewStop)) throw e;
  }
  return [];
}

/** Ceasefire warnings for free Event actions (07 s7.2; 05 s4 item 6), from the dry run. */
function warnings(ruleset: Ruleset, state: GameState, command: AnyCommand): Violation[] {
  const ctx = createExec(ruleset, state, true);
  try {
    run(ctx, command);
  } catch (e) {
    if (!(e instanceof PreviewStop) && !(e instanceof AnswerNeeded)) throw e;
  }
  return restraintWarningsOf(ctx.effects);
}

export const chooseEventHandler: CommandHandler = { ruleRef, check, execute: run, warnings };
