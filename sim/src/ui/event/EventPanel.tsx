// Event panel (08 s3; 05 s5): the current card face up, both sides with owner and text. Execute
// validates, then asks each open question inline (Decisions, 08 s3.3, `decision.tsx`) until the
// command is legal. The Event box of the eligibility track focuses this panel.
import type { ActionForm, Api, AnyCommand, BoardView } from "../api.ts";

type Card = NonNullable<BoardView["status"]["card"]>;

/** The face-up card's ID, type and title. */
function CardHeader({ card }: { readonly card: Card }) {
  return (
    <header aria-label={`Current card ${card.id}`}>
      <span className="card-id">{card.id}</span> <span className="muted">{card.type}</span>
      <h3>{card.title}</h3>
    </header>
  );
}

/** One side's owner and text. */
const sideText = (side: "unshaded" | "shaded", s: NonNullable<Card["unshaded"]>) => <p><em>{side}</em> ({s.owner ?? "either"}){s.blockOnly ? " block only" : ""}: {s.text}</p>;

/** The current card face up and read only: shown while a bot chooses and outside card play. */
export function CardFace({ view }: { readonly view: BoardView }) {
  const card = view.status.card;
  if (card === null) return null;
  return (
    <section className="panel card-face" aria-label="Card">
      <CardHeader card={card} />
      {(["unshaded", "shaded"] as const).map((side) => {
        const s = card[side];
        return s === null ? null : <div key={side} className={`event-side ${side}`}>{sideText(side, s)}</div>;
      })}
    </section>
  );
}
import type { PlanEvent, PlanState } from "../faction/plan.ts";
import { DecisionView, useDecisionFlow } from "./decision.tsx";

export interface EventPanelProps {
  readonly onTargets?: (ids: readonly string[] | null) => void;
  readonly api: Api;
  readonly sessionId: string;
  readonly view: BoardView;
  readonly faction: string | null;
  readonly eventOpen: boolean;
  readonly onCommit: (command: AnyCommand) => void;
  /** Plan forms for a free action's plan. */
  readonly forms: readonly ActionForm[];
  readonly plan: PlanState;
  readonly dispatch: (event: PlanEvent) => void;
  /** A spaces or free-action plan question opened (true) or closed (false): the map builds the
   * Event's plan, whose spaces are the picks of a spaces question. */
  readonly onFreeAction?: (open: boolean) => void;
}

export function EventPanel({ onTargets, api, sessionId, view, faction, eventOpen, onCommit, forms, plan, dispatch, onFreeAction }: EventPanelProps) {
  const card = view.status.card;
  const { pending, run, answer } = useDecisionFlow({ api, sessionId, onCommit, onTargets, onFreeAction, forms, dispatch, build: (side, answers) => (faction === null ? null : { type: "ChooseEvent", faction, side, answers, chooseMoveFaces: true }) });
  if (card === null) return null;

  return (
    <section id="event-panel" className="panel card-face" aria-label="Event panel" tabIndex={-1}>
      <CardHeader card={card} />
      {(["unshaded", "shaded"] as const).map((side) => {
        const s = card[side];
        if (s === null) return null;
        return (
          <div key={side} className={`event-side ${side}`}>
            {sideText(side, s)}
            <button type="button" disabled={!eventOpen || !card.encoded} title={!card.encoded ? "Not encoded." : eventOpen ? "" : "The Event box is not open."} onClick={() => void run(side, [])}>
              Execute {side}
            </button>
          </div>
        );
      })}
      {(!eventOpen || !card.encoded) && <p className="hint">{!card.encoded ? "Event unavailable: this card is not encoded." : "Event unavailable: the Event box is closed for the acting faction."}</p>}
      <DecisionView pending={pending} view={view} faction={faction} forms={forms} plan={plan} dispatch={dispatch} answer={answer} />
    </section>
  );
}
