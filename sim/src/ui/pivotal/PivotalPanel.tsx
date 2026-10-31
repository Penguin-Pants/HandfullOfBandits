import { useState } from "react";
import type { AnyCommand, BoardView } from "../api.ts";
import { Stepper } from "../common/Stepper.tsx";

export function PivotalPanel({view, onCommit}: {readonly view: BoardView; readonly onCommit: (command: AnyCommand) => void}) {
  const [placements, setPlacements] = useState<Readonly<Record<string, number>>>({});
  const pending = view.status.pending;
  if (pending === undefined || pending === null || view.status.phase !== "pivotal") return null;
  const offer = pending.answers.find(a => typeof a === "object" && a !== null && !Array.isArray(a));
  const max = typeof offer === "object" && offer !== null && !Array.isArray(offer) && "maxPlace" in offer && typeof offer.maxPlace === "number" ? offer.maxPlace : 0;
  const total = Object.values(placements).reduce((a, n) => a + n, 0);
  return <section className="panel" aria-label="Pivotal window">
    <h3>ARGK Formed</h3><p>{pending.prompt}</p>
    <p>Place up to {max} Guerrillas at PKK Bases. Guerrillas at Bases flip Underground. PKK gains Resources.</p>
    {view.spaces.filter(s => s.pieces.some(p => p.piece === "pkkBase" && p.count > 0)).map(s => <div key={s.id}><Stepper label={s.name} value={String(placements[s.id] ?? 0)} max={max - total + (placements[s.id] ?? 0)} onChange={value => {setPlacements({...placements, [s.id]: Number(value)});}} /></div>)}
    <div className="row"><button type="button" onClick={() => {onCommit({type: "PlayPivotal", faction: pending.faction, card: "DK-015", placements});}}>Play ARGK Formed</button>
    <button type="button" onClick={() => {onCommit({type: "ResolveDecision", decisionId: pending.id, answer: "decline"});}}>Decline for this card</button></div>
  </section>;
}
