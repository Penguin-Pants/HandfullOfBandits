// `sim replay <sessionId|file>` (11 P2-12): replay a stored session or a golden file and compare
// the state hash after every action. Prints "identical" or the first differing step.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { codeFingerprint } from "../package/fingerprint.ts";
import { readArchive, readJournal } from "./experiment-artifacts.ts";
import type { GameJob } from "./game-runner.ts";
import type { AnyCommand } from "../engine/core/types.ts";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, readPackageDir, withSessionOptions } from "../package/load.ts";
import { replaySteps } from "../engine/replay.ts";
import { storedSteps } from "../store/repos/actions.ts";
import { loadPackageContent } from "../store/repos/packages.ts";
import { getSession } from "../store/repos/sessions.ts";
import { openStore } from "../store/migrate.ts";
import { replay, type PlayRecord } from "./play.ts";

/** Replay a PlayRecord file against the package in `packageDir`. */
export function replayFile(file: string, packageDir: string): { exitCode: number; lines: string[] } {
  const record = JSON.parse(readFileSync(file, "utf8")) as PlayRecord;
  const loaded = loadPackage(readPackageDir(packageDir));
  if (!loaded.ok) return { exitCode: 1, lines: ["error: the package does not load"] };
  return report(replay(createEngine(coinHandlers), loaded.ruleset, record), record.commands.length);
}

/** Replay a stored session from its own stored package (04 s10.3). */
export function replaySession(sessionId: string, dbFile: string): { exitCode: number; lines: string[] } {
  if (!existsSync(dbFile)) return { exitCode: 1, lines: [`error: no store at ${dbFile}`] };
  const db = openStore(dbFile);
  try {
    const session = getSession(db, sessionId);
    const content = session === null ? null : loadPackageContent(db, session.package_hash);
    if (session === null || content === null) return { exitCode: 1, lines: [`error: no session ${sessionId}`] };
    const loaded = loadPackage({ files: JSON.parse(content) as Record<string, unknown>, issues: [] });
    if (!loaded.ok) return { exitCode: 1, lines: ["error: the stored package does not load"] };
    const { startHash, steps } = storedSteps(db, session.head_action_id ?? "");
    const diff = replaySteps(createEngine(coinHandlers), withSessionOptions(loaded.ruleset, session.scenario_id, JSON.parse(session.options) as Record<string, string | number>), session.scenario_id, session.seed, startHash, steps);
    return diff === null ? { exitCode: 0, lines: [`identical (${String(steps.length)} actions)`] } : { exitCode: 1, lines: [`differs at action ${diff.id}: expected ${diff.expected}, got ${diff.actual}`] };
  } finally {
    db.close();
  }
}

function report(result: ReturnType<typeof replay>, steps: number): { exitCode: number; lines: string[] } {
  if (result === null) return { exitCode: 0, lines: [`identical (${String(steps)} commands)`] };
  return { exitCode: 1, lines: [`differs at step ${String(result.step)}: expected ${result.expected}, got ${result.actual}`] };
}

/**
 * Replay every game of an experiment directory from its captured package and options (20 Phase 2).
 * Checks the engine fingerprint and every state hash. Incomplete games replay their valid prefix.
 */
export function replayExperiment(dir: string, only: string | null = null): { exitCode: number; lines: string[] } {
  const identity = JSON.parse(readFileSync(join(dir, "identity.json"), "utf8")) as { packageHash: string; scenario: string; conditions: Record<string, Record<string, string>>; runtime: { engineFingerprint: string } };
  const lines: string[] = [];
  if (identity.runtime.engineFingerprint !== codeFingerprint()) lines.push(`warning: engine fingerprint differs from the recorded ${identity.runtime.engineFingerprint}; hashes decide`);
  const loaded = loadPackage({ files: JSON.parse(readFileSync(join(dir, "package-content.json"), "utf8")) as Record<string, unknown>, issues: [] });
  if (!loaded.ok || loaded.hash !== identity.packageHash) return { exitCode: 1, lines: [...lines, "error: the captured package does not load or its hash differs"] };
  const engine = createEngine(coinHandlers);
  const schedule = (JSON.parse(readFileSync(join(dir, "schedule.json"), "utf8")) as GameJob[]).filter((j) => only === null || j.gameId === only);
  let failed = 0;
  let identical = 0;
  const archive = readArchive(dir);
  const recorded = new Map((existsSync(join(dir, "results.json")) ? (JSON.parse(readFileSync(join(dir, "results.json"), "utf8")) as { gameId: string; commands: number; finalHash: string }[]) : []).map((r) => [r.gameId, r]));
  for (const job of schedule) {
    const events = readJournal(dir, job.gameId);
    const archived = archive?.get(job.gameId);
    const fromJournal = events.find((e) => e.t === "start");
    const startHash = fromJournal?.t === "start" ? fromJournal.startHash : archived?.startHash;
    const steps = events.length > 0 ? events.flatMap((e) => (e.t === "step" ? [{ id: String(e.i + 1), commands: [e.command], hashAfter: e.hash }] : [])) : (archived?.commands ?? []).map((c, i) => ({ id: String(i + 1), commands: [c as AnyCommand], hashAfter: archived?.hashes[i] ?? "" }));
    if (startHash === undefined) { lines.push(`${job.gameId}: no journal or archive entry`); failed++; continue; }
    const ruleset = withSessionOptions(loaded.ruleset, identity.scenario, identity.conditions[job.conditionId] ?? {});
    const diff = replaySteps(engine, ruleset, identity.scenario, job.seed, startHash, steps);
    if (diff !== null) { lines.push(`${job.gameId}: differs at step ${diff.id}: expected ${diff.expected}, got ${diff.actual}`); failed++; continue; }
    // A valid prefix is not a verified game: the steps must reach the recorded end.
    const record = recorded.get(job.gameId);
    const last = steps.at(-1)?.hashAfter ?? startHash;
    if (record !== undefined && (steps.length !== record.commands || last !== record.finalHash)) { lines.push(`${job.gameId}: incomplete replay: ${String(steps.length)} of ${String(record.commands)} recorded commands`); failed++; continue; }
    identical++;
  }
  lines.push(`${String(identical)}/${String(schedule.length)} games identical`);
  return { exitCode: failed === 0 ? 0 : 1, lines };
}
