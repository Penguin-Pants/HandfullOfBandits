// Status bar (08 s3.5; UI clarity round R4): turn position, eligibility, the victory track, one
// labeled pill per faction score and per track. Short tracks get a mini track: numbered boxes
// for a small numeric range (Legitimacy, Europe), all steps for an ordinal track. Resources
// (a long range) show the value only.
import type { ReactNode } from "react";
import type { BoardView } from "../api.ts";
import { words } from "../common/names.ts";
import { ScoreTrack } from "./ScoreTrack.tsx";

/** Numeric tracks with at most this many steps get numbered boxes. */
const MINI_MAX = 20;

type Track = BoardView["status"]["tracks"][number];

function MiniTrack({ track }: { readonly track: Track }) {
  const { min, max, steps, value } = track;
  if (steps !== undefined) {
    return (
      <span className="mini-track">
        {steps.map((s) => (
          <span key={s} className={s === value ? "mini-step on" : "mini-step"} aria-current={s === value ? "true" : undefined}>
            {words(s)}
          </span>
        ))}
      </span>
    );
  }
  if (min === undefined || max === undefined || max - min > MINI_MAX) return null;
  return (
    <span className="mini-track">
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
        <span key={n} className={n === value ? "mini-box on" : "mini-box"} aria-current={n === value ? "true" : undefined}>
          {n}
        </span>
      ))}
    </span>
  );
}

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
      <div className="pills" aria-label="Tracks">
        {s.tracks.map((t) => (
          <span key={t.id} className="pill track-pill" aria-label={t.display} tabIndex={0}>
            <span className="pill-label">{t.display}</span>
            <b>{typeof t.value === "number" ? t.value : words(t.value)}</b>
            <span className="mini-pop">
              <MiniTrack track={t} />
            </span>
          </span>
        ))}
      </div>
      {s.ended !== null && (
        <div className="row">
          <strong>Game over: {s.ended.winner === null ? "no winner" : name(s.ended.winner)}</strong> <span>{s.ended.labels.join(", ")}</span>
        </div>
      )}
    </header>
  );
}
