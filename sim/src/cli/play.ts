// Scripted play for the CLI and tests (11 IC-2a, P2-12): fill answers from questions, choose
// commands with a policy, and record a replay. Strategies only pick among legal choices (DEC-34).
import { legalOps } from "../engine/coin/stop-rules.ts";
import { activeFaction } from "../engine/coin/sequence/ct.ts";
import type { Engine } from "../engine/index.ts";
import type { AnyCommand, GameState, JsonValue, Question, Ruleset } from "../engine/core/types.ts";

/** Picks an answer for a question. `draw(n)` returns an integer in [0, n). */
export type Picker = (question: Question) => JsonValue;

/** First option, largest count, first spaces, skip free actions. */
export const firstPicker: Picker = (q) => {
  switch (q.kind) {
    case "option":
      return q.options[0] ?? null;
    case "count":
      return q.max;
    case "spaces":
      return q.options.slice(0, q.max);
    case "plan":
      return null;
  }
};

/** Fill `answers` until the command is legal, or null when a violation is not a question. */
export function complete(engine: Engine, ruleset: Ruleset, state: GameState, command: AnyCommand, pick: Picker): AnyCommand | null {
  let current = command;
  for (let i = 0; i < 32; i++) {
    const [first] = engine.validate(ruleset, state, current).violations;
    if (first === undefined) return current;
    if (first.question === undefined || first.code !== "needsAnswer" || current.type !== "ChooseEvent") return null;
    const answers = Array.isArray(current["answers"]) ? (current["answers"] as JsonValue[]) : [];
    current = { ...current, answers: [...answers, pick(first.question)] };
  }
  return null;
}

export type Policy = (engine: Engine, ruleset: Ruleset, state: GameState) => AnyCommand;

/**
 * IC-2a policy: First Eligible takes the Event (own side, else unshaded); the responder takes
 * the first legal one-location Op; otherwise Pass. Propaganda: Advance, or remove all Guards
 * the upkeep question lists.
 */
export const scriptedPolicy: Policy = (engine, ruleset, state) => {
  const faction = activeFaction(state);
  if (faction === null) {
    const advance = { type: "Advance" };
    const [v] = engine.validate(ruleset, state, advance).violations;
    if (v?.question !== undefined && state.turn.phase === "propaganda") {
      const phase = ruleset.sequence.propagandaPhases[state.turn.step] ?? "";
      return { type: "PropagandaChoice", phase, choice: { removeGuards: Object.fromEntries(v.question.options.map((s) => [s, Object.values(state.spaces[s]?.pieces["guards"] ?? {}).reduce((a, n) => a + n, 0)])) } };
    }
    return advance;
  }
  if (faction === state.initiative.firstEligible) {
    const card = state.deck.currentCard === null ? undefined : ruleset.cards[state.deck.currentCard];
    const side = card?.shaded?.owner === faction ? "shaded" : "unshaded";
    const event = complete(engine, ruleset, state, { type: "ChooseEvent", faction, side, answers: [] }, firstPicker);
    if (event !== null) return event;
  }
  return legalOps(ruleset, state, faction)[0] ?? { type: "Pass", faction };
};

export interface PlayRecord {
  readonly scenario: string;
  readonly seed: number;
  readonly commands: readonly AnyCommand[];
  /** stateHash after start, then after each command. */
  readonly hashes: readonly string[];
  readonly ended: boolean;
}

/** Play from start until the game ends or `maxSteps` commands. Throws on an illegal command. */
export function playGame(engine: Engine, ruleset: Ruleset, scenario: string, seed: number, policy: Policy, maxSteps = 2000): PlayRecord & { readonly state: GameState } {
  const start = engine.start(ruleset, scenario, seed);
  let state = start.state;
  const commands: AnyCommand[] = [];
  const hashes = [start.stateHash];
  while (state.ended === null && commands.length < maxSteps) {
    const command = policy(engine, ruleset, state);
    const result = engine.apply(ruleset, state, command);
    if (!result.ok) throw new Error(`Illegal ${command.type} at step ${String(commands.length)}: ${JSON.stringify(result.validation.violations)}`);
    commands.push(command);
    hashes.push(result.transition.stateHash);
    state = result.transition.state;
  }
  return { scenario, seed, commands, hashes, ended: state.ended !== null, state };
}

/** Replay a record; returns the first step whose hash differs, or null when identical. */
export function replay(engine: Engine, ruleset: Ruleset, record: Pick<PlayRecord, "scenario" | "seed" | "commands" | "hashes">): { readonly step: number; readonly expected: string; readonly actual: string } | null {
  const start = engine.start(ruleset, record.scenario, record.seed);
  if (start.stateHash !== record.hashes[0]) return { step: 0, expected: record.hashes[0] ?? "", actual: start.stateHash };
  let state = start.state;
  for (const [i, command] of record.commands.entries()) {
    const result = engine.apply(ruleset, state, command);
    const actual = result.ok ? result.transition.stateHash : "rejected";
    const expected = record.hashes[i + 1] ?? "";
    if (actual !== expected) return { step: i + 1, expected, actual };
    if (result.ok) state = result.transition.state;
  }
  return null;
}
