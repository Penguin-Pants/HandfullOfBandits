import { describe, expect, it } from "vitest";
import { validateCommand } from "../src/cli/validate.ts";
import { derive } from "../src/engine/coin/derive.ts";
import { startState } from "../src/engine/coin/setup.ts";
import { setupState } from "../src/engine/core/state.ts";
import { kurdish as result, kurdishDir as dir } from "./kurdish-package.ts";
import { SHORT, short } from "./short-game.ts";

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
  it("passes sim validate; no scenario is blocked: C1 to C5 each fill a pile of 12 (V-CARDS, P3b-07j)", () => {
    expect(validateCommand(dir).exitCode).toBe(0);
    expect(result.issues).toEqual([]);
    expect(Object.entries(ruleset.scenarios).filter(([, s]) => s.blockedBy.length > 0).map(([id]) => id)).toEqual([]);
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

  it("lists PA-01 to PA-18 in assumptions.yaml, without PA-11 (deleted with decision 1)", () => {
    expect(data.assumptions?.map((a) => a.id)).toEqual(Array.from({ length: 18 }, (_, i) => `PA-${String(i + 1).padStart(2, "0")}`).filter((id) => id !== "PA-11"));
  });

  it("T-SCORE: full campaign setup scores 21 and 4 with Harm 0 and 0 (09 s2.2, 10 s2.2)", () => {
    const view = derive(ruleset, setupState(ruleset, "full-campaign", 1));
    expect(view.scores).toEqual({ state: 21, pkk: 4 });
    expect(view.harm).toEqual({ state: 0, pkk: 0 });
    expect(view.totals).toEqual({ totalSupport: 11, totalOpposition: 3, domesticPkkBases: 1, domesticGuerrillas: 5 });
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

// P2-05: cards. Accept: V-ENCODE passes for the first C1 cards; DK-003 unshaded needs no module procedure.
describe("kurdish-coin cards", () => {
  const firstCards = ["DK-001", "DK-002", "DK-003", "DK-005", "DK-008", "DK-012", "DK-014", "DK-100", "DK-016"];

  it("encodes the first 8 C1 cards and the C1 Propaganda card, with their CSV text", () => {
    for (const id of firstCards) expect(ruleset.cards[id]?.encoded, id).toBe(true);
    expect(ruleset.cards["DK-001"]?.unshaded?.text).toBe("Martial law reinforcement: place 2 Troops from Available in Hakkari or Botan. State Resources +2.");
    expect(Object.values(ruleset.cards).filter((c) => c.campaign === "C1" && c.type !== "pivotal")).toHaveLength(16);
  });

  it("encodes DK-003 unshaded with forEachSpace and an up-to count, not a module procedure", () => {
    expect(ruleset.cards["DK-003"]?.unshaded?.effects).toEqual([
      expect.objectContaining({ type: "forEachSpace", min: 0, max: 2, effects: [expect.objectContaining({ type: "placePieces", piece: "guards", count: { min: 0, max: 2 }, space: "selected" })] }),
    ]);
    expect(ruleset.cards["DK-003"]?.always.map((e) => e.type)).toEqual(["transferPool", "setFlag"]);
  });

  it("deals a pile of 8 C1 cards in a seeded order with DK-016 last when the scenario sets pileSize and propagandaLast", () => {
    const piles = startState(short.ruleset, SHORT, 3).deck.piles;
    expect(piles).toHaveLength(1);
    expect(piles[0]).toHaveLength(9);
    expect((piles[0] ?? []).every((id) => short.ruleset.cards[id]?.campaign === "C1")).toBe(true);
    expect(piles[0]?.at(-1)).toBe("DK-016");
    expect(startState(short.ruleset, SHORT, 4).deck.piles).not.toEqual(piles);
  });

  it("refuses to start a blocked scenario (DEC-51)", () => {
    const full = ruleset.scenarios["full-campaign"];
    if (full === undefined) throw new Error("full-campaign missing");
    const blocked = { ...ruleset, scenarios: { ...ruleset.scenarios, "full-campaign": { ...full, blockedBy: ["V-CARDS test"] } } };
    expect(() => startState(blocked, "full-campaign", 1)).toThrow(/cannot start/);
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

  it.each(["full-campaign"])("%s: piece totals reconcile with 10 s2.2", (scenario) => {
    const state = setupState(ruleset, scenario, 1);
    const actual = Object.fromEntries(
      Object.entries(state.pools).map(([piece, pool]) => {
        const onMap = Object.values(state.spaces).reduce((sum, space) => sum + Object.values(space.pieces[piece] ?? {}).reduce((a, n) => a + n, 0), 0);
        return [piece, [onMap, pool.available, pool.outOfPlay]];
      }),
    );
    expect(actual).toEqual(totals);
  });
});
