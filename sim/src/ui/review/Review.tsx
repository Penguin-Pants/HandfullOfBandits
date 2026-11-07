// Feedback review (07 s7; 11 P2-17, P4-01): notes across sessions, filters including the ruleset
// version, plain substring search, saved filters in the browser (owner decision, P4-01), bulk status
// and open the state a note links to.
import { useEffect, useState } from "react";
import type { Api, ReviewRow } from "../api.ts";

const FILTERS = ["faction", "card", "space", "category", "version", "rulesetVersion", "session", "anchor", "status"] as const;
const STATUSES = [["open", "Mark open"], ["addressed", "Mark addressed"], ["wontfix", "Mark won't fix"]] as const;
const SAVED_KEY = "hob.review.savedFilters";

type Filter = Record<string, string>;

function loadSaved(): Record<string, Filter> {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "{}") as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, Filter>) : {};
  } catch {
    return {};
  }
}

function storeSaved(saved: Record<string, Filter>): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

export interface ReviewProps {
  readonly api: Api;
  readonly onOpenState: (sessionId: string, hash: string) => void;
}

export function Review({ api, onOpenState }: ReviewProps) {
  const [filter, setFilter] = useState<Filter>({});
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, Filter>>(loadSaved);
  const [name, setName] = useState("");
  const query = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ""));
  const key = JSON.stringify(query);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    setRows([]);
    setSelected(new Set());
    void api.review(JSON.parse(key) as Filter).then((next) => {
      if (!current) return;
      setRows(next);
      setLoading(false);
    }, (e: unknown) => {
      if (!current) return;
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    });
    return () => { current = false; };
  }, [api, key, reload]);

  const updateSaved = (next: Record<string, Filter>): void => {
    storeSaved(next);
    setSaved(next);
  };
  const toggle = (id: string): void => {
    const next = new Set(selected);
    if (!next.delete(id)) next.add(id);
    setSelected(next);
  };
  const all = rows.length > 0 && rows.every((r) => selected.has(r.annotationId));

  return (
    <div className="screen" aria-label="Feedback review">
      <div className="row">
        {[...FILTERS, "q"].map((f) => (
          <label key={f}>
            {f === "q" ? "Search" : f}{" "}
            <input size={10} value={filter[f] ?? ""} onChange={(e) => { setFilter({ ...filter, [f]: e.target.value }); }} />
          </label>
        ))}
      </div>
      <div className="row" aria-label="Saved filters">
        <label>
          Filter name <input size={14} value={name} onChange={(e) => { setName(e.target.value); }} />
        </label>
        <button type="button" disabled={name.trim() === ""} onClick={() => { updateSaved({ ...saved, [name.trim()]: query }); setName(""); }}>
          Save filter
        </button>
        {Object.entries(saved).map(([n, f]) => (
          <span key={n}>
            <button type="button" onClick={() => { setFilter(f); }}>{n}</button>
            <button type="button" aria-label={`Delete ${n}`} onClick={() => { updateSaved(Object.fromEntries(Object.entries(saved).filter(([k]) => k !== n))); }}>×</button>
          </span>
        ))}
      </div>
      {error !== null && <div><p role="alert">Could not load notes: {error}</p><button type="button" onClick={() => { setReload((n) => n + 1); }}>Retry</button></div>}
      {loading && <p role="status">Loading notes…</p>}
      <div className="row" aria-label="Bulk status">
        {STATUSES.map(([status, label]) => (
          <button key={status} type="button" disabled={loading || selected.size === 0} onClick={() => { void api.setNoteStatus([...selected], status).then(() => { setReload(reload + 1); }); }}>
            {label}
          </button>
        ))}
        <span className="muted">{selected.size} selected</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input type="checkbox" aria-label="Select all" checked={all} onChange={() => { setSelected(all ? new Set() : new Set(rows.map((r) => r.annotationId))); }} />
            </th>
            <th>Time</th>
            <th>Session</th>
            <th>Version</th>
            <th>Ruleset</th>
            <th>Anchor</th>
            <th>Faction</th>
            <th>Card</th>
            <th>Action</th>
            <th>Spaces</th>
            <th>Categories</th>
            <th>Text</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.annotationId}>
              <td>
                <input type="checkbox" aria-label={`Select ${r.text.split("\n")[0] ?? ""}`} checked={selected.has(r.annotationId)} onChange={() => { toggle(r.annotationId); }} />
              </td>
              <td>{r.createdAt.slice(0, 16)}</td>
              <td>{r.sessionName}</td>
              <td>{r.version}</td>
              <td>{r.rulesetVersion}</td>
              <td>{r.anchor}</td>
              <td>{r.faction}</td>
              <td>{r.cardId}</td>
              <td>{r.actionId}</td>
              <td>{r.spaces.join(", ")}</td>
              <td>{r.categories.length === 0 ? "general" : r.categories.join(", ")}</td>
              <td>
                {r.stateHash === null ? (
                  r.text.split("\n")[0]
                ) : (
                  <button type="button" onClick={() => { if (r.stateHash !== null) onOpenState(r.sessionId, r.stateHash); }}>
                    {r.text.split("\n")[0]}
                  </button>
                )}
              </td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && error === null && rows.length === 0 && <p className="muted">No notes match.</p>}
    </div>
  );
}
