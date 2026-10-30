// Pivotal interruption (05 s4; 08 s4). Phase 3a enables ARGK only (PA-17).
import { param } from "../core/params.ts";
import type { CommandHandler, GameState, Ruleset } from "../core/types.ts";
import { count } from "./ops/common.ts";
import { FACE, FACTION, PIECE } from "./ops/ids.ts";
import { asObject } from "./ops/plan.ts";
import { BOX, placeCylinder } from "./sequence/ct.ts";
import { notePassOnly } from "./stop-rules.ts";
import type { Exec } from "../core/exec.ts";
const ruleRef = "05 s4; DK-015";
const ARGK = "DK-015";

function eligible(r: Ruleset, s: GameState, faction: string): boolean {
  if (faction !== FACTION.pkk || !(s.hands[faction] ?? []).includes(ARGK) || !r.cards[ARGK]?.encoded) return false;
  const domestic = r.spaces.filter(x => x.kind === "domestic");
  return domestic.reduce((n, x) => n + count(s, x.id, PIECE.guerrilla), 0) >= param(r, "argk.minGuerrillas", "number") && domestic.reduce((n, x) => n + count(s, x.id, PIECE.pkkBase), 0) >= param(r, "argk.minBases", "number");
}

/** Re-offer each card, Second Eligible first, after its Always line. */
export function openPivotal(ctx: Exec): void {
  const s = ctx.state;
  if (s.ended !== null || s.turn.phase !== "card" || s.initiative.actedThisCard.length > 0 || ctx.ruleset.cards[s.deck.currentCard ?? ""]?.type === "pivotal") return;
  const faction = [s.initiative.secondEligible, s.initiative.firstEligible].find(f => f !== null && s.history[`pivotal.declined.${f}`] !== s.turn.cardIndex && eligible(ctx.ruleset, s, f));
  if (faction === undefined || faction === null) return;
  const pending = {id: `pivotal-${String(s.turn.cardIndex)}-${faction}`, faction, prompt: "Play ARGK Formed instead of this card, or decline for this card?", answers: ["decline", {card: ARGK, maxPlace: param(ctx.ruleset, "argk.maxPlace", "number")}], ruleRef};
  ctx.write(state => ({...state, pending, turn: {...state.turn, phase: "pivotal"}}));
  ctx.log("DecisionOpened", {decisionId: pending.id, faction, card: ARGK}, ruleRef);
}

export const playPivotalHandler: CommandHandler = {
  ruleRef,
  check(r, s, c) {
    const fail = (code: string, message: string) => [{code, message, ruleRef, location: null}];
    if (s.turn.phase !== "pivotal" || c["faction"] !== s.pending?.faction || c["card"] !== ARGK || !eligible(r, s, String(c["faction"]))) return fail("pivotalPriority", "Only the faction in the open Pivotal window may play its eligible card.");
    const placements = asObject(c["placements"]);
    if (placements === null || Object.entries(placements).some(([id, n]) => typeof n !== "number" || !Number.isSafeInteger(n) || n < 0 || count(s, id, PIECE.pkkBase) === 0) || Object.values(placements).reduce<number>((n, v) => n + Number(v), 0) > param(r, "argk.maxPlace", "number")) return fail("pivotalPlacements", "Allocate up to the ARGK limit among spaces with PKK Bases.");
    return [];
  },
  execute(ctx, c) {
    const original = ctx.state.deck.currentCard;
    const faction = String(c["faction"]);
    const other = faction === ctx.state.initiative.firstEligible ? ctx.state.initiative.secondEligible : ctx.state.initiative.firstEligible;
    ctx.write(s => ({...s, pending: null, turn: {...s.turn, phase: "card"}, hands: {...s.hands, [faction]: (s.hands[faction] ?? []).filter(id => id !== ARGK)}, deck: {...s.deck, currentCard: ARGK, played: original === null ? s.deck.played : [...s.deck.played, original]}, initiative: {...s.initiative, firstEligible: faction, secondEligible: other}}));
    const placed = placeCylinder(ctx.state, faction, BOX.event);
    ctx.write(() => placed.state);
    ctx.log("ChoiceMade", {faction, card: ARGK, replaced: original, box: BOX.event}, ruleRef);
    notePassOnly(ctx, faction, false);
    for (const [id, n] of Object.entries(asObject(c["placements"]) ?? {})) if (Number(n) > 0) ctx.apply({type: "placePieces", piece: PIECE.guerrilla, state: FACE.underground, count: Number(n), space: id, ruleRef, assumptionRef: null});
    // DEC-55: flip at every PKK Base, including spaces receiving no recruits.
    for (const s of ctx.ruleset.spaces) if (count(ctx.state, s.id, PIECE.pkkBase) > 0) ctx.apply({type: "setPieceState", piece: PIECE.guerrilla, space: s.id, from: FACE.active, to: FACE.underground, count: "all", ruleRef, assumptionRef: null});
    ctx.apply({type: "adjustTrack", track: "resources.pkk", delta: param(ctx.ruleset, "argk.resources", "number"), ruleRef, assumptionRef: null});
  },
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
