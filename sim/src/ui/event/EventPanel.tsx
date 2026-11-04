// Event panel (08 s3; 05 s5): both sides with owner and text; Execute validates, then asks each
// open question inline (Decisions, 08 s3.3, `decision.tsx`) until the command is legal.
import type { ActionForm, Api, AnyCommand, BoardView } from "../api.ts";
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
  const { pending, run, answer } = useDecisionFlow({ api, sessionId, onCommit, onTargets, onFreeAction, forms, dispatch, build: (side, answers) => (faction === null ? null : { type: "ChooseEvent", faction, side, answers }) });
  if (card === null) return null;

  return (
    <section className="panel" aria-label="Event panel">
      <strong>
        {card.id} {card.title}
      </strong>{" "}
      <span className="muted">{card.type}</span>
      {(["unshaded", "shaded"] as const).map((side) => {
        const s = card[side];
        if (s === null) return null;
        return (
          <div key={side} className={`event-side ${side}`}>
            <p>
              <em>{side}</em> ({s.owner ?? "either"}){s.blockOnly ? " block only" : ""}: {s.text}
            </p>
            <button type="button" disabled={!eventOpen || !card.encoded} title={!card.encoded ? "Not encoded." : eventOpen ? "" : "The Event box is not open."} onClick={() => void run(side, [])}>
              Execute {side} ({side === "unshaded" ? "U" : "S"})
            </button>
          </div>
        );
      })}
      {(!eventOpen || !card.encoded) && <p className="hint">{!card.encoded ? "Event unavailable: this card is not encoded." : "Event unavailable: the Event box is closed for the acting faction."}</p>}
      <DecisionView pending={pending} view={view} faction={faction} forms={forms} plan={plan} dispatch={dispatch} answer={answer} />
    </section>
  );
}
