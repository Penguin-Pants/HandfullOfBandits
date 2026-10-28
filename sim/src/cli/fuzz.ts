// `sim fuzz --seeds N` (T-FUZZ, DEC-33; 09 s2): play S0 with random legal choices. A failure is an
// exception, a dead end (no legal command, game not over) or more than 2,000 steps. Each failure
// returns its seed and commands as a regression case.
import { legalOps } from "../engine/coin/stop-rules.ts";
import { activeFaction } from "../engine/coin/sequence/ct.ts";
import { randomInt, seedRng, type RngState } from "../engine/core/rng.ts";
import type { AnyCommand, GameState, JsonValue, Question, Ruleset } from "../engine/core/types.ts";
import type { Engine } from "../engine/index.ts";
import { complete, type Picker, type Policy } from "./play.ts";

export const MAX_STEPS = 2000;

/** A random policy over legal choices, driven by its own generator (not the game's). */
export function randomPolicy(seed: number): Policy {
  let rng: RngState = seedRng(seed);
  const draw = (n: number): number => {
    const d = randomInt(rng, Math.max(1, n));
    rng = d.rng;
    return d.value;
  };
  const pick: Picker = (q: Question): JsonValue => {
    switch (q.kind) {
      case "option":
        return q.options[draw(q.options.length)] ?? null;
      case "count":
        return q.min + draw(q.max - q.min + 1);
      case "spaces": {
        const n = q.min + draw(q.max - q.min + 1);
        const pool = [...q.options];
        return Array.from({ length: n }, () => pool.splice(draw(pool.length), 1)[0] ?? "");
      }
      case "plan":
        return null;
    }
  };
  return (engine: Engine, ruleset: Ruleset, state: GameState): AnyCommand => {
    const faction = activeFaction(state);
    if (faction === null) {
      const advance = { type: "Advance" };
      const [v] = engine.validate(ruleset, state, advance).violations;
      if (v?.question !== undefined) {
        const phase = ruleset.sequence.propagandaPhases[state.turn.step] ?? "";
        const guards = (s: string): number => Object.values(state.spaces[s]?.pieces["guards"] ?? {}).reduce((a, n) => a + n, 0);
        return { type: "PropagandaChoice", phase, choice: { removeGuards: Object.fromEntries(v.question.options.map((s) => [s, guards(s)])) } };
      }
      return advance;
    }
    const options: AnyCommand[] = [{ type: "Pass", faction }];
    for (const side of ["unshaded", "shaded"]) {
      const event = complete(engine, ruleset, state, { type: "ChooseEvent", faction, side, answers: [] }, pick);
      if (event !== null) options.push(event);
    }
    options.push(...legalOps(ruleset, state, faction, Number.MAX_SAFE_INTEGER));
    return options[draw(options.length)] ?? { type: "Pass", faction };
  };
}

export interface FuzzFailure {
  readonly seed: number;
  readonly reason: string;
  readonly commands: readonly AnyCommand[];
}

export interface FuzzReport {
  readonly games: number;
  readonly failures: readonly FuzzFailure[];
  readonly steps: number;
  /** Apply time per command in ms (05 s11). */
  readonly applyMs: { readonly mean: number; readonly max: number };
}

export function fuzz(engine: Engine, ruleset: Ruleset, scenario: string, seeds: number, now: () => number): FuzzReport {
  const failures: FuzzFailure[] = [];
  let steps = 0;
  let total = 0;
  let max = 0;
  for (let seed = 0; seed < seeds; seed++) {
    const policy = randomPolicy(seed + 1_000_000);
    const commands: AnyCommand[] = [];
    try {
      let state = engine.start(ruleset, scenario, seed).state;
      while (state.ended === null) {
        if (commands.length >= MAX_STEPS) throw new Error(`more than ${String(MAX_STEPS)} steps`);
        const command = policy(engine, ruleset, state);
        commands.push(command);
        const t0 = now();
        const result = engine.apply(ruleset, state, command);
        const ms = now() - t0;
        total += ms;
        max = Math.max(max, ms);
        steps++;
        if (!result.ok) throw new Error(`dead end: ${command.type} rejected: ${result.validation.violations.map((v) => v.code).join(", ")}`);
        state = result.transition.state;
      }
    } catch (e) {
      failures.push({ seed, reason: e instanceof Error ? e.message : String(e), commands });
    }
  }
  return { games: seeds, failures, steps, applyMs: { mean: steps === 0 ? 0 : total / steps, max } };
}
