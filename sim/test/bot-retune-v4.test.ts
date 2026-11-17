// Roster v4 (doc 37): the Bot Tuning Desk export of 17 Nov 2026. Dials, potential models,
// 2-move planning and the 1,800-step budget; the PKK Legitimacy dial counts against the State.
import { describe, expect, it } from "vitest";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import { evaluate } from "../src/cli/strategies/evaluation.ts";
import { CURRENT, FAMILIES } from "../src/cli/strategies/scenario-a.ts";
import { decisionPoint, generateCandidates } from "../src/cli/candidates.ts";
import { determinize, observe, SearchRng } from "../src/cli/player-observation.ts";
import { isObservationPlayer, TransitionBudget } from "../src/cli/players.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, ruleset, setLevel, setPieces, setTrack, turnOf } from "./board.ts";

const params = (id: string): Readonly<Record<string, unknown>> => resolvePlayer(id).spec.params;

describe("roster v4 from the Bot Tuning Desk export", () => {
  it("registers all eight families at version 4 with 2-move planning and a 1,800-step budget", () => {
    for (const id of ["S-POL", "S-MIL", "S-CON", "S-ADAPT", "P-POL", "P-EXP", "P-SURV", "P-ADAPT"]) {
      const p = resolvePlayer(`${id}@4`);
      expect(p.spec.budget, id).toBe(1800);
      expect(params(`${id}@4`)["lookahead"], id).toBe(2);
    }
  });

  it("applies the exported dial and potential-model changes", () => {
    expect(params("S-POL@4")).toMatchObject({ legitimacy: 0.35, potentialModel: "uncapped" });
    expect(params("S-MIL@4")).toMatchObject({ pkkBases: 3, potentialModel: "uncapped" });
    expect(params("S-CON@4")).toMatchObject({ oppPotential: 1, potentialModel: "capped" });
    expect(params("S-ADAPT@4")).toMatchObject({ ownPotential: 0.9, oppPotential: 1.15, pkkBases: 3, guerrillas: 1.5, legitimacy: 0.8, potentialModel: "capped", adaptive: true });
    expect(params("P-POL@4")).toMatchObject({ ownPotential: 1.4, oppPotential: 0.65, legitimacy: 0.3, potentialModel: "capped" });
    expect(params("P-EXP@4")).toMatchObject({ ownPotential: 0.35, potentialModel: "capped" });
    expect(params("P-SURV@4")).toMatchObject({ convertBy: 0.5, potentialModel: "capped" });
  });

  it("keeps the earlier versions registered for paired comparison", () => {
    for (const id of ["S-POL@1", "P-POL@2", "P-SHIELD@3"]) expect(resolvePlayer(id).spec.id).toBe(id);
    expect(params("S-POL@1")["lookahead"]).toBe(1);
  });

  it("makes v4 the qualified roster for both factions", () => {
    expect(new Set(CURRENT.map((f) => f.version))).toEqual(new Set([4]));
    expect(CURRENT).toHaveLength(8);
    expect(FAMILIES.filter((f) => f.version === 4)).toHaveLength(8);
  });
});

describe("Legitimacy dial counts for the bot's own side", () => {
  type W = Parameters<typeof evaluate>[3];
  const weights = (id: string): W => resolvePlayer(id).spec.params as unknown as W;
  // The dial's own contribution: same board, dial on minus dial off.
  const dial = (id: string, faction: "state" | "pkk"): number => {
    const s = setTrack(turnOf(faction), "legitimacy", 10);
    return evaluate(ruleset, s, faction, weights(id)).value - evaluate(ruleset, s, faction, { ...weights(id), legitimacy: 0 }).value;
  };
  it("a PKK bot with a positive Legitimacy dial counts State Legitimacy against itself", () => {
    expect(dial("P-POL@4", "pkk")).toBeCloseTo(-3, 6);
  });
  it("a State bot with a positive Legitimacy dial counts its Legitimacy for itself", () => {
    expect(dial("S-POL@4", "state")).toBeCloseTo(3.5, 6);
  });
});

describe("2-move planning sees the opponent's winning reply (doc 37)", () => {
  // Last card of C2, State First Eligible, PKK Second Eligible. PKK 31 with 1 Resource and three
  // Guerrillas in Mardin: a Rally Base there reaches 32 at the C2 check. Regression: the first
  // 2-move search kept unchecked plans in the choice and let that reply win.
  const C1 = ["DK-001", "DK-002", "DK-003", "DK-004", "DK-005", "DK-006", "DK-007", "DK-008", "DK-009", "DK-010", "DK-011", "DK-012", "DK-016"];
  const C2 = ["DK-017", "DK-018", "DK-019", "DK-020", "DK-022", "DK-023", "DK-024", "DK-025", "DK-026", "DK-027", "DK-028", "DK-015"];
  const build = (): GameState => {
    let s = engine.start(ruleset, "full-campaign", 1).state;
    for (const [k, v] of Object.entries({ "van-rural": -2, "van-city": -2, bitlis: -2, sanliurfa: -2, mus: -2, sirnak: -1, siirt: -2, "bingol-tunceli": -1, hakkari: -2 })) s = setLevel(s, k, v);
    s = setPieces(setPieces(setPieces(setPieces(s, "mardin", "guerrilla", 3), "sirnak", "pkkBase", 2), "hakkari", "pkkBase", 2), "kdp-zone", "guerrilla", 3);
    s = setTrack(setTrack(s, "resources.pkk", 1), "resources.state", 10);
    return { ...s, turn: { campaign: "C2", propagandaRound: 1, cardIndex: 25, phase: "card", step: 0 }, deck: { piles: [[], ["DK-035"], ...s.deck.piles.slice(2)], currentCard: "DK-021", played: [...C1, ...C2], setAside: [] }, hands: { state: [], pkk: [] }, initiative: { boxes: { state: null, pkk: null }, firstEligible: "state", secondEligible: "pkk", actedThisCard: [] } };
  };
  const act = (s: GameState, id: string): GameState => {
    const p = resolvePlayer(id);
    if (!isObservationPlayer(p)) throw new Error(id);
    const f = p.spec.faction;
    const observation = observe(s, f);
    const candidates = generateCandidates(engine, ruleset, determinize(ruleset, observation, new SearchRng(0)), "card", f).candidates.filter((c) => engine.validate(ruleset, s, c.command).ok);
    const choice = p.decide({ decisionId: "t", kind: "card", faction: f, observation, candidates }, { engine, ruleset, rng: new SearchRng(1), budget: new TransitionBudget(engine, p.spec.budget) });
    const picked = candidates.find((c) => c.id === choice.candidateId);
    if (picked === undefined) throw new Error("unknown candidate");
    return play(picked.command);
    function play(command: Parameters<typeof engine.apply>[2]): GameState {
      let next = engine.apply(ruleset, s, command);
      if (!next.ok) throw new Error("illegal");
      let after = next.transition.state;
      for (let i = 0; i < 20 && after.ended === null; i++) {
        const d = decisionPoint(engine, ruleset, after);
        if (d.kind !== "auto") break;
        next = engine.apply(ruleset, after, d.command);
        if (!next.ok) break;
        after = next.transition.state;
      }
      return after;
    }
  };

  it("S-MIL@4 plays so that the PKK's best reply does not win at the C2 check", () => {
    const s = build();
    expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "card", faction: "state" });
    const reply = act(act(s, "S-MIL@4"), "P-POL@2");
    expect(reply.ended?.winner).not.toBe("pkk");
  }, 300_000);
});
