// FTS5 narrows candidates; the final JS filter preserves the existing substring contract (P3a-08).
import type { Db } from "./migrate.ts";
import type { AnnotationRow } from "./repos/annotations.ts";
export function searchAnnotations(db: Db, query: string): AnnotationRow[] {
  const q = query.toLowerCase();
  // Trigrams need three characters. Keep Unicode candidates because JS and SQLite case folds differ.
  const indexed = q.length >= 3 && /^[\x20-\x7e]+$/.test(q);
  const where = indexed ? "WHERE a.rowid IN (SELECT rowid FROM annotations_fts WHERE annotations_fts MATCH ?) OR a.text GLOB '*[^ -~]*'" : "";
  const rows = db.prepare(`SELECT a.* FROM annotations a JOIN sessions s ON s.session_id = a.session_id ${where} ORDER BY s.updated_at DESC, s.rowid, a.created_at, a.rowid`)
    .all(...(indexed ? [`"${q.replace(/"/g, '""')}"`] : []));
  return (rows as AnnotationRow[]).filter((r) => r.text.toLowerCase().includes(q));
}
