// Feedback review (07 s7 basic; 11 P2-17): notes across sessions with filters and plain substring
// search. FTS comes with P3a-08.
import type { AnnotationRow } from "../store/repos/annotations.ts";

export interface ReviewRow {
  readonly annotationId: string;
  readonly sessionId: string;
  readonly sessionName: string;
  readonly createdAt: string;
  readonly anchor: string;
  readonly actionId: string | null;
  readonly stateHash: string | null;
  readonly categories: readonly string[];
  readonly text: string;
  readonly status: string;
  readonly faction: string | null;
  readonly cardId: string | null;
  readonly version: string | null;
  readonly rulesetVersion: string | null;
  /** Selected space and the action's plan locations (T-ANN-06). */
  readonly spaces: readonly string[];
}

export interface ReviewFilter {
  readonly faction?: string;
  readonly card?: string;
  readonly space?: string;
  readonly category?: string;
  readonly version?: string;
  readonly session?: string;
  readonly anchor?: string;
  readonly status?: string;
  readonly q?: string;
}

function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/** One review row from a stored note and its session name. */
export function reviewRow(note: AnnotationRow, sessionName: string): ReviewRow {
  const c = JSON.parse(note.context) as Record<string, unknown>;
  const plan = c["plan"] as { faction?: unknown; plan?: { locations?: unknown; sa?: { locations?: unknown } | null } } | undefined;
  const list = (v: unknown): unknown[] => (Array.isArray(v) ? (v as unknown[]) : []);
  const locations = [...list(plan?.plan?.locations), ...list(plan?.plan?.sa?.locations)].filter((l): l is string => typeof l === "string");
  const selected = str(c["selected_space"]);
  return {
    annotationId: note.annotation_id,
    sessionId: note.session_id,
    sessionName,
    createdAt: note.created_at,
    anchor: note.anchor,
    actionId: note.action_id,
    stateHash: note.state_hash,
    categories: JSON.parse(note.category_ids) as string[],
    text: note.text,
    status: note.status,
    faction: str(plan?.faction) ?? str(c["active_faction"]),
    cardId: str(c["current_card_id"]),
    version: str(c["version"]),
    rulesetVersion: str(c["ruleset_version"]),
    spaces: [...new Set([...(selected === null ? [] : [selected]), ...locations])],
  };
}

export function filterRows(rows: readonly ReviewRow[], f: ReviewFilter): ReviewRow[] {
  const q = f.q?.toLowerCase();
  return rows.filter(
    (r) =>
      (f.faction === undefined || r.faction === f.faction) &&
      (f.card === undefined || r.cardId === f.card) &&
      (f.space === undefined || r.spaces.includes(f.space)) &&
      (f.category === undefined || r.categories.includes(f.category) || (f.category === "general" && r.categories.length === 0)) &&
      (f.version === undefined || r.version === f.version) &&
      (f.session === undefined || r.sessionId === f.session) &&
      (f.anchor === undefined || r.anchor === f.anchor) &&
      (f.status === undefined || r.status === f.status) &&
      (q === undefined || r.text.toLowerCase().includes(q)),
  );
}
