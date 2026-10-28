import { describe, expect, it } from "vitest";
import { kurdish } from "../../../test/kurdish-package.ts";
import { seedRng } from "../core/rng.ts";
import { buildDeck, type ChainPair, type DeckCard, type DeckOptions } from "./deck.ts";

// P2-04 property tests (research 05 s1.1, 08 s2.1, s8) on a C1-shaped pool: 15 pool cards,
// 2 mandatory, one chain pair that ends in a mandatory card and one plain pair.
const { ruleset } = kurdish;
const SEEDS = 1000;
const TOP = 8;
const id = (n: number): string => `C1-${String(n).padStart(2, "0")}`;
const cards: DeckCard[] = [
  ...Array.from({ length: 15 }, (_, i): DeckCard => ({ id: id(i + 1), campaign: "C1", type: i < 9 ? "event" : "momentum", mandatory: i === 2 || i === 4, deckEligible: true })),
  { id: "C1-ineligible", campaign: "C1", type: "event", mandatory: false, deckEligible: false },
  { id: "C1-pivotal", campaign: "C1", type: "pivotal", mandatory: false, deckEligible: true },
  { id: "C1-P", campaign: "C1", type: "propaganda", mandatory: false, deckEligible: false },
  { id: "C2-01", campaign: "C2", type: "event", mandatory: false, deckEligible: true },
  { id: "C2-P", campaign: "C2", type: "propaganda", mandatory: false, deckEligible: false },
];
const chains: ChainPair[] = [
  { first: id(7), then: id(3) },
  { first: id(10), then: id(11) },
];
const campaign: DeckOptions = { campaigns: ["C1"], pileSize: null, propagandaLast: false, excluded: [] };

function piles(options: DeckOptions): (readonly string[])[] {
  return Array.from({ length: SEEDS }, (_, seed) => buildDeck(ruleset, seedRng(seed), cards, chains, options).piles[0] ?? []);
}

describe("buildDeck (05 s1.1)", () => {
  const built = piles(campaign);

  it("deals 12 Event cards and the Propaganda card from eligible pool cards only", () => {
    for (const pile of built) {
      expect(pile).toHaveLength(13);
      expect(new Set(pile).size).toBe(13);
      expect(pile.filter((c) => c === "C1-ineligible" || c === "C1-pivotal" || c.startsWith("C2"))).toEqual([]);
    }
  });

  it(`always puts mandatory cards, and a dealt earlier card of a pair ending in one, in the top ${String(TOP)}`, () => {
    for (const pile of built) {
      const top = pile.slice(0, TOP);
      for (const card of [id(3), id(5)]) expect(top).toContain(card);
      if (pile.includes(id(7))) expect(top).toContain(id(7));
    }
    expect(built.filter((pile) => pile.includes(id(7))).length).toBeGreaterThan(0);
  });

  it("always puts the Propaganda card at position 9 to 13, and uses each position", () => {
    const positions = new Set(built.map((pile) => pile.indexOf("C1-P") + 1));
    expect([...positions].sort((a, b) => a - b)).toEqual([9, 10, 11, 12, 13]);
  });

  it("keeps chain order when both cards are dealt (08 s8)", () => {
    for (const pile of built) {
      for (const { first, then } of chains) {
        if (pile.includes(first) && pile.includes(then)) expect(pile.indexOf(first)).toBeLessThan(pile.indexOf(then));
      }
    }
  });

  it("with propagandaLast and pile size 8, puts all 8 Event cards before the Propaganda card (S0)", () => {
    for (const pile of piles({ ...campaign, pileSize: 8, propagandaLast: true })) {
      expect(pile).toHaveLength(9);
      expect(pile[8]).toBe("C1-P");
    }
  });

  it("never deals an excluded card", () => {
    for (const pile of piles({ ...campaign, excluded: [id(1), id(2)] })) expect(pile.filter((c) => c === id(1) || c === id(2))).toEqual([]);
  });

  it("builds one pile per Campaign in order and is deterministic per seed (T-DET)", () => {
    const deck = buildDeck(ruleset, seedRng(7), cards, chains, { ...campaign, campaigns: ["C1", "C2"] });
    expect(deck.piles.map((p) => p.at(-1) === "C2-P" || p.includes("C1-P"))).toEqual([true, true]);
    expect(deck.piles[1]).toEqual(["C2-01", "C2-P"]);
    expect(buildDeck(ruleset, seedRng(7), cards, chains, { ...campaign, campaigns: ["C1", "C2"] })).toEqual(deck);
  });
});
