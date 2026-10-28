import { describe, expect, it } from "vitest";
import { canonicalHash, canonicalJson } from "./canonical.ts";
import { seedRng } from "./rng.ts";
import { emptyState, SINGLE_FACE } from "./state.ts";
import type { Ruleset } from "./types.ts";

const ruleset: Ruleset = {
  packageHash: "abc123",
  rulesetVersion: "R1",
  factions: [
    { id: "blue", kind: "player" },
    { id: "red", kind: "player" },
    { id: "town", kind: "nonPlayer" },
  ],
  pieces: [
    { id: "soldier", faction: "blue", count: 5, states: [], startPool: "available" },
    { id: "militia", faction: "blue", count: 3, states: [], startPool: "outOfPlay" },
    { id: "rebel", faction: "red", count: 4, states: ["hidden", "shown"], startPool: "available" },
  ],
  spaces: [
    { id: "city", hasSupportScale: true },
    { id: "camp", hasSupportScale: false },
  ],
  tracks: [
    { id: "cash", kind: "numeric", min: 3, max: 9 },
    { id: "mood", kind: "ordinal", steps: ["calm", "tense"] },
  ],
  markers: [
    { id: "harm", count: 6, sides: [] },
    { id: "camp", count: 2, sides: ["new", "old"] },
  ],
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
