// History drawer (07 s6; 08 s3): actions with their log entries; notes counted inline; undone
// actions struck through. `H` toggles it (Play).
import type { HistoryItem } from "../api.ts";

export function HistoryDrawer({ items, limit = 10 }: { readonly items: readonly HistoryItem[]; readonly limit?: number }) {
  return (
    <section className="panel" aria-label="History">
      <ol>
        {items.slice(-limit).map(({ action, entries, notes }) => (
          <li key={action.action_id} style={{ textDecoration: action.status === "undone" ? "line-through" : "none" }}>
            <strong>{action.action_id}</strong> {action.summary}
            {notes > 0 && <span> · {notes} note{notes === 1 ? "" : "s"}</span>}
            <ul>
              {entries.filter((e) => e.kind !== "ValidationPassed").map((e) => (
                <li key={e.entry_id} className="muted">
                  {e.text}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
