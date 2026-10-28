// Annotation context types (07 s4). Context JSON keys follow 07 s4 names. The annotation row
// holds `annotation_id` and `created_at` (store source), so the context does not repeat them (DEC-46).
import type { AnyCommand, DerivedView, FactionId, GameState, JsonObject, JsonValue, LogEntry, Ruleset, ValidationResult } from "../engine/core/types.ts";

/** Panel with focus when the note bar opened (07 s4.1 `ui_focus`). */
export type UiPanel = "board" | "faction" | "event" | "status" | "history" | "review";

/** UI selection store at note time. */
export interface UiFocus {
  readonly panel: UiPanel;
  readonly selectedSpace: string | null;
  readonly selectedPieces: readonly string[];
  readonly hoveredActionId: string | null;
}

/** A state and its derived view. */
export interface ViewedState {
  readonly state: GameState;
  readonly stateHash: string;
  readonly derived: DerivedView;
}

/** The action a note is about (07 s4.2). An executed action has an ID and before and after states. */
export interface ActionContextInput {
  /** Null for a proposed plan. */
  readonly actionId: string | null;
  /** Store action kind. Null for a proposed plan. */
  readonly kind: string | null;
  readonly command: AnyCommand;
  readonly validation: ValidationResult;
  /** Engine entries of the action. Empty for a proposed plan. */
  readonly entries: readonly LogEntry[];
  /** Null for a proposed plan. */
  readonly before: ViewedState | null;
  readonly after: ViewedState | null;
}

export interface ContextInput {
  readonly ruleset: Ruleset;
  readonly packageId: string;
  readonly packageVersion: string;
  readonly sessionId: string;
  readonly branchId: string;
  readonly appVersion: string;
  /** Current head. */
  readonly head: ViewedState;
  readonly lastActionId: string | null;
  /** From the sequence model (P2-03). Null until it exists. */
  readonly activeFaction: FactionId | null;
  /** From the package cards (P2-05). Null until they exist. */
  readonly currentCardTitle: string | null;
  readonly focus: UiFocus;
  readonly action: ActionContextInput | null;
  /** Legal boxes, actions and answers at note time, for proposed and decision notes. */
  readonly legalChoices: JsonValue;
  /** Research reference per rule ID, from the package rule index. */
  readonly ruleSources: Readonly<Record<string, string>>;
}

/** The 07 s4 context object, stored as `annotations.context`. */
export type AnnotationContext = JsonObject;
