// "Why?" for a bot command (audit Plan 2 S1, S4): the chosen play and the best alternatives with
// their values and value components, and the sampled line after the chosen play. Values are the
// bot's own estimates (earned margin difference plus weighted terms), not proof of the best move.
import type { AnyCommand, BoardView, BotRecord } from "../api.ts";
import { words } from "../common/names.ts";

const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** A command in plain words: "Op + SA: March in Siirt, Bitlis + Ambush", "Event (shaded)". */
export function commandText(command: AnyCommand, view: BoardView): string {
  const place = (id: string): string => view.spaces.find((s) => s.id === id)?.name ?? words(id);
  const where = (ids: unknown): string => (Array.isArray(ids) ? ids.map((x) => place(str(x))).join(", ") : "");
  const op = (id: string): string => words(id.split(".").at(-1) ?? id);
  switch (command.type) {
    case "Pass":
      return "Pass";
    case "ChooseEvent":
      return `Event (${str(command["side"]) || "unshaded"})`;
    case "DeclareCeasefire":
      return "Declare a ceasefire";
    case "PlayPivotal":
      return `Play Pivotal ${str(command["card"])}`;
    case "ChooseOperation": {
      const plan = (command["plan"] ?? {}) as Record<string, unknown>;
      const sa = plan["sa"] as Record<string, unknown> | null | undefined;
      const main = `${words(str(command["box"]))}: ${op(str(plan["op"]))} in ${where(plan["locations"])}`;
      return sa === null || sa === undefined ? main : `${main} + ${op(str(sa["action"]))}${Array.isArray(sa["locations"]) && sa["locations"].length > 0 ? ` in ${where(sa["locations"])}` : ""}`;
    }
    case "PropagandaChoice":
      return `${words(str(command["phase"]))} choice`;
    default:
      return words(command.type);
  }
}

const fixed = (v: number | null): string => (v === null ? "n/a" : v.toFixed(1));

export function BotWhy({ records, view }: { readonly records: readonly BotRecord[]; readonly view: BoardView }) {
  if (records.length === 0) return null;
  return (
    <details className="bot-why" aria-label="Why the bot chose this">
      <summary>Why?</summary>
      {records.map((r) => (
        <div key={r.id}>
          <p>
            <strong>{r.player}</strong> ({words(r.kind)}) compared {r.candidates} legal plays. Values are the bot&apos;s estimates: margin difference plus weighted terms.
          </p>
          <ol>
            {r.review.map((c, i) => (
              <li key={c.id}>
                {i === 0 ? "Chosen: " : ""}
                {commandText(c.command, view)}, value {fixed(c.value)}
                {Object.keys(c.components).length > 0 && (
                  <span className="muted"> ({Object.entries(c.components).map(([k, v]) => `${words(k)} ${v.toFixed(1)}`).join(", ")})</span>
                )}
              </li>
            ))}
          </ol>
          {r.line !== undefined && r.line.length > 0 && (
            <p>
              Sampled line after the chosen play: {r.line.map((p) => `${words(p.faction)} ${commandText(p.command, view)}`).join(", then ")}. A guess on one sampled deck and dice, not a forecast.
            </p>
          )}
          {r.notes.length > 0 && <p className="muted">{r.notes.join("; ")}</p>}
        </div>
      ))}
    </details>
  );
}
