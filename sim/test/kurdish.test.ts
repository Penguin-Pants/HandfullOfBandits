import { describe, expect, it } from "vitest";
import { validateCommand } from "../src/cli/validate.ts";
import { derive } from "../src/engine/coin/derive.ts";
import { setupState } from "../src/engine/core/state.ts";
import { kurdish as result, kurdishDir as dir } from "./kurdish-package.ts";

// P2-01: Kurdish package 0.1.0 static data. Accept: `sim validate` passes, start scores 21 and 4.
const { data, ruleset } = result;

// Research 03 s4.1 printed adjacency list, typed from the table (domestic and special links).
const printed: Record<string, string[]> = {
  hakkari: ["botan", "van-bitlis", "kdp-zone"],
  botan: ["hakkari", "van-bitlis", "mardin-batman", "kdp-zone"],
  "mardin-batman": ["botan", "van-bitlis", "bingol-mus", "diyarbakir-rural", "sanliurfa", "syria-bekaa"],
  "diyarbakir-city": ["diyarbakir-rural"],
  "diyarbakir-rural": ["diyarbakir-city", "mardin-batman", "sanliurfa", "adiyaman", "elazig", "bingol-mus"],
  sanliurfa: ["mardin-batman", "diyarbakir-rural", "adiyaman", "syria-bekaa"],
  adiyaman: ["diyarbakir-rural", "sanliurfa"],
  elazig: ["diyarbakir-rural", "bingol-mus", "dersim"],
  dersim: ["elazig", "bingol-mus"],
  "bingol-mus": ["mardin-batman", "diyarbakir-rural", "elazig", "dersim", "van-bitlis", "agri"],
  "van-bitlis": ["hakkari", "botan", "mardin-batman", "bingol-mus", "agri"],
  agri: ["bingol-mus", "van-bitlis"],
  "western-cities": [],
  "kdp-zone": ["hakkari", "botan", "puk-zone"],
  "puk-zone": ["kdp-zone"],
  "syria-bekaa": ["mardin-batman", "sanliurfa"],
  iran: [],
  europe: [],
};

describe("kurdish-coin 0.1.0", () => {
  it("passes sim validate with no issues", () => {
    expect(validateCommand(dir).exitCode).toBe(0);
    expect(result.issues).toEqual([]);
  });

  it("has 13 domestic spaces with total Pop 32 and 5 external boxes (03 s1, s2)", () => {
    const domestic = data.map.spaces.filter((s) => s.kind === "domestic");
    expect(domestic).toHaveLength(13);
    expect(domestic.reduce((sum, s) => sum + s.pop, 0)).toBe(32);
    expect(data.map.spaces.filter((s) => s.kind === "external").map((s) => s.id).sort()).toEqual(["europe", "iran", "kdp-zone", "puk-zone", "syria-bekaa"]);
  });

  it("has the adjacency of 03 s4.1, both ways", () => {
    const actual: Record<string, string[]> = Object.fromEntries(data.map.spaces.map((s) => [s.id, []]));
    for (const { a, b } of data.map.links) {
      actual[a]?.push(b);
      actual[b]?.push(a);
    }
    const sorted = (m: Record<string, string[]>): Record<string, string[]> => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [...v].sort()]));
    expect(sorted(actual)).toEqual(sorted(printed));
  });

  it("lists PA-01 to PA-17 in assumptions.yaml", () => {
    expect(data.assumptions?.map((a) => a.id)).toEqual(Array.from({ length: 17 }, (_, i) => `PA-${String(i + 1).padStart(2, "0")}`));
  });

  it("T-SCORE: full campaign setup scores 21 and 4 with Harm 0 and 0 (09 s2.2, 10 s2.2)", () => {
    const view = derive(ruleset, setupState(ruleset, "full-campaign", 1));
    expect(view.scores).toEqual({ state: 21, pkk: 4 });
    expect(view.harm).toEqual({ state: 0, pkk: 0 });
    expect(view.totals).toEqual({ totalSupport: 11, totalOpposition: 3, domesticPkkBases: 1 });
    expect(view.margins).toEqual({ state: -28, pkk: -26 });
  });

  it("T-SCORE: Control matches the 10 s2.2 table", () => {
    const view = derive(ruleset, setupState(ruleset, "full-campaign", 1));
    const state = Object.entries(view.control).filter(([, f]) => f === "state").map(([s]) => s).sort();
    expect(state).toEqual(
      ["hakkari", "mardin-batman", "diyarbakir-city", "diyarbakir-rural", "sanliurfa", "adiyaman", "elazig", "dersim", "bingol-mus", "van-bitlis", "agri", "western-cities"].sort(),
    );
    expect(Object.values(view.control).filter((f) => f === "pkk")).toEqual([]);
  });
});

// P2-02: scenarios. Accept: V-PIECES passes, totals reconcile with 10 s2.2.
describe("kurdish-coin scenarios", () => {
  // 10 s2.2 totals table: [on map, Available, Out of Play].
  const totals: Record<string, [number, number, number]> = {
    troops: [16, 14, 0],
    police: [16, 8, 0],
    guards: [0, 0, 16],
    stateBase: [4, 4, 0],
    guerrilla: [10, 20, 0],
    pkkBase: [3, 9, 0],
  };

  it.each(["full-campaign", "s0"])("%s: piece totals reconcile with 10 s2.2", (scenario) => {
    const state = setupState(ruleset, scenario, 1);
    const actual = Object.fromEntries(
      Object.entries(state.pools).map(([piece, pool]) => {
        const onMap = Object.values(state.spaces).reduce((sum, space) => sum + Object.values(space.pieces[piece] ?? {}).reduce((a, n) => a + n, 0), 0);
        return [piece, [onMap, pool.available, pool.outOfPlay]];
      }),
    );
    expect(actual).toEqual(totals);
  });

  it("s0 starts from the full campaign setup, as a one-round test scenario (10-mvp-scope s2.1)", () => {
    const full = setupState(ruleset, "full-campaign", 1);
    const s0 = setupState(ruleset, "s0", 1);
    expect(s0.spaces).toEqual(full.spaces);
    expect(s0.tracks).toEqual(full.tracks);
    const s0Data = data.scenarios["scenarios/s0.yaml"];
    expect(s0Data).toMatchObject({ testOnly: true, finalRound: 1, pileSize: 8, campaigns: ["C1"], pivotals: { state: [], pkk: [] } });
  });
});
