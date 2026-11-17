// Reviewed victory fixtures for the coverage ledger (19 s8 Victory row; rules 7.2, 7.3).
// Expected values are hand-computed from the rules text and the independent oracle.
import { describe, expect, it } from "vitest";
import { independentStandings } from "../src/cli/qualification.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, play, ruleset, setLevel, setMarkers, setTrack } from "./board.ts";

/** Full campaign start at a Propaganda phase of the given round. Round 5 is the final round. */
function at(phase: string, round: number, edit: (s: GameState) => GameState): GameState {
  const s = edit(engine.start(ruleset, "full-campaign", 1).state);
  return { ...s, turn: { ...s.turn, phase: "propaganda", propagandaRound: round, step: ruleset.sequence.propagandaPhases.indexOf(phase), campaign: round === 5 ? "C5" : "C2" }, deck: { ...s.deck, piles: [[], []], currentCard: "DK-035" } };
}
/** Every domestic space at `level`, except those listed. */
const all = (level: number, except: Readonly<Record<string, number>> = {}) => (s: GameState): GameState => ({ ...s, spaces: Object.fromEntries(Object.entries(s.spaces).map(([id, sp]) => [id, sp.level === null ? sp : { ...sp, level: except[id] ?? level }])) });

describe("opening check with both factions qualified (rules 7.2)", () => {
  it("the higher margin wins", () => {
    // Support: Western Cities 6 + Diyarbakir City 4 + Elazig 4 + Adiyaman 4 + Sanliurfa 8 + Agri-Igdir 6 = 32, + Legitimacy 20 = 52 (margin 3).
    // Opposition: Mardin, Batman hinterland and Batman City 8 + Van City, Van hinterland and Bitlis 8 + Muş and Bingöl-Tunceli 8 + Şırnak and Siirt 4 + Hakkari 2
    // + Diyarbakir hinterland 2 = 32, + 1 Base = 33 (margin 1).
    const s = at("victory", 2, (x) => setTrack(all(2, { "mardin": -2, "batman-rural": -2, "batman-city": -2, "van-rural": -2, "van-city": -2, bitlis: -2, "mus": -2, "bingol-tunceli": -2, sirnak: -2, siirt: -2, hakkari: -2, "diyarbakir-rural": -1 })(x), "legitimacy", 20));
    const { state, entries } = play(s, { type: "Advance" });
    expect(entries.find((e) => e.kind === "ScoreCheck")?.data["qualified"]).toEqual(["state", "pkk"]);
    expect(state.ended).toMatchObject({ winner: "state", reason: "victory check" });
    expect(independentStandings(ruleset, s).state.checkQualifies && independentStandings(ruleset, s).pkk.checkQualifies).toBe(true);
  });
});

describe("final scoring ties and negative margins (rules 7.3)", () => {
  const final = (edit: (s: GameState) => GameState): GameState => play(at("agitation", 5, edit), { type: "Advance" }).state;

  it("equal margins go to lower Harm", () => {
    // State: Support 0 + Legitimacy 19 = 19 (-30). PKK: Opposition Şırnak, Siirt and Hakkari 3, + 1 Base = 4 (-28); 4 PKK Harm: no penalty.
    // Make them equal: give the State Support 2 (Adıyaman Passive): 2 + 19 = 21 (-28).
    const s = final((x) => setMarkers(setTrack(setLevel(all(0, { sirnak: -1, siirt: -1, hakkari: -1 })(x), "adiyaman", 1), "legitimacy", 19), "bingol-tunceli", "pkkHarm", 4));
    expect(independentStandings(ruleset, s).state.finalMargin).toBe(-28);
    expect(independentStandings(ruleset, s).pkk.finalMargin).toBe(-28);
    expect(s.ended).toMatchObject({ winner: "state", reason: "final scoring" });
  });

  it("equal margins and equal Harm go to the PKK", () => {
    const s = final((x) => setTrack(setLevel(all(0, { sirnak: -1, siirt: -1, hakkari: -1 })(x), "adiyaman", 1), "legitimacy", 19));
    expect(independentStandings(ruleset, s).state.finalMargin).toBe(independentStandings(ruleset, s).pkk.finalMargin);
    expect(s.ended?.winner).toBe("pkk");
  });

  it("the higher of two negative margins wins", () => {
    // State: Legitimacy 10 = 10 (-39). PKK: 3 + 1 Base = 4 (-28).
    const s = final(all(0, { sirnak: -1, siirt: -1, hakkari: -1 }));
    expect(independentStandings(ruleset, s).pkk.finalMargin).toBe(-28);
    expect(s.ended).toMatchObject({ winner: "pkk", reason: "final scoring" });
  });

  it("excess Harm can turn a final win into a loss", () => {
    // As above, plus 10 PKK Harm: margin -28 - 2 x 4 = -36, still above the State's -39; with 14 Harm: -28 - 16 = -44 < -39.
    expect(final((x) => setMarkers(all(0, { sirnak: -1, siirt: -1, hakkari: -1 })(x), "bingol-tunceli", "pkkHarm", 10)).ended?.winner).toBe("pkk");
    const lost = final((x) => setMarkers(all(0, { sirnak: -1, siirt: -1, hakkari: -1 })(x), "bingol-tunceli", "pkkHarm", 14));
    expect(independentStandings(ruleset, lost).pkk.finalMargin).toBe(-44);
    expect(lost.ended?.winner).toBe("state");
  });
});
