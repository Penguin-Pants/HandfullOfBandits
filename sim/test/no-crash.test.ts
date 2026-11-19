// Audit Plan 1, milestone M1 (D-01): no command passes `validate` and then throws in `apply`.
// Random legal games give 50 mid-game states across the Campaigns. Every candidate that the bot
// generator emits for each state must apply without an exception and with `ok: true`.
import { describe, expect, it, vi } from "vitest";
import { decisionPoint, generateCandidates } from "../src/cli/candidates.ts";
import { MAX_STEPS, randomPolicy } from "../src/cli/fuzz.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, ruleset } from "./board.ts";

vi.setConfig({ testTimeout: 300000 });

const STATES = 50;
const GAMES = 10;

/** Every decision state of one random game, in play order. */
function decisionStates(seed: number): GameState[] {
  const policy = randomPolicy(seed + 2_000_000);
  const out: GameState[] = [];
  let state = engine.start(ruleset, "full-campaign", seed).state;
  for (let step = 0; state.ended === null && step < MAX_STEPS; step++) {
    const point = decisionPoint(engine, ruleset, state);
    if (point.kind !== "auto" && point.kind !== "none") out.push(state);
    const result = engine.apply(ruleset, state, point.kind === "auto" ? point.command : policy(engine, ruleset, state));
    if (!result.ok) break;
    state = result.transition.state;
  }
  return out;
}

/** STATES / GAMES states per game, evenly spaced from the first decision to the last. */
function sample(): GameState[] {
  const per = STATES / GAMES;
  return Array.from({ length: GAMES }, (_, g) => {
    const all = decisionStates(g);
    return Array.from({ length: per }, (_, i) => all[Math.floor(((i + 1) * all.length) / (per + 1))]).filter((s) => s !== undefined);
  }).flat();
}

/** Applies every candidate for `s`. Returns the count applied and one line per failure. */
function applyAll(s: GameState): { applied: number; failures: string[] } {
  const point = decisionPoint(engine, ruleset, s);
  if (point.kind === "auto" || point.kind === "none") return { applied: 0, failures: [] };
  const candidates = generateCandidates(engine, ruleset, s, point.kind, point.faction).candidates;
  const out: string[] = [];
  for (const { id, command } of candidates) {
    const where = `campaign ${s.turn.campaign ?? "none"}, ${point.kind}, ${id}`;
    try {
      const result = engine.apply(ruleset, s, command);
      if (!result.ok) out.push(`${where}: rejected ${result.validation.violations.map((v) => v.code).join(", ")}`);
    } catch (e) {
      out.push(`${where}: threw ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { applied: candidates.length, failures: out };
}

describe("M1: validate then apply never throws", () => {
  const states = sample();

  it("samples 50 mid-game states from every Campaign", () => {
    expect(states).toHaveLength(STATES);
    expect([...new Set(states.map((s) => s.turn.campaign))].sort()).toEqual(["C1", "C2", "C3", "C4", "C5"]);
  });

  it("applies every generated candidate with ok: true and no exception", () => {
    let applied = 0;
    const found: string[] = [];
    for (const s of states) {
      const result = applyAll(s);
      applied += result.applied;
      found.push(...result.failures);
    }
    expect(found).toEqual([]);
    // About 5,400 candidates today; the floor only proves the loop ran.
    expect(applied).toBeGreaterThan(STATES);
  });
});
