// History drawer (07 s6; 08 s3): actions with their log entries; notes counted inline; undone
// actions struck through. `H` toggles it (Play).
import type { HistoryItem } from "../api.ts";

export function HistoryDrawer({ items, limit = 10, onOpen }: { readonly items: readonly HistoryItem[]; readonly limit?: number; readonly onOpen?: (item: HistoryItem) => void }) {
  return (
    <section className="panel" aria-label="History">
      <ol>
        {items.slice(-limit).map((item) => {
          const { action, entries, notes } = item;
          return (
          <li key={action.action_id} style={{ textDecoration: action.status === "undone" ? "line-through" : "none" }}>
            <button type="button" onClick={() => onOpen?.(item)}>
              {action.action_id}
            </button>{" "}
            {action.summary}
            {notes > 0 && <span> · {notes} note{notes === 1 ? "" : "s"}</span>}
            <ul>
              {entries.filter((e) => e.kind !== "ValidationPassed").map((e) => (
                <li key={e.entry_id} className="muted">
                  {e.text}
                </li>
              ))}
            </ul>
          </li>
          );
        })}
      </ol>
    </section>
  );
}
