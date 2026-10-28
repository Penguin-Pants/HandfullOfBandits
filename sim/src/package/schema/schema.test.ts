import { describe, expect, it } from "vitest";
import { packageFileSchemas, parsePackageFile, type PackageFile } from "./index.ts";

// T-PKG schema cases (11 P1-04). One valid file per schema. Each invalid case
// changes one value and must fail with the path of that value.

const valid: Record<PackageFile, unknown> = {
  manifest: {
    packageId: "tiny",
    version: "0.1.0",
    rulesetVersion: "R1",
    schemaVersion: 1,
    parent: { version: "0.0.9", rulesetVersion: "R0" },
    changeDescription: "First version",
    title: "Tiny",
    modules: ["ct-two-faction@1", "tiny.raid@2"],
    options: { threshold: { values: [48, 46], description: "DEC-24" } },
    researchBase: "research/research-final",
  },
  parameters: [
    { id: "sweep.costPerSpace", value: 2, tune: true, source: "06 s3.1" },
    { id: "harm.limits", value: [3, "none"], tune: false },
    { id: "civicAction.capDivisor", tune: true },
  ],
  factions: [
    { id: "blue", name: "Blue", color: "#c00", kind: "player", resourcesTrack: "cash.blue", pivotalHand: ["T-9"] },
    { id: "town", name: "Town", color: "grey", kind: "nonPlayer", status: "recommended" },
  ],
  pieces: [
    {
      id: "rebel",
      faction: "blue",
      count: 4,
      isBase: false,
      states: ["underground", "active"],
      placedAs: "underground",
      countsForControl: true,
      movable: true,
      startPool: "available",
      shape: "octagon",
      emblem: "starCircle",
      emblemState: "active",
    },
    {
      id: "camp",
      faction: "blue",
      count: 2,
      isBase: true,
      countsForControl: true,
      movable: false,
      startPool: "outOfPlay",
      shape: "disc",
      colorVariant: "light",
    },
  ],
  map: {
    spaces: [
      { id: "city", name: "City", kind: "domestic", terrain: "city", pop: 2, hasSupportScale: true, layout: { x: 10, y: -4 } },
      { id: "box", name: "Box", kind: "external", pop: 0, hasSupportScale: false, layout: { x: 0, y: 0 }, tags: ["noLandLinks"] },
    ],
    links: [{ a: "city", b: "box", kind: "external", gate: { track: "mood", steps: ["calm"] } }],
    stacking: [{ pieces: ["camp"], max: 0, terrain: ["city"], source: "03 s5 item 3" }],
  },
  tracks: [
    { id: "cash.blue", kind: "numeric", min: 0, max: 50, owner: "blue", display: "Blue Resources" },
    { id: "mood", kind: "ordinal", steps: ["calm", "tense"], display: "Mood", status: "tune" },
  ],
  markers: [
    { id: "harm", count: 6, blocks: ["support"], countsAs: "blue" },
    { id: "secret", count: 2, sides: ["faceDown", "revealed"], hidden: true },
  ],
  scenario: {
    id: "s0",
    title: "Slice",
    campaigns: ["C1"],
    finalRound: 1,
    tracks: { "cash.blue": 5, mood: "calm" },
    spaces: { city: { level: -1, pieces: { rebel: { underground: 2 }, camp: 1 }, markers: { harm: 1 } } },
    available: { rebel: 2 },
    outOfPlay: { camp: 1 },
    pivotals: { blue: [] },
    flags: { law3175: true },
    thresholds: { blue: 30 },
    options: { threshold: 48 },
    excludedCards: [{ card: "T-2", reason: "Not encoded" }],
    testOnly: true,
  },
};

const DELETE = Symbol("delete");

/** Set (or delete) the value at a dot path in a copy of the valid fixture. */
function changed(file: PackageFile, path: string, value: unknown): unknown {
  const data: unknown = structuredClone(valid[file]);
  const keys = path.split(".");
  const last = keys.pop() ?? "";
  const parent = keys.reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], data) as Record<string, unknown>;
  if (value === DELETE) {
    Reflect.deleteProperty(parent, last);
  } else {
    parent[last] = value;
  }
  return data;
}

// [file, case, changed path, new value, expected issue path]
const invalid: [PackageFile, string, string, unknown, string][] = [
  ["manifest", "missing title", "title", DELETE, "title"],
  ["manifest", "bad semver", "version", "0.1", "version"],
  ["manifest", "bad ruleset version", "rulesetVersion", "1", "rulesetVersion"],
  ["manifest", "schema version 2", "schemaVersion", 2, "schemaVersion"],
  ["manifest", "module without major", "modules.1", "tiny.raid", "modules.1"],
  ["manifest", "option with one value", "options.threshold.values", [48], "options.threshold.values"],
  ["manifest", "unknown key", "titel", "x", ""],
  ["parameters", "fraction value", "0.value", 0.5, "0.value"],
  ["parameters", "duplicate ID", "2.id", "sweep.costPerSpace", "2.id"],
  ["parameters", "missing tune", "1.tune", DELETE, "1.tune"],
  ["factions", "unknown kind", "1.kind", "neutral", "1.kind"],
  ["factions", "bad ID", "0.id", "blue team", "0.id"],
  ["pieces", "unknown shape", "0.shape", "star", "0.shape"],
  ["pieces", "unknown emblem", "0.emblem", "flag", "0.emblem"],
  ["pieces", "states without placedAs", "0.placedAs", DELETE, "0.placedAs"],
  ["pieces", "one flip state", "0.states", ["active"], "0.states"],
  ["pieces", "zero count", "1.count", 0, "1.count"],
  ["map", "domestic space without terrain", "spaces.0.terrain", DELETE, "spaces.0.terrain"],
  ["map", "negative pop", "spaces.1.pop", -1, "spaces.1.pop"],
  ["map", "fraction layout", "spaces.0.layout.x", 1.5, "spaces.0.layout.x"],
  ["map", "unknown link kind", "links.0.kind", "air", "links.0.kind"],
  ["map", "empty gate steps", "links.0.gate.steps", [], "links.0.gate.steps"],
  ["map", "stacking without pieces", "stacking.0.pieces", [], "stacking.0.pieces"],
  ["tracks", "min above max", "0.min", 60, "0.max"],
  ["tracks", "duplicate step", "1.steps", ["calm", "calm"], "1.steps"],
  ["tracks", "unknown kind", "1.kind", "dial", "1.kind"],
  ["markers", "unknown block direction", "0.blocks", ["neutral"], "0.blocks.0"],
  ["markers", "duplicate block direction", "0.blocks", ["support", "support"], "0.blocks"],
  ["markers", "one side", "1.sides", ["faceDown"], "1.sides"],
  ["scenario", "final round 0", "finalRound", 0, "finalRound"],
  ["scenario", "negative piece count", "spaces.city.pieces.rebel.underground", -2, "spaces.city.pieces.rebel.underground"],
  ["scenario", "fraction level", "spaces.city.level", 0.5, "spaces.city.level"],
  ["scenario", "excluded card without reason", "excludedCards.0.reason", DELETE, "excludedCards.0.reason"],
];

describe("package schemas", () => {
  it("has a valid fixture for each schema", () => {
    expect(Object.keys(valid).sort()).toEqual(Object.keys(packageFileSchemas).sort());
  });

  it.each(Object.entries(valid))("parses the valid %s fixture", (file, data) => {
    expect(parsePackageFile(file as PackageFile, data)).toEqual({ ok: true, value: data });
  });

  it.each(invalid)("%s: %s fails at its path", (file, _name, at, value, path) => {
    const result = parsePackageFile(file, changed(file, at, value));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.map((issue) => issue.path)).toContain(path);
  });

  it("gives a sentence for each issue", () => {
    const result = parsePackageFile("factions", [{ id: "blue" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.issues.every((issue) => issue.message.length > 0)).toBe(true);
  });
});
