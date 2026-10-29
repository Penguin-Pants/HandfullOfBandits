// What caused a log entry, for the plain-language log (UI clarity round R1.3). Read from the
// entry's rule reference: an Event card line ("DK-001 shaded"), an Operation or Special Activity
// handler, or a Propaganda phase handler. Null when the reference names none of these.
import { actionHandlers } from "../engine/coin/ops/registry.ts";
import { propagandaPhases } from "../engine/coin/propaganda/registry.ts";
import type { Ruleset } from "../engine/core/types.ts";
import { actionForms } from "./forms.ts";

export type Cause =
  | { readonly kind: "event"; readonly card: string; readonly title: string; readonly side: string }
  | { readonly kind: "action"; readonly id: string; readonly label: string }
  | { readonly kind: "phase"; readonly id: string };

const CARD_LINE = /^(\S+) (shaded|unshaded|Always)\b/;

export function causeOf(ruleset: Ruleset, ruleRef: string | null): Cause | null {
  if (ruleRef === null) return null;
  const line = CARD_LINE.exec(ruleRef);
  const card = line?.[1] === undefined ? undefined : ruleset.cards[line[1]];
  if (line !== null && card !== undefined) return { kind: "event", card: line[1] ?? "", title: card.title, side: line[2] ?? "" };
  const handler = Object.values(actionHandlers).find((h) => h.ruleRef === ruleRef);
  if (handler !== undefined) return { kind: "action", id: handler.id, label: actionForms.find((f) => f.id === handler.id)?.label ?? handler.id };
  const phase = ruleset.sequence.propagandaPhases.find((p) => propagandaPhases[p]?.ruleRef === ruleRef);
  return phase === undefined ? null : { kind: "phase", id: phase };
}

/** The title of a card ID, or null when the ID is not a card. */
export function cardTitle(ruleset: Ruleset, id: unknown): string | null {
  return typeof id === "string" ? (ruleset.cards[id]?.title ?? null) : null;
}
