// Markdown export (07 s8.2; minimal in P3a-08, full sections 1 to 6 in P4-02). Written for an AI
// assistant: each note and action line carries its IDs in brackets.
import { actionPlan, list, obj, type CoinSimExport } from "./json.ts";

type Row = Record<string, unknown>;

const escaped = (value: unknown): string => (typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : value == null ? "" : JSON.stringify(value)).replace(/([\\`*_{}[\]<>#|])/g, "\\$1");
const nested = (text: string, indent: string): string => text.split("\n").map((line) => (line === "" ? "" : `${indent}${line}`)).join("\n");
const note = (n: Row): string => `- [${escaped(n["annotation_id"])}; ${escaped(n["action_id"] ?? n["state_hash"] ?? n["session_id"])}; ${escaped(n["anchor"])}] ${escaped(n["text"]).replace(/\n/g, "\n  ")}\n`;
const refsOf = (action: Row): string[] => [...new Set(list(action["entries"]).flatMap((e) => [obj(e)["rule_ref"], obj(e)["assumption_ref"]]).filter((x): x is string => typeof x === "string"))];
const or = (value: unknown, fallback: string): string => (value === null || value === undefined || value === "" ? fallback : escaped(value));
const pairs = (value: unknown): string => Object.entries(obj(value)).map(([k, v]) => `${escaped(k)}=${escaped(v)}`).join(", ");

/** Op, SA or Event side of a committed action, as use count keys (07 s8.2 item 6). */
function usesOf(action: Row): string[] {
  const p = actionPlan(action);
  if (p.type === "ChooseOperation") return [p.op, p.sa].filter((x): x is string => x !== null);
  if (p.type === "ChooseEvent") return [`event.${String(p.side)}`];
  if (p.type === "Pass") return ["pass"];
  return [String(action["kind"])];
}

/** `state_changes` (07 s4.2) in one line. */
function changes(value: unknown): string {
  const c = obj(value);
  const from = (o: unknown): string[] => Object.entries(obj(o)).map(([id, v]) => `${id} ${String(obj(v)["before"])} to ${String(obj(v)["after"])}`);
  const faces = (rows: unknown, type: string, face: string): string[] => list(rows).map((r) => { const x = obj(r); return `${String(x["space"])} ${String(x[type])} ${String(x[face])} ${String(x["before"])} to ${String(x["after"])}`; });
  const all = [...from(c["tracks"]), ...from(c["levels"]), ...faces(c["pieces"], "piece", "face"), ...faces(c["markers"], "marker", "side"), ...from(c["control"]).map((x) => `Control ${x}`)];
  return all.length === 0 ? "none" : escaped(all.join("; "));
}

/** One note under its category (07 s8.2 item 4). Executed notes take the turn from their action. */
function categorized(n: Row, action: Row | undefined): string {
  const ctx = obj(n["context"]);
  const at = action ?? ctx;
  const card = action?.["card_id"] ?? ctx["current_card_id"];
  const rules = list(ctx["rule_refs"]).map((r) => `rule ${escaped(r)}`);
  const ids = [n["annotation_id"], n["action_id"], card].filter((x) => x !== null && x !== undefined).map(escaped);
  const sources = Object.entries(obj(ctx["rule_sources"])).map(([ref, s]) => `${escaped(ref)}: ${escaped(s)}`);
  const lines = [
    `- [${[...ids, ...rules, ...list(ctx["assumption_refs"]).map(escaped)].join("; ")}] ${escaped(n["text"]).replace(/\n/g, "\n  ")}`,
    `- Session: ${escaped(n["session_id"])}. Turn: ${escaped(at["campaign"])} round ${escaped(at["propaganda_round"])} card ${escaped(at["card_index"])}. Faction: ${or(action?.["faction"] ?? ctx["active_faction"], "none")}. Card: ${or(card, "none")}. Action: ${escaped(action?.["summary"] ?? n["anchor"])}.`,
  ];
  if (action !== undefined) lines.push(`- State changes: ${changes(ctx["state_changes"])}.`, `- Rule refs: ${rules.length === 0 ? "none" : list(ctx["rule_refs"]).map(escaped).join(", ")}. Research sources: ${sources.length === 0 ? "none in the package rule index" : sources.join("; ")}.`);
  const [first, ...rest] = lines;
  return `${first ?? ""}\n${rest.map((l) => nested(l, "  ")).join("\n")}\n`;
}

export function exportMarkdown(data: CoinSimExport): string {
  const manifestOf = (hash: unknown): Row => obj(data.packages.find((p) => p["package_hash"] === hash)?.["manifest"]);
  const version = (hash: unknown): string => { const m = manifestOf(hash); return `${escaped(m["packageId"])} ${escaped(m["version"])}, rules ${escaped(m["rulesetVersion"])}`; };
  const lines = ["# Playtest export\n", `Exported: ${escaped(data.exportMeta.exportedAt)}. App: ${escaped(data.exportMeta.appVersion)}.\n`, "## Scope\n", `Sessions: ${String(data.sessions.length)} (${data.sessions.map((s) => escaped(s["session_id"])).join(", ")}).\n`];
  for (const s of data.sessions) lines.push(`- [${escaped(s["session_id"])}] ${escaped(s["name"])}. Package ${version(s["package_hash"])}. Scenario ${escaped(s["scenario_id"])}, seed ${escaped(s["seed"])}. Winner: ${s["result"] === null ? "not ended" : escaped(obj(s["result"])["winner"] ?? "none")}.`);
  lines.push("", "## Prototype assumptions\n");
  for (const p of data.packages) {
    lines.push(`Package ${version(p["package_hash"])} (${escaped(p["package_hash"])}).\n`);
    for (const a of list(p["assumptions"]).map(obj)) lines.push(`- [${escaped(a["id"])}; ${escaped(a["status"])}] ${escaped(a["text"])}\n`);
  }
  for (const s of data.sessions) {
    const notes = data.annotations.filter((n) => n["session_id"] === s["session_id"]);
    const actions = data.actions.filter((a) => a["session_id"] === s["session_id"]);
    const result = obj(s["result"]);
    const minutes = Math.round((Date.parse(String(s["updated_at"])) - Date.parse(String(s["created_at"]))) / 60000);
    const cards = [...new Set(actions.filter((a) => a["status"] === "committed" && a["card_id"] !== null).map((a) => escaped(a["card_id"])))];
    lines.push(
      `## Session: ${escaped(s["name"])} [${escaped(s["session_id"])}]\n`,
      `Scenario: ${escaped(s["scenario_id"])}. Seed: ${escaped(s["seed"])}. Package ${version(s["package_hash"])}. Options: ${pairs(s["options"]) || "none"}. Status: ${escaped(s["status"])}.\n`,
      s["result"] === null ? "Result: not ended.\n" : `Result: winner ${escaped(result["winner"] ?? "none")}, reason ${escaped(result["reason"])}, labels ${list(result["labels"]).map(escaped).join(", ") || "none"}.\n`,
      `Record sheet: ${pairs(result["recordSheet"]) || "none"}.\n`,
      `Play time: ${String(minutes)} min (started ${escaped(s["created_at"])}, last change ${escaped(s["updated_at"])}).\n`,
      `Card order: ${cards.join(", ")}.\n`,
      "### Debrief\n",
    );
    for (const n of notes.filter((n) => n["anchor"] === "debrief")) lines.push(note(n));
    lines.push("### Actions\n");
    for (const a of actions) {
      lines.push(`- [${[a["action_id"], a["card_id"], ...refsOf(a)].filter((x) => x !== null).map(escaped).join("; ")}] ${escaped(a["campaign"])} round ${escaped(a["propaganda_round"])} card ${escaped(a["card_index"])}${a["faction"] === null ? "" : `, ${[a["faction"], a["box"], ...(a["kind"] === "cardChoice" ? usesOf(a) : [])].filter((x) => x !== null).map(escaped).join(" ")}`}: ${escaped(a["summary"])} (${escaped(a["status"])}).\n`);
      for (const n of notes.filter((n) => n["action_id"] === a["action_id"])) lines.push(nested(note(n), "  "));
    }
    lines.push("### Other notes\n");
    for (const n of notes.filter((n) => n["action_id"] === null && n["anchor"] !== "debrief")) lines.push(note(n));
  }
  lines.push("## Notes by category\n", "A note with no category is a General observation (07 s5). A note with two categories shows under each.\n");
  const labels = new Map(data.categories.map((c) => [c["category_id"], c["label"]]));
  const groups = [...data.categories.map((c) => c["category_id"]), ...(labels.has("general") ? [] : ["general"])];
  for (const id of groups) {
    const members = data.annotations.filter((n) => n["anchor"] !== "debrief" && (list(n["category_ids"]).includes(id) || (id === "general" && list(n["category_ids"]).length === 0)));
    if (members.length === 0) continue;
    lines.push(`### ${escaped(labels.get(id) ?? "General observation")}\n`);
    for (const n of members) lines.push(categorized(n, data.actions.find((a) => a["action_id"] === n["action_id"])));
  }
  const rounds = data.metrics.filter((m) => m["propaganda_round"] !== undefined);
  const factions = [...new Set(rounds.flatMap((m) => Object.keys(obj(obj(m["data"])["scores"]))))];
  const per = (label: string): string[] => factions.map((f) => `${escaped(f)} ${label}`);
  lines.push("## Round metrics\n", `| Session | Round | Campaign | ${[...per("score"), ...per("margin"), ...per("Resources"), ...per("Harm")].join(" | ")} | Legitimacy | Europe | Emergency Rule |`, `|${" --- |".repeat(6 + 4 * factions.length)}`);
  for (const m of rounds) {
    const d = obj(m["data"]);
    const cells = ["scores", "margins", "resources", "harm"].flatMap((key) => factions.map((f) => escaped(obj(d[key])[f])));
    lines.push(`| ${escaped(m["session_id"])} | ${escaped(m["propaganda_round"])} | ${escaped(d["campaign"])} | ${cells.join(" | ")} | ${escaped(d["legitimacy"])} | ${escaped(d["europe"])} | ${escaped(d["emergencyRule"])} |`);
  }
  lines.push("", "## Action use by faction\n", "Committed actions only. An Operation with a Special Activity counts once for each.\n", "| Session | Faction | Action | Uses |", "| --- | --- | --- | --- |");
  const counts = new Map<string, number>();
  for (const a of data.actions.filter((x) => x["status"] === "committed" && x["faction"] !== null)) {
    for (const use of usesOf(a)) {
      const key = [a["session_id"], a["faction"], use].map(escaped).join(" | ");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (const [key, n] of [...counts].sort(([a], [b]) => a.localeCompare(b))) lines.push(`| ${key} | ${String(n)} |`);
  return `${lines.join("\n")}\n`;
}
