// Engine entry points (05 s1): start, validate and apply. Pure: no I/O, and the caller stores
// the result. Command handlers are passed in, so a test-only command such as AdjustTrackDebug
// never ships in production (11 P1-10). Turn sequence and Decisions come with P2-03 and later.
import { control } from "./coin/derive.ts";
import { canonicalHash } from "./core/canonical.ts";
import { applyEffect } from "./core/effects/index.ts";
import { logEntry } from "./core/log.ts";
import { own, setupState } from "./core/state.ts";
import type {
  AnyCommand,
  ApplyResult,
  CommandHandler,
  GameState,
  LogEntry,
  Ruleset,
  Transition,
  ValidationResult,
} from "./core/types.ts";

export interface Engine {
  start(ruleset: Ruleset, scenarioId: string, seed: number): Transition;
  validate(ruleset: Ruleset, state: GameState, command: AnyCommand): ValidationResult;
  apply(ruleset: Ruleset, state: GameState, command: AnyCommand): ApplyResult;
}

function transition(state: GameState, logEntries: readonly LogEntry[]): Transition {
  return { state, stateHash: canonicalHash(state), logEntries, pending: state.pending };
}

/** One ControlChanged entry per space whose Control differs (05 s5.1 item 4). */
function controlChanges(ruleset: Ruleset, before: GameState, after: GameState): LogEntry[] {
  const was = control(ruleset, before);
  const now = control(ruleset, after);
  return ruleset.spaces.flatMap(({ id }) => {
    const from = was[id] ?? null;
    const to = now[id] ?? null;
    return from === to ? [] : [logEntry(after, "ControlChanged", { space: id, before: from, after: to }, "coin.control")];
  });
}

export function createEngine(handlers: Readonly<Record<string, CommandHandler>>): Engine {
  const handlerFor = (type: string): CommandHandler | undefined => own(handlers, type);

  function validate(ruleset: Ruleset, state: GameState, command: AnyCommand): ValidationResult {
    const handler = handlerFor(command.type);
    if (handler === undefined) {
      const violation = { code: "unknownCommand", message: `No handler for command "${command.type}".`, ruleRef: null, location: null };
      return { ok: false, violations: [violation], warnings: [], preview: { effects: [] } };
    }
    const violations = handler.check(ruleset, state, command);
    const ok = violations.length === 0;
    return { ok, violations, warnings: [], preview: { effects: ok ? handler.resolve(ruleset, state, command) : [] } };
  }

  return {
    start(ruleset, scenarioId, seed) {
      const state = setupState(ruleset, scenarioId, seed);
      return transition(state, [logEntry(state, "PhaseStarted", { phase: state.turn.phase, scenario: scenarioId })]);
    },
    validate,
    /** Validate first; an invalid command changes nothing (05 s1 rule 3). The new state gets the next stateSeq. */
    apply(ruleset, state, command) {
      const validation = validate(ruleset, state, command);
      const handler = handlerFor(command.type);
      if (!validation.ok || handler === undefined) return { ok: false, validation };
      let next: GameState = { ...state, meta: { ...state.meta, stateSeq: state.meta.stateSeq + 1 } };
      const logEntries: LogEntry[] = [logEntry(next, "ValidationPassed", { command: command.type }, handler.ruleRef)];
      for (const effect of validation.preview.effects) {
        const result = applyEffect(ruleset, next, effect);
        next = result.state;
        logEntries.push(...result.entries);
      }
      logEntries.push(...controlChanges(ruleset, state, next));
      return { ok: true, validation, transition: transition(next, logEntries) };
    },
  };
}
