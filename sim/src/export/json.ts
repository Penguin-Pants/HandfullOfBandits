// JSON export `coin-sim-export/1` (07 s8.1; 11 P2-18). Rows come from the store; relationships use
// IDs only and `validateExport` checks that every reference resolves inside the file (T-EXP).
import type { AnnotationRow } from "../store/repos/annotations.ts";
import type { Db } from "../store/migrate.ts";
import { listActions } from "../store/repos/actions.ts";
import { listAnnotations } from "../store/repos/annotations.ts";
import { listCategories } from "../store/repos/categories.ts";
import { listCommands } from "../store/repos/commands.ts";
import { listEntries } from "../store/repos/log-entries.ts";
import { listMetrics } from "../store/repos/metrics.ts";
import { loadPackageContent } from "../store/repos/packages.ts";
import { getSession } from "../store/repos/sessions.ts";
import { loadState } from "../store/repos/states.ts";

export const EXPORT_SCHEMA = "coin-sim-export/1";

export interface ExportOptions {
  readonly sessionIds: readonly string[];
  readonly withStates: boolean;
  readonly appVersion: string;
  /** Export time, ISO 8601. The caller supplies it so tests are deterministic. */
  readonly exportedAt: string;
}

type Row = Record<string, unknown>;

export interface CoinSimExport {
  readonly exportMeta: { readonly schema: string; readonly appVersion: string; readonly exportedAt: string; readonly filter: { readonly sessionIds: readonly string[]; readonly withStates: boolean } };
  readonly packages: readonly Row[];
  readonly sessions: readonly Row[];
  readonly branches: readonly Row[];
  readonly categories: readonly Row[];
  readonly actions: readonly Row[];
  readonly states: readonly Row[];
  readonly annotations: readonly Row[];
  readonly metrics: readonly Row[];
  readonly index: { readonly annotations: readonly Row[] };
}

const parse = (text: string | null): unknown => (text === null ? null : (JSON.parse(text) as unknown));

function annotationRow(n: AnnotationRow): Row {
  return { ...n, context: parse(n.context), category_ids: parse(n.category_ids), tags: parse(n.tags) };
}

export function exportJson(db: Db, options: ExportOptions): CoinSimExport {
  const sessions: Row[] = [];
  const branches: Row[] = [];
  const actions: Row[] = [];
  const annotations: Row[] = [];
  const metrics: Row[] = [];
  const hashes = new Set<string>();
  const packageHashes = new Set<string>();
  for (const id of options.sessionIds) {
    const s = getSession(db, id);
    if (s === null) throw new RangeError(`Unknown session "${id}"`);
    packageHashes.add(s.package_hash);
    const notes = listAnnotations(db, id);
    const debrief = notes.find((n) => n.anchor === "debrief")?.annotation_id ?? null;
    sessions.push({ ...s, options: parse(s.options), modules: parse(s.modules), excluded_cards: parse(s.excluded_cards), result: parse(s.result), debrief_annotation_id: debrief });
    branches.push(...(db.prepare("SELECT * FROM branches WHERE session_id = ?").all(id) as Row[]));
    const flags: Row[] = [];
    for (const a of db.prepare("SELECT branch_id FROM branches WHERE session_id = ?").all(id) as { branch_id: string }[]) {
      for (const action of listActions(db, a.branch_id)) {
        const entries = listEntries(db, action.action_id).map((e) => ({ ...e, data: parse(e.data) }));
        for (const e of entries.filter((x) => x.kind === "StopRuleFlag")) flags.push({ action_id: action.action_id, entry_id: e.entry_id, ...(e.data as Row) });
        const undo = entries.find((e) => e.kind === "Undo");
        actions.push({
          ...action,
          commands: listCommands(db, action.action_id).map((c) => ({ ...c, payload: parse(c.payload), validation: parse(c.validation), rng_before: parse(c.rng_before) })),
          entries,
          undoneAfterRandom: undo === undefined ? null : ((undo.data as Row)["undoneAfterRandom"] ?? false),
        });
        if (action.state_hash_before !== null) hashes.add(action.state_hash_before);
        hashes.add(action.state_hash_after);
      }
    }
    for (const n of notes) {
      annotations.push(annotationRow(n));
      if (n.state_hash !== null) hashes.add(n.state_hash);
    }
    metrics.push(...listMetrics(db, id).map((m) => ({ ...m, data: parse(m.data) })), ...flags.map((f) => ({ session_id: id, stopRuleFlag: f })));
  }
  const packages = [...packageHashes].sort().map((hash) => {
    const content = parse(loadPackageContent(db, hash)) as Record<string, unknown> | null;
    return { package_hash: hash, manifest: content?.["manifest.yaml"] ?? null, parameters: content?.["parameters.yaml"] ?? null, assumptions: content?.["assumptions.yaml"] ?? [], ruleIndex: {} };
  });
  const states = [...hashes].sort().map((hash) => {
    const s = loadState(db, hash);
    return { state_hash: hash, derived: parse(s?.derived ?? null), ...(options.withStates ? { content: parse(s?.content ?? null) } : {}) };
  });
  const used = new Set(annotations.flatMap((a) => a["category_ids"] as string[]));
  const categories: Row[] = listCategories(db).filter((c) => used.has(c.category_id)).map((c) => ({ ...c }));
  const index = annotations.map((a) => {
    const session = sessions.find((s) => s["session_id"] === a["session_id"]);
    const action = actions.find((x) => x["action_id"] === a["action_id"]);
    return { annotation_id: a["annotation_id"], action_id: a["action_id"], state_hash: a["state_hash"], package_hash: session?.["package_hash"] ?? null, rule_refs: action === undefined ? [] : [...new Set((action["entries"] as Row[]).map((e) => e["rule_ref"]).filter((r) => r !== null))] };
  });
  return {
    exportMeta: { schema: EXPORT_SCHEMA, appVersion: options.appVersion, exportedAt: options.exportedAt, filter: { sessionIds: options.sessionIds, withStates: options.withStates } },
    packages, sessions, branches, categories, actions, states, annotations, metrics, index: { annotations: index },
  };
}

/** T-EXP: every ID reference resolves inside the file. Returns the broken references. */
export function validateExport(e: CoinSimExport): string[] {
  const ids = (rows: readonly Row[], key: string): Set<unknown> => new Set(rows.map((r) => r[key]));
  const packages = ids(e.packages, "package_hash");
  const sessions = ids(e.sessions, "session_id");
  const branches = ids(e.branches, "branch_id");
  const actions = ids(e.actions, "action_id");
  const states = ids(e.states, "state_hash");
  const notes = ids(e.annotations, "annotation_id");
  const categories = ids(e.categories, "category_id");
  const broken: string[] = [];
  const need = (set: Set<unknown>, value: unknown, where: string): void => {
    if (value !== null && value !== undefined && !set.has(value)) broken.push(`${where}: ${JSON.stringify(value)}`);
  };
  for (const s of e.sessions) {
    need(packages, s["package_hash"], "session.package_hash");
    need(branches, s["current_branch_id"], "session.current_branch_id");
    need(actions, s["head_action_id"], "session.head_action_id");
    need(notes, s["debrief_annotation_id"], "session.debrief_annotation_id");
  }
  for (const b of e.branches) need(sessions, b["session_id"], "branch.session_id");
  for (const a of e.actions) {
    need(sessions, a["session_id"], "action.session_id");
    need(branches, a["branch_id"], "action.branch_id");
    need(states, a["state_hash_before"], "action.state_hash_before");
    need(states, a["state_hash_after"], "action.state_hash_after");
  }
  for (const n of e.annotations) {
    need(sessions, n["session_id"], "annotation.session_id");
    need(branches, n["branch_id"], "annotation.branch_id");
    need(actions, n["action_id"], "annotation.action_id");
    need(states, n["state_hash"], "annotation.state_hash");
    for (const c of n["category_ids"] as unknown[]) need(categories, c, "annotation.category_ids");
  }
  for (const m of e.metrics) {
    need(sessions, m["session_id"], "metrics.session_id");
    need(actions, m["action_id"] ?? (m["stopRuleFlag"] as Row | undefined)?.["action_id"], "metrics.action_id");
  }
  for (const i of e.index.annotations) {
    need(notes, i["annotation_id"], "index.annotation_id");
    need(actions, i["action_id"], "index.action_id");
    need(states, i["state_hash"], "index.state_hash");
    need(packages, i["package_hash"], "index.package_hash");
  }
  return broken;
}
