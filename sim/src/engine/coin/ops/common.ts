// Helpers shared by Operation and Special Activity handlers (research 06 s1).
import { total } from "../../core/effects/common.ts";
import type { Exec } from "../../core/exec.ts";
import { param } from "../../core/params.ts";
import { own } from "../../core/state.ts";
import type { FactionId, GameState, Ruleset, RulesetSpace, SpaceId } from "../../core/types.ts";
import { control } from "../derive.ts";
import { FACE, PIECE, TERRAIN } from "./ids.ts";

export function space(ruleset: Ruleset, id: string): RulesetSpace | undefined {
  return ruleset.spaces.find((s) => s.id === id);
}

/** Pieces of a type in a space, all faces, or one face. */
export function count(state: GameState, spaceId: SpaceId, piece: string, face: string | null = null): number {
  const faces = state.spaces[spaceId]?.pieces[piece];
  return face === null ? total(faces) : (faces?.[face] ?? 0);
}

export function markers(state: GameState, spaceId: SpaceId, marker: string): number {
  return total(state.spaces[spaceId]?.markers[marker]);
}

export function controlOf(ruleset: Ruleset, state: GameState, spaceId: SpaceId): FactionId | null {
  return control(ruleset, state)[spaceId] ?? null;
}

export function isTerrain(ruleset: Ruleset, spaceId: SpaceId, ...terrain: string[]): boolean {
  const t = space(ruleset, spaceId)?.terrain ?? null;
  return t !== null && terrain.includes(t);
}

export function hasTag(ruleset: Ruleset, spaceId: SpaceId, tag: string): boolean {
  return space(ruleset, spaceId)?.tags.includes(tag) ?? false;
}

/** Mountain modifier (06 s1 item 6): one per `terrain.mountainDivisor` in Mountain terrain, round down. */
export function terrainRate(ruleset: Ruleset, spaceId: SpaceId, n: number): number {
  return isTerrain(ruleset, spaceId, TERRAIN.mountain) ? Math.floor(n / param(ruleset, "terrain.mountainDivisor", "number")) : n;
}

export function resources(ruleset: Ruleset, state: GameState, faction: FactionId): number {
  const track = ruleset.factions.find((f) => f.id === faction)?.resourcesTrack ?? null;
  const value = track === null ? undefined : own(state.tracks, track);
  return typeof value === "number" ? value : 0;
}

/** Pay Resources (CT 1.8). A zero cost logs nothing. */
export function pay(ctx: Exec, faction: FactionId, amount: number, ruleRef: string, location: string | null = null): void {
  const track = ctx.ruleset.factions.find((f) => f.id === faction)?.resourcesTrack ?? null;
  if (track === null || amount === 0) return;
  ctx.log("CostPaid", { faction, track, amount, location }, ruleRef);
  ctx.apply({ type: "adjustTrack", track, delta: -amount, ruleRef, assumptionRef: null });
}

/** Flip up to `n` Underground Guerrillas Active in a space (06 s1 item 5). */
export function activate(ctx: Exec, spaceId: SpaceId, n: number, ruleRef: string, assumptionRef: string | null = null): void {
  if (n <= 0) return;
  const hidden = count(ctx.state, spaceId, PIECE.guerrilla, FACE.underground);
  ctx.apply({ type: "setPieceState", piece: PIECE.guerrilla, space: spaceId, from: FACE.underground, to: FACE.active, count: Math.min(n, hidden), ruleRef, assumptionRef });
}

export function adjacent(ruleset: Ruleset, a: SpaceId, b: SpaceId): boolean {
  return ruleset.links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a));
}
