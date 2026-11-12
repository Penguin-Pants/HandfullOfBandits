// Experiment manifests (19 s2; 20 Phase 1): versioned input, validated before any game starts, and
// the frozen identity captured from the runtime. Seeds come from a repository seed registry that
// keeps development and evaluation seeds disjoint.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { cpus } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { canonicalHash } from "../engine/core/canonical.ts";
import { param } from "../engine/core/params.ts";
import type { FactionId, Ruleset } from "../engine/core/types.ts";
import { codeFingerprint, sourceFingerprint } from "../package/fingerprint.ts";
import { loadPackage, readPackageDir, withSessionOptions } from "../package/load.ts";
import type { PackageData } from "../package/validate.ts";
import { GENERATOR_VERSION } from "./candidates.ts";
import type { GameJob } from "./game-runner.ts";
import { OBSERVATION_VERSION } from "./player-observation.ts";
import { resolvePlayer } from "./player-registry.ts";
import type { PlayerSpec } from "./players.ts";

export const MANIFEST_SCHEMA_VERSION = 1;
/** Files that decide game play besides the engine: players, candidates, observations and the game loop. */
export const PLAYER_FILES = ["candidates.ts", "game-runner.ts", "play.ts", "player-observation.ts", "player-registry.ts", "players.ts"];
export const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
export const SEED_REGISTRY = join(repoRoot, "sim", "experiments", "seed-registry.json");

const hex64 = z.string().regex(/^[0-9a-f]{64}$/);
const seed = z.number().int().min(0).max(2 ** 32 - 1);
const block = z.strictObject({ from: seed, count: z.number().int().min(1).max(100000) });
const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/);

export const STAGES = ["qualification", "development", "pilot", "baseline", "options", "adversarial", "confirmation"] as const;
/** Stages whose seeds must be evaluation seeds and whose players must be qualified (19 s2, s7). */
const EVALUATION_STAGES: readonly string[] = ["baseline", "options", "adversarial", "confirmation"];

export const manifestSchema = z.strictObject({
  schemaVersion: z.literal(MANIFEST_SCHEMA_VERSION),
  id,
  stage: z.enum(STAGES),
  description: z.string().min(1),
  scenario: z.literal("full-campaign"),
  package: z.strictObject({ dir: z.string().min(1), hash: hex64 }),
  expected: z.strictObject({
    thresholds: z.record(z.string(), z.number().int()),
    harmLimit: z.number().int(),
    /** Frozen code identity. Null only in development and pilot stages. */
    engineFingerprint: hex64.nullable(),
    playerFingerprint: hex64.nullable(),
  }),
  conditions: z.array(z.strictObject({ id, options: z.record(z.string(), z.string()) })).min(1),
  matchups: z.array(z.strictObject({ state: z.string(), pkk: z.string() })).min(1),
  seeds: z.strictObject({ registry: z.enum(["development", "evaluation"]), blocks: z.array(block).min(1) }),
  /** Repeated player seeds per game seed for the first `subset` game seeds (19 s7). */
  repeats: z.strictObject({ perGame: z.number().int().min(1).max(20), subset: z.number().int().min(0) }),
  limits: z.strictObject({ commands: z.number().int().min(1).max(10000), decisionMs: z.number().int().min(1).nullable(), gameMs: z.number().int().min(1000).max(3600000) }),
  concurrency: z.number().int().min(1).max(64),
  analysis: z.strictObject({
    reportVersion: z.number().int().min(1),
    bootstrap: z.strictObject({ samples: z.number().int().min(100).max(100000), seed }),
    warnings: z.strictObject({ cellWinPercent: z.number().int().min(0).max(100), rosterAveragePercent: z.number().int().min(0).max(100), marginGap: z.number().int().min(0) }),
    exclusions: z.array(z.string()),
  }),
  /** Earlier attempt whose failed games this run repeats (20 cross-cutting: reruns are new linked attempts). */
  supersedes: id.nullable(),
});

export type Manifest = z.infer<typeof manifestSchema>;

const registrySchema = z.strictObject({ development: z.array(block), evaluation: z.array(block) });

export interface RuntimeIdentity {
  readonly engineFingerprint: string;
  readonly playerFingerprint: string;
  readonly gitCommit: string;
  readonly gitDirty: boolean;
  /** Hash of `git status --porcelain` and the diff for the tracked inputs; null when clean. */
  readonly dirtyDigest: string | null;
  readonly lockHash: string;
  readonly node: string;
  readonly platform: string;
  readonly cpus: number;
  readonly generatorVersion: string;
  readonly observationVersion: number;
  readonly rngVersion: string;
}

export interface FrozenExperiment {
  readonly manifest: Manifest;
  readonly experimentHash: string;
  readonly runtime: RuntimeIdentity;
  readonly packageDir: string;
  readonly packageContentHash: string;
  readonly players: Readonly<Record<string, PlayerSpec>>;
  readonly jobs: readonly GameJob[];
}

export class ManifestError extends Error {}

/** Expand seed blocks in order. */
export function expandSeeds(blocks: readonly { from: number; count: number }[]): number[] {
  return blocks.flatMap((b) => Array.from({ length: b.count }, (_, i) => b.from + i));
}

function inside(seeds: readonly number[], blocks: readonly { from: number; count: number }[]): boolean {
  return seeds.every((s) => blocks.some((b) => s >= b.from && s < b.from + b.count));
}

/** Reads the repository seed registry and checks its two ranges are disjoint. */
export function readSeedRegistry(file = SEED_REGISTRY): z.infer<typeof registrySchema> {
  const registry = registrySchema.parse(JSON.parse(readFileSync(file, "utf8")));
  for (const d of registry.development) for (const e of registry.evaluation) if (d.from < e.from + e.count && e.from < d.from + d.count) throw new ManifestError("Seed registry development and evaluation ranges overlap");
  return registry;
}

/** Stable 32-bit player seed from experiment, game and faction (19 s7). */
export function playerSeed(experimentId: string, gameId: string, faction: FactionId): number {
  return Number.parseInt(createHash("sha256").update(`${experimentId}\u0000${gameId}\u0000${faction}`).digest("hex").slice(0, 8), 16);
}

/** Stable game ID: condition, players, seed and repeat. */
export function gameId(condition: string, state: string, pkk: string, s: number, repeat: number): string {
  return `${condition}~${state}~${pkk}~${String(s)}~r${String(repeat)}`.replaceAll("@", "v");
}

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unknown";
  }
}

/** Identity of the code and machine that run the experiment (19 s2). */
export function runtimeIdentity(): RuntimeIdentity {
  const paths = ["sim/src", "sim/package-lock.json", "sim/experiments", "game-packages"];
  const status = git(["status", "--porcelain", "--", ...paths]);
  const dirty = status !== "" && status !== "unknown";
  return {
    engineFingerprint: codeFingerprint(),
    playerFingerprint: sourceFingerprint("cli", ["strategies"], PLAYER_FILES),
    gitCommit: git(["rev-parse", "HEAD"]),
    gitDirty: dirty,
    dirtyDigest: dirty ? createHash("sha256").update(status).update(git(["diff", "HEAD", "--", ...paths])).digest("hex") : null,
    lockHash: createHash("sha256").update(readFileSync(join(repoRoot, "sim", "package-lock.json"))).digest("hex"),
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
    cpus: cpus().length,
    generatorVersion: GENERATOR_VERSION,
    observationVersion: OBSERVATION_VERSION,
    rngVersion: "xoshiro128**-1.1",
  };
}

/** Parse JSON text into a manifest, or throw ManifestError listing every schema issue. */
export function parseManifest(text: string): Manifest {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new ManifestError(`Manifest is not JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
  const parsed = manifestSchema.safeParse(raw);
  if (!parsed.success) throw new ManifestError(`Manifest schema: ${parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ")}`);
  return parsed.data;
}

/** Ruleset for one condition: package options validated against the package manifest. */
export function conditionRuleset(ruleset: Ruleset, data: PackageData, scenario: string, options: Readonly<Record<string, string>>): Ruleset {
  const declared = (data.manifest as { options?: Record<string, { values: string[] }> }).options ?? {};
  for (const [key, value] of Object.entries(options)) {
    const allowed = declared[key]?.values;
    if (allowed === undefined) throw new ManifestError(`Unknown option ${key}`);
    if (!allowed.includes(value)) throw new ManifestError(`Option ${key} must be one of ${allowed.join(", ")}`);
  }
  return withSessionOptions(ruleset, scenario, options);
}

/**
 * Validate a manifest against the package, players, seed registry and runtime, then freeze it.
 * Throws ManifestError before any game starts (20 Phase 1 acceptance).
 */
export function freezeExperiment(manifest: Manifest, manifestDir: string, runtime: RuntimeIdentity = runtimeIdentity(), registryFile = SEED_REGISTRY): FrozenExperiment & { readonly ruleset: Ruleset; readonly data: PackageData } {
  const packageDir = resolve(manifestDir, manifest.package.dir);
  const loaded = loadPackage(readPackageDir(packageDir));
  if (!loaded.ok) throw new ManifestError(`Package ${packageDir} does not load`);
  if (loaded.hash !== manifest.package.hash) throw new ManifestError(`Package hash ${loaded.hash} does not match manifest ${manifest.package.hash}`);
  const scenario = loaded.ruleset.scenarios[manifest.scenario];
  if (scenario === undefined || scenario.blockedBy.length > 0) throw new ManifestError(`Scenario ${manifest.scenario} is missing or blocked`);
  for (const [f, t] of Object.entries(manifest.expected.thresholds)) if (scenario.thresholds[f] !== t) throw new ManifestError(`Threshold ${f} is ${String(scenario.thresholds[f])}, manifest expects ${String(t)}`);
  if (Object.keys(scenario.thresholds).length !== Object.keys(manifest.expected.thresholds).length) throw new ManifestError("Manifest thresholds must list every faction");
  if (param(loaded.ruleset, "harm.limit", "number") !== manifest.expected.harmLimit) throw new ManifestError(`Harm limit is ${String(param(loaded.ruleset, "harm.limit", "number"))}, manifest expects ${String(manifest.expected.harmLimit)}`);
  if (manifest.expected.engineFingerprint !== null && manifest.expected.engineFingerprint !== runtime.engineFingerprint) throw new ManifestError(`Engine fingerprint changed: frozen ${manifest.expected.engineFingerprint}, now ${runtime.engineFingerprint}`);
  if (manifest.expected.playerFingerprint !== null && manifest.expected.playerFingerprint !== runtime.playerFingerprint) throw new ManifestError(`Player fingerprint changed: frozen ${manifest.expected.playerFingerprint}, now ${runtime.playerFingerprint}`);
  const evaluation = EVALUATION_STAGES.includes(manifest.stage);
  if (evaluation && (manifest.expected.engineFingerprint === null || manifest.expected.playerFingerprint === null)) throw new ManifestError(`Stage ${manifest.stage} needs frozen engine and player fingerprints`);
  if (evaluation !== (manifest.seeds.registry === "evaluation")) throw new ManifestError(`Stage ${manifest.stage} must use ${evaluation ? "evaluation" : "development"} seeds`);
  if (new Set(manifest.conditions.map((c) => c.id)).size !== manifest.conditions.length) throw new ManifestError("Condition IDs must be distinct");
  const conditionKeys = new Set(manifest.conditions.map((c) => canonicalHash(c.options)));
  if (conditionKeys.size !== manifest.conditions.length) throw new ManifestError("Conditions must differ in options");
  for (const c of manifest.conditions) conditionRuleset(loaded.ruleset, loaded.data, manifest.scenario, c.options);

  const seeds = expandSeeds(manifest.seeds.blocks);
  if (new Set(seeds).size !== seeds.length) throw new ManifestError("Seeds must be distinct");
  const registry = readSeedRegistry(registryFile);
  if (!inside(seeds, registry[manifest.seeds.registry])) throw new ManifestError(`Seeds lie outside the ${manifest.seeds.registry} registry range`);
  if (manifest.repeats.subset > seeds.length) throw new ManifestError("Repeat subset exceeds the seed count");

  const players: Record<string, PlayerSpec> = {};
  const pairs = new Set<string>();
  for (const m of manifest.matchups) {
    for (const [seat, pid] of [["state", m.state], ["pkk", m.pkk]] as const) {
      let spec: PlayerSpec;
      try {
        spec = resolvePlayer(pid).spec;
      } catch (e) {
        throw new ManifestError(e instanceof Error ? e.message : String(e));
      }
      if (spec.faction !== seat) throw new ManifestError(`${pid} plays ${spec.faction}, not the ${seat} seat (no cross-faction substitution)`);
      players[pid] = spec;
    }
    const roles = [players[m.state]?.role, players[m.pkk]?.role];
    if (["pilot", "baseline", "options", "confirmation"].includes(manifest.stage) && roles.some((r) => r !== "qualified")) throw new ManifestError(`Stage ${manifest.stage} accepts qualified players only: ${m.state} vs ${m.pkk}`);
    if (manifest.stage === "adversarial" && !(roles.includes("qualified") && roles.includes("control"))) throw new ManifestError(`Adversarial cells pair one control with one qualified player: ${m.state} vs ${m.pkk}`);
    const key = `${m.state}|${m.pkk}`;
    if (pairs.has(key)) throw new ManifestError(`Duplicate matchup ${key}`);
    pairs.add(key);
  }

  const jobs: GameJob[] = [];
  for (const c of manifest.conditions) {
    for (const m of manifest.matchups) {
      for (const [index, s] of seeds.entries()) {
        const repeats = index < manifest.repeats.subset ? manifest.repeats.perGame : 1;
        for (let r = 0; r < repeats; r++) {
          const gid = gameId(c.id, m.state, m.pkk, s, r);
          jobs.push({ gameId: gid, seed: s, conditionId: c.id, players: { state: m.state, pkk: m.pkk }, playerSeeds: { state: playerSeed(manifest.id, gid, "state"), pkk: playerSeed(manifest.id, gid, "pkk") }, repeat: r });
        }
      }
    }
  }
  const codeIdentity = { ...runtime, node: null, platform: null, cpus: null };
  const experimentHash = canonicalHash({ manifest, code: codeIdentity, packageHash: loaded.hash });
  return { manifest, experimentHash, runtime, packageDir, packageContentHash: loaded.hash, players, jobs, ruleset: loaded.ruleset, data: loaded.data };
}
