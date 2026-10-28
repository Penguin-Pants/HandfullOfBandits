import { describe, expect, it } from "vitest";
import { emptyState } from "./state.ts";
import { markersIn, matches, sumTerms, type TermContext } from "./terms.ts";
import type { FormulaTerm, Ruleset } from "./types.ts";

// Term evaluator edge cases (04 s8). T-SCORE in engine/coin/derive.test.ts covers each term on tiny.
const ruleset: Ruleset = {
  packageHash: "abc",
  rulesetVersion: "R1",
  factions: [{ id: "blue", kind: "player" }],
  pieces: [],
  spaces: [
    { id: "city", hasSupportScale: true, kind: "domestic", terrain: "city", pop: 2 },
    { id: "box", hasSupportScale: false, kind: "external", terrain: null, pop: 3 },
  ],
  tracks: [
    { id: "cash", kind: "numeric", min: 0, max: 9, overflow: null },
    { id: "mood", kind: "ordinal", steps: ["calm", "tense"] },
  ],
  markers: [{ id: "harm", count: 2, sides: [], blocks: [], capsLevel: null }],
  stacking: [],
  levelRange: 2,
  parameters: {},
  victory: { scores: {}, harmCount: {}, totals: {} },
  harmMarkers: [],
  scenarios: {},
};
const ctx: TermContext = { ruleset, state: emptyState(ruleset, "s", 1), control: { city: null, box: null } };

describe("terms", () => {
  it("never matches a level condition in a space with no support scale", () => {
    expect(matches(ctx, "city", { type: "spaceLevelIn", levels: [0] })).toBe(true);
    expect(matches(ctx, "box", { type: "spaceLevelIn", levels: [0] })).toBe(false);
  });

  it("never matches terrainIn in a space with no terrain", () => {
    expect(matches(ctx, "box", { type: "terrainIn", terrain: ["city"] })).toBe(false);
  });

  it("rounds a negative division down", () => {
    expect(sumTerms(ctx, [{ type: "divideFloor", by: 2, of: { type: "constant", value: -3 } }])).toBe(-2);
  });

  it("sums an empty add to 0", () => {
    expect(sumTerms(ctx, [{ type: "add", terms: [] }])).toBe(0);
  });

  it("throws on trackValue of an ordinal or unknown track", () => {
    expect(() => sumTerms(ctx, [{ type: "trackValue", track: "mood" }])).toThrow(new RangeError('Track "mood" is not numeric'));
    expect(() => sumTerms(ctx, [{ type: "trackValue", track: "gold" }])).toThrow(new RangeError('Unknown track "gold"'));
  });

  it("throws on an unknown piece or marker type", () => {
    expect(() => sumTerms(ctx, [{ type: "countPieces", pieces: ["troops"], where: null }])).toThrow(new RangeError('Unknown piece "troops"'));
    expect(() => sumTerms(ctx, [{ type: "countMarkers", markers: ["coercion"], sides: null, where: null }])).toThrow(new RangeError('Unknown marker "coercion"'));
    expect(() => matches(ctx, "city", { type: "spaceHas", pieces: [], markers: ["coercion"] })).toThrow(new RangeError('Unknown marker "coercion"'));
  });

  it("throws on an unknown space", () => {
    expect(() => matches(ctx, "sea", { type: "spaceKind", kind: "domestic" })).toThrow(new RangeError('Unknown space "sea"'));
  });

  it("lists the marker types counted anywhere in a term tree, once each", () => {
    const count = (markers: string[]): FormulaTerm => ({ type: "countMarkers", markers, sides: null, where: null });
    const terms: FormulaTerm[] = [count(["harm"]), { type: "multiply", by: 2, of: { type: "add", terms: [count(["coercion", "harm"])] } }];
    expect(markersIn(terms)).toEqual(["harm", "coercion"]);
  });
});
