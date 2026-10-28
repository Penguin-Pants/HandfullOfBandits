// Core effect primitives (04 s5, 05 s7): the only code that writes game state.
// Each applies one effect and returns the new state plus its log entries. Counts and
// locations are resolved before a primitive runs; `{min, max}` lives in the card schema (DEC-41).
import type { Effect, GameState, Ruleset } from "../types.ts";
import { adjustTrack } from "./adjust-track.ts";
import type { EffectResult } from "./common.ts";
import { flipMarker } from "./flip-marker.ts";
import { movePieces } from "./move-pieces.ts";
import { placeMarker } from "./place-marker.ts";
import { placePieces } from "./place-pieces.ts";
import { removeMarker } from "./remove-marker.ts";
import { removePieces } from "./remove-pieces.ts";
import { setFlag } from "./set-flag.ts";
import { setPieceState } from "./set-piece-state.ts";
import { setTrack } from "./set-track.ts";
import { shiftLevel } from "./shift-level.ts";
import { stepOrdinal } from "./step-ordinal.ts";

export type { EffectResult } from "./common.ts";

export function applyEffect(ruleset: Ruleset, state: GameState, effect: Effect): EffectResult {
  switch (effect.type) {
    case "placePieces":
      return placePieces(ruleset, state, effect);
    case "removePieces":
      return removePieces(ruleset, state, effect);
    case "movePieces":
      return movePieces(ruleset, state, effect);
    case "setPieceState":
      return setPieceState(ruleset, state, effect);
    case "adjustTrack":
      return adjustTrack(ruleset, state, effect);
    case "setTrack":
      return setTrack(ruleset, state, effect);
    case "stepOrdinal":
      return stepOrdinal(ruleset, state, effect);
    case "placeMarker":
      return placeMarker(ruleset, state, effect);
    case "removeMarker":
      return removeMarker(ruleset, state, effect);
    case "flipMarker":
      return flipMarker(ruleset, state, effect);
    case "setFlag":
      return setFlag(state, effect);
    case "shiftLevel":
      return shiftLevel(ruleset, state, effect);
  }
}
