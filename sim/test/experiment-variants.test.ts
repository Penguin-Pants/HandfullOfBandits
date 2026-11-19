// Audit Plan 4 V3: a study names a variant, not a package copy. The run records the variant; the
// report says the players were qualified on the baseline package (designer decision V-2).
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { freezeExperiment, ManifestError, newManifest, parseManifest } from "../src/cli/experiment-manifest.ts";
import { loadVariant, variantNames } from "../src/package/variant.ts";
import { devManifest, tempDir, writeManifest } from "./experiment-helpers.ts";
import { kurdishDir } from "./kurdish-package.ts";

const main = fileURLToPath(new URL("../src/cli/main.ts", import.meta.url));
const manifests = fileURLToPath(new URL("../experiments/manifests/", import.meta.url));
const variant = loadVariant(kurdishDir, "dd25-thresholds-43-38");
if (!variant.ok) throw new Error("variant must load");

/** A study file naming the 43/38 variant: no hash, no expected values. */
function study(): Record<string, unknown> {
  const draft: Record<string, unknown> = { ...devManifest({ seeds: { registry: "development", blocks: [{ from: 41, count: 1 }] } }), package: { dir: kurdishDir, variant: "dd25-thresholds-43-38" } };
  delete draft["expected"];
  delete draft["supersedes"];
  return draft;
}

describe("variants in experiment manifests (audit Plan 4 V3)", () => {
  it("makes, runs and reports a study that names a variant", () => {
    const dir = tempDir("hob variant study ");
    const out = join(dir, "made.json");
    const made = spawnSync(process.execPath, [main, "experiment", "new", writeManifest(dir, study(), "study.json"), "--out", out], { encoding: "utf8" });
    expect(made.status, made.stderr + made.stdout).toBe(0);
    const m = parseManifest(readFileSync(out, "utf8"));
    expect(m.package).toMatchObject({ variant: "dd25-thresholds-43-38", hash: variant.hash });
    expect(m.expected.thresholds).toEqual({ state: 43, pkk: 38 });

    const runDir = join(dir, "run");
    const run = spawnSync(process.execPath, [main, "experiment", "run", out, "--out", runDir], { encoding: "utf8" });
    expect(run.status, run.stderr + run.stdout).toBe(0);
    expect(JSON.parse(readFileSync(join(runDir, "manifest.json"), "utf8"))).toMatchObject({ package: { variant: "dd25-thresholds-43-38", hash: variant.hash } });
    const content = JSON.parse(readFileSync(join(runDir, "package-content.json"), "utf8")) as Record<string, { variant?: { name: string } }>;
    expect(content["scenarios/full-campaign.yaml"]?.variant?.name).toBe("dd25-thresholds-43-38");

    const analyzed = spawnSync(process.execPath, [main, "experiment", "analyze", runDir], { encoding: "utf8" });
    expect(analyzed.status, analyzed.stderr + analyzed.stdout).toBe(0);
    const report = readFileSync(join(runDir, "analysis-v2", "report.md"), "utf8");
    expect(report).toContain("Setup variant `dd25-thresholds-43-38`");
    expect(report).toContain("qualified on the baseline package, not on this variant");
  }, 120000);

  it("refuses an unknown variant and a variant hash that changed", () => {
    const dir = tempDir();
    expect(() => freezeExperiment(devManifest({ package: { dir: kurdishDir, hash: variant.hash, variant: "nothing-here" } }), dir)).toThrow(new ManifestError(`Package ${kurdishDir} variant nothing-here does not load`));
    expect(() => freezeExperiment(devManifest({ package: { dir: kurdishDir, hash: "0".repeat(64), variant: "dd25-thresholds-43-38" } }), dir)).toThrow(/does not match/);
  });

  it("writes no variant line for a study on the package itself", () => {
    const dir = tempDir();
    const m = newManifest(writeManifest(dir, { ...study(), package: { dir: kurdishDir } }, "study.json"), join(dir, "m.json"));
    expect(m.package.variant).toBeUndefined();
  });

  it("names a variant in each dd25 test manifest; no package copy is left", () => {
    expect(existsSync(fileURLToPath(new URL("../experiments/packages", import.meta.url)))).toBe(false);
    const named = readdirSync(manifests).filter((f) => f.startsWith("dd25-")).map((f) => parseManifest(readFileSync(join(manifests, f), "utf8"))).filter((m) => m.package.variant !== undefined);
    expect(named.map((m) => m.id).sort()).toEqual(["dd25-v4-variant-a", "dd25-v4b-confirm-43-38", "dd25-v4b-setup-police", "dd25-v4b-thresholds-43-38", "dd25-v4b-thresholds-46-35", "dd25-v4b-variant-a", "dd25-v4b-variant-b"]);
    for (const m of named) {
      expect(resolve(manifests, m.package.dir)).toBe(resolve(kurdishDir));
      expect(variantNames(kurdishDir)).toContain(m.package.variant);
    }
    // Each still records the hash of the copy it ran on: the runs keep that content.
    for (const m of named) expect(JSON.parse(readFileSync(join(dirname(manifests), "runs", m.id, "identity.json"), "utf8"))).toMatchObject({ packageHash: m.package.hash });
  });
});
