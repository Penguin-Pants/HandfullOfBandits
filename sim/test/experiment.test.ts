// Phase 1 (20): manifest validation and frozen identity. Invalid input starts no game.
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { expandSeeds, freezeExperiment, ManifestError, parseManifest, readSeedRegistry, runtimeIdentity, type Manifest } from "../src/cli/experiment-manifest.ts";
import { runExperiment } from "../src/cli/experiment.ts";
import { devManifest, tempDir, writeManifest } from "./experiment-helpers.ts";

const runtime = runtimeIdentity();
const freeze = (m: Manifest): ReturnType<typeof freezeExperiment> => freezeExperiment(m, "/", runtime);
const rejects = (m: unknown, pattern: RegExp): void => {
  expect(() => freeze(parseManifest(JSON.stringify(m)))).toThrow(pattern);
};

describe("manifest validation (19 s2; 20 Phase 1)", () => {
  it("accepts a valid manifest and schedules every condition, matchup, seed and repeat", () => {
    const frozen = freeze(devManifest({ repeats: { perGame: 3, subset: 1 } }));
    expect(frozen.jobs.map((j) => [j.seed, j.repeat])).toEqual([[11, 0], [11, 1], [11, 2], [12, 0], [13, 0]]);
    expect(new Set(frozen.jobs.map((j) => j.gameId)).size).toBe(5);
    expect(frozen.jobs[0]?.playerSeeds["state"]).not.toBe(frozen.jobs[1]?.playerSeeds["state"]);
    expect(frozen.players["S-RANDOM@1"]?.faction).toBe("state");
  });

  it("gives identical input an identical identity and changed input a different one", () => {
    expect(freeze(devManifest()).experimentHash).toBe(freeze(devManifest()).experimentHash);
    expect(freeze(devManifest({ id: "other" })).experimentHash).not.toBe(freeze(devManifest()).experimentHash);
    expect(freezeExperiment(devManifest(), "/", { ...runtime, playerFingerprint: "0".repeat(64) }).experimentHash).not.toBe(freeze(devManifest()).experimentHash);
  });

  it("rejects malformed JSON and schema errors with every issue", () => {
    expect(() => parseManifest("{")).toThrow(/not JSON/);
    expect(() => parseManifest(JSON.stringify({ ...devManifest(), extra: 1 }))).toThrow(ManifestError);
    expect(() => parseManifest(JSON.stringify({ ...devManifest(), scenario: "s0" }))).toThrow(/scenario/);
    expect(() => parseManifest(JSON.stringify({ ...devManifest(), matchups: [] }))).toThrow(/matchups/);
    expect(() => parseManifest(JSON.stringify({ ...devManifest(), seeds: { registry: "development", blocks: [{ from: -1, count: 1 }] } }))).toThrow(/seeds/);
  });

  it("rejects a wrong package hash, thresholds, Harm limit and options", () => {
    rejects({ ...devManifest(), package: { ...devManifest().package, hash: "0".repeat(64) } }, /Package hash/);
    rejects({ ...devManifest(), expected: { ...devManifest().expected, thresholds: { state: 50, pkk: 30 } } }, /Threshold state/);
    rejects({ ...devManifest(), expected: { ...devManifest().expected, thresholds: { state: 49 } } }, /every faction/);
    rejects({ ...devManifest(), expected: { ...devManifest().expected, harmLimit: 7 } }, /Harm limit/);
    rejects({ ...devManifest(), conditions: [{ id: "x", options: { unknown: "allow" } }] }, /Unknown option/);
    rejects({ ...devManifest(), conditions: [{ id: "x", options: { hotPursuit: "maybe" } }] }, /hotPursuit must be/);
    rejects({ ...devManifest(), conditions: [{ id: "a", options: {} }, { id: "b", options: {} }] }, /differ in options/);
  });

  it("rejects unknown players, cross-faction seats and duplicate matchups", () => {
    rejects({ ...devManifest(), matchups: [{ state: "S-NOPE@1", pkk: "P-RANDOM@1" }] }, /Unknown player/);
    rejects({ ...devManifest(), matchups: [{ state: "S-POL@9", pkk: "P-RANDOM@1" }] }, /Unknown player/);
    rejects({ ...devManifest(), matchups: [{ state: "P-POL@1", pkk: "S-POL@1" }] }, /cross-faction/);
    rejects({ ...devManifest(), matchups: [{ state: "S-POL@1", pkk: "P-POL@1" }, { state: "S-POL@1", pkk: "P-POL@1" }] }, /Duplicate matchup/);
  });

  it("rejects duplicate seeds, seeds outside the registry and stage/registry mismatches", () => {
    rejects({ ...devManifest(), seeds: { registry: "development", blocks: [{ from: 1, count: 3 }, { from: 3, count: 1 }] } }, /distinct/);
    rejects({ ...devManifest(), seeds: { registry: "development", blocks: [{ from: 1000000, count: 1 }] } }, /outside the development/);
    rejects({ ...devManifest(), seeds: { registry: "evaluation", blocks: [{ from: 1000000, count: 1 }] } }, /must use development/);
    rejects({ ...devManifest(), repeats: { perGame: 2, subset: 9 } }, /Repeat subset/);
  });

  it("freezes evaluation stages: fingerprints required and checked, qualified players only", () => {
    const evaluation = { ...devManifest(), stage: "baseline", seeds: { registry: "evaluation", blocks: [{ from: 1000000, count: 2 }] } };
    rejects(evaluation, /frozen engine and player fingerprints/);
    const frozen = { ...evaluation, expected: { ...evaluation.expected, engineFingerprint: runtime.engineFingerprint, playerFingerprint: runtime.playerFingerprint } };
    rejects(frozen, /qualified players only/);
    expect(freeze(parseManifest(JSON.stringify({ ...frozen, matchups: [{ state: "S-POL@1", pkk: "P-POL@1" }] }))).jobs).toHaveLength(2);
    rejects({ ...frozen, expected: { ...frozen.expected, playerFingerprint: "f".repeat(64) } }, /Player fingerprint changed/);
    rejects({ ...frozen, expected: { ...frozen.expected, engineFingerprint: "f".repeat(64) } }, /Engine fingerprint changed/);
    rejects({ ...frozen, stage: "adversarial", matchups: [{ state: "S-POL@1", pkk: "P-POL@1" }] }, /one control/);
    expect(freeze(parseManifest(JSON.stringify({ ...frozen, stage: "adversarial", matchups: [{ state: "S-CTRL-concentration@1", pkk: "P-POL@1" }] }))).jobs).toHaveLength(2);
  });

  it("keeps the repository seed registry ranges disjoint and rejects an overlapping registry", () => {
    const registry = readSeedRegistry();
    const dev = new Set(expandSeeds(registry.development));
    expect(expandSeeds(registry.evaluation).some((s) => dev.has(s))).toBe(false);
    const dir = tempDir();
    const bad = join(dir, "registry.json");
    writeFileSync(bad, JSON.stringify({ development: [{ from: 1, count: 10 }], evaluation: [{ from: 5, count: 10 }] }));
    expect(() => readSeedRegistry(bad)).toThrow(/overlap/);
  });

  it("starts no game and creates no directory for an invalid manifest", async () => {
    const dir = tempDir();
    const out = join(dir, "out");
    await expect(runExperiment(writeManifest(dir, { ...devManifest(), expected: { ...devManifest().expected, harmLimit: 5 } }), out)).rejects.toThrow(/Harm limit/);
    expect(existsSync(out)).toBe(false);
  });
});
