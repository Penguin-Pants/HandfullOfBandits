import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadPackage, readPackageDir } from "../../package/load.ts";
import { emptyState } from "../core/state.ts";
import type { GameState, Ruleset } from "../core/types.ts";
import { control, derive } from "./derive.ts";

// T-SCORE (09 s4, 11 P1-09) on the tiny package (P1-06). Expected values are hand math
// from tiny map.yaml (pop: city 2, farm 1, hills 1, refuge 0) and victory.yaml.
const loaded = loadPackage(readPackageDir(fileURLToPath(new URL("../../../test/packages/tiny", import.meta.url))));
if (!loaded.ok) throw new Error(JSON.stringify(loaded.issues));
const ruleset: Ruleset = loaded.ruleset;

interface SpaceSetup {
  readonly level?: number;
  readonly pieces?: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly markers?: Readonly<Record<string, Readonly<Record<string, number>>>>;
}

/** Test board: emptyState with the given counts written in. Pools are not adjusted; derive does not read them. */
function board(rules: Ruleset, spaces: Readonly<Record<string, SpaceSetup>>, tracks: Readonly<Record<string, number>> = {}): GameState {
  const state = emptyState(rules, "start", 1);
  const next = { ...state.spaces };
  for (const [id, setup] of Object.entries(spaces)) {
    const space = state.spaces[id];
    if (space === undefined) throw new Error(`no space ${id}`);
    const merge = (base: typeof space.pieces, add: SpaceSetup["pieces"]): typeof space.pieces =>
      Object.fromEntries(Object.entries(base).map(([type, faces]) => [type, { ...faces, ...add?.[type] }]));
    next[id] = { level: setup.level ?? space.level, pieces: merge(space.pieces, setup.pieces), markers: merge(space.markers, setup.markers) };
  }
  return { ...state, spaces: next, tracks: { ...state.tracks, ...tracks } };
}

// Tiny scenario `start`, plus Standing 3 and three markers.
const start = board(
  ruleset,
  {
    city: { level: 1, pieces: { soldier: { default: 2 }, fort: { default: 1 } }, markers: { mark: { old: 1 } } },
    farm: { pieces: { soldier: { default: 1 }, rebel: { hidden: 1 } }, markers: { mark: { new: 1 } } },
    hills: { level: -1, pieces: { rebel: { hidden: 1, shown: 1 } }, markers: { harm: { default: 1 } } },
    refuge: { pieces: { rebel: { hidden: 1 }, camp: { default: 1 } } },
  },
  { "cash.blue": 5, standing: 3 },
);

describe("control", () => {
  it("gives a space to the faction whose pieces exceed all others; ties and external spaces have none", () => {
    expect(control(ruleset, start)).toEqual({ city: "blue", farm: null, hills: "red", refuge: null });
  });

  it("counts only pieces with countsForControl", () => {
    const rules: Ruleset = { ...ruleset, pieces: ruleset.pieces.map((p) => (p.id === "fort" ? { ...p, countsForControl: false } : p)) };
    const state = board(rules, { city: { pieces: { soldier: { default: 1 }, fort: { default: 1 }, rebel: { shown: 1 } } } });
    expect(control(rules, state)["city"]).toBeNull();
  });

  it("needs more than all other factions combined when there are three", () => {
    const rules: Ruleset = {
      ...ruleset,
      factions: [...ruleset.factions, { id: "green", kind: "player" }],
      pieces: [...ruleset.pieces, { id: "ranger", faction: "green", count: 4, states: [], placedAs: null, startPool: "available", countsForControl: true }],
    };
    const tie = board(rules, { city: { pieces: { soldier: { default: 2 }, rebel: { hidden: 1 }, ranger: { default: 1 } } } });
    expect(control(rules, tie)["city"]).toBeNull();
    const win = board(rules, { city: { pieces: { soldier: { default: 3 }, rebel: { hidden: 1 }, ranger: { default: 1 } } } });
    expect(control(rules, win)["city"]).toBe("blue");
  });
});

describe("derive on tiny", () => {
  it("matches hand math at the start position", () => {
    expect(derive(ruleset, start)).toEqual({
      control: { city: "blue", farm: null, hills: "red", refuge: null },
      // Support: city +1 x pop 2. Opposition: hills -1 x pop 1. Held: city 2. Contested: farm 1 + 1.
      // Half cash: floor((5 + 1) / 2). Inland: farm 1 + hills 1.
      totals: { totalSupport: 2, totalOpposition: 1, domesticCamps: 0, heldByBlue: 2, contested: 2, halfCash: 3, inland: 2 },
      // Blue: support 2 + Standing 3. Red: opposition 1 + no domestic Camp.
      scores: { blue: 5, red: 1 },
      // Blue: 1 harm. Red: marks on side `new` only.
      harm: { blue: 1, red: 1 },
      // Thresholds of scenario `start`: blue 10, red 8.
      margins: { blue: -5, red: -7 },
    });
  });

  it("doubles Pop at the Active levels and counts a domestic Camp", () => {
    const state = board(ruleset, {
      city: { level: 2, pieces: { soldier: { default: 1 } } },
      hills: { level: -2, pieces: { camp: { default: 1 } } },
    });
    const view = derive(ruleset, state);
    expect(view.totals).toMatchObject({ totalSupport: 4, totalOpposition: 2, domesticCamps: 1 });
    expect(view.scores).toEqual({ blue: 4, red: 3 });
  });

  it("gives no margins for a scenario without thresholds", () => {
    expect(derive(ruleset, { ...start, meta: { ...start.meta, scenarioId: "other" } }).margins).toEqual({});
  });
});
