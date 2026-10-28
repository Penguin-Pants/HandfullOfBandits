// Test helpers for board positions on the Kurdish package. Not for production code.
import { createEngine } from "../src/engine/index.ts";
import { rollDie, seedRng } from "../src/engine/core/rng.ts";
import { coinHandlers } from "../src/engine/coin/handlers.ts";
import { PHASE } from "../src/engine/coin/phases.ts";
import type { AnyCommand, GameState, LogEntry } from "../src/engine/core/types.ts";
import { kurdish } from "./kurdish-package.ts";

export const ruleset = kurdish.ruleset;
export const engine = createEngine(coinHandlers);

/** S0 start with a card in play and `faction` First Eligible. */
export function turnOf(faction: "state" | "pkk", seed = 1): GameState {
  const s = engine.start(ruleset, "s0", seed).state;
  const other = faction === "state" ? "pkk" : "state";
  return { ...s, turn: { ...s.turn, phase: PHASE.card }, initiative: { ...s.initiative, firstEligible: faction, secondEligible: other } };
}

/** Set the count of one piece face in a space; Available absorbs the difference. */
export function setPieces(state: GameState, space: string, piece: string, n: number, face = piece === "guerrilla" ? "underground" : "default"): GameState {
  const current = state.spaces[space];
  if (current === undefined) throw new RangeError(space);
  const before = current.pieces[piece]?.[face] ?? 0;
  const pool = state.pools[piece] ?? { available: 0, outOfPlay: 0 };
  return {
    ...state,
    spaces: { ...state.spaces, [space]: { ...current, pieces: { ...current.pieces, [piece]: { ...current.pieces[piece], [face]: n } } } },
    pools: { ...state.pools, [piece]: { ...pool, available: pool.available - (n - before) } },
  };
}

export function setMarkers(state: GameState, space: string, marker: string, n: number, side = "default"): GameState {
  const current = state.spaces[space];
  if (current === undefined) throw new RangeError(space);
  const before = current.markers[marker]?.[side] ?? 0;
  return {
    ...state,
    spaces: { ...state.spaces, [space]: { ...current, markers: { ...current.markers, [marker]: { ...current.markers[marker], [side]: n } } } },
    markerPools: { ...state.markerPools, [marker]: (state.markerPools[marker] ?? 0) - (n - before) },
  };
}

export function setLevel(state: GameState, space: string, level: number): GameState {
  const current = state.spaces[space];
  if (current === undefined) throw new RangeError(space);
  return { ...state, spaces: { ...state.spaces, [space]: { ...current, level } } };
}

export function setTrack(state: GameState, track: string, value: number | string): GameState {
  return { ...state, tracks: { ...state.tracks, [track]: value } };
}

/** Apply a command that must be legal. */
export function play(state: GameState, command: AnyCommand): { state: GameState; entries: readonly LogEntry[] } {
  const result = engine.apply(ruleset, state, command);
  if (!result.ok) throw new Error(JSON.stringify(result.validation.violations));
  return { state: result.transition.state, entries: result.transition.logEntries };
}

/** Violation codes of a command. */
export function codes(state: GameState, command: AnyCommand): string[] {
  return engine.validate(ruleset, state, command).violations.map((v) => v.code);
}

export function op(faction: string, box: string, plan: Record<string, unknown>): AnyCommand {
  return { type: "ChooseOperation", faction, box, plan: { locations: [], perLocation: {}, sa: null, subActions: [], ...plan } };
}

export function pieces(state: GameState, space: string, piece: string): Readonly<Record<string, number>> {
  return state.spaces[space]?.pieces[piece] ?? {};
}

/** State whose next die roll is `value` (searches seeds; PA-13 generator). */
export function withRoll(state: GameState, value: number): GameState {
  for (let seed = 0; seed < 1000; seed++) {
    const rng = seedRng(seed);
    if (rollDie(rng).value === value) return { ...state, rng };
  }
  throw new Error(`No seed rolls ${String(value)}`);
}
