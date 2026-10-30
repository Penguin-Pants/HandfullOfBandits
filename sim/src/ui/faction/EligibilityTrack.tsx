// Eligibility track, design E4 (UC-8): the 1st Eligible faction's row of boxes over the 2nd's,
// each faction's cylinder in the box it took. The 1st Eligible points at a box (hover or focus) to
// see which boxes stay open to the other faction and who is 1st on the next card (05 s2.3, s2.4);
// one line says the effect in words. The 2nd Eligible sees the box the 1st took and its own choices.
import { useState, type ReactNode } from "react";
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
  const cylinder = (id: string) => (
    <span className="elig-cylinder" style={{ background: view.factions.find((f) => f.id === id)?.color }}>
      {name(id)}
    </span>
  );
  const [firstId, secondId] = first ? [me, other] : [other, me];
  const taken = legal.placed?.[firstId] ?? null;
  const focus = boxes.find((b) => b.box === (pointed ?? picked));
  const open = (box: string): boolean | null => (first ? (focus?.otherMay?.includes(box) ?? null) : (boxes.find((b) => b.box === box)?.allowed ?? false));

  /** This faction's own boxes: buttons, with the hover preview on the 1st Eligible's row. */
  const mine = boxes.map((b) => (
    <div key={b.box} className={`elig-box${b.allowed ? "" : " closed"}${focus?.box === b.box && first ? " pointed" : ""}`} aria-label={`${words(b.box)} box`}>
      <button
        type="button"
        // aria-disabled, not disabled: a closed box and the Event box still take focus and hover,
        // so their effect can be previewed; the Event itself runs from the card panel.
        aria-disabled={!b.allowed || b.box === "event" ? true : undefined}
        title={b.reason ?? (b.box === "event" ? "Use the event panel." : "")}
        aria-pressed={picked === b.box}
        onClick={() => { if (b.allowed && b.box !== "event") onPick(b.box); }}
        onMouseEnter={() => { setPointed(b.box); }}
        onMouseLeave={() => { setPointed(null); }}
        onFocus={() => { setPointed(b.box); }}
        onBlur={() => { setPointed(null); }}
      >
        {words(b.box)}
      </button>
      {!b.allowed && <span className="elig-note">Closed</span>}
    </div>
  ));
  /** The other faction's boxes: open or closed by the pointed choice (1st), or where the 1st went (2nd). */
  const theirs = (id: string) =>
    boxes.map((b) => {
      const state = !first ? (taken === b.box ? "taken" : "") : open(b.box) === null ? "" : open(b.box) === true ? "open" : "closed";
      return (
        <div key={b.box} className={`elig-box ${state === "closed" ? "closed dim" : state}`} aria-label={state === "" ? `${name(id)} ${words(b.box)}` : `${name(id)} ${words(b.box)}: ${state}`}>
          <b>{words(b.box)}</b>
          {state === "taken" ? cylinder(id) : state !== "" && <span className="elig-note">{state}</span>}
        </div>
      );
    });
  const row = (id: string, place: string, cells: ReactNode) => (
    <div className="elig-row" role="group" aria-label={`${name(id)} (${place}) boxes`}>
      <div className="elig-who">
        <span className="elig-note">{place}</span>
        {cylinder(id)}
      </div>
      {cells}
    </div>
  );

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
    <div className="elig-track" aria-label="Eligibility track">
      {row(firstId, "1st", first ? mine : theirs(firstId))}
      {row(secondId, "2nd", first ? theirs(secondId) : mine)}
      <p className="elig-effect" aria-label="Choice effect" aria-live="polite">
        {effect}
      </p>
    </div>
  );
}
