// Status bar (08 s3.5; UI clarity round R4): turn position, eligibility, one labeled pill per
// faction score and the victory track. Tracks are on the map (UC-7): host postures and Europe on
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
      <div className="row">
        {children}
        <strong className="chip">{s.campaign ?? "-"}</strong>
        <span className="chip">Card {s.cardIndex}</span>
        <span>{s.card === null ? "No card" : `${s.card.id} "${s.card.title}"`}</span>
        <span className="chip">Phase: {words(s.phase)}{s.phase === "propaganda" ? ` (round ${String(s.propagandaRound)})` : ""}</span>
        <span className="chip">1st: {name(s.firstEligible)}{box(s.firstEligible)}</span>
        <span className="chip">2nd: {name(s.secondEligible)}{box(s.secondEligible)}</span>
        {s.active !== null && <strong className="chip acting">Acting: {name(s.active)}</strong>}
        <span className="pills" aria-label="Scores">
          {view.factions.map((f) => (
            <span key={f.id} className="pill" style={{ borderColor: f.color }} aria-label={`${f.name} score`}>
              <strong style={{ color: f.color }}>{f.name}</strong>
              <span>Score <b>{s.scores[f.id] ?? 0}</b> of {s.thresholds[f.id] ?? "-"}</span>
              <span>Margin <b>{s.margins[f.id] ?? 0}</b></span>
              <span>Harm <b>{s.harm[f.id] ?? 0}</b> of {s.harmLimit}</span>
            </span>
          ))}
        </span>
      </div>
      <ScoreTrack view={view} />
      {s.ended !== null && (
        <div className="row">
          <strong>Game over: {s.ended.winner === null ? "no winner" : name(s.ended.winner)}</strong> <span>{s.ended.labels.join(", ")}</span>
        </div>
      )}
    </header>
  );
}
