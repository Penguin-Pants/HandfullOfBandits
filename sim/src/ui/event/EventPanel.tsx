// Event panel (08 s3; 05 s5): both sides with owner and text; Execute validates, then asks each
// open question inline (Decisions, 08 s3.3) until the command is legal. Every answer is a click:
// options, counts, spaces picked on the map (UC-9), and a free action's plan built on the map (UC-5).
import { useState } from "react";
import type { ActionForm, Api, AnyCommand, BoardView, Question } from "../api.ts";
import { words } from "../common/names.ts";
import { PlanForm } from "../faction/PlanForm.tsx";
import { dragMode, partOf, type PlanEvent, type PlanState } from "../faction/plan.ts";

export interface EventPanelProps {
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

const formOf = (forms: readonly ActionForm[], id: string): ActionForm =>
  forms.find((f) => f.id === id) ?? { id, label: words(id.split(".").at(-1) ?? id), cost: "", summary: "", fields: [], subAction: null };

export function EventPanel({ api, sessionId, view, faction, eventOpen, onCommit, forms, plan, dispatch, onFreeAction }: EventPanelProps) {
  const card = view.status.card;
  const [pending, setPending] = useState<{ side: string; answers: unknown[]; question: Question | null; error: string | null } | null>(null);
  if (card === null) return null;

  const run = async (side: string, answers: unknown[]): Promise<void> => {
    if (faction === null) return;
    const command = { type: "ChooseEvent", faction, side, answers };
    const result = await api.validate(sessionId, command);
    if (result.ok) {
      setPending(null);
      onFreeAction?.(false);
      onCommit(command);
      return;
    }
    const v = result.violations[0];
    const question = v?.question ?? null;
    setPending({ side, answers, question, error: question === null ? (v?.message ?? "Not legal.") : null });
    handOff(question);
  };
  /** Hand the map to a free-action plan in the same step that shows its question, so no map
   * click can land between the two. The same question asked again keeps its draft. */
  const handOff = (question: Question | null): void => {
    if (question?.kind === "spaces") {
      onFreeAction?.(true);
      return;
    }
    if (question?.kind !== "plan" || question.action === undefined) {
      onFreeAction?.(false);
      return;
    }
    const before = pending?.question;
    if (before?.kind === "plan" && before.action === question.action && before.sa === question.sa) return;
    onFreeAction?.(true);
    const sa = question.sa;
    dispatch({ type: "modes", op: dragMode(formOf(forms, question.action).fields, question.action), sa: sa === undefined ? null : dragMode(formOf(forms, sa).fields, sa) });
  };
  const answer = (value: unknown): void => {
    if (pending !== null) void run(pending.side, [...pending.answers, value]);
  };

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
          <div key={side}>
            <p>
              <em>{side}</em> ({s.owner ?? "either"}){s.blockOnly ? " block only" : ""}: {s.text}
            </p>
            <button type="button" disabled={!eventOpen || !card.encoded} title={!card.encoded ? "Not encoded." : eventOpen ? "" : "The Event box is not open."} onClick={() => void run(side, [])}>
              Execute {side} ({side === "unshaded" ? "U" : "S"})
            </button>
          </div>
        );
      })}
      {pending?.error != null && <p className="bad">{pending.error}</p>}
      {pending?.question != null && (
        <div aria-label="Decision">
          <p>
            {words(faction ?? "")} decides: {pending.question.space === undefined ? "" : `${view.spaces.find((s) => s.id === pending.question?.space)?.name ?? words(pending.question.space)}: `}{pending.question.kind === "plan" && pending.question.action !== undefined ? `Plan the free ${formOf(forms, pending.question.action).label}, or skip it.` : pending.question.prompt} <span className="muted">(PA-01)</span>
          </p>
          {pending.question.kind === "option" && pending.question.options.map((o, i) => (
            <button key={o} type="button" onClick={() => { answer(o); }}>
              {i + 1}. {o}
            </button>
          ))}
          {pending.question.kind === "count" &&
            Array.from({ length: pending.question.max - pending.question.min + 1 }, (_, i) => (pending.question?.min ?? 0) + i).map((n) => (
              <button key={n} type="button" onClick={() => { answer(n); }}>
                {n}
              </button>
            ))}
          {pending.question.kind === "spaces" && (() => {
            const options = pending.question.options;
            const picks = plan.op.locations.filter((l) => options.includes(l));
            return (
              <>
                <p className="hint">Click spaces on the map (Shift-click adds more), or use the buttons.</p>
                <div className="row" role="group" aria-label="Spaces">
                  {options.map((o) => (
                    <button key={o} type="button" aria-pressed={picks.includes(o)} onClick={() => { dispatch({ type: "click", id: o, add: true }); }}>
                      {view.spaces.find((s) => s.id === o)?.name ?? words(o)}
                    </button>
                  ))}
                  <button type="button" className="primary" onClick={() => { answer(picks); }}>
                    Pick {picks.length}
                  </button>
                </div>
              </>
            );
          })()}
          {pending.question.kind === "plan" && pending.question.action !== undefined && (() => {
            const op = formOf(forms, pending.question.action);
            const sa = pending.question.sa === undefined ? undefined : formOf(forms, pending.question.sa);
            const submit = (): void => {
              answer({ op: op.id, ...partOf(op.fields, plan.op), sa: sa === undefined ? null : { action: sa.id, ...partOf(sa.fields, plan.sa) } });
            };
            return (
              <div aria-label="Free action">
                <PlanForm view={view} faction={faction ?? ""} op={op} sa={sa} plan={plan} dispatch={dispatch} />
                <div className="row">
                  <button type="button" className="primary" disabled={plan.op.locations.length === 0} onClick={submit}>
                    Submit plan
                  </button>
                  <button type="button" onClick={() => { answer(null); }}>
                    Skip the free action
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}
