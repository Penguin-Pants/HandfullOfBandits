// Restricted player observations (19 s5; 20 Phase 3). A qualified player sees an explicit allowlist
// of public game state and its own hand. It never sees the seed, the live RNG, the order or content
// of unrevealed piles, set-aside card identities, opponent private data or the audit journal.
// Search (19 s5) samples unknown futures with `determinize`: a full GameState built only from an
// observation plus a search RNG, so the engine can run on it without any real hidden data.
import { param } from "../engine/core/params.ts";
import { nextUint32, seedRng, type RngState } from "../engine/core/rng.ts";
import type { CardId, FactionId, GameState, Ruleset } from "../engine/core/types.ts";

export const OBSERVATION_VERSION = 1;

/** The public view of one game state for `viewer` (allowlist; see fields). */
export interface Observation {
  readonly version: number;
  readonly viewer: FactionId;
  readonly meta: { readonly packageHash: string; readonly rulesetVersion: string; readonly scenarioId: string; readonly stateSeq: number };
  readonly turn: GameState["turn"];
  /** Revealed cards: played in order, then the current card. Rules 2.2: played cards may be inspected. */
  readonly played: readonly CardId[];
  readonly currentCard: CardId | null;
  /** Cards left per pile (rules 2.2: the count may be inspected). Never their identity or order. */
  readonly pileCounts: readonly number[];
  readonly setAsideCount: number;
  /** The viewer's own Pivotal hand; the opponent's hand only as a count. */
  readonly ownHand: readonly CardId[];
  readonly handCounts: Readonly<Record<FactionId, number>>;
  readonly initiative: GameState["initiative"];
  readonly spaces: GameState["spaces"];
  readonly pools: GameState["pools"];
  readonly markerPools: GameState["markerPools"];
  readonly tracks: GameState["tracks"];
  readonly flags: GameState["flags"];
  readonly modifiers: GameState["modifiers"];
  /** Face-down markers: location only (none exist in Scenario A). */
  readonly hiddenMarkers: readonly { readonly marker: string; readonly space: string }[];
  readonly pending: GameState["pending"];
  /** Public per-game counters (income received, Pass streaks, declined Pivotal windows). */
  readonly history: GameState["history"];
  readonly ended: GameState["ended"];
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

/** A frozen deep copy of the public state for `viewer`. */
export function observe(state: GameState, viewer: FactionId): Observation {
  const view: Observation = {
    version: OBSERVATION_VERSION,
    viewer,
    meta: { packageHash: state.meta.packageHash, rulesetVersion: state.meta.rulesetVersion, scenarioId: state.meta.scenarioId, stateSeq: state.meta.stateSeq },
    turn: state.turn,
    played: state.deck.played,
    currentCard: state.deck.currentCard,
    pileCounts: state.deck.piles.map((p) => p.length),
    setAsideCount: state.deck.setAside.length,
    ownHand: state.hands[viewer] ?? [],
    handCounts: Object.fromEntries(Object.entries(state.hands).map(([f, h]) => [f, h.length])),
    initiative: state.initiative,
    spaces: state.spaces,
    pools: state.pools,
    markerPools: state.markerPools,
    tracks: state.tracks,
    flags: state.flags,
    modifiers: state.modifiers,
    hiddenMarkers: state.hidden.map((h) => ({ marker: h.marker, space: h.space })),
    pending: state.pending,
    history: state.history,
    ended: state.ended,
  };
  return deepFreeze(structuredClone(view));
}

/** Mutable search random source, separate from the game RNG (19 s5, s7). */
export class SearchRng {
  private state: RngState;
  constructor(seed: number) {
    this.state = seedRng(seed);
  }
  /** Uniform integer in [0, n). */
  int(n: number): number {
    const drawn = nextUint32(this.state);
    this.state = drawn.rng;
    return drawn.value % n;
  }
  /** A fresh non-negative 32-bit seed. */
  seed(): number {
    return this.int(2 ** 32);
  }
  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [out[i], out[j]] = [out[j] as T, out[i] as T];
    }
    return out;
  }
}

/**
 * Unseen cards and their legal positions for each remaining pile (rules 10.3): unseen mandatory
 * cards lie in the top part, an unseen Propaganda card in the bottom part, chain pairs in order.
 * Sampling is uniform within these constraints; it is a legal distribution, not the exact
 * posterior over the deal. It reads only the observation and the public card catalog.
 */
export function samplePiles(ruleset: Ruleset, obs: Observation, rng: SearchRng): CardId[][] {
  const scenario = ruleset.scenarios[obs.meta.scenarioId];
  if (scenario === undefined) throw new RangeError(`Unknown scenario ${obs.meta.scenarioId}`);
  const seen = new Set([...obs.played, ...(obs.currentCard === null ? [] : [obs.currentCard])]);
  const cards = Object.values(ruleset.cards);
  const pileSize = (scenario.pileSize ?? param(ruleset, "deck.pileSize", "number")) + 1;
  const topSize = param(ruleset, "deck.topSize", "number");
  return scenario.campaigns.map((campaign, index) => {
    const remaining = obs.pileCounts[index] ?? 0;
    if (remaining === 0) return [];
    const revealed = Math.max(0, pileSize - remaining);
    const inCampaign = cards.filter((c) => c.campaign === campaign && !scenario.excludedCards.includes(c.id) && c.type !== "pivotal");
    const unseen = inCampaign.filter((c) => !seen.has(c.id));
    // A chain's earlier card cannot lie below a revealed later card.
    const blocked = new Set(cards.flatMap((c) => (seen.has(c.id) ? c.chainAfter.filter((first) => !seen.has(first)) : [])));
    const propaganda = unseen.find((c) => c.type === "propaganda");
    const mandatory = unseen.filter((c) => c.mandatory && c.type !== "propaganda").map((c) => c.id);
    const pool = rng.shuffle(unseen.filter((c) => !c.mandatory && c.deckEligible && c.type !== "propaganda" && !blocked.has(c.id)).map((c) => c.id));
    const slots: (CardId | null)[] = Array.from({ length: remaining }, () => null);
    if (propaganda !== undefined) {
      const first = scenario.propagandaLast ? remaining - 1 : Math.max(0, topSize - revealed);
      slots[Math.min(remaining - 1, first + rng.int(Math.max(1, remaining - first)))] = propaganda.id;
    }
    const top = rng.shuffle(slots.map((s, i) => (s === null && revealed + i < topSize ? i : -1)).filter((i) => i >= 0));
    for (const id of mandatory) {
      const at = top.shift() ?? slots.findIndex((s) => s === null);
      if (at >= 0) slots[at] = id;
    }
    const pile = slots.map((s) => s ?? pool.shift() ?? null).filter((s): s is CardId => s !== null);
    for (const card of cards) {
      for (const first of card.chainAfter) {
        const a = pile.indexOf(first);
        const b = pile.indexOf(card.id);
        if (a > b && b >= 0) [pile[a], pile[b]] = [card.id, first];
      }
    }
    return pile;
  });
}

/** A full GameState consistent with the observation: sampled piles, fresh RNG, no real hidden data. */
export function determinize(ruleset: Ruleset, obs: Observation, rng: SearchRng): GameState {
  const scenario = ruleset.scenarios[obs.meta.scenarioId];
  const seed = rng.seed();
  const seen = new Set(obs.played);
  const hands = Object.fromEntries(
    Object.entries(obs.handCounts).map(([f, n]) => [f, f === obs.viewer ? [...obs.ownHand] : (scenario?.pivotals?.[f] ?? []).filter((c) => !seen.has(c) && c !== obs.currentCard).slice(0, n)]),
  );
  const state: GameState = {
    meta: { ...obs.meta, seed },
    rng: seedRng(seed),
    turn: obs.turn,
    deck: { piles: samplePiles(ruleset, obs, rng), currentCard: obs.currentCard, played: obs.played, setAside: [] },
    hands,
    initiative: obs.initiative,
    spaces: obs.spaces,
    pools: obs.pools,
    markerPools: obs.markerPools,
    tracks: obs.tracks,
    flags: obs.flags,
    modifiers: obs.modifiers,
    hidden: obs.hiddenMarkers.map((h) => ({ ...h, placedAtSeq: 0 })),
    pending: obs.pending,
    history: obs.history,
    ended: obs.ended,
  };
  return state;
}
