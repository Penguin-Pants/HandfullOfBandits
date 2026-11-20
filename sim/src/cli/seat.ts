// Bot seats in play sessions (audit Plan 2 S1). A seat gives one faction to an observation player
// (qualified or baseline); full-state controls cannot sit, because they read hidden data. A bot
// decides with the same code as experiment games (decideObserved). Redeploy and Legal Politics
// take one joint command, State part first (rules 6.8, 8.6): a bot State part that a human PKK
// must extend comes back as `partial`; a human State part that a bot PKK extends comes in as
// `partial`. The server wires this module in from the app entry (server code cannot import cli).
import { canonicalHash } from "../engine/core/canonical.ts";
import type { AnyCommand, FactionId, GameState, JsonObject, Ruleset } from "../engine/core/types.ts";
import type { Engine } from "../engine/index.ts";
import { decisionPoint, generateCandidates, type Candidate, type DecisionKind } from "./candidates.ts";
import { decideObserved, type DecisionRecord } from "./game-runner.ts";
import { SearchRng } from "./player-observation.ts";
import { isObservationPlayer, type ObservationPlayer } from "./players.ts";
import { resolvePlayer } from "./player-registry.ts";
import { CURRENT } from "./strategies/roster.ts";

/** Bot player ID per faction. A faction with no entry is a human seat. */
export type Seats = Readonly<Record<string, string>>;

/** One reviewed candidate of a bot decision: what it would have played and why (audit Plan 2 S4). */
export interface ReviewedCandidate {
  readonly id: string;
  readonly family: string;
  readonly value: number | null;
  readonly components: Readonly<Record<string, number>>;
  readonly command: AnyCommand;
}

/** A decision record with the commands of its best candidates, best first; the chosen one is first. */
export type SeatRecord = DecisionRecord & { readonly review: readonly ReviewedCandidate[] };

export interface SeatStep {
  /** The command to submit; null when a human must complete a joint choice first. */
  readonly command: AnyCommand | null;
  /** The bot's State part of a joint choice, for the human PKK to extend. */
  readonly partial: JsonObject | null;
  /** Legal Politics: every joined choice the human PKK may submit (rules 8.6); null for Redeploy. */
  readonly options: readonly JsonObject[] | null;
  readonly records: readonly SeatRecord[];
}

const FACTIONS: readonly FactionId[] = ["state", "pkk"];
const JOINT_STATE: ReadonlySet<DecisionKind> = new Set(["redeployState", "legalPoliticsState"]);

function seatPlayer(id: string): ObservationPlayer {
  const player = resolvePlayer(id);
  if (!isObservationPlayer(player)) throw new RangeError(`${id} reads the full game state and cannot take a seat`);
  return player;
}

/** Checked seats: known factions, known observation players of that faction. Throws RangeError. */
export function checkSeats(seats: Readonly<Record<string, unknown>>): Seats {
  const out: Record<string, string> = {};
  for (const [faction, id] of Object.entries(seats)) {
    if (!FACTIONS.includes(faction)) throw new RangeError(`Unknown seat faction "${faction}"`);
    if (typeof id !== "string") throw new RangeError(`The ${faction} seat needs a player ID`);
    const player = seatPlayer(id);
    if (player.spec.faction !== faction) throw new RangeError(`${id} plays ${player.spec.faction}, not ${faction}`);
    out[faction] = id;
  }
  return out;
}

/**
 * The default opponent (designer decision 2026-11-19: the bot plays the State first). S-CON@4 won
 * the most games of the v4 State bots (`dd25-v4b` 38 of 60; `dev-s2-state-v5` 9 of 16). The v5
 * spending retune lost more games, so it is not the default (audit Plan 2 S2).
 */
export const RECOMMENDED_SEAT = "S-CON@4";

/** Qualified roster players a seat may name, for the Home screen. */
export function seatPlayers(): { readonly id: string; readonly faction: FactionId; readonly description: string; readonly recommended: boolean }[] {
  return CURRENT.map((f) => {
    const id = `${f.id}@${String(f.version)}`;
    return { id, faction: f.faction, description: f.description, recommended: id === RECOMMENDED_SEAT };
  });
}

/** True when a human State decides a joint phase whose PKK part a bot adds (send it to `seatStep` as `partial`). */
export function botExtendsState(engine: Engine, ruleset: Ruleset, state: GameState, seats: Seats): boolean {
  const point = decisionPoint(engine, ruleset, state);
  return JOINT_STATE.has(point.kind as DecisionKind) && seats["state"] === undefined && seats["pkk"] !== undefined;
}

const obj = (v: unknown): JsonObject => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as JsonObject) : {});

/**
 * The joint command from the bot State part and a human PKK command of the same phase (Advance:
 * no PKK choice). Only PKK answers are taken from the human: Guerrilla routes, ending a Declared
 * ceasefire, leaving Reciprocal Restraint (rules 6.8, 8.6). Throws RangeError for another command.
 */
export function joinStatePart(phase: string, part: JsonObject, human: AnyCommand): AnyCommand {
  if (human.type !== "Advance" && !(human.type === "PropagandaChoice" && human["phase"] === phase)) throw new RangeError(`Add the PKK part of ${phase}, or Advance for none.`);
  const pkk = obj(human["choice"]);
  if (phase === "redeploy") return { type: "PropagandaChoice", phase, choice: { troops: part["troops"] ?? [], police: part["police"] ?? [], guerrilla: pkk["guerrilla"] ?? [] } };
  const state = obj(part["ceasefire"]);
  const mine = obj(pkk["ceasefire"]);
  const leave = { ...obj(state["leave"]), ...(obj(mine["leave"])["pkk"] === true ? { pkk: true } : {}) };
  const ceasefire = { ...state, ...(mine["pkkEnd"] === true ? { pkkEnd: true } : {}), ...(Object.keys(leave).length > 0 ? { leave } : {}) };
  const choice = { ...part, ...(Object.keys(ceasefire).length > 0 ? { ceasefire } : {}) };
  return Object.keys(choice).length === 0 ? { type: "Advance" } : { type: "PropagandaChoice", phase, choice };
}

/** The faction whose bot must act now, or null (a human acts, or no player decision is open). */
export function botToAct(engine: Engine, ruleset: Ruleset, state: GameState, seats: Seats): FactionId | null {
  const point = decisionPoint(engine, ruleset, state);
  if (point.kind === "auto" || point.kind === "none") return null;
  return seats[point.faction] === undefined ? null : point.faction;
}

/** The record plus the commands of the chosen and ranked candidates (chosen first, no repeats). */
function withReview(record: DecisionRecord, candidates: readonly Candidate[]): SeatRecord {
  const ranked = record.ranked ?? [];
  const ids = [record.selected, ...ranked.map((r) => r.id), record.topAlternative?.id].filter((x): x is string => x !== null && x !== undefined);
  const review: ReviewedCandidate[] = [];
  for (const id of new Set(ids)) {
    const c = candidates.find((x) => x.id === id);
    if (c === undefined) continue;
    const r = ranked.find((x) => x.id === id);
    const value = r?.value ?? (id === record.selected ? record.value : id === record.topAlternative?.id ? record.topAlternative.value : null);
    review.push({ id, family: c.family, value, components: r?.components ?? (id === record.selected ? record.components : {}), command: c.command });
  }
  return { ...record, review };
}

/** The choice object of a PropagandaChoice command, or {} for any other command. */
const choiceOf = (command: AnyCommand): JsonObject => (command["choice"] ?? {}) as JsonObject;

/** The State part a PKK choice extends (candidates.ts `stateRedeploy`, `stateLegalPolitics`). */
function statePart(kind: DecisionKind, choice: JsonObject): { stateRedeploy?: JsonObject; stateLegalPolitics?: JsonObject } {
  return kind === "redeployState" ? { stateRedeploy: { troops: choice["troops"] ?? [], police: choice["police"] ?? [] } } : { stateLegalPolitics: choice };
}

/**
 * One bot step from `state`. With `partial` (a human State part of a joint choice), the PKK bot
 * extends it. The search RNG is seeded from the state hash, so a reload repeats the same choice.
 * Throws RangeError when no bot acts now, and Error when the player fails.
 */
export function seatStep(engine: Engine, ruleset: Ruleset, state: GameState, seats: Seats, partial: JsonObject | null): SeatStep {
  const point = decisionPoint(engine, ruleset, state);
  if (point.kind === "auto" || point.kind === "none") throw new RangeError("No player decision is open.");
  const rng = new SearchRng(Number.parseInt(canonicalHash(state).slice(0, 8), 16));
  let n = 0;
  const decide = (kind: DecisionKind, faction: FactionId, extra: { stateRedeploy?: JsonObject; stateLegalPolitics?: JsonObject }) => {
    const id = seats[faction];
    if (id === undefined) throw new RangeError(`The ${faction} seat is human.`);
    const common = { id: `d${String(state.meta.stateSeq)}.${String(n++)}`, kind, faction, player: id, card: state.deck.currentCard, phase: state.turn.phase, round: state.turn.propagandaRound, firstEligible: state.initiative.firstEligible };
    const d = decideObserved(engine, ruleset, state, seatPlayer(id), kind, extra, rng, common);
    return { command: d.command, record: withReview(d.record, d.candidates) };
  };
  const pkkKind: DecisionKind = point.kind === "redeployState" ? "redeployPkk" : "legalPoliticsPkk";
  if (partial !== null) {
    if (!JOINT_STATE.has(point.kind) || seats["state"] !== undefined) throw new RangeError("Only a human State part of Redeploy or Legal Politics takes a partial choice.");
    const second = decide(pkkKind, "pkk", statePart(point.kind, partial));
    return { command: second.command, partial: null, options: null, records: [second.record] };
  }
  if (!JOINT_STATE.has(point.kind)) {
    const d = decide(point.kind, point.faction, point.kind === "legalPoliticsPkk" ? { stateLegalPolitics: {} } : {});
    return { command: d.command, partial: null, options: null, records: [d.record] };
  }
  const first = decide(point.kind, "state", {});
  const extra = statePart(point.kind, choiceOf(first.command));
  if (seats["pkk"] !== undefined) {
    const second = decide(pkkKind, "pkk", extra);
    return { command: second.command, partial: null, options: null, records: [first.record, second.record] };
  }
  // A human PKK always routes its own Redeploy (generated routes are a pruned sample). Legal
  // Politics answers are few and complete (pkkLegalChoices): with one, the human has nothing to add.
  if (point.kind === "redeployState") return { command: null, partial: choiceOf(first.command), options: null, records: [first.record] };
  const pkkOptions = generateCandidates(engine, ruleset, state, pkkKind, "pkk", { familyCap: 14, broad: false, ...extra }).candidates;
  if (pkkOptions.length <= 1) return { command: pkkOptions[0]?.command ?? first.command, partial: null, options: null, records: [first.record] };
  return { command: null, partial: choiceOf(first.command), options: pkkOptions.map((c) => choiceOf(c.command)), records: [first.record] };
}
