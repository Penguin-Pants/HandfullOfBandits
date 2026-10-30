// Victory track (GMT COIN edge track; 09 s7; UC-8): one readable numbered cell per point from 0 to
// the highest threshold or score, a labeled marker per faction at its score (alternating above
// and below the cells) and a labeled flag at each threshold.
import type { BoardView } from "../api.ts";

const MIN_MAX = 50;

export function ScoreTrack({ view }: { readonly view: BoardView }) {
  const s = view.status;
  const max = Math.max(MIN_MAX, ...Object.values(s.thresholds), ...Object.values(s.scores));
  /** Centre of cell n, as a percentage of the track width. */
  const at = (n: number): string => `${String((100 * (Math.max(0, Math.min(max, n)) + 0.5)) / (max + 1))}%`;
  return (
    <div className="victory-track" role="img" aria-label="Victory track" style={{ gridTemplateColumns: `repeat(${String(max + 1)}, minmax(0, 1fr))` }}>
      {Array.from({ length: max + 1 }, (_, i) => (
        <span key={i} className={i % 5 === 0 ? "vt-cell five" : "vt-cell"}>
          {i}
        </span>
      ))}
      {view.factions.map((f, k) => {
        const score = s.scores[f.id] ?? 0;
        const thr = s.thresholds[f.id];
        const above = k % 2 === 0;
        return (
          <span key={f.id}>
            <span className={above ? "vt-marker" : "vt-marker below"} style={{ left: at(score), background: f.color }} aria-label={`${f.name} score ${String(score)}`}>
              {f.name} {score}
            </span>
            {thr !== undefined && (
              <>
                <span className="vt-flag" style={{ left: at(thr), background: f.color }} />
                <span className={above ? "vt-flag-label" : "vt-flag-label below"} style={{ left: at(thr), color: f.color }}>
                  <span aria-hidden="true">▼ </span>
                  <span>
                    {f.name} wins at {thr}
                  </span>
                </span>
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
