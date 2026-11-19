// Card side coverage (audit Plan 3 A3): how often each card side ran in the replayed games of one or
// more experiments, with the runs that applied no effect. Counts follow the audit card ledger
// (docs/audit/playtest-readiness-audit.md section 3): an Event side runs once per `ChooseEvent` on
// that card, a Pivotal once per `PlayPivotal`, a Propaganda card once per reveal.
import { writeFileSync } from "node:fs";
import type { Card } from "../engine/core/types.ts";
import { capturedRuleset, experimentCoverage, type CardRuns } from "./experiment-coverage.ts";

export interface CardRow {
  readonly id: string;
  readonly title: string;
  readonly campaign: string;
  readonly type: Card["type"];
  readonly side: "unshaded" | "shaded" | "pivotal" | "propaganda";
  readonly runs: number;
  /** Runs that applied no effect; null for Propaganda reveals. */
  readonly noEffect: number | null;
}

/** One row per card side of `cards`, with the summed counts. */
export function cardRows(cards: readonly Card[], runs: Readonly<Record<string, CardRuns>>, reveals: Readonly<Record<string, number>>): CardRow[] {
  return [...cards].sort((a, b) => a.id.localeCompare(b.id)).flatMap((c): CardRow[] => {
    const row = (side: CardRow["side"]): CardRow => ({ id: c.id, title: c.title, campaign: c.campaign, type: c.type, side, runs: runs[`${c.id} ${side}`]?.runs ?? 0, noEffect: runs[`${c.id} ${side}`]?.noEffect ?? 0 });
    if (c.type === "propaganda") return [{ ...row("propaganda"), runs: reveals[c.id] ?? 0, noEffect: null }];
    if (c.type === "pivotal") return [row("pivotal")];
    return (["unshaded", "shaded"] as const).filter((side) => c[side] !== null).map(row);
  });
}

/** Markdown report: totals, sides that never ran, then every row. */
export function renderCardCoverage(rows: readonly CardRow[], sources: readonly string[], games: number): string {
  const events = rows.filter((r) => r.side === "unshaded" || r.side === "shaded");
  const never = rows.filter((r) => r.runs === 0);
  const out = [
    "# Card side coverage", "",
    `Sources: ${sources.join(", ")} (${String(games)} games, replayed). A run with no effect took the Event (or played the Pivotal) and applied nothing.`, "",
    `Event sides that ran: ${String(events.filter((r) => r.runs > 0).length)} of ${String(events.length)}, ${String(events.filter((r) => (r.noEffect ?? 0) < r.runs).length)} with an effect at least once. Pivotals played: ${String(rows.filter((r) => r.side === "pivotal" && r.runs > 0).length)} of ${String(rows.filter((r) => r.side === "pivotal").length)}.`, "",
    `Never ran: ${never.length === 0 ? "none" : never.map((r) => `${r.id} ${r.side}`).join(", ")}.`, "",
    "| ID | Title | C | Type | Side | Runs | No effect |", "|---|---|---|---|---|--:|--:|",
    ...rows.map((r) => `| ${r.id} | ${r.title} | ${r.campaign} | ${r.type} | ${r.side} | ${String(r.runs)} | ${r.noEffect === null ? "n/a" : String(r.noEffect)} |`),
  ];
  return `${out.join("\n")}\n`;
}

/** Replay the experiments in `dirs`, sum their card counts and write the report to `outFile`. */
export function cardsCommand(dirs: readonly string[], outFile: string): { readonly rows: readonly CardRow[]; readonly text: string } {
  const runs: Record<string, { runs: number; noEffect: number }> = {};
  const reveals: Record<string, number> = {};
  const cards = new Map<string, Card>();
  let games = 0;
  for (const dir of dirs) {
    for (const c of Object.values(capturedRuleset(dir).cards)) cards.set(c.id, c);
    const coverage = experimentCoverage(dir);
    games += coverage.games;
    for (const [k, v] of Object.entries(coverage.diagnostics.cards)) {
      const sum = (runs[k] ??= { runs: 0, noEffect: 0 });
      sum.runs += v.runs;
      sum.noEffect += v.noEffect;
    }
    for (const [k, v] of Object.entries(coverage.diagnostics.propagandaReveals)) reveals[k] = (reveals[k] ?? 0) + v;
  }
  const rows = cardRows([...cards.values()], runs, reveals);
  const text = renderCardCoverage(rows, dirs, games);
  writeFileSync(outFile, text, "utf8");
  return { rows, text };
}
