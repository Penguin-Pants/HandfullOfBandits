// Session-start backup (06 s5 item 4, P3a-08). VACUUM INTO includes committed WAL rows.
import { closeSync, mkdirSync, openSync, readdirSync, rmSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import type { Db } from "./migrate.ts";

/** Keep ten complete backups per store. In-memory stores have no persistent file to back up. */
export function backupStore(db: Db): string | null {
  if (db.memory) return null;
  const directory = join(dirname(db.name), "backups");
  mkdirSync(directory, { recursive: true });
  const prefix = `${basename(db.name)}-`;
  const backups = readdirSync(directory).filter((f) => f.startsWith(prefix) && f.endsWith(".sqlite") && /^\d{20}$/.test(f.slice(prefix.length, -7))).sort();
  const previous = backups.at(-1)?.slice(prefix.length, -7) ?? "0";
  const serial = (BigInt(previous) + 1n).toString().padStart(20, "0");
  const path = join(directory, `${prefix}${serial}.sqlite`);
  // Own the empty destination before SQLite writes it. A second process must not delete our backup.
  closeSync(openSync(path, "wx"));
  try {
    db.prepare("VACUUM main INTO ?").run(path);
  } catch (error) {
    rmSync(path, { force: true });
    throw error;
  }
  for (const file of backups.slice(0, -9)) rmSync(join(directory, file));
  return path;
}
