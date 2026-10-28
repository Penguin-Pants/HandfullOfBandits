// Store setup (06 s3, s5): open the SQLite file, WAL mode, foreign keys, migrations.
// A migration is a SQL file. Its number is its place in MIGRATIONS; never edit one after merge.
import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

export type Db = Database.Database;

const MIGRATIONS = [new URL("./schema.sql", import.meta.url)];

/** Run each migration above the file's `user_version`, each in one transaction. Returns the new version. */
export function migrate(db: Db): number {
  const current = db.pragma("user_version", { simple: true }) as number;
  MIGRATIONS.slice(current).forEach((file, i) => {
    db.transaction(() => {
      db.exec(readFileSync(file, "utf8"));
      db.pragma(`user_version = ${String(current + i + 1)}`);
    })();
  });
  return MIGRATIONS.length;
}

export function openStore(path: string): Db {
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}
