// Paired strategy runs (P3a-09; research 12 s7 and s9; DEC-58).
import type { Engine } from "../engine/index.ts";
import type { JsonObject, JsonValue, Ruleset } from "../engine/core/types.ts";
import { strategy, decisionFaction, resumeOperation } from "./strategies/index.ts";
import { scriptedPolicy } from "./play.ts";
export interface BatchOptions {readonly games: number; readonly strategies: readonly [string,string]; readonly swapSeats: boolean; readonly seed?: number; readonly scenario?: string;}
export interface BatchGame {readonly seed: number; readonly swapped: boolean; readonly stateStrategy: string; readonly pkkStrategy: string; readonly winner: string | null; readonly rounds: number;}
export interface BatchReport {readonly games: readonly BatchGame[]; readonly csv: string; readonly summary: readonly string[];}
const HEADERS = "game,seed,swapped,state_strategy,pkk_strategy,round,campaign,state_score,pkk_score,state_margin,pkk_margin,state_harm,pkk_harm,state_income,pkk_income,state_resources,pkk_resources,legitimacy,europe,emergency_rule,syria,kdp,puk,winner";
const object = (v: JsonValue | undefined): JsonObject => typeof v === "object" && v !== null && !Array.isArray(v) ? v as JsonObject : {};
const cell = (v: JsonValue | undefined): string => {const s = v === undefined || v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\r\n]/.test(s) ? `"${s.replaceAll('"','""')}"` : s;};
export function runBatch(engine: Engine, r: Ruleset, o: BatchOptions): BatchReport {
  if (!Number.isSafeInteger(o.games) || o.games < 1) throw new RangeError("games must be a positive safe integer");
  const initialSeed = o.seed ?? 0;
  if (!Number.isSafeInteger(initialSeed) || initialSeed < 0 || !Number.isSafeInteger(initialSeed+o.games)) throw new RangeError("seed range must contain non-negative safe integers");
  const policies = o.strategies.map(strategy);
  const games: BatchGame[] = [];
  const rows = [HEADERS];
  for (let i = 0; i < o.games; i++) {
    const swapped = o.swapSeats && i % 2 === 1;
    const seed = initialSeed + (o.swapSeats ? Math.floor(i/2) : i);
    const stateIndex = swapped ? 1 : 0, pkkIndex = swapped ? 0 : 1;
    let state = engine.start(r,o.scenario ?? "scenario-a",seed).state;
    const metrics: JsonObject[] = [];
    let steps = 0;
    while (state.ended === null) {
      if (steps++ >= 2000) throw new Error(`Game ${String(i+1)} seed ${String(seed)} exceeded 2000 commands`);
      const faction = decisionFaction(r,state);
      const policy = policies[faction === "pkk" ? pkkIndex : stateIndex] ?? scriptedPolicy;
      const command = resumeOperation(engine,r,state) ?? policy(engine,r,state);
      const result = engine.apply(r,state,command);
      if (!result.ok) throw new Error(`Game ${String(i+1)} seed ${String(seed)}: ${JSON.stringify(result.validation.violations)}`);
      state = result.transition.state;
      for (const e of result.transition.logEntries) if (e.kind === "RoundMetrics") metrics.push(e.data);
    }
    const game: BatchGame = {seed,swapped,stateStrategy: o.strategies[stateIndex],pkkStrategy: o.strategies[pkkIndex],winner: state.ended.winner,rounds: state.turn.propagandaRound};
    games.push(game);
    for (const m of metrics) {
      const columns: (JsonValue | undefined)[] = [i+1,seed,swapped,game.stateStrategy,game.pkkStrategy,m["round"],m["campaign"]];
      for (const key of ["scores","margins","harm","income","resources"]) columns.push(object(m[key])["state"],object(m[key])["pkk"]);
      columns.push(m["legitimacy"],m["europe"],m["emergencyRule"],object(m["postures"])["syria"],object(m["postures"])["kdp"],object(m["postures"])["puk"],game.winner);
      rows.push(columns.map(cell).join(","));
    }
  }
  const summary: string[] = [];
  for (const [id,label] of [["state","State"],["pkk","PKK"]] as const) {
    const wins = games.filter(g => g.winner === id).length;
    summary.push(`${label}: ${String(wins)}/${String(games.length)} wins (${(100*wins/games.length).toFixed(1)}%)${games.length >= 10 && wins/games.length >= .8 ? " FLAG: at least 8 wins in 10 (research 12 s9)" : ""}`);
  }
  summary.push(`Draws: ${String(games.filter(g => g.winner === null).length)}. Swapped policies use the scripted legal fallback for their other faction. Results are screens, not balance proof.`);
  return {games,csv: `${rows.join("\n")}\n`,summary};
}
