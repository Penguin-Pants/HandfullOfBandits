// Help panel: how a card turn works, how to build an Operation, keyboard keys. `?` toggles it.
export const KEYS: readonly (readonly [string, string])[] = [
  ["Space", "Reveal the first card, or Advance when nothing needs a choice"],
  ["Click / Shift-click", "Select a space / add a space to the selection"],
  ["Enter", "Commit the plan (Faction panel) or save a note (note bar)"],
  ["Esc", "Clear the plan or close the note bar"],
  ["N", "Write a note; Tab changes what it is attached to"],
  ["H", "Show or hide the history"],
  ["Ctrl+Z", "Undo the last action"],
  ["?", "Show or hide this help"],
];

export function Help({ onClose }: { readonly onClose: () => void }) {
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
            <li>Click spaces on the map (Shift-click for more).</li>
            <li>Fill in the fields per space. The plan is checked as you type.</li>
            <li>Check the preview, then Commit. Changed spaces get an amber outline.</li>
          </ol>
        </div>
        <div>
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
    </section>
  );
}
