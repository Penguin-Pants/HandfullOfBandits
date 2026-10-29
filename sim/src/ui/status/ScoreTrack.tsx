// Victory track (GMT COIN edge track; 09 s7): numbered boxes 0 to the highest threshold or score,
// one marker per faction (alternating above and below the boxes) and a flag at each threshold.
import type { BoardView } from "../api.ts";

const W = 1300;
const MIN_MAX = 50;
const BOX_Y = 24;
const BOX_H = 30;

export function ScoreTrack({ view }: { readonly view: BoardView }) {
  const s = view.status;
  const max = Math.max(MIN_MAX, ...Object.values(s.thresholds), ...Object.values(s.scores));
  const cw = (W - 20) / (max + 1);
  const left = (n: number): number => 10 + Math.max(0, Math.min(max, n)) * cw;
  return (
    <svg viewBox={`0 0 ${String(W)} 80`} className="score-track" role="img" aria-label="Victory track">
      {Array.from({ length: max + 1 }, (_, i) => (
        <g key={i}>
          <rect x={left(i)} y={BOX_Y} width={cw} height={BOX_H} fill={i % 5 === 0 ? "var(--track-five)" : "var(--panel)"} stroke="var(--line)" />
          <text x={left(i) + cw / 2} y={BOX_Y + 20} textAnchor="middle" className={i % 5 === 0 ? "track-num five" : "track-num"}>
            {i}
          </text>
        </g>
      ))}
      {view.factions.map((f, k) => {
        const above = k % 2 === 0;
        const score = s.scores[f.id] ?? 0;
        const thr = s.thresholds[f.id];
        const x = left(score) + cw / 2;
        const tx = thr === undefined ? null : left(thr) + cw / 2;
        const nearEnd = tx !== null && tx > W - 160;
        return (
          <g key={f.id} aria-label={`${f.name} score ${String(score)}`}>
            <rect x={x - 9} y={above ? 2 : BOX_Y + BOX_H + 4} width={18} height={18} rx={3} fill={f.color} stroke="#000" />
            <text x={x} y={above ? 15 : BOX_Y + BOX_H + 17} textAnchor="middle" className="track-marker">
              {f.name.slice(0, 1)}
            </text>
            {tx !== null && (
              <>
                <path d={above ? `M${String(tx)},${String(BOX_Y)} l-6,-10 h12z` : `M${String(tx)},${String(BOX_Y + BOX_H)} l-6,10 h12z`} fill={f.color} />
                <text x={nearEnd ? tx - 10 : tx + 10} y={above ? 14 : BOX_Y + BOX_H + 18} textAnchor={nearEnd ? "end" : "start"} className="track-flag" fill={f.color}>
                  {f.name} wins at {thr}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
