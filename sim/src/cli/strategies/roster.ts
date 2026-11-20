// The eight strategy families (19 s4). They were tuned and qualified on Scenario A
// (C1 and C2), which is archived (archive/README.md). They now play the full campaign. No family is
// tuned for C3 to C5. Each is a hypothesis, not a proven
// winning strategy. All share the search procedure below and differ in documented weights, risk and
// conversion timing; the adaptive families add a sampled opponent reply. Assumptions per family:
// docs/prototype/21-scenario-a-strategies.md.
//
// Search (bounded, 19 s5): (1) forced lines: in the final Propaganda round Civic Action and Agitation
// are solved exactly against the opponent's best reply, and any candidate whose sampled result is an
// immediate win is preferred by its exact value; (2) one-ply evaluation of every candidate on a
// determinized state, up to the budget, with each family's quota so no family is starved;
// (3) the best six are re-sampled on further determinizations (new deck order and dice);
// (4) adaptive families replace the value of the best four with the value after the opponent's best
// static reply.
import type { AnyCommand, FactionId, GameState, JsonObject } from "../../engine/core/types.ts";
import { decisionPoint, generateCandidates, GENERATOR_VERSION, type Candidate } from "../candidates.ts";
import { determinize } from "../player-observation.ts";
import { settle, type Choice, type LinePlay, type DecisionRequest, type ObservationPlayer, type PlayerSpec, type SearchContext } from "../players.ts";
import { evaluate, timing, WIN_VALUE, type Weights } from "./evaluation.ts";

/**
 * Frozen roster version per faction (dev-compare-v2, paired on the pilot seeds): State families v1,
 * PKK families v2. Other versions stay registered for paired comparison (19 s7).
 */
export const ROSTER_VERSION: Readonly<Record<FactionId, number>> = { state: 4, pkk: 4 };
/** Transitions per decision for every qualified search player (19 s7: equal budgets). */
export const SEARCH_BUDGET = 600;

export const BASE: Weights = { ownPotential: 0.5, oppPotential: 0.5, qualify: 6, resources: 0.05, controlPop: 0, oppControlPop: 0, pkkBases: 0, guerrillas: 0, underground: 0, active: 0, external: 0, presencePop: 0, policedPop: 0, legitimacy: 0, convertBy: 0, potentialModel: "uncapped", protectedBases: 0, exposedBases: 0 };

interface Family {
  readonly id: string;
  readonly version: number;
  readonly faction: FactionId;
  readonly weights: Weights;
  readonly adaptive: boolean;
  readonly description: string;
  /** Own decisions planned: 1 = one action; 2 = the action, the opponent's reply, then the next own action. */
  readonly lookahead?: number;
  /** Transitions per decision; default SEARCH_BUDGET. */
  readonly budget?: number;
}

/** v1 parameters (pilot-1). Margins always count 1:1; other weights are estimates. */
const V1: readonly Omit<Family, "version">[] = [
  { id: "S-POL", faction: "state", adaptive: false, weights: { ...BASE, ownPotential: 0.7, oppPotential: 0.4, policedPop: 0.25, legitimacy: 0.3, controlPop: 0.1 },
    description: "Support in valuable spaces through Police, Control and Civic Action; protects Legitimacy. Blocked: restores Civic Action prerequisites (Control, Police, cleared markers); interrupts credible PKK wins through the shared forced-line search." },
  { id: "S-MIL", faction: "state", adaptive: false, weights: { ...BASE, ownPotential: 0.4, pkkBases: 3, guerrillas: 0.6, active: 0.4, controlPop: 0.1 },
    description: "Exposes Guerrillas and removes domestic Bases when the disruption outweighs the cost. Blocked: converts cleared positions to Support (potential term); external pursuit only when the evaluation gains." },
  { id: "S-CON", faction: "state", adaptive: false, weights: { ...BASE, oppPotential: 1, oppControlPop: 0.4, pkkBases: 1.5, controlPop: 0.2, presencePop: 0.15 },
    description: "Denies PKK scoring positions (Bases, PKK Control, Agitation room) while keeping a secure Support network. Blocked: reinforces valuable spaces; attacks when denial otherwise fails." },
  { id: "S-ADAPT", faction: "state", adaptive: true, weights: { ...BASE, ownPotential: 0.6, oppPotential: 0.6, pkkBases: 1, policedPop: 0.1, controlPop: 0.1 },
    description: "Balanced scoring, denial and investment with a sampled opponent reply on the best plans. Re-evaluates margins and imminent wins at each decision." },
  { id: "P-POL", faction: "pkk", adaptive: false, weights: { ...BASE, ownPotential: 0.8, oppPotential: 0.4, pkkBases: 1, controlPop: 0.15, active: -0.1 },
    description: "Domestic Bases or Control, then Opposition bought by Agitation. Blocked: redresses worthwhile blocks; protects scoring positions; prevents State wins through forced-line search." },
  { id: "P-EXP", faction: "pkk", adaptive: false, weights: { ...BASE, ownPotential: 0.6, presencePop: 0.25, pkkBases: 1.5, controlPop: 0.2, underground: 0.1 },
    description: "Reaches larger-Pop spaces and builds a distributed domestic network. Blocked: changes routes; the potential term stops expansion when existing positions return more." },
  { id: "P-SURV", faction: "pkk", adaptive: false, weights: { ...BASE, ownPotential: 0.7, underground: 0.5, guerrillas: 0.2, external: 0.15, resources: 0.4, active: -0.3, convertBy: 0.5 },
    description: "Preserves Guerrillas, Resources and camps, then converts into domestic score. Conversion starts as the expected cards before the final Propaganda fall; the margin terms override survival when they require it." },
  { id: "P-ADAPT", faction: "pkk", adaptive: true, weights: { ...BASE, ownPotential: 0.7, oppPotential: 0.6, pkkBases: 1, controlPop: 0.1, active: -0.1 },
    description: "Balanced Opposition, Bases and reduction of State Support/Legitimacy with a sampled opponent reply on the best plans. Re-evaluates threats, Harm and timing at each decision." },
];

/**
 * Every registered family version. v2 changes only the potential model: conversion is capped by
 * the remaining Propaganda Civic Action caps and Train/Rally opportunities (pilot-1 finding:
 * uncapped potential made hoarding by Pass look better than spending).
 */
/**
 * Phase 8 counter (19 s10). baseline-1: no PKK family reached 50% against S-MIL, which keeps
 * domestic Bases at 0 to 1 by Sweep or Garrison then Assault. P-SHIELD is P-POL v2 plus Base
 * protection: value Bases that keep an Underground Guerrilla (Assault cannot remove them) and
 * penalize Bases left beside Troops with no Underground Guerrilla.
 */
const POL = V1.find((f) => f.id === "P-POL")?.weights ?? BASE;
const MIL = V1.find((f) => f.id === "S-MIL")?.weights ?? BASE;
const COUNTERS: readonly Family[] = [
  { id: "P-SHIELD", version: 3, faction: "pkk", adaptive: false,
    weights: { ...POL, potentialModel: "capped", pkkBases: 1.5, protectedBases: 1.5, exposedBases: 2, underground: 0.15 },
    description: "Counter to S-MIL: P-POL priorities plus Base protection. Keeps an Underground Guerrilla with each domestic Base (Rally flip, Underground March) and avoids Bases exposed to Sweep and Assault." },
  // dev-counter-shield: P-SHIELD@3 won 158 of 160 development games against the State roster.
  { id: "S-SIEGE", version: 3, faction: "state", adaptive: false,
    weights: { ...MIL, protectedBases: 2, exposedBases: 1.5, active: 0.8 },
    description: "Counter to P-SHIELD: S-MIL priorities plus value for exposing protected Bases (Sweep or Garrison to activate their Guerrillas, then Assault)." },
  // Attribution probe (development only): is the State's loss to P-SHIELD explained by passing and unspent Resources?
  { id: "S-SPEND", version: 3, faction: "state", adaptive: false,
    weights: { ...(V1.find((f) => f.id === "S-POL")?.weights ?? BASE), potentialModel: "capped", resources: -0.3 },
    description: "Attribution probe: S-POL with the capped potential and a penalty on unspent Resources, so it converts instead of passing." },
];

/**
 * v4 (doc 37): the designer's retune for the full campaign (Bot Tuning Desk export, 17 Nov 2026).
 * Same styles; dial and potential-model changes below; every family plans 2 moves on a 1,800-step budget.
 * PKK families keep the v2 capped potential.
 */
const V4_CHANGES: Readonly<Record<string, Partial<Weights>>> = {
  "S-POL": { legitimacy: 0.35 },
  "S-MIL": {},
  "S-CON": { potentialModel: "capped" },
  "S-ADAPT": { ownPotential: 0.9, oppPotential: 1.15, pkkBases: 3, guerrillas: 1.5, legitimacy: 0.8, potentialModel: "capped" },
  "P-POL": { potentialModel: "capped", ownPotential: 1.4, oppPotential: 0.65, legitimacy: 0.3 },
  "P-EXP": { potentialModel: "capped", ownPotential: 0.35 },
  "P-SURV": { potentialModel: "capped" },
  "P-ADAPT": { potentialModel: "capped" },
};
/** v4 search: 2-move planning; the budget keeps the one-move breadth (600 x 3, doc 37). */
const V4_SEARCH = { lookahead: 2, budget: 1800 };

const V4: readonly Family[] = V1.map((f) => ({ ...f, version: 4, ...V4_SEARCH, weights: { ...f.weights, ...V4_CHANGES[f.id] } }));

/**
 * v5 State (audit Plan 2 S2): v4 plus a weight on unspent Resources against State passivity
 * (`dd25-v4b`: 36% Pass, about 5 Resources left at the end). The S-SPEND@3 probe cut unused
 * Resources from 4.3 to 0.8 with -0.3 (doc 23). Search and other dials stay as v4.
 * Development probe, not the roster: in `dev-s2-state-v5` it spent its Resources but still passed
 * on 29% of card choices (most passes at 0 to 1 Resources) and won 19 of 64 games against 31 for v4.
 */
export const V5_RESOURCES = -0.3;
/** State v4 with `resources` set to `weight`, as version `version` (S2 spending sweep: v5 -0.3, v6 -0.1, v7 -0.2). */
const spending = (version: number, weight: number): Family[] => V4.filter((f) => f.faction === "state").map((f) => ({ ...f, version, weights: { ...f.weights, resources: weight } }));
const V5: readonly Family[] = [...spending(5, V5_RESOURCES), ...spending(6, -0.1), ...spending(7, -0.2)];

export const FAMILIES: readonly Family[] = [
  ...V1.map((f) => ({ ...f, version: 1 })),
  ...V1.map((f) => ({ ...f, version: 2, weights: { ...f.weights, potentialModel: "capped" as const } })),
  ...COUNTERS,
  ...V4,
  ...V5,
];

/** The frozen version of each family: the qualified roster. */
export const CURRENT: readonly Family[] = FAMILIES.filter((f) => f.version === ROSTER_VERSION[f.faction]);

interface Scored { readonly candidate: Candidate; value: number; samples: number; components: Readonly<Record<string, number>>; line?: readonly LinePlay[] }

/** One sampled outcome of a candidate: apply on a determinized state, then automatic phases. */
export function outcome(ctx: SearchContext, base: GameState, candidate: Candidate): GameState | null {
  const result = ctx.budget.apply(ctx.ruleset, base, candidate.command);
  return result === null || !result.ok ? null : settle(ctx, result.transition.state);
}

/** Final-round Civic Action or Agitation: exact value against the opponent's best Agitation reply. */
function solveFinal(request: DecisionRequest, ctx: SearchContext, base: GameState, w: Weights): Scored[] {
  return request.candidates.map((candidate) => {
    const after = outcome(ctx, base, candidate);
    if (after === null) return { candidate, value: -Infinity, samples: 0, components: {} };
    if (after.ended !== null || request.kind === "agitation") { const e = evaluate(ctx.ruleset, after, request.faction, w); return { candidate, value: e.value, samples: 1, components: e.components }; }
    const replies = generateCandidates(ctx.engine, ctx.ruleset, after, "agitation", "pkk").candidates;
    let worst: Scored = { candidate, value: Infinity, samples: 1, components: {} };
    for (const reply of replies) {
      const end = outcome(ctx, after, reply);
      if (end === null) continue;
      const e = evaluate(ctx.ruleset, end, request.faction, w);
      if (e.value < worst.value) worst = { candidate, value: e.value, samples: 1, components: e.components };
    }
    return worst.value === Infinity ? { ...worst, value: evaluate(ctx.ruleset, after, request.faction, w).value } : worst;
  });
}

/** Best static card play of `faction` from `s`, valued with `weights` (the opponent's reply uses the neutral BASE). */
function opponentReply(ctx: SearchContext, s: GameState, opponent: FactionId, limit: number, weights: Weights = BASE): GameState {
  const replies = generateCandidates(ctx.engine, ctx.ruleset, s, "card", opponent).candidates;
  // Quota per family, so the sampled replies cover every action family.
  const byFamily = new Map<string, Candidate[]>();
  for (const c of replies) byFamily.set(c.family, [...(byFamily.get(c.family) ?? []), c]);
  const pool: Candidate[] = [];
  for (let i = 0; pool.length < limit && [...byFamily.values()].some((l) => i < l.length); i++) for (const l of byFamily.values()) if (i < l.length && pool.length < limit) pool.push(l[i] as Candidate);
  let best: { value: number; state: GameState } = { value: -Infinity, state: s };
  for (const c of pool) {
    const after = outcome(ctx, s, c);
    if (after === null) continue;
    const v = evaluate(ctx.ruleset, after, opponent, weights).value;
    if (v > best.value) best = { value: v, state: after };
  }
  return best.state;
}

/** Candidates to evaluate within `room` transitions: round-robin across families. */
/** Every candidate in family round-robin order, so a spent budget never starves later families. */
export function roundRobin(candidates: readonly Candidate[]): Candidate[] {
  const byFamily = new Map<string, Candidate[]>();
  for (const c of candidates) byFamily.set(c.family, [...(byFamily.get(c.family) ?? []), c]);
  const out: Candidate[] = [];
  for (let i = 0; out.length < candidates.length; i++) for (const l of byFamily.values()) if (i < l.length) out.push(l[i] as Candidate);
  return out;
}

/** Candidates kept in a decision's review list (audit Plan 2 S4: top 3). */
const RANKED = 3;
/** Share of the decision budget kept for re-sampling and replies after the first pass. */
const RESERVE = 0.25;
/** With 2-move planning: the first pass gets 35% (630 of 1,800, more than the 450 of one-move search). */
const DEEP_RESERVE = 0.65;
/** Leaders checked by the deep line. */
const DEEP_LEADERS = 3;
/** Share of a leader's deep budget for the opponent's replies; the rest is for the own next play. */
const REPLY_SHARE = 0.75;
/** Opponent plays at most before the next own play: the rest of this card and the first of the next. */
const MAX_REPLIES = 2;

/**
 * Best card play of `faction` from `s` by `weights`, trying plays in family rotation until the
 * budget falls to `floor` (doc 37). Unlike a fixed sample, a large budget share reaches every play.
 */
function bestPlay(ctx: SearchContext, s: GameState, faction: FactionId, weights: Weights, floor: number, line?: LinePlay[]): GameState {
  const plays = roundRobin(generateCandidates(ctx.engine, ctx.ruleset, s, "card", faction).candidates);
  let best: { value: number; state: GameState; command: AnyCommand | null } = { value: -Infinity, state: s, command: null };
  for (const c of plays) {
    if (ctx.budget.remaining <= floor) break;
    const after = outcome(ctx, s, c);
    if (after === null) continue;
    const v = evaluate(ctx.ruleset, after, faction, weights).value;
    if (v > best.value) best = { value: v, state: after, command: c.command };
    if (v >= WIN_VALUE / 2) break;
  }
  if (best.command !== null) line?.push({ faction, command: best.command });
  return best.state;
}

/**
 * The 2-move line after an own card play (doc 37): the opponent's best static reply when it acts
 * next, then this faction's own best next card play, then the evaluation. It stops at the first
 * decision that is not a card play (Propaganda, Pivotal, Event question) or when the budget runs low.
 */
export function deepLine(ctx: SearchContext, after: GameState, faction: FactionId, w: Weights, share: number, line?: LinePlay[]): GameState {
  const end = Math.max(0, ctx.budget.remaining - share);
  const own = Math.floor(share * (1 - REPLY_SHARE));
  let s = after;
  // After Op Only or Op + SA by the First Eligible, the opponent acts last on this card and first
  // on the next (05 s2.4), so up to two opponent plays come before the next own play.
  for (let replies = 0; replies <= MAX_REPLIES && s.ended === null; ) {
    const point = decisionPoint(ctx.engine, ctx.ruleset, s);
    if (point.kind !== "card") break;
    if (point.faction === faction) return bestPlay(ctx, s, faction, w, end, line);
    if (replies === MAX_REPLIES) break;
    const left = Math.max(0, ctx.budget.remaining - end - own);
    const next = bestPlay(ctx, s, point.faction, BASE, ctx.budget.remaining - Math.floor(left / (MAX_REPLIES - replies)), line);
    if (next === s) break;
    s = next;
    replies++;
  }
  return s;
}

/**
 * A plan's 2-move value: its sampled one-move mean plus what the 2-move line changed on the base
 * sample. Keeps the re-sampled dice and decks in the ranking (PR 115 review).
 */
export function combineDeep(sampledMean: number, oneMoveOnBase: number, deepOnBase: number): number {
  return sampledMean + (deepOnBase - oneMoveOnBase);
}

function searchDecide(family: Family, request: DecisionRequest, ctx: SearchContext): Choice {
  const notes: string[] = [];
  const [only] = request.candidates;
  if (only === undefined) throw new Error("no candidates");
  if (request.candidates.length === 1) return { candidateId: only.id, value: 0, components: {}, topAlternative: null, notes: ["single candidate"] };
  const base = determinize(ctx.ruleset, request.observation, ctx.rng);
  const w = family.weights;
  const t = timing(ctx.ruleset, base);
  let scored: Scored[];
  if (t.final && (request.kind === "civicAction" || request.kind === "agitation")) {
    scored = solveFinal(request, ctx, base, w);
    notes.push("final-round exact solve");
  } else {
    // First pass in family rotation until only the reserve is left; each evaluation's cost
    // (apply plus automatic phases) is charged as it happens (search-2).
    const ordered = roundRobin(request.candidates);
    const deep = (family.lookahead ?? 1) > 1 && request.kind === "card";
    const reserve = Math.floor(ctx.budget.limit * (deep ? DEEP_RESERVE : RESERVE));
    scored = [];
    for (const candidate of ordered) {
      if (ctx.budget.remaining <= reserve) break;
      const after = outcome(ctx, base, candidate);
      if (after === null) continue;
      const e = evaluate(ctx.ruleset, after, request.faction, w);
      scored.push({ candidate, value: e.value, samples: 1, components: e.components });
    }
    if (scored.length < ordered.length) notes.push(`evaluated ${String(scored.length)}/${String(ordered.length)} in family rotation`);
    scored.sort((a, b) => b.value - a.value);
    // Re-sample the leaders on new deck orders and dice (19 s5: sampled unknown futures).
    for (const s of scored.slice(0, 6)) {
      for (let k = 0; k < 2 && ctx.budget.remaining > 0; k++) {
        const after = outcome(ctx, determinize(ctx.ruleset, request.observation, ctx.rng), s.candidate);
        if (after === null) continue;
        s.value = (s.value * s.samples + evaluate(ctx.ruleset, after, request.faction, w).value) / (s.samples + 1);
        s.samples++;
      }
    }
    if (deep) {
      let changed = 0;
      const leaders = [...scored].sort((a, b) => b.value - a.value).slice(0, DEEP_LEADERS);
      const checked = new Set<Scored>();
      for (const [i, s] of leaders.entries()) {
        const after = outcome(ctx, base, s.candidate);
        if (after === null) continue;
        checked.add(s);
        if (after.ended !== null) continue;
        const share = Math.floor(ctx.budget.remaining / (leaders.length - i));
        const one = evaluate(ctx.ruleset, after, request.faction, w).value;
        const line: LinePlay[] = [];
        const e = evaluate(ctx.ruleset, deepLine(ctx, after, request.faction, w, share, line), request.faction, w);
        s.line = line;
        if (e.value !== one) changed++;
        s.value = combineDeep(s.value, one, e.value);
        s.components = { ...e.components, lookahead: 2 };
      }
      // Only plans with the 2-move check compete: an unchecked plan's one-move value hides the reply.
      if (checked.size > 0) scored = scored.filter((s) => checked.has(s));
      notes.push(`2-move line on ${String(checked.size)} leaders (${String(changed)} revalued)`);
    } else if (family.adaptive && request.kind === "card") {
      const opponent = request.faction === "state" ? "pkk" : "state";
      for (const s of [...scored].sort((a, b) => b.value - a.value).slice(0, 4)) {
        const after = outcome(ctx, base, s.candidate);
        if (after === null || after.ended !== null || ctx.budget.remaining < 20) continue; // literal-ok: minimum reply sample
        const point = after.turn.phase === "card" && after.pending === null ? after.initiative : null;
        const next = point === null ? null : [point.firstEligible, point.secondEligible].find((f) => f !== null && !point.actedThisCard.includes(f)) ?? null;
        if (next !== opponent) continue;
        const reply = opponentReply(ctx, after, opponent, Math.min(40, ctx.budget.remaining - 10)); // literal-ok: reply sample size and reserve
        const e = evaluate(ctx.ruleset, reply, request.faction, w);
        s.value = Math.min(s.value, e.value);
        s.components = { ...e.components, replyChecked: 1 };
      }
    }
  }
  scored.sort((a, b) => b.value - a.value || a.candidate.id.localeCompare(b.candidate.id));
  const [best, second] = scored;
  if (best === undefined || best.value === -Infinity) throw new Error(`${family.id}: no candidate could be evaluated within the budget`);
  if (best.value >= WIN_VALUE / 2) notes.push("forced or sampled win");
  const ranked = scored.slice(0, RANKED).filter((x) => x.value !== -Infinity).map((x) => ({ id: x.candidate.id, value: x.value, components: x.components }));
  return { candidateId: best.candidate.id, value: best.value, components: best.components, topAlternative: second === undefined ? null : { id: second.candidate.id, value: second.value }, notes, ranked, ...(best.line === undefined ? {} : { line: best.line }) };
}

function spec(family: Family): PlayerSpec {
  return {
    id: `${family.id}@${String(family.version)}`, family: family.id, version: family.version, faction: family.faction, role: "qualified", access: "observation",
    params: { ...(family.weights as unknown as JsonObject), adaptive: family.adaptive, lookahead: family.lookahead ?? 1 }, generatorVersion: GENERATOR_VERSION, budget: family.budget ?? SEARCH_BUDGET, description: family.description,
  };
}

/** Weights of a registered family version, or null. */
export function familyWeights(id: string, version: number): Weights | null {
  return FAMILIES.find((f) => f.id === id && f.version === version)?.weights ?? null;
}

/** Players by family ID and version. */
export function rosterPlayer(id: string, version: number): ObservationPlayer | null {
  const family = FAMILIES.find((f) => f.id === id && f.version === version);
  return family === undefined ? null : { spec: spec(family), decide: (request, ctx) => searchDecide(family, request, ctx) };
}
