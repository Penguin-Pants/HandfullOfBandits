// Plain log lines for one action, each with its rule reference in a tooltip (R1, R7). With a
// `onRule` lookup, a line that has a rule ref also gets a button for the research text (P4-08).
import { useState } from "react";
import type { BoardView, HistoryItem, RuleLookup } from "../api.ts";
import { Tip } from "../common/Tip.tsx";
import { plainLines } from "./plain.ts";
import { RuleText } from "./RuleText.tsx";

export function LogLines({ item, view, playerOnly, limit, onRule }: { readonly item: HistoryItem; readonly view: BoardView; readonly playerOnly: boolean; readonly limit?: number; readonly onRule?: (ref: string) => Promise<RuleLookup> }) {
  const [open, setOpen] = useState<string | null>(null);
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
          {onRule !== undefined && l.rule !== null && (
            <>
              {" "}
              <button type="button" aria-label={`Rule text for ${l.rule}`} aria-expanded={open === l.id} onClick={() => { setOpen(open === l.id ? null : l.id); }}>
                Rule
              </button>
              {open === l.id && <RuleText rule={l.rule} lookup={onRule} />}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
