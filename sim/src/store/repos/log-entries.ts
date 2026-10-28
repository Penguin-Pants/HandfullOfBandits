// log_entries (06 s3.6): engine log entries of an action with their rendered text.
import type { LogEntry } from "../../engine/core/types.ts";
import { json } from "../common.ts";
import type { Db } from "../migrate.ts";

/** An engine entry plus its sentence for the history view. */
export interface EntryInput extends LogEntry {
  readonly text: string;
}

export interface LogEntryRow {
  readonly entry_id: string;
  readonly action_id: string;
  readonly n: number;
  readonly kind: string;
  readonly state_seq: number;
  readonly rule_ref: string | null;
  readonly assumption_ref: string | null;
  readonly data: string;
  readonly text: string;
}

/** Insert entries numbered from `first`. Returns their IDs `<actionId>-E<n>` (06 s2). */
export function insertEntries(db: Db, actionId: string, entries: readonly EntryInput[], first = 1): string[] {
  const insert = db.prepare(
    "INSERT INTO log_entries (entry_id, action_id, n, kind, state_seq, rule_ref, assumption_ref, data, text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  return entries.map((e, i) => {
    const id = `${actionId}-E${String(first + i)}`;
    insert.run(id, actionId, first + i, e.kind, e.stateSeq, e.ruleRef, e.assumptionRef, json(e.data), e.text);
    return id;
  });
}

export function listEntries(db: Db, actionId: string): LogEntryRow[] {
  return db.prepare("SELECT * FROM log_entries WHERE action_id = ? ORDER BY n").all(actionId) as LogEntryRow[];
}
