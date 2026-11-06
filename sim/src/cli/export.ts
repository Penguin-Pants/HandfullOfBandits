// `sim export <sessionId...> [--db file] [--with-states] [--format json|markdown|csv] [--out path]`.
// Every format checks references first (07 s8; P2-18, P3a-08, P4-02, P4-03). CSV writes three files,
// so its `--out` is a folder.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { exportCsv } from "../export/csv.ts";
import { exportMarkdown } from "../export/markdown.ts";
import { exportJson, validateExport } from "../export/json.ts";
import { ruleIndexOf } from "./rule.ts";
import { openStore } from "../store/migrate.ts";

export function exportCommand(sessionIds: readonly string[], dbFile: string, withStates: boolean, out: string | null, appVersion: string, format: "json" | "markdown" | "csv" = "json"): { exitCode: number; lines: string[] } {
  if (!existsSync(dbFile)) return { exitCode: 1, lines: [`error: no store at ${dbFile}`] };
  if (format === "csv" && out === null) return { exitCode: 1, lines: ["error: --format csv needs --out <folder>"] };
  const db = openStore(dbFile);
  try {
    const data = exportJson(db, { sessionIds, withStates, appVersion, exportedAt: new Date().toISOString(), ruleIndex: ruleIndexOf(fileURLToPath(new URL("../../../game-packages", import.meta.url))) });
    const broken = validateExport(data);
    if (broken.length > 0) return { exitCode: 1, lines: broken.map((b) => `error T-EXP ${b}`) };
    const counts = `${String(data.sessions.length)} sessions, ${String(data.actions.length)} actions, ${String(data.annotations.length)} notes`;
    if (format === "csv" && out !== null) {
      const csv = exportCsv(data);
      mkdirSync(out, { recursive: true });
      writeFileSync(join(out, "annotations.csv"), csv.annotations);
      writeFileSync(join(out, "actions.csv"), csv.actions);
      writeFileSync(join(out, "metrics.csv"), csv.metrics);
      return { exitCode: 0, lines: [`wrote ${join(out, "annotations.csv")}, ${join(out, "actions.csv")} and ${join(out, "metrics.csv")}: ${counts}`] };
    }
    const text = format === "markdown" ? exportMarkdown(data) : `${JSON.stringify(data, null, 1)}\n`;
    if (out === null) return { exitCode: 0, lines: [text] };
    writeFileSync(out, text);
    return { exitCode: 0, lines: [`wrote ${out}: ${counts}`] };
  } catch (e) {
    return { exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] };
  } finally {
    db.close();
  }
}
