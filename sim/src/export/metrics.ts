// Metrics review table (11 P4-03; 06 s3.12, s4): one row per session, branch and Propaganda round
// with the research 12 s4 logging sheet items 6 to 12, 14 and 15. Board values come from the
// RoundMetrics row (DEC-34). Round events (State step choice, closure filings, successor returns,
// action use) come from the actions of the round on the row's path (a fork's path starts in its
// parent branch, P4-04): after the previous round's metrics action, up to and including this round's.
// The screen, `metrics.csv` and Markdown section 5 use it.
import { actionPlan, list, obj, pathOf, type CoinSimExport } from "./json.ts";

type Row = Record<string, unknown>;
export type Cell = string | number | boolean | null;

export interface MetricsColumn {
  readonly key: string;
  readonly label: string;
  /** Research 12 s4 logging sheet item; 0 for the row identity. */
  readonly item: number;
}

export interface MetricsTable {
  readonly columns: readonly MetricsColumn[];
  readonly rows: readonly Readonly<Record<string, Cell>>[];
}

/** Op, SA or Event side of a committed action, as use count keys (07 s8.2 item 6). */
export function usesOf(action: Row): string[] {
  const p = actionPlan(action);
  if (p.type === "ChooseOperation") {
    // The engine logs EffectSkipped for an Op or SA that did not run (choose-operation.ts).
    const skipped = new Set(list(action["entries"]).map(obj).filter((e) => e["kind"] === "EffectSkipped").map((e) => obj(e["data"])).filter((d) => d["effect"] === "operation" || d["effect"] === "specialActivity").map((d) => d["action"]));
    return [p.op, p.sa].filter((x): x is string => x !== null && !skipped.has(x));
  }
  if (p.type === "ChooseEvent") return [`event.${String(p.side)}`];
  if (p.type === "Pass") return ["pass"];
  // The command type, not the stored kind: the store files some faction actions as `advance`.
  return [p.type ?? String(action["kind"])];
}

const applied = (action: Row): Row[] => list(action["entries"]).map(obj).filter((e) => e["kind"] === "EffectApplied").map((e) => obj(e["data"]));
const cell = (v: unknown): Cell => (typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? v : null);

/** Round events from the committed actions of one round (12 s4 items 7, 9 and 14). */
function roundEvents(actions: readonly Row[]): Record<string, Cell> {
  // The State's step 8 choice is the legitimacy phase command; Advance means no move (07 s8.2).
  const step = actions.flatMap((a) => list(a["commands"]).map((c) => obj(obj(c)["payload"]))).find((c) => c["type"] === "PropagandaChoice" && c["phase"] === "legitimacy");
  const effects = actions.flatMap(applied);
  const uses = new Map<string, number>();
  for (const a of actions.filter((x) => x["faction"] !== null)) {
    for (const use of usesOf(a)) {
      const key = use.startsWith(`${String(a["faction"])}.`) ? use : `${String(a["faction"])}.${use}`;
      uses.set(key, (uses.get(key) ?? 0) + 1);
    }
  }
  return {
    state_step_choice: cell(obj(step?.["choice"])["emergencyStep"]) ?? "none",
    closure_filings: effects.filter((d) => d["effect"] === "setFlag" && d["flag"] === "closureCase" && d["after"] === true && d["before"] !== true).length,
    successor_returns: effects.filter((d) => d["effect"] === "setTrack" && d["track"] === "legalSpace" && d["before"] === "banned" && d["after"] === "prosecuted").length,
    action_use: [...uses].sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => `${k} ${String(n)}`).join("; "),
  };
}

/** Leadership side on the map (item 8): the side with a marker, or "none". */
function leadership(markers: Row): Cell {
  return Object.entries(obj(markers["leadership"])).find(([, n]) => Number(n) > 0)?.[0] ?? "none";
}

/**
 * Marker types with no item 11 column: named under items 8 to 10, or never on the map (Capabilities
 * and Momentum are modifiers; the closure case is a flag and the Successor value a track, DEC-65).
 */
const NAMED_MARKERS = new Set(["office", "restraintBroken", "leadership", "capability", "momentum", "closureCase", "successor"]);

export function metricsTable(data: CoinSimExport): MetricsTable {
  // Undo keeps a metrics row; only rows of committed actions are results.
  const committed = new Set(data.actions.filter((a) => a["status"] === "committed").map((a) => a["action_id"]));
  const rounds = data.metrics.filter((m) => m["propaganda_round"] !== undefined);
  const metrics = rounds.filter((m) => committed.has(m["action_id"]));
  const roundEnds = new Set(rounds.map((m) => m["action_id"]));
  const factions = [...new Set(metrics.flatMap((m) => Object.keys(obj(obj(m["data"])["scores"]))))];
  const pieces = [...new Set(metrics.flatMap((m) => Object.keys(obj(obj(m["data"])["available"]))))];
  // [marker, side] pairs; a one-sided marker has side "default" (SINGLE_FACE) and no side in its key.
  const markerPairs = [...new Map(metrics.flatMap((m) => Object.entries(obj(obj(m["data"])["markers"])).filter(([id]) => !NAMED_MARKERS.has(id)).flatMap(([id, sides]) => Object.keys(obj(sides)).map((side): [string, [string, string]] => [side === "default" ? id : `${id}.${side}`, [id, side]])))).entries()].sort(([a], [b]) => a.localeCompare(b));
  const per = (key: string, label: string, item: number): MetricsColumn[] => factions.map((f) => ({ key: `${key}.${f}`, label: `${f} ${label}`, item }));
  const columns: MetricsColumn[] = [
    { key: "session_id", label: "Session", item: 0 }, { key: "branch_id", label: "Branch", item: 0 }, { key: "round", label: "Round", item: 0 }, { key: "campaign", label: "Campaign", item: 0 },
    ...per("resources", "Resources", 6), ...per("income", "income", 6), { key: "legitimacy", label: "Legitimacy", item: 6 }, { key: "europe", label: "Europe", item: 6 },
    { key: "emergency_rule", label: "Emergency Rule", item: 7 }, { key: "state_step_choice", label: "State step choice", item: 7 },
    { key: "posture.syria", label: "Syria posture", item: 8 }, { key: "posture.kdp", label: "KDP posture", item: 8 }, { key: "posture.puk", label: "PUK posture", item: 8 }, { key: "leadership", label: "Leadership", item: 8 },
    { key: "legal_space", label: "Legal Space", item: 9 }, { key: "offices", label: "Offices", item: 9 }, { key: "closure_case", label: "Closure case pending", item: 9 }, { key: "closure_filings", label: "Closure filings", item: 9 }, { key: "successor", label: "Successor", item: 9 }, { key: "successor_returns", label: "Successor returns", item: 9 },
    { key: "ceasefire", label: "Ceasefire", item: 10 }, { key: "restraint_broken.state", label: "Restraint Broken State", item: 10 }, { key: "restraint_broken.pkk", label: "Restraint Broken PKK", item: 10 },
    ...per("harm", "Harm", 11), ...markerPairs.map(([k]) => ({ key: `markers.${k}`, label: `${k} markers`, item: 11 })),
    ...per("score", "score", 12), ...per("threshold", "threshold", 12), ...per("margin", "margin", 12),
    { key: "action_use", label: "Action use", item: 14 },
    ...pieces.map((p) => ({ key: `available.${p}`, label: `${p} Available`, item: 15 })),
  ];
  const rows = metrics.map((m) => {
    const d = obj(m["data"]);
    const markers = obj(d["markers"]);
    const postures = obj(d["postures"]);
    const has = d["markers"] !== undefined;
    const count = (id: string, side: string): Cell => (has ? Number(obj(markers[id])[side] ?? 0) : null);
    // The round: actions on the path to this metrics action, after the previous one on that path.
    const path = pathOf(data, String(m["action_id"]));
    const round = path.slice(path.findLastIndex((a, i) => i < path.length - 1 && roundEnds.has(a["action_id"])) + 1);
    const row: Record<string, Cell> = {
      session_id: cell(m["session_id"]), branch_id: cell(m["branch_id"]), round: cell(m["propaganda_round"]), campaign: cell(d["campaign"]),
      legitimacy: cell(d["legitimacy"]), europe: cell(d["europe"]), emergency_rule: cell(d["emergencyRule"]),
      "posture.syria": cell(postures["syria"]), "posture.kdp": cell(postures["kdp"]), "posture.puk": cell(postures["puk"]), leadership: has ? leadership(markers) : null,
      legal_space: cell(d["legalSpace"]), offices: count("office", "default"), closure_case: cell(d["closureCase"]), successor: cell(d["successor"]),
      ceasefire: cell(d["ceasefire"]), "restraint_broken.state": count("restraintBroken", "state"), "restraint_broken.pkk": count("restraintBroken", "pkk"),
      ...roundEvents(round),
    };
    for (const f of factions) {
      row[`resources.${f}`] = cell(obj(d["resources"])[f]);
      row[`income.${f}`] = cell(obj(d["income"])[f]);
      row[`harm.${f}`] = cell(obj(d["harm"])[f]);
      row[`score.${f}`] = cell(obj(d["scores"])[f]);
      row[`threshold.${f}`] = cell(obj(d["thresholds"])[f]);
      row[`margin.${f}`] = cell(obj(d["margins"])[f]);
    }
    for (const [k, [id, side]] of markerPairs) row[`markers.${k}`] = count(id, side);
    for (const p of pieces) row[`available.${p}`] = cell(obj(d["available"])[p]);
    return row;
  });
  return { columns, rows };
}
