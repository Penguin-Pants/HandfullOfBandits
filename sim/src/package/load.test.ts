import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { validateCommand } from "../cli/validate.ts";
import { loadPackage, readPackageDir, type RawPackage } from "./load.ts";

// T-PKG loader cases (11 P1-05): one invalid case per code, each with file, path and ID.
const validDir = fileURLToPath(new URL("../../test/fixtures/packages/valid", import.meta.url));
const raw = readPackageDir(validDir);
const temps: string[] = [];

afterAll(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

/** Copy of the valid fixture folder with `file` replaced by `text`. */
function tempPackage(file: string, text: string | null): string {
  const dir = mkdtempSync(join(tmpdir(), "pkg-"));
  temps.push(dir);
  cpSync(validDir, dir, { recursive: true });
  if (text === null) rmSync(join(dir, file));
  else writeFileSync(join(dir, file), text);
  return dir;
}

const DELETE = Symbol("delete");

/**
 * Copy of the parsed valid fixture with edits to one file. Keys are `/`-separated paths
 * (track IDs contain dots). A DELETE value removes the key.
 */
function changed(file: string, edits: Readonly<Record<string, unknown>>): RawPackage {
  const files = structuredClone(raw.files) as Record<string, unknown>;
  for (const [path, value] of Object.entries(edits)) {
    const keys = path.split("/");
    const last = keys.pop() ?? "";
    const parent = keys.reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], files[file]) as Record<string, unknown>;
    if (value === DELETE) Reflect.deleteProperty(parent, last);
    else parent[last] = value;
  }
  return { files, issues: [] };
}

describe("loadPackage on the valid fixture", () => {
  const result = loadPackage(raw);

  it("passes with no issues", () => {
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("reads an optional assumptions.yaml and checks its schema (04 s7)", () => {
    const entry = { id: "PA-01", gap: "GAP-B01", text: "Executing faction chooses", appliesTo: ["events.choice"], status: "accepted" };
    const present = loadPackage({ files: { ...raw.files, "assumptions.yaml": [entry] }, issues: [] });
    if (!present.ok) throw new Error(JSON.stringify(present.issues));
    expect(present.data.assumptions).toEqual([entry]);
    expect(present.hash).not.toBe(result.ok ? result.hash : "");
    const bad = loadPackage({ files: { ...raw.files, "assumptions.yaml": [{ ...entry, status: "open" }] }, issues: [] });
    expect(bad.issues).toContainEqual(expect.objectContaining({ code: "V-SCHEMA", file: "assumptions.yaml", path: "0.status", id: "PA-01" }));
  });

  it("compiles an overflow cost from its parameter", () => {
    const other = loadPackage(changed("tracks.yaml", { "1/overflow": { track: "resources.state", costParam: "sweep.costPerSpace" } }));
    if (!other.ok) throw new Error(JSON.stringify(other.issues));
    expect(other.ruleset.tracks.find((t) => t.id === "resources.pkk")).toMatchObject({ overflow: { track: "resources.state", cost: 2 } });
  });

  it("compiles the Ruleset core reads", () => {
    if (!result.ok) throw new Error("fixture must load");
    expect(result.ruleset.packageHash).toBe(result.hash);
    expect(result.ruleset.rulesetVersion).toBe("R1");
    expect(result.ruleset.pieces.find((p) => p.id === "troops")?.states).toEqual([]);
    expect(result.ruleset.pieces.find((p) => p.id === "guerrilla")?.states).toEqual(["underground", "active"]);
    expect(result.ruleset.markers.find((m) => m.id === "stateHarm")?.sides).toEqual([]);
    expect(result.ruleset.tracks.find((t) => t.id === "posture")).toEqual({ id: "posture", kind: "ordinal", steps: ["host", "tolerant", "hostile"] });
    expect(result.ruleset.spaces).toEqual([
      { id: "hills", hasSupportScale: true, kind: "domestic", terrain: "mountain", pop: 2 },
      { id: "town", hasSupportScale: true, kind: "domestic", terrain: "city", pop: 3 },
      { id: "camp", hasSupportScale: false, kind: "external", terrain: null, pop: 0 },
    ]);
    expect(result.ruleset.levelRange).toBe(2);
    expect(result.ruleset.factions.map((f) => f.resourcesTrack)).toEqual(["resources.state", "resources.pkk"]);
    expect(result.ruleset.markers.find((m) => m.id === "office")).toEqual({ id: "office", count: 2, sides: [], blocks: [], capsLevel: 1 });
    expect(result.ruleset.stacking[1]).toEqual({ pieces: ["pkkBase"], max: 0, spaceKind: null, terrain: ["city"], spaces: null });
    expect(result.ruleset.parameters).toEqual({ "sweep.costPerSpace": 2, "harm.limit": 6, "ui.label": "text" });
    expect(result.ruleset.pieces.find((p) => p.id === "pkkBase")?.countsForControl).toBe(true);
    expect(result.ruleset.victory.scores["pkk"]).toEqual([
      { type: "countPieces", pieces: ["pkkBase"], where: { type: "spaceKind", kind: "domestic" } },
    ]);
    expect(Object.keys(result.ruleset.victory.totals)).toEqual(["totalSupport"]);
    expect(result.ruleset.harmMarkers).toEqual(["stateHarm", "covert"]);
    expect(result.ruleset.scenarios).toEqual({
      s0: {
        campaigns: ["C1"],
        tracks: { "resources.state": 12, "resources.pkk": 5, posture: "tolerant" },
        // Bare piece counts go to the placedAs face, else `default`. Bare marker counts go to `default`.
        spaces: {
          hills: { level: -1, pieces: { troops: { default: 2 }, guerrilla: { underground: 1, active: 1 } }, markers: { stateHarm: { default: 1 } } },
          town: { level: 1, pieces: { troops: { default: 1 }, stateBase: { default: 1 } }, markers: { office: { default: 1 }, covert: { faceDown: 1 } } },
          camp: { level: null, pieces: { guerrilla: { underground: 2 }, pkkBase: { default: 1 } }, markers: {} },
        },
        available: { troops: 3, stateBase: 1, guerrilla: 2 },
        outOfPlay: { pkkBase: 1 },
        flags: {},
        thresholds: { state: 30, pkk: 20 },
      },
    });
  });

  it("compiles a faction with no Resources track to null", () => {
    const other = loadPackage(changed("factions.yaml", { "1/resourcesTrack": DELETE }));
    if (!other.ok) throw new Error(JSON.stringify(other.issues));
    expect(other.ruleset.factions[1]?.resourcesTrack).toBeNull();
  });

  it("compiles a non-tune parameter with no value to null", () => {
    const other = loadPackage(changed("parameters.yaml", { "2/value": DELETE }));
    if (!other.ok) throw new Error(JSON.stringify(other.issues));
    expect(other.ruleset.parameters["ui.label"]).toBeNull();
  });

  it("hashes content, not bytes: comments, spacing and key order do not change the hash", () => {
    const text = readFileSync(join(validDir, "parameters.yaml"), "utf8");
    const reformatted = `# comment\n${text.replaceAll("{id: ", "{ tune: true, id: ").replaceAll(", tune: true}", " }")}`;
    const other = loadPackage(readPackageDir(tempPackage("parameters.yaml", reformatted)));
    if (!result.ok || !other.ok) throw new Error("both must load");
    expect(other.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(other.hash).toBe(result.hash);
  });

  it("changes the hash when a value changes", () => {
    const other = loadPackage(changed("parameters.yaml", { "0/value": 3 }));
    if (!result.ok || !other.ok) throw new Error("both must load");
    expect(other.hash).not.toBe(result.hash);
  });
});

// [code, case, file, edits, expected path, expected ID]
const invalid: [string, string, string, Record<string, unknown>, string, string | null][] = [
  ["V-SCHEMA", "fraction in a list file", "pieces.yaml", { "2/count": 1.5 }, "2.count", "guerrilla"],
  ["V-REF", "piece of unknown faction", "pieces.yaml", { "0/faction": "army" }, "0.faction", "troops"],
  ["V-REF", "placedAs not a flip state", "pieces.yaml", { "2/placedAs": "hidden" }, "2.placedAs", "guerrilla"],
  ["V-REF", "emblemState without flip states", "pieces.yaml", { "1/emblemState": "active" }, "1.emblemState", "stateBase"],
  ["V-REF", "unknown resources track", "factions.yaml", { "1/resourcesTrack": "cash" }, "1.resourcesTrack", "pkk"],
  ["V-REF", "unknown track owner", "tracks.yaml", { "0/owner": "army" }, "0.owner", "resources.state"],
  ["V-REF", "unknown gate step", "map.yaml", { "links/1/gate/steps/1": "open" }, "links.1.gate.steps.1", "hills-camp"],
  ["V-REF", "gate on a numeric track", "map.yaml", { "links/1/gate/track": "resources.pkk" }, "links.1.gate.track", "hills-camp"],
  ["V-REF", "unknown stacking piece", "map.yaml", { "stacking/0/pieces": ["police"] }, "stacking.0.pieces.0", "stacking.0"],
  ["V-REF", "overflow to unknown track", "tracks.yaml", { "1/overflow": { track: "gold", costParam: "sweep.costPerSpace" } }, "1.overflow.track", "resources.pkk"],
  ["V-REF", "overflow to an ordinal track", "tracks.yaml", { "1/overflow": { track: "posture", costParam: "sweep.costPerSpace" } }, "1.overflow.track", "resources.pkk"],
  ["V-REF", "overflow to itself", "tracks.yaml", { "1/overflow": { track: "resources.pkk", costParam: "sweep.costPerSpace" } }, "1.overflow.track", "resources.pkk"],
  ["V-REF", "overflow cost unknown parameter", "tracks.yaml", { "1/overflow": { track: "resources.state", costParam: "cost" } }, "1.overflow.costParam", "resources.pkk"],
  ["V-PARAM", "overflow cost not a positive integer", "tracks.yaml", { "1/overflow": { track: "resources.state", costParam: "ui.label" } }, "1.overflow.costParam", "resources.pkk"],
  ["V-REF", "unknown scenario space", "scenarios/s0.yaml", { "spaces/city": {} }, "spaces.city", "city"],
  ["V-REF", "unknown flip state in setup", "scenarios/s0.yaml", { "spaces/hills/pieces/guerrilla": { hidden: 1, active: 1 } }, "spaces.hills.pieces.guerrilla.hidden", "hills"],
  ["V-REF", "two-sided marker as a bare count", "scenarios/s0.yaml", { "spaces/town/markers/covert": 1 }, "spaces.town.markers.covert", "town"],
  ["V-REF", "unknown ordinal step in setup", "scenarios/s0.yaml", { "tracks/posture": "open" }, "tracks.posture", "posture"],
  ["V-REF", "threshold for unknown faction", "scenarios/s0.yaml", { "thresholds/army": 1 }, "thresholds.army", "army"],
  ["V-PIECES", "piece total off by one", "scenarios/s0.yaml", { "available/troops": 4 }, "", "troops"],
  ["V-PIECES", "markers beyond supply", "scenarios/s0.yaml", { "spaces/hills/markers/office": 2 }, "", "office"],
  ["V-STACK", "two State Bases in a space", "scenarios/s0.yaml", { "spaces/town/pieces/stateBase": 2, "available/stateBase": 0 }, "spaces.town.pieces", "town"],
  ["V-STACK", "PKK Base in a city", "scenarios/s0.yaml", { "spaces/town/pieces/pkkBase": 1, "outOfPlay/pkkBase": 0 }, "spaces.town.pieces", "town"],
  ["V-LINKS", "link to unknown space", "map.yaml", { "links/0/b": "sea" }, "links.0.b", "hills-sea"],
  ["V-LINKS", "link listed twice", "map.yaml", { "links/2": { a: "town", b: "hills", kind: "land" } }, "links.2", "town-hills"],
  ["V-LINKS", "space linked to itself", "map.yaml", { "links/0/b": "hills" }, "links.0.b", "hills-hills"],
  ["V-PARAM", "tune parameter without value", "parameters.yaml", { "1/value": DELETE }, "1.value", "harm.limit"],
  ["V-FACTIONS", "one player faction", "factions.yaml", { "1/kind": "nonPlayer" }, "", null],
  ["V-RANGE", "level beyond the support scale", "scenarios/s0.yaml", { "spaces/town/level": 3 }, "spaces.town.level", "town"],
  ["V-RANGE", "level on a space with no support scale", "scenarios/s0.yaml", { "spaces/camp/level": 0 }, "spaces.camp.level", "camp"],
  ["V-RANGE", "support scale space without supportLevels", "map.yaml", { "supportLevels": DELETE }, "spaces.0.hasSupportScale", "hills"],
  ["V-REF", "score for unknown faction", "victory.yaml", { "scores/army": [{ type: "constant", value: 1 }] }, "scores.army", "army"],
  ["V-REF", "unknown piece in a term", "victory.yaml", { "scores/pkk/0/pieces/0": "camp" }, "scores.pkk.0.pieces.0", "pkk"],
  ["V-REF", "unknown marker in a term", "victory.yaml", { "harmCount/state/0/markers/0": "harm" }, "harmCount.state.0.markers.0", "state"],
  ["V-REF", "side the marker lacks", "victory.yaml", { "harmCount/state/1/sides/0": "old" }, "harmCount.state.1.sides.0", "state"],
  ["V-REF", "control by unknown faction", "victory.yaml", { "harmCount/state/1/where/faction": "army" }, "harmCount.state.1.where.faction", "state"],
  ["V-REF", "unknown track in a term", "victory.yaml", { "scores/state/1/track": "gold" }, "scores.state.1.track", "state"],
  ["V-REF", "ordinal track in a term", "victory.yaml", { "scores/state/1/track": "posture" }, "scores.state.1.track", "state"],
  ["V-REF", "unknown piece in a nested condition", "victory.yaml", { "totals/totalSupport/1/of/where": { type: "not", of: { type: "spaceHas", pieces: ["camp"] } } }, "totals.totalSupport.1.of.where.of.pieces.0", "totalSupport"],
  ["V-RANGE", "term level beyond the support scale", "victory.yaml", { "totals/totalSupport/1/of/where/levels/0": 3 }, "totals.totalSupport.1.of.where.levels.0", "totalSupport"],
  ["V-VICTORY", "player faction without a score", "victory.yaml", { "scores/pkk": DELETE }, "scores", "pkk"],
  ["V-VICTORY", "player faction without a threshold", "scenarios/s0.yaml", { "thresholds/pkk": DELETE }, "thresholds", "pkk"],
  ["V-VICTORY", "player faction without a Harm count", "victory.yaml", { "harmCount/state": DELETE }, "harmCount", "state"],
  ["V-RANGE", "numeric track above max", "scenarios/s0.yaml", { "tracks/resources.pkk": 51 }, "tracks.resources.pkk", "resources.pkk"],
];

describe("loadPackage on invalid packages", () => {
  it.each(invalid)("%s: %s", (code, _name, file, edits, path, id) => {
    const result = loadPackage(changed(file, edits));
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ level: "error", code, file, path, id }));
  });

  it("asks for supportLevels when a term has a level condition and the map has none", () => {
    const result = loadPackage(changed("map.yaml", { supportLevels: DELETE }));
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "V-RANGE", file: "victory.yaml", path: "totals.totalSupport.0.where.levels.0", message: "A level condition needs supportLevels in map.yaml." }),
    );
  });

  it("covers every error code the loader reports", () => {
    expect(new Set(invalid.map(([code]) => code))).toEqual(
      new Set(["V-SCHEMA", "V-REF", "V-PIECES", "V-STACK", "V-LINKS", "V-PARAM", "V-FACTIONS", "V-RANGE", "V-VICTORY"]),
    );
  });

  it("reports a missing core file", () => {
    const result = loadPackage(readPackageDir(tempPackage("markers.yaml", null)));
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "V-SCHEMA", file: "markers.yaml", message: "File is missing." }));
  });

  it("reports a YAML syntax error with its line", () => {
    const result = loadPackage(readPackageDir(tempPackage("tracks.yaml", "- {id: x\n")));
    expect(result.ok).toBe(false);
    expect(result.issues[0]).toMatchObject({ code: "V-SCHEMA", file: "tracks.yaml" });
    expect(result.issues[0]?.message).toBe("YAML error: Flow map in block collection must be sufficiently indented and end with a } at line 2, column 1.");
  });

  it("warns about files the loader does not read, and still loads", () => {
    const dir = tempPackage("sequence.yaml", "model: ct-two-faction@1\n");
    writeFileSync(join(dir, "scenarios", "s1.yml"), "id: s1\n");
    const result = loadPackage(readPackageDir(dir));
    expect(result.ok).toBe(true);
    expect(result.issues).toEqual([
      expect.objectContaining({ level: "warning", code: "V-SCHEMA", file: "scenarios/s1.yml", path: "", id: null }),
      expect.objectContaining({ level: "warning", code: "V-SCHEMA", file: "sequence.yaml", path: "", id: null }),
    ]);
  });

  it("reports a scenarios entry it cannot read as a folder", () => {
    const dir = tempPackage("scenarios/s0.yaml", null);
    rmSync(join(dir, "scenarios"), { recursive: true });
    writeFileSync(join(dir, "scenarios"), "not a folder\n");
    const result = loadPackage(readPackageDir(dir));
    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ level: "error", code: "V-SCHEMA", file: "scenarios", path: "" }));
  });

  it("reports a package file it cannot read and checks the other files", () => {
    const dir = tempPackage("markers.yaml", null);
    mkdirSync(join(dir, "markers.yaml"));
    writeFileSync(join(dir, "pieces.yaml"), "- {id: x}\n");
    const result = loadPackage(readPackageDir(dir));
    expect(result.issues).toContainEqual(expect.objectContaining({ level: "error", code: "V-SCHEMA", file: "markers.yaml", path: "" }));
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "V-SCHEMA", file: "pieces.yaml", path: "0.faction" }));
  });

  it("treats a piece ID that names an Object property as a plain ID", () => {
    const files = structuredClone(raw.files) as Record<string, unknown>;
    const pieces = files["pieces.yaml"] as Record<string, unknown>[];
    const map = files["map.yaml"] as { stacking: { pieces: string[] }[] };
    const s0 = files["scenarios/s0.yaml"] as { spaces: Record<string, { pieces: Record<string, unknown> }>; available: Record<string, unknown> };
    Object.assign(pieces[0] ?? {}, { id: "constructor" });
    Object.assign(map.stacking[2] ?? {}, { pieces: ["constructor", "stateBase"] });
    Object.assign(s0.spaces, { hills: { level: -1, pieces: { constructor: 5, guerrilla: { underground: 1, active: 1 } }, markers: { stateHarm: 1 } } });
    Object.assign(s0.spaces["town"]?.pieces ?? {}, { constructor: 1 });
    Reflect.deleteProperty(s0.spaces["town"]?.pieces ?? {}, "troops");
    Reflect.deleteProperty(s0.available, "troops");
    const result = loadPackage({ files, issues: [] });
    expect(result.issues).toEqual([]);
  });

  it("reports a duplicate YAML key", () => {
    const result = loadPackage(readPackageDir(tempPackage("manifest.yaml", `${readFileSync(join(validDir, "manifest.yaml"), "utf8")}title: Again\n`)));
    expect(result.issues[0]).toMatchObject({ code: "V-SCHEMA", file: "manifest.yaml" });
  });
});

describe("sim validate", () => {
  it("prints ok and the hash with exit code 0 for a valid package", () => {
    const { exitCode, lines } = validateCommand(validDir);
    expect(exitCode).toBe(0);
    expect(lines).toEqual([expect.stringMatching(/^ok .+ hash [0-9a-f]{64}$/)]);
  });

  it("prints warnings and exit code 0 when only warnings are found", () => {
    const { exitCode, lines } = validateCommand(tempPackage("cards.yaml", "[]\n"));
    expect(exitCode).toBe(0);
    expect(lines[0]).toMatch(/^warning V-SCHEMA cards\.yaml: /);
    expect(lines[1]).toMatch(/^ok /);
  });

  it("prints file, path, ID and sentence with exit code 1 for an invalid package", () => {
    const dir = tempPackage("parameters.yaml", "- {id: harm.limit, tune: true}\n");
    const cli = fileURLToPath(new URL("../cli/main.ts", import.meta.url));
    let status = 0;
    let stdout = "";
    try {
      execFileSync(process.execPath, [cli, "validate", dir], { encoding: "utf8" });
    } catch (e) {
      ({ status, stdout } = e as { status: number; stdout: string });
    }
    expect(status).toBe(1);
    expect(stdout).toBe("error V-PARAM parameters.yaml 0.value [harm.limit]: A tune parameter needs a value.\n");
  });
});
