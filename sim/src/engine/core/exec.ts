// Resolution context (05 s5.1). A handler that needs more than a fixed effect list (die rolls,
// sequence bookkeeping) resolves through it. Board writes go through core primitives (05 s7);
// `write` is for turn, initiative, deck and other bookkeeping fields only (DEC-50).
import { applyEffect } from "./effects/index.ts";
import { logEntry } from "./log.ts";
import { pickRandom, rollDie } from "./rng.ts";
import type { AssumptionRef, Effect, GameState, JsonValue, LogEntry, LogKind, RuleRef, Ruleset } from "./types.ts";

export interface Exec {
  readonly ruleset: Ruleset;
  /** Current working state. */
  readonly state: GameState;
  readonly entries: readonly LogEntry[];
  /** Effects applied so far, in order: the preview (05 s4). */
  readonly effects: readonly Effect[];
  apply(...effects: readonly Effect[]): void;
  write(update: (state: GameState) => GameState): void;
  log(kind: LogKind, data: Readonly<Record<string, JsonValue>>, ruleRef?: RuleRef | null, assumptionRef?: AssumptionRef | null): void;
  /** Roll one die from the session generator and log it (05 s8 item 2, PA-13). */
  roll(purpose: string, ruleRef: RuleRef): number;
  /** Pick one item at random from the session generator and log it (PA-13). */
  pick<T extends JsonValue>(items: readonly T[], purpose: string, ruleRef: RuleRef): T;
}

/** Thrown by `roll` in preview mode: the preview stops before the first random result (05 s4). */
export class PreviewStop extends Error {}

export function createExec(ruleset: Ruleset, start: GameState, preview = false): Exec {
  let state = start;
  const entries: LogEntry[] = [];
  const effects: Effect[] = [];
  return {
    ruleset,
    get state() {
      return state;
    },
    entries,
    effects,
    apply(...list) {
      for (const effect of list) {
        effects.push(effect);
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
      if (preview) throw new PreviewStop(purpose);
      const drawn = rollDie(state.rng);
      state = { ...state, rng: drawn.rng };
      entries.push(logEntry(state, "DieRolled", { purpose, raw: drawn.value, result: drawn.value }, ruleRef, "PA-13"));
      return drawn.value;
    },
    pick(items, purpose, ruleRef) {
      if (preview) throw new PreviewStop(purpose);
      const drawn = pickRandom(state.rng, items);
      state = { ...state, rng: drawn.rng };
      entries.push(logEntry(state, "DieRolled", { purpose, picked: drawn.value, from: [...items] }, ruleRef, "PA-13"));
      return drawn.value;
    },
  };
}
