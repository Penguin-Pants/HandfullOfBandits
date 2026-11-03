// Shared Scenario A evaluation (19 s3; 20 Phase 5). Observed values (scores, Harm, margins) stay
// separate from estimates (potential shifts and strategy shaping) in the logged components.
// Scores come from the engine derivation; the qualification tests check them independently.
import { param } from "../../engine/core/params.ts";
import type { FactionId, GameState, Ruleset } from "../../engine/core/types.ts";
import { derive } from "../../engine/coin/derive.ts";
import { count, markers, resources } from "../../engine/coin/ops/common.ts";
import { income } from "../../engine/coin/propaganda/resources.ts";

export interface Timing {
  /** Propaganda rounds already started. */
  readonly round: number;
  readonly finalRound: number;
  /** True during the final Propaganda round. */
  readonly final: boolean;
  /** Expected Event cards before the next Propaganda card, from public pile counts only. */
  readonly cardsToPropaganda: number;
  /** Expected Event cards before the final Propaganda card (0 during the final round). */
  readonly cardsToFinal: number;
}

/** Public timing estimate (rules 10.3): an unseen Propaganda card lies in pile positions 9 to 13. */
export function timing(r: Ruleset, s: GameState): Timing {
  const scenario = r.scenarios[s.meta.scenarioId];
  const finalRound = scenario?.finalRound ?? 0;
  const seen = new Set([...s.deck.played, ...(s.deck.currentCard === null ? [] : [s.deck.currentCard])]);
  const pileSize = (scenario?.pileSize ?? param(r, "deck.pileSize", "number")) + 1;
  const top = param(r, "deck.topSize", "number");
  let before = 0;
  for (const [i, campaign] of (scenario?.campaigns ?? []).entries()) {
    const left = s.deck.piles[i]?.length ?? 0;
    if (left === 0) continue;
    const propaganda = Object.values(r.cards).find((c) => c.campaign === campaign && c.type === "propaganda");
    if (propaganda === undefined || seen.has(propaganda.id)) { before += left; continue; }
    const first = Math.max(0, top - (pileSize - left));
    before += (first + left - 1) / 2;
    break;
  }
  // Expected Event cards before the final Propaganda: all remaining cards of earlier piles except their
  // unseen Propaganda card, plus the expected position of the last pile's Propaganda card.
  let toFinal = 0;
  const campaigns = scenario?.campaigns ?? [];
  for (const [i, campaign] of campaigns.entries()) {
    const left = s.deck.piles[i]?.length ?? 0;
    const propaganda = Object.values(r.cards).find((c) => c.campaign === campaign && c.type === "propaganda");
    const unseen = propaganda !== undefined && !seen.has(propaganda.id) && left > 0;
    if (i < campaigns.length - 1) { toFinal += left - (unseen ? 1 : 0); continue; }
    toFinal += unseen ? (Math.max(0, top - (pileSize - left)) + left - 1) / 2 : left;
  }
  const round = s.turn.propagandaRound;
  const final = round >= finalRound && s.turn.phase === "propaganda";
  return { round, finalRound, final, cardsToPropaganda: before, cardsToFinal: final ? 0 : toFinal };
}

export interface Features {
  readonly score: Readonly<Record<FactionId, number>>;
  readonly harm: Readonly<Record<FactionId, number>>;
  /** Earned margin: score - threshold - 2 x Harm above the limit (rules 7.3). */
  readonly margin: Readonly<Record<FactionId, number>>;
  /** Opening-check qualification (rules 7.2): threshold reached and Harm within the limit. */
  readonly qualifies: Readonly<Record<FactionId, boolean>>;
  /** Estimated level gains the faction can still buy (Pop per shift), with its expected Resources. */
  readonly potential: Readonly<Record<FactionId, number>>;
  readonly resources: Readonly<Record<FactionId, number>>;
  readonly income: Readonly<Record<FactionId, number>>;
  readonly pkkBases: number;
  readonly guerrillas: number;
  readonly underground: number;
  readonly active: number;
  readonly externalGuerrillas: number;
  readonly controlPop: Readonly<Record<FactionId, number>>;
  readonly presencePop: number;
  readonly policedPop: number;
  readonly legitimacy: number;
}

/** Sum of the `n` largest values. */
function top(values: number[], n: number): number {
  return values.sort((a, b) => b - a).slice(0, Math.max(0, n)).reduce((a, v) => a + v, 0);
}

/**
 * Potential models (19 s3: account for remaining opportunities, caps and costs).
 * uncapped (v1): every affordable shift counts. capped (v2): shifts are limited by the
 * remaining conversion opportunities: Civic Action caps of the remaining Propaganda rounds
 * (State), plus two shifts per Train or Rally sub-action on an expected share of the remaining
 * cards; card-play shifts cost their Operation too.
 */
export type PotentialModel = "uncapped" | "capped";
/** Share of remaining cards a faction is expected to spend on a political Operation (estimate). */
const CARD_SHARE = 0.5;

export function features(r: Ruleset, s: GameState, model: PotentialModel = "uncapped"): Features {
  const view = derive(r, s);
  const thresholds = r.scenarios[s.meta.scenarioId]?.thresholds ?? {};
  const limit = param(r, "harm.limit", "number");
  const factor = param(r, "victory.finalHarmFactor", "number");
  const t = timing(r, s);
  const home = r.spaces.filter((x) => x.kind === "domestic");
  const level = (id: string): number => s.spaces[id]?.level ?? 0;
  const pay = income(r, s);
  const incomeRounds = s.turn.propagandaRound < t.finalRound - 1 ? 1 : 0;
  const res = { state: resources(r, s, "state"), pkk: resources(r, s, "pkk") };
  // State: shifts at 2 each where it has Control and Police; PKK: 1 each with a Base or Control.
  const stateShifts = home.filter((x) => view.control[x.id] === "state" && count(s, x.id, "police") > 0).flatMap((x) => Array.from({ length: Math.max(0, 2 - level(x.id)) }, () => x.pop - markers(s, x.id, "stateHarm") - markers(s, x.id, "reception") * 0.5));
  const pkkShifts = home.filter((x) => view.control[x.id] === "pkk" || count(s, x.id, "pkkBase") > 0).flatMap((x) => Array.from({ length: Math.max(0, level(x.id) + 2) }, () => x.pop - markers(s, x.id, "pkkHarm")));
  const stateBudget = res.state + incomeRounds * pay.state;
  const civicCap = t.final ? Math.floor(Number(s.tracks["legitimacy"]) / param(r, "civicAction.capDivisor", "number")) : Infinity;
  const pkkBudget = res.pkk + incomeRounds * pay.pkk;
  const potential = model === "uncapped" ? {
    state: top(stateShifts, Math.floor(Math.min(stateBudget, civicCap) / param(r, "civicAction.shiftCost", "number"))),
    pkk: top(pkkShifts, Math.floor(pkkBudget / param(r, "agitation.shiftCost", "number"))),
  } : (() => {
    const shift = { state: param(r, "civicAction.shiftCost", "number"), pkk: param(r, "agitation.shiftCost", "number") };
    const opCost = { state: param(r, "train.costPerSpace", "number"), pkk: param(r, "rally.costPerLocation", "number") };
    const maxShifts = param(r, "civicAction.maxShifts", "number");
    const cardShifts = Math.floor(t.cardsToFinal * CARD_SHARE * maxShifts);
    const rounds = Math.max(0, t.finalRound - s.turn.propagandaRound + (s.turn.phase === "propaganda" ? 1 : 0));
    const cap = Math.floor(Number(s.tracks["legitimacy"]) / param(r, "civicAction.capDivisor", "number"));
    // State: Propaganda shifts first (cheapest, capped per round), then Train + Civic Action shifts.
    const propagandaShifts = Math.min(rounds * Math.floor(cap / shift.state), Math.floor(stateBudget / shift.state));
    const stateLeft = stateBudget - propagandaShifts * shift.state;
    const stateCard = Math.min(cardShifts, Math.floor(stateLeft / (shift.state + opCost.state / maxShifts)));
    // PKK: Agitation in Propaganda has no Legitimacy cap; Rally + Agitate shifts also pay the Rally.
    const pkkPropaganda = rounds > 0 ? Math.floor(pkkBudget / shift.pkk) : 0;
    const pkkCard = Math.min(cardShifts, Math.floor(pkkBudget / (shift.pkk + opCost.pkk / maxShifts)));
    return { state: top(stateShifts, propagandaShifts + stateCard), pkk: top(pkkShifts, Math.max(pkkPropaganda, pkkCard)) };
  })();
  const margin: Record<FactionId, number> = {};
  const qualifies: Record<FactionId, boolean> = {};
  for (const f of ["state", "pkk"]) {
    const harm = view.harm[f] ?? 0;
    margin[f] = (view.scores[f] ?? 0) - (thresholds[f] ?? 0) - factor * Math.max(0, harm - limit);
    qualifies[f] = (view.scores[f] ?? 0) >= (thresholds[f] ?? 0) && harm <= limit;
  }
  const sum = (piece: string, face: string | null = null): number => home.reduce((n, x) => n + count(s, x.id, piece, face), 0);
  const controlPop = (f: string): number => home.filter((x) => view.control[x.id] === f).reduce((n, x) => n + x.pop, 0);
  return {
    score: view.scores, harm: view.harm, margin, qualifies, potential, resources: res, income: pay,
    pkkBases: sum("pkkBase"), guerrillas: sum("guerrilla"), underground: sum("guerrilla", "underground"), active: sum("guerrilla", "active"),
    externalGuerrillas: r.spaces.filter((x) => x.kind === "external").reduce((n, x) => n + count(s, x.id, "guerrilla"), 0),
    controlPop: { state: controlPop("state"), pkk: controlPop("pkk") },
    presencePop: home.filter((x) => count(s, x.id, "guerrilla") + count(s, x.id, "pkkBase") > 0).reduce((n, x) => n + x.pop, 0),
    policedPop: home.filter((x) => view.control[x.id] === "state" && count(s, x.id, "police") > 0).reduce((n, x) => n + x.pop, 0),
    legitimacy: Number(s.tracks["legitimacy"]),
  };
}

/** Strategy weights. Margins always count 1:1; every other term is an estimate (19 s4). */
export interface Weights {
  /** Share of own / opponent potential expected to convert before the end. */
  readonly ownPotential: number;
  readonly oppPotential: number;
  /** Bonus for qualifying at the opening check, and the same against the opponent. */
  readonly qualify: number;
  readonly resources: number;
  readonly controlPop: number;
  readonly oppControlPop: number;
  readonly pkkBases: number;
  readonly guerrillas: number;
  readonly underground: number;
  readonly active: number;
  readonly external: number;
  readonly presencePop: number;
  readonly policedPop: number;
  readonly legitimacy: number;
  /** P-SURV: scale preservation terms by the expected cards left (conversion timing, 19 s4). */
  readonly convertBy: number;
  readonly potentialModel: PotentialModel;
}

export const WIN_VALUE = 1000;

export interface Evaluation {
  readonly value: number;
  readonly components: Readonly<Record<string, number>>;
}

/** Value of `s` for `faction`: margin difference plus weighted estimates. Ended games are exact. */
export function evaluate(r: Ruleset, s: GameState, faction: FactionId, w: Weights): Evaluation {
  const other = faction === "state" ? "pkk" : "state";
  const f = features(r, s, w.potentialModel);
  const earned = (f.margin[faction] ?? 0) - (f.margin[other] ?? 0);
  if (s.ended !== null) {
    const win = s.ended.winner === faction ? WIN_VALUE : -WIN_VALUE;
    return { value: win + earned, components: { ended: 1, win: win > 0 ? 1 : 0, earnedMarginDiff: earned } };
  }
  const t = timing(r, s);
  const remaining = t.round >= t.finalRound - 1 ? Math.min(1, t.cardsToPropaganda / 8) : 1; // literal-ok: an eight-card top part
  const preserve = w.convertBy > 0 ? Math.min(1, remaining / w.convertBy) : 1;
  const isState = faction === "state";
  const sign = isState ? -1 : 1;
  const potential = w.ownPotential * (f.potential[faction] ?? 0) - w.oppPotential * (f.potential[other] ?? 0);
  const qualify = t.round < t.finalRound ? w.qualify * (Number(f.qualifies[faction]) - Number(f.qualifies[other])) : 0;
  const shaping =
    w.resources * preserve * (f.resources[faction] ?? 0) +
    w.controlPop * (f.controlPop[faction] ?? 0) - w.oppControlPop * (f.controlPop[other] ?? 0) +
    sign * (w.pkkBases * f.pkkBases + w.guerrillas * preserve * f.guerrillas + w.underground * preserve * f.underground + w.external * preserve * f.externalGuerrillas + w.presencePop * f.presencePop) +
    w.active * f.active + w.policedPop * f.policedPop + w.legitimacy * f.legitimacy;
  return {
    value: earned + potential + qualify + shaping,
    components: { earnedMarginDiff: earned, ownMargin: f.margin[faction] ?? 0, oppMargin: f.margin[other] ?? 0, potentialEstimate: potential, qualifyEstimate: qualify, shapingEstimate: shaping, ownHarm: f.harm[faction] ?? 0 },
  };
}
