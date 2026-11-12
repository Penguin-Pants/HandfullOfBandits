// Phase 5 (20): player qualification (19 s6). Every qualified family passes every applicable
// fixture; baselines do not, so the fixtures discriminate; the independent score oracle agrees
// with the engine over many positions.
import { describe, expect, it, vi } from "vitest";
import { decisionPoint, generateCandidates } from "../src/cli/candidates.ts";
import { determinize, observe, SearchRng } from "../src/cli/player-observation.ts";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import { FIXTURES, independentStandings, qualify, runFixture, suiteHash } from "../src/cli/qualification.ts";
import { CURRENT, roundRobin } from "../src/cli/strategies/scenario-a.ts";
import { TransitionBudget, type ObservationPlayer } from "../src/cli/players.ts";
import { derive } from "../src/engine/coin/derive.ts";
import { checkStandings } from "../src/engine/coin/victory.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, ruleset } from "./board.ts";

// Real games and workers: slow under full-suite load.
vi.setConfig({ testTimeout: 120000 });

const qualified = CURRENT.map((f) => `${f.id}@${String(f.version)}`);

describe("qualification fixtures (19 s6)", () => {
  it("covers all five benchmark rows for both factions", () => {
    for (const faction of ["state", "pkk"]) {
      const rows = new Set(FIXTURES.filter((f) => f.faction === faction).map((f) => f.benchmark));
      for (const row of ["available win", "preventable loss", "scoring", "costs and Harm", "procedures"]) expect(rows, `${faction} ${row}`).toContain(row);
    }
  });

  it("starts each fixture at its declared decision", () => {
    for (const f of FIXTURES) {
      const s = f.build(engine.start(ruleset, "full-campaign", 1).state, ruleset);
      expect(decisionPoint(engine, ruleset, s), f.id).toEqual({ kind: f.kind, faction: f.faction });
    }
  });

  it.each(qualified)("%s passes every applicable fixture with a legal command", (id) => {
    const player = resolvePlayer(id);
    for (const f of FIXTURES) {
      const r = runFixture(engine, ruleset, f, player);
      expect(r.passed, `${f.id}: ${r.detail}`).toBe(true);
    }
  });

  it("fails random and legacy baselines on decisive fixtures, so the suite discriminates", () => {
    const report = qualify(engine, ruleset, ["S-RANDOM@1", "P-RANDOM@1", "S-CTRL-concentration@1"].map(resolvePlayer));
    for (const p of Object.values(report.players)) expect(p.passed).toBe(false);
    const decisive = new Set(FIXTURES.filter((f) => f.benchmark !== "procedures").map((f) => f.id));
    for (const p of Object.values(report.players)) expect(p.failures.some((f) => decisive.has(f))).toBe(true);
  });

  it("has a stable suite hash", () => {
    expect(suiteHash(engine, ruleset)).toBe(suiteHash(engine, ruleset));
  });

  it("every fixture's decisive alternatives exist among the generated candidates", () => {
    for (const f of FIXTURES.filter((x) => x.benchmark !== "procedures")) {
      const s = f.build(engine.start(ruleset, "full-campaign", 1).state, ruleset);
      const projection = determinize(ruleset, observe(s, f.faction), new SearchRng(0));
      const set = generateCandidates(engine, ruleset, projection, f.kind, f.faction);
      // At least one generated candidate passes and at least one fails: the fixture is a real choice.
      const outcomes = set.candidates.map((c) => {
        let after = engine.apply(ruleset, s, c.command);
        if (!after.ok) return false;
        let st = after.transition.state;
        for (let i = 0; i < 16 && st.ended === null; i++) {
          const next = decisionPoint(engine, ruleset, st);
          const step = next.kind === "auto" ? next.command : next.kind === "agitation" && f.kind === "civicAction" ? { type: "Advance" } : null;
          if (step === null) break;
          after = engine.apply(ruleset, st, step);
          if (!after.ok) break;
          st = after.transition.state;
        }
        return f.accept(ruleset, st, c.command);
      });
      expect(outcomes.some(Boolean), `${f.id} has a passing candidate`).toBe(true);
      expect(outcomes.some((x) => !x), `${f.id} has a failing candidate`).toBe(true);
    }
  });
});

describe("search order (PR #40 review)", () => {
  it("rotates families even when every candidate fits, so a spent budget never starves late families", () => {
    const c = (family: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: `${family}#${String(i)}`, family, command: { type: "Pass" } }));
    const order = roundRobin([...c("a", 3), ...c("b", 2), ...c("z", 1)]).map((x) => x.family);
    expect(order).toEqual(["a", "b", "z", "a", "b", "a"]);
  });

  it("reaches every family of a large card decision within a small budget", () => {
    const s = engine.start(ruleset, "full-campaign", 5).state;
    const started = engine.apply(ruleset, s, { type: "Advance" });
    expect.assert(started.ok);
    const live = started.transition.state;
    const point = decisionPoint(engine, ruleset, live);
    expect.assert(point.kind === "card");
    const observation = observe(live, point.faction);
    const candidates = generateCandidates(engine, ruleset, determinize(ruleset, observation, new SearchRng(0)), "card", point.faction).candidates;
    const families = new Set(candidates.map((x) => x.family)).size;
    const player = resolvePlayer(point.faction === "state" ? "S-POL@1" : "P-POL@2") as ObservationPlayer;
    const choice = player.decide({ decisionId: "d", kind: "card", faction: point.faction, observation, candidates }, { engine, ruleset, rng: new SearchRng(1), budget: new TransitionBudget(engine, families * 2) });
    const evaluated = Number(/evaluated (\d+)\//.exec(choice.notes.join(" "))?.[1] ?? candidates.length);
    expect(evaluated).toBeGreaterThanOrEqual(Math.min(families, candidates.length) - 1);
  });
});

describe("independent score oracle (19 s6: the engine is not the only oracle)", () => {
  it("agrees with the engine derivation and final margins over positions from random games", () => {
    let checked = 0;
    for (const seed of [1, 2, 3, 4]) {
      let s: GameState = engine.start(ruleset, "full-campaign", seed).state;
      const rng = new SearchRng(seed);
      while (s.ended === null) {
        const st = independentStandings(ruleset, s);
        const view = derive(ruleset, s);
        expect([st.state.score, st.pkk.score, st.state.harm, st.pkk.harm]).toEqual([view.scores["state"], view.scores["pkk"], view.harm["state"], view.harm["pkk"]]);
        expect([st.state.finalMargin, st.pkk.finalMargin]).toEqual(checkStandings(ruleset, s, true).map((x) => x.margin));
        checked++;
        const point = decisionPoint(engine, ruleset, s);
        if (point.kind === "none") break;
        const pick = point.kind === "auto" ? null : generateCandidates(engine, ruleset, s, point.kind, point.faction).candidates;
        const command = pick === null ? (point.kind === "auto" ? point.command : null) : pick[rng.int(pick.length)]?.command ?? null;
        if (command === null) throw new Error("no candidate");
        const r = engine.apply(ruleset, s, command);
        if (!r.ok) throw new Error("candidate must be legal");
        s = r.transition.state;
      }
    }
    expect(checked).toBeGreaterThan(150);
  });
});
