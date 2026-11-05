// CSV export (07 s8.3; P4-02, P4-03): `annotations.csv`, one row per note with flattened context,
// `actions.csv`, one row per action with costs and key changes, and `metrics.csv`, one row per
// Propaganda round (the metrics review table). RFC 4180: CRLF rows, quoted cells.
import { actionPlan, list, obj, type CoinSimExport } from "./json.ts";
import { metricsTable } from "./metrics.ts";

type Row = Record<string, unknown>;

/** One CSV cell. Objects and arrays are JSON; null and undefined are empty. */
export const csvCell = (v: unknown): string => {
  const s = v === undefined || v === null ? "" : typeof v === "string" ? v : JSON.stringify(v);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

function table(columns: readonly string[], rows: readonly Row[]): string {
  return [columns, ...rows.map((r) => columns.map((c) => r[c]))].map((r) => `${r.map(csvCell).join(",")}\r\n`).join("");
}

/** Context keys to two levels (`context.scores.state`); deeper values stay JSON in their cell. */
function flatten(context: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(context)) {
    const inner = obj(value);
    if (value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(inner).length > 0) {
      for (const [k, v] of Object.entries(inner)) out[`context.${key}.${k}`] = v;
    } else out[`context.${key}`] = value;
  }
  return out;
}

const NOTE_COLUMNS = ["annotation_id", "session_id", "branch_id", "action_id", "anchor", "state_hash", "decision_id", "executed_as", "category_ids", "tags", "text", "severity", "status", "addressed_in_version", "created_at", "updated_at"];
const ACTION_COLUMNS = ["action_id", "session_id", "branch_id", "seq", "branch_seq", "kind", "faction", "card_id", "campaign", "propaganda_round", "card_index", "phase", "box", "op", "sa", "event_side", "summary", "status", "undone_by", "undoneAfterRandom", "state_hash_before", "state_hash_after", "created_at", "costs", "score_changes", "harm_changes", "control_changes", "rule_refs", "notes"];

const faction = (f: unknown): string => (typeof f === "string" ? f : "none");

/** Non-zero numeric differences, as `key +n` items. */
function deltas(before: unknown, after: unknown): string {
  return Object.entries(obj(after)).flatMap(([k, v]) => {
    const d = Number(v) - Number(obj(before)[k] ?? 0);
    return d === 0 || Number.isNaN(d) ? [] : [`${k} ${d > 0 ? "+" : ""}${String(d)}`];
  }).join("; ");
}

export function exportCsv(data: CoinSimExport): { annotations: string; actions: string; metrics: string } {
  const notes = data.annotations.map((n) => ({ ...n, category_ids: list(n["category_ids"]).join("; "), tags: list(n["tags"]).join("; "), ...flatten(obj(n["context"])) }));
  const contextColumns = [...new Set(notes.flatMap((n) => Object.keys(n).filter((k) => k.startsWith("context."))))].sort();
  const derived = new Map(data.states.map((s) => [s["state_hash"], obj(s["derived"])]));
  const actions = data.actions.map((a) => {
    const entries = list(a["entries"]).map(obj);
    const plan = actionPlan(a);
    // Setup has no state before it, so it has no changes.
    const before = derived.get(a["state_hash_before"]);
    const after = before === undefined ? {} : (derived.get(a["state_hash_after"]) ?? {});
    const costs = new Map<string, number>();
    for (const e of entries.filter((x) => x["kind"] === "CostPaid")) {
      const track = String(obj(e["data"])["track"]);
      costs.set(track, (costs.get(track) ?? 0) + Number(obj(e["data"])["amount"]));
    }
    const control = Object.entries(obj(after["control"])).filter(([space, f]) => (obj(before?.["control"])[space] ?? null) !== f);
    return {
      ...a,
      op: plan.op,
      sa: plan.sa,
      event_side: plan.side,
      costs: [...costs].map(([track, n]) => `${track} ${String(n)}`).join("; "),
      score_changes: deltas(before?.["scores"], after["scores"]),
      harm_changes: deltas(before?.["harm"], after["harm"]),
      control_changes: control.map(([space, f]) => `${space} ${faction(obj(before?.["control"])[space])} to ${faction(f)}`).join("; "),
      rule_refs: [...new Set(entries.map((e) => e["rule_ref"]).filter((r) => typeof r === "string"))].join("; "),
      notes: data.annotations.filter((n) => n["action_id"] === a["action_id"]).length,
    };
  });
  return { annotations: table([...NOTE_COLUMNS, ...contextColumns], notes), actions: table(ACTION_COLUMNS, actions), metrics: metricsCsv(data) };
}

/** `metrics.csv`: the metrics review table, column keys as the header (P4-03). */
export function metricsCsv(data: CoinSimExport): string {
  const metrics = metricsTable(data);
  return table(metrics.columns.map((c) => c.key), metrics.rows);
}
