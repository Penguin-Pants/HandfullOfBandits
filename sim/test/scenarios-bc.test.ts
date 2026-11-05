// P3b-08: Scenarios B and C (research 10 s4, s5). Accept: start scores equal 09 s2.3. T-SCORE, golden.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { derive } from "../src/engine/coin/derive.ts";
import { setupState } from "../src/engine/core/state.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { withSessionOptions } from "../src/package/load.ts";
import { playGame, replay, scriptedPolicy, type PlayRecord } from "../src/cli/play.ts";
import { engine, ruleset } from "./board.ts";

const count = (faces: Readonly<Record<string, number>> | undefined): number => Object.values(faces ?? {}).reduce((a, n) => a + n, 0);

/** [on map, Available, Out of Play] per piece type. */
function totals(state: GameState): Record<string, [number, number, number]> {
  return Object.fromEntries(
    Object.entries(state.pools).map(([piece, pool]) => [piece, [Object.values(state.spaces).reduce((sum, s) => sum + count(s.pieces[piece]), 0), pool.available, pool.outOfPlay]]),
  );
}

function markers(state: GameState, marker: string): Record<string, Readonly<Record<string, number>>> {
  return Object.fromEntries(Object.entries(state.spaces).filter(([, s]) => count(s.markers[marker]) > 0).map(([id, s]) => [id, s.markers[marker] ?? {}]));
}

const controlled = (state: GameState, faction: string): string[] =>
  Object.entries(derive(ruleset, state).control).filter(([, f]) => f === faction).map(([s]) => s).sort();

describe("Scenario B: 1990-1995 (10 s4)", () => {
  const state = setupState(ruleset, "scenario-b", 1);

  it("T-SCORE: start scores 20 and 14, Harm 0 and 0, thresholds 48 and 41 (09 s2.3)", () => {
    const view = derive(ruleset, state);
    expect(view.scores).toEqual({ state: 20, pkk: 14 });
    expect(view.harm).toEqual({ state: 0, pkk: 0 });
    expect(view.totals).toEqual({ totalSupport: 11, totalOpposition: 10, domesticPkkBases: 4, domesticGuerrillas: 13 });
    expect(ruleset.scenarios["scenario-b"]?.thresholds).toEqual({ state: 48, pkk: 41 });
  });

  it("piece totals reconcile with the 10 s4.2 totals", () => {
    expect(totals(state)).toEqual({
      troops: [20, 10, 0], police: [16, 8, 0], guards: [8, 8, 0], stateBase: [6, 2, 0], guerrilla: [17, 13, 0], pkkBase: [6, 6, 0],
    });
  });

  it("T-SCORE: Control matches the 10 s4.2 table; Bingöl-Muş is uncontrolled (3 v 3)", () => {
    expect(controlled(state, "state")).toEqual(
      ["hakkari", "botan", "mardin-batman", "diyarbakir-city", "diyarbakir-rural", "sanliurfa", "adiyaman", "elazig", "dersim", "van-bitlis", "agri", "western-cities"].sort(),
    );
    expect(controlled(state, "pkk")).toEqual([]);
  });

  it("starts in C3 with the 10 s4.1 tracks, Law 3175 in effect and the 10 s4 Pivotals", () => {
    const b = ruleset.scenarios["scenario-b"];
    expect(b?.blockedBy).toEqual([]);
    expect(b?.campaigns).toEqual(["C3", "C4"]);
    expect(b?.finalRound).toBe(2);
    expect(b?.pivotals).toEqual({ state: ["DK-076"], pkk: ["DK-054"] });
    expect(state.turn.campaign).toBe("C3");
    expect(state.tracks).toMatchObject({
      "resources.state": 15, "resources.pkk": 8, legitimacy: 9, emergencyRule: "ohal", "posture.syria": "tolerant", "posture.kdp": "tolerant", "posture.puk": "tolerant",
      europe: 2, ceasefire: "none", legalSpace: "absent",
    });
    expect(state.flags).toEqual({ law3175: true });
    expect(markers(state, "leadership")).toEqual({ "syria-bekaa": { present: 1, abroad: 0 } });
  });

  it("the State threshold is 48 by default and 46 as a session option (DEC-24, DEC-77)", () => {
    expect(withSessionOptions(ruleset, "scenario-b", {}).scenarios["scenario-b"]?.thresholds).toEqual({ state: 48, pkk: 41 });
    // The Home screen sends a picked value as text.
    expect(withSessionOptions(ruleset, "scenario-b", { "threshold.state": "46" }).scenarios["scenario-b"]?.thresholds).toEqual({ state: 46, pkk: 41 });
    expect(withSessionOptions(ruleset, "scenario-b", { "threshold.state": 46 }).scenarios["scenario-b"]?.thresholds).toEqual({ state: 46, pkk: 41 });
  });

  it("refuses a threshold option that is not an integer", () => {
    expect(() => withSessionOptions(ruleset, "scenario-b", { "threshold.state": "x" })).toThrow(/needs an integer/);
  });

  it("a scenario without the threshold option ignores it", () => {
    expect(withSessionOptions(ruleset, "scenario-a", { "threshold.state": "46" }).scenarios["scenario-a"]?.thresholds).toEqual({ state: 49, pkk: 30 });
  });
});

describe("Scenario C: 1993-1999 (10 s5)", () => {
  const state = setupState(ruleset, "scenario-c", 1);

  it("T-SCORE: start scores 16 and 23, Harm 3 and 0, thresholds 44 and 48 (09 s2.3)", () => {
    const view = derive(ruleset, state);
    expect(view.scores).toEqual({ state: 16, pkk: 23 });
    expect(view.harm).toEqual({ state: 3, pkk: 0 });
    expect(view.totals).toEqual({ totalSupport: 9, totalOpposition: 18, domesticPkkBases: 5, domesticGuerrillas: 19 });
    expect(ruleset.scenarios["scenario-c"]?.thresholds).toEqual({ state: 44, pkk: 48 });
  });

  it("piece totals reconcile with the 10 s5.2 totals", () => {
    expect(totals(state)).toEqual({
      troops: [21, 9, 0], police: [17, 7, 0], guards: [10, 6, 0], stateBase: [6, 2, 0], guerrilla: [24, 6, 0], pkkBase: [7, 5, 0],
    });
  });

  it("T-SCORE: Control matches the 10 s5.2 table", () => {
    expect(controlled(state, "state")).toEqual(
      ["botan", "mardin-batman", "diyarbakir-city", "diyarbakir-rural", "sanliurfa", "adiyaman", "elazig", "van-bitlis", "agri", "western-cities"].sort(),
    );
    expect(controlled(state, "pkk")).toEqual(["bingol-mus"]);
  });

  it("places the 10 s5.2 markers: Offices, Harm, Displacement (Old) and Reception", () => {
    expect(markers(state, "office")).toEqual({ "diyarbakir-city": { default: 1 }, "mardin-batman": { default: 1 }, "western-cities": { default: 1 } });
    expect(markers(state, "stateHarm")).toEqual({ botan: { default: 1 }, "mardin-batman": { default: 1 }, "diyarbakir-rural": { default: 1 } });
    expect(markers(state, "disputedHarm")).toEqual({ "mardin-batman": { default: 1 } });
    expect(markers(state, "displacement")).toEqual({ botan: { new: 0, old: 1 } });
    expect(markers(state, "reception")).toEqual({ "western-cities": { default: 1 } });
    expect(markers(state, "leadership")).toEqual({ "syria-bekaa": { present: 1, abroad: 0 } });
  });

  it("starts in C4 with the 10 s5.1 tracks, flags and Pivotals", () => {
    const c = ruleset.scenarios["scenario-c"];
    expect(c?.blockedBy).toEqual([]);
    expect(c?.campaigns).toEqual(["C4", "C5"]);
    expect(c?.finalRound).toBe(2);
    expect(c?.pivotals).toEqual({ state: ["DK-076", "DK-098"], pkk: ["DK-054"] });
    expect(state.turn.campaign).toBe("C4");
    expect(state.tracks).toMatchObject({
      "resources.state": 20, "resources.pkk": 10, legitimacy: 7, emergencyRule: "ohalExtendedPowers", "posture.syria": "restricted", "posture.kdp": "hostile",
      "posture.puk": "restricted", europe: 3, ceasefire: "none", legalSpace: "prosecuted",
    });
    expect(state.flags).toEqual({ law3175: true, closureCase: true, northernIraqVacuum: true });
  });
});

// Scripted policy, seed 7, as the Scenario A golden. UPDATE_GOLDEN=1 rewrites the files.
describe.each(["scenario-b", "scenario-c"])("%s golden", (scenario) => {
  const golden = new URL(`golden/${scenario}-seed-7.json`, import.meta.url);
  const game = playGame(engine, ruleset, scenario, 7, scriptedPolicy);
  if (process.env["UPDATE_GOLDEN"] === "1" || !existsSync(golden)) {
    const record: PlayRecord = { scenario: game.scenario, seed: game.seed, commands: game.commands, hashes: game.hashes, ended: game.ended };
    writeFileSync(golden, `${JSON.stringify(record, null, 1)}\n`);
  }
  const stored = JSON.parse(readFileSync(golden, "utf8")) as PlayRecord;

  it("plays to final scoring in round two", () => {
    expect(game.ended).toBe(true);
    expect(game.state.turn.propagandaRound).toBe(2);
    expect(game.state.ended?.reason).toBe("final scoring");
  });

  it("replays the golden file hash by hash", () => {
    expect(game.hashes).toEqual(stored.hashes);
    expect(replay(engine, ruleset, stored)).toBeNull();
  });
});
