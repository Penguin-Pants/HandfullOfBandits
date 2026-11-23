// Feedback prompt (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1). Pure: one
// Markdown prompt from a saved note, its session export and the client diagnostics.
import type { CoinSimExport } from "./json.ts";

type Row = Record<string, unknown>;

export interface FeedbackInput {
  /** The saved note, as an export row (context parsed). */
  readonly annotation: Row;
  readonly data: CoinSimExport;
}

export function feedbackPrompt(input: FeedbackInput): string {
  return String(input.annotation["text"]);
}
