// actions (06 s3.4) and the one-transaction commit (06 s5 item 1): state, action, commands,
// log entries and session head are written together or not at all.
import type { AnyCommand } from "../../engine/core/types.ts";
import { now } from "../common.ts";
import type { Db } from "../migrate.ts";
import { insertCommands, type CommandInput } from "./commands.ts";
import { insertEntries, type EntryInput } from "./log-entries.ts";
import { saveState, type StateInput } from "./states.ts";

export type ActionKind = "cardChoice" | "pivotal" | "propagandaChoice" | "advance" | "setup";

export interface ActionInput {
  readonly sessionId: string;
  readonly kind: ActionKind;
  readonly faction: string | null;
  readonly cardId: string | null;
  readonly campaign: string | null;
  readonly propagandaRound: number;
  readonly cardIndex: number;
  readonly phase: string;
  readonly box: string | null;
  readonly summary: string;
  /** Null only for the setup action. */
  readonly stateHashBefore: string | null;
  readonly stateAfter: StateInput;
  /** `pending` while a Decision is open (05 s5.3). */
  readonly status: "committed" | "pending";
  readonly commands: readonly CommandInput[];
  readonly entries: readonly EntryInput[];
}

export interface ActionRow {
  readonly action_id: string;
  readonly session_id: string;
  readonly branch_id: string;
  readonly seq: number;
  readonly branch_seq: number;
  readonly kind: ActionKind;
  readonly faction: string | null;
  readonly card_id: string | null;
  readonly campaign: string | null;
  readonly propaganda_round: number;
  readonly card_index: number;
  readonly phase: string;
  readonly box: string | null;
  readonly summary: string;
  readonly state_hash_before: string | null;
  readonly state_hash_after: string;
  readonly status: "committed" | "undone" | "pending";
  readonly undone_by: string | null;
  readonly created_at: string;
}

export interface CommitResult {
  readonly actionId: string;
  readonly commandIds: readonly string[];
  readonly entryIds: readonly string[];
}

function nextSeq(db: Db, column: "seq" | "branch_seq", owner: "session_id" | "branch_id", id: string): number {
  const row = db.prepare(`SELECT COALESCE(MAX(${column}), 0) + 1 AS next FROM actions WHERE ${owner} = ?`).get(id) as { next: number };
  return row.next;
}

/**
 * Commit one Action Transaction on the session's current branch (06 s5 item 1). The action ID is
 * `<sessionId>-A<seq>` with seq counted across the whole session, so it is never reused (06 s2).
 * Any error rolls back every row.
 */
export function commitAction(db: Db, input: ActionInput): CommitResult {
  return db.transaction((): CommitResult => {
    const session = db.prepare("SELECT current_branch_id FROM sessions WHERE session_id = ?").get(input.sessionId) as { current_branch_id: string } | undefined;
    if (session === undefined) throw new RangeError(`Unknown session "${input.sessionId}"`);
    const branchId = session.current_branch_id;
    const seq = nextSeq(db, "seq", "session_id", input.sessionId);
    const actionId = `${input.sessionId}-A${String(seq)}`;
    const at = now();
    saveState(db, input.stateAfter);
    db.prepare(
      `INSERT INTO actions (action_id, session_id, branch_id, seq, branch_seq, kind, faction, card_id, campaign, propaganda_round,
         card_index, phase, box, summary, state_hash_before, state_hash_after, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      actionId, input.sessionId, branchId, seq, nextSeq(db, "branch_seq", "branch_id", branchId), input.kind, input.faction, input.cardId,
      input.campaign, input.propagandaRound, input.cardIndex, input.phase, input.box, input.summary, input.stateHashBefore,
      input.stateAfter.hash, input.status, at,
    );
    const commandIds = insertCommands(db, actionId, input.commands);
    const entryIds = insertEntries(db, actionId, input.entries);
    db.prepare("UPDATE sessions SET head_action_id = ?, updated_at = ? WHERE session_id = ?").run(actionId, at, input.sessionId);
    return { actionId, commandIds, entryIds };
  })();
}

export function getAction(db: Db, actionId: string): ActionRow | null {
  return (db.prepare("SELECT * FROM actions WHERE action_id = ?").get(actionId) as ActionRow | undefined) ?? null;
}

/** Actions of a branch in branch order, undone ones included (07 s6). */
export function listActions(db: Db, branchId: string): ActionRow[] {
  return db.prepare("SELECT * FROM actions WHERE branch_id = ? ORDER BY branch_seq").all(branchId) as ActionRow[];
}

/** Committed actions of a branch as replay steps: setup hash, then each action's commands and hash after. */
export function storedSteps(db: Db, branchId: string): { startHash: string; steps: { id: string; commands: AnyCommand[]; hashAfter: string }[] } {
  const actions = listActions(db, branchId).filter((a) => a.status !== "undone");
  const commands = db.prepare("SELECT payload FROM commands WHERE action_id = ? ORDER BY n");
  return {
    startHash: actions[0]?.state_hash_after ?? "",
    steps: actions.slice(1).map((a) => ({ id: a.action_id, commands: (commands.all(a.action_id) as { payload: string }[]).map((c) => JSON.parse(c.payload) as AnyCommand), hashAfter: a.state_hash_after })),
  };
}
