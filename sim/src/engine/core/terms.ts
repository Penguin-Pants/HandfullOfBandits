// Condition and formula term evaluator (04 s8). The term set is closed and holds no
// expression strings (03 s6.2). Pieces and markers count on the map only. An unknown ID
// is a defect in the caller (package data is validated on load), so it throws.
import { find, total } from "./effects/common.ts";
import type { FactionId, FormulaTerm, GameState, MarkerTypeId, Ruleset, SpaceCondition, SpaceId } from "./types.ts";

export interface TermContext {
  readonly ruleset: Ruleset;
  readonly state: GameState;
  /** Control per space, from derive (computed first, so the `control` condition can read it). */
  readonly control: Readonly<Record<SpaceId, FactionId | null>>;
  /** The current forEachSpace pick (DEC-33). Absent or null: none. */
  readonly selected?: SpaceId | null;
}

/** Space reference that names the current forEachSpace pick (DEC-33). */
export const SELECTED = "selected";

/** A space ID, with `selected` resolved to the current pick. */
export function resolveSpace(ctx: Pick<TermContext, "selected">, ref: string): SpaceId {
  if (ref !== SELECTED) return ref;
  if (ctx.selected === undefined || ctx.selected === null) throw new RangeError("No space is selected");
  return ctx.selected;
}

/** Spaces linked to `spaceId` (04 s4.3), in package link order. */
export function neighbors(ruleset: Ruleset, spaceId: SpaceId): SpaceId[] {
  return ruleset.links.flatMap((l) => (l.a === spaceId ? [l.b] : l.b === spaceId ? [l.a] : []));
}

function spaceState(ctx: TermContext, spaceId: SpaceId): GameState["spaces"][string] {
  const space = ctx.state.spaces[spaceId];
  if (space === undefined) throw new RangeError(`Unknown space "${spaceId}"`);
  return space;
}

/** Pieces or markers of the listed types in one space, on the listed sides. Null `sides`: every face. */
function countIn(ctx: TermContext, spaceId: SpaceId, field: "pieces" | "markers", types: readonly string[], sides: readonly string[] | null = null): number {
  const faces = spaceState(ctx, spaceId)[field];
  return types.reduce((sum, type) => {
    if (field === "pieces") find(ctx.ruleset.pieces, type, "piece");
    else find(ctx.ruleset.markers, type, "marker");
    const counts = faces[type];
    if (sides === null) return sum + total(counts);
    return sum + sides.reduce((n, side) => n + (counts?.[side] ?? 0), 0);
  }, 0);
}

/** True when the space meets the condition. */
export function matches(ctx: TermContext, spaceId: SpaceId, condition: SpaceCondition): boolean {
  const space = find(ctx.ruleset.spaces, spaceId, "space");
  switch (condition.type) {
    case "spaceIn":
      return condition.spaces.includes(spaceId);
    case "spaceKind":
      return space.kind === condition.kind;
    case "terrainIn":
      return space.terrain !== null && condition.terrain.includes(space.terrain);
    case "spaceLevelIn": {
      const level = spaceState(ctx, spaceId).level;
      return level !== null && condition.levels.includes(level);
    }
    case "control":
      return ctx.control[spaceId] === condition.faction;
    case "spaceHas":
      return countIn(ctx, spaceId, "pieces", condition.pieces) + countIn(ctx, spaceId, "markers", condition.markers) > 0;
    case "all":
      return condition.of.every((c) => matches(ctx, spaceId, c));
    case "any":
      return condition.of.some((c) => matches(ctx, spaceId, c));
    case "not":
      return !matches(ctx, spaceId, condition.of);
    case "adjacentTo":
      return neighbors(ctx.ruleset, resolveSpace(ctx, condition.space)).includes(spaceId);
    case "selected":
      return ctx.selected === spaceId;
    case "trackAtLeast":
    case "trackAtMost": {
      const value = ctx.state.tracks[condition.track];
      if (typeof value !== "number") throw new RangeError(`Track "${condition.track}" is not numeric`);
      return condition.type === "trackAtLeast" ? value >= condition.value : value <= condition.value;
    }
    case "trackIn":
      return condition.values.includes(String(ctx.state.tracks[condition.track]));
    case "flag":
      return (ctx.state.flags[condition.flag] ?? false) === condition.value;
  }
}

/** Spaces that meet `where`. Null: every space. */
function spacesWhere(ctx: TermContext, where: SpaceCondition | null): readonly Ruleset["spaces"][number][] {
  return ctx.ruleset.spaces.filter((s) => where === null || matches(ctx, s.id, where));
}

function evaluate(ctx: TermContext, term: FormulaTerm): number {
  switch (term.type) {
    case "sumPopWhere":
      return spacesWhere(ctx, term.where).reduce((sum, s) => sum + s.pop, 0);
    case "countPieces":
      return spacesWhere(ctx, term.where).reduce((sum, s) => sum + countIn(ctx, s.id, "pieces", term.pieces), 0);
    case "countMarkers":
      return spacesWhere(ctx, term.where).reduce((sum, s) => sum + countIn(ctx, s.id, "markers", term.markers, term.sides), 0);
    case "trackValue": {
      find(ctx.ruleset.tracks, term.track, "track");
      const value = ctx.state.tracks[term.track];
      if (typeof value !== "number") throw new RangeError(`Track "${term.track}" is not numeric`);
      return value;
    }
    case "divideFloor":
      return Math.floor(evaluate(ctx, term.of) / term.by);
    case "multiply":
      return evaluate(ctx, term.of) * term.by;
    case "add":
      return sumTerms(ctx, term.terms);
    case "constant":
      return term.value;
  }
}

/** The value of a list of terms: their sum. */
export function sumTerms(ctx: TermContext, terms: readonly FormulaTerm[]): number {
  return terms.reduce((sum, term) => sum + evaluate(ctx, term), 0);
}

/** Marker types a `countMarkers` term counts anywhere in the tree, in first-seen order. */
export function markersIn(terms: readonly FormulaTerm[]): MarkerTypeId[] {
  const found = new Set<MarkerTypeId>();
  const visit = (term: FormulaTerm): void => {
    if (term.type === "countMarkers") term.markers.forEach((m) => found.add(m));
    else if (term.type === "add") term.terms.forEach(visit);
    else if (term.type === "divideFloor" || term.type === "multiply") visit(term.of);
  };
  terms.forEach(visit);
  return [...found];
}
