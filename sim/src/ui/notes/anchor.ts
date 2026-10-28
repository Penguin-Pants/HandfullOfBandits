// Default note anchor (07 s2.1, s2.2, s3): an action in the last 20 s, else a drafted plan, else
// the inspected state, else the session.
import type { AnyCommand, NoteInput } from "../api.ts";

export const EXECUTED_WINDOW_MS = 20_000;

export interface AnchorInput {
  readonly lastActionId: string | null;
  /** ms timestamp of the last commit, or null. */
  readonly lastActionAt: number | null;
  readonly now: number;
  readonly draft: AnyCommand | null;
  readonly selectedSpace: string | null;
}

export function defaultAnchor(i: AnchorInput): Pick<NoteInput, "anchor" | "actionId"> & { proposed?: AnyCommand } {
  if (i.lastActionId !== null && i.lastActionAt !== null && i.now - i.lastActionAt <= EXECUTED_WINDOW_MS) return { anchor: "executed", actionId: i.lastActionId };
  if (i.draft !== null) return { anchor: "proposed", actionId: null, proposed: i.draft };
  if (i.selectedSpace !== null) return { anchor: "state", actionId: null };
  return { anchor: "session", actionId: null };
}

/** `#balance` tags in the text become categories (07 s2 step 2). */
export function hashCategories(text: string, known: readonly string[]): string[] {
  return [...text.matchAll(/#([a-z-]+)/g)].map((m) => m[1] ?? "").filter((c) => known.includes(c));
}
