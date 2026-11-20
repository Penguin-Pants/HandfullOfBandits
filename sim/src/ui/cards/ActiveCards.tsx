// Active cards (UI simplification): the momentum and capability cards in effect. The current card
// is the face-up card in the event panel; the deck count is in the menu bar status.
import type { BoardView } from "../api.ts";

export function ActiveCards({ view }: { readonly view: BoardView }) {
  const modifiers = view.status.modifiers ?? [];
  if (modifiers.length === 0) return null;
  return (
    <section className="panel" aria-label="Active cards">
      <h3>Active cards</h3>
      <ul>{modifiers.map((m) => <li key={m.id}>{m.title}: {m.duration === "untilReset" ? "until Reset" : "for the rest of the game"}</li>)}</ul>
    </section>
  );
}
