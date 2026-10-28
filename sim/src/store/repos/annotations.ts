// annotations and annotation_revisions (07 s3 to s5, 06 s5 item 3). Notes never change game state.
import { json, now } from "../common.ts";
import type { Db } from "../migrate.ts";
import { ulid } from "../ulid.ts";

export type Anchor = "executed" | "proposed" | "decision" | "state" | "session" | "debrief";

export interface AnnotationInput {
  readonly sessionId: string;
  readonly branchId: string;
  readonly anchor: Anchor;
  readonly actionId: string | null;
  readonly stateHash: string | null;
  readonly decisionId: string | null;
  /** 07 s4 context object. */
  readonly context: unknown;
  /** Empty means `general` (07 s5). */
  readonly categoryIds: readonly string[];
  readonly text: string;
}

export interface AnnotationRow {
  readonly annotation_id: string;
  readonly session_id: string;
  readonly branch_id: string;
  readonly action_id: string | null;
  readonly anchor: Anchor;
  readonly state_hash: string | null;
  readonly decision_id: string | null;
  readonly executed_as: string | null;
  readonly context: string;
  readonly category_ids: string;
  readonly text: string;
  readonly severity: "low" | "medium" | "high" | null;
  readonly status: "open" | "addressed" | "wontfix";
  readonly addressed_in_version: string | null;
  readonly tags: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Replace the text and keep the old text as a revision. */
export function editAnnotationText(db: Db, annotationId: string, text: string): void {
  db.transaction(() => {
    const row = db.prepare("SELECT text FROM annotations WHERE annotation_id = ?").get(annotationId) as { text: string } | undefined;
    if (row === undefined) throw new RangeError(`Unknown annotation "${annotationId}"`);
    const at = now();
    db.prepare(
      "INSERT INTO annotation_revisions (annotation_id, n, text, replaced_at) SELECT ?, COALESCE(MAX(n), 0) + 1, ?, ? FROM annotation_revisions WHERE annotation_id = ?",
    ).run(annotationId, row.text, at, annotationId);
    db.prepare("UPDATE annotations SET text = ?, updated_at = ? WHERE annotation_id = ?").run(text, at, annotationId);
  })();
}

/** Save a note and return its ID. A second debrief replaces the first and keeps its ID (07 s10 T-ANN-08). */
export function saveAnnotation(db: Db, input: AnnotationInput): string {
  return db.transaction((): string => {
    const known = new Set((db.prepare("SELECT category_id FROM categories").all() as { category_id: string }[]).map((r) => r.category_id));
    const unknown = input.categoryIds.find((id) => !known.has(id));
    if (unknown !== undefined) throw new RangeError(`Unknown category "${unknown}"`);
    if (input.anchor === "debrief") {
      const old = db.prepare("SELECT annotation_id FROM annotations WHERE session_id = ? AND anchor = 'debrief'").get(input.sessionId) as { annotation_id: string } | undefined;
      if (old !== undefined) {
        editAnnotationText(db, old.annotation_id, input.text);
        db.prepare("UPDATE annotations SET state_hash = ?, context = ?, category_ids = ? WHERE annotation_id = ?").run(
          input.stateHash, json(input.context), json(input.categoryIds), old.annotation_id,
        );
        return old.annotation_id;
      }
    }
    const id = ulid();
    const at = now();
    db.prepare(
      `INSERT INTO annotations (annotation_id, session_id, branch_id, action_id, anchor, state_hash, decision_id, context, category_ids,
         text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, input.sessionId, input.branchId, input.actionId, input.anchor, input.stateHash, input.decisionId, json(input.context), json(input.categoryIds), input.text, at, at);
    return id;
  })();
}

/** Notes of a session in creation order. */
export function listAnnotations(db: Db, sessionId: string): AnnotationRow[] {
  return db.prepare("SELECT * FROM annotations WHERE session_id = ? ORDER BY created_at, rowid").all(sessionId) as AnnotationRow[];
}
