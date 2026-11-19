// Audit Plan 1, D-03 and milestone M3: one negative test for each engine violation code that had no
// test asserting it (46 of 160 codes on main 6ade819). Each case fails if its check line is deleted.
// The last block scans src/engine and requires every code to appear in some test file.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { AnyCommand, GameState, JsonValue, Ruleset } from "../src/engine/core/types.ts";
import { codes, engine, inCampaign, op, play, ruleset, setLevel, setPieces, setTrack, turnOf, withCard } from "./board.ts";

const state0 = turnOf("state");
const pkk0 = turnOf("pkk");
const withLaw = (s: GameState): GameState => ({ ...s, flags: { ...s.flags, law3175: true }, pools: { ...s.pools, guards: { available: 16, outOfPlay: 0 } } });
const codesIn = (r: Ruleset, s: GameState, command: AnyCommand): string[] => engine.validate(r, s, command).violations.map((v) => v.code);
const propaganda = (s: GameState, phase: string): GameState => ({ ...s, turn: { ...s.turn, phase: "propaganda", step: ruleset.sequence.propagandaPhases.indexOf(phase), propagandaRound: 1 } });
const choice = (phase: string, c: JsonValue): AnyCommand => ({ type: "PropagandaChoice", phase, choice: c });

const train = (loc: string, perLocation: Record<string, unknown>, extra: Record<string, unknown> = {}): AnyCommand => op("state", "limitedOp", { op: "state.train", locations: [loc], perLocation: { [loc]: perLocation }, ...extra });
const trainCivic = (loc: string, params: Record<string, unknown>): AnyCommand => train(loc, { option: "place", troops: 1, police: 0 }, { subActions: [{ action: "civicAction", space: loc, params }] });
const rally = (loc: string, perLocation: Record<string, unknown>, extra: Record<string, unknown> = {}): AnyCommand => op("pkk", "limitedOp", { op: "pkk.rally", locations: [loc], perLocation: { [loc]: perLocation }, ...extra });
const rallyAgitate = (loc: string, space: string, params: Record<string, unknown>): AnyCommand => rally(loc, { option: "place" }, { subActions: [{ action: "agitate", space, params }] });
const withSa = (faction: string, opPlan: Record<string, unknown>, sa: Record<string, unknown>): AnyCommand => op(faction, "opSa", { ...opPlan, sa });

describe("political spending (07 s1.3; 05 s6.6)", () => {
  it("Civic Action: needs Police, room to shift, the markers it removes, at most 2 shifts and a well-formed spend", () => {
    expect(codes(setPieces(state0, "mardin", "police", 0), trainCivic("mardin", { shifts: 1 }))).toContain("civicNeedsPolice");
    expect(codes(state0, trainCivic("elazig", { shifts: 2 }))).toContain("civicNoRoom");
    expect(codes(state0, trainCivic("mardin", { stateHarm: 1 }))).toContain("civicNoMarker");
    expect(codes(state0, trainCivic("mardin", { shifts: 3 }))).toContain("civicTooManyShifts");
    expect(codes(state0, trainCivic("mardin", { shifts: "two" }))).toContain("civicBadSpend");
    expect(codes(propaganda(state0, "civicAction"), choice("civicAction", { spaces: { mardin: { shifts: -1 } } }))).toContain("civicBadSpend");
  });

  it("Civic Action in a Train must be in a Train space", () => {
    const command = train("mardin", { option: "place", troops: 1, police: 0 }, { subActions: [{ action: "civicAction", space: "elazig", params: { shifts: 1 } }] });
    expect(codes(state0, command)).toContain("civicNotSelected");
  });

  it("Agitation: needs the markers it removes, room to shift, at most 2 shifts and a well-formed spend", () => {
    expect(codes(pkk0, rallyAgitate("sirnak", "sirnak", { coercion: 1 }))).toContain("agitateNoMarker");
    expect(codes(setLevel(pkk0, "sirnak", -2), rallyAgitate("sirnak", "sirnak", { shifts: 1 }))).toContain("agitateNoRoom");
    expect(codes(pkk0, rallyAgitate("sirnak", "sirnak", { shifts: 3 }))).toContain("agitateTooManyShifts");
    expect(codes(pkk0, rallyAgitate("sirnak", "sirnak", { shifts: "one" }))).toContain("agitateBadSpend");
    expect(codes(propaganda(pkk0, "agitation"), choice("agitation", { spaces: { sirnak: { shifts: -1 } } }))).toContain("agitateBadSpend");
  });

  it("Agitate in a Rally must be in a Rally space", () => {
    expect(codes(pkk0, rallyAgitate("sirnak", "batman-rural", { shifts: 1 }))).toContain("agitateNotSelected");
  });
});

describe("placement and supply (06 s2, s4)", () => {
  it("Train: an option is required; Base needs room and a controlled Mountain or Plain space; Guards 1 to 2", () => {
    expect(codes(state0, train("mardin", { option: "dig" }))).toContain("trainOption");
    const twoBases = setPieces(setPieces(state0, "van-rural", "stateBase", 2), "van-rural", "police", 2);
    expect(codes(twoBases, train("van-rural", { option: "base" }))).toContain("trainBaseLimit");
    expect(codes(state0, train("diyarbakir-city", { option: "base" }))).toContain("trainBaseWhere");
    expect(codes(withLaw(state0), train("bingol-tunceli", { option: "guards", count: 3 }))).toContain("trainGuardsCount");
  });

  it("Train allows one Civic Action and no other sub-action", () => {
    const command = train("mardin", { option: "place", troops: 1, police: 0 }, { subActions: [{ action: "agitate", space: "mardin", params: { shifts: 1 } }] });
    expect(codes(state0, command)).toContain("trainSubAction");
  });

  it("Rally: an option is required; a Base replaces 2 Guerrillas; supply must be Available", () => {
    expect(codes(pkk0, rally("sirnak", { option: "dig" }))).toContain("rallyOption");
    expect(codes(pkk0, rally("siirt", { option: "base" }))).toContain("rallyBaseGuerrillas");
    const noGuerrillas = { ...pkk0, pools: { ...pkk0.pools, guerrilla: { available: 0, outOfPlay: 0 } } };
    expect(codes(noGuerrillas, rally("sirnak", { option: "place" }))).toContain("rallySupply");
  });

  it("Cross-Border: the origin must hold the Troops it lifts", () => {
    const command = withSa("state", { op: "state.sweep", locations: ["kdp-zone"] }, { action: "state.cross-border", timing: "before", locations: ["kdp-zone"], perLocation: { "kdp-zone": { moves: [{ from: "hakkari", count: 3 }] } } });
    expect(codes(state0, command)).toContain("crossBorderSupply");
  });

  it("Upkeep: cannot remove more Guards than a space holds", () => {
    expect(codes(propaganda(setPieces(state0, "mus", "guards", 1), "upkeep"), choice("upkeep", { removeGuards: { mus: 2 } }))).toContain("upkeepGuards");
  });
});

describe("Operation and Special Activity limits (06 s2, s3, s5)", () => {
  it("Garrison: one activation space with Police, at most 6 Police moved", () => {
    const empty = setPieces(state0, "diyarbakir-rural", "police", 0);
    expect(codes(empty, op("state", "opOnly", { op: "state.garrison", locations: ["diyarbakir-rural"], perLocation: { "diyarbakir-rural": { moves: [] } } }))).toContain("garrisonNeedsPolice");
    expect(codes(state0, op("state", "opOnly", { op: "state.garrison", locations: ["mardin", "mus"], perLocation: {} }))).toContain("garrisonOneSpace");
    const many = setPieces(state0, "diyarbakir-city", "police", 7);
    expect(codes(many, op("state", "opOnly", { op: "state.garrison", locations: ["mardin"], perLocation: { mardin: { moves: [{ from: "diyarbakir-city", to: "mardin", count: 7 }] } } }))).toContain("garrisonMax");
  });

  it("Sweep: an origin cannot send more Troops than it holds", () => {
    expect(codes(state0, op("state", "limitedOp", { op: "state.sweep", locations: ["sirnak"], perLocation: { sirnak: { moves: [{ from: "hakkari", count: 3 }] } } }))).toContain("sweepTroops");
  });

  it("Assault: domestic spaces only, and Troops are required outside a City", () => {
    expect(codes(state0, op("state", "limitedOp", { op: "state.assault", locations: ["kdp-zone"], perLocation: {} }))).toContain("assaultWhere");
    const noTroops = setPieces(setPieces(state0, "siirt", "guerrilla", 0), "siirt", "guerrilla", 1, "active");
    expect(codes(noTroops, op("state", "limitedOp", { op: "state.assault", locations: ["siirt"], perLocation: {} }))).toContain("assaultTroops");
  });

  it("Air Mobility: every origin is one of its spaces", () => {
    const command = withSa("state", { op: "state.sweep", locations: ["sirnak"], perLocation: { sirnak: { moves: [] } } }, { action: "state.air-mobility", timing: "before", locations: ["sirnak"], perLocation: { sirnak: { moves: [{ from: "diyarbakir-city", count: 1 }] } } });
    expect(codes(state0, command)).toContain("airMobilityOrigin");
  });

  it("Diplomacy: one host box or Europe", () => {
    const command = withSa("state", { op: "state.train", locations: ["diyarbakir-city"], perLocation: { "diyarbakir-city": { option: "place", troops: 0, police: 1 } } }, { action: "state.diplomacy", timing: "after", locations: ["mardin"] });
    expect(codes(state0, command)).toContain("diplomacyTarget");
  });

  it("Strike Collaborators: at most 2 spaces, each with an Underground Guerrilla and Guards, and no more Guards than are there", () => {
    let s = withLaw(pkk0);
    for (const loc of ["hakkari", "sirnak", "van-rural"]) s = setPieces(s, loc, "guards", 1);
    const strike = (locations: string[], perLocation: Record<string, unknown> = {}): AnyCommand =>
      withSa("pkk", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "place" } } }, { action: "pkk.strike-collaborators", timing: "before", locations, perLocation });
    expect(codes(s, strike(["hakkari", "sirnak", "van-rural"]))).toContain("strikeSpaces");
    expect(codes(s, strike(["mardin"]))).toContain("strikeWhere");
    expect(codes(s, strike(["sirnak"], { sirnak: { guards: 2 } }))).toContain("strikeGuards");
  });

  it("Extort: needs an Underground Guerrilla, and Pop at least extort.minPop", () => {
    const extort = (loc: string): AnyCommand => withSa("pkk", { op: "pkk.rally", locations: ["sirnak"], perLocation: { sirnak: { option: "place" } } }, { action: "pkk.extort", timing: "after", locations: [loc] });
    expect(codes(pkk0, extort("mardin"))).not.toContain("extortGuerrilla");
    expect(codes(setPieces(setPieces(pkk0, "batman-rural", "guerrilla", 0), "batman-rural", "guerrilla", 1, "active"), extort("batman-rural"))).toContain("extortGuerrilla");
    // Every domestic space has Pop 1 or more, so the check is reached with a stricter parameter.
    const strict: Ruleset = { ...ruleset, parameters: { ...ruleset.parameters, "extort.minPop": 2 } };
    expect(codesIn(strict, pkk0, extort("batman-rural"))).toContain("extortPop");
    expect(codesIn(ruleset, pkk0, extort("batman-rural"))).not.toContain("extortPop");
  });
});

describe("eligibility and timing (05 s2, s6; 07 s7)", () => {
  it("PropagandaChoice names the open phase and needs an open Propaganda phase", () => {
    expect(codes(propaganda(state0, "upkeep"), choice("agitation", {}))).toContain("wrongPhase");
    const first = ruleset.sequence.propagandaPhases[0] ?? "";
    expect(codes(state0, choice(first, {}))).toContain("notPropaganda");
  });

  it("Declare Ceasefire uses the Limited Op box", () => {
    // The State took the Event box first, so the PKK may respond with Pass or Op + SA only (05 s2.3).
    const c3 = inCampaign(ruleset, state0, "C3");
    const afterEvent = { ...c3, initiative: { ...c3.initiative, boxes: { state: "event" }, actedThisCard: ["state"] } };
    expect(codes(afterEvent, { type: "DeclareCeasefire", faction: "pkk" })).toEqual(["ceasefireBox"]);
    expect(codes(inCampaign(ruleset, pkk0, "C3"), { type: "DeclareCeasefire", faction: "pkk" })).toEqual([]);
  });

  it("a PKK action forbidden during a ceasefire carries the breach warning", () => {
    const declared = setTrack(inCampaign(ruleset, pkk0, "C3"), "ceasefire", "declared");
    const attack = op("pkk", "limitedOp", { op: "pkk.attack", locations: ["sirnak"], perLocation: {} });
    const result = engine.validate(ruleset, declared, attack);
    expect(result.warnings.map((w) => w.code)).toContain("ceasefireBreach");
    expect(engine.validate(ruleset, pkk0, attack).warnings.map((w) => w.code)).not.toContain("ceasefireBreach");
  });

  it("Pivotal: a precondition that fails refuses the play; the window takes only decline as an answer", () => {
    // ARGK (DK-015) opens the PKK window; Serhildan (DK-054) needs Total Opposition 14, which the start board lacks.
    const base = inCampaign(ruleset, setPieces(setPieces(turnOf("state"), "hakkari", "pkkBase", 1), "hakkari", "guerrilla", 5), "C3");
    const ready = { ...base, hands: { ...base.hands, pkk: ["DK-015", "DK-054"] }, deck: { ...base.deck, currentCard: null, piles: [["DK-001"]] }, turn: { ...base.turn, phase: "setup" } };
    const revealed = play(ready, { type: "Advance" }).state;
    expect(codes(revealed, { type: "PlayPivotal", faction: "pkk", card: "DK-054", answers: [] })).toContain("pivotalPrecondition");
    expect(codes(revealed, { type: "ResolveDecision", decisionId: revealed.pending?.id ?? "none", answer: "accept" })).toContain("pivotalAnswer");
  });
});

describe("input shape (05 s3.1)", () => {
  it("rejects a plan that is not an object, an unknown Special Activity, an empty location list and an unknown side", () => {
    expect(codes(state0, { type: "ChooseOperation", faction: "state", box: "limitedOp", plan: "train" })).toContain("badPlan");
    expect(codes(state0, withSa("state", { op: "state.sweep", locations: ["sirnak"] }, { action: "pkk.extort", timing: "before", locations: ["sirnak"] }))).toContain("unknownSa");
    expect(codes(state0, op("state", "limitedOp", { op: "state.sweep", locations: [] }))).toContain("noLocation");
    expect(codes(withCard(state0, "DK-001"), { type: "ChooseEvent", faction: "state", side: "middle", answers: [] })).toContain("badSide");
  });

  it("rejects malformed moves and choices", () => {
    expect(codes(pkk0, op("pkk", "limitedOp", { op: "pkk.march", locations: ["mardin"], perLocation: { mardin: { moves: "all" } } }))).toContain("badMoves");
    expect(codes(propaganda(state0, "upkeep"), choice("upkeep", { removeGuards: "all" }))).toContain("badChoice");
    expect(codes(propaganda(state0, "upkeep"), { type: "PropagandaChoice", phase: "upkeep", choice: "none" })).toContain("badChoice");
  });
});

// ------------------------------------------------------------------------ coverage gate (M3)

const ENGINE = join(process.cwd(), "src", "engine");
const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? files(join(dir, d.name)) : d.name.endsWith(".ts") ? [join(dir, d.name)] : []));
const CODE = String.raw`"([a-z][a-zA-Z0-9]+)"`;
// The forms that create a Violation: v("code", msg), fail(...), violation(...), at(location, "code", msg) and { code: "code" }.
const FORMS = [
  new RegExp(String.raw`\b(?:v|fail|violation|at)\(\s*(?:[^,()"]*(?:\([^()]*\))?[^,()"]*,\s*)?` + CODE + String.raw`\s*,\s*[\x60"]`, "gs"),
  new RegExp(String.raw`\bcode:\s*` + CODE, "g"),
];

/** Every violation code in src/engine, with the constant `NO_EFFECT` resolved. */
function engineCodes(): Set<string> {
  const out = new Set<string>();
  for (const f of files(ENGINE).filter((f) => !f.endsWith(".test.ts"))) {
    const text = readFileSync(f, "utf8");
    for (const re of FORMS) for (const m of text.matchAll(re)) if (m[1] !== undefined) out.add(m[1]);
    for (const m of text.matchAll(/export const NO_EFFECT = "([a-zA-Z]+)"/g)) if (m[1] !== undefined) out.add(m[1]);
  }
  return out;
}

describe("M3: every engine violation code has an asserting test", () => {
  it("finds each code as a quoted string in a test file", () => {
    // This block holds no code literal, so this file counts like any other test file.
    const tests = [...files(join(process.cwd(), "src")), ...files(join(process.cwd(), "test"))].filter((f) => /\.test\.tsx?$/.test(f));
    const corpus = tests.map((f) => readFileSync(f, "utf8")).join("\n");
    const all = engineCodes();
    expect(all.size).toBeGreaterThan(150);
    expect([...all].filter((c) => !new RegExp(`["'\x60]${c}["'\x60]`).test(corpus)).sort()).toEqual([]);
  });
});
