// Eligibility track, design C (UI simplification; UC-8): one shared row of the five boxes, as on
// the printed board. Each faction's cylinder sits in the box it took or is pointing at. A bar in the
// 2nd Eligible faction's color marks each box open to it: for the 1st Eligible, the boxes its
// pointed or picked choice leaves open (05 s2.3); for the 2nd, its own open boxes. One line says
// the effect in words and names the 1st Eligible on the next card (05 s2.4), so no cue is color only.
import { useState, type CSSProperties } from "react";
import type { BoardView, LegalChoices } from "../api.ts";
import { words } from "../common/names.ts";

export interface EligibilityTrackProps {
  readonly legal: LegalChoices;
  readonly view: BoardView;
  /** The box this faction picked, if any. */
  readonly picked: string | null;
  readonly onPick: (box: string) => void;
}

/** "A, B or C". */
const either = (items: readonly string[]): string => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items.at(-1) ?? ""}`);

export function EligibilityTrack({ legal, view, picked, onPick }: EligibilityTrackProps) {
  const [pointed, setPointed] = useState<string | null>(null);
  const boxes = legal.boxes ?? [];
  const me = legal.faction ?? "";
  const other = legal.other ?? "";
  const first = legal.first === true;
  const name = (id: string): string => view.factions.find((f) => f.id === id)?.name ?? words(id);
  const color = (id: string): string | undefined => view.factions.find((f) => f.id === id)?.color;
  const cylinder = (id: string) => <span className="elig-cylinder" style={{ background: color(id) }}>{name(id)}</span>;
  const [firstId, secondId] = first ? [me, other] : [other, me];
  const taken = legal.placed?.[firstId] ?? null;
  const focus = boxes.find((b) => b.box === (pointed ?? picked));
  /** Open to the 2nd Eligible: true, false, or null while the 1st points at nothing. */
  const open = (box: string): boolean | null => (first ? (focus?.otherMay?.includes(box) ?? null) : (boxes.find((b) => b.box === box)?.allowed ?? false));

  let effect: string;
  if (!first) {
    const may = boxes.filter((b) => b.allowed).map((b) => words(b.box));
    effect = taken === null ? `${name(me)} may take ${either(may)}.` : `${name(firstId)} took ${words(taken)}: ${name(me)} may take ${either(may)}.`;
  } else if (focus?.otherMay != null && focus.nextFirst != null) {
    effect = `If ${name(me)} takes ${words(focus.box)}: ${name(other)} may take ${either(focus.otherMay.map(words))}. Next card ${name(focus.nextFirst)} is 1st Eligible.`;
  } else {
    effect = `Point at a box to see what it leaves open for ${name(other)} and who is 1st on the next card.`;
  }

  return (
    <div className="elig-track" aria-label="Eligibility track" style={{ "--next-color": color(secondId) } as CSSProperties}>
      <div className="elig-row" role="group" aria-label="Eligibility boxes">
        {boxes.map((b) => {
          const state = open(b.box);
          const here = first ? (focus?.box === b.box ? me : null) : taken === b.box ? firstId : null;
          const label = `${words(b.box)} box${state === null ? "" : state ? `: open to ${name(secondId)}` : `: closed to ${name(secondId)}`}${here === null || here === me ? "" : `, ${name(here)} took it`}`;
          return (
            <div key={b.box} className={`elig-box${b.allowed ? "" : " closed"}${state === true ? " open-next" : ""}${focus?.box === b.box && first ? " pointed" : ""}`} aria-label={label}>
              <button
                type="button"
                // aria-disabled, not disabled: a closed box still takes focus and hover, so its
                // reason shows. The Event box moves focus to the face-up card, where the Event runs.
                aria-disabled={!b.allowed ? true : undefined}
                title={b.reason ?? (b.box === "event" ? "Use the event panel." : "")}
                aria-pressed={picked === b.box}
                onClick={() => { if (b.allowed) onPick(b.box); }}
                onMouseEnter={() => { setPointed(b.box); }}
                onMouseLeave={() => { setPointed(null); }}
                onFocus={() => { setPointed(b.box); }}
                onBlur={() => { setPointed(null); }}
              >
                {words(b.box)}
              </button>
              <span className="elig-slot">{here !== null && cylinder(here)}</span>
            </div>
          );
        })}
      </div>
      <div className="elig-legend">
        {boxes.some((b) => open(b.box) === true) && <span className="elig-swatch" aria-hidden="true" />}
        <p className="elig-effect" aria-label="Choice effect" aria-live="polite">{effect}</p>
      </div>
    </div>
  );
}
