// Experiment runner (19 s2, s7, s9; 20 Phases 1 and 2): validate and freeze a manifest, then play
// every scheduled game in supervised worker threads and record durable artifacts. A failed,
// stalled or limited game is recorded as incomplete with its valid prefix; other games continue.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Worker } from "node:worker_threads";
import { canonicalJson } from "../engine/core/canonical.ts";
import { packageContent } from "../package/load.ts";
import { Artifacts, fsWriter, readJournal, type ArtifactWriter } from "./experiment-artifacts.ts";
import { freezeExperiment, parseManifest } from "./experiment-manifest.ts";
import type { GameJob, GameResultRecord, GameStatus, JournalEvent } from "./game-runner.ts";
import type { WorkerInit } from "./experiment-worker.ts";

export const ARTIFACT_VERSION = 1;

/** One line of results.json: everything the analysis needs without reading journals. */
export interface GameRecord {
  readonly gameId: string;
  readonly conditionId: string;
  readonly state: string;
  readonly pkk: string;
  readonly seed: number;
  readonly repeat: number;
  readonly status: GameStatus;
  readonly reason: string;
  readonly result: GameResultRecord | null;
  readonly commands: number;
  readonly startHash: string;
  readonly finalHash: string;
  readonly ms: number;
  readonly decisions: number;
  readonly transitions: number;
  readonly liveRejected: number;
}

export interface ExperimentOutcome {
  readonly dir: string;
  readonly experimentHash: string;
  readonly scheduled: number;
  readonly byStatus: Readonly<Record<string, number>>;
}

interface Progress { decisions: number; transitions: number; liveRejected: number; startHash: string; lastHash: string; commands: number }
interface Resume { readonly at: string; readonly kept: number; readonly gitCommit: string }

function record(job: GameJob, progress: Progress, end: Extract<JournalEvent, { t: "end" }>): GameRecord {
  return { gameId: job.gameId, conditionId: job.conditionId, state: job.players["state"] ?? "", pkk: job.players["pkk"] ?? "", seed: job.seed, repeat: job.repeat, status: end.status, reason: end.reason, result: end.result, commands: end.commands, startHash: progress.startHash, finalHash: end.finalHash, ms: end.ms, decisions: progress.decisions, transitions: progress.transitions, liveRejected: progress.liveRejected };
}

/** The record of a game from its sealed journal, or null when the journal has no end event. */
function recordFromJournal(job: GameJob, events: readonly JournalEvent[]): GameRecord | null {
  const progress: Progress = { decisions: 0, transitions: 0, liveRejected: 0, startHash: "", lastHash: "", commands: 0 };
  let end: Extract<JournalEvent, { t: "end" }> | null = null;
  for (const e of events) {
    if (e.t === "start") progress.startHash = e.startHash;
    if (e.t === "step") for (const d of e.decisions) { progress.decisions++; progress.transitions += d.transitions; progress.liveRejected += d.liveRejected; }
    if (e.t === "end") end = e;
  }
  return end === null ? null : record(job, progress, end);
}

/**
 * Run `manifestFile` into the new directory `outDir`. Rejects before creating the directory when
 * the manifest is invalid or the directory exists. With `resume`, continues an interrupted run in
 * `outDir` instead: games with a sealed journal are kept, unfinished journals are discarded and
 * those games play again from the start. Games are deterministic, so the results equal an
 * uninterrupted run. `workerUrl` exists for tests only.
 */
export async function runExperiment(manifestFile: string, outDir: string, options: { readonly writer?: ArtifactWriter; readonly log?: (line: string) => void; readonly workerUrl?: URL; readonly resume?: boolean } = {}): Promise<ExperimentOutcome> {
  const dir = resolve(outDir);
  if (options.resume !== true && existsSync(dir)) throw new Error(`Output ${dir} already exists; choose a new directory or pass --resume`);
  const manifest = parseManifest(readFileSync(manifestFile, "utf8"));
  const frozen = freezeExperiment(manifest, dirname(resolve(manifestFile)));
  const artifacts = new Artifacts(dir, options.writer ?? fsWriter);
  const conditions = Object.fromEntries(manifest.conditions.map((c) => [c.id, c.options]));
  const records = new Map<string, GameRecord>();
  const log = options.log ?? ((): void => undefined);
  let started = new Date().toISOString();
  let experimentHash = frozen.experimentHash;
  let resumes: Resume[] = [];
  if (options.resume === true) {
    const read = (name: string): Record<string, unknown> => JSON.parse(readFileSync(join(dir, name), "utf8")) as Record<string, unknown>;
    if (!existsSync(join(dir, "status.json"))) throw new Error(`Output ${dir} has no interrupted run; nothing to resume`);
    const status = read("status.json");
    if (status["state"] === "complete") throw new Error(`Output ${dir} is already complete; nothing to resume`);
    if (canonicalJson(read("manifest.json")) !== canonicalJson(manifest)) throw new Error(`Output ${dir} was started from a different manifest`);
    // The frozen code identity must match; the commit may differ (for example a runner fix).
    const identity = read("identity.json") as { experimentHash: string; runtime: { engineFingerprint: string; playerFingerprint: string; generatorVersion: string }; packageHash: string; started: string };
    for (const key of ["engineFingerprint", "playerFingerprint", "generatorVersion"] as const) if (identity.runtime[key] !== frozen.runtime[key]) throw new Error(`Output ${dir}: ${key} changed since the run started; it cannot be resumed`);
    if (identity.packageHash !== frozen.packageContentHash) throw new Error(`Output ${dir}: the package changed since the run started; it cannot be resumed`);
    // The recorded identity stays the run's identity, even after a runner-only commit.
    started = identity.started;
    experimentHash = identity.experimentHash;
    for (const job of frozen.jobs) {
      const kept = artifacts.sealed(job.gameId) ? recordFromJournal(job, readJournal(dir, job.gameId)) : null;
      if (kept === null) artifacts.discard(job.gameId);
      else records.set(job.gameId, kept);
    }
    resumes = [...((status["resumes"] as Resume[] | undefined) ?? []), { at: new Date().toISOString(), kept: records.size, gitCommit: frozen.runtime.gitCommit }];
    log(`resuming: ${String(records.size)} of ${String(frozen.jobs.length)} games kept`);
  } else {
    artifacts.create();
    artifacts.json("manifest.json", manifest);
    artifacts.json("identity.json", { artifactVersion: ARTIFACT_VERSION, experimentHash: frozen.experimentHash, runtime: frozen.runtime, packageHash: frozen.packageContentHash, scenario: manifest.scenario, conditions, started });
    artifacts.json("players.json", frozen.players);
    artifacts.json("package-content.json", packageContent(frozen.data));
    artifacts.json("schedule.json", frozen.jobs);
  }
  const extra = resumes.length > 0 ? { resumes } : {};
  artifacts.json("status.json", { state: "running", scheduled: frozen.jobs.length, started, ...extra });

  const init: WorkerInit = { packageFiles: packageContent(frozen.data), packageHash: frozen.packageContentHash, scenario: manifest.scenario, conditions, limits: { commands: manifest.limits.commands, decisionMs: manifest.limits.decisionMs } };
  const queue = frozen.jobs.filter((j) => !records.has(j.gameId));
  const workerUrl = options.workerUrl ?? new URL("./experiment-worker.ts", import.meta.url);

  await new Promise<void>((done, fail) => {
    let active = 0;
    let aborted = false;
    // Every running game, so an abort stops all workers and timers, not only the failing one.
    const running = new Map<Worker, ReturnType<typeof setTimeout>>();
    const abort = (e: unknown): void => {
      if (aborted) return;
      aborted = true;
      const stops = [...running].map(([w, t]) => { clearTimeout(t); for (const name of ["message", "error", "exit"]) w.removeAllListeners(name); return w.terminate(); });
      running.clear();
      try { artifacts.json("status.json", { state: "aborted", scheduled: frozen.jobs.length, recorded: records.size, error: e instanceof Error ? e.message : String(e), started, ...extra }); } catch { /* the disk may be the failure */ }
      void Promise.allSettled(stops).then(() => { fail(e instanceof Error ? e : new Error(String(e))); });
    };
    const finish = (job: GameJob, progress: Progress, end: Extract<JournalEvent, { t: "end" }>): void => {
      artifacts.journal(job.gameId, end);
      artifacts.seal(job.gameId);
      records.set(job.gameId, record(job, progress, end));
      log(`${String(records.size)}/${String(frozen.jobs.length)} ${job.gameId} ${end.status}${end.result === null ? "" : ` ${end.result.winner ?? "draw"}`}`);
    };
    // One worker per slot, reused across games; replaced after a timeout or a crash.
    const slot = (reuse: Worker | null): void => {
      if (aborted) { void reuse?.terminate(); return; }
      const job = queue.shift();
      if (job === undefined) {
        void reuse?.terminate();
        if (--active === 0) done();
        return;
      }
      const worker = reuse ?? new Worker(workerUrl, { workerData: init });
      const progress: Progress = { decisions: 0, transitions: 0, liveRejected: 0, startHash: "", lastHash: "", commands: 0 };
      let settled = false;
      const close = (end: Extract<JournalEvent, { t: "end" }> | null, healthy: boolean): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        running.delete(worker);
        for (const name of ["message", "error", "exit"]) worker.removeAllListeners(name);
        if (!healthy) void worker.terminate();
        try {
          if (end !== null) finish(job, progress, end);
        } catch (e) {
          void worker.terminate();
          abort(e);
          return;
        }
        slot(healthy ? worker : null);
      };
      const failure = (status: GameStatus, reason: string): Extract<JournalEvent, { t: "end" }> => ({ t: "end", status, reason, result: null, commands: progress.commands, finalHash: progress.lastHash, ms: manifest.limits.gameMs });
      const timer = setTimeout(() => { close(failure("timeout", `game exceeded ${String(manifest.limits.gameMs)} ms; worker terminated`), false); }, manifest.limits.gameMs);
      running.set(worker, timer);
      worker.on("message", (event: JournalEvent) => {
        if (settled) return;
        try {
          if (event.t === "end") { close(event, true); return; }
          if (event.t === "start") { progress.startHash = event.startHash; progress.lastHash = event.startHash; }
          if (event.t === "step") {
            progress.commands = event.i + 1;
            progress.lastHash = event.hash;
            for (const d of event.decisions) { progress.decisions++; progress.transitions += d.transitions; progress.liveRejected += d.liveRejected; }
          }
          artifacts.journal(job.gameId, event);
        } catch (e) {
          settled = true;
          clearTimeout(timer);
          void worker.terminate();
          abort(e);
        }
      });
      worker.on("error", (e: Error) => { close(failure("workerError", `worker error: ${e.message}`), false); });
      worker.on("exit", (code) => { close(failure("workerError", `worker exited with code ${String(code)} before the game ended`), false); });
      worker.postMessage({ job });
    };
    active = Math.min(manifest.concurrency, queue.length);
    if (active === 0) done();
    for (let i = 0; i < active; i++) slot(null);
  });

  const ordered = frozen.jobs.map((j) => records.get(j.gameId)).filter((r): r is GameRecord => r !== undefined);
  const byStatus: Record<string, number> = {};
  for (const r of ordered) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  artifacts.json("results.json", ordered);
  artifacts.json("failures.json", ordered.filter((r) => r.status !== "complete").map((r) => ({ gameId: r.gameId, status: r.status, reason: r.reason, replayablePrefix: r.commands })));
  artifacts.json("status.json", { state: "complete", scheduled: frozen.jobs.length, recorded: ordered.length, byStatus, started, finished: new Date().toISOString(), ...extra });
  return { dir, experimentHash, scheduled: frozen.jobs.length, byStatus };
}
