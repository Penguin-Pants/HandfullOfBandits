// Status bar (08 s3.5; UI clarity round R4): turn position, eligibility and the victory track.
// Tracks are on the map (UC-7): host postures and Europe on
// their boxes, the rest in the Resources and politics card.
import type { ReactNode } from "react";
import type { BoardView } from "../api.ts";
import { words } from "../common/names.ts";
import { ScoreTrack } from "./ScoreTrack.tsx";

/** `children`: screen buttons (Home, Feedback review) at the start of the first row. */
export function StatusBar({ view, children }: { readonly view: BoardView; readonly children?: ReactNode }) {
  const s = view.status;
  const name = (id: string | null): string => (id === null ? "-" : (view.factions.find((f) => f.id === id)?.name ?? words(id)));
  const box = (id: string | null): string => (id !== null && s.boxes[id] ? ` (${words(s.boxes[id] ?? "")})` : "");
  return (
    <header className="panel status-grid" aria-label="Status">
      <div className="row status-heading">
        <h3>Game status</h3>
        <div className="row">{children}</div>
      </div>
      <div className="row status-meta">
        <strong className="chip">{s.campaign ?? "-"}</strong>
        <span className="chip">Card {s.cardIndex}</span>
        <span className="chip">Phase: {words(s.phase)}{s.phase === "propaganda" ? ` (round ${String(s.propagandaRound)})` : ""}</span>
      </div>
      <span className="status-card-title">{s.card === null ? "No card" : `${s.card.id} "${s.card.title}"`}</span>
      <div className="row status-eligibility">
        <span className="chip">1st: {name(s.firstEligible)}{box(s.firstEligible)}</span>
        <span className="chip">2nd: {name(s.secondEligible)}{box(s.secondEligible)}</span>
        {s.active !== null && <strong className="chip acting">Acting: {name(s.active)}</strong>}
      </div>
      <details className="score-details"><summary>Victory track</summary><div className="status-victory-scroll" role="region" aria-label="Victory track scale" tabIndex={0}><ScoreTrack view={view} /></div></details>
      {s.ended !== null && (
        <div className="row">
          <strong>Game over: {s.ended.winner === null ? "no winner" : name(s.ended.winner)}</strong> <span>{s.ended.labels.join(", ")}</span>
        </div>
      )}
    </header>
  );
}
