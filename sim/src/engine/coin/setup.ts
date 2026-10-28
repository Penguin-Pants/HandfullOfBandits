// Game start (research 10 s1 steps 1 to 6): scenario position, deck, Pivotal hands, First Eligible.
import { setupState } from "../core/state.ts";
import type { GameState, Ruleset } from "../core/types.ts";
import { buildDeck, type ChainPair } from "./deck.ts";
import { resetEligibility } from "./sequence/ct.ts";

/** Start state of a scenario. A scenario with scenario-scoped errors cannot start (DEC-51). */
export function startState(ruleset: Ruleset, scenarioId: string, seed: number): GameState {
  const state = setupState(ruleset, scenarioId, seed);
  const scenario = ruleset.scenarios[scenarioId];
  if (scenario === undefined) throw new RangeError(`Unknown scenario "${scenarioId}"`);
  if (scenario.blockedBy.length > 0) throw new RangeError(`Scenario "${scenarioId}" cannot start: ${scenario.blockedBy.join(" ")}`);
  const cards = Object.values(ruleset.cards);
  const chains: ChainPair[] = cards.flatMap((card) => card.chainAfter.map((first) => ({ first, then: card.id })));
  const deck =
    cards.length === 0
      ? { rng: state.rng, piles: [] }
      : buildDeck(ruleset, state.rng, cards, chains, {
          campaigns: scenario.campaigns,
          pileSize: scenario.pileSize,
          propagandaLast: scenario.propagandaLast,
          excluded: scenario.excludedCards,
        });
  const hands = Object.fromEntries(Object.keys(state.hands).map((f) => [f, [...(scenario.pivotals?.[f] ?? [])]]));
  return resetEligibility(ruleset, { ...state, rng: deck.rng, deck: { ...state.deck, piles: deck.piles }, hands });
}
