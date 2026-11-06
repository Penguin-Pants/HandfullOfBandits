// Propaganda prompt (07 s4.4, 11 P4-14): one y/n question per Propaganda round, off by default.
// The answer is a note with category `legal-politics-signal` anchored to the head action, so the
// metrics review (item 13) finds it in the round. A browser setting turns the prompt on.
import { useEffect, useState } from "react";
import type { Api, BoardView, UiFocus } from "../api.ts";

export const SIGNAL_CATEGORY = "legal-politics-signal";
export const SIGNAL_SETTING = "hob.prompt.legalPoliticsSignal";
export const SIGNAL_QUESTION = "Did Legal Space or Offices change a decision this round?";

export const signalEnabled = (): boolean => localStorage.getItem(SIGNAL_SETTING) === "on";

export interface SignalPromptProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly view: BoardView;
  readonly headActionId: string;
  readonly focus: UiFocus;
}

export function SignalPrompt({ api, sessionId, view, headActionId, focus }: SignalPromptProps) {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const { campaign, propagandaRound } = view.status;
  useEffect(() => {
    void api.annotations(sessionId).then((notes) => {
      setAnswered(notes.some((n) => {
        const context = JSON.parse(n.context) as Record<string, unknown>;
        return (JSON.parse(n.category_ids) as string[]).includes(SIGNAL_CATEGORY) && context["campaign"] === campaign && context["propaganda_round"] === propagandaRound;
      }));
    });
  }, [api, sessionId, campaign, propagandaRound]);
  if (answered !== false) return null;
  const answer = (yes: boolean): void => {
    void api.annotate(sessionId, { anchor: "executed", actionId: headActionId, text: yes ? "y" : "n", categoryIds: [SIGNAL_CATEGORY], focus }).then(() => { setAnswered(true); });
  };
  return (
    <div className="row" aria-label="Legal Politics signal">
      <span>{SIGNAL_QUESTION}</span>
      <button type="button" onClick={() => { answer(true); }}>Yes</button>
      <button type="button" onClick={() => { answer(false); }}>No</button>
    </div>
  );
}
