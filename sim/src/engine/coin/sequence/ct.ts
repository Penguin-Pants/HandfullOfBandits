// CT two-faction sequence model (research 05 s2 to s3; 03 s6 SequenceModel). The only code that
// assumes two player factions (DEC-18). Box meanings: research 05 s2.2. Writes initiative only.
import { logEntry } from "../../core/log.ts";
import { own } from "../../core/state.ts";
import type { FactionId, GameState, LogEntry, Ruleset, Violation } from "../../core/types.ts";
import { PHASE } from "../phases.ts";

export const CT_PLAYERS = 2;
export const BOX = { event: "event", limitedOp: "limitedOp", opOnly: "opOnly", opSa: "opSa", pass: "pass" } as const;
const ruleRef = "05 s2";

function players(ruleset: Ruleset): FactionId[] {
  return ruleset.factions.filter((f) => f.kind === "player").map((f) => f.id);
}

/** First Eligible from sequence.yaml, the other player faction Second (research 05 s2.1, DD-04.6). */
export function resetEligibility(ruleset: Ruleset, state: GameState): GameState {
  const first = ruleset.sequence.firstEligibleAtStart;
  const second = players(ruleset).find((f) => f !== first) ?? null;
  return { ...state, initiative: { boxes: Object.fromEntries(players(ruleset).map((f) => [f, null])), firstEligible: first, secondEligible: second, actedThisCard: [] } };
}

/** The faction that acts next on the current card. Null outside card play or when both acted. */
export function activeFaction(state: GameState): FactionId | null {
  if (state.turn.phase !== PHASE.card || state.pending !== null) return null;
  const { firstEligible, secondEligible, actedThisCard } = state.initiative;
  if (firstEligible !== null && !actedThisCard.includes(firstEligible)) return firstEligible;
  if (secondEligible !== null && !actedThisCard.includes(secondEligible)) return secondEligible;
  return null;
}

/** Boxes open to `faction` now: all for the First Eligible, the responder matrix for the Second (05 s2.3). */
export function legalBoxes(ruleset: Ruleset, state: GameState, faction: FactionId): string[] {
  if (faction === state.initiative.firstEligible) return [...ruleset.sequence.boxes];
  const first = state.initiative.firstEligible === null ? null : own(state.initiative.boxes, state.initiative.firstEligible) ?? null;
  return first === null ? [] : responderBoxes(ruleset, first);
}

/** Boxes the Second Eligible may pick after the First Eligible picks `first`: Pass and adjacent boxes (05 s2.3). */
export function responderBoxes(ruleset: Ruleset, first: string): string[] {
  const touching = new Set(ruleset.sequence.adjacency.flatMap(([a, b]) => (a === first ? [b] : b === first ? [a] : [])));
  return ruleset.sequence.boxes.filter((box) => box === BOX.pass || touching.has(box));
}

/** Sequence layer of validation (05 s4.1 item 1): phase, eligibility, box. */
export function sequenceViolations(ruleset: Ruleset, state: GameState, faction: unknown, box: string): Violation[] {
  const violation = (code: string, message: string): Violation[] => [{ code, message, ruleRef, location: null }];
  if (state.turn.phase !== PHASE.card) return violation("notCardPlay", `No card is in play (phase "${state.turn.phase}").`);
  const active = activeFaction(state);
  if (active === null || faction !== active) return violation("notEligible", `It is ${active ?? "no faction"}'s turn to act, not ${String(faction)}'s.`);
  if (!legalBoxes(ruleset, state, active).includes(box)) {
    return violation("boxNotAllowed", `The ${box} box is not open now. Open boxes: ${legalBoxes(ruleset, state, active).join(", ")} (05 s2.3).`);
  }
  return [];
}

/** Place the faction's cylinder (05 s2.2 steps 3 and 4). */
export function placeCylinder(state: GameState, faction: FactionId, box: string): { state: GameState; entry: LogEntry } {
  const next = {
    ...state,
    initiative: { ...state.initiative, boxes: { ...state.initiative.boxes, [faction]: box }, actedThisCard: [...state.initiative.actedThisCard, faction] },
  };
  return { state: next, entry: logEntry(next, "ChoiceMade", { faction, box }, ruleRef) };
}

/** True when every eligible faction has acted on the current card. */
export function cardComplete(state: GameState): boolean {
  return state.turn.phase === PHASE.card && activeFaction(state) === null && state.pending === null;
}

/**
 * Adjust eligibility for the next card (05 s2.4): a First Eligible choice in `swapAfter` makes the
 * other faction First Eligible; anything else, both passes included, keeps the order.
 */
export function adjustEligibility(ruleset: Ruleset, state: GameState): { state: GameState; entry: LogEntry } {
  const { firstEligible, secondEligible, boxes } = state.initiative;
  const firstBox = firstEligible === null ? null : own(boxes, firstEligible) ?? null;
  const swap = firstBox !== null && ruleset.sequence.swapAfter.includes(firstBox);
  const [first, second] = swap ? [secondEligible, firstEligible] : [firstEligible, secondEligible];
  const next = {
    ...state,
    initiative: { boxes: Object.fromEntries(Object.keys(boxes).map((f) => [f, null])), firstEligible: first, secondEligible: second, actedThisCard: [] },
  };
  return { state: next, entry: logEntry(next, "EligibilityChanged", { firstEligible: first, secondEligible: second, boxes, swapped: swap }, "05 s2.4") };
}
