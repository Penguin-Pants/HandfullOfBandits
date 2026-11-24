// Feedback prompt (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1). Pure: one
// Markdown prompt from a saved note, its session export and the client diagnostics.
import { list, obj, pathsOf, type CoinSimExport } from "./json.ts";
import { escaped, pairs } from "./markdown.ts";

type Row = Record<string, unknown>;

/** One client error (Phase 2 buffer): a failed API request, an uncaught error or an unhandled rejection. */
export const CLIENT_ERROR_KINDS = ["request", "error", "rejection"] as const;

export interface ClientError {
  readonly kind: (typeof CLIENT_ERROR_KINDS)[number];
  readonly method?: string;
  readonly path?: string;
  readonly status?: number;
  readonly message: string;
}

export interface FeedbackInput {
  /** The saved note, as an export row (context parsed). */
  readonly annotation: Row;
  readonly data: CoinSimExport;
  /** Code that serves the app now: git commit, uncommitted changes, engine fingerprint. */
  readonly code: { readonly commit: string; readonly dirty: boolean; readonly fingerprint: string };
  readonly diagnostics: { readonly errors: readonly ClientError[] };
  /** How many recent log entries, commands and client errors to show. Defaults: 30, 30 and 10. */
  readonly limits?: { readonly log?: number; readonly commands?: number; readonly errors?: number };
}

const REPOSITORY = "https://github.com/Penguin-Pants/HandfullOfBandits";
const RULE_FILES = ["AGENTS.md", "docs/rules/prototype-rules.md"];

const quoted = (text: string): string => text.split("\n").map((line) => `> ${line}`).join("\n");

/** Non-zero face counts of a piece or marker map: `type face=n`. */
const counts = (map: unknown): string => Object.entries(obj(map)).flatMap(([type, faces]) => Object.entries(obj(faces)).filter(([, n]) => n !== 0).map(([face, n]) => `${escaped(type)} ${escaped(face)}=${escaped(n)}`)).join(", ") || "none";

/** The selected space at the head state of the note's context (AC3.2). Needs an export with states. */
function selectedSpace(row: Row, id: unknown): string {
  if (typeof id !== "string") return "Selected space: none.";
  const space = obj(obj(obj(row["content"])["spaces"])[id]);
  const control = obj(obj(row["derived"])["control"])[id];
  return `Selected space: ${escaped(id)}. Level: ${escaped(space["level"] ?? "none")}. Control: ${escaped(control ?? "none")}.\nPieces: ${counts(space["pieces"])}.\nMarkers: ${counts(space["markers"])}.`;
}

/** Player of each faction: "human" or the bot player ID (AC4.1). */
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

/** The last `n` items; `n` of 0 gives none (`slice(-0)` would give all). */
const last = <T>(items: readonly T[], n: number): readonly T[] => items.slice(Math.max(0, items.length - n));

const inline = (value: unknown): string => `\`${JSON.stringify(value)}\``;

/** Last log entries and commands on the path from setup to the session head (AC5.1). */
function recent(data: CoinSimExport, session: Row, limits: FeedbackInput["limits"]): string[] {
  const head = session["head_action_id"];
  const path = typeof head === "string" ? pathsOf(data)(head) : [];
  const entries = path.flatMap((a) => list(a["entries"]).map((e) => ({ id: a["action_id"], e: obj(e) })));
  const commands = path.flatMap((a) => list(a["commands"]).map((c) => ({ id: a["action_id"], c: obj(c) })));
  const logShown = last(entries, limits?.log ?? 30);
  const commandsShown = last(commands, limits?.commands ?? 30);
  return [
    `## Recent log (last ${String(logShown.length)} of ${String(entries.length)} entries)\n`,
    ...logShown.map(({ id, e }) => `- ${escaped(id)} ${escaped(e["kind"])}${e["rule_ref"] == null ? "" : `, rule ${escaped(e["rule_ref"])}`}: ${inline(e["data"])}`),
    "",
    `## Recent commands (last ${String(commandsShown.length)} of ${String(commands.length)})\n`,
    ...commandsShown.map(({ id, c }) => {
      const v = obj(c["validation"]);
      return `- ${escaped(id)} ${inline(c["payload"])} Validation: ${inline({ ok: v["ok"], violations: v["violations"], warnings: v["warnings"] })}`;
    }),
    "",
  ];
}

/** Last client errors (AC5.2). A request keeps only the path of its URL: no host or query (Risk 2). */
function clientErrors(errors: readonly ClientError[], limit: number): string[] {
  if (errors.length === 0) return ["## Client errors\n", "None.\n"];
  const shown = last(errors, limit);
  const line = (e: ClientError): string => {
    const message = escaped(e.message.replace(/\s+/g, " "));
    return e.kind === "request" ? `- request ${escaped(e.method)} ${escaped(URL.parse(e.path ?? "", "http://localhost")?.pathname ?? "")}: ${escaped(e.status)} ${message}` : `- ${e.kind}: ${message}`;
  };
  return [`## Client errors (last ${String(shown.length)} of ${String(errors.length)})\n`, ...shown.map(line), ""];
}

/** The drafted command of a proposed note, with its validation (07 s4.2 `plan`, `validation`). */
function proposed(annotation: Row, ctx: Row): string[] {
  return annotation["action_id"] == null && ctx["plan"] !== undefined ? ["## Proposed command\n", `${inline(ctx["plan"])} Validation: ${inline(ctx["validation"])}\n`] : [];
}

/** The `PlayRecord` file that `sim replay <file.json>` reads (`cli/play.ts`; export may not import cli, 03 s5). */
export interface ReplayRecord {
  readonly scenario: string;
  readonly seed: number;
  readonly options: Readonly<Record<string, unknown>>;
  readonly package: { readonly id: string; readonly version: string; readonly hash: string };
  /** Setup variant of the session (`variants/<name>.yaml` in the package), when it started with one. */
  readonly variant?: string;
  readonly commands: readonly unknown[];
  readonly hashes: readonly (string | null)[];
  readonly ended: boolean;
}

/**
 * PlayRecord of the path from setup to the session head (AC6.1). The store keeps one hash per action
 * (`storedSteps`), so the hash after a command inside an action is null.
 */
export function replayRecord(data: CoinSimExport, session: Row, state: Row): ReplayRecord {
  const head = session["head_action_id"];
  const [setup, ...actions] = typeof head === "string" ? pathsOf(data)(head) : [];
  const pkg = obj(data.packages.find((p) => p["package_hash"] === session["package_hash"]));
  const manifest = obj(pkg["manifest"]);
  const variant = list(pkg["variants"]).map(obj).find((v) => v["scenario"] === session["scenario_id"])?.["name"];
  return {
    scenario: String(session["scenario_id"]), seed: Number(session["seed"]),
    options: obj(session["options"]),
    package: { id: String(manifest["packageId"]), version: String(manifest["version"]), hash: String(session["package_hash"]) },
    ...(typeof variant === "string" ? { variant } : {}),
    commands: actions.flatMap((a) => list(a["commands"]).map((c) => obj(c)["payload"])),
    hashes: [String(setup?.["state_hash_after"]), ...actions.flatMap((a) => list(a["commands"]).map((_, i, all) => (i === all.length - 1 ? String(a["state_hash_after"]) : null)))],
    ended: obj(state["content"])["ended"] != null,
  };
}

/** The replay record with the `sim replay` command and the expected state hash (AC6.2). */
function replaySection(record: ReplayRecord, file: string, expectedHash: unknown, separate: boolean): string[] {
  return [
    "## Replay record\n",
    ...(separate ? [`The prompt with the record is above ${String(PROMPT_LIMIT_KB)} KB, so the record is in a separate file: download \`${file}\`.`] : []),
    `Save the record as \`sim/${file}\`. Then run \`cd sim && npm run --silent sim -- replay ${file} --package ../game-packages/${record.package.id}/${record.package.version}\`.`,
    `Expected result: \`identical (${String(record.commands.length)} commands)\`. Expected state hash: \`${String(expectedHash)}\`.\n`,
    ...(separate ? [] : [`\`\`\`json\n${JSON.stringify(record)}\n\`\`\`\n`]),
  ];
}

/** D2: above this size (UTF-8 bytes) the replay record goes to a separate file (AC6.3). */
const PROMPT_LIMIT_KB = 60;
const bytes = (text: string): number => new TextEncoder().encode(text).length;

/** The prompt, and the replay record when it is too large for the prompt (AC6.3, D2). */
export interface FeedbackReport {
  readonly prompt: string;
  /** The record and the file name the prompt gives it. */
  readonly replay?: { readonly file: string; readonly record: ReplayRecord };
}

export function feedbackPrompt(input: FeedbackInput): FeedbackReport {
  const { code, annotation, data } = input;
  const ctx = obj(annotation["context"]);
  const session = data.sessions.find((s) => s["session_id"] === annotation["session_id"]) ?? {};
  // The context describes the head at note time; a note on a past action keeps that action's hash in `state_hash`.
  const state = data.states.find((s) => s["state_hash"] === ctx["state_hash"]) ?? {};
  const started = String(session["code_fingerprint"]);
  const warnings = [
    ...(code.commit === "unknown" ? ["Warning: the app could not read its git commit. Ask the user which commit they ran."] : []),
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
    ...proposed(annotation, ctx),
    ...botDecision(data, annotation["action_id"]),
    ...recent(data, session, input.limits),
    ...clientErrors(input.diagnostics.errors, input.limits?.errors ?? 10),
  ];
  const record = replayRecord(data, session, state);
  const file = `replay-${String(session["session_id"])}.json`;
  const join = (separate: boolean): string => `${[...lines, ...replaySection(record, file, ctx["state_hash"], separate)].join("\n")}\n`;
  const full = join(false);
  return bytes(full) <= PROMPT_LIMIT_KB * 1024 ? { prompt: full } : { prompt: join(true), replay: { file, record } };
}
