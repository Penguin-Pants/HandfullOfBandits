// Metrics review (11 P4-03; 06 s3.12, s4): one row per session and Propaganda round, columns grouped
// by research 12 s4 logging sheet item. No charts (07 s7). Checked sessions limit the table and the
// CSV download; none checked means every session.
import { useEffect, useState } from "react";
import { metricsQuery, type Api, type MetricsCell, type MetricsTable, type SessionRow } from "../api.ts";

export function Metrics({ api }: { readonly api: Api }) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [checked, setChecked] = useState<readonly string[]>([]);
  const [table, setTable] = useState<MetricsTable>({ columns: [], rows: [] });
  const key = checked.join(",");
  useEffect(() => { void api.sessions().then(setSessions); }, [api]);
  useEffect(() => { void api.metrics(key === "" ? [] : key.split(",")).then(setTable); }, [api, key]);
  const names = new Map(sessions.map((s) => [s.session_id, s.name]));
  const shown = (key: string, value: MetricsCell | undefined): string => (value === null || value === undefined ? "" : key === "session_id" ? (names.get(String(value)) ?? String(value)) : String(value));
  const toggle = (id: string): void => { setChecked(checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id]); };
  // Consecutive columns of one sheet item share a group header.
  const groups: { item: number; span: number }[] = [];
  for (const c of table.columns) {
    const last = groups.at(-1);
    if (last?.item === c.item) last.span += 1;
    else groups.push({ item: c.item, span: 1 });
  }

  return (
    <div className="screen metrics" aria-label="Metrics review">
      <h2>Metrics review</h2>
      <p className="muted">One row per Propaganda round. Columns follow the research 12 s4 logging sheet items 6 to 12, 14 and 15. Item 13 (decision changed by Legal Space or Offices) needs the Propaganda prompt, which is not built.</p>
      <div className="row" aria-label="Sessions">
        {sessions.map((s) => (
          <label key={s.session_id}>
            <input type="checkbox" checked={checked.includes(s.session_id)} onChange={() => { toggle(s.session_id); }} /> {s.name}
          </label>
        ))}
        <a href={`/api/metrics.csv${metricsQuery(checked)}`} download="metrics.csv">Download metrics.csv</a>
      </div>
      <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {groups.map((g, i) => <th key={i} colSpan={g.span}>{g.item === 0 ? "" : `Item ${String(g.item)}`}</th>)}
          </tr>
          <tr>
            {table.columns.map((c) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={`${String(r["session_id"])}|${String(r["branch_id"])}|${String(r["round"])}`}>
              {table.columns.map((c) => <td key={c.key}>{shown(c.key, r[c.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {table.rows.length === 0 && <p className="muted">No Propaganda round has ended in these sessions.</p>}
    </div>
  );
}
