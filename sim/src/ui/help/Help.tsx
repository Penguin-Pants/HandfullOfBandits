// Help panel: how a card turn works, how each faction wins (research 09), what each action does
// (research 06), how to build an Operation, keyboard keys. `?` toggles it.
import type { ActionForm, BoardView } from "../api.ts";
export const KEYS: readonly (readonly [string, string])[] = [
  ["Space", "Reveal the first card, or Advance when nothing needs a choice"],
  ["Click / Shift-click", "Select a space / add a space to the selection"],
  ["Drag", "From one space to another: move pieces (March, Sweep, Garrison, Air Mobility)"],
  ["Enter", "Commit the plan (Faction panel) or save a note (note bar)"],
  ["Esc", "Clear the plan or close the note bar"],
  ["N", "Write a note; Tab changes what it is attached to"],
  ["H", "Show or hide the history"],
  ["Ctrl+Z", "Undo the last action"],
  ["?", "Show or hide this help"],
];

/** Goal of each faction (research 09 s1): what its score counts and how to raise it. */
const GOALS: Readonly<Record<string, { readonly score: string; readonly how: string }>> = {
  state: {
    score: "Total Support + Legitimacy. Total Support = Pop of each domestic space at Passive Support, plus 2 × Pop at Active Support.",
    how: "Shift spaces toward Support with Civic Action (Train) and keep Legitimacy high. Find Guerrillas with Sweep and Garrison, then remove them with Assault.",
  },
  pkk: {
    score: "Total Opposition + PKK Bases in domestic spaces. Total Opposition = Pop of each domestic space at Passive Opposition, plus 2 × Pop at Active Opposition.",
    how: "Shift spaces toward Opposition with Agitation (Rally) and build Bases. Keep Guerrillas Underground, where Assault cannot remove them.",
  },
};

/** How the game is won (research 09 s3, s4), with this game's thresholds and Harm limit. */
function HowToWin({ view }: { readonly view: BoardView }) {
  const s = view.status;
  return (
    <div aria-label="How to win">
      <h3>How to win</h3>
      {view.factions.map((f) => {
        const goal = GOALS[f.id];
        return (
          <p key={f.id}>
            <strong style={{ color: f.color }}>{f.name}</strong>: score = {goal?.score ?? "see the score pill."} Win at a score of at least {s.thresholds[f.id] ?? "-"}. {goal?.how}
          </p>
        );
      })}
      <ol>
        <li>Victory check in each Propaganda round except the first: a faction wins if its score reaches its threshold and its Harm count is {s.harmLimit} or less. If both qualify, the bigger margin (score − threshold) wins.</li>
        <li>Harm count: State = State Harm markers. PKK = PKK Harm markers + Coercion markers.</li>
        <li>No winner by the end: the higher final margin wins. Final margin = score − threshold − 2 for each Harm over the limit. Ties: lower Harm, then the PKK.</li>
        <li>Removing pieces gives no points. Only Support, Opposition, Legitimacy and Bases score.</li>
      </ol>
    </div>
  );
}

/** What each action does, grouped by faction. */
function Actions({ view, forms }: { readonly view: BoardView; readonly forms: readonly ActionForm[] }) {
  return (
    <div aria-label="Actions">
      <h3>Actions</h3>
      {view.factions.map((f) => (
        <dl key={f.id} className="help-actions">
          {forms.filter((a) => a.id.startsWith(`${f.id}.`)).map((a) => (
            <div key={a.id}>
              <dt>
                <strong style={{ color: f.color }}>{a.label}</strong> <span className="muted">({a.cost})</span>
              </dt>
              <dd>{a.summary}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}

export interface HelpProps {
  readonly onClose: () => void;
  /** The board, for this game's thresholds and factions; absent: those sections are hidden. */
  readonly view?: BoardView;
  readonly forms?: readonly ActionForm[];
}

export function Help({ onClose, view, forms = [] }: HelpProps) {
  return (
    <section className="panel help" aria-label="Help">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2>How to play</h2>
        <button type="button" onClick={onClose}>
          Close (?)
        </button>
      </div>
      <div className="help-grid">
        <div>
          <h3>A card turn</h3>
          <ol>
            <li>The current card lies face up next to the deck.</li>
            <li>The First Eligible faction picks a box on the eligibility track: Event, Limited Op, Op Only, Op + SA or Pass. Each box shows what the other faction may do next.</li>
            <li>The Second Eligible faction picks from the boxes left open.</li>
            <li>When both have acted, the next card is revealed. Op Only and Op + SA hand First Eligible to the other faction.</li>
          </ol>
          <h3>An Operation</h3>
          <ol>
            <li>Pick a box, then an Operation.</li>
            <li>Click spaces on the map (Shift-click for more). To move pieces, drag from the start space to the destination; each drag adds 1 piece.</li>
            <li>Set counts with the − and + buttons and choices with their buttons. The plan is checked at each click.</li>
            <li>Check the preview, then Commit. Changed spaces get an amber outline.</li>
          </ol>
        </div>
        <div>
          {view !== undefined && <HowToWin view={view} />}
          <h3>Reading the map</h3>
          <ul>
            <li>Cell color and the square marker: Support (red) or Opposition (green). Filled marker = Active.</li>
            <li>■ after a name: who Controls the space.</li>
            <li>Round chips: space markers. C is Coercion, this game's Terror.</li>
            <li>Victory track at the top: each marker is a score; the flag is the winning score.</li>
          </ul>
          <h3>Keys</h3>
          <table>
            <tbody>
              {KEYS.map(([k, what]) => (
                <tr key={k}>
                  <td>
                    <kbd>{k}</kbd>
                  </td>
                  <td>{what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {view !== undefined && forms.length > 0 && <Actions view={view} forms={forms} />}
    </section>
  );
}
