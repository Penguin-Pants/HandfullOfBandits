// Thin client for the local server API (11 P2-11). The UI computes no rules (DEC-04).
import type { AnnotationRow } from "../store/repos/annotations.ts";
import type { CategoryRow } from "../store/repos/categories.ts";
import type { SessionRow } from "../store/repos/sessions.ts";
import type { Head, PackageSummary } from "../server/service.ts";
import type { BoardView, ForceView, PieceView, SpaceView } from "../server/view.ts";
import type { ReviewRow } from "../server/review.ts";
import type { ActionRow } from "../store/repos/actions.ts";
import type { LogEntryRow } from "../store/repos/log-entries.ts";
import type { AnyCommand, GameState, Question, ValidationResult, Violation } from "../server/api-types.ts";
import type { ActionForm, FormField } from "../server/forms.ts";
import type { UiFocus } from "../annotate/types.ts";

export type { AnyCommand, FormField, Question, UiFocus, ValidationResult, Violation };
export type { ReviewRow };
export type { AnnotationRow, BoardView, CategoryRow, ForceView, Head, PackageSummary, PieceView, SessionRow, SpaceView };

export interface HistoryItem {
  readonly action: ActionRow;
  readonly entries: readonly LogEntryRow[];
  readonly notes: number;
}

export interface ActionChoice extends ActionForm {
  readonly kind: "op" | "sa";
  readonly ok: boolean;
  readonly reason: string | null;
  readonly locations: readonly string[];
}

/** GET /legal: the acting faction's boxes and actions, or the Advance state (05 s4.2). */
export interface LegalChoices {
  readonly faction: string | null;
  readonly phase: string;
  readonly first?: boolean;
  /** The other player faction on this card, and which box each faction's cylinder is in. */
  readonly other?: string | null;
  readonly placed?: Readonly<Record<string, string | null>>;
  /**
   * Per box: open now; why not; if the First Eligible picks it, the boxes the other faction may
   * then pick (`otherMay`) and who is First Eligible on the next card (`nextFirst`).
   */
  readonly boxes?: readonly { readonly box: string; readonly allowed: boolean; readonly reason: string | null; readonly otherMay?: readonly string[] | null; readonly nextFirst?: string | null }[];
  readonly actions?: readonly ActionChoice[];
  readonly advance?: boolean;
  readonly violations?: readonly Violation[];
}

/** POST /annotations body (07 s2, s3). */
export interface NoteInput {
  readonly anchor: "executed" | "proposed" | "decision" | "state" | "session" | "debrief";
  readonly actionId: string | null;
  readonly text: string;
  readonly categoryIds: readonly string[];
  readonly focus: UiFocus;
  readonly proposed?: AnyCommand;
}

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;
  constructor(status: number, message: string, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, { method, headers: body === undefined ? {} : { "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const err = data as { error?: string; detail?: unknown };
    throw new ApiError(res.status, err.error ?? res.statusText, err.detail ?? null);
  }
  return data as T;
}

export const api = {
  packages: () => call<PackageSummary[]>("GET", "/packages"),
  sessions: () => call<SessionRow[]>("GET", "/sessions"),
  createSession: (body: { dir: string; scenarioId: string; seed: number; name: string; options: Record<string, string | number> }) =>
    call<{ sessionId: string; head: Head }>("POST", "/sessions", body),
  session: (id: string) => call<{ session: SessionRow; head: Head }>("GET", `/sessions/${id}`),
  validate: (id: string, command: AnyCommand) => call<ValidationResult>("POST", `/sessions/${id}/validate`, { command }),
  submit: (id: string, command: AnyCommand, headActionId: string) => call<{ actionId: string; head: Head; entries: LogEntryRow[] }>("POST", `/sessions/${id}/commands`, { command, headActionId }),
  legal: (id: string) => call<LegalChoices>("GET", `/sessions/${id}/legal`),
  history: (id: string) => call<HistoryItem[]>("GET", `/sessions/${id}/history`),
  state: (hash: string) => call<{ state: GameState; derived: unknown }>("GET", `/states/${hash}`),
  stateView: (id: string, hash: string) => call<BoardView>("GET", `/sessions/${id}/states/${hash}/view`),
  categories: () => call<CategoryRow[]>("GET", "/categories"),
  annotations: (id: string) => call<AnnotationRow[]>("GET", `/sessions/${id}/annotations`),
  annotate: (id: string, body: NoteInput) => call<{ annotationId: string }>("POST", `/sessions/${id}/annotations`, body),
  undo: (id: string, headActionId: string) => call<{ undone: string; head: string; undoneAfterRandom: boolean }>("POST", `/sessions/${id}/undo`, { headActionId }),
  review: (filter: Readonly<Record<string, string>>) => call<ReviewRow[]>("GET", `/review?${new URLSearchParams(filter).toString()}`),
  endSession: (id: string, debrief: string | null) => call<{ debriefId: string | null }>("POST", `/sessions/${id}/end`, { debrief }),
};

export type Api = typeof api;
