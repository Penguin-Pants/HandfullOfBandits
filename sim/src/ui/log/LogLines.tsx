// Plain log lines for one action, each with its rule reference in a tooltip (R1, R7).
import type { BoardView, HistoryItem } from "../api.ts";
import { Tip } from "../common/Tip.tsx";
import { plainLines } from "./plain.ts";

export function LogLines({ item, view, playerOnly, limit }: { readonly item: HistoryItem; readonly view: BoardView; readonly playerOnly: boolean; readonly limit?: number }) {
  const lines = plainLines(item.entries, view, item.action.faction, playerOnly).slice(0, limit);
  return (
    <ul>
      {lines.map((l) => (
        <li key={l.id}>
          <Tip text={l.ref}>
            <span className="log-line" tabIndex={l.ref === null ? undefined : 0}>
              {l.text}
            </span>
          </Tip>
        </li>
      ))}
    </ul>
  );
}
