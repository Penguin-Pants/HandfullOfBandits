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
    supportLevels: ["opposition", "neutral", "support"],
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
    { id: "harm", count: 6, blocks: ["support"], capsLevel: 1 },
    { id: "secret", count: 2, sides: ["faceDown", "revealed"], hidden: true },
  ],
  // Every defaulted field is set, so the parsed value equals the input.
  victory: {
    scores: {
      blue: [
        { type: "sumPopWhere", where: { type: "all", of: [{ type: "spaceKind", kind: "domestic" }, { type: "spaceLevelIn", levels: [1] }] } },
        { type: "multiply", of: { type: "trackValue", track: "cash.blue" }, by: -1 },
      ],
    },
    harmCount: {
      blue: [
        { type: "countMarkers", markers: ["harm"], sides: null, where: null },
        { type: "countPieces", pieces: ["camp"], where: { type: "not", of: { type: "control", faction: "blue" } } },
      ],
    },
    totals: {
      bases: [
        { type: "divideFloor", of: { type: "add", terms: [{ type: "constant", value: 3 }] }, by: 2 },
        { type: "sumPopWhere", where: { type: "any", of: [{ type: "terrainIn", terrain: ["city"] }, { type: "spaceHas", pieces: ["camp"], markers: [] }] } },
      ],
    },
  },
  sequence: {
    model: "ct-two-faction@1",
    boxes: [
      { id: "event", label: "Event" },
      { id: "pass", label: "Pass" },
    ],
    adjacency: [["pass", "event"]],
    swapAfter: ["event"],
    firstEligibleAtStart: "blue",
    passIncome: { blue: 2 },
    propagandaPhases: ["victory", "resources"],
    source: "05 s2",
  },
  scenario: {
    id: "s0",
    title: "Slice",
    campaigns: ["C1"],
    finalRound: 1,
    pileSize: 8,
    propagandaLast: true,
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
  cards: [
    {
      id: "T-1",
      campaign: "C1",
      title: "Raid",
      date: "1984-08-15",
      type: "event",
      mandatory: true,
      always: [{ type: "transferPool", piece: "guard", from: "outOfPlay", to: "available", count: "all" }],
      unshaded: {
        text: "Place 2 soldiers in City or Farm.",
        owner: "blue",
        blockOnly: false,
        tier: "T1",
        effects: [
          { type: "choice", options: [{ label: "City", effects: [{ type: "placePieces", piece: "soldier", count: 2, space: "city", state: null }] }, { label: "Farm", effects: [] }] },
          { type: "adjustTrack", track: "cash.blue", delta: 2 },
          {
            type: "forEachSpace",
            where: { type: "all", of: [{ type: "terrainIn", terrain: ["plain"] }, { type: "adjacentTo", space: "city" }, { type: "trackAtLeast", track: "cash.blue", value: 1 }] },
            min: 0,
            max: 2,
            effects: [{ type: "placePieces", piece: "soldier", count: { min: 0, max: 2 }, space: "selected", state: null }],
          },
        ],
      },
      shaded: {
        text: "Move rebels.",
        owner: "red",
        blockOnly: false,
        effects: [
          { type: "movePieces", piece: "rebel", state: null, toState: "hidden", count: { min: 0, max: 3 }, from: "refuge", to: "hills" },
          { type: "conditional", if: { type: "trackIn", track: "mood", values: ["calm"] }, then: [{ type: "setTrack", track: "mood", value: "tense", ifEquals: "calm" }], else: [] },
          { type: "freeAction", action: "red.attack", constraints: { spaces: ["hills"] } },
          { type: "removePieces", piece: "soldier", state: null, count: 1, space: "hills", to: "available" },
          { type: "placeMarker", marker: "harm", space: "hills", side: null },
          { type: "stepOrdinal", track: "mood", direction: "next", steps: 1 },
          { type: "shiftLevel", space: "hills", direction: "opposition", steps: 1 },
          { type: "setPieceState", piece: "rebel", space: "hills", from: "hidden", to: "shown", count: "all" },
          { type: "setFlag", flag: "law", value: true },
        ],
      },
      chainAfter: ["T-0"],
      encoding: { status: "encoded", encodedBy: "designer", reviewedAgainstText: true, note: "Checked" },
      eventConfidence: "Moderate",
      deckEligible: true,
      sources: ["E-0003"],
    },
  ],
  assumptions: [{ id: "PA-01", gap: "GAP-B01", text: "Executing faction chooses", appliesTo: ["events.choice"], status: "accepted" }],
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
  ["map", "even number of support levels", "supportLevels", ["opposition", "support"], "supportLevels"],
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
  ["markers", "negative level cap", "0.capsLevel", -1, "0.capsLevel"],
  ["markers", "one side", "1.sides", ["faceDown"], "1.sides"],
  ["victory", "unknown term type", "scores.blue.1.type", "power", "scores.blue.1.type"],
  ["victory", "empty term list", "scores.blue", [], "scores.blue"],
  ["victory", "divide by 0", "totals.bases.0.by", 0, "totals.bases.0.by"],
  ["victory", "unknown condition type", "scores.blue.0.where.of.0.type", "region", "scores.blue.0.where.of.0.type"],
  ["victory", "fraction level", "scores.blue.0.where.of.1.levels", [0.5], "scores.blue.0.where.of.1.levels.0"],
  ["victory", "spaceHas with nothing listed", "totals.bases.1.where.of.1.pieces", [], "totals.bases.1.where.of.1.pieces"],
  ["victory", "unknown terrain", "totals.bases.1.where.of.0.terrain", ["sea"], "totals.bases.1.where.of.0.terrain.0"],
  ["victory", "unknown key", "harmLimit", 6, ""],
  ["scenario", "final round 0", "finalRound", 0, "finalRound"],
  ["scenario", "pile size 0", "pileSize", 0, "pileSize"],
  ["scenario", "negative piece count", "spaces.city.pieces.rebel.underground", -2, "spaces.city.pieces.rebel.underground"],
  ["scenario", "fraction level", "spaces.city.level", 0.5, "spaces.city.level"],
  ["cards", "unknown card type", "0.type", "bonus", "0.type"],
  ["cards", "count min above max", "0.unshaded.effects.2.effects.0.count", { min: 3, max: 2 }, "0.unshaded.effects.2.effects.0.count.max"],
  ["cards", "choice with one option", "0.unshaded.effects.0.options", [{ label: "City", effects: [] }], "0.unshaded.effects.0.options"],
  ["cards", "unknown effect type", "0.shaded.effects.0.type", "teleport", "0.shaded.effects.0.type"],
  ["cards", "encoded without a side", "0.shaded", DELETE, "0.encoding.status"],
  ["cards", "unknown card condition", "0.unshaded.effects.2.where.of.1.type", "near", "0.unshaded.effects.2.where.of.1.type"],
  ["sequence", "unknown box", "boxes.0.id", "reserve", "boxes.0.id"],
  ["sequence", "duplicate box", "boxes.1.id", "event", "boxes"],
  ["sequence", "three-box adjacency", "adjacency.0", ["pass", "event", "opSa"], "adjacency.0"],
  ["sequence", "model without major", "model", "ct", "model"],
  ["assumptions", "bad PA ID", "0.id", "PA-1", "0.id"],
  ["assumptions", "unknown status", "0.status", "open", "0.status"],
  ["assumptions", "empty appliesTo", "0.appliesTo", [], "0.appliesTo"],
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
