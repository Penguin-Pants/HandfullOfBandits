// Event panel (08 s3; 05 s5): both sides with owner and text; Execute validates, then asks each
// open question inline (Decisions, 08 s3.3) until the command is legal.
import { useState } from "react";
import type { Api, AnyCommand, BoardView, Question } from "../api.ts";

export interface EventPanelProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly view: BoardView;
  readonly faction: string | null;
  readonly eventOpen: boolean;
  readonly onCommit: (command: AnyCommand) => void;
}

export function EventPanel({ api, sessionId, view, faction, eventOpen, onCommit }: EventPanelProps) {
  const card = view.status.card;
  const [pending, setPending] = useState<{ side: string; answers: unknown[]; question: Question | null; error: string | null } | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [planText, setPlanText] = useState("");
  const [planError, setPlanError] = useState<string | null>(null);
  if (card === null) return <section className="panel">No card.</section>;

  const run = async (side: string, answers: unknown[]): Promise<void> => {
    if (faction === null) return;
    const command = { type: "ChooseEvent", faction, side, answers };
    const result = await api.validate(sessionId, command);
    if (result.ok) {
      setPending(null);
      onCommit(command);
      return;
    }
    const v = result.violations[0];
    setPicks([]);
    setPending({ side, answers, question: v?.question ?? null, error: v?.question === undefined ? (v?.message ?? "Not legal.") : null });
  };
  const answerPlan = (): void => {
    try {
      setPlanError(null);
      answer(JSON.parse(planText) as unknown);
    } catch {
      setPlanError("The plan is not valid JSON.");
    }
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
            {faction} decides: {pending.question.prompt} <span className="muted">(PA-01)</span>
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
          {pending.question.kind === "spaces" && (
            <div className="row">
              {pending.question.options.map((o) => (
                <label key={o}>
                  <input type="checkbox" checked={picks.includes(o)} onChange={() => { setPicks(picks.includes(o) ? picks.filter((p) => p !== o) : [...picks, o]); }} /> {o}
                </label>
              ))}
              <button type="button" onClick={() => { answer(picks); }}>
                Pick {picks.length}
              </button>
            </div>
          )}
          {pending.question.kind === "plan" && (
            <div>
              <label>
                Plan (JSON){" "}
                <textarea rows={3} cols={48} placeholder='{"locations": ["botan"], "perLocation": {"botan": {}}}' value={planText} onChange={(e) => { setPlanText(e.target.value); }} />
              </label>
              {planError !== null && <p className="bad">{planError}</p>}
              <div className="row">
                <button type="button" onClick={answerPlan}>
                  Submit plan
                </button>
                <button type="button" onClick={() => { answer(null); }}>
                  Skip the free action
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
