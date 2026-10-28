// Resolution context (05 s5.1). A handler that needs more than a fixed effect list (die rolls,
// sequence bookkeeping) resolves through it. Board writes go through core primitives (05 s7);
// `write` is for turn, initiative, deck and other bookkeeping fields only (DEC-50).
import { applyEffect } from "./effects/index.ts";
import { logEntry } from "./log.ts";
import { rollDie } from "./rng.ts";
import type { AssumptionRef, Effect, GameState, JsonValue, LogEntry, LogKind, RuleRef, Ruleset } from "./types.ts";

export interface Exec {
  readonly ruleset: Ruleset;
  /** Current working state. */
  readonly state: GameState;
  readonly entries: readonly LogEntry[];
  apply(...effects: readonly Effect[]): void;
  write(update: (state: GameState) => GameState): void;
  log(kind: LogKind, data: Readonly<Record<string, JsonValue>>, ruleRef?: RuleRef | null, assumptionRef?: AssumptionRef | null): void;
  /** Roll one die from the session generator and log it (05 s8 item 2, PA-13). */
  roll(purpose: string, ruleRef: RuleRef): number;
}

export function createExec(ruleset: Ruleset, start: GameState): Exec {
  let state = start;
  const entries: LogEntry[] = [];
  return {
    ruleset,
    get state() {
      return state;
    },
    entries,
    apply(...effects) {
      for (const effect of effects) {
        const result = applyEffect(ruleset, state, effect);
        state = result.state;
        entries.push(...result.entries);
      }
    },
    write(update) {
      state = update(state);
    },
    log(kind, data, ruleRef = null, assumptionRef = null) {
      entries.push(logEntry(state, kind, data, ruleRef, assumptionRef));
    },
    roll(purpose, ruleRef) {
      const drawn = rollDie(state.rng);
      state = { ...state, rng: drawn.rng };
      entries.push(logEntry(state, "DieRolled", { purpose, raw: drawn.value, result: drawn.value }, ruleRef, "PA-13"));
      return drawn.value;
    },
  };
}
