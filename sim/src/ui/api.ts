// Thin client for the local server API (11 P2-11). The UI computes no rules (DEC-04).
import type { AnnotationRow } from "../store/repos/annotations.ts";
import type { CategoryRow } from "../store/repos/categories.ts";
import type { SessionRow } from "../store/repos/sessions.ts";
import type { ExperimentDetail, ExperimentGameRow, ExperimentSummary, Head, HistoryEntry, PackageSummary, SeatPlayer } from "../server/service.ts";
import type { SetupBase, VariantCheck, VariantSummary } from "../server/variants.ts";
import type { SetupChange } from "../package/diff.ts";
import type { BoardView, ForceView, PieceView, SpaceView } from "../server/view.ts";
import type { ReviewRow } from "../server/review.ts";
import type { Cell as MetricsCell, MetricsTable } from "../export/metrics.ts";
import type { ActionRow } from "../store/repos/actions.ts";
import type { LogEntryRow } from "../store/repos/log-entries.ts";
import type { AnyCommand, GameState, Question, RuleLookup, ValidationResult, Violation } from "../server/api-types.ts";
import type { ActionForm, FormField } from "../server/forms.ts";
import type { UiFocus } from "../annotate/types.ts";
import type { ClientError } from "../export/feedback-prompt.ts";

export type { ActionForm, AnyCommand, ClientError, FormField, Question, UiFocus, ValidationResult, Violation };
export type { ExperimentDetail, ExperimentGameRow, ExperimentSummary, SeatPlayer };
export type { SetupBase, SetupChange, VariantCheck, VariantSummary };
export type { HistoryEntry, MetricsCell, MetricsTable, ReviewRow, RuleLookup };
export type { AnnotationRow, BoardView, CategoryRow, ForceView, Head, PackageSummary, PieceView, SessionRow, SpaceView };

/** One reviewed candidate of a bot decision (cli/seat.ts `ReviewedCandidate`). */
export interface BotCandidate {
  readonly id: string;
  readonly family: string;
  readonly value: number | null;
  readonly components: Readonly<Record<string, number>>;
  readonly command: AnyCommand;
}

/** The decision record of a bot command (cli/seat.ts `SeatRecord`); the chosen candidate is first in `review`. */
export interface BotRecord {
  readonly id: string;
  readonly kind: string;
  readonly faction: string;
  readonly player: string;
  readonly candidates: number;
  readonly selected: string | null;
  readonly value: number | null;
  readonly notes: readonly string[];
  readonly ms: number;
  readonly review: readonly BotCandidate[];
  /** A bot State part that the human PKK completed: the action holds a human decision too. */
  readonly humanJoined?: boolean;
  /** The sampled plays after the chosen one (S4): opponent replies, then the bot's next play. Absent for one-move players. */
  readonly line?: readonly { readonly faction: string; readonly command: AnyCommand }[];
}


export interface HistoryItem {
  readonly action: ActionRow;
  readonly entries: readonly HistoryEntry[];
  readonly notes: number;
  /** Bot decisions behind this action; empty or absent for a human action. */
  readonly bot?: readonly BotRecord[];
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
  /** Plan forms of every action, for an Event's free action (UC-5). */
  readonly forms?: readonly ActionForm[];
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

/** The last client errors for a feedback report (feedback prompt Phase 2). In memory only. */
const MAX_ERRORS = 10;
const errors: ClientError[] = [];
function recordError(error: ClientError): void {
  errors.push(error);
  if (errors.length > MAX_ERRORS) errors.shift();
}

/** Record uncaught errors and unhandled rejections of `target`, message only (Risk 2). Returns a function that stops it. */
export function captureWindowErrors(target: Window): () => void {
  const onError = (e: ErrorEvent): void => { recordError({ kind: "error", message: e.message }); };
  const onRejection = (e: PromiseRejectionEvent): void => {
    const reason: unknown = e.reason;
    recordError({ kind: "rejection", message: reason instanceof Error ? reason.message : String(reason) });
  };
  target.addEventListener("error", onError);
  target.addEventListener("unhandledrejection", onRejection);
  return () => {
    target.removeEventListener("error", onError);
    target.removeEventListener("unhandledrejection", onRejection);
  };
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const failed = (status: number, message: string): void => { recordError({ kind: "request", method, path: `/api${path}`, status, message }); };
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { method, headers: body === undefined ? {} : { "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  } catch (e) {
    // No response: status 0.
    failed(0, e instanceof Error ? e.message : String(e));
    throw e;
  }
  if (res.ok) return (await res.json()) as T;
  // An error body may not be JSON (a proxy page): fall back to the status text.
  const err = (await res.json().catch(() => ({}))) as { error?: string; detail?: unknown };
  failed(res.status, err.error ?? res.statusText);
  throw new ApiError(res.status, err.error ?? res.statusText, err.detail ?? null);
}

/** Query for `/api/metrics` and `/api/metrics.csv`: a comma list of session IDs, empty for all. */
export const metricsQuery = (sessionIds: readonly string[]): string => (sessionIds.length === 0 ? "" : `?${new URLSearchParams({ sessions: sessionIds.join(",") }).toString()}`);

export const api = {
  packages: () => call<PackageSummary[]>("GET", "/packages"),
  sessions: () => call<SessionRow[]>("GET", "/sessions"),
  createSession: (body: { dir: string; scenarioId: string; seed: number; name: string; options: Record<string, string | number>; seats?: Record<string, string>; variant?: string }) =>
    call<{ sessionId: string; head: Head }>("POST", "/sessions", body),
  /** Setup editor (audit Plan 4 V2): check an overlay, import YAML text or open a saved variant. */
  checkVariant: (body: { dir: string; name?: string; overlay?: unknown; text?: string }) => call<VariantCheck>("POST", "/variants/check", body),
  saveVariant: (body: { dir: string; name: string; overlay: unknown; replace: boolean }) => call<VariantSummary>("POST", "/variants", body),
  /** The faction whose bot acts at the head, or null (audit Plan 2 S1). */
  session: (id: string) => call<{ session: SessionRow; head: Head; botToAct?: string | null; botExtends?: boolean }>("GET", `/sessions/${id}`),
  seatPlayers: () => call<SeatPlayer[]>("GET", "/seat-players"),
  /** Let the seated bot act. `partial`: a human State part of Redeploy or Legal Politics for a PKK bot. */
  botStep: (id: string, headActionId: string, headStateHash: string, partial: Record<string, unknown> | null = null) =>
    call<{ actionId: string | null; partial: Record<string, unknown> | null; options: Record<string, unknown>[] | null; records: BotRecord[] }>("POST", `/sessions/${id}/bot-step`, { headActionId, headStateHash, partial }),
  validate: (id: string, command: AnyCommand) => call<ValidationResult>("POST", `/sessions/${id}/validate`, { command }),
  submit: (id: string, command: AnyCommand, headActionId: string, headStateHash?: string) => call<{ actionId: string; head: Head; entries: LogEntryRow[] }>("POST", `/sessions/${id}/commands`, { command, headActionId, headStateHash }),
  legal: (id: string) => call<LegalChoices>("GET", `/sessions/${id}/legal`),
  history: (id: string) => call<HistoryItem[]>("GET", `/sessions/${id}/history`),
  state: (hash: string) => call<{ state: GameState; derived: unknown }>("GET", `/states/${hash}`),
  stateView: (id: string, hash: string) => call<BoardView>("GET", `/sessions/${id}/states/${hash}/view`),
  categories: () => call<CategoryRow[]>("GET", "/categories"),
  annotations: (id: string) => call<AnnotationRow[]>("GET", `/sessions/${id}/annotations`),
  annotate: (id: string, body: NoteInput) => call<{ annotationId: string }>("POST", `/sessions/${id}/annotations`, body),
  /** Save a feedback note and get its Claude Code prompt, with the recent client errors (feedback prompt Phase 2). */
  feedback: (id: string, body: NoteInput) => call<{ annotationId: string; prompt: string }>("POST", `/sessions/${id}/feedback`, { ...body, diagnostics: { errors } }),
  undo: (id: string, headActionId: string, headStateHash?: string) => call<{ undone: string; head: string; undoneAfterRandom: boolean; state?: Head }>("POST", `/sessions/${id}/undo`, { headActionId, headStateHash }),
  /** Branch from a past action (P4-04). */
  branch: (id: string, actionId: string, headActionId: string, headStateHash?: string) => call<{ branchId: string; head: Head }>("POST", `/sessions/${id}/branches`, { actionId, headActionId, headStateHash }),
  review: (filter: Readonly<Record<string, string>>) => call<ReviewRow[]>("GET", `/review?${new URLSearchParams(filter).toString()}`),
  setNoteStatus: (annotationIds: readonly string[], status: "open" | "addressed" | "wontfix") => call<{ updated: number }>("POST", "/review/status", { annotationIds, status }),
  /** Metrics review (P4-03). No session IDs: every session. */
  metrics: (sessionIds: readonly string[]) => call<MetricsTable>("GET", `/metrics${metricsQuery(sessionIds)}`),
  /** Research text a log rule ref cites (P4-08). */
  rule: (id: string, ref: string) => call<RuleLookup>("GET", `/sessions/${id}/rules?${new URLSearchParams({ ref }).toString()}`),
  /** Experiment reports (audit Plan 3 A5). */
  experiments: () => call<ExperimentSummary[]>("GET", "/experiments"),
  experiment: (id: string) => call<ExperimentDetail>("GET", `/experiments/${encodeURIComponent(id)}`),
  /** Open a recorded game as a new session after its first `decisions` commands (null: all). */
  openExperimentGame: (id: string, gameId: string, decisions: number | null) =>
    call<{ sessionId: string; applied: number; total: number; divergedAt: number | null }>("POST", `/experiments/${encodeURIComponent(id)}/games/${encodeURIComponent(gameId)}/open`, { decisions }),
  endSession: (id: string, debrief: string | null) => call<{ debriefId: string | null }>("POST", `/sessions/${id}/end`, { debrief }),
};

export type Api = typeof api;
