// One experiment game (19 s5, s7, s9; 20 Phases 2 to 6). The trusted runner owns the live state.
// Each decision: observation -> candidates on a public projection -> live validation -> player
// choice -> engine apply. Every applied command is emitted at once with its state hash, so the
// parent can persist a replayable prefix. Failures end the game as incomplete, never as a loss.
import { canonicalHash } from "../engine/core/canonical.ts";
import type { AnyCommand, FactionId, GameState, JsonObject, Ruleset } from "../engine/core/types.ts";
import type { Engine } from "../engine/index.ts";
import { checkStandings } from "../engine/coin/victory.ts";
import { derive } from "../engine/coin/derive.ts";
import { count, markers, resources } from "../engine/coin/ops/common.ts";
import { decisionPoint, generateCandidates, type CandidateSet, type DecisionKind } from "./candidates.ts";
import { determinize, observe, SearchRng } from "./player-observation.ts";
import { isObservationPlayer, TransitionBudget, type Player } from "./players.ts";

export interface GameJob {
  readonly gameId: string;
  readonly seed: number;
  readonly conditionId: string;
  readonly players: Readonly<Record<FactionId, string>>;
  readonly playerSeeds: Readonly<Record<FactionId, number>>;
  readonly repeat: number;
}

export interface Limits {
  readonly commands: number;
  /** A decision slower than this ends the game as incomplete (19 s7). Null: no limit. */
  readonly decisionMs: number | null;
}

export type GameStatus = "complete" | "failed" | "commandLimit" | "decisionTimeLimit" | "timeout" | "workerError";

export interface DecisionRecord {
  readonly id: string;
  readonly kind: DecisionKind;
  readonly faction: FactionId;
  readonly player: string;
  readonly observationHash: string | null;
  readonly card: string | null;
  readonly phase: string;
  readonly round: number;
  readonly firstEligible: string | null;
  readonly candidates: number;
  readonly families: CandidateSet["families"] | null;
  readonly rejectedSample: CandidateSet["rejected"];
  /** Candidates valid on the public projection but rejected on the live state (privacy/validation diagnostic). */
  readonly liveRejected: number;
  readonly selected: string | null;
  readonly family: string | null;
  readonly value: number | null;
  readonly components: Readonly<Record<string, number>>;
  readonly topAlternative: { readonly id: string; readonly value: number } | null;
  readonly transitions: number;
  readonly ms: number;
  readonly notes: readonly string[];
}

export interface Checkpoint {
  readonly when: "before" | "after";
  readonly round: number;
  readonly data: JsonObject;
}

export type JournalEvent =
  | { readonly t: "start"; readonly gameId: string; readonly seed: number; readonly startHash: string; readonly job: GameJob; readonly deck: readonly (readonly string[])[] }
  | { readonly t: "step"; readonly i: number; readonly command: AnyCommand; readonly hash: string; readonly auto: string | null; readonly decisions: readonly DecisionRecord[]; readonly checkpoints: readonly Checkpoint[] }
  | { readonly t: "end"; readonly status: GameStatus; readonly reason: string; readonly result: GameResultRecord | null; readonly commands: number; readonly finalHash: string; readonly ms: number };

export interface GameResultRecord {
  readonly winner: FactionId | null;
  readonly endReason: string;
  readonly round: number;
  readonly labels: readonly string[];
  readonly standings: readonly { readonly faction: string; readonly score: number; readonly harm: number; readonly margin: number }[];
  readonly cardsPlayed: readonly string[];
}

/** Public snapshot at a Propaganda boundary (19 s9 checkpoint level). */
export function snapshot(r: Ruleset, s: GameState): JsonObject {
  const view = derive(r, s);
  const home = r.spaces.filter((x) => x.kind === "domestic");
  const ext = r.spaces.filter((x) => x.kind === "external");
  const markerTotals = Object.fromEntries(["stateHarm", "pkkHarm", "disputedHarm", "coercion", "reception", "displacement"].map((m) => [m, r.spaces.reduce((n, x) => n + markers(s, x.id, m), 0)]));
  return {
    resources: { state: resources(r, s, "state"), pkk: resources(r, s, "pkk") },
    totals: view.totals,
    pkkBases: { domestic: home.reduce((n, x) => n + count(s, x.id, "pkkBase"), 0), external: ext.reduce((n, x) => n + count(s, x.id, "pkkBase"), 0) },
    legitimacy: Number(s.tracks["legitimacy"]),
    europe: Number(s.tracks["europe"]),
    emergencyRule: String(s.tracks["emergencyRule"]),
    postures: { syria: String(s.tracks["posture.syria"]), kdp: String(s.tracks["posture.kdp"]), puk: String(s.tracks["posture.puk"]) },
    markers: markerTotals,
    scores: view.scores,
    harm: view.harm,
    checkMargins: Object.fromEntries(checkStandings(r, s, false).map((x) => [x.faction, x.margin])),
    finalMargins: Object.fromEntries(checkStandings(r, s, true).map((x) => [x.faction, x.margin])),
    qualifies: Object.fromEntries(checkStandings(r, s, false).map((x) => [x.faction, x.margin >= 0 && x.harm <= 6])), // literal-ok: Scenario A Harm limit, validated at manifest load
  };
}

class GameFailure extends Error {
  readonly status: GameStatus;
  constructor(status: GameStatus, message: string) {
    super(message);
    this.status = status;
  }
}

function result(r: Ruleset, s: GameState): GameResultRecord | null {
  if (s.ended === null) return null;
  const final = s.ended.reason === "final scoring";
  return {
    winner: s.ended.winner, endReason: s.ended.reason, round: s.turn.propagandaRound, labels: s.ended.labels,
    standings: checkStandings(r, s, final).map((x) => ({ faction: x.faction, score: x.score, harm: x.harm, margin: x.margin })),
    cardsPlayed: [...s.deck.played, ...(s.deck.currentCard === null ? [] : [s.deck.currentCard])],
  };
}

/**
 * Play one game and emit journal events. `resolve` maps a player ID to a Player; it must give a
 * player of the seat's faction (no cross-faction substitution, 19 s7). Never throws for game
 * failures: they end with an explicit status and the valid prefix already emitted.
 */
export function runGame(engine: Engine, ruleset: Ruleset, scenario: string, job: GameJob, resolve: (id: string) => Player, limits: Limits, emit: (e: JournalEvent) => void, clock: () => number = () => performance.now()): GameStatus {
  const t0 = clock();
  const start = engine.start(ruleset, scenario, job.seed);
  let state = start.state;
  let hash = start.stateHash;
  let i = 0;
  emit({ t: "start", gameId: job.gameId, seed: job.seed, startHash: start.stateHash, job, deck: state.deck.piles });
  const players: Record<string, Player> = {};
  for (const [faction, id] of Object.entries(job.players)) {
    const p = resolve(id);
    if (p.spec.faction !== faction) throw new RangeError(`${id} plays ${p.spec.faction}, not ${faction}`);
    players[faction] = p;
  }
  const rngs: Record<string, SearchRng> = Object.fromEntries(Object.entries(job.playerSeeds).map(([f, seed]) => [f, new SearchRng(seed)]));
  let decisionCount = 0;

  const decide = (kind: DecisionKind, faction: FactionId, extra: { stateRedeploy?: JsonObject }): { command: AnyCommand; record: DecisionRecord } => {
    const player = players[faction];
    if (player === undefined) throw new GameFailure("failed", `no player for ${faction}`);
    const id = `${job.gameId}:d${String(decisionCount++)}`;
    const common = { id, kind, faction, player: player.spec.id, card: state.deck.currentCard, phase: state.turn.phase, round: state.turn.propagandaRound, firstEligible: state.initiative.firstEligible };
    const t = clock();
    if (!isObservationPlayer(player)) {
      // Legacy control: reads the live state (labeled unqualified, 19 s4).
      const command = player.act(engine, ruleset, state);
      return { command, record: { ...common, observationHash: null, candidates: 0, families: null, rejectedSample: [], liveRejected: 0, selected: null, family: null, value: null, components: {}, topAlternative: null, transitions: 0, ms: clock() - t, notes: ["full-state control"] } };
    }
    const observation = observe(state, faction);
    const projection = determinize(ruleset, observation, new SearchRng(0));
    const generated = generateCandidates(engine, ruleset, projection, kind, faction, { familyCap: 14, broad: false, ...(extra.stateRedeploy === undefined ? {} : { stateRedeploy: extra.stateRedeploy }) });
    const live = generated.candidates.filter((c) => engine.validate(ruleset, state, c.command).ok);
    const base = { ...common, observationHash: canonicalHash(observation), candidates: live.length, families: generated.families, rejectedSample: generated.rejected, liveRejected: generated.candidates.length - live.length };
    if (live.length === 0) throw new GameFailure("failed", `empty candidate set for ${kind} (${faction}); families ${JSON.stringify(generated.families)}`);
    const budget = new TransitionBudget(engine, player.spec.budget);
    let choice;
    try {
      choice = player.decide({ decisionId: id, kind, faction, observation, candidates: live }, { engine, ruleset, rng: rngs[faction] ?? new SearchRng(0), budget });
    } catch (e) {
      throw new GameFailure("failed", `player ${player.spec.id} failed at ${kind}: ${e instanceof Error ? e.message : String(e)}`);
    }
    const ms = clock() - t;
    const picked = live.find((c) => c.id === choice.candidateId);
    if (picked === undefined) throw new GameFailure("failed", `player ${player.spec.id} chose unknown candidate ${choice.candidateId}`);
    if (limits.decisionMs !== null && ms > limits.decisionMs) throw new GameFailure("decisionTimeLimit", `decision ${id} took ${ms.toFixed(0)} ms`);
    return { command: picked.command, record: { ...base, selected: picked.id, family: picked.family, value: choice.value, components: choice.components, topAlternative: choice.topAlternative, transitions: budget.used, ms, notes: choice.notes } };
  };

  try {
    while (state.ended === null) {
      if (i >= limits.commands) throw new GameFailure("commandLimit", `reached ${String(limits.commands)} commands`);
      const point = decisionPoint(engine, ruleset, state);
      let command: AnyCommand;
      const decisions: DecisionRecord[] = [];
      if (point.kind === "none") throw new GameFailure("failed", `stall: ${point.reason}`);
      if (point.kind === "auto") {
        command = point.command;
      } else if (point.kind === "redeployState") {
        const first = decide("redeployState", "state", {});
        decisions.push(first.record);
        const choice = (first.command["choice"] ?? {}) as JsonObject;
        const pkkPlayer = players["pkk"];
        if (pkkPlayer !== undefined && isObservationPlayer(pkkPlayer)) {
          const second = decide("redeployPkk", "pkk", { stateRedeploy: { troops: choice["troops"] ?? [], police: choice["police"] ?? [] } });
          decisions.push(second.record);
          command = second.command;
        } else {
          command = first.command;
        }
      } else {
        const d = decide(point.kind, point.faction, {});
        decisions.push(d.record);
        command = d.command;
      }
      const roundBefore = state.turn.propagandaRound;
      const phaseBefore = state.turn.phase;
      const applied = engine.apply(ruleset, state, command);
      if (!applied.ok) throw new GameFailure("failed", `illegal submitted ${command.type}: ${applied.validation.violations.map((v) => v.code).join(",")}`);
      const next = applied.transition.state;
      const checkpoints: Checkpoint[] = [];
      if (next.turn.propagandaRound > roundBefore) checkpoints.push({ when: "before", round: next.turn.propagandaRound, data: snapshot(ruleset, next) });
      if (phaseBefore === "propaganda" && (next.turn.phase !== "propaganda" || next.ended !== null)) checkpoints.push({ when: "after", round: roundBefore, data: snapshot(ruleset, next) });
      state = next;
      hash = applied.transition.stateHash;
      emit({ t: "step", i, command, hash, auto: point.kind === "auto" ? point.reason : null, decisions, checkpoints });
      i++;
    }
    emit({ t: "end", status: "complete", reason: state.ended.reason, result: result(ruleset, state), commands: i, finalHash: hash, ms: clock() - t0 });
    return "complete";
  } catch (e) {
    const status = e instanceof GameFailure ? e.status : "failed";
    emit({ t: "end", status, reason: e instanceof Error ? e.message : String(e), result: null, commands: i, finalHash: hash, ms: clock() - t0 });
    return status;
  }
}
