// Determinized search to 4 plies (audit Plan 2 S3; section 5.4). One ply is one faction decision
// on a card. For a card decision the player (1) values every candidate one ply deep on a
// determinized state, then (2) races the leaders by successive halving: each kept candidate is
// played on fresh determinizations (sampled deck order and dice, never the real pile) and followed
// by up to 3 more card plies, each chosen greedily by the acting faction (its own weights for this
// player, the neutral BASE weights for the opponent, whose weights are private). The leaf is the
// static evaluation, which projects conversion to the next Propaganda rounds. A line stops at the
// first decision that is not a card play. The mean leaf value ranks the candidates; the bottom half
// drops out after each stage. Other decisions (Propaganda, Pivotal, questions) use the base family's
// v4 search. The transition budget and the fixed schedule keep every decision reproducible.
// Strategy fusion (Cowling and others, 2012) remains: the mean is over deals the player cannot tell
// apart. v4 stays registered as the control.
import type { FactionId, GameState, JsonObject } from "../../engine/core/types.ts";
import { decisionPoint, generateCandidates, GENERATOR_VERSION, type Candidate } from "../candidates.ts";
import { determinize } from "../player-observation.ts";
import type { Choice, DecisionRequest, LinePlay, ObservationPlayer, SearchContext } from "../players.ts";
import { evaluate, WIN_VALUE, type Weights } from "./evaluation.ts";
import { BASE, familyWeights, outcome, roundRobin, rosterPlayer } from "./roster.ts";

/** Plies per line, the candidate's own ply included (5.4: this card and the next for both factions). */
export const DEPTH = 4;
/** Plays tried at each later ply, in family rotation (progressive widening is in the schedule). */
const PLY_WIDTH = 8;
/** Successive halving: candidates kept and fresh samples each at every stage. */
const SCHEDULE: readonly { readonly keep: number; readonly samples: number }[] = [{ keep: 8, samples: 2 }, { keep: 4, samples: 4 }, { keep: 2, samples: 8 }];
/** Transitions per decision: the first pass plus about 50 lines of 4 plies. */
const BUDGET = 3000;
/** First-pass share of the budget; the rest is for the lines. */
const FIRST_PASS = 0.15;

interface SearchFamily {
  readonly id: string;
  readonly version: number;
  readonly faction: FactionId;
  /** Leaf weights and the delegate for other decisions: a registered v4-style family. */
  readonly base: { readonly id: string; readonly version: number };
  readonly description: string;
}

const SEARCH: readonly SearchFamily[] = [
  { id: "S-SEARCH", version: 1, faction: "state", base: { id: "S-CON", version: 5 }, description: "Determinized 4-ply search (audit Plan 2 S3) with S-CON@5 weights at the leaves (spends Resources: decision B-5)." },
  { id: "P-SEARCH", version: 1, faction: "pkk", base: { id: "P-SURV", version: 4 }, description: "Determinized 4-ply search (audit Plan 2 S3) with P-SURV@4 weights at the leaves." },
];

/** The greedy best card play of the acting faction among the first PLY_WIDTH plays in family rotation. */
function greedyPly(ctx: SearchContext, s: GameState, faction: FactionId, w: Weights): { state: GameState; play: LinePlay } | null {
  const plays = roundRobin(generateCandidates(ctx.engine, ctx.ruleset, s, "card", faction, { familyCap: 1, broad: false }).candidates).slice(0, PLY_WIDTH);
  let best: { value: number; state: GameState; play: LinePlay } | null = null;
  for (const c of plays) {
    const after = outcome(ctx, s, c);
    if (after === null) continue;
    const v = evaluate(ctx.ruleset, after, faction, w).value;
    if (best === null || v > best.value) best = { value: v, state: after, play: { faction, command: c.command } };
    if (v >= WIN_VALUE / 2) break;
  }
  return best;
}

/** One sampled line from the state after the candidate: up to DEPTH - 1 further card plies. */
export function sampleLine(ctx: SearchContext, after: GameState, faction: FactionId, w: Weights): { state: GameState; plays: LinePlay[] } {
  let s = after;
  const plays: LinePlay[] = [];
  for (let ply = 1; ply < DEPTH && s.ended === null; ply++) {
    const point = decisionPoint(ctx.engine, ctx.ruleset, s);
    if (point.kind !== "card") break;
    const next = greedyPly(ctx, s, point.faction, point.faction === faction ? w : BASE);
    if (next === null) break;
    s = next.state;
    plays.push(next.play);
  }
  return { state: s, plays };
}

/** `raced`: the mean holds line samples only (the one-ply first-pass value is dropped when racing starts). */
interface Entry { readonly candidate: Candidate; total: number; samples: number; raced: boolean; components: Readonly<Record<string, number>>; line: readonly LinePlay[] }

function searchDecide(family: SearchFamily, w: Weights, request: DecisionRequest, ctx: SearchContext): Choice {
  const [only] = request.candidates;
  if (only === undefined) throw new Error("no candidates");
  const delegate = rosterPlayer(family.base.id, family.base.version);
  if (delegate === null) throw new Error(`${family.id}: base ${family.base.id}@${String(family.base.version)} is not registered`);
  if (request.kind !== "card" || request.candidates.length === 1) return delegate.decide(request, ctx);
  const notes: string[] = [];
  // (1) One ply on one determinization, in family rotation, within the first-pass share.
  const first = determinize(ctx.ruleset, request.observation, ctx.rng);
  const reserve = Math.floor(ctx.budget.limit * (1 - FIRST_PASS));
  const entries: Entry[] = [];
  for (const candidate of roundRobin(request.candidates)) {
    if (ctx.budget.remaining <= reserve) break;
    const after = outcome(ctx, first, candidate);
    if (after === null) continue;
    const e = evaluate(ctx.ruleset, after, request.faction, w);
    entries.push({ candidate, total: e.value, samples: 1, raced: false, components: e.components, line: [] });
  }
  if (entries.length < request.candidates.length) notes.push(`first pass ${String(entries.length)}/${String(request.candidates.length)}`);
  const mean = (x: Entry): number => x.total / x.samples;
  entries.sort((a, b) => mean(b) - mean(a) || a.candidate.id.localeCompare(b.candidate.id));
  const [leader] = entries;
  if (leader === undefined) throw new Error(`${family.id}: no candidate could be evaluated within the budget`);
  // An immediate win needs no lookahead.
  if (mean(leader) < WIN_VALUE / 2) {
    // (2) Successive halving over 4-ply lines on fresh determinizations.
    let field = entries;
    let lines = 0;
    for (const stage of SCHEDULE) {
      field = field.slice(0, stage.keep);
      for (const x of field) {
        if (!x.raced) { x.total = 0; x.samples = 0; x.raced = true; }
        for (let k = 0; k < stage.samples && ctx.budget.remaining > 0; k++) {
          const after = outcome(ctx, determinize(ctx.ruleset, request.observation, ctx.rng), x.candidate);
          if (after === null) continue;
          const sampled = sampleLine(ctx, after, request.faction, w);
          const e = evaluate(ctx.ruleset, sampled.state, request.faction, w);
          x.total += e.value;
          x.samples++;
          x.components = { ...e.components, plies: sampled.plays.length + 1 };
          x.line = sampled.plays;
          lines++;
        }
      }
      field = field.filter((x) => x.samples > 0).sort((a, b) => mean(b) - mean(a) || a.candidate.id.localeCompare(b.candidate.id));
    }
    notes.push(`${String(lines)} sampled lines to ${String(DEPTH)} plies`);
    // Only raced candidates compete: an unraced one-ply value hides the replies.
    if (field.length > 0) entries.splice(0, entries.length, ...field);
  } else notes.push("immediate win");
  const [best, second] = entries;
  if (best === undefined) throw new Error(`${family.id}: no candidate kept`);
  return {
    candidateId: best.candidate.id, value: mean(best), components: best.components, notes,
    topAlternative: second === undefined ? null : { id: second.candidate.id, value: mean(second) },
    ranked: entries.slice(0, 3).map((x) => ({ id: x.candidate.id, value: mean(x), components: x.components })),
    ...(best.line.length > 0 ? { line: best.line } : {}),
  };
}

/** Search players by family ID and version, or null. */
export function searchPlayer(id: string, version: number): ObservationPlayer | null {
  const family = SEARCH.find((f) => f.id === id && f.version === version);
  const w = family === undefined ? null : familyWeights(family.base.id, family.base.version);
  if (family === undefined || w === null) return null;
  return {
    spec: {
      id: `${family.id}@${String(family.version)}`, family: family.id, version: family.version, faction: family.faction, role: "qualified", access: "observation",
      params: { ...(w as unknown as JsonObject), depth: DEPTH, plyWidth: PLY_WIDTH, base: `${family.base.id}@${String(family.base.version)}` }, generatorVersion: GENERATOR_VERSION, budget: BUDGET, description: family.description,
    },
    decide: (request, ctx) => searchDecide(family, w, request, ctx),
  };
}
