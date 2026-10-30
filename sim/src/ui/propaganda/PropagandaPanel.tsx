// Propaganda flow (08 s3.4): phase list with the open phase highlighted; Advance runs a phase with
// no choice; choice phases take a small form (Emergency step, Civic Action and Agitation spends,
// Upkeep Guard removals) for the selected spaces, set with - and + buttons (UC-5).
import { useState } from "react";
import type { AnyCommand, BoardView, LegalChoices } from "../api.ts";
import { words } from "../common/names.ts";
import { Stepper } from "../common/Stepper.tsx";
import { RedeployForm } from "./RedeployForm.tsx";
import { guideOf } from "./phases.ts";

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
  const keys = SPEND_KEYS[phase];
  const name = (id: string): string => view.spaces.find((x) => x.id === id)?.name ?? words(id);
  const set = (s: string, k: string, v: string): void => { setSpend({ ...spend, [s]: { ...spend[s], [k]: v } }); };
  const choose = (choice: unknown): void => { onCommit({ type: "PropagandaChoice", phase, choice }); };
  const spends = (): Record<string, Record<string, number>> =>
    Object.fromEntries(selected.map((s) => [s, Object.fromEntries(Object.entries(spend[s] ?? {}).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]))]));
  return (
    <section className="panel" aria-label="Propaganda">
      <ol>
        {propagandaPhases.map((p, i) => (
          <li key={p} style={{ fontWeight: i === propagandaStep ? 700 : 400 }} aria-current={i === propagandaStep ? "step" : undefined}>
            {guideOf(p).title}
          </li>
        ))}
      </ol>
      <div className="phase-guide" aria-label="Phase guide">
        <h3>{guideOf(phase).title}</h3>
        <p>{guideOf(phase).what}</p>
        <p>
          <strong>You:</strong> {guideOf(phase).you}
        </p>
      </div>
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
      {phase === "redeploy" && <RedeployForm view={view} selected={selected} onChoose={choose} />}
      {phase === "legitimacy" && view.status.emergencyMoves.length > 0 && (
        <div className="row" aria-label="Emergency Rule step">
          <span>Move Emergency Rule to:</span>
          {view.status.emergencyMoves.map((m) => (
            <button key={m} type="button" onClick={() => { choose({ emergencyStep: m }); }}>
              {words(m)}
            </button>
          ))}
        </div>
      )}
      {phase === "upkeep" && (
        <div aria-label="Upkeep">
          {selected.map((s) => (
            <div key={s} className="row">
              <strong>{name(s)}</strong>
              <Stepper label="Guards to remove" name={`${name(s)} Guards to remove`} value={spend[s]?.["guards"] ?? "1"} onChange={(v) => { set(s, "guards", v); }} />
            </div>
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
              <strong>{name(s)}</strong>
              {keys.map((k) => (
                <Stepper key={k} label={words(k)} name={`${name(s)} ${words(k)}`} value={spend[s]?.[k] ?? ""} onChange={(v) => { set(s, k, v); }} />
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
