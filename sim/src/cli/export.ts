// `sim export <sessionId...> [--db file] [--with-states] [--format json|markdown] [--out file]`.
// Both formats check references first (07 s8.1, s8.2; P2-18, P3a-08).
import { existsSync, writeFileSync } from "node:fs";
import { exportMarkdown } from "../export/markdown.ts";
import { exportJson, validateExport } from "../export/json.ts";
import { openStore } from "../store/migrate.ts";

export function exportCommand(sessionIds: readonly string[], dbFile: string, withStates: boolean, out: string | null, appVersion: string, format: "json" | "markdown" = "json"): { exitCode: number; lines: string[] } {
  if (!existsSync(dbFile)) return { exitCode: 1, lines: [`error: no store at ${dbFile}`] };
  const db = openStore(dbFile);
  try {
    const data = exportJson(db, { sessionIds, withStates, appVersion, exportedAt: new Date().toISOString() });
    const broken = validateExport(data);
    if (broken.length > 0) return { exitCode: 1, lines: broken.map((b) => `error T-EXP ${b}`) };
    const text = format === "markdown" ? exportMarkdown(data) : `${JSON.stringify(data, null, 1)}\n`;
    if (out === null) return { exitCode: 0, lines: [text] };
    writeFileSync(out, text);
    return { exitCode: 0, lines: [`wrote ${out}: ${String(data.sessions.length)} sessions, ${String(data.actions.length)} actions, ${String(data.annotations.length)} notes`] };
  } catch (e) {
    return { exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] };
  } finally {
    db.close();
  }
}
