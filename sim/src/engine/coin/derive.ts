// Derived view (05 s1 item 5, s9 item 1): Control, named totals, scores, Harm counts and
// margins, recomputed from state and never stored in it (05 s2).
import { total } from "../core/effects/common.ts";
import { own } from "../core/state.ts";
import { sumTerms, type TermContext } from "../core/terms.ts";
import type { DerivedView, FactionId, FormulaTerm, GameState, Ruleset, SpaceId } from "../core/types.ts";

/**
 * Control per space (research 03 s6, CT 1.7): a faction controls a space when its pieces with
 * countsForControl exceed those of all other factions combined. Ties, empty spaces and
 * external spaces have no Control. With two factions this is 03 s6 as written.
 */
export function control(ruleset: Ruleset, state: GameState): Record<SpaceId, FactionId | null> {
  const counted = ruleset.pieces.filter((p) => p.countsForControl);
  return Object.fromEntries(
    ruleset.spaces.map((space): [SpaceId, FactionId | null] => {
      const pieces = state.spaces[space.id]?.pieces;
      if (space.kind === "external" || pieces === undefined) return [space.id, null];
      const byFaction = new Map<FactionId, number>();
      for (const p of counted) byFaction.set(p.faction, (byFaction.get(p.faction) ?? 0) + total(pieces[p.id]));
      const all = [...byFaction.values()].reduce((sum, n) => sum + n, 0);
      const winner = [...byFaction].find(([, n]) => n > all - n);
      return [space.id, winner?.[0] ?? null];
    }),
  );
}

export function derive(ruleset: Ruleset, state: GameState): DerivedView {
  const ctx: TermContext = { ruleset, state, control: control(ruleset, state) };
  const sums = (lists: Readonly<Record<string, readonly FormulaTerm[]>>): Record<string, number> =>
    Object.fromEntries(Object.entries(lists).map(([key, terms]) => [key, sumTerms(ctx, terms)]));
  const scores = sums(ruleset.victory.scores);
  const thresholds = own(ruleset.scenarios, state.meta.scenarioId)?.thresholds;
  const margins = Object.fromEntries(
    Object.entries(scores).flatMap(([faction, score]) => {
      const threshold = own(thresholds, faction);
      return threshold === undefined ? [] : [[faction, score - threshold]];
    }),
  );
  return { control: ctx.control, totals: sums(ruleset.victory.totals), scores, harm: sums(ruleset.victory.harmCount), margins };
}
