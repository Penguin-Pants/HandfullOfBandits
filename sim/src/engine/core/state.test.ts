import { describe, expect, it } from "vitest";
import { canonicalHash, canonicalJson } from "./canonical.ts";
import { seedRng } from "./rng.ts";
import { emptyState, setupState, SINGLE_FACE } from "./state.ts";
import type { Ruleset, RulesetScenario } from "./types.ts";

const ruleset: Ruleset = {
  packageHash: "abc123",
  rulesetVersion: "R1",
  factions: [
    { id: "blue", kind: "player", resourcesTrack: null },
    { id: "red", kind: "player", resourcesTrack: null },
    { id: "town", kind: "nonPlayer", resourcesTrack: null },
  ],
  pieces: [
    { id: "soldier", faction: "blue", count: 5, states: [], placedAs: null, startPool: "available", countsForControl: true },
    { id: "militia", faction: "blue", count: 3, states: [], placedAs: null, startPool: "outOfPlay", countsForControl: true },
    { id: "rebel", faction: "red", count: 4, states: ["hidden", "shown"], placedAs: "hidden", startPool: "available", countsForControl: true },
  ],
  spaces: [
    { id: "city", hasSupportScale: true, kind: "domestic", terrain: "city", pop: 0 },
    { id: "camp", hasSupportScale: false, kind: "external", terrain: null, pop: 0 },
  ],
  tracks: [
    { id: "cash", kind: "numeric", min: 3, max: 9, overflow: null },
    { id: "mood", kind: "ordinal", steps: ["calm", "tense"] },
  ],
  markers: [
    { id: "harm", count: 6, sides: [], blocks: [], capsLevel: null },
    { id: "camp", count: 2, sides: ["new", "old"], blocks: [], capsLevel: null },
  ],
  stacking: [],
  levelRange: 2,
  parameters: {},
  victory: { scores: {}, harmCount: {}, totals: {} },
  sequence: { model: "ct-two-faction@1", boxes: [], adjacency: [], swapAfter: [], firstEligibleAtStart: "blue", passIncome: {} },
  links: [],
  cards: {},
  harmMarkers: [],
  scenarios: {},
};

describe("emptyState", () => {
  const state = emptyState(ruleset, "s0", 42);

  it("records package, scenario and seed in meta at stateSeq 0", () => {
    expect(state.meta).toEqual({
      packageHash: "abc123",
      rulesetVersion: "R1",
      scenarioId: "s0",
      seed: 42,
      stateSeq: 0,
    });
  });

  it("seeds the generator from the seed", () => {
    expect(state.rng).toEqual(seedRng(42));
  });

  it("puts every piece in its start pool", () => {
    expect(state.pools).toEqual({
      soldier: { available: 5, outOfPlay: 0 },
      militia: { available: 0, outOfPlay: 3 },
      rebel: { available: 4, outOfPlay: 0 },
    });
  });

  it("puts every marker in its pool", () => {
    expect(state.markerPools).toEqual({ harm: 6, camp: 2 });
  });

  it("gives every space a zero count for every piece face and marker side", () => {
    const empty = {
      pieces: {
        soldier: { [SINGLE_FACE]: 0 },
        militia: { [SINGLE_FACE]: 0 },
        rebel: { hidden: 0, shown: 0 },
      },
      markers: { harm: { [SINGLE_FACE]: 0 }, camp: { new: 0, old: 0 } },
    };
    expect(state.spaces).toEqual({
      city: { ...empty, level: 0 },
      camp: { ...empty, level: null },
    });
  });

  it("starts numeric tracks at min and ordinal tracks at the first step", () => {
    expect(state.tracks).toEqual({ cash: 3, mood: "calm" });
  });

  it("keys hands and initiative by player faction only", () => {
    expect(state.hands).toEqual({ blue: [], red: [] });
    expect(state.initiative).toEqual({
      boxes: { blue: null, red: null },
      firstEligible: null,
      secondEligible: null,
      actedThisCard: [],
    });
  });

  it("starts in setup with an empty deck and no open records", () => {
    expect(state.turn).toEqual({ campaign: null, propagandaRound: 0, cardIndex: 0, phase: "setup", step: 0 });
    expect(state.deck).toEqual({ piles: [], currentCard: null, played: [], setAside: [] });
    expect([state.flags, state.modifiers, state.hidden, state.pending, state.history, state.ended]).toEqual([
      {},
      [],
      [],
      null,
      {},
      null,
    ]);
  });

  it("rejects an ordinal track with no steps", () => {
    const bad: Ruleset = { ...ruleset, tracks: [{ id: "void", kind: "ordinal", steps: [] }] };
    expect(() => emptyState(bad, "s0", 1)).toThrow("void");
  });

  it("round trips through canonical JSON with the same hash", () => {
    const text = canonicalJson(state);
    const parsed: unknown = JSON.parse(text);
    expect(parsed).toEqual(state);
    expect(canonicalHash(parsed)).toBe(canonicalHash(state));
  });

  it("gives the same hash for the same inputs and a new hash for a new seed", () => {
    expect(canonicalHash(emptyState(ruleset, "s0", 42))).toBe(canonicalHash(state));
    expect(canonicalHash(emptyState(ruleset, "s0", 43))).not.toBe(canonicalHash(state));
  });
});

describe("setupState", () => {
  const scenario: RulesetScenario = {
    finalRound: 2,
    pileSize: null,
    propagandaLast: false,
    excludedCards: [],
    pivotals: null,
    options: {},
    blockedBy: [],
    campaigns: ["C2", "C3"],
    tracks: { cash: 5, mood: "tense" },
    spaces: {
      city: { level: -1, pieces: { soldier: { [SINGLE_FACE]: 2 }, rebel: { hidden: 1, shown: 1 } }, markers: { camp: { old: 1 } } },
      camp: { level: null, pieces: { rebel: { hidden: 1 } }, markers: { harm: { [SINGLE_FACE]: 2 } } },
    },
    available: { soldier: 3, rebel: 1 },
    outOfPlay: { militia: 3 },
    flags: { law: true },
    thresholds: { blue: 10 },
  };
  const rules: Ruleset = { ...ruleset, scenarios: { s1: scenario } };
  const state = setupState(rules, "s1", 7);

  it("keeps meta and generator from emptyState", () => {
    expect(state.meta).toEqual(emptyState(rules, "s1", 7).meta);
    expect(state.rng).toEqual(seedRng(7));
  });

  it("writes levels, pieces and markers of the listed spaces", () => {
    expect(state.spaces["city"]).toEqual({
      level: -1,
      pieces: { soldier: { [SINGLE_FACE]: 2 }, militia: { [SINGLE_FACE]: 0 }, rebel: { hidden: 1, shown: 1 } },
      markers: { harm: { [SINGLE_FACE]: 0 }, camp: { new: 0, old: 1 } },
    });
    expect(state.spaces["camp"]?.level).toBeNull();
    expect(state.spaces["camp"]?.pieces["rebel"]).toEqual({ hidden: 1, shown: 0 });
  });

  it("sets pools from the scenario, 0 when not listed, and marker supply to count minus the map", () => {
    expect(state.pools).toEqual({
      soldier: { available: 3, outOfPlay: 0 },
      militia: { available: 0, outOfPlay: 3 },
      rebel: { available: 1, outOfPlay: 0 },
    });
    expect(state.markerPools).toEqual({ harm: 4, camp: 1 });
  });

  it("sets tracks, flags and the first campaign", () => {
    expect(state.tracks).toEqual({ cash: 5, mood: "tense" });
    expect(state.flags).toEqual({ law: true });
    expect(state.turn.campaign).toBe("C2");
  });

  it("keeps the empty value of a track or space the scenario does not list", () => {
    const bare: Ruleset = { ...ruleset, scenarios: { s1: { ...scenario, tracks: {}, spaces: {} } } };
    const empty = emptyState(bare, "s1", 7);
    const set = setupState(bare, "s1", 7);
    expect(set.tracks).toEqual(empty.tracks);
    expect(set.spaces).toEqual(empty.spaces);
  });

  it("rejects an unknown scenario", () => {
    expect(() => setupState(rules, "nope", 7)).toThrow('Unknown scenario "nope"');
  });
});
