// Legal Politics choices (07 s6.3, s7.3; approved text docs/prototype/30 s2.1, DEC-66): closure
// filing and the ceasefire step. Each faction answers in turn on one screen, State first (GAP-O01).
import { useState } from "react";
import type { BoardView } from "../api.ts";
import { Stepper } from "../common/Stepper.tsx";

type Answers = Record<string, unknown>;

export function LegalPoliticsForm({ view, selected, onChoose }: { readonly view: BoardView; readonly selected: readonly string[]; readonly onChoose: (choice: Answers) => void }) {
  const o = view.status.ceasefireStep;
  const [a, setA] = useState<Answers>({});
  const [removals, setRemovals] = useState<Record<string, string>>({});
  const pair = (key: string, faction: string): boolean => (a[key] as Answers | undefined)?.[faction] === true;
  const setPair = (key: string, faction: string, value: boolean): void => { setA({ ...a, [key]: { ...(a[key] as Answers | undefined), [faction]: value } }); };
  const toggle = (label: string, on: boolean, flip: () => void) => <button type="button" aria-pressed={on} onClick={flip}>{label}</button>;
  const both = pair("outcome", "state") && pair("outcome", "pkk");
  const name = (id: string): string => view.spaces.find((s) => s.id === id)?.name ?? id;
  const domestic = selected.filter((s) => view.spaces.find((x) => x.id === s)?.kind === "domestic");
  const ceasefire = (): Answers => (both ? { ...a, outcome: { state: true, pkk: true, removals: Object.fromEntries(domestic.map((s) => [s, Number(removals[s] ?? "0")])) } } : a);
  const any = o.accept || o.declared || o.vote || o.outcome || o.leave;
  return (
    <div aria-label="Legal Politics choices">
      {view.status.closureFiling && (
        <div className="row" aria-label="Closure filing">
          <button type="button" onClick={() => { onChoose({ closureFiling: true, ceasefire: ceasefire() }); }}>File a closure case</button>
        </div>
      )}
      {any && (
        <div aria-label="Ceasefire step">
          {o.accept && <div className="row"><strong>State:</strong>{toggle("Accept the ceasefire", a["accept"] === true, () => { setA({ ...a, accept: a["accept"] !== true }); })}</div>}
          {o.declared && (
            <div className="row">
              <strong>PKK:</strong>
              {toggle("Keep the ceasefire declared", a["pkkEnd"] !== true, () => { setA({ ...a, pkkEnd: false }); })}
              {toggle("End the ceasefire (Europe -1)", a["pkkEnd"] === true, () => { setA({ ...a, pkkEnd: true }); })}
            </div>
          )}
          {o.vote && ["state", "pkk"].map((f) => (
            <div key={f} className="row"><strong>{f === "state" ? "State:" : "PKK:"}</strong>
              {toggle("Vote yes to Talks", pair("talks", f), () => { setPair("talks", f, true); })}
              {toggle("Vote no to Talks", !pair("talks", f), () => { setPair("talks", f, false); })}
            </div>
          ))}
          {o.outcome && ["state", "pkk"].map((f) => (
            <div key={f} className="row"><strong>{f === "state" ? "State:" : "PKK:"}</strong>
              {toggle("Accept the Negotiated Outcome", pair("outcome", f), () => { setPair("outcome", f, true); })}
              {toggle("Refuse the Negotiated Outcome", !pair("outcome", f), () => { setPair("outcome", f, false); })}
            </div>
          ))}
          {both && (
            <div aria-label="Guerrilla removals">
              <p>PKK: select spaces and remove {o.removals} domestic Guerrillas in total.</p>
              {domestic.map((s) => <div key={s} className="row"><strong>{name(s)}</strong><Stepper label="Guerrillas to remove" name={`${name(s)} Guerrillas to remove`} value={removals[s] ?? "0"} onChange={(v) => { setRemovals({ ...removals, [s]: v }); }} /></div>)}
            </div>
          )}
          {o.leave && ["state", "pkk"].map((f) => (
            <div key={f} className="row"><strong>{f === "state" ? "State:" : "PKK:"}</strong>
              {toggle(o.status === "talks" ? "Leave Talks" : "Leave Reciprocal Restraint", pair("leave", f), () => { setPair("leave", f, !pair("leave", f)); })}
            </div>
          ))}
          <button type="button" onClick={() => { onChoose({ ceasefire: ceasefire() }); }}>Submit ceasefire choices</button>
        </div>
      )}
    </div>
  );
}
