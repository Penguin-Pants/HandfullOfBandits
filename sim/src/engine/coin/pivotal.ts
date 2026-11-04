// Pivotal window and play (05 s4; 08 s4; approved text docs/prototype/31, DEC-67). A held card is
// offered from its earliest Campaign when its precondition holds. ARGK Formed allocates its
// recruits with `placements` (P3a-05); the other Pivotals run their card effects with `answers`.
import { createExec, PreviewStop, type Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import { matches } from "../core/terms.ts";
import type { AnyCommand, CardId, CommandHandler, GameState, Ruleset, Violation } from "../core/types.ts";
import { restraintWarningsOf } from "./ceasefire.ts";
import { control } from "./derive.ts";
import { AnswerNeeded, runEffects } from "./events.ts";
import { count } from "./ops/common.ts";
import { FACE, PIECE } from "./ops/ids.ts";
import { asList, asObject } from "./ops/plan.ts";
import { BOX, placeCylinder } from "./sequence/ct.ts";
import { notePassOnly } from "./stop-rules.ts";
const ruleRef = "05 s4";
const ARGK = "DK-015";

function campaignReached(r: Ruleset, s: GameState, card: CardId): boolean {
  const campaigns = param(r, "campaign.order", "list");
  return campaigns.indexOf(s.turn.campaign ?? "") >= campaigns.indexOf(r.cards[card]?.campaign ?? "");
}

function preconditionMet(r: Ruleset, s: GameState, card: CardId): boolean {
  const pre = r.cards[card]?.precondition ?? null;
  return pre === null || matches({ ruleset: r, state: s, control: control(r, s), selected: null }, r.spaces[0]?.id ?? "", pre.if);
}

/** Why `faction` may not play `card` now (05 s4 steps 1 and 2), or nothing. */
function refusal(r: Ruleset, s: GameState, faction: string, card: CardId): Violation[] {
  const data = r.cards[card];
  const fail = (code: string, message: string): Violation[] => [{ code, message, ruleRef, location: null }];
  if (data?.type !== "pivotal" || !data.encoded || !(s.hands[faction] ?? []).includes(card)) return fail("pivotalPriority", "Only the faction in the open Pivotal window may play its eligible card.");
  if (!campaignReached(r, s, card)) return fail("pivotalCampaign", `${data.title} is playable from Campaign ${data.campaign}.`);
  if (!preconditionMet(r, s, card)) return fail("pivotalPrecondition", `${data.title} needs: ${data.precondition?.text ?? ""}.`);
  return [];
}

function eligible(r: Ruleset, s: GameState, faction: string): CardId[] {
  return (s.hands[faction] ?? []).filter((card) => refusal(r, s, faction, card).length === 0);
}

/** Re-offer each card, Second Eligible first, after its Always line. */
export function openPivotal(ctx: Exec): void {
  const s = ctx.state;
  if (s.ended !== null || s.turn.phase !== "card" || s.initiative.actedThisCard.length > 0 || ctx.ruleset.cards[s.deck.currentCard ?? ""]?.type === "pivotal") return;
  const faction = [s.initiative.secondEligible, s.initiative.firstEligible].find(f => f !== null && s.history[`pivotal.declined.${f}`] !== s.turn.cardIndex && eligible(ctx.ruleset, s, f).length > 0);
  if (faction === undefined || faction === null) return;
  const cards = eligible(ctx.ruleset, s, faction);
  const offers = cards.map((card) => (card === ARGK ? { card, maxPlace: param(ctx.ruleset, "argk.maxPlace", "number") } : { card }));
  const pending = {id: `pivotal-${String(s.turn.cardIndex)}-${faction}`, faction, prompt: "Play a Pivotal Event instead of this card, or decline for this card?", answers: ["decline", ...offers], ruleRef};
  ctx.write(state => ({...state, pending, turn: {...state.turn, phase: "pivotal"}}));
  ctx.log("DecisionOpened", {decisionId: pending.id, faction, cards}, ruleRef);
}

/** ARGK Formed (DK-015): place up to the limit at PKK Bases, flip at every Base (DEC-55), Resources. */
function argk(ctx: Exec, c: AnyCommand): void {
  const ref = `${ruleRef}; ${ARGK}`;
  for (const [id, n] of Object.entries(asObject(c["placements"]) ?? {})) if (Number(n) > 0) ctx.apply({type: "placePieces", piece: PIECE.guerrilla, state: FACE.underground, count: Number(n), space: id, ruleRef: ref, assumptionRef: null});
  for (const s of ctx.ruleset.spaces) if (count(ctx.state, s.id, PIECE.pkkBase) > 0) ctx.apply({type: "setPieceState", piece: PIECE.guerrilla, space: s.id, from: FACE.active, to: FACE.underground, count: "all", ruleRef: ref, assumptionRef: null});
  ctx.apply({type: "adjustTrack", track: "resources.pkk", delta: param(ctx.ruleset, "argk.resources", "number"), ruleRef: ref, assumptionRef: null});
}

function execute(ctx: Exec, c: AnyCommand): void {
  const original = ctx.state.deck.currentCard;
  const faction = String(c["faction"]);
  const card = String(c["card"]);
  const other = faction === ctx.state.initiative.firstEligible ? ctx.state.initiative.secondEligible : ctx.state.initiative.firstEligible;
  ctx.write(s => ({...s, pending: null, turn: {...s.turn, phase: "card"}, hands: {...s.hands, [faction]: (s.hands[faction] ?? []).filter(id => id !== card)}, deck: {...s.deck, currentCard: card, played: original === null ? s.deck.played : [...s.deck.played, original]}, initiative: {...s.initiative, firstEligible: faction, secondEligible: other}}));
  const placed = placeCylinder(ctx.state, faction, BOX.event);
  ctx.write(() => placed.state);
  ctx.log("ChoiceMade", {faction, card, replaced: original, box: BOX.event}, ruleRef);
  notePassOnly(ctx, faction, false);
  if (card === ARGK) argk(ctx, c);
  else runEffects({ ctx, faction, answers: asList(c["answers"]), ruleRef: `${card} Pivotal` }, ctx.ruleset.cards[card]?.unshaded?.effects ?? []);
}

/** Dry run on a preview: the first missing or bad answer, and the ceasefire effects. */
function dryRun(r: Ruleset, s: GameState, c: AnyCommand): { violations: Violation[]; ctx: Exec } {
  const ctx = createExec(r, s, true);
  try {
    execute(ctx, c);
  } catch (e) {
    if (e instanceof AnswerNeeded) return { violations: [e.violation], ctx };
    if (!(e instanceof PreviewStop)) throw e;
  }
  return { violations: [], ctx };
}

export const playPivotalHandler: CommandHandler = {
  ruleRef,
  check(r, s, c) {
    const faction = String(c["faction"]);
    if (s.turn.phase !== "pivotal" || faction !== s.pending?.faction) return [{code: "pivotalPriority", message: "Only the faction in the open Pivotal window may play its eligible card.", ruleRef, location: null}];
    const card = String(c["card"]);
    const refused = refusal(r, s, faction, card);
    if (refused.length > 0) return refused;
    if (card === ARGK) {
      const placements = asObject(c["placements"]);
      if (placements === null || Object.entries(placements).some(([id, n]) => typeof n !== "number" || !Number.isSafeInteger(n) || n < 0 || count(s, id, PIECE.pkkBase) === 0) || Object.values(placements).reduce<number>((n, v) => n + Number(v), 0) > param(r, "argk.maxPlace", "number")) return [{code: "pivotalPlacements", message: "Allocate up to the ARGK limit among spaces with PKK Bases.", ruleRef, location: null}];
      return [];
    }
    if (c["answers"] !== undefined && !Array.isArray(c["answers"])) return [{code: "badAnswer", message: "Answers must be a list.", ruleRef, location: null}];
    return dryRun(r, s, c).violations;
  },
  execute,
  /** Free Pivotal actions count for the ceasefire table (07 s7.2; DEC-66). */
  warnings: (r, s, c) => restraintWarningsOf(dryRun(r, s, c).ctx.effects),
};

export const pivotalDecisionHandler: CommandHandler = {
  ruleRef,
  check: (_r, s, c) => s.turn.phase === "pivotal" && c["decisionId"] === s.pending?.id && c["answer"] === "decline" ? [] : [{code: "pivotalAnswer", message: "Decline the current Pivotal window, or play its card.", ruleRef, location: null}],
  execute(ctx) {
    const pending = ctx.state.pending;
    if (pending === null) throw new Error("No Pivotal decision");
    ctx.write(s => ({...s, pending: null, turn: {...s.turn, phase: "card"}, history: {...s.history, [`pivotal.declined.${pending.faction}`]: s.turn.cardIndex}}));
    ctx.log("DecisionAnswered", {decisionId: pending.id, answer: "decline"}, ruleRef);
    openPivotal(ctx);
  },
};
