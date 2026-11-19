// Audit Plan 4 V1: variant overlays, derived Available and the resolved hash. Acceptance (designer
// decision V-3, 2026-11-19): each overlay plays the same scenario as the package copy its stored run
// used. The runs keep that copy's content in package-content.json.
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { diffCommand } from "../src/cli/diff.ts";
import { validateCommand } from "../src/cli/validate.ts";
import { loadPackage, packageContent, readPackageDir } from "../src/package/load.ts";
import { loadVariant, resolveVariant, variantNames } from "../src/package/variant.ts";
import { kurdish, kurdishDir } from "./kurdish-package.ts";

const runs = join(process.cwd(), "experiments", "runs");
const temps: string[] = [];
afterAll(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

/** A copy of the Kurdish package in a temporary folder. */
function packageCopy(): string {
  const dir = mkdtempSync(join(tmpdir(), "hob variant "));
  temps.push(dir);
  cpSync(kurdishDir, dir, { recursive: true });
  return dir;
}

const ok = <T extends { ok: boolean }>(result: T): Extract<T, { ok: true }> => {
  if (!result.ok) throw new Error(JSON.stringify(result));
  return result as Extract<T, { ok: true }>;
};

const scenarioFile = (data: { scenarios: Record<string, unknown> }) => data.scenarios["scenarios/full-campaign.yaml"] as Record<string, unknown>;

describe("derived Available (audit Plan 4 V1)", () => {
  it("gives the rule 10.2 Available pools for the full campaign", () => {
    expect(kurdish.ruleset.scenarios["full-campaign"]?.available).toEqual({ troops: 14, police: 4, stateBase: 4, guerrilla: 14, pkkBase: 9 });
    expect(scenarioFile(kurdish.data)["available"]).toBeUndefined();
  });

  it("reports V-PIECES when the map and Out of Play hold more than the total", () => {
    const files = structuredClone(readPackageDir(kurdishDir).files) as Record<string, { spaces: Record<string, { pieces: Record<string, number> }> }>;
    const hakkari = files["scenarios/full-campaign.yaml"]?.spaces["hakkari"];
    if (hakkari === undefined) throw new Error("no Hakkari");
    hakkari.pieces["troops"] = 17;
    const result = loadPackage({ files, issues: [] });
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ level: "error", code: "V-PIECES", id: "troops", message: "31 on the map + 0 out of play = 31, but pieces.yaml has 30." }));
  });
});

describe("variant overlays (audit Plan 4 V1)", () => {
  const pairs = [
    ["dd25-thresholds-43-38", "dd25-v4b-thresholds-43-38"],
    ["dd25-thresholds-46-35", "dd25-v4b-thresholds-46-35"],
    ["dd25-setup-police", "dd25-v4b-setup-police"],
    ["dd25-variant-a", "dd25-v4b-variant-a"],
    ["dd25-variant-b", "dd25-v4b-variant-b"],
  ] as const;

  it("lists the committed variants", () => {
    expect(variantNames(kurdishDir)).toEqual([...pairs.map(([name]) => name)].sort());
  });

  it.each(pairs)("%s plays the scenario and pieces of the package copy in run %s", (name, run) => {
    const variant = ok(loadVariant(kurdishDir, name));
    const stored = ok(loadPackage({ files: JSON.parse(readFileSync(join(runs, run, "package-content.json"), "utf8")) as Record<string, unknown>, issues: [] }));
    expect(variant.issues.filter((i) => i.level === "error")).toEqual([]);
    expect(variant.ruleset.scenarios["full-campaign"]).toEqual(stored.ruleset.scenarios["full-campaign"]);
    expect(variant.ruleset.pieces).toEqual(stored.ruleset.pieces);
  });

  it("writes the 43/38 thresholds variant in three lines", () => {
    const text = readFileSync(join(kurdishDir, "variants", "dd25-thresholds-43-38.yaml"), "utf8");
    expect(text.split(/\r?\n/).filter((line) => line.trim() !== "" && !line.trimStart().startsWith("#"))).toEqual([
      `base: ${kurdish.hash}`,
      "scenario: full-campaign",
      "thresholds: {state: 43, pkk: 38}",
    ]);
  });

  it("gives the variant its own hash, which a stored copy of the content keeps", () => {
    const variant = ok(loadVariant(kurdishDir, "dd25-thresholds-43-38"));
    expect(variant.hash).not.toBe(kurdish.hash);
    expect(ok(loadPackage({ files: packageContent(variant.data), issues: [] })).hash).toBe(variant.hash);
  });

  it("records the name, the base hash and each change in the resolved scenario", () => {
    const variant = ok(loadVariant(kurdishDir, "dd25-setup-police"));
    expect(scenarioFile(variant.data)["variant"]).toEqual({
      name: "dd25-setup-police",
      base: kurdish.hash,
      changes: [
        { kind: "piece", space: "siirt", id: "police", face: null, from: 1, to: 2 },
        { kind: "piece", space: "bitlis", id: "police", face: null, from: 1, to: 2 },
        { kind: "available", space: null, id: "police", face: null, from: 4, to: 2 },
      ],
    });
    const thresholds = ok(loadVariant(kurdishDir, "dd25-thresholds-43-38"));
    expect((scenarioFile(thresholds.data)["variant"] as { changes: unknown }).changes).toEqual([
      { kind: "threshold", space: null, id: "state", face: null, from: 49, to: 43 },
      { kind: "threshold", space: null, id: "pkk", face: null, from: 32, to: 38 },
    ]);
  });

  it("changes piece totals and Out of Play and derives Available from them", () => {
    const variant = ok(resolveVariant(kurdish, "more", { base: kurdish.hash, scenario: "full-campaign", pieces: { police: 26 }, outOfPlay: { guerrilla: 4 } }));
    expect(variant.ruleset.pieces.find((p) => p.id === "police")?.count).toBe(26);
    expect(variant.ruleset.scenarios["full-campaign"]?.available).toMatchObject({ police: 6, guerrilla: 10 });
    expect(variant.ruleset.scenarios["full-campaign"]?.outOfPlay).toEqual({ guards: 16, guerrilla: 4 });
  });

  it("holds only its own scenario, so a piece total does not break another scenario (PR #130 review)", () => {
    const dir = packageCopy();
    const scenarioPath = join(dir, "scenarios", "full-campaign.yaml");
    const second = readFileSync(scenarioPath, "utf8").replace("id: full-campaign", "id: second").replace("thresholds:", "available: {troops: 14, police: 4, stateBase: 4, guerrilla: 14, pkkBase: 9}\nthresholds:");
    writeFileSync(join(dir, "scenarios", "second.yaml"), second);
    const base = ok(loadPackage(readPackageDir(dir)));
    const variant = ok(resolveVariant(base, "more-police", { base: base.hash, scenario: "full-campaign", pieces: { police: 25 } }));
    expect(Object.keys(variant.ruleset.scenarios)).toEqual(["full-campaign"]);
    expect(variant.ruleset.scenarios["full-campaign"]?.available).toMatchObject({ police: 5 });
  });

  it("does not change the base hash or warn about the variants folder", () => {
    const dir = packageCopy();
    rmSync(join(dir, "variants"), { recursive: true });
    const without = ok(loadPackage(readPackageDir(dir)));
    expect(without.hash).toBe(kurdish.hash);
    expect(readPackageDir(kurdishDir).issues).toEqual([]);
  });

  it("finds no variants when a file takes the folder's name", () => {
    const dir = packageCopy();
    rmSync(join(dir, "variants"), { recursive: true });
    writeFileSync(join(dir, "variants"), "not a folder\n");
    expect(variantNames(dir)).toEqual([]);
    expect(validateCommand(dir).exitCode).toBe(0);
  });

  it("warns when the variant was made on another package hash", () => {
    const variant = ok(resolveVariant(kurdish, "old", { base: "0".repeat(64), scenario: "full-campaign", thresholds: { state: 43 } }));
    expect(variant.issues).toContainEqual(expect.objectContaining({ level: "warning", code: "V-VARIANT", file: "variants/old.yaml", path: "base" }));
  });

  it.each([
    ["an unknown scenario", { scenario: "short" }, "V-REF", "scenario"],
    ["an unknown piece total", { pieces: { tanks: 3 } }, "V-REF", "pieces.tanks"],
    ["a pool field it cannot set", { available: { troops: 1 } }, "V-SCHEMA", ""],
    ["a negative count", { outOfPlay: { troops: -1 } }, "V-SCHEMA", "outOfPlay.troops"],
    ["an unknown space", { spaces: { atlantis: { pieces: { troops: 1 } } } }, "V-REF", "spaces.atlantis"],
    ["more pieces than the total", { spaces: { hakkari: { level: -1, pieces: { troops: 17, police: 1, guerrilla: 2 } } } }, "V-PIECES", ""],
    ["a fourth State Base in a space", { spaces: { elazig: { level: 1, pieces: { troops: 1, police: 1, stateBase: 3 } } } }, "V-STACK", "spaces.elazig.pieces"],
    ["a level off the scale", { spaces: { siirt: { level: 3, pieces: { police: 1, guerrilla: 1 } } } }, "V-RANGE", "spaces.siirt.level"],
  ])("rejects %s and names the variant file", (_name, change, code, path) => {
    const result = resolveVariant(kurdish, "bad", { base: kurdish.hash, scenario: "full-campaign", ...change });
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ level: "error", code, file: "variants/bad.yaml", path }));
  });

  it("rejects a missing file and a bad name", () => {
    expect(loadVariant(kurdishDir, "nothing-here")).toEqual({ ok: false, issues: [expect.objectContaining({ code: "V-SCHEMA", file: "variants/nothing-here.yaml", message: "File is missing." })] });
    expect(loadVariant(kurdishDir, "Bad Name").issues[0]?.message).toMatch(/lowercase letters/);
  });
});

describe("sim validate and sim diff with variants (audit Plan 4 V1)", () => {
  it("checks each variant and prints its hash", () => {
    const { exitCode, lines } = validateCommand(kurdishDir);
    expect(exitCode).toBe(0);
    for (const name of variantNames(kurdishDir)) expect(lines).toContain(`ok variant ${name} hash ${ok(loadVariant(kurdishDir, name)).hash}`);
  });

  it("fails on a broken variant and names its file", () => {
    const dir = packageCopy();
    mkdirSync(join(dir, "variants"), { recursive: true });
    writeFileSync(join(dir, "variants", "broken.yaml"), `base: ${kurdish.hash}\nscenario: full-campaign\nspaces: {atlantis: {}}\n`);
    const { exitCode, lines } = validateCommand(dir);
    expect(exitCode).toBe(1);
    expect(lines).toContain("error: variant broken does not load");
    expect(lines.some((l) => l.startsWith("error V-REF variants/broken.yaml spaces.atlantis"))).toBe(true);
  });

  it("lists setup changes between two packages", () => {
    const dir = packageCopy();
    const file = join(dir, "scenarios", "full-campaign.yaml");
    writeFileSync(file, readFileSync(file, "utf8").replace("siirt: {level: -1, pieces: {police: 1, guerrilla: 1}}", "siirt: {level: -1, pieces: {police: 2, guerrilla: 1}}"));
    const { lines } = diffCommand(kurdishDir, dir);
    expect(lines.slice(-3)).toEqual(["Setup full-campaign: 2 changed", "  ~ piece siirt police: 1 to 2", "  ~ available police: 4 to 3"]);
  });
});
