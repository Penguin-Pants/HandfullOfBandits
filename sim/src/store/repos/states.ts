// states (06 s3.7): one snapshot per hash, deduplicated.
import { json, pack, unpack } from "../common.ts";
import type { Db } from "../migrate.ts";

export interface StateInput {
  readonly hash: string;
  /** Canonical JSON of the state, the text the hash covers. */
  readonly content: string;
  /** Derived view (Control, scores, Harm counts) for fast review. */
  readonly derived: unknown;
}

export function saveState(db: Db, state: StateInput): void {
  db.prepare("INSERT OR IGNORE INTO states (state_hash, content, derived) VALUES (?, ?, ?)").run(state.hash, pack(state.content), json(state.derived));
}

/** Canonical JSON content and derived view JSON of a stored state, or null. */
export function loadState(db: Db, hash: string): { readonly content: string; readonly derived: string } | null {
  const row = db.prepare("SELECT content, derived FROM states WHERE state_hash = ?").get(hash) as { content: Buffer; derived: string } | undefined;
  return row === undefined ? null : { content: unpack(row.content), derived: row.derived };
}
