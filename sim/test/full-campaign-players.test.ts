// DD-25 player review: the players and their fixtures read the full campaign from the ruleset,
// not from Scenario A (two Propaganda rounds, two piles) or literal space ids.
import { describe, expect, it } from "vitest";
import { generateCandidates } from "../src/cli/candidates.ts";
import { FIXTURES } from "../src/cli/qualification.ts";
import { features } from "../src/cli/strategies/evaluation.ts";
import type { GameState, Ruleset } from "../src/engine/core/types.ts";
import { engine, ruleset, setPieces, setTrack, turnOf, withCard } from "./board.ts";

const campaign = ruleset.scenarios["full-campaign"];

describe("potential estimate counts every income before the final round (rules 6.2, no final income)", () => {
  // State has Control and Police in its start Cities; PKK Bases open Agitation in four more spaces.
  // With 0 Resources each budget is income only.
  const at = (round: number): GameState => {
    const bases = ["mardin", "diyarbakir-rural", "mus", "bingol-tunceli"].reduce((acc, id) => setPieces(acc, id, "pkkBase", 1), turnOf("state"));
    const s = setTrack(setTrack(bases, "resources.state", 0), "resources.pkk", 0);
    return { ...s, turn: { ...s.turn, propagandaRound: round } };
  };

  it("has more State and PKK potential in C1 (four incomes left) than in C4 (one income left)", () => {
    expect(campaign?.finalRound).toBe(5);
    const c1 = features(ruleset, at(0));
    const c4 = features(ruleset, at(3));
    expect(c1.potential["state"]).toBeGreaterThan(c4.potential["state"] ?? 0);
    expect(c1.potential["pkk"]).toBeGreaterThan(c4.potential["pkk"] ?? 0);
  });

  it("counts no income in the last campaign, where only the final Propaganda remains", () => {
    const c5 = features(ruleset, at(4));
    expect(c5.potential["state"]).toBe(0);
    expect(c5.potential["pkk"]).toBe(0);
  });
});

describe("Cross-Border lifts read crossBorder.origins (DD-22 item 7)", () => {
  it("lifts Troops from the origins the ruleset names", () => {
    const moved: Ruleset = { ...ruleset, parameters: { ...ruleset.parameters, "crossBorder.origins": ["siirt"] } };
    const s = withCard(setTrack(setPieces(turnOf("state"), "siirt", "troops", 4), "resources.state", 30), "DK-014");
    const set = generateCandidates(engine, moved, s, "card", "state", { familyCap: 14, broad: false });
    const lifts = set.candidates.filter((c) => c.family.includes("state.cross-border")).map((c) => JSON.stringify(c.command));
    expect(lifts.some((t) => t.includes("\"from\":\"siirt\""))).toBe(true);
  });
});

describe("qualification fixtures keep the full-campaign deck", () => {
  it("every fixture board has one pile per campaign of the scenario", () => {
    const start = engine.start(ruleset, "full-campaign", 1).state;
    for (const f of FIXTURES) expect(f.build(start, ruleset).deck.piles, f.id).toHaveLength(campaign?.campaigns.length ?? 0);
  });
});
