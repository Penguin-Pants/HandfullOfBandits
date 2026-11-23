// Feedback prompt (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1). Pure: one
// Markdown prompt from a saved note, its session export and the client diagnostics.
import { list, obj, type CoinSimExport } from "./json.ts";
import { escaped, pairs } from "./markdown.ts";

type Row = Record<string, unknown>;

export interface FeedbackInput {
  /** The saved note, as an export row (context parsed). */
  readonly annotation: Row;
  readonly data: CoinSimExport;
  /** Code that serves the app now: git commit, uncommitted changes, engine fingerprint. */
  readonly code: { readonly commit: string; readonly dirty: boolean; readonly fingerprint: string };
  /** How many recent log entries and commands to show. Defaults: 30 each. */
  readonly limits?: { readonly log?: number; readonly commands?: number };
}

const REPOSITORY = "https://github.com/Penguin-Pants/HandfullOfBandits";
const RULE_FILES = ["AGENTS.md", "docs/rules/prototype-rules.md"];

const quoted = (text: string): string => text.split("\n").map((line) => `> ${line}`).join("\n");

/** Non-zero face counts of a piece or marker map: `type face=n`. */
const counts = (map: unknown): string => Object.entries(obj(map)).flatMap(([type, faces]) => Object.entries(obj(faces)).filter(([, n]) => n !== 0).map(([face, n]) => `${escaped(type)} ${escaped(face)}=${escaped(n)}`)).join(", ") || "none";

/** The selected space at the note's state (AC3.2). Needs an export with states. */
function selectedSpace(row: Row, id: unknown): string {
  if (typeof id !== "string") return "Selected space: none.";
  const space = obj(obj(obj(row["content"])["spaces"])[id]);
  const control = obj(obj(row["derived"])["control"])[id];
  return `Selected space: ${escaped(id)}. Level: ${escaped(space["level"] ?? "none")}. Control: ${escaped(control ?? "none")}.\nPieces: ${counts(space["pieces"])}.\nMarkers: ${counts(space["markers"])}.`;
}

/** Player of each faction at the note's state: "human" or the bot player ID (AC4.1). */
function seats(row: Row, session: Row): string[] {
  const bots = obj(session["seats"]);
  const factions = Object.keys(obj(obj(obj(row["content"])["initiative"])["boxes"]));
  return ["## Seats\n", "| Faction | Player |", "| --- | --- |", ...factions.map((f) => `| ${escaped(f)} | ${escaped(bots[f] ?? "human")} |`), ""];
}

/** Decision records of the note's action, when a bot played it (AC4.2). */
function botDecision(data: CoinSimExport, actionId: unknown): string[] {
  const records = list(data.actions.find((a) => a["action_id"] === actionId)?.["botDecisions"]);
  return records.length === 0 ? [] : [`## Bot decision (action ${escaped(actionId)})\n`, `\`\`\`json\n${JSON.stringify(records, null, 2)}\n\`\`\`\n`];
}

export function feedbackPrompt(input: FeedbackInput): string {
  const { code, annotation, data } = input;
  const ctx = obj(annotation["context"]);
  const session = data.sessions.find((s) => s["session_id"] === annotation["session_id"]) ?? {};
  const state = data.states.find((s) => s["state_hash"] === annotation["state_hash"]) ?? {};
  const started = String(session["code_fingerprint"]);
  const warnings = [
    ...(code.dirty ? [`Warning: the app ran with uncommitted changes. Commit \`${code.commit}\` may not reproduce the problem.`] : []),
    ...(started === code.fingerprint ? [] : [`Warning: the session started on code fingerprint \`${started}\`. The app now runs \`${code.fingerprint}\`.`]),
  ];
  const lines = [
    "# Feedback from play\n", `${quoted(String(annotation["text"]))}\n`, "Task: Find the root cause, write a failing test, fix it.\n",
    "## Code\n", `Repository: ${REPOSITORY}`, `Check out commit \`${code.commit}\`.`, `Code fingerprint: \`${code.fingerprint}\`.`, ...warnings, `Read first: ${RULE_FILES.map((f) => `\`${f}\``).join(", ")}.\n`,
    "## Game state\n",
    `Session: ${escaped(session["session_id"])}. Scenario: ${escaped(session["scenario_id"])}. Seed: ${escaped(session["seed"])}.`,
    `Campaign ${escaped(ctx["campaign"])}, Propaganda round ${escaped(ctx["propaganda_round"])}, card ${escaped(ctx["card_index"])}. Phase: ${escaped(ctx["phase"])}. Active faction: ${escaped(ctx["active_faction"] ?? "none")}.`,
    `Card: ${escaped(ctx["current_card_id"] ?? "none")} ${escaped(ctx["current_card_title"])}.`,
    `Eligibility: first ${escaped(ctx["first_eligible"] ?? "none")}, second ${escaped(ctx["second_eligible"] ?? "none")}.`,
    `Resources: ${pairs(ctx["resources"])}.`,
    `Tracks: ${pairs(ctx["tracks"])}.`,
    `Scores: ${pairs(ctx["scores"])}. Thresholds: ${pairs(ctx["thresholds"])}.`,
    `Harm counts: ${pairs(ctx["harm_counts"])}.\n`,
    `${selectedSpace(state, ctx["selected_space"])}\n`,
    ...seats(state, session),
    ...botDecision(data, annotation["action_id"]),
  ];
  return `${lines.join("\n")}\n`;
}
