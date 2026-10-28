// Deck building (research 05 s1.1, 08 s2.1 and s8; 11 P2-04). Pure: the seeded generator is input
// and output (05 s8 item 3). Card data comes from the package card files (P2-05).
import { param } from "../core/params.ts";
import { randomInt, shuffle, type RngState } from "../core/rng.ts";
import type { CardId, Ruleset } from "../core/types.ts";

/** The card fields the builder reads. */
export interface DeckCard {
  readonly id: CardId;
  readonly campaign: string;
  /** Pivotal cards stay in hands and never enter a pile. */
  readonly type: "event" | "capability" | "momentum" | "pivotal" | "propaganda";
  readonly mandatory: boolean;
  readonly deckEligible: boolean;
}

/** A section 8 pair: `first` lies above `then` when both are in a pile. */
export interface ChainPair {
  readonly first: CardId;
  readonly then: CardId;
}

export interface DeckOptions {
  readonly campaigns: readonly string[];
  /** Event cards per pile. Null: parameter `deck.pileSize`. */
  readonly pileSize: number | null;
  /** S0: the Propaganda card goes last, so every Event card plays (DEC-20). */
  readonly propagandaLast: boolean;
  readonly excluded: readonly CardId[];
}

export interface BuiltDeck {
  readonly rng: RngState;
  /** One pile per Campaign, top card first. */
  readonly piles: readonly (readonly CardId[])[];
}

const POOL_TYPES = new Set<DeckCard["type"]>(["event", "capability", "momentum"]);

/** Swap so that the earlier card of each pair lies above the later one (08 s8). */
function chainOrder(pile: CardId[], chains: readonly ChainPair[]): void {
  let moved = true;
  for (let pass = 0; moved && pass <= pile.length; pass++) {
    moved = false;
    for (const { first, then } of chains) {
      const a = pile.indexOf(first);
      const b = pile.indexOf(then);
      if (a > b && b >= 0) {
        pile[a] = then;
        pile[b] = first;
        moved = true;
      }
    }
  }
}

/** Mandatory cards plus the earlier card of any chain pair that ends in a mandatory card (05 s1.1 step 4). */
function mandatorySet(cards: readonly DeckCard[], chains: readonly ChainPair[]): Set<CardId> {
  const set = new Set(cards.filter((c) => c.mandatory).map((c) => c.id));
  let grew = true;
  while (grew) {
    grew = false;
    for (const { first, then } of chains) {
      if (set.has(then) && !set.has(first)) {
        set.add(first);
        grew = true;
      }
    }
  }
  return set;
}

/** Build one pile per Campaign in order (05 s1.1 steps 1 to 7). */
export function buildDeck(ruleset: Ruleset, rng: RngState, cards: readonly DeckCard[], chains: readonly ChainPair[], options: DeckOptions): BuiltDeck {
  const pileSize = options.pileSize ?? param(ruleset, "deck.pileSize", "number");
  const topParam = param(ruleset, "deck.topSize", "number");
  const excluded = new Set(options.excluded);
  const mandatory = mandatorySet(cards, chains);
  const piles: CardId[][] = [];
  let current = rng;
  for (const campaign of options.campaigns) {
    const inCampaign = cards.filter((c) => c.campaign === campaign && !excluded.has(c.id));
    const required = inCampaign.filter((c) => c.mandatory && POOL_TYPES.has(c.type)).map((c) => c.id);
    const pool = inCampaign.filter((c) => !c.mandatory && c.deckEligible && POOL_TYPES.has(c.type)).map((c) => c.id);
    const drawn = shuffle(current, pool);
    const dealt = shuffle(drawn.rng, [...required, ...drawn.value.slice(0, Math.max(0, pileSize - required.length))]);
    current = dealt.rng;
    const pile = dealt.value;
    const topSize = Math.min(topParam, pile.length);
    // Step 4: a mandatory card in the bottom part swaps with the lowest non-mandatory card of the top part.
    for (let i = topSize; i < pile.length; i++) {
      const card = pile[i];
      if (card === undefined || !mandatory.has(card)) continue;
      const free = pile.slice(0, topSize).findLastIndex((c) => !mandatory.has(c));
      if (free < 0) break;
      pile[i] = pile[free] ?? card;
      pile[free] = card;
    }
    chainOrder(pile, chains);
    const propaganda = inCampaign.find((c) => c.type === "propaganda")?.id;
    if (propaganda !== undefined) {
      // Step 6: shuffle the Propaganda card into the bottom part (any of its gaps), or last in S0.
      const bottom = pile.length - topSize;
      const at = options.propagandaLast ? { value: bottom, rng: current } : randomInt(current, bottom + 1);
      current = at.rng;
      pile.splice(topSize + at.value, 0, propaganda);
    }
    piles.push(pile);
  }
  return { rng: current, piles };
}
