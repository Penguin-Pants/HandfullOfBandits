// `sim replay <sessionId|file>` (11 P2-12): replay a stored session or a golden file and compare
// the state hash after every action. Prints "identical" or the first differing step.
import { existsSync, readFileSync } from "node:fs";
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
    const { startHash, steps } = storedSteps(db, session.current_branch_id);
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
