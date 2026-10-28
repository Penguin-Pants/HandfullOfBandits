// Turn flow (research 05 s2.2 steps 1, 5 and 6; 05 s5 item 7; CT 6.0).
import type { Exec } from "../core/exec.ts";
import { AnswerNeeded, runEffects } from "./events.ts";
import { PHASE } from "./phases.ts";
import { startRound } from "./propaganda/pipeline.ts";
import { adjustEligibility, cardComplete } from "./sequence/ct.ts";

const ruleRef = "05 s2.2";

/**
 * Reveal the next card: the top card of the first pile that has one. An Always line applies on
 * reveal (05 s5 item 7). A Propaganda card right after another is set aside (CT 6.0).
 */
export function revealNext(ctx: Exec): void {
  const { deck } = ctx.state;
  const index = deck.piles.findIndex((pile) => pile.length > 0);
  const card = index < 0 ? undefined : deck.piles[index]?.[0];
  const previous = deck.currentCard;
  if (card === undefined) {
    ctx.log("EffectSkipped", { effect: "revealCard", reason: "deckEmpty" }, ruleRef);
    return;
  }
  const data = ctx.ruleset.cards[card];
  const piles = deck.piles.map((pile, i) => (i === index ? pile.slice(1) : pile));
  const played = previous === null ? deck.played : [...deck.played, previous];
  if (data?.type === "propaganda" && previous !== null && ctx.ruleset.cards[previous]?.type === "propaganda") {
    ctx.write((s) => ({ ...s, deck: { ...s.deck, piles, setAside: [...s.deck.setAside, card] } }));
    ctx.log("CardRevealed", { card, pile: index, setAside: true }, "05 s6 (CT 6.0)");
    revealNext(ctx);
    return;
  }
  ctx.write((s) => ({ ...s, deck: { ...s.deck, piles, played, currentCard: card }, turn: { ...s.turn, cardIndex: s.turn.cardIndex + 1, phase: PHASE.card, step: 0 } }));
  ctx.log("CardRevealed", { card, pile: index, type: data?.type ?? "unknown" }, ruleRef);
  if (data?.type === "propaganda") startRound(ctx);
  if (data !== undefined && data.always.length > 0) {
    try {
      runEffects({ ctx, faction: ctx.state.initiative.firstEligible ?? "", answers: [], ruleRef: `${card} Always` }, data.always);
    } catch (e) {
      if (!(e instanceof AnswerNeeded)) throw e;
      ctx.log("EffectSkipped", { effect: "always", card, reason: "needsChoice" }, `${card} Always`);
    }
  }
}

/** When both factions have acted on the card, adjust eligibility and reveal the next card. */
export function afterCommand(ctx: Exec): void {
  if (!cardComplete(ctx.state)) return;
  const { state, entry } = adjustEligibility(ctx.ruleset, ctx.state);
  ctx.write(() => state);
  ctx.log(entry.kind, entry.data, entry.ruleRef);
  revealNext(ctx);
}
