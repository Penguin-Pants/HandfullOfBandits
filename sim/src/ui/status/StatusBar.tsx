// Status bar (08 s3.5): turn position, eligibility, tracks, scores with threshold and margin, Harm.
import type { BoardView } from "../api.ts";

export function StatusBar({ view }: { readonly view: BoardView }) {
  const s = view.status;
  return (
    <header className="panel" aria-label="Status">
      <div className="row">
        <strong>{s.campaign ?? "-"}</strong>
        <span>Card {s.cardIndex}</span>
        <span>{s.card === null ? "No card" : `${s.card.id} "${s.card.title}"`}</span>
        <span>Phase: {s.phase}{s.phase === "propaganda" ? ` (round ${String(s.propagandaRound)})` : ""}</span>
        <span>1st: {s.firstEligible ?? "-"}{s.firstEligible !== null && s.boxes[s.firstEligible] ? ` (${String(s.boxes[s.firstEligible])})` : ""}</span>
        <span>2nd: {s.secondEligible ?? "-"}{s.secondEligible !== null && s.boxes[s.secondEligible] ? ` (${String(s.boxes[s.secondEligible])})` : ""}</span>
        {s.active !== null && <strong>Acting: {s.active}</strong>}
      </div>
      <div className="row">
        {view.factions.map((f) => (
          <span key={f.id} style={{ color: f.color }}>
            {f.name} score {s.scores[f.id] ?? 0}/{s.thresholds[f.id] ?? "-"} ({s.margins[f.id] ?? 0}) Harm {s.harm[f.id] ?? 0}/{s.harmLimit}
          </span>
        ))}
      </div>
      <div className="row muted">
        {s.tracks.map((t) => (
          <span key={t.id}>
            {t.display} {t.value}
          </span>
        ))}
      </div>
      {s.ended !== null && (
        <div className="row">
          <strong>Game over: {s.ended.winner ?? "no winner"}</strong> <span>{s.ended.labels.join(", ")}</span>
        </div>
      )}
    </header>
  );
}
