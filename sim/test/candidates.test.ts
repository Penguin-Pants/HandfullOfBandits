// Phase 4 (20): every Scenario A decision family can be expressed; every emitted candidate is
// legal; automatic advance, optional skips and Pass stay distinct; bounded generation is compared
// with a broader generator.
import { describe, expect, it, vi } from "vitest";
import { decisionPoint, generateCandidates, type CandidateSet, type DecisionKind } from "../src/cli/candidates.ts";
import { independentStandings } from "../src/cli/qualification.ts";
import { evaluate } from "../src/cli/strategies/evaluation.ts";
import { CURRENT } from "../src/cli/strategies/scenario-a.ts";
import type { AnyCommand, GameState } from "../src/engine/core/types.ts";
import { engine, inCampaign, op, play, ruleset, setLevel, setMarkers, setPieces, setTrack, turnOf, withCard, withRoll } from "./board.ts";

// Real games and workers: slow under full-suite load.
vi.setConfig({ testTimeout: 120000 });

const gen = (s: GameState, kind: DecisionKind, faction: string, broad = false): CandidateSet => generateCandidates(engine, ruleset, s, kind, faction, { familyCap: 14, broad });
const families = (set: CandidateSet): string[] => Object.entries(set.families).filter(([, v]) => v.retained > 0).map(([k]) => k);
const allLegal = (s: GameState, set: CandidateSet): void => {
  for (const c of set.candidates) expect(engine.validate(ruleset, s, c.command).ok, c.id).toBe(true);
};
const rich = (s: GameState): GameState => setTrack(setTrack({ ...s, flags: { ...s.flags, law3175: true }, pools: { ...s.pools, guards: { available: 16, outOfPlay: 0 } } }, "resources.state", 30), "resources.pkk", 20);
const propaganda = (s: GameState, phase: string, round = 1): GameState => ({ ...s, turn: { ...s.turn, phase: "propaganda", step: ruleset.sequence.propagandaPhases.indexOf(phase), propagandaRound: round } });

describe("card decisions (19 s5 Initiative, Operations, Special Activities)", () => {
  it("covers every State Operation, every State Special Activity and Pass for the First Eligible", () => {
    const s = withCard(setPieces(setPieces(rich(turnOf("state")), "botan", "guerrilla", 2, "active"), "dersim", "guards", 1), "DK-014");
    const set = gen(s, "card", "state");
    allLegal(s, set);
    const f = families(set);
    for (const op of ["state.train", "state.garrison", "state.sweep", "state.assault"]) expect(f).toContain(`op:${op}@limitedOp`);
    // Decision 5 (M-07): the First Eligible's Op Only has two or more locations.
    const opOnly = set.candidates.filter((c) => c.command["box"] === "opOnly").map((c) => (c.command["plan"] as { locations: string[] }).locations.length);
    expect([opOnly.length > 0, Math.min(...opOnly) >= 2]).toEqual([true, true]);
    for (const sa of ["state.air-mobility", "state.diplomacy"]) expect(f).toContain(`op:state.train+${sa}@opSa`);
    expect(f).toContain("op:state.sweep+state.cross-border@opSa");
    expect(f).toContain("pass");
    expect(f.filter((x) => x.startsWith("event:"))).toHaveLength(2);
    // Guards, Base and Civic Action variants of Train.
    const train = set.candidates.filter((c) => c.family.startsWith("op:state.train")).map((c) => JSON.stringify(c.command));
    for (const needle of ["\"option\":\"guards\"", "\"option\":\"base\"", "\"civicAction\""]) expect(train.some((t) => t.includes(needle)), needle).toBe(true);
    for (const v of ["state.sweep/multi", "state.train/multi", "state.train/multi+civicAction"]) expect(f).toContain(`op:${v}@opOnly`);
    for (const v of ["civicAction", "guards", "base"]) expect(f).toContain(`op:state.train/${v}@limitedOp`);
  });

  it("covers every PKK Operation and Special Activity, Rally options and Agitate", () => {
    const s = setPieces(setPieces(rich(turnOf("pkk")), "hakkari", "guards", 2), "botan", "guerrilla", 3);
    const set = gen(s, "card", "pkk");
    allLegal(s, set);
    const f = families(set);
    for (const op of ["pkk.rally", "pkk.march", "pkk.attack", "pkk.coerce"]) expect(f).toContain(`op:${op}@limitedOp`);
    for (const v of ["pkk.rally/multi", "pkk.rally/multi+agitate", "pkk.march/multi", "pkk.attack/multi"]) expect(f).toContain(`op:${v}@opOnly`);
    for (const v of ["pkk.rally/grow+agitate", "pkk.rally/europe", "pkk.rally/base"]) expect(f).toContain(`op:${v}@limitedOp`);
    expect(set.candidates.filter((c) => c.command["box"] === "opOnly").every((c) => (c.command["plan"] as { locations: string[] }).locations.length >= 2)).toBe(true);
    for (const pair of ["pkk.attack+pkk.ambush", "pkk.rally+pkk.extort", "pkk.march+pkk.host-pressure", "pkk.rally+pkk.strike-collaborators", "pkk.coerce+pkk.extort"]) expect(f).toContain(`op:${pair}@opSa`);
    const rally = set.candidates.filter((c) => c.family.startsWith("op:pkk.rally")).map((c) => JSON.stringify(c.command));
    for (const needle of ["\"grow\"", "\"base\"", "\"place\"", "\"agitate\"", "\"europe\""]) expect(rally.some((t) => t.includes(needle)), needle).toBe(true);
  });

  it("offers the Second Eligible only the boxes the matrix allows, including Op + SA without an SA", () => {
    const first = play(withCard(turnOf("pkk"), "DK-014"), { type: "Pass", faction: "pkk" }).state;
    expect(decisionPoint(engine, ruleset, first)).toEqual({ kind: "card", faction: "state" });
    const afterEvent = { ...first, initiative: { ...first.initiative, boxes: { ...first.initiative.boxes, pkk: "event" } } };
    const set = gen(afterEvent, "card", "state");
    allLegal(afterEvent, set);
    expect(new Set(set.candidates.map((c) => (c.command["box"] as string | undefined) ?? c.command.type))).toEqual(new Set(["opSa", "Pass"]));
    expect(families(set)).toContain("op:state.train@opSa");
    expect(families(set)).toContain("op:state.train/multi@opSa");
  });

  it("expands Event choices, space picks and free-action plans, both sides", () => {
    const choice = gen(withCard(turnOf("state"), "DK-001"), "card", "state");
    expect(choice.candidates.filter((c) => c.family === "event:unshaded").map((c) => c.command["answers"])).toEqual([["Hakkari"], ["Botan"]]);
    expect(choice.candidates.filter((c) => c.family === "event:shaded")).toHaveLength(1);
    const plan = gen(withCard(turnOf("state"), "DK-002"), "card", "state");
    const answers = plan.candidates.filter((c) => c.family === "event:unshaded").map((c) => JSON.stringify(c.command["answers"]));
    expect(answers).toContain("[null]");
    expect(answers.length).toBeGreaterThan(1);
    allLegal(withCard(turnOf("state"), "DK-002"), plan);
  });
});

describe("pruning keeps every option kind reachable (PR #40 review)", () => {
  it("offers Rally flip at a Base with Active Guerrillas in bounded generation", () => {
    const s = setPieces(setPieces(rich(turnOf("pkk")), "botan", "guerrilla", 0), "botan", "guerrilla", 3, "active");
    const flips = gen(s, "card", "pkk").candidates.filter((c) => JSON.stringify(c.command).includes("\"option\":\"flip\""));
    expect(flips.length).toBeGreaterThan(0);
    allLegal(s, gen(s, "card", "pkk"));
  });

  it("offers Rally flip without a Base", () => {
    const s = setPieces(rich(turnOf("pkk")), "hakkari", "guerrilla", 2, "active");
    const flips = gen(s, "card", "pkk").candidates.filter((c) => JSON.stringify(c.command).includes('"hakkari":{"option":"flip"}'));
    expect(flips.length).toBeGreaterThan(0);
  });

  it("offers Train Guards and Base where a State Base also allows Troops and Police", () => {
    // Van-Bitlis: Mountain with a State Base and Control; 2 Police allow a Base, Law 3175 allows Guards.
    const s = setPieces(rich(turnOf("state")), "van-bitlis", "police", 2);
    const train = gen(s, "card", "state").candidates.filter((c) => c.family.startsWith("op:state.train") && (c.command["plan"] as { locations: string[] }).locations.join() === "van-bitlis").map((c) => JSON.stringify(c.command));
    for (const option of ["guards", "base", "place"]) expect(train.some((t) => t.includes(`"option":"${option}"`)), option).toBe(true);
  });

  it("keeps the maximum-value Agitation allocation when the frontier exceeds the family cap", () => {
    let s = propaganda(setTrack(turnOf("pkk"), "resources.pkk", 20), "agitation", 2);
    for (const id of ["mardin-batman", "dersim", "agri", "bingol-mus", "elazig", "adiyaman", "diyarbakir-rural"]) s = setLevel(setPieces(s, id, "pkkBase", 1), id, 0);
    const shifts = (c: { command: Record<string, unknown> }): number => Object.values((c.command["choice"] as { spaces: Record<string, { shifts: number }> }).spaces).reduce((n, p) => n + p.shifts, 0);
    const narrow = Math.max(...gen(s, "agitation", "pkk").candidates.map(shifts));
    const broad = Math.max(...gen(s, "agitation", "pkk", true).candidates.map(shifts));
    expect(narrow).toBe(broad);
  });
});

describe("second review round (PR #40)", () => {
  it("values Harm recovered by a combined redress and shift in the Agitation frontier", () => {
    // Harm 8; 3 Resources. Van-Bitlis (-1, 2 Coercion, Base): remove both, shift once = +4 Pop, +4 margin from Harm 8 to 6.
    let s = propaganda(setTrack(turnOf("pkk"), "resources.pkk", 3), "agitation", 2);
    s = setMarkers(setMarkers(setPieces(setLevel(s, "van-bitlis", -1), "van-bitlis", "pkkBase", 1), "van-bitlis", "coercion", 2), "dersim", "pkkHarm", 6);
    s = setPieces(setLevel(s, "agri", 0), "agri", "pkkBase", 1);
    const set = gen(s, "agitation", "pkk");
    allLegal(s, set);
    expect(set.candidates.some((c) => JSON.stringify(c.command).includes("\"van-bitlis\":{\"coercion\":2,\"pkkHarm\":0,\"shifts\":1}"))).toBe(true);
  });

  it("keeps Train in a City when only one or two Troops and no Police are Available", () => {
    const base = turnOf("state");
    const s = { ...setTrack(base, "resources.state", 20), pools: { ...base.pools, troops: { available: 1, outOfPlay: 0 }, police: { available: 0, outOfPlay: 0 } } };
    const train = gen(s, "card", "state").candidates.filter((c) => c.family.startsWith("op:state.train") && JSON.stringify(c.command).includes("diyarbakir-city"));
    expect(train.some((c) => JSON.stringify(c.command).includes("\"troops\":1,\"police\":0"))).toBe(true);
    expect(train.some((c) => JSON.stringify(c.command).includes("civicAction"))).toBe(true);
  });
});

describe("campaign procedures (19 s5 Campaign row)", () => {
  it("offers ARGK decline and several placements", () => {
    const ready = setPieces(setPieces(engine.start(ruleset, "full-campaign", 1).state, "hakkari", "pkkBase", 1), "hakkari", "guerrilla", 6);
    const s = play(ready, { type: "Advance" }).state;
    expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "pivotal", faction: "pkk" });
    const set = gen(s, "pivotal", "pkk");
    allLegal(s, set);
    expect(set.families["pivotal:decline"]?.retained).toBe(1);
    expect(set.families["pivotal:play"]?.retained).toBeGreaterThan(3);
  });

  it("resumes an Operation after Host Pressure changes access, without another SA", () => {
    const pressure = op("pkk", "opSa", { op: "pkk.rally", locations: ["kdp-zone"], sa: { action: "pkk.host-pressure", timing: "before", locations: ["kdp-zone"] } });
    const s = play(withRoll(setTrack(turnOf("pkk"), "posture.kdp", "tolerant"), 1), pressure).state;
    expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "resume", faction: "pkk" });
    const set = gen(s, "resume", "pkk");
    expect(set.candidates.length).toBeGreaterThan(3);
    allLegal(s, set);
  });

  it("distinguishes automatic phases from choices: setup, victory, resources and full upkeep are automatic", () => {
    expect(decisionPoint(engine, ruleset, engine.start(ruleset, "full-campaign", 1).state)).toMatchObject({ kind: "auto", reason: "setup" });
    const s = turnOf("state");
    for (const phase of ["victory", "resources", "legalPolitics", "reset"]) expect(decisionPoint(engine, ruleset, propaganda(s, phase))).toMatchObject({ kind: "auto", reason: phase });
    expect(decisionPoint(engine, ruleset, propaganda(s, "upkeep"))).toMatchObject({ kind: "auto" });
    expect(decisionPoint(engine, ruleset, propaganda(s, "legitimacy"))).toMatchObject({ kind: "auto" });
  });

  it("removes the fewest Guards when upkeep cannot be paid", () => {
    const s = propaganda(setTrack(setPieces(setPieces(turnOf("state"), "dersim", "guards", 3), "agri", "guards", 3), "resources.state", 1), "upkeep");
    expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "upkeep", faction: "state" });
    const set = gen(s, "upkeep", "state");
    allLegal(s, set);
    for (const c of set.candidates) expect(Object.values((c.command["choice"] as { removeGuards: Record<string, number> }).removeGuards).reduce((a, n) => a + n, 0)).toBe(4);
  });

  it("offers keeping or moving Emergency Rule", () => {
    const s = propaganda(setTrack(turnOf("state"), "emergencyRule", "ohal"), "legitimacy");
    expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "legitimacy", faction: "state" });
    expect(gen(s, "legitimacy", "state").candidates.map((c) => c.command)).toEqual([{ type: "Advance" }, { type: "PropagandaChoice", phase: "legitimacy", choice: { emergencyStep: "normalizing" } }]);
  });

  it("Redeploy: the State part always moves Iraqi Troops out; the PKK part extends the chosen State part", () => {
    const s = propaganda(setPieces(turnOf("state"), "kdp-zone", "troops", 3), "redeploy");
    const state = gen(s, "redeployState", "state");
    allLegal(s, state);
    for (const c of state.candidates) expect(JSON.stringify(c.command)).toContain("\"from\":\"kdp-zone\"");
    const part = (state.candidates[0]?.command["choice"] ?? {}) as Record<string, unknown>;
    const pkk = generateCandidates(engine, ruleset, s, "redeployPkk", "pkk", { familyCap: 14, broad: false, stateRedeploy: { troops: part["troops"] as never, police: part["police"] as never } });
    allLegal(s, pkk);
    expect(pkk.candidates.length).toBeGreaterThan(1);
    for (const c of pkk.candidates) expect((c.command["choice"] as Record<string, unknown>)["troops"]).toEqual(part["troops"]);
  });
});

/** Exact optimum by brute force: every space at 0, 1 or 2 shifts. */
function bruteForce(spaces: readonly { pop: number; costs: readonly number[] }[], budget: number): number {
  let best = 0;
  const walk = (i: number, cost: number, value: number): void => {
    if (cost > budget) return;
    if (i === spaces.length) { best = Math.max(best, value); return; }
    const s = spaces[i];
    if (s === undefined) return;
    walk(i + 1, cost, value);
    s.costs.forEach((c, k) => { walk(i + 1, cost + c, value + (k + 1) * s.pop); });
  };
  walk(0, 0, 0);
  return best;
}

describe("Propaganda spending frontier contains the exact optimum (19 s5 pruning check)", () => {
  it("Civic Action: best candidate equals brute force under the Legitimacy cap and Resources", () => {
    let s = propaganda(setTrack(setTrack(turnOf("state"), "legitimacy", 12), "resources.state", 9), "civicAction", 2);
    s = setMarkers(setLevel(s, "van-bitlis", -1), "van-bitlis", "coercion", 1);
    const set = gen(s, "civicAction", "state");
    allLegal(s, set);
    const value = (c: (typeof set.candidates)[number]): number => Object.entries((c.command["choice"] as { spaces: Record<string, { shifts: number }> }).spaces).reduce((n, [id, p]) => n + p.shifts * (ruleset.spaces.find((x) => x.id === id)?.pop ?? 0), 0);
    // Independent oracle: State-Controlled spaces with Troops and Police (rules 6.6), costs from rules 3.6.1.
    // Van-Bitlis (Coercion), Mardin-Batman, Diyarbakir City, Elazig (Passive Support), Dersim, Bingol-Mus, Agri, Western Cities (Passive Support), Hakkari.
    const eligible = [{ pop: 4, costs: [3, 5] }, { pop: 4, costs: [2, 4] }, { pop: 2, costs: [2, 4] }, { pop: 2, costs: [2] }, { pop: 1, costs: [2, 4] }, { pop: 3, costs: [2, 4] }, { pop: 2, costs: [2, 4] }, { pop: 3, costs: [2] }, { pop: 1, costs: [2, 4] }];
    expect(Math.max(...set.candidates.map(value))).toBe(bruteForce(eligible, 6));
  });

  it("Agitation: best candidate equals brute force with Coercion and PKK Harm removals", () => {
    let s = propaganda(setTrack(turnOf("pkk"), "resources.pkk", 7), "agitation", 2);
    s = setMarkers(setPieces(setPieces(s, "mardin-batman", "pkkBase", 1), "mardin-batman", "guerrilla", 3), "mardin-batman", "pkkHarm", 1);
    s = setMarkers(setPieces(s, "dersim", "pkkBase", 1), "dersim", "coercion", 1);
    const set = gen(s, "agitation", "pkk");
    allLegal(s, set);
    const value = (c: (typeof set.candidates)[number]): number => Object.entries((c.command["choice"] as { spaces: Record<string, { shifts: number }> }).spaces).reduce((n, [id, p]) => n + p.shifts * (ruleset.spaces.find((x) => x.id === id)?.pop ?? 0), 0);
    // Botan (Pop 2, Passive Opposition: 1 shift at 1), Mardin (Pop 4: redress 2 then 1 each), Dersim (Pop 1: Coercion 1 then 1 each).
    expect(Math.max(...set.candidates.map(value))).toBe(bruteForce([{ pop: 2, costs: [1] }, { pop: 4, costs: [3, 4] }, { pop: 1, costs: [2, 3] }], 7));
  });
});

describe("bounded versus broad generation (20 Phase 4)", () => {
  const fixtures: [string, GameState, string][] = [
    ["State opening", rich(turnOf("state")), "state"],
    ["PKK opening", rich(turnOf("pkk")), "pkk"],
    ["State vs active Botan", setPieces(rich(turnOf("state")), "botan", "guerrilla", 3, "active"), "state"],
  ];
  it.each(fixtures)("%s: the bounded best one-ply plan is within 1 point of the broad best", (_name, s, faction) => {
    const weights = CURRENT.find((f) => f.id === (faction === "state" ? "S-ADAPT" : "P-ADAPT"))?.weights;
    expect.assert(weights !== undefined);
    const best = (set: CandidateSet): number => Math.max(...set.candidates.map((c) => {
      const r = engine.apply(ruleset, s, c.command);
      return r.ok ? evaluate(ruleset, r.transition.state, faction, weights).value : -Infinity;
    }));
    const narrow = gen(s, "card", faction);
    const broad = gen(s, "card", faction, true);
    expect(broad.candidates.length).toBeGreaterThan(narrow.candidates.length);
    expect(best(narrow)).toBeGreaterThanOrEqual(best(broad) - 1);
  });
});

describe("spending frontier, review rounds 3 and 4 (cand-4)", () => {
  // Independent oracle: final margin after the spending command (rules 7.3, including Harm above six).
  const margin = (s: GameState, faction: "state" | "pkk", command: AnyCommand): number => {
    const r = engine.apply(ruleset, s, command);
    expect.assert(r.ok);
    return independentStandings(ruleset, r.transition.state)[faction].finalMargin;
  };
  const choice = (phase: string, spaces: Record<string, Record<string, number>>): AnyCommand => ({ type: "PropagandaChoice", phase, choice: { spaces } });
  const best = (s: GameState, kind: DecisionKind, faction: "state" | "pkk"): number => Math.max(...gen(s, kind, faction).candidates.map((c) => margin(s, faction, c.command)));

  it("caps the Harm benefit over the whole allocation, not per space", () => {
    // Harm 7 (one above the limit): Coercion in Bingol-Mus and Van-Bitlis, 5 PKK Harm in Dersim (no Base).
    let s = propaganda(setTrack(turnOf("pkk"), "resources.pkk", 5), "agitation", 2);
    for (const id of ["agri", "bingol-mus", "van-bitlis"]) s = setLevel(setPieces(s, id, "pkkBase", 1), id, 0);
    s = setMarkers(setMarkers(setMarkers(s, "bingol-mus", "coercion", 1), "van-bitlis", "coercion", 1), "dersim", "pkkHarm", 5);
    const known = choice("agitation", { "van-bitlis": { coercion: 1, pkkHarm: 0, shifts: 2 }, agri: { coercion: 0, pkkHarm: 0, shifts: 2 } });
    expect(engine.validate(ruleset, s, known).ok).toBe(true);
    expect(best(s, "agitation", "pkk")).toBeGreaterThanOrEqual(margin(s, "pkk", known));
  });

  it("offers removal-only spending below the Harm limit, for tie-breaks on lower Harm", () => {
    // Botan is the only PKK Base, at Strong Opposition, with both PKK Harm markers: no shift is possible.
    let s = propaganda(setTrack(turnOf("pkk"), "resources.pkk", 4), "agitation", 2);
    s = setMarkers(setLevel(s, "botan", -2), "botan", "pkkHarm", 2);
    const removal = choice("agitation", { botan: { coercion: 0, pkkHarm: 2, shifts: 0 } });
    expect(engine.validate(ruleset, s, removal).ok).toBe(true);
    expect(gen(s, "agitation", "pkk").candidates.some((c) => JSON.stringify(c.command) === JSON.stringify(removal))).toBe(true);
  });

  it("keeps a Civic Action allocation the PKK cannot reverse by Agitation", () => {
    // Only Van-Bitlis (Strong Opposition, PKK Base, Pop 4) and Bingol-Mus (Neutral, Pop 3) are eligible; cap 4.
    let s = propaganda(setTrack(setTrack(turnOf("state"), "legitimacy", 8), "resources.state", 10), "civicAction", 2);
    for (const x of ruleset.spaces) if (!["van-bitlis", "bingol-mus"].includes(x.id) && (s.spaces[x.id]?.pieces["police"]?.["default"] ?? 0) > 0) s = setPieces(s, x.id, "police", 0);
    s = setPieces(setLevel(s, "van-bitlis", -2), "van-bitlis", "pkkBase", 1);
    const safe = choice("civicAction", { "bingol-mus": { coercion: 0, reception: 0, stateHarm: 0, displacement: 0, shifts: 2 } });
    expect(engine.validate(ruleset, s, safe).ok).toBe(true);
    expect(gen(s, "civicAction", "state").candidates.some((c) => JSON.stringify(c.command) === JSON.stringify(safe))).toBe(true);
  });

  it("keeps second shifts when more than nine spaces are eligible", () => {
    // Ten PKK Bases at Neutral, no Harm, 20 Resources: twenty shifts are affordable.
    let s = propaganda(setTrack(turnOf("pkk"), "resources.pkk", 20), "agitation", 2);
    const ten = ["botan", "mardin-batman", "diyarbakir-rural", "sanliurfa", "adiyaman", "elazig", "dersim", "bingol-mus", "van-bitlis", "agri"];
    for (const id of ten) s = setLevel(setPieces(s, id, "pkkBase", 1), id, 0);
    const all = choice("agitation", Object.fromEntries(ten.map((id) => [id, { coercion: 0, pkkHarm: 0, shifts: 2 }])));
    expect(engine.validate(ruleset, s, all).ok).toBe(true);
    expect(best(s, "agitation", "pkk")).toBeGreaterThanOrEqual(margin(s, "pkk", all));
  });
});

describe("spending ties (PR #41 review, cand-5)", () => {
  it("keeps tied Civic Action allocations that expose different spaces to the Agitation reply", () => {
    // Four eligible spaces. Mardin-Batman x2 + Sanliurfa x1 and Sanliurfa x1 + Van-Bitlis x2 tie on cost, gain and
    // unexposed gain, but the PKK (5 Resources) can reverse them differently; both must reach the final-round solve.
    let s = propaganda(setTrack(setTrack(setTrack(turnOf("state"), "legitimacy", 16), "resources.state", 20), "resources.pkk", 5), "civicAction", 2);
    const four = ["mardin-batman", "sanliurfa", "van-bitlis", "bingol-mus"];
    for (const x of ruleset.spaces) if (!four.includes(x.id) && (s.spaces[x.id]?.pieces["police"]?.["default"] ?? 0) > 0) s = setPieces(s, x.id, "police", 0);
    for (const id of four) s = setPieces(setPieces(s, id, "troops", 3), id, "police", 2);
    s = setMarkers(setPieces(setLevel(s, "mardin-batman", -1), "mardin-batman", "pkkBase", 1), "mardin-batman", "coercion", 1);
    s = setMarkers(setLevel(s, "sanliurfa", 1), "sanliurfa", "coercion", 1);
    s = setMarkers(setPieces(setLevel(s, "van-bitlis", 0), "van-bitlis", "pkkBase", 1), "van-bitlis", "coercion", 1);
    s = setMarkers(setPieces(setLevel(s, "bingol-mus", 0), "bingol-mus", "pkkBase", 1), "bingol-mus", "stateHarm", 1);
    const shifts = (c: { command: Record<string, unknown> }): string => JSON.stringify(Object.fromEntries(Object.entries((c.command["choice"] as { spaces: Record<string, { shifts: number }> }).spaces).map(([k, v]) => [k, v.shifts]).sort()));
    const set = gen(s, "civicAction", "state");
    allLegal(s, set);
    const offered = set.candidates.map(shifts);
    expect(offered).toContain(JSON.stringify({ "mardin-batman": 2, sanliurfa: 1 }));
    expect(offered).toContain(JSON.stringify({ sanliurfa: 1, "van-bitlis": 2 }));
  });
});

// Decisions of C3 to C5 (26-bot-reference Part 4, "When adding cards (C3 and later)").
describe("C3 to C5 decisions", () => {
  const c3 = (s: GameState): GameState => inCampaign(ruleset, s, "C3");
  const hasFamily = (set: CandidateSet, family: string): boolean => (set.families[family]?.retained ?? 0) > 0;

  it("offers Village Clearance with Sweep and Garrison, with each Reception space, in a State Controlled Opposition space", () => {
    // Botan: Mountain, Passive Opposition. 6 Troops and 1 Police against 2 Guerrillas and 1 Base give State Control.
    const s = setTrack(setPieces(c3(rich(turnOf("state"))), "botan", "troops", 6), "emergencyRule", "ohal");
    const set = gen(s, "card", "state");
    allLegal(s, set);
    for (const op of ["state.sweep", "state.garrison"]) expect(hasFamily(set, `op:${op}+state.village-clearance@opSa`), op).toBe(true);
    const receptions = new Set(set.candidates.filter((c) => c.family.includes("village-clearance")).flatMap((c) => Object.values((c.command["plan"] as { sa: { perLocation: Record<string, { reception: string }> } }).sa.perLocation).map((p) => p.reception)));
    expect([...receptions].sort()).toEqual(["diyarbakir-city", "western-cities"]);
    expect(hasFamily(gen(setTrack(s, "emergencyRule", "martialLaw"), "card", "state"), "op:state.sweep+state.village-clearance@opSa")).toBe(false);
  });

  it("offers Covert Action with Sweep and Garrison in a space that is not an Operation space", () => {
    // Mardin-Batman: 1 Troop and 1 Police against 1 Underground Guerrilla gives State Control.
    const s = c3(rich(turnOf("state")));
    const set = gen(s, "card", "state");
    allLegal(s, set);
    for (const op of ["state.sweep", "state.garrison"]) expect(hasFamily(set, `op:${op}+state.covert-action@opSa`), op).toBe(true);
    const covert = set.candidates.filter((c) => c.family.includes("covert-action")).map((c) => c.command["plan"] as { locations: string[]; sa: { locations: string[] } });
    expect(covert.every((p) => p.sa.locations.length === 1)).toBe(true);
    expect(covert.some((p) => !p.locations.includes(p.sa.locations[0] ?? ""))).toBe(true);
    expect(hasFamily(gen(inCampaign(ruleset, s, "C2"), "card", "state"), "op:state.sweep+state.covert-action@opSa")).toBe(false);
  });

  it("offers Declare Ceasefire to the PKK from C3 while no ceasefire is in force", () => {
    const s = c3(turnOf("pkk"));
    const set = gen(s, "card", "pkk");
    allLegal(s, set);
    expect(set.candidates.filter((c) => c.family === "ceasefire:declare").map((c) => c.command)).toEqual([{ type: "DeclareCeasefire", faction: "pkk" }]);
    expect(hasFamily(gen(turnOf("pkk"), "card", "pkk"), "ceasefire:declare")).toBe(false);
    expect(hasFamily(gen(setTrack(s, "ceasefire", "declared"), "card", "pkk"), "ceasefire:declare")).toBe(false);
  });

  it("offers every eligible Pivotal with its answers, and decline", () => {
    const opposed = (s: GameState): GameState => ["botan", "hakkari", "mardin-batman", "diyarbakir-rural", "sanliurfa", "van-bitlis"].reduce((b, id) => setLevel(b, id, -2), s);
    const reveal = (campaign: string, hands: Record<string, string[]>, prepare: (s: GameState) => GameState): GameState => {
      const base = inCampaign(ruleset, turnOf("state"), campaign);
      return play(prepare({ ...base, hands: { state: [], pkk: [], ...hands }, deck: { ...base.deck, currentCard: null, piles: [["DK-001", "DK-014"]] }, turn: { ...base.turn, phase: "setup" } }), { type: "Advance" }).state;
    };
    const serhildan = reveal("C3", { pkk: ["DK-054"] }, (s) => setLevel(opposed(s), "botan", -1));
    const pkk = gen(serhildan, "pivotal", "pkk");
    allLegal(serhildan, pkk);
    expect(hasFamily(pkk, "pivotal:decline")).toBe(true);
    expect(pkk.candidates.filter((c) => c.family === "pivotal:play:DK-054").length).toBeGreaterThan(1);
    const both = reveal("C5", { state: ["DK-076", "DK-098"] }, (s) => setTrack(setTrack(opposed(s), "emergencyRule", "ohalExtendedPowers"), "posture.syria", "tolerant"));
    const state = gen(both, "pivotal", "state");
    allLegal(both, state);
    for (const card of ["DK-076", "DK-098"]) expect(hasFamily(state, `pivotal:play:${card}`), card).toBe(true);
  });

  describe("Legal Politics (rules 6.5, 8.5, 8.6)", () => {
    const at = (s: GameState): GameState => propaganda(c3(s), "legalPolitics", 2);
    const choices = (set: CandidateSet): unknown[] => set.candidates.map((c) => (c.command.type === "Advance" ? null : c.command["choice"]));

    it("is automatic while Legal Space is Absent or no faction has a choice", () => {
      expect(decisionPoint(engine, ruleset, at(setTrack(turnOf("state"), "ceasefire", "declared")))).toMatchObject({ kind: "auto" });
      expect(decisionPoint(engine, ruleset, at(setTrack(turnOf("state"), "legalSpace", "open")))).toMatchObject({ kind: "auto" });
    });

    it("the State may file a closure case when an Office is on the map and no case is pending", () => {
      const s = at(setMarkers(setTrack(turnOf("state"), "legalSpace", "open"), "diyarbakir-city", "office", 1));
      expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "legalPoliticsState", faction: "state" });
      const set = gen(s, "legalPoliticsState", "state");
      allLegal(s, set);
      expect(choices(set)).toEqual([null, { closureFiling: true }]);
    });

    it("the State may accept a declared ceasefire, then the PKK may keep it or end it", () => {
      const s = at(setTrack(setTrack(turnOf("state"), "legalSpace", "open"), "ceasefire", "declared"));
      expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "legalPoliticsState", faction: "state" });
      expect(choices(gen(s, "legalPoliticsState", "state"))).toEqual([null, { ceasefire: { accept: true } }]);
      const pkk = generateCandidates(engine, ruleset, s, "legalPoliticsPkk", "pkk", { familyCap: 14, broad: false, stateLegalPolitics: {} });
      allLegal(s, pkk);
      expect(choices(pkk)).toEqual([null, { ceasefire: { pkkEnd: true } }]);
      const kept = generateCandidates(engine, ruleset, s, "legalPoliticsPkk", "pkk", { familyCap: 14, broad: false, stateLegalPolitics: { ceasefire: { accept: true } } });
      // The State accepted: ending the declaration has no effect, so it is not offered.
      expect(choices(kept)).toEqual([{ ceasefire: { accept: true } }]);
    });

    it("with a State Restraint Broken marker only the PKK has a choice", () => {
      const s = at(setMarkers(setTrack(setTrack(turnOf("state"), "legalSpace", "open"), "ceasefire", "declared"), "botan", "restraintBroken", 1, "state"));
      expect(decisionPoint(engine, ruleset, s)).toEqual({ kind: "legalPoliticsPkk", faction: "pkk" });
    });

    it("each faction may leave Reciprocal Restraint", () => {
      const s = at(setTrack(setTrack(turnOf("state"), "legalSpace", "open"), "ceasefire", "reciprocalRestraint"));
      expect(choices(gen(s, "legalPoliticsState", "state"))).toEqual([null, { ceasefire: { leave: { state: true } } }]);
      const pkk = generateCandidates(engine, ruleset, s, "legalPoliticsPkk", "pkk", { familyCap: 14, broad: false, stateLegalPolitics: {} });
      expect(choices(pkk)).toEqual([null, { ceasefire: { leave: { pkk: true } } }]);
    });
  });
});
