// Player qualification (19 s6; 20 Phase 5). Hand-built tactical fixtures, each with its rules
// source, the alternatives it offers and the outcomes it accepts. Outcomes are judged by an
// independent score calculation written from the rules text (7.1 to 7.3), not by the engine's
// derivation alone; the engine's own result must agree with it. Equivalent good actions pass.
import { canonicalHash } from "../engine/core/canonical.ts";
import type { AnyCommand, FactionId, GameState, Ruleset } from "../engine/core/types.ts";
import type { Engine } from "../engine/index.ts";
import { decisionPoint, generateCandidates, type DecisionKind } from "./candidates.ts";
import { determinize, observe, SearchRng } from "./player-observation.ts";
import { isObservationPlayer, TransitionBudget, type Player } from "./players.ts";

export const SUITE_VERSION = 1;
/** Scenario A values from rules 7.1, written here independently of the package. */
const THRESHOLD: Readonly<Record<string, number>> = { state: 49, pkk: 30 };
const HARM_LIMIT = 6;

export interface Standing { readonly score: number; readonly harm: number; readonly checkQualifies: boolean; readonly finalMargin: number }

/** Independent scores (rules 7.1), Harm (1.8), opening qualification (7.2) and final margins (7.3). */
export function independentStandings(r: Ruleset, s: GameState): Readonly<Record<"state" | "pkk", Standing>> {
  let support = 0;
  let opposition = 0;
  let bases = 0;
  let stateHarm = 0;
  let pkkHarm = 0;
  for (const space of r.spaces) {
    const here = s.spaces[space.id];
    if (here === undefined) continue;
    const sum = (o: Readonly<Record<string, number>> | undefined): number => Object.values(o ?? {}).reduce((a, n) => a + n, 0);
    stateHarm += sum(here.markers["stateHarm"]);
    pkkHarm += sum(here.markers["pkkHarm"]) + sum(here.markers["coercion"]);
    if (space.kind !== "domestic") continue;
    const level = here.level ?? 0;
    if (level > 0) support += space.pop * level;
    if (level < 0) opposition += space.pop * -level;
    bases += sum(here.pieces["pkkBase"]);
  }
  const make = (score: number, harm: number, f: string): Standing => ({ score, harm, checkQualifies: score >= (THRESHOLD[f] ?? 0) && harm <= HARM_LIMIT, finalMargin: score - (THRESHOLD[f] ?? 0) - 2 * Math.max(0, harm - HARM_LIMIT) });
  return { state: make(support + Number(s.tracks["legitimacy"]), stateHarm, "state"), pkk: make(opposition + bases, pkkHarm, "pkk") };
}

// ---------------------------------------------------------------- board builders

type Edit = (s: GameState, r: Ruleset) => GameState;
const pieces = (space: string, piece: string, n: number, face = piece === "guerrilla" ? "underground" : "default"): Edit => (s) => {
  const here = s.spaces[space];
  if (here === undefined) throw new RangeError(space);
  const before = here.pieces[piece]?.[face] ?? 0;
  const pool = s.pools[piece] ?? { available: 0, outOfPlay: 0 };
  return { ...s, spaces: { ...s.spaces, [space]: { ...here, pieces: { ...here.pieces, [piece]: { ...here.pieces[piece], [face]: n } } } }, pools: { ...s.pools, [piece]: { ...pool, available: pool.available - (n - before) } } };
};
const marker = (space: string, m: string, n: number): Edit => (s) => {
  const here = s.spaces[space];
  if (here === undefined) throw new RangeError(space);
  const before = here.markers[m]?.["default"] ?? 0;
  return { ...s, spaces: { ...s.spaces, [space]: { ...here, markers: { ...here.markers, [m]: { ...here.markers[m], default: n } } } }, markerPools: { ...s.markerPools, [m]: (s.markerPools[m] ?? 0) - (n - before) } };
};
const levels = (map: Readonly<Record<string, number>>): Edit => (s) => ({ ...s, spaces: Object.fromEntries(Object.entries(s.spaces).map(([id, sp]) => [id, sp.level === null ? sp : { ...sp, level: map[id] ?? 0 }])) });
const track = (id: string, v: number | string): Edit => (s) => ({ ...s, tracks: { ...s.tracks, [id]: v } });
const compose = (...edits: Edit[]): Edit => (s, r) => edits.reduce((acc, e) => e(acc, r), s);
const phaseAt = (phase: string, round: number, card: string): Edit => (s, r) => ({ ...s, turn: { ...s.turn, propagandaRound: round, phase: "propaganda", step: r.sequence.propagandaPhases.indexOf(phase) }, deck: { ...s.deck, currentCard: card } });

const C1 = ["DK-001", "DK-002", "DK-003", "DK-004", "DK-005", "DK-006", "DK-007", "DK-008", "DK-009", "DK-010", "DK-011", "DK-012", "DK-016"];
const C2_SEEN = ["DK-017", "DK-018", "DK-019", "DK-020", "DK-022", "DK-023", "DK-024", "DK-025", "DK-026", "DK-027", "DK-028", "DK-015"];

/** Last Event card of C2: the only unseen card left is the C2 Propaganda (deducible from public counts). */
function lastCard(actor: FactionId): Edit {
  const other = actor === "state" ? "pkk" : "state";
  return (s) => ({
    ...s,
    turn: { campaign: "C2", propagandaRound: 1, cardIndex: 25, phase: "card", step: 0 },
    deck: { piles: [[], ["DK-035"]], currentCard: "DK-021", played: [...C1, ...C2_SEEN], setAside: [] },
    hands: { state: [], pkk: [] },
    initiative: { boxes: { [actor]: null, [other]: "pass" }, firstEligible: other, secondEligible: actor, actedThisCard: [other] },
  });
}

/** Final round (rules 6.1 to 6.7), at the given phase. */
function finalPhase(phase: string): Edit {
  return (s, r) => ({
    ...s,
    turn: { campaign: "C2", propagandaRound: 2, cardIndex: 26, phase: "propaganda", step: r.sequence.propagandaPhases.indexOf(phase) },
    deck: { piles: [[], []], currentCard: "DK-035", played: [...C1, ...C2_SEEN, "DK-021"], setAside: [] },
    hands: { state: [], pkk: [] },
    initiative: { boxes: { state: null, pkk: null }, firstEligible: "pkk", secondEligible: "state", actedThisCard: [] },
  });
}

/** Opposition 27 Pop-weighted + 3 Bases = PKK 30; Support 30 + Legitimacy 10 = State 40. */
const pkkAtThirty = compose(
  levels({ "van-bitlis": -2, "mardin-batman": -2, sanliurfa: -2, "bingol-mus": -1, "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, agri: 2, dersim: 2, "diyarbakir-rural": 2 }),
  pieces("elazig", "pkkBase", 1), pieces("hakkari", "pkkBase", 1), pieces("hakkari", "guerrilla", 3),
);

export interface Fixture {
  readonly id: string;
  readonly benchmark: "available win" | "preventable loss" | "scoring" | "costs and Harm" | "procedures";
  readonly faction: FactionId;
  readonly source: string;
  readonly alternatives: string;
  readonly accepts: string;
  readonly kind: DecisionKind;
  readonly build: Edit;
  /** Judge the position after the decision and every following automatic step. */
  readonly accept: (r: Ruleset, after: GameState, command: AnyCommand) => boolean;
}

const wins = (f: string) => (r: Ruleset, s: GameState): boolean => s.ended?.winner === f && (s.ended.reason === "victory check" ? independentStandings(r, s)[f as "state" | "pkk"].checkQualifies : true);
const notWon = (f: string) => (_r: Ruleset, s: GameState): boolean => s.ended?.winner !== f;
const legal = (): boolean => true;
const finalWinner = (f: "state" | "pkk") => (r: Ruleset, s: GameState): boolean => {
  if (s.ended?.reason !== "final scoring") return false;
  const st = independentStandings(r, s);
  const other = f === "state" ? "pkk" : "state";
  const independent = st[f].finalMargin > st[other].finalMargin || (st[f].finalMargin === st[other].finalMargin && (st[f].harm < st[other].harm || (st[f].harm === st[other].harm && f === "pkk")));
  return independent && s.ended.winner === f;
};

export const FIXTURES: readonly Fixture[] = [
  // Available wins.
  { id: "S-WIN-CHECK", benchmark: "available win", faction: "state", source: "rules 3.2.1, 3.6.1, 7.2", kind: "card",
    alternatives: "State 47: Train + Civic Action in Van-Bitlis or Diyarbakir City reaches 49; other Operations, Event, Pass do not", accepts: "State wins at the opening check (score >= 49, Harm <= 6)",
    build: compose(levels({ "western-cities": 2, "diyarbakir-city": 1, elazig: 2, adiyaman: 2, sanliurfa: 2, "van-bitlis": 1, "bingol-mus": 1, agri: 1 }), track("legitimacy", 14), track("resources.state", 10), lastCard("state")), accept: wins("state") },
  { id: "P-WIN-CHECK", benchmark: "available win", faction: "pkk", source: "rules 3.3.1, 3.6.2, 7.2", kind: "card",
    alternatives: "Rally + Agitate at the Botan Base, other Operations, Pass", accepts: "PKK wins at the opening check",
    build: compose(levels({ "van-bitlis": -2, "mardin-batman": -2, sanliurfa: -2, botan: -1 }), pieces("hakkari", "pkkBase", 1), track("resources.pkk", 4), lastCard("pkk")), accept: wins("pkk") },
  { id: "P-WIN-AGIT", benchmark: "available win", faction: "pkk", source: "rules 6.7, 7.3", kind: "agitation",
    alternatives: "PKK -7, State -2, 2 Resources: two Mardin-Batman shifts (Pop 4) win, one Mardin and one Dersim shift tie and win on the PKK tie rule; one shift or Dersim alone or nothing lose", accepts: "PKK wins at final scoring",
    build: compose(levels({ "van-bitlis": -2, sanliurfa: -2, botan: -2, "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, agri: 2, dersim: 0, "diyarbakir-rural": 2, hakkari: 1 }), pieces("mardin-batman", "pkkBase", 1), pieces("dersim", "pkkBase", 1), track("legitimacy", 20), track("resources.pkk", 2), finalPhase("agitation")), accept: finalWinner("pkk") },
  { id: "S-WIN-CIVIC", benchmark: "available win", faction: "state", source: "rules 6.6, 7.3", kind: "civicAction",
    alternatives: "State -17, PKK -15, cap one shift: Van-Bitlis (Pop 4) wins; Agri (Pop 2) ties and loses on Harm order; Pop 1 or nothing loses", accepts: "State wins at final scoring against the best PKK reply",
    build: compose(levels({ "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, sanliurfa: 2, "van-bitlis": 0, agri: 1, "mardin-batman": -2, botan: -2, hakkari: -2, "bingol-mus": 0, dersim: 0 }), track("legitimacy", 4), track("resources.state", 9), track("resources.pkk", 0), finalPhase("civicAction")), accept: finalWinner("state") },
  // Preventable losses.
  { id: "S-DEFEND-CHECK", benchmark: "preventable loss", faction: "state", source: "rules 3.2.4, 3.6.1, 7.2", kind: "card",
    alternatives: "Assault the exposed Elazig Base, Civic Action in an Opposition space, other Operations, Pass", accepts: "PKK does not win at the opening check",
    build: compose(pkkAtThirty, track("resources.state", 10), lastCard("state")), accept: notWon("pkk") },
  { id: "P-DEFEND-CHECK", benchmark: "preventable loss", faction: "pkk", source: "rules 3.3.4, 7.2", kind: "card",
    alternatives: "State 49: Coerce Sanliurfa or Adiyaman (Support, Underground Guerrilla) drops it below; other Operations or Pass do not", accepts: "State does not win at the opening check",
    build: compose(levels({ "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, sanliurfa: 2, "van-bitlis": 1, "bingol-mus": 1, agri: 2 }), pieces("sanliurfa", "guerrilla", 1), pieces("adiyaman", "guerrilla", 1), track("legitimacy", 12), track("resources.pkk", 3), lastCard("pkk")), accept: notWon("state") },
  // Scoring.
  { id: "S-SCORE-POP", benchmark: "scoring", faction: "state", source: "rules 1.6, 6.6, 7.1", kind: "civicAction",
    alternatives: "State -17, PKK -14, cap one shift: Mardin-Batman (Pop 4) wins; Agri (Pop 2), Dersim (Pop 1) or nothing lose", accepts: "State wins: only the Pop 4 shift does",
    build: compose(levels({ "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, sanliurfa: 2, agri: 1, botan: -2, "van-bitlis": -2, hakkari: -2 }), track("legitimacy", 4), track("resources.state", 9), track("resources.pkk", 0), pieces("hakkari", "pkkBase", 1), finalPhase("civicAction")), accept: finalWinner("state") },
  { id: "P-SCORE-BASE", benchmark: "scoring", faction: "pkk", source: "rules 3.3.1, 7.1 (domestic Bases score; external do not)", kind: "card",
    alternatives: "PKK 29, 1 Resource: a Rally Base in Mardin-Batman (domestic) reaches 30; a Base in KDP or Syria (external), other Operations or Pass do not", accepts: "PKK wins at the opening check",
    build: compose(levels({ "van-bitlis": -2, sanliurfa: -2, "bingol-mus": -2, botan: -1, dersim: -1 }), pieces("mardin-batman", "guerrilla", 3), pieces("botan", "pkkBase", 2), pieces("hakkari", "pkkBase", 2), pieces("kdp-zone", "guerrilla", 3), track("resources.pkk", 1), lastCard("pkk")), accept: wins("pkk") },
  { id: "P-FINAL-BELOW", benchmark: "scoring", faction: "pkk", source: "rules 7.3 (a negative margin can win)", kind: "agitation",
    alternatives: "PKK -10, State -8, threshold out of reach: Agitating Mardin-Batman gives -2 and wins; spending nothing loses", accepts: "PKK wins at final scoring with a negative margin",
    build: compose(levels({ "van-bitlis": -2, sanliurfa: -2, botan: -1, "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, agri: 2, dersim: 2, "diyarbakir-rural": 1 }), pieces("mardin-batman", "pkkBase", 1), track("legitimacy", 15), track("resources.pkk", 3), finalPhase("agitation")), accept: finalWinner("pkk") },
  // Costs and Harm.
  { id: "P-HARM-GATE", benchmark: "costs and Harm", faction: "pkk", source: "rules 1.8, 3.3.4, 7.2 (Harm above six blocks an opening win)", kind: "card",
    alternatives: "Coerce (a seventh Harm), other Operations, Pass", accepts: "PKK wins at the opening check (Harm stays at most six)",
    build: compose(levels({ "van-bitlis": -2, "mardin-batman": -2, sanliurfa: -2, botan: -2, hakkari: -2, "western-cities": 2, adiyaman: 1, dersim: 1 }), marker("van-bitlis", "coercion", 3), marker("mardin-batman", "coercion", 3), pieces("dersim", "guerrilla", 2), pieces("adiyaman", "guerrilla", 2), track("resources.pkk", 4), lastCard("pkk")), accept: wins("pkk") },
  { id: "P-HARM-FINAL", benchmark: "costs and Harm", faction: "pkk", source: "rules 3.6.2, 7.3 (two margin per excess Harm)", kind: "agitation",
    alternatives: "PKK -5 with Harm 8, State -4, 1 Resource: removing a Coercion marker gives -3 and wins; shifting Dersim (Pop 1) ties at -4 and loses on lower State Harm", accepts: "PKK wins at final scoring",
    build: compose(levels({ "van-bitlis": -2, sanliurfa: -2, "bingol-mus": -2, botan: -2, "western-cities": 2, "diyarbakir-city": 2, elazig: 2, adiyaman: 2, agri: 2, "diyarbakir-rural": 2, "mardin-batman": 1 }), marker("van-bitlis", "coercion", 4), marker("sanliurfa", "coercion", 4), pieces("van-bitlis", "pkkBase", 1), pieces("dersim", "pkkBase", 1), track("legitimacy", 15), track("resources.pkk", 1), finalPhase("agitation")), accept: finalWinner("pkk") },
  { id: "S-HARM-FINAL", benchmark: "costs and Harm", faction: "state", source: "rules 3.6.1, 6.6, 7.3", kind: "civicAction",
    alternatives: "State -9 with Harm 8, PKK -8, 3 Resources: redressing one State Harm gives -7 and wins; shifting Dersim (Pop 1) ties at -8 and loses on Harm", accepts: "State wins at final scoring",
    build: compose(levels({ "western-cities": 2, "diyarbakir-city": 2, elazig: 2, "van-bitlis": 2, "bingol-mus": 2, agri: 2, botan: -2, sanliurfa: -2, adiyaman: -2, "diyarbakir-rural": -2 }), pieces("mardin-batman", "troops", 0), pieces("hakkari", "pkkBase", 1), marker("agri", "stateHarm", 4), marker("van-bitlis", "stateHarm", 4), track("legitimacy", 12), track("resources.state", 3), track("resources.pkk", 0), finalPhase("civicAction")), accept: finalWinner("state") },
  // Procedures: any legal resolution passes; failures and illegal submissions do not.
  { id: "S-PROC-EVENT", benchmark: "procedures", faction: "state", source: "rules 5.1 (choices, free action plan)", kind: "card", alternatives: "Event sides with questions, Operations, Pass", accepts: "a legal command", build: compose(lastCard("state"), (s) => ({ ...s, deck: { ...s.deck, currentCard: "DK-002" }, initiative: { ...s.initiative, firstEligible: "state", secondEligible: "pkk", actedThisCard: [], boxes: { state: null, pkk: null } } })), accept: legal },
  { id: "P-PROC-ARGK", benchmark: "procedures", faction: "pkk", source: "rules 5.3", kind: "pivotal", alternatives: "Play ARGK with placements or decline", accepts: "a legal command",
    build: (s, r) => {
      const ready = compose(pieces("hakkari", "pkkBase", 1), pieces("hakkari", "guerrilla", 6))(s, r);
      return { ...ready, turn: { ...ready.turn, phase: "pivotal", cardIndex: 1 }, deck: { ...ready.deck, currentCard: ready.deck.piles[0]?.[0] ?? null, piles: ready.deck.piles.map((p, i) => (i === 0 ? p.slice(1) : p)) }, pending: { id: "pivotal-1-pkk", faction: "pkk", prompt: "Play ARGK Formed instead of this card, or decline for this card?", answers: ["decline"], ruleRef: "05 s4; DK-015" } };
    }, accept: legal },
  { id: "S-PROC-REDEPLOY", benchmark: "procedures", faction: "state", source: "rules 6.8 (Iraqi Troops must leave)", kind: "redeployState", alternatives: "Required exits to each legal destination, optional moves", accepts: "a legal command", build: compose(pieces("kdp-zone", "troops", 3), phaseAt("redeploy", 1, "DK-016")), accept: legal },
  { id: "S-PROC-UPKEEP", benchmark: "procedures", faction: "state", source: "rules 6.3", kind: "upkeep", alternatives: "Which Guards to remove for an unpaid upkeep", accepts: "a legal command", build: compose(pieces("dersim", "guards", 3), pieces("agri", "guards", 3), track("resources.state", 1), (s) => ({ ...s, flags: { ...s.flags, law3175: true } }), phaseAt("upkeep", 1, "DK-016")), accept: legal },
  { id: "P-PROC-RESUME", benchmark: "procedures", faction: "pkk", source: "rules 4.3.4 (Host Pressure continuation, DEC-54)", kind: "resume", alternatives: "New legal Rally locations for the saved Operation", accepts: "a legal command",
    build: compose(track("posture.kdp", "restricted"), track("resources.pkk", 3), (s) => ({ ...s, turn: { ...s.turn, phase: "decision", cardIndex: 1 }, deck: { ...s.deck, currentCard: "DK-014" }, initiative: { ...s.initiative, boxes: { pkk: "opSa", state: null }, actedThisCard: ["pkk"] }, pending: { id: "operation-1", faction: "pkk", prompt: "Host Pressure changed access. Choose new legal Rally locations.", answers: [], ruleRef: "DEC-54", resume: { kind: "operation", op: "pkk.rally", box: "opSa" } } })), accept: legal },
  { id: "P-PROC-EVENT", benchmark: "procedures", faction: "pkk", source: "rules 5.1", kind: "card", alternatives: "Event sides with questions, Operations, Pass", accepts: "a legal command", build: compose(lastCard("pkk"), (s) => ({ ...s, deck: { ...s.deck, currentCard: "DK-001" }, initiative: { ...s.initiative, firstEligible: "pkk", secondEligible: "state", actedThisCard: [], boxes: { state: null, pkk: null } } })), accept: legal },
];

export interface FixtureResult {
  readonly fixture: string;
  readonly player: string;
  readonly passed: boolean;
  readonly detail: string;
  readonly command: AnyCommand | null;
}

/** Hash of the fixture definitions (19 s6: record the suite hash). */
export function suiteHash(engine: Engine, r: Ruleset): string {
  const start = engine.start(r, "scenario-a", 1).state;
  return canonicalHash({ version: SUITE_VERSION, fixtures: FIXTURES.map((f) => ({ id: f.id, benchmark: f.benchmark, faction: f.faction, source: f.source, alternatives: f.alternatives, accepts: f.accepts, kind: f.kind, state: canonicalHash(f.build(start, r)) })) });
}

/** Run one fixture for one player through the experiment decision pipeline. */
export function runFixture(engine: Engine, r: Ruleset, fixture: Fixture, player: Player): FixtureResult {
  const base = { fixture: fixture.id, player: player.spec.id };
  if (player.spec.faction !== fixture.faction) return { ...base, passed: true, detail: "not applicable (other faction)", command: null };
  const s = fixture.build(engine.start(r, "scenario-a", 1).state, r);
  const point = decisionPoint(engine, r, s);
  if (point.kind !== fixture.kind || !("faction" in point) || point.faction !== fixture.faction) return { ...base, passed: false, detail: `fixture error: decision point ${JSON.stringify(point)}`, command: null };
  if (!isObservationPlayer(player)) return { ...base, passed: false, detail: "full-state control: not eligible for qualification", command: null };
  const observation = observe(s, fixture.faction);
  const projection = determinize(r, observation, new SearchRng(0));
  const candidates = generateCandidates(engine, r, projection, fixture.kind, fixture.faction).candidates.filter((c) => engine.validate(r, s, c.command).ok);
  if (candidates.length === 0) return { ...base, passed: false, detail: "empty candidate set", command: null };
  let command: AnyCommand;
  try {
    const choice = player.decide({ decisionId: fixture.id, kind: fixture.kind, faction: fixture.faction, observation, candidates }, { engine, ruleset: r, rng: new SearchRng(1), budget: new TransitionBudget(engine, player.spec.budget) });
    const picked = candidates.find((c) => c.id === choice.candidateId);
    if (picked === undefined) return { ...base, passed: false, detail: `unknown candidate ${choice.candidateId}`, command: null };
    command = picked.command;
  } catch (e) {
    return { ...base, passed: false, detail: `player error: ${e instanceof Error ? e.message : String(e)}`, command: null };
  }
  const applied = engine.apply(r, s, command);
  if (!applied.ok) return { ...base, passed: false, detail: "illegal submitted command", command };
  // Follow automatic steps; in final-round fixtures the PKK has nothing left to spend.
  let after = applied.transition.state;
  for (let i = 0; i < 16 && after.ended === null; i++) { // literal-ok: more steps than the remaining phases
    const next = decisionPoint(engine, r, after);
    const step = next.kind === "auto" ? next.command : next.kind === "agitation" && fixture.kind === "civicAction" ? { type: "Advance" } : null;
    if (step === null) break;
    const result = engine.apply(r, after, step);
    if (!result.ok) break;
    after = result.transition.state;
  }
  const passed = fixture.accept(r, after, command);
  const st = independentStandings(r, after);
  return { ...base, passed, detail: `ended ${after.ended?.reason ?? "no"}; winner ${after.ended?.winner ?? "none"}; independent margins state ${String(st.state.finalMargin)} pkk ${String(st.pkk.finalMargin)}; harm ${String(st.state.harm)}/${String(st.pkk.harm)}`, command };
}

export interface QualificationReport {
  readonly suiteVersion: number;
  readonly suiteHash: string;
  readonly packageHash: string;
  readonly players: Readonly<Record<string, { readonly passed: boolean; readonly applicable: number; readonly failures: readonly string[] }>>;
  readonly results: readonly FixtureResult[];
}

/** Run every fixture for every player (19 s6). */
export function qualify(engine: Engine, r: Ruleset, players: readonly Player[]): QualificationReport {
  const results = players.flatMap((p) => FIXTURES.map((f) => runFixture(engine, r, f, p)));
  return {
    suiteVersion: SUITE_VERSION, suiteHash: suiteHash(engine, r), packageHash: r.packageHash, results,
    players: Object.fromEntries(players.map((p) => {
      const mine = results.filter((x) => x.player === p.spec.id && !x.detail.startsWith("not applicable"));
      return [p.spec.id, { passed: mine.every((x) => x.passed), applicable: mine.length, failures: mine.filter((x) => !x.passed).map((x) => x.fixture) }];
    })),
  };
}
