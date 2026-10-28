// Propaganda phase handler contract (research 05 s6; 03 s6 "Propaganda phase"). The package lists
// phase IDs in sequence.yaml `propagandaPhases`; each ID maps to one handler (propaganda/registry.ts).
import type { Exec } from "../../core/exec.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";

export interface PropagandaPhase {
  readonly id: string;
  readonly ruleRef: string;
  /** Violations for running the phase now. `choice` null: Advance with no choice. */
  check(ruleset: Ruleset, state: GameState, choice: JsonObject | null): Violation[];
  run(ctx: Exec, choice: JsonObject | null): void;
}

export function violation(code: string, message: string, ruleRef: string, location: string | null = null): Violation {
  return { code, message, ruleRef, location };
}
