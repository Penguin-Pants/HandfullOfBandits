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
  const { code, annotation, data } = input;
  const session = data.sessions.find((s) => s["session_id"] === annotation["session_id"]) ?? {};
  const started = String(session["code_fingerprint"]);
  const warnings = [
    ...(code.dirty ? [`Warning: the app ran with uncommitted changes. Commit \`${code.commit}\` may not reproduce the problem.`] : []),
    ...(started === code.fingerprint ? [] : [`Warning: the session started on code fingerprint \`${started}\`. The app now runs \`${code.fingerprint}\`.`]),
  ];
  const lines = [
    "# Feedback from play\n", `${quoted(String(annotation["text"]))}\n`, "Task: Find the root cause, write a failing test, fix it.\n",
    "## Code\n", `Repository: ${REPOSITORY}`, `Check out commit \`${code.commit}\`.`, `Code fingerprint: \`${code.fingerprint}\`.`, ...warnings, `Read first: ${RULE_FILES.map((f) => `\`${f}\``).join(", ")}.\n`,
  ];
  return `${lines.join("\n")}\n`;
}
