// P3c-01 integration: the full campaign plays through every Reset, and on entering each Campaign
// the switch flags equal the 10 s6.2 rows up to it. Scripted policy, seed 7 (DEC-76).
import { describe, expect, it } from "vitest";
import { playGame, scriptedPolicy } from "../src/cli/play.ts";
import { SWITCH, switchesAt } from "../src/engine/coin/switches.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, ruleset } from "./board.ts";

const switches = (s: GameState) => Object.fromEntries(Object.values(SWITCH).map((f) => [f, s.flags[f] === true]));

describe("P3c-01 full campaign switches (10 s6.2)", () => {
  it("sets the switch flags of each Campaign at each Reset", () => {
    const seen = new Map<string, ReturnType<typeof switches>>();
    const game = playGame(engine, ruleset, "full-campaign", 7, (e, r, s) => {
      if (s.turn.campaign !== null && !seen.has(s.turn.campaign)) seen.set(s.turn.campaign, switches(s));
      return scriptedPolicy(e, r, s);
    });
    expect(game.ended).toBe(true);
    expect([...seen.keys()]).toEqual(["C1", "C2", "C3", "C4", "C5"]);
    for (const [campaign, flags] of seen) expect(flags, campaign).toEqual(switches({ ...game.state, flags: { ...switchesAt(ruleset, campaign) } }));
  });
});
