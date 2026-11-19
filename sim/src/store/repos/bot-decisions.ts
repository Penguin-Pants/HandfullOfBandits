// bot_decisions (audit Plan 2 S1, S4): the decision records of the bot commands in an action.
// An Operation that pauses for a question continues the same action, so `n` counts on.
import { json } from "../common.ts";
import type { Db } from "../migrate.ts";

export function saveBotDecisions(db: Db, actionId: string, records: readonly unknown[]): void {
  db.transaction(() => {
    const { next } = db.prepare("SELECT COALESCE(MAX(n), -1) + 1 AS next FROM bot_decisions WHERE action_id = ?").get(actionId) as { next: number };
    const insert = db.prepare("INSERT INTO bot_decisions (action_id, n, record) VALUES (?, ?, ?)");
    records.forEach((r, i) => insert.run(actionId, next + i, json(r)));
  })();
}

/** Records of one action, in decision order. */
export function botDecisionsOf(db: Db, actionId: string): unknown[] {
  return (db.prepare("SELECT record FROM bot_decisions WHERE action_id = ? ORDER BY n").all(actionId) as { record: string }[]).map((r) => JSON.parse(r.record) as unknown);
}
