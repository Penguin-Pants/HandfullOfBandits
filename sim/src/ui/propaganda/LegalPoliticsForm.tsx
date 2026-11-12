// Legal Politics choices (07 s6.3, s7.3; approved text docs/prototype/30 s2.1, DEC-66): closure
// filing and the ceasefire step. Each faction answers in turn on one screen, State first (GAP-O01).
import { useState } from "react";
import type { BoardView } from "../api.ts";

type Answers = Record<string, unknown>;

export function LegalPoliticsForm({ view, onChoose }: { readonly view: BoardView; readonly onChoose: (choice: Answers) => void }) {
  const o = view.status.ceasefireStep;
  const [a, setA] = useState<Answers>({});
  const leaves = (faction: string): boolean => (a["leave"] as Answers | undefined)?.[faction] === true;
  const toggle = (label: string, on: boolean, flip: () => void) => <button type="button" aria-pressed={on} onClick={flip}>{label}</button>;
  return (
    <div aria-label="Legal Politics choices">
      {view.status.closureFiling && (
        <div className="row" aria-label="Closure filing">
          <button type="button" onClick={() => { onChoose({ closureFiling: true, ceasefire: a }); }}>File a closure case</button>
        </div>
      )}
      {(o.accept || o.declared || o.leave) && (
        <div aria-label="Ceasefire step">
          {o.accept && <div className="row"><strong>State:</strong>{toggle("Accept the ceasefire", a["accept"] === true, () => { setA({ ...a, accept: a["accept"] !== true }); })}</div>}
          {o.declared && (
            <div className="row">
              <strong>PKK:</strong>
              {toggle("Keep the ceasefire declared", a["pkkEnd"] !== true, () => { setA({ ...a, pkkEnd: false }); })}
              {toggle("End the ceasefire (Europe -1)", a["pkkEnd"] === true, () => { setA({ ...a, pkkEnd: true }); })}
            </div>
          )}
          {o.leave && ["state", "pkk"].map((f) => (
            <div key={f} className="row"><strong>{f === "state" ? "State:" : "PKK:"}</strong>
              {toggle("Leave Reciprocal Restraint", leaves(f), () => { setA({ ...a, leave: { ...(a["leave"] as Answers | undefined), [f]: !leaves(f) } }); })}
            </div>
          ))}
          <button type="button" onClick={() => { onChoose({ ceasefire: a }); }}>Submit ceasefire choices</button>
        </div>
      )}
    </div>
  );
}
