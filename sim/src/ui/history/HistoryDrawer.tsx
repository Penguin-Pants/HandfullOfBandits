// History drawer (07 s6; 08 s3): actions with their log entries; notes counted inline; undone
// actions struck through. `H` or the Close button toggles it (Play). "Branch from here" starts a
// branch at that action's state (P4-04); a pending action has none, its Operation is still open.
import type { BoardView, HistoryItem } from "../api.ts";
import { LogLines } from "../log/LogLines.tsx";
import { actionTitle } from "../log/plain.ts";

export function HistoryDrawer({ items, view, limit = 10, onOpen, onClose, onBranch }: { readonly items: readonly HistoryItem[]; readonly view: BoardView; readonly limit?: number; readonly onOpen?: (item: HistoryItem) => void; readonly onClose?: () => void; readonly onBranch?: (item: HistoryItem) => void }) {
  return (
    <section className="panel" aria-label="History">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2>History</h2>
        {onClose !== undefined && (
          <button type="button" onClick={onClose}>
            Close (H)
          </button>
        )}
      </div>
      <ol>
        {items.slice(-limit).map((item) => {
          const { action, notes } = item;
          return (
          <li key={action.action_id} style={{ textDecoration: action.status === "undone" ? "line-through" : "none" }}>
            <button type="button" onClick={() => onOpen?.(item)}>
              {action.action_id}
            </button>{" "}
            {actionTitle(action, view)}
            {notes > 0 && <span> · {notes} note{notes === 1 ? "" : "s"}</span>}
            {onBranch !== undefined && action.status !== "pending" && (
              <>
                {" "}
                <button type="button" onClick={() => { onBranch(item); }}>
                  Branch from here
                </button>
              </>
            )}
            <div className="muted">
              <LogLines item={item} view={view} playerOnly={false} />
            </div>
          </li>
          );
        })}
      </ol>
    </section>
  );
}
