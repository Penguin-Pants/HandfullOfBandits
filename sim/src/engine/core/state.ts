// Empty game state for a ruleset (05 s2) and the scenario start position (P1-10).
// Every space holds a count for every piece face and marker side, zero included,
// so one board has exactly one canonical form and one hash.
import { seedRng } from "./rng.ts";
import type { FaceCounts, GameState, Ruleset, SpaceState } from "./types.ts";

/** Face key for a piece type with no flip states or a marker with one side. */
export const SINGLE_FACE = "default";

function zeroFaces(faces: readonly string[]): FaceCounts {
  return Object.fromEntries((faces.length === 0 ? [SINGLE_FACE] : faces).map((face) => [face, 0]));
}

/** All pieces in their start pools, all markers in supply, tracks at their low end, phase `setup`. */
export function emptyState(ruleset: Ruleset, scenarioId: string, seed: number): GameState {
  const players = ruleset.factions.filter((faction) => faction.kind === "player").map((faction) => faction.id);
  const space = (hasSupportScale: boolean): SpaceState => ({
    pieces: Object.fromEntries(ruleset.pieces.map((piece) => [piece.id, zeroFaces(piece.states)])),
    level: hasSupportScale ? 0 : null,
    markers: Object.fromEntries(ruleset.markers.map((marker) => [marker.id, zeroFaces(marker.sides)])),
  });
  return {
    meta: {
      packageHash: ruleset.packageHash,
      rulesetVersion: ruleset.rulesetVersion,
      scenarioId,
      seed,
      stateSeq: 0,
    },
    rng: seedRng(seed),
    turn: { campaign: null, propagandaRound: 0, cardIndex: 0, phase: "setup", step: 0 },
    deck: { piles: [], currentCard: null, played: [], setAside: [] },
    hands: Object.fromEntries(players.map((id) => [id, []])),
    initiative: {
      boxes: Object.fromEntries(players.map((id) => [id, null])),
      firstEligible: null,
      secondEligible: null,
      actedThisCard: [],
    },
    spaces: Object.fromEntries(ruleset.spaces.map((s) => [s.id, space(s.hasSupportScale)])),
    pools: Object.fromEntries(
      ruleset.pieces.map((piece) => [
        piece.id,
        piece.startPool === "available"
          ? { available: piece.count, outOfPlay: 0 }
          : { available: 0, outOfPlay: piece.count },
      ]),
    ),
    markerPools: Object.fromEntries(ruleset.markers.map((marker) => [marker.id, marker.count])),
    tracks: Object.fromEntries(
      ruleset.tracks.map((track): [string, number | string] => {
        if (track.kind === "numeric") return [track.id, track.min];
        const first = track.steps[0];
        if (first === undefined) throw new RangeError(`Ordinal track ${track.id} has no steps`);
        return [track.id, first];
      }),
    ),
    flags: {},
    modifiers: [],
    hidden: [],
    pending: null,
    history: {},
    ended: null,
  };
}

/** Own entry only: an ID such as `constructor` must not read an Object property. */
export function own<T>(record: Readonly<Record<string, T>> | undefined, key: string): T | undefined {
  return record !== undefined && Object.hasOwn(record, key) ? record[key] : undefined;
}

/** Face counts with every face of the type, zero included, and the scenario counts written in. */
function withCounts(base: FaceCounts, counts: FaceCounts | undefined): FaceCounts {
  return { ...base, ...counts };
}

/**
 * Scenario start position (04 s4.10): emptyState with the scenario tracks, flags, spaces and pools
 * written in. Marker supply is each count minus the markers on the map. The game starts in the
 * first listed campaign. Data passed the loader checks (V-REF, V-PIECES), so counts reconcile.
 */
export function setupState(ruleset: Ruleset, scenarioId: string, seed: number): GameState {
  const scenario = own(ruleset.scenarios, scenarioId);
  if (scenario === undefined) throw new RangeError(`Unknown scenario "${scenarioId}"`);
  const empty = emptyState(ruleset, scenarioId, seed);
  const spaces = Object.fromEntries(
    Object.entries(empty.spaces).map(([id, space]): [string, SpaceState] => {
      const setup = own(scenario.spaces, id);
      if (setup === undefined) return [id, space];
      return [
        id,
        {
          level: setup.level ?? space.level,
          pieces: Object.fromEntries(Object.entries(space.pieces).map(([type, faces]) => [type, withCounts(faces, own(setup.pieces, type))])),
          markers: Object.fromEntries(Object.entries(space.markers).map(([type, faces]) => [type, withCounts(faces, own(setup.markers, type))])),
        },
      ];
    }),
  );
  const onMap = (marker: string): number =>
    Object.values(spaces).reduce((sum, space) => sum + Object.values(space.markers[marker] ?? {}).reduce((a, n) => a + n, 0), 0);
  return {
    ...empty,
    turn: { ...empty.turn, campaign: scenario.campaigns[0] ?? null },
    spaces,
    pools: Object.fromEntries(
      ruleset.pieces.map((piece) => [piece.id, { available: own(scenario.available, piece.id) ?? 0, outOfPlay: own(scenario.outOfPlay, piece.id) ?? 0 }]),
    ),
    markerPools: Object.fromEntries(ruleset.markers.map((marker) => [marker.id, marker.count - onMap(marker.id)])),
    tracks: { ...empty.tracks, ...scenario.tracks },
    flags: { ...scenario.flags },
  };
}
