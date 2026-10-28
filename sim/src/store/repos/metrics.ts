// metrics (06 s3, DEC-34): one row per Propaganda round per branch, from RoundMetrics entries.
import { json } from "../common.ts";
import type { Db } from "../migrate.ts";

export interface MetricsRow {
  readonly session_id: string;
  readonly branch_id: string;
  readonly propaganda_round: number;
  readonly action_id: string;
  readonly data: string;
}

export function saveMetrics(db: Db, row: { sessionId: string; branchId: string; round: number; actionId: string; data: unknown }): void {
  db.prepare("INSERT OR REPLACE INTO metrics (session_id, branch_id, propaganda_round, action_id, data) VALUES (?, ?, ?, ?, ?)").run(
    row.sessionId, row.branchId, row.round, row.actionId, json(row.data),
  );
}

export function listMetrics(db: Db, sessionId: string): MetricsRow[] {
  return db.prepare("SELECT * FROM metrics WHERE session_id = ? ORDER BY branch_id, propaganda_round").all(sessionId) as MetricsRow[];
}
