// sessions and branches (06 s3.2, s3.3). A session starts with its main branch and its setup action.
import { json, now } from "../common.ts";
import type { Db } from "../migrate.ts";
import { ulid } from "../ulid.ts";
import { commitAction, getAction, type ActionInput, type CommitResult } from "./actions.ts";

export interface SessionInput {
  readonly name: string;
  /** Must already be in package_versions (savePackageVersion). */
  readonly packageHash: string;
  readonly scenarioId: string;
  readonly seed: number;
  readonly options: unknown;
  readonly appVersion: string;
  readonly codeFingerprint: string;
  /** `id@semver` and source hash per module. */
  readonly modules: unknown;
  readonly excludedCards: unknown;
}

export interface SessionRow {
  readonly session_id: string;
  readonly name: string;
  readonly package_hash: string;
  readonly scenario_id: string;
  readonly seed: number;
  readonly options: string;
  readonly app_version: string;
  readonly code_fingerprint: string;
  readonly modules: string;
  readonly excluded_cards: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly status: "active" | "ended" | "abandoned" | "readOnly";
  readonly current_branch_id: string;
  readonly head_action_id: string | null;
  readonly result: string | null;
  readonly notes: string;
}

export interface CreatedSession extends CommitResult {
  readonly sessionId: string;
  readonly branchId: string;
}

/** Session, main branch and setup action (kind `setup`) in one transaction. */
export function createSession(db: Db, input: SessionInput, setup: Omit<ActionInput, "sessionId" | "kind" | "stateHashBefore">): CreatedSession {
  return db.transaction((): CreatedSession => {
    const sessionId = ulid();
    const branchId = ulid();
    const at = now();
    db.prepare(
      `INSERT INTO sessions (session_id, name, package_hash, scenario_id, seed, options, app_version, code_fingerprint, modules,
         excluded_cards, created_at, updated_at, status, current_branch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
    ).run(
      sessionId, input.name, input.packageHash, input.scenarioId, input.seed, json(input.options), input.appVersion,
      input.codeFingerprint, json(input.modules), json(input.excludedCards), at, at, branchId,
    );
    db.prepare("INSERT INTO branches (branch_id, session_id, forked_from_action_id, label, created_at) VALUES (?, ?, NULL, 'main', ?)").run(branchId, sessionId, at);
    const commit = commitAction(db, { ...setup, sessionId, kind: "setup", stateHashBefore: null });
    return { sessionId, branchId, ...commit };
  })();
}

export function getSession(db: Db, sessionId: string): SessionRow | null {
  return (db.prepare("SELECT * FROM sessions WHERE session_id = ?").get(sessionId) as SessionRow | undefined) ?? null;
}

/**
 * Fork a branch at a past action of the session (11 P4-04; 09 s7): a new branch row, then the session's
 * current branch and head move to that action's state. `result` is that state's end result, if any.
 * Earlier branches keep every row. The caller refuses a state with an open Operation.
 */
export function createBranch(db: Db, input: { sessionId: string; actionId: string; result: string | null }): string {
  return db.transaction((): string => {
    const action = getAction(db, input.actionId);
    if (action?.session_id !== input.sessionId) throw new RangeError(`Unknown action "${input.actionId}".`);
    const branchId = ulid();
    const at = now();
    const { n } = db.prepare("SELECT COUNT(*) + 1 AS n FROM branches WHERE session_id = ?").get(input.sessionId) as { n: number };
    db.prepare("INSERT INTO branches (branch_id, session_id, forked_from_action_id, label, created_at) VALUES (?, ?, ?, ?, ?)").run(branchId, input.sessionId, input.actionId, `branch ${String(n)}`, at);
    db.prepare("UPDATE sessions SET current_branch_id = ?, head_action_id = ?, status = ?, result = ?, updated_at = ? WHERE session_id = ?")
      .run(branchId, input.actionId, input.result === null ? "active" : "ended", input.result, at, input.sessionId);
    return branchId;
  })();
}
