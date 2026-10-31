// Mouse-only Redeploy routes. The server checks all movement rules before commit.
import { useState } from "react";
import type { BoardView } from "../api.ts";
import { words } from "../common/names.ts";
import { Stepper } from "../common/Stepper.tsx";
interface Route { readonly piece: string; readonly from: string; readonly to: string; readonly count: number }
export function RedeployForm({view, selected, onChoose}: {readonly view: BoardView; readonly selected: readonly string[]; readonly onChoose: (choice: unknown) => void}) {
  const [piece, setPiece] = useState("troops");
  const [origin, setOrigin] = useState<string | null>(null);
  const [count, setCount] = useState("1");
  const [routes, setRoutes] = useState<readonly Route[]>([]);
  const name = (id: string): string => view.spaces.find(s => s.id === id)?.name ?? words(id);
  const current = selected[0] ?? null;
  return <div aria-label="Redeploy routes">
    <p>Select a map space and set it as the origin. Then select its destination.</p>
    <div className="row">{["troops", "police", "guerrilla"].map(p => <button key={p} type="button" aria-pressed={piece === p} onClick={() => { setPiece(p); }}>{words(p)}</button>)}</div>
    <button type="button" disabled={current === null} onClick={() => { setOrigin(current); }}>Use {current === null ? "selected space" : name(current)} as origin</button>
    <p>From: {origin === null ? "Choose origin" : name(origin)}. To: {current === null ? "Select destination" : name(current)}.</p>
    <Stepper label="Pieces to move" value={count} onChange={setCount} min={1} />
    <button type="button" disabled={origin === null || current === null || origin === current} onClick={() => {
      if (origin !== null && current !== null) setRoutes([...routes, {piece, from: origin, to: current, count: Number(count)}]);
    }}>Add route</button>
    <ol>{routes.map((r, i) => <li key={i}>{r.count} {words(r.piece)}: {name(r.from)} to {name(r.to)} <button type="button" aria-label={`Remove route ${String(i + 1)}`} onClick={() => { setRoutes(routes.filter((_, j) => j !== i)); }}>Remove</button></li>)}</ol>
    <button type="button" onClick={() => { onChoose(Object.fromEntries(["troops", "police", "guerrilla"].map(p => [p, routes.filter(r => r.piece === p).map(r => ({from: r.from, to: r.to, count: r.count}))]))); }}>Redeploy pieces</button>
  </div>;
}
