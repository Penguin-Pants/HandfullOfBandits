// Pivotal window (05 s4; approved text docs/prototype/31 s6.1). ARGK Formed allocates recruits with
// steppers; the other Pivotals ask their questions through the shared Decision flow.
import { useState } from "react";
import type { ActionForm, Api, AnyCommand, BoardView } from "../api.ts";
import { Stepper } from "../common/Stepper.tsx";
import { DecisionView, useDecisionFlow } from "../event/decision.tsx";
import type { PlanEvent, PlanState } from "../faction/plan.ts";

const ARGK = "DK-015";
const CARDS: Readonly<Record<string, { readonly title: string; readonly guide: string }>> = {
  [ARGK]: { title: "ARGK Formed", guide: "Guerrillas at Bases flip Underground. PKK gains Resources." },
  "DK-054": { title: "Serhildan", guide: "Shift up to 3 spaces with PKK pieces and no Office one level toward Opposition. Europe +1." },
  "DK-076": { title: "Area Domination", guide: "Free Sweep in up to 3 Mountain spaces, Village Clearance may follow in one of them at normal cost, then free Assault in those spaces." },
  "DK-098": { title: "Coercive Diplomacy on Syria", guide: "Syria to Hostile. Guerrillas there Activate and the Leadership goes Abroad." },
};

export interface PivotalPanelProps {
  readonly view: BoardView;
  readonly onCommit: (command: AnyCommand) => void;
  readonly api: Api;
  readonly sessionId: string;
  readonly forms: readonly ActionForm[];
  readonly plan: PlanState;
  readonly dispatch: (event: PlanEvent) => void;
  readonly onTargets?: (ids: readonly string[] | null) => void;
  readonly onFreeAction?: (open: boolean) => void;
}

export function PivotalPanel({ view, onCommit, api, sessionId, forms, plan, dispatch, onTargets, onFreeAction }: PivotalPanelProps) {
  const [placements, setPlacements] = useState<Readonly<Record<string, number>>>({});
  const pending = view.status.pending ?? null;
  const flow = useDecisionFlow({ api, sessionId, onCommit, onTargets, onFreeAction, forms, dispatch, build: (card, answers) => (pending === null ? null : { type: "PlayPivotal", faction: pending.faction, card, answers, chooseMoveFaces: true }) });
  if (pending === null || view.status.phase !== "pivotal") return null;
  const offers = pending.answers.flatMap((a) => (typeof a === "object" && a !== null && !Array.isArray(a) && "card" in a && typeof a.card === "string" ? [{ card: a.card, maxPlace: "maxPlace" in a && typeof a.maxPlace === "number" ? a.maxPlace : 0 }] : []));
  const total = Object.values(placements).reduce((a, n) => a + n, 0);
  return <section className="panel" aria-label="Pivotal window">
    <p>{pending.prompt}</p>
    {offers.map(({ card, maxPlace }) => {
      const info = CARDS[card] ?? { title: card, guide: "" };
      return <div key={card}>
        <h3>{info.title}</h3>
        {card === ARGK ? <>
          <p>Place up to {maxPlace} Guerrillas at PKK Bases. {info.guide}</p>
          {view.spaces.filter(s => s.pieces.some(p => p.piece === "pkkBase" && p.count > 0)).map(s => <div key={s.id}><Stepper label={s.name} value={String(placements[s.id] ?? 0)} max={maxPlace - total + (placements[s.id] ?? 0)} onChange={value => {setPlacements({...placements, [s.id]: Number(value)});}} /></div>)}
          <button type="button" onClick={() => {onCommit({type: "PlayPivotal", faction: pending.faction, card, placements});}}>Play {info.title}</button>
        </> : <>
          <p>{info.guide}</p>
          <button type="button" onClick={() => void flow.run(card, [])}>Play {info.title}</button>
        </>}
      </div>;
    })}
    <DecisionView pending={flow.pending} view={view} faction={pending.faction} forms={forms} plan={plan} dispatch={dispatch} answer={flow.answer} />
    <div className="row"><button type="button" onClick={() => {onCommit({type: "ResolveDecision", decisionId: pending.id, answer: "decline"});}}>Decline for this card</button></div>
  </section>;
}
