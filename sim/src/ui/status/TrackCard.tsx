// Resources and politics card (UC-7): every track the map does not draw on a box, each in full.
// Long numeric tracks (Resources) are a bar with the value; short ones numbered boxes; ordinal
// tracks all their steps. The current value is marked.
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

export function TrackCard({ view }: { readonly view: BoardView }) {
  const tracks = view.status.tracks.filter((t) => spaceOfTrack(t.id, view.spaces) === undefined);
  return (
    <section className="track-card" aria-label="Resources and politics">
      <h4>Resources and politics</h4>
      {tracks.map((t) => (
        <div key={t.id} className="track-row" role="group" aria-label={t.display}>
          <span className="track-name">
            {t.display}
            {t.steps === undefined && <b> {String(t.value)}</b>}
          </span>
          <Scale track={t} />
        </div>
      ))}
    </section>
  );
}
