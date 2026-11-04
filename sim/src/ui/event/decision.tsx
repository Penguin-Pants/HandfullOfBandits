// Event and Pivotal Decisions (08 s3.3; 05 s4): validate a command, then ask each open question
// inline until it is legal. Every answer is a click: options, counts, spaces picked on the map
// (UC-9), and a free action's plan built on the map (UC-5). Shared by the Event and Pivotal panels.
import { useEffect, useState } from "react";
import { confirmWarnings } from "../common/confirm.ts";
import type { ActionForm, Api, AnyCommand, BoardView, Question } from "../api.ts";
import { words } from "../common/names.ts";
import { PlanForm } from "../faction/PlanForm.tsx";
import { dragMode, partOf, type PlanEvent, type PlanState } from "../faction/plan.ts";

export interface Pending {
  /** What the command is for: an Event side or a Pivotal card. */
  readonly key: string;
  readonly answers: unknown[];
  readonly question: Question | null;
  readonly error: string | null;
}

export interface DecisionFlowProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly onCommit: (command: AnyCommand) => void;
  readonly onTargets?: ((ids: readonly string[] | null) => void) | undefined;
  /** A spaces or free-action plan question opened (true) or closed (false). */
  readonly onFreeAction?: ((open: boolean) => void) | undefined;
  readonly forms: readonly ActionForm[];
  readonly dispatch: (event: PlanEvent) => void;
  /** The command for `key` with `answers`; null when no faction may act. */
  readonly build: (key: string, answers: unknown[]) => AnyCommand | null;
}

export const formOf = (forms: readonly ActionForm[], id: string): ActionForm =>
  forms.find((f) => f.id === id) ?? { id, label: words(id.split(".").at(-1) ?? id), cost: "", summary: "", fields: [], subAction: null };

export function useDecisionFlow({ api, sessionId, onCommit, onTargets, onFreeAction, forms, dispatch, build }: DecisionFlowProps): { pending: Pending | null; run: (key: string, answers: unknown[]) => Promise<void>; answer: (value: unknown) => void } {
  const [pending, setPending] = useState<Pending | null>(null);
  const candidates = pending?.question?.kind === "spaces" ? pending.question.options : null;
  useEffect(() => {onTargets?.(candidates); return () => {onTargets?.(null);};}, [candidates, onTargets]);

  const run = async (key: string, answers: unknown[]): Promise<void> => {
    const command = build(key, answers);
    if (command === null) return;
    const result = await api.validate(sessionId, command);
    if (result.ok) {
      if (!confirmWarnings(result.warnings)) return;
      setPending(null);
      onFreeAction?.(false);
      onCommit(command);
      return;
    }
    const v = result.violations[0];
    const question = v?.question ?? null;
    setPending({ key, answers, question, error: question === null ? (v?.message ?? "Not legal.") : null });
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
    if (pending !== null) void run(pending.key, [...pending.answers, value]);
  };
  return { pending, run, answer };
}

export interface DecisionViewProps {
  readonly pending: Pending | null;
  readonly view: BoardView;
  readonly faction: string | null;
  readonly forms: readonly ActionForm[];
  readonly plan: PlanState;
  readonly dispatch: (event: PlanEvent) => void;
  readonly answer: (value: unknown) => void;
}

export function DecisionView({ pending, view, faction, forms, plan, dispatch, answer }: DecisionViewProps) {
  if (pending === null) return null;
  if (pending.question === null) return pending.error === null ? null : <p className="bad">{pending.error}</p>;
  return (
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
  );
}
