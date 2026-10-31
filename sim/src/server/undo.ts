// Undo last action (06 s6; 11 P2-17). Nothing is deleted: the action becomes `undone`, an `Undo`
// entry joins its log, and the head moves back to the previous committed action. An undo after a
// die roll or random pick sets `undoneAfterRandom` (06 s6 item 7, DEC-33).
import type { Db } from "../store/migrate.ts";
import { listActions, type ActionRow } from "../store/repos/actions.ts";
import { insertEntries, listEntries } from "../store/repos/log-entries.ts";

export interface UndoResult {
  readonly undone: string;
  readonly head: string;
  readonly undoneAfterRandom: boolean;
}

/** Undo the head action of `branchId`. Throws RangeError when there is nothing to undo. */
export function undoLast(db: Db, sessionId: string, branchId: string): UndoResult {
  return db.transaction((): UndoResult => {
    const live = listActions(db, branchId).filter((a) => a.status !== "undone");
    const target: ActionRow | undefined = live.at(-1);
    const previous = live.at(-2);
    if (target === undefined || previous === undefined || target.kind === "setup") throw new RangeError("Nothing to undo.");
    const entries = listEntries(db, target.action_id);
    const undoneAfterRandom = entries.some((e) => e.kind === "DieRolled");
    db.prepare("UPDATE actions SET status = 'undone' WHERE action_id = ?").run(target.action_id);
    insertEntries(
      db,
      target.action_id,
      [{ kind: "Undo", stateSeq: entries.at(-1)?.state_seq ?? 0, ruleRef: "06 s6", assumptionRef: null, data: { undoneAfterRandom, headAfter: previous.action_id }, text: `Action ${target.action_id} undone.${undoneAfterRandom ? " It used a random result." : ""}` }],
      entries.length + 1,
    );
    db.prepare("UPDATE sessions SET head_action_id = ?, status = CASE WHEN status = 'ended' THEN 'active' ELSE status END, result = NULL WHERE session_id = ?").run(previous.action_id, sessionId);
    return { undone: target.action_id, head: previous.action_id, undoneAfterRandom };
  })();
}
