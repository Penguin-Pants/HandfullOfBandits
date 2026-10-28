// Basic feedback review (07 s7; 11 P2-17): notes across sessions, filters, plain substring search,
// open the state a note links to.
import { useEffect, useState } from "react";
import type { Api, ReviewRow } from "../api.ts";

const FILTERS = ["faction", "card", "space", "category", "version", "session", "anchor", "status"] as const;

export interface ReviewProps {
  readonly api: Api;
  readonly onOpenState: (sessionId: string, hash: string) => void;
}

export function Review({ api, onOpenState }: ReviewProps) {
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const query = Object.fromEntries(Object.entries(filter).filter(([, v]) => v !== ""));
  const key = JSON.stringify(query);
  useEffect(() => {
    void api.review(JSON.parse(key) as Record<string, string>).then(setRows);
  }, [api, key]);
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
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Session</th>
            <th>Version</th>
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
              <td>{r.createdAt.slice(0, 16)}</td>
              <td>{r.sessionName}</td>
              <td>{r.version}</td>
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
      {rows.length === 0 && <p className="muted">No notes match.</p>}
    </div>
  );
}
