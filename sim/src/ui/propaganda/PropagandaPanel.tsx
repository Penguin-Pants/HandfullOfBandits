// Propaganda flow (08 s3.4): phase list with the open phase highlighted; Advance runs a phase with
// no choice; choice phases take a small form (Emergency step, Civic Action and Agitation spends,
// Upkeep Guard removals) for the selected spaces.
import { useState } from "react";
import type { AnyCommand, BoardView, LegalChoices } from "../api.ts";

export interface PropagandaPanelProps {
  readonly view: BoardView;
  readonly legal: LegalChoices;
  readonly selected: readonly string[];
  readonly onCommit: (command: AnyCommand) => void;
}

const SPEND_KEYS: Readonly<Record<string, readonly string[]>> = {
  civicAction: ["shifts", "coercion", "reception", "stateHarm", "displacement"],
  agitation: ["shifts", "coercion", "pkkHarm"],
};

export function PropagandaPanel({ view, legal, selected, onCommit }: PropagandaPanelProps) {
  const { propagandaPhases, propagandaStep } = view.status;
  const phase = propagandaPhases[propagandaStep] ?? "";
  const [spend, setSpend] = useState<Record<string, Record<string, string>>>({});
  const [step, setStep] = useState("");
  const keys = SPEND_KEYS[phase];
  const choose = (choice: unknown): void => { onCommit({ type: "PropagandaChoice", phase, choice }); };
  const spends = (): Record<string, Record<string, number>> =>
    Object.fromEntries(selected.map((s) => [s, Object.fromEntries(Object.entries(spend[s] ?? {}).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]))]));
  return (
    <section className="panel" aria-label="Propaganda">
      <ol>
        {propagandaPhases.map((p, i) => (
          <li key={p} style={{ fontWeight: i === propagandaStep ? 700 : 400 }} aria-current={i === propagandaStep ? "step" : undefined}>
            {p}
          </li>
        ))}
      </ol>
      {legal.violations?.map((v, i) => (
        <p key={i} className="bad">
          {v.message}
        </p>
      ))}
      <div className="row">
        <button type="button" disabled={legal.advance !== true} onClick={() => { onCommit({ type: "Advance" }); }}>
          Advance (Space)
        </button>
      </div>
      {phase === "legitimacy" && (
        <div className="row">
          <label>
            Emergency step <input value={step} onChange={(e) => { setStep(e.target.value); }} />
          </label>
          <button type="button" onClick={() => { choose({ emergencyStep: step }); }}>
            Move
          </button>
        </div>
      )}
      {phase === "upkeep" && (
        <div aria-label="Upkeep">
          {selected.map((s) => (
            <label key={s}>
              {s} Guards to remove <input size={2} value={spend[s]?.["guards"] ?? "1"} onChange={(e) => { setSpend({ ...spend, [s]: { ...spend[s], guards: e.target.value } }); }} />
            </label>
          ))}
          <button type="button" disabled={selected.length === 0} onClick={() => { choose({ removeGuards: Object.fromEntries(selected.map((s) => [s, Number(spend[s]?.["guards"] ?? "1")])) }); }}>
            Remove Guards in selected spaces
          </button>
        </div>
      )}
      {keys !== undefined && (
        <div aria-label="Spend">
          {selected.map((s) => (
            <div key={s} className="row">
              <span>{s}</span>
              {keys.map((k) => (
                <label key={k}>
                  {k} <input size={2} value={spend[s]?.[k] ?? ""} onChange={(e) => { setSpend({ ...spend, [s]: { ...spend[s], [k]: e.target.value } }); }} />
                </label>
              ))}
            </div>
          ))}
          <button type="button" disabled={selected.length === 0} onClick={() => { choose({ spaces: spends() }); }}>
            Spend in selected spaces
          </button>
        </div>
      )}
    </section>
  );
}
