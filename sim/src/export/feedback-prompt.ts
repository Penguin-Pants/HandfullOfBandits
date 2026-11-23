// Feedback prompt (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1). Pure: one
// Markdown prompt from a saved note, its session export and the client diagnostics.
import type { CoinSimExport } from "./json.ts";

type Row = Record<string, unknown>;

export interface FeedbackInput {
  /** The saved note, as an export row (context parsed). */
  readonly annotation: Row;
  readonly data: CoinSimExport;
  /** Code that serves the app now: git commit, uncommitted changes, engine fingerprint. */
  readonly code: { readonly commit: string; readonly dirty: boolean; readonly fingerprint: string };
}

const REPOSITORY = "https://github.com/Penguin-Pants/HandfullOfBandits";
const RULE_FILES = ["AGENTS.md", "docs/rules/prototype-rules.md"];

const quoted = (text: string): string => text.split("\n").map((line) => `> ${line}`).join("\n");

export function feedbackPrompt(input: FeedbackInput): string {
  const { code } = input;
  const lines = [
    "# Feedback from play\n", `${quoted(String(input.annotation["text"]))}\n`, "Task: Find the root cause, write a failing test, fix it.\n",
    "## Code\n", `Repository: ${REPOSITORY}`, `Check out commit \`${code.commit}\`.`, `Code fingerprint: \`${code.fingerprint}\`.`, `Read first: ${RULE_FILES.map((f) => `\`${f}\``).join(", ")}.\n`,
  ];
  return `${lines.join("\n")}\n`;
}
