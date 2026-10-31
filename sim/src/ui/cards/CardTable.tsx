// Card table (08 s3): the draw deck face down on the left, the current card face up beside it.
// In setup the deck is the button that reveals the first card.
import type { BoardView } from "../api.ts";

export function CardTable({ view, onReveal }: { readonly view: BoardView; readonly onReveal: (() => void) | null }) {
  const { card, deckCount, playedCount } = view.status;
  const back = (
    <div className="card card-back" aria-hidden="true">
      <span>Deck</span>
    </div>
  );
  return (<>
    <section className="panel card-table" aria-label="Cards">
      <div className="card-slot">
        {deckCount === 0 ? (
          <div className="card card-empty">Empty</div>
        ) : onReveal === null ? (
          back
        ) : (
          <button type="button" className="card-button" onClick={onReveal} aria-label="Reveal first card (Space)">
            {back}
          </button>
        )}
        <div className="muted">
          {deckCount} card{deckCount === 1 ? "" : "s"} left
          {onReveal !== null && <div>Click to reveal</div>}
        </div>
      </div>
      <div className="card-slot">
        {card === null ? (
          <div className="card card-empty">No card yet</div>
        ) : (
          <div className={`card card-face ${card.type === "propaganda" ? "card-propaganda" : ""}`} aria-label={`Current card ${card.id}`}>
            <div className="card-id">{card.id}</div>
            <div className="card-title">{card.title}</div>
            <div className="card-type">{card.type}</div>
          </div>
        )}
        <div className="muted">{playedCount} played</div>
      </div>
    </section>
    {(view.status.modifiers?.length ?? 0) > 0 && <section className="panel" aria-label="Active cards"><h3>Active cards</h3><ul>{view.status.modifiers?.map(m => <li key={m.id}>{m.title}: {m.duration === "untilReset" ? "until Reset" : "for the rest of the game"}</li>)}</ul></section>}
  </>);
}
