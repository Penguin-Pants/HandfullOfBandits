// Experiment worker (20 Phase 2): plays one game at a time in a worker thread, so the parent can
// stop a game that hangs in synchronous player code. Every journal event goes to the parent at once.
import { parentPort, workerData } from "node:worker_threads";
import { coinHandlers } from "../engine/coin/handlers.ts";
import type { Ruleset } from "../engine/core/types.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, withSessionOptions } from "../package/load.ts";
import { runGame, type GameJob, type Limits } from "./game-runner.ts";
import { resolvePlayer } from "./player-registry.ts";

export interface WorkerInit {
  readonly packageFiles: Record<string, unknown>;
  readonly packageHash: string;
  readonly scenario: string;
  readonly conditions: Readonly<Record<string, Readonly<Record<string, string>>>>;
  readonly limits: Limits;
}

export interface WorkerMessage { readonly job: GameJob }

const init = workerData as WorkerInit;
const loaded = loadPackage({ files: init.packageFiles, issues: [] });
if (!loaded.ok || loaded.hash !== init.packageHash) throw new Error("Worker package does not load or its hash differs");
const base = loaded.ruleset;
const rulesets: Record<string, Ruleset> = Object.fromEntries(Object.entries(init.conditions).map(([id, options]) => [id, withSessionOptions(base, init.scenario, options)]));
const engine = createEngine(coinHandlers);
const port = parentPort;
if (port === null) throw new Error("experiment-worker must run in a worker thread");

port.on("message", (message: WorkerMessage) => {
  const ruleset = rulesets[message.job.conditionId];
  if (ruleset === undefined) throw new Error(`Unknown condition ${message.job.conditionId}`);
  runGame(engine, ruleset, init.scenario, message.job, resolvePlayer, init.limits, (event) => { port.postMessage(event); });
});
