// Replay check (05 s1 rule 2; DEC-19; 11 P2-12): rerun stored steps from start and compare hashes.
import type { AnyCommand, Ruleset } from "./core/types.ts";
import type { Engine } from "./index.ts";

/** One stored step: its commands and the state hash after them. */
export interface ReplayStep {
  readonly id: string;
  readonly commands: readonly AnyCommand[];
  readonly hashAfter: string;
}

export interface ReplayDiff {
  readonly id: string;
  readonly expected: string;
  readonly actual: string;
}

/** First step whose hash differs, or null when identical. `startHash` is the stored setup hash. */
export function replaySteps(engine: Engine, ruleset: Ruleset, scenarioId: string, seed: number, startHash: string, steps: readonly ReplayStep[]): ReplayDiff | null {
  const start = engine.start(ruleset, scenarioId, seed);
  if (start.stateHash !== startHash) return { id: "start", expected: startHash, actual: start.stateHash };
  let state = start.state;
  for (const step of steps) {
    let actual = "";
    for (const command of step.commands) {
      const result = engine.apply(ruleset, state, command);
      if (!result.ok) return { id: step.id, expected: step.hashAfter, actual: "rejected" };
      state = result.transition.state;
      actual = result.transition.stateHash;
    }
    if (actual !== step.hashAfter) return { id: step.id, expected: step.hashAfter, actual };
  }
  return null;
}
