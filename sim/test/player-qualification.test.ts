// Phase 5 (20): player qualification (19 s6). Every qualified family passes every applicable
// fixture; baselines do not, so the fixtures discriminate; the independent score oracle agrees
// with the engine over many positions.
import { describe, expect, it, vi } from "vitest";
import { decisionPoint, generateCandidates } from "../src/cli/candidates.ts";
import { determinize, observe, SearchRng } from "../src/cli/player-observation.ts";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import { FIXTURES, independentStandings, qualify, runFixture, suiteHash } from "../src/cli/qualification.ts";
import { CURRENT, roundRobin } from "../src/cli/strategies/roster.ts";
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

  it("has a procedure fixture for each C3 to C5 decision, and each offers the action it names", () => {
    const expected: Record<string, string[]> = {
      "P-PROC-ARGK": ["pivotal:play", "pivotal:decline"],
      "S-PROC-CLEARANCE": ["op:state.sweep+state.village-clearance@opSa"],
      "S-PROC-COVERT": ["op:state.sweep+state.covert-action@opSa"],
      "P-PROC-DECLARE": ["ceasefire:declare"],
      "S-PROC-LEGAL": ["propaganda:legalPolitics"],
      "P-PROC-CEASEFIRE": ["propaganda:legalPolitics"],
      "P-PROC-SERHILDAN": ["pivotal:play:DK-054", "pivotal:decline"],
      "S-PROC-PIVOTAL-C5": ["pivotal:play:DK-076", "pivotal:play:DK-098", "pivotal:decline"],
    };
    for (const [id, families] of Object.entries(expected)) {
      const f = FIXTURES.find((x) => x.id === id);
      expect(f?.benchmark, id).toBe("procedures");
      if (f === undefined) continue;
      const s = f.build(engine.start(ruleset, "full-campaign", 1).state, ruleset);
      const set = generateCandidates(engine, ruleset, determinize(ruleset, observe(s, f.faction), new SearchRng(0)), f.kind, f.faction);
      const live = set.candidates.filter((c) => engine.validate(ruleset, s, c.command).ok);
      for (const family of families) expect(live.some((c) => c.family === family), `${id} ${family}`).toBe(true);
      if (families[0] === "propaganda:legalPolitics") expect(live.length, id).toBeGreaterThan(1);
    }
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

describe("P-HARM-GATE isolates the Harm gate (rules 7.2)", () => {
  it("starts at or above the PKK threshold with Harm six, so only the seventh Harm can stop the win", () => {
    const fixture = FIXTURES.find((f) => f.id === "P-HARM-GATE");
    if (fixture === undefined) throw new Error("P-HARM-GATE");
    const st = independentStandings(ruleset, fixture.build(engine.start(ruleset, "full-campaign", 1).state, ruleset));
    expect(st.pkk.harm).toBe(6);
    expect(st.pkk.checkQualifies).toBe(true);
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

// Audit Plan 2 S5: C3 to C5 positions with a clear best move.
describe("C3 to C5 qualification positions (audit Plan 2 S5)", () => {
  const start = engine.start(ruleset, "full-campaign", 1).state;
  const built = (id: string): GameState => {
    const f = FIXTURES.find((x) => x.id === id);
    if (f === undefined) throw new Error(id);
    return f.build(start, ruleset);
  };
  /** Accept outcome of every generated candidate, by family. */
  const outcomes = (id: string): { family: string; ok: boolean }[] => {
    const f = FIXTURES.find((x) => x.id === id);
    if (f === undefined) throw new Error(id);
    const s = f.build(start, ruleset);
    return generateCandidates(engine, ruleset, s, f.kind, f.faction).candidates.map((c) => {
      const applied = engine.apply(ruleset, s, c.command);
      if (!applied.ok) return { family: c.family, ok: false };
      let st = applied.transition.state;
      for (let i = 0; i < 16 && st.ended === null; i++) {
        const next = decisionPoint(engine, ruleset, st);
        if (next.kind !== "auto") break;
        const r = engine.apply(ruleset, st, next.command);
        if (!r.ok) break;
        st = r.transition.state;
      }
      return { family: c.family, ok: f.accept(ruleset, st, c.command) };
    });
  };

  it("has at least 10 new decisive positions in C3 to C5, 16 with the final-round ones", () => {
    const late = FIXTURES.filter((f) => f.benchmark !== "procedures" && ["C3", "C4", "C5"].includes(f.build(start, ruleset).turn.campaign ?? ""));
    expect(late.filter((f) => /-C[345]-/.test(f.id)).length).toBeGreaterThanOrEqual(10);
    expect(late.length).toBeGreaterThanOrEqual(16);
  });

  it("checkCard positions are the last Event card of their Campaign, with its Propaganda card next", () => {
    for (const [id, campaign, round] of [["S-C3-CLEARANCE-DEFEND", "C3", 2], ["P-C4-WIN-CHECK", "C4", 3], ["S-C5-DEFEND-CHECK", "C5", 4]] as const) {
      const s = built(id);
      expect(s.turn.campaign, id).toBe(campaign);
      expect(s.turn.propagandaRound, id).toBe(round);
      const next = s.deck.piles.find((p) => p.length > 0)?.[0] ?? "";
      expect(ruleset.cards[next]?.type, id).toBe("propaganda");
      expect(ruleset.cards[next]?.campaign, id).toBe(campaign);
    }
  });

  it("only Village Clearance stops the PKK check win in S-C3-CLEARANCE-DEFEND", () => {
    const passing = outcomes("S-C3-CLEARANCE-DEFEND").filter((o) => o.ok);
    expect(passing.length).toBeGreaterThan(0);
    expect(passing.every((o) => o.family.includes("village-clearance"))).toBe(true);
  });

  it("every Village Clearance and Covert Action play loses S-C3-CLEARANCE-HARM, and every Covert Action play loses S-C3-COVERT-CHECK", () => {
    const harm = outcomes("S-C3-CLEARANCE-HARM").filter((o) => o.family.includes("village-clearance") || o.family.includes("covert-action"));
    expect(harm.length).toBeGreaterThan(0);
    expect(harm.every((o) => !o.ok)).toBe(true);
    const covert = outcomes("S-C3-COVERT-CHECK").filter((o) => o.family.includes("covert-action"));
    expect(covert.length).toBeGreaterThan(0);
    expect(covert.every((o) => !o.ok)).toBe(true);
  });

  it("only a breach (Coerce under Reciprocal Restraint) stops the State in P-C3-BREACH-DEFEND", () => {
    const passing = outcomes("P-C3-BREACH-DEFEND").filter((o) => o.ok);
    expect(passing.length).toBeGreaterThan(0);
    expect(passing.every((o) => o.family.includes("pkk.coerce"))).toBe(true);
  });

  it("the independent oracle counts a face-down Covert marker at a check as the engine does (rules 7.2)", () => {
    const s = built("S-C3-COVERT-CHECK");
    expect(independentStandings(ruleset, s).state.checkQualifies).toBe(true);
    const space = s.spaces["mardin"];
    if (space === undefined) throw new Error("mardin");
    const covert = { ...s, spaces: { ...s.spaces, mardin: { ...space, markers: { ...space.markers, covert: { default: 1 } } } } };
    const independent = independentStandings(ruleset, covert).state;
    const engineView = checkStandings(ruleset, covert, false).find((x) => x.faction === "state");
    expect(independent.checkQualifies).toBe(false);
    expect(engineView?.score).toBe(48);
    expect(engineView?.harm).toBe(1);
  });
});
