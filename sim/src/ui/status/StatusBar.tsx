// Status line (08 s3.5; UI simplification): one row in the menu bar with the turn position,
// eligibility, the acting faction, the deck and the victory track. The closed track summary shows
// each faction's score as X/Y (R4.1, variant B); it opens the full scale below the menu bar.
import type { BoardView } from "../api.ts";
import { words } from "../common/names.ts";
import { FactionMark } from "../common/FactionMark.tsx";
import { ScoreTrack } from "./ScoreTrack.tsx";

export function StatusBar({ view }: { readonly view: BoardView }) {
  const s = view.status;
  const name = (id: string | null): string => (id === null ? "-" : (view.factions.find((f) => f.id === id)?.name ?? words(id)));
  const box = (id: string | null): string => (id !== null && s.boxes[id] ? ` (${words(s.boxes[id] ?? "")})` : "");
  return (
    <div className="status-line" role="group" aria-label="Status">
      <span>
        {s.campaign ?? "-"} · Card {s.cardIndex}{s.card === null ? "" : ` · ${s.card.id}`} · {words(s.phase)}{s.phase === "propaganda" ? ` (round ${String(s.propagandaRound)})` : ""}
      </span>
      <span>1st: {name(s.firstEligible)}{box(s.firstEligible)} · 2nd: {name(s.secondEligible)}{box(s.secondEligible)}</span>
      {s.active !== null && <strong className="chip acting">Acting: <FactionMark faction={s.active} />{name(s.active)}</strong>}
      <span>{s.deckCount} card{s.deckCount === 1 ? "" : "s"} left</span>
      <details className="score-details"><summary>Victory track{view.factions.map((f) => (
        <span key={f.id}> · <strong style={{ color: f.color }}>{f.name} {s.scores[f.id] ?? 0}/{s.thresholds[f.id] ?? "–"}</strong></span>
      ))}</summary><div className="status-victory-scroll" role="region" aria-label="Victory track scale" tabIndex={0}><ScoreTrack view={view} /></div></details>
      {s.ended !== null && <strong>Game over: {s.ended.winner === null ? "no winner" : name(s.ended.winner)} ({s.ended.labels.join(", ")})</strong>}
    </div>
  );
}
