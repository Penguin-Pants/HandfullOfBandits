// regression_cases and regression_runs (06 s3.10, s3.11; 09 s7; 11 P4-06).
import { json, now } from "../common.ts";
import type { Db } from "../migrate.ts";
import { ulid } from "../ulid.ts";

export type RunOutcome = "same" | "changed" | "incompatible" | "error";

export interface CaseInput {
  readonly sourceSessionId: string;
  readonly sourceActionId: string;
  readonly sourceAnnotationId: string | null;
  readonly packageHash: string;
  readonly seed: number;
  readonly scenarioId: string;
  /** Session options as stored (JSON text). */
  readonly options: string;
  readonly commandRange: { readonly first: string | null; readonly last: string | null };
  readonly expectations: unknown;
  readonly label: string;
}

export interface CaseRow {
  readonly case_id: string;
  readonly source_session_id: string;
  readonly source_action_id: string;
  readonly source_annotation_id: string | null;
  readonly package_hash: string;
  readonly seed: number;
  readonly scenario_id: string;
  readonly options: string;
  readonly command_range: string;
  readonly expectations: string;
  readonly label: string;
  readonly created_at: string;
}

export interface RunInput {
  readonly caseId: string;
  readonly targetPackageHash: string;
  readonly outcome: RunOutcome;
  readonly firstFailure: unknown;
  readonly diff: unknown;
}

export interface RunRow {
  readonly run_id: string;
  readonly case_id: string;
  readonly target_package_hash: string;
  readonly outcome: RunOutcome;
  readonly first_failure: string | null;
  readonly diff: string;
  readonly created_at: string;
}

export function saveCase(db: Db, c: CaseInput): string {
  const id = ulid();
  db.prepare(
    `INSERT INTO regression_cases (case_id, source_session_id, source_action_id, source_annotation_id, package_hash, seed, scenario_id,
       options, command_range, expectations, label, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, c.sourceSessionId, c.sourceActionId, c.sourceAnnotationId, c.packageHash, c.seed, c.scenarioId, c.options, json(c.commandRange), json(c.expectations), c.label, now());
  return id;
}

export function getCase(db: Db, caseId: string): CaseRow | null {
  return (db.prepare("SELECT * FROM regression_cases WHERE case_id = ?").get(caseId) as CaseRow | undefined) ?? null;
}

/** Cases in creation order, each with its latest run outcome (null: never run). */
export function listCases(db: Db): (CaseRow & { readonly last_outcome: RunOutcome | null })[] {
  return db.prepare(
    `SELECT c.*, (SELECT r.outcome FROM regression_runs r WHERE r.case_id = c.case_id ORDER BY r.created_at DESC, r.rowid DESC LIMIT 1) AS last_outcome
     FROM regression_cases c ORDER BY c.created_at, c.rowid`,
  ).all() as (CaseRow & { last_outcome: RunOutcome | null })[];
}

export function saveRun(db: Db, r: RunInput): string {
  const id = ulid();
  db.prepare("INSERT INTO regression_runs (run_id, case_id, target_package_hash, outcome, first_failure, diff, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    id, r.caseId, r.targetPackageHash, r.outcome, r.firstFailure === null ? null : json(r.firstFailure), json(r.diff), now(),
  );
  return id;
}

export function listRuns(db: Db, caseId: string): RunRow[] {
  return db.prepare("SELECT * FROM regression_runs WHERE case_id = ? ORDER BY created_at, rowid").all(caseId) as RunRow[];
}
