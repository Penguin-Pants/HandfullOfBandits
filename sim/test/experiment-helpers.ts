// Experiment test helpers: a valid development manifest and a temporary directory.
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { kurdish, kurdishDir } from "./kurdish-package.ts";
import type { Manifest } from "../src/cli/experiment-manifest.ts";

export function tempDir(prefix = "hob exp "): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function devManifest(overrides: Partial<Manifest> = {}): Manifest {
  return {
    schemaVersion: 1,
    id: "test-dev",
    stage: "development",
    description: "test",
    scenario: "scenario-a",
    package: { dir: kurdishDir, hash: kurdish.hash },
    expected: { thresholds: { state: 49, pkk: 30 }, harmLimit: 6, engineFingerprint: null, playerFingerprint: null },
    conditions: [{ id: "baseline", options: { hotPursuit: "allow", syriaMarchRestricted: "allow" } }],
    matchups: [{ state: "S-RANDOM@1", pkk: "P-RANDOM@1" }],
    seeds: { registry: "development", blocks: [{ from: 11, count: 3 }] },
    repeats: { perGame: 1, subset: 0 },
    limits: { commands: 2000, decisionMs: null, gameMs: 120000 },
    concurrency: 2,
    analysis: { reportVersion: 1, bootstrap: { samples: 200, seed: 1 }, warnings: { cellWinPercent: 80, rosterAveragePercent: 60, marginGap: 10 }, exclusions: [] },
    supersedes: null,
    ...overrides,
  };
}

/** Write a manifest into `dir` and return its path. */
export function writeManifest(dir: string, manifest: unknown, name = "manifest.json"): string {
  const file = join(dir, name);
  writeFileSync(file, typeof manifest === "string" ? manifest : JSON.stringify(manifest));
  return file;
}
