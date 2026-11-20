// Audit Plan 2 S3: determinized search to 4 plies. Legal, reproducible, within budget, explainable,
// and qualified on every fixture.
import { describe, expect, it, vi } from "vitest";
import { decisionPoint, generateCandidates } from "../src/cli/candidates.ts";
import { determinize, observe, SearchRng } from "../src/cli/player-observation.ts";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import { TransitionBudget, type ObservationPlayer, type SearchContext } from "../src/cli/players.ts";
import { FIXTURES, runFixture } from "../src/cli/qualification.ts";
import { BASE } from "../src/cli/strategies/roster.ts";
import { DEPTH, sampleLine, searchPlayer } from "../src/cli/strategies/search.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, ruleset } from "./board.ts";

vi.setConfig({ testTimeout: 240_000 });

/** A card decision a few cards into C1. */
function midGame(): GameState {
  let s = engine.start(ruleset, "full-campaign", 7).state;
  for (let i = 0; i < 6; i++) {
    const point = decisionPoint(engine, ruleset, s);
    const command = point.kind === "auto" ? point.command : point.kind === "card" ? { type: "Pass", faction: point.faction } : null;
    if (command === null) break;
    const r = engine.apply(ruleset, s, command);
    if (!r.ok) throw new Error("setup");
    s = r.transition.state;
  }
  return s;
}

const ctxFor = (player: ObservationPlayer, seed: number): SearchContext => ({ engine, ruleset, rng: new SearchRng(seed), budget: new TransitionBudget(engine, player.spec.budget) });

describe("search players (audit Plan 2 S3)", () => {
  it("registers S-SEARCH@1 and P-SEARCH@1 and nothing else", () => {
    expect(resolvePlayer("S-SEARCH@1").spec.faction).toBe("state");
    expect(resolvePlayer("P-SEARCH@1").spec.faction).toBe("pkk");
    expect(searchPlayer("S-SEARCH", 9)).toBeNull();
    expect(() => resolvePlayer("S-SEARCH@9")).toThrow();
  });

  it("samples lines of at most 4 plies, alternating as eligibility decides, and stops at a non-card decision", () => {
    const s = midGame();
    const point = decisionPoint(engine, ruleset, s);
    expect.assert(point.kind === "card");
    const player = resolvePlayer(point.faction === "state" ? "S-SEARCH@1" : "P-SEARCH@1") as ObservationPlayer;
    const ctx = ctxFor(player, 1);
    const base = determinize(ruleset, observe(s, point.faction), ctx.rng);
    const [c] = generateCandidates(engine, ruleset, base, "card", point.faction).candidates;
    if (c === undefined) throw new Error("no candidate");
    const applied = engine.apply(ruleset, base, c.command);
    expect.assert(applied.ok);
    const line = sampleLine(ctx, applied.transition.state, point.faction, BASE);
    expect(line.plays.length).toBeLessThanOrEqual(DEPTH - 1);
    // Each play was the acting faction's at that point.
    let at = applied.transition.state;
    for (const p of line.plays) {
      const here = decisionPoint(engine, ruleset, at);
      expect.assert(here.kind === "card");
      expect(p.faction).toBe(here.faction);
      const r = engine.apply(ruleset, at, p.command);
      expect.assert(r.ok);
      at = r.transition.state;
      for (let i = 0; i < 32; i++) {
        const n = decisionPoint(engine, ruleset, at);
        if (n.kind !== "auto") break;
        const x = engine.apply(ruleset, at, n.command);
        expect.assert(x.ok);
        at = x.transition.state;
      }
    }
  });

  it("decides a card play within its budget, reproducibly, with the top 3 and a sampled line", () => {
    const s = midGame();
    const point = decisionPoint(engine, ruleset, s);
    expect.assert(point.kind === "card");
    const player = resolvePlayer(point.faction === "state" ? "S-SEARCH@1" : "P-SEARCH@1") as ObservationPlayer;
    const observation = observe(s, point.faction);
    const candidates = generateCandidates(engine, ruleset, determinize(ruleset, observation, new SearchRng(0)), "card", point.faction).candidates.filter((c) => engine.validate(ruleset, s, c.command).ok);
    const request = { decisionId: "d", kind: "card" as const, faction: point.faction, observation, candidates };
    const a = ctxFor(player, 5);
    const first = player.decide(request, a);
    const second = player.decide(request, ctxFor(player, 5));
    expect(second.candidateId).toBe(first.candidateId);
    expect(candidates.some((c) => c.id === first.candidateId)).toBe(true);
    expect(a.budget.used).toBeLessThanOrEqual(player.spec.budget);
    expect(first.ranked?.length).toBeGreaterThanOrEqual(2);
    expect(first.ranked?.[0]?.id).toBe(first.candidateId);
    expect(first.notes.join(" ")).toMatch(/sampled lines to 4 plies/);
    expect(first.line?.length ?? 0).toBeGreaterThan(0);
  });

  it.each(["S-SEARCH@1", "P-SEARCH@1"])("%s passes every applicable qualification fixture", (id) => {
    const player = resolvePlayer(id);
    for (const f of FIXTURES) {
      const r = runFixture(engine, ruleset, f, player);
      expect(r.passed, `${f.id}: ${r.detail}`).toBe(true);
    }
  });
});
