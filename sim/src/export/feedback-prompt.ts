// Feedback prompt (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1). Pure: one
// Markdown prompt from a saved note, its session export and the client diagnostics.
import type { CoinSimExport } from "./json.ts";

type Row = Record<string, unknown>;

export interface FeedbackInput {
  /** The saved note, as an export row (context parsed). */
  readonly annotation: Row;
  readonly data: CoinSimExport;
}

const quoted = (text: string): string => text.split("\n").map((line) => `> ${line}`).join("\n");

export function feedbackPrompt(input: FeedbackInput): string {
  const lines = ["# Feedback from play\n", `${quoted(String(input.annotation["text"]))}\n`, "Task: Find the root cause, write a failing test, fix it.\n"];
  return `${lines.join("\n")}\n`;
}
