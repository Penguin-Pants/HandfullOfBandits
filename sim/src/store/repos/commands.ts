// commands (06 s3.5): engine commands of an action, in order. Never updated after commit.
import type { JsonValue } from "../../engine/core/types.ts";
import { json } from "../common.ts";
import type { Db } from "../migrate.ts";

export interface CommandInput {
  readonly type: string;
  readonly payload: unknown;
  /** Violations, warnings and preview at submit time. */
  readonly validation: unknown;
  /** Generator state before the command. */
  readonly rngBefore: JsonValue;
}

export interface CommandRow {
  readonly command_id: string;
  readonly action_id: string;
  readonly n: number;
  readonly type: string;
  readonly payload: string;
  readonly validation: string;
  readonly rng_before: string;
}

/** Insert commands numbered from `first`. Returns their IDs `<actionId>-C<n>` (06 s2). */
export function insertCommands(db: Db, actionId: string, commands: readonly CommandInput[], first = 1): string[] {
  const insert = db.prepare("INSERT INTO commands (command_id, action_id, n, type, payload, validation, rng_before) VALUES (?, ?, ?, ?, ?, ?, ?)");
  return commands.map((c, i) => {
    const id = `${actionId}-C${String(first + i)}`;
    insert.run(id, actionId, first + i, c.type, json(c.payload), json(c.validation), json(c.rngBefore));
    return id;
  });
}

export function listCommands(db: Db, actionId: string): CommandRow[] {
  return db.prepare("SELECT * FROM commands WHERE action_id = ? ORDER BY n").all(actionId) as CommandRow[];
}
