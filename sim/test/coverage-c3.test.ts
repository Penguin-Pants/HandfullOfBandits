// Coverage ledger entries for C3 to C5 (26-bot-reference Part 4). Each probe must fire on a real
// engine transition of its mechanic and stay silent on a Pass.
import { describe, expect, it } from "vitest";
import { MECHANICS } from "../src/cli/experiment-coverage.ts";
import { PHASE } from "../src/engine/coin/phases.ts";
import type { AnyCommand, GameState } from "../src/engine/core/types.ts";
import { engine, inCampaign, op, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf, withCard } from "./board.ts";

const c3 = (s: GameState): GameState => inCampaign(ruleset, s, "C3");
const propaganda = (s: GameState, phase: string, round = 2): GameState =>
  ({ ...s, deck: { ...s.deck, currentCard: "DK-055" }, turn: { ...s.turn, phase: PHASE.propaganda, propagandaRound: round, step: ruleset.sequence.propagandaPhases.indexOf(phase) } });
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const legal = (choice: Record<string, unknown>): AnyCommand => ({ type: "PropagandaChoice", phase: "legalPolitics", choice });
const advance: AnyCommand = { type: "Advance" };
const open = (s: GameState): GameState => setTrack(s, "legalSpace", "open");
const offices = (s: GameState, ...ids: string[]): GameState => ids.reduce((b, id) => setMarkers(b, id, "office", 1), s);
const law = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, law3175: true } });

/** Botan with State Control (6 Troops, 1 Police against 2 Guerrillas and a Base), at OHAL in C3. */
const clearance = setTrack(setPieces(c3(turnOf("state")), "botan", "troops", 6), "emergencyRule", "ohal");
const sweepWith = (action: string, space: string, perLocation: Record<string, unknown> = {}): AnyCommand =>
  op("state", "opSa", { op: "state.sweep", locations: ["botan"], sa: { action, locations: [space], perLocation, timing: "before" } });
const pivotalWindow = (campaign: string, hands: Record<string, string[]>, prepare: (s: GameState) => GameState): GameState => {
  const base = inCampaign(ruleset, turnOf("state"), campaign);
  return play(prepare({ ...base, hands: { state: [], pkk: [], ...hands }, deck: { ...base.deck, currentCard: null, piles: [["DK-001", "DK-014"]] }, turn: { ...base.turn, phase: "setup" } }), advance).state;
};
const opposed = (s: GameState): GameState => ["botan", "hakkari", "mardin-batman", "diyarbakir-rural", "sanliurfa", "van-bitlis"].reduce((b, id) => setLevel(b, id, -2), s);
const cf = (s: GameState, step: string): GameState => setTrack(open(c3(s)), "ceasefire", step);

const CASES: readonly (readonly [string, GameState, AnyCommand])[] = [
  ["A-state.village-clearance", clearance, sweepWith("state.village-clearance", "botan", { botan: { reception: "diyarbakir-city" } })],
  ["A-state.covert-action", c3(turnOf("state")), sweepWith("state.covert-action", "mardin-batman")],
  ["C-covert-reveal", setMarkers(propaganda(c3(turnOf("state")), "agitation", 5), "dersim", "covert", 1), advance],
  ["P-ceasefire-declared", c3(turnOf("pkk")), { type: "DeclareCeasefire", faction: "pkk" }],
  ["P-ceasefire-restraint", propaganda(cf(turnOf("state"), "declared"), "legalPolitics"), legal({ ceasefire: { accept: true } })],
  ["P-ceasefire-breach", setPieces(setPieces(cf(turnOf("state"), "reciprocalRestraint"), "botan", "guerrilla", 0), "botan", "guerrilla", 2, "active"), op("state", "limitedOp", { op: "state.assault", locations: ["botan"] })],
  ["P-ceasefire-left", propaganda(cf(turnOf("state"), "reciprocalRestraint"), "legalPolitics"), legal({ ceasefire: { leave: { pkk: true } } })],
  ["L-legal-open", ((s: GameState): GameState => ({ ...s, deck: { ...s.deck, currentCard: null, piles: [["DK-037", "DK-055"]] }, turn: { ...s.turn, phase: "setup" } }))(c3(turnOf("state"))), advance],
  ["L-office-placed", propaganda(open(c3(turnOf("state"))), "legalPolitics"), advance],
  ["L-state-filing", propaganda(offices(open(c3(turnOf("state"))), "diyarbakir-city"), "legalPolitics"), legal({ closureFiling: true })],
  ["L-prosecutor-filing", propaganda(offices(open(c3(turnOf("state"))), "diyarbakir-city", "western-cities", "mardin-batman"), "legalPolitics"), advance],
  ["L-ban", propaganda({ ...offices(open(c3(turnOf("state"))), "diyarbakir-city"), flags: { ...c3(turnOf("state")).flags, closureCase: true } }, "legalPolitics"), advance],
  ["L-successor", propaganda(setTrack(setTrack(c3(turnOf("state")), "legalSpace", "banned"), "successor", 2), "legalPolitics"), advance],
  ["S-emergency-extended", propaganda(setTrack(c3(turnOf("state")), "emergencyRule", "ohal"), "legitimacy"), { type: "PropagandaChoice", phase: "legitimacy", choice: { emergencyStep: "ohalExtendedPowers" } }],
  ["S-serhildan-play", pivotalWindow("C3", { pkk: ["DK-054"] }, (s) => setLevel(opposed(s), "botan", -1)), { type: "PlayPivotal", faction: "pkk", card: "DK-054", answers: [["botan"]] }],
  ["S-coercive-diplomacy-play", pivotalWindow("C5", { state: ["DK-098"] }, (s) => setTrack(s, "posture.syria", "tolerant")), { type: "PlayPivotal", faction: "state", card: "DK-098", answers: [] }],
  ["H-europe-ban", setTrack(inCampaign(ruleset, withCard(turnOf("state"), "DK-064"), "C4"), "europe", 5), event("state", "unshaded")],
  ["C-strike-after", setPieces(setPieces(law(turnOf("pkk")), "diyarbakir-rural", "guards", 1), "diyarbakir-rural", "guerrilla", 0),
    op("pkk", "opSa", { op: "pkk.rally", locations: ["diyarbakir-rural"], perLocation: { "diyarbakir-rural": { option: "place" } }, sa: { action: "pkk.strike-collaborators", locations: ["diyarbakir-rural"], perLocation: { "diyarbakir-rural": { guards: 1 } }, timing: "after" } })],
];

describe("coverage ledger: C3 to C5 mechanics", () => {
  it.each(CASES)("%s is in the ledger and its probe fires on the mechanic", (id, before, command) => {
    const mechanic = MECHANICS.find((m) => m.id === id);
    expect(mechanic?.id).toBe(id);
    const result = engine.apply(ruleset, before, command);
    expect(result.ok ? [] : result.validation.violations.map((v) => v.code)).toEqual([]);
    if (!result.ok) return;
    expect(mechanic?.probe({ entries: result.transition.logEntries, command, before })).toBe(true);
    expect(mechanic?.notApplicable).toBeNull();
    expect(mechanic?.fixtures.length).toBeGreaterThan(0);
  });

  it.each(CASES.map(([id]) => id))("%s stays silent on a Pass", (id) => {
    const before = turnOf("pkk");
    const command = { type: "Pass", faction: "pkk" };
    const result = engine.apply(ruleset, before, command);
    expect(result.ok && MECHANICS.find((m) => m.id === id)?.probe({ entries: result.transition.logEntries, command, before })).toBe(false);
  });

  it("a State action during Declared places the marker only: it is not a breach (PR 106 review)", () => {
    const before = setPieces(setPieces(cf(turnOf("state"), "declared"), "botan", "guerrilla", 0), "botan", "guerrilla", 2, "active");
    const command = op("state", "limitedOp", { op: "state.assault", locations: ["botan"] });
    const result = engine.apply(ruleset, before, command);
    expect(result.ok && result.transition.state.tracks["ceasefire"]).toBe("declared");
    const seen = { entries: result.ok ? result.transition.logEntries : [], command, before };
    expect(MECHANICS.find((m) => m.id === "P-ceasefire-breach")?.probe(seen)).toBe(false);
    expect(MECHANICS.find((m) => m.id === "P-ceasefire-state-marker")?.probe(seen)).toBe(true);
  });

  it("the ARGK probes name ARGK only, now that the bots play every Pivotal", () => {
    const window = pivotalWindow("C3", { pkk: ["DK-054"] }, (s) => setLevel(opposed(s), "botan", -1));
    const command = { type: "PlayPivotal", faction: "pkk", card: "DK-054", answers: [["botan"]] };
    const result = engine.apply(ruleset, window, command);
    expect(result.ok && MECHANICS.find((m) => m.id === "S-argk-play")?.probe({ entries: result.transition.logEntries, command, before: window })).toBe(false);
  });
});
