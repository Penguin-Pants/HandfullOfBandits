// Thin client for the local server API (11 P2-11). The UI computes no rules (DEC-04).
import type { AnnotationRow } from "../store/repos/annotations.ts";
import type { CategoryRow } from "../store/repos/categories.ts";
import type { SessionRow } from "../store/repos/sessions.ts";
import type { Head, PackageSummary } from "../server/service.ts";
import type { ActionRow } from "../store/repos/actions.ts";
import type { LogEntryRow } from "../store/repos/log-entries.ts";
import type { AnyCommand, GameState, ValidationResult } from "../server/api-types.ts";

export type { AnnotationRow, CategoryRow, Head, PackageSummary, SessionRow };

export interface HistoryItem {
  readonly action: ActionRow;
  readonly entries: readonly LogEntryRow[];
  readonly notes: number;
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
  legal: (id: string) => call<{ faction: string | null; phase: string; boxes?: string[]; ops?: { op: string; location: string | null }[]; advance?: boolean }>("GET", `/sessions/${id}/legal`),
  history: (id: string) => call<HistoryItem[]>("GET", `/sessions/${id}/history`),
  state: (hash: string) => call<{ state: GameState; derived: unknown }>("GET", `/states/${hash}`),
  categories: () => call<CategoryRow[]>("GET", "/categories"),
  annotations: (id: string) => call<AnnotationRow[]>("GET", `/sessions/${id}/annotations`),
  annotate: (id: string, body: unknown) => call<{ annotationId: string }>("POST", `/sessions/${id}/annotations`, body),
};

export type Api = typeof api;
