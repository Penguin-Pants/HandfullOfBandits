// Mouse-only Redeploy routes. The next map click after a route starts is its origin, the click after
// that is its destination. The server checks all movement rules before commit.
import { useEffect, useState } from "react";
import type { BoardView } from "../api.ts";
import { words } from "../common/names.ts";
import { Stepper } from "../common/Stepper.tsx";
interface Route { readonly piece: string; readonly from: string; readonly to: string; readonly count: number }
const PIECES = ["troops", "police", "guerrilla"];
/** `pieces`: the piece kinds this player may route (a bot seat routes the others); default all. */
export function RedeployForm({view, selected, onChoose, pieces = PIECES}: {readonly view: BoardView; readonly selected: readonly string[]; readonly onChoose: (choice: unknown) => void; readonly pieces?: readonly string[] | undefined}) {
  const [piece, setPiece] = useState(pieces[0] ?? "troops");
  const [origin, setOrigin] = useState<string | null>(null);
  const [dest, setDest] = useState<string | null>(null);
  const [count, setCount] = useState("1");
  const [routes, setRoutes] = useState<readonly Route[]>([]);
  const name = (id: string): string => view.spaces.find(s => s.id === id)?.name ?? words(id);
  // Each map click makes a new selection: the first sets the origin, a later one the destination.
  const clicked = selected[0] ?? null;
  useEffect(() => {
    if (clicked === null) return;
    if (origin === null) setOrigin(clicked);
    else if (clicked !== origin) setDest(clicked);
    // Only a new click moves the route on; origin changes alone must not.
  }, [selected]);
  const clear = (): void => { setOrigin(null); setDest(null); };
  const target = view.spaces.find(s => s.id === dest);
  return <div aria-label="Redeploy routes">
    <p>Click a map space for the origin. Then click its destination.</p>
    <div className="row">{pieces.map(p => <button key={p} type="button" aria-pressed={piece === p} onClick={() => { setPiece(p); }}>{words(p)}</button>)}</div>
    <p>From: {origin === null ? "click a map space" : name(origin)}. To: {dest === null ? "click its destination on the map" : name(dest)}.</p>
    {piece === "guerrilla" && target?.hostEntry === "restricted" && <p>Restricted host: Guerrillas arrive Active and the PKK pays {target.hostEntryCost} Resource{target.hostEntryCost === 1 ? "" : "s"} for this destination.</p>}
    <Stepper label="Pieces to move" value={count} onChange={setCount} min={1} />
    <div className="row">
      <button type="button" disabled={origin === null || dest === null} onClick={() => {
        if (origin !== null && dest !== null) setRoutes([...routes, {piece, from: origin, to: dest, count: Number(count)}]);
        clear();
      }}>Add route</button>
      <button type="button" disabled={origin === null} onClick={clear}>Clear origin</button>
    </div>
    <ol>{routes.map((r, i) => <li key={i}>{r.count} {words(r.piece)}: {name(r.from)} to {name(r.to)} <button type="button" aria-label={`Remove route ${String(i + 1)}`} onClick={() => { setRoutes(routes.filter((_, j) => j !== i)); }}>Remove</button></li>)}</ol>
    <button type="button" onClick={() => { onChoose(Object.fromEntries(PIECES.map(p => [p, routes.filter(r => r.piece === p).map(r => ({from: r.from, to: r.to, count: r.count}))]))); }}>Redeploy pieces</button>
  </div>;
}
