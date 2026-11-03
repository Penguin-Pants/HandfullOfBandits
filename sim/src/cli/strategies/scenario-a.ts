// The eight Scenario A strategy families (19 s4; 20 Phase 5). Each is a hypothesis, not a proven
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
import type { FactionId, GameState, JsonObject } from "../../engine/core/types.ts";
import { generateCandidates, GENERATOR_VERSION, type Candidate } from "../candidates.ts";
import { determinize } from "../player-observation.ts";
import { settle, type Choice, type DecisionRequest, type ObservationPlayer, type PlayerSpec, type SearchContext } from "../players.ts";
import { evaluate, timing, WIN_VALUE, type Weights } from "./evaluation.ts";

/**
 * Frozen roster version per faction (dev-compare-v2, paired on the pilot seeds): State families v1,
 * PKK families v2. Other versions stay registered for paired comparison (19 s7).
 */
export const ROSTER_VERSION: Readonly<Record<FactionId, number>> = { state: 1, pkk: 2 };
/** Transitions per decision for every qualified search player (19 s7: equal budgets). */
export const SEARCH_BUDGET = 600;

const BASE: Weights = { ownPotential: 0.5, oppPotential: 0.5, qualify: 6, resources: 0.05, controlPop: 0, oppControlPop: 0, pkkBases: 0, guerrillas: 0, underground: 0, active: 0, external: 0, presencePop: 0, policedPop: 0, legitimacy: 0, convertBy: 0, potentialModel: "uncapped", protectedBases: 0, exposedBases: 0 };

interface Family {
  readonly id: string;
  readonly version: number;
  readonly faction: FactionId;
  readonly weights: Weights;
  readonly adaptive: boolean;
  readonly description: string;
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
];

export const FAMILIES: readonly Family[] = [
  ...V1.map((f) => ({ ...f, version: 1 })),
  ...V1.map((f) => ({ ...f, version: 2, weights: { ...f.weights, potentialModel: "capped" as const } })),
  ...COUNTERS,
];

/** The frozen version of each family: the qualified roster. */
export const CURRENT: readonly Family[] = FAMILIES.filter((f) => f.version === ROSTER_VERSION[f.faction]);

interface Scored { readonly candidate: Candidate; value: number; samples: number; components: Readonly<Record<string, number>> }

/** One sampled outcome of a candidate: apply on a determinized state, then automatic phases. */
function outcome(ctx: SearchContext, base: GameState, candidate: Candidate): GameState | null {
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

/** Best static reply of the opponent from `s` (value from the opponent's own neutral weights). */
function opponentReply(ctx: SearchContext, s: GameState, opponent: FactionId, limit: number): GameState {
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
    const v = evaluate(ctx.ruleset, after, opponent, BASE).value;
    if (v > best.value) best = { value: v, state: after };
  }
  return best.state;
}

/** Candidates to evaluate within `room` transitions: round-robin across families. */
function quota(candidates: readonly Candidate[], room: number): Candidate[] {
  if (candidates.length <= room) return [...candidates];
  const byFamily = new Map<string, Candidate[]>();
  for (const c of candidates) byFamily.set(c.family, [...(byFamily.get(c.family) ?? []), c]);
  const out: Candidate[] = [];
  for (let i = 0; out.length < room; i++) for (const l of byFamily.values()) if (i < l.length && out.length < room) out.push(l[i] as Candidate);
  return out;
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
    const pool = quota(request.candidates, Math.floor(ctx.budget.remaining * 0.6));
    if (pool.length < request.candidates.length) notes.push(`budget quota ${String(pool.length)}/${String(request.candidates.length)}`);
    scored = pool.map((candidate) => {
      const after = outcome(ctx, base, candidate);
      if (after === null) return { candidate, value: -Infinity, samples: 0, components: {} };
      const e = evaluate(ctx.ruleset, after, request.faction, w);
      return { candidate, value: e.value, samples: 1, components: e.components };
    });
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
    if (family.adaptive && request.kind === "card") {
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
  return { candidateId: best.candidate.id, value: best.value, components: best.components, topAlternative: second === undefined ? null : { id: second.candidate.id, value: second.value }, notes };
}

function spec(family: Family): PlayerSpec {
  return {
    id: `${family.id}@${String(family.version)}`, family: family.id, version: family.version, faction: family.faction, role: "qualified", access: "observation",
    params: { ...(family.weights as unknown as JsonObject), adaptive: family.adaptive }, generatorVersion: GENERATOR_VERSION, budget: SEARCH_BUDGET, description: family.description,
  };
}

/** Players by family ID and version. */
export function scenarioAPlayer(id: string, version: number): ObservationPlayer | null {
  const family = FAMILIES.find((f) => f.id === id && f.version === version);
  return family === undefined ? null : { spec: spec(family), decide: (request, ctx) => searchDecide(family, request, ctx) };
}
