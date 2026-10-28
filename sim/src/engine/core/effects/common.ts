// Shared helpers for the core effect primitives (05 s7). State updates are immutable.
// An unknown ID is a defect in the caller (package data is validated on load), so it throws.
import { logEntry } from "../log.ts";
import { SINGLE_FACE } from "../state.ts";
import type { AssumptionRef, Effect, FaceCounts, GameState, JsonValue, LogEntry, Ruleset } from "../types.ts";

export interface EffectResult {
  readonly state: GameState;
  readonly entries: readonly LogEntry[];
}

export type EffectOf<T extends Effect["type"]> = Extract<Effect, { readonly type: T }>;

export function find<T extends { readonly id: string }>(items: readonly T[], id: string, kind: string): T {
  const item = items.find((i) => i.id === id);
  if (item === undefined) throw new RangeError(`Unknown ${kind} "${id}"`);
  return item;
}

/** Face keys of a piece type or marker type: its states or sides, else SINGLE_FACE (DEC-36). */
export function faceKeys(faces: readonly string[]): readonly string[] {
  return faces.length === 0 ? [SINGLE_FACE] : faces;
}

export function checkFace(faces: readonly string[], face: string, owner: string): string {
  if (!faceKeys(faces).includes(face)) throw new RangeError(`Unknown face "${face}" for "${owner}"`);
  return face;
}

export function total(faces: FaceCounts | undefined): number {
  return Object.values(faces ?? {}).reduce((sum, n) => sum + n, 0);
}

/** One log entry for an effect (05 s10). `assumptionRef` overrides the effect's own. */
export function entry(
  state: GameState,
  effect: Effect,
  kind: "EffectApplied" | "EffectSkipped",
  data: Readonly<Record<string, JsonValue>>,
  assumptionRef: AssumptionRef | null = effect.assumptionRef,
): LogEntry {
  return logEntry(state, kind, { effect: effect.type, ...data }, effect.ruleRef, assumptionRef);
}

/** Add `delta` to one face count of a piece or marker type in a space. */
export function addToSpace(
  state: GameState,
  spaceId: string,
  field: "pieces" | "markers",
  typeId: string,
  face: string,
  delta: number,
): GameState {
  const space = state.spaces[spaceId];
  if (space === undefined) throw new RangeError(`Unknown space "${spaceId}"`);
  const faces = space[field][typeId] ?? {};
  const next = (faces[face] ?? 0) + delta;
  if (next < 0) throw new RangeError(`Negative count for "${typeId}" in "${spaceId}"`);
  return {
    ...state,
    spaces: { ...state.spaces, [spaceId]: { ...space, [field]: { ...space[field], [typeId]: { ...faces, [face]: next } } } },
  };
}

/** Add `delta` to a piece pool. */
export function addToPool(state: GameState, pieceId: string, pool: "available" | "outOfPlay", delta: number): GameState {
  const pools = state.pools[pieceId] ?? { available: 0, outOfPlay: 0 };
  return { ...state, pools: { ...state.pools, [pieceId]: { ...pools, [pool]: pools[pool] + delta } } };
}

/** How many more pieces of a type the stacking rules allow in a space (04 s4.3). */
export function stackingRoom(ruleset: Ruleset, state: GameState, spaceId: string, pieceId: string): number {
  const space = find(ruleset.spaces, spaceId, "space");
  const placed = state.spaces[spaceId]?.pieces ?? {};
  let room = Number.POSITIVE_INFINITY;
  for (const rule of ruleset.stacking) {
    if (!rule.pieces.includes(pieceId)) continue;
    if (rule.spaceKind !== null && rule.spaceKind !== space.kind) continue;
    if (rule.terrain !== null && (space.terrain === null || !rule.terrain.includes(space.terrain))) continue;
    if (rule.spaces !== null && !rule.spaces.includes(space.id)) continue;
    const used = rule.pieces.reduce((sum, p) => sum + total(placed[p]), 0);
    room = Math.min(room, Math.max(0, rule.max - used));
  }
  return room;
}

/** Faces to take pieces from: the named face, or every face in package order. */
export function sourceFaces(states: readonly string[], face: string | null, owner: string): readonly string[] {
  return face === null ? faceKeys(states) : [checkFace(states, face, owner)];
}
