// Engine entry points (05 s1): start, validate and apply. Pure: no I/O, and the caller stores
// the result. Command handlers are passed in, so a test-only command such as AdjustTrackDebug
// never ships in production (11 P1-10). Production handlers: coin/handlers.ts.
import { control } from "./coin/derive.ts";
import { startState } from "./coin/setup.ts";
import { afterCommand } from "./coin/turn.ts";
import { canonicalHash } from "./core/canonical.ts";
import { createExec, PreviewStop } from "./core/exec.ts";
import { logEntry } from "./core/log.ts";
import { own } from "./core/state.ts";
import type {
  AnyCommand,
  ApplyResult,
  CommandHandler,
  Effect,
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

/** Effects a valid command applies, up to its first die roll (05 s4 preview). */
function previewEffects(ruleset: Ruleset, state: GameState, handler: CommandHandler, command: AnyCommand): readonly Effect[] {
  if (handler.execute === undefined) return handler.resolve?.(ruleset, state, command) ?? [];
  const ctx = createExec(ruleset, state, true);
  try {
    handler.execute(ctx, command);
  } catch (e) {
    if (!(e instanceof PreviewStop)) throw e;
  }
  return ctx.effects;
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
    return { ok, violations, warnings: [], preview: { effects: ok ? previewEffects(ruleset, state, handler, command) : [] } };
  }

  return {
    start(ruleset, scenarioId, seed) {
      const state = startState(ruleset, scenarioId, seed);
      return transition(state, [logEntry(state, "PhaseStarted", { phase: state.turn.phase, scenario: scenarioId })]);
    },
    validate,
    /** Validate first; an invalid command changes nothing (05 s1 rule 3). The new state gets the next stateSeq. */
    apply(ruleset, state, command) {
      const validation = validate(ruleset, state, command);
      const handler = handlerFor(command.type);
      if (!validation.ok || handler === undefined) return { ok: false, validation };
      const ctx = createExec(ruleset, { ...state, meta: { ...state.meta, stateSeq: state.meta.stateSeq + 1 } });
      ctx.log("ValidationPassed", { command: command.type }, handler.ruleRef);
      if (handler.execute === undefined) ctx.apply(...(handler.resolve?.(ruleset, state, command) ?? []));
      else handler.execute(ctx, command);
      afterCommand(ctx);
      const logEntries = [...ctx.entries, ...controlChanges(ruleset, state, ctx.state)];
      return { ok: true, validation, transition: transition(ctx.state, logEntries) };
    },
  };
}
