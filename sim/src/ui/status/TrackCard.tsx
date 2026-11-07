// Readable resource summary; expand a value to inspect its existing full scale.
import type { BoardView } from "../api.ts";
import { words } from "../common/names.ts";
import { spaceOfTrack } from "./tracks.ts";

/** Numeric tracks with at most this many steps get numbered boxes; longer ones a bar. */
const BOX_MAX = 20;

type Track = BoardView["status"]["tracks"][number];

function Scale({ track }: { readonly track: Track }) {
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
  if (min === undefined || max === undefined || typeof value !== "number") return <b>{String(value)}</b>;
  if (max - min > BOX_MAX) {
    return (
      <span className="track-bar">
        <span className="track-fill" style={{ width: `${String((100 * (value - min)) / (max - min))}%` }} />
      </span>
    );
  }
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

const HIDDEN_AT_ZERO = new Set(["successor", "ceasefireRounds"]);

export function TrackCard({ view }: { readonly view: BoardView }) {
  // Successor and the held ceasefire rounds show only above 0 (07 s6.4, s7.3; DEC-65, DEC-66).
  const tracks = view.status.tracks.filter(t => spaceOfTrack(t.id, view.spaces) === undefined && !(HIDDEN_AT_ZERO.has(t.id) && t.value === 0));
  return <section className="track-card compact" aria-label="Resources and politics">
    <h4>Resources and politics</h4>
    {tracks.map(t => {
      const faction = view.factions.find(f => t.id === `resources.${f.id}`);
      return <details key={t.id} className={faction ? "track-row resource-badge" : "track-row"} role="group" aria-label={t.display}>
        <summary onKeyDown={e => { if (e.key === " ") e.stopPropagation(); }}>
          <span className={faction ? "resource-faction" : undefined} style={faction ? { backgroundColor: faction.color } : undefined}>{faction?.name ?? t.display}</span>
          <b>{typeof t.value === "number" ? t.value : words(t.value)}</b>
          {faction && <span>Resources</span>}
        </summary>
        <Scale track={t} />
      </details>;
    })}
  </section>;
}
