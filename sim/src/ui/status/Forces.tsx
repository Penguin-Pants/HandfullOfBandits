// Forces panel: each faction's pieces on the map, Available and out of play (04 s2). The play
// screen shows a one-line bar (UC-4) that opens the full tables.
import { useState } from "react";
import type { BoardView, ForceView } from "../api.ts";
import { PieceIcon } from "../board/PieceIcon.tsx";
import { words } from "../common/names.ts";

function Icon({ p, color }: { readonly p: ForceView; readonly color: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
      <PieceIcon piece={{ piece: p.piece, faction: p.faction, face: "default", count: 0, shape: p.shape, colorVariant: p.colorVariant, emblem: null, isBase: p.isBase }} color={color} x={9} y={9} bare />
    </svg>
  );
}

/** One line per faction: Available count large, on map and out of play small; opens the tables. */
export function ForcesBar({ view }: { readonly view: BoardView }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="forces-wrap">
      <div className="panel forces-bar" aria-label="Forces">
        {view.factions.map((f) => (
          <span key={f.id} className="forces-group">
            <strong style={{ color: f.color }}>{f.name}</strong>
            {view.forces.filter((p) => p.faction === f.id).map((p) => (
              <span key={p.piece} title={`${words(p.piece)}: ${String(p.onMap)} on map, ${String(p.available)} available, ${String(p.outOfPlay)} out of play`}>
                <Icon p={p} color={f.color} /> <b>{p.available}</b>{" "}
                <span className="muted">
                  avail · {p.onMap} map{p.outOfPlay > 0 ? ` · ${String(p.outOfPlay)} out` : ""}
                </span>
              </span>
            ))}
          </span>
        ))}
        <button type="button" aria-expanded={open} onClick={() => { setOpen(!open); }}>
          {open ? "Hide forces table ▴" : "Show forces table ▾"}
        </button>
      </div>
      {open && (
        <div className="forces-row">
          <Forces view={view} />
        </div>
      )}
    </div>
  );
}

export function Forces({ view }: { readonly view: BoardView }) {
  return (
    <>
      {view.factions.map((f) => (
        <section key={f.id} className="panel" aria-label={`${f.name} forces`}>
          <h3 style={{ color: f.color }}>{f.name} forces</h3>
          <table className="forces">
            <thead>
              <tr>
                <th>Piece</th>
                <th>On map</th>
                <th>Available</th>
                <th>Out of play</th>
              </tr>
            </thead>
            <tbody>
              {view.forces.filter((p) => p.faction === f.id).map((p) => (
                <tr key={p.piece}>
                  <td>
                    <Icon p={p} color={f.color} />{" "}
                    {p.piece}
                  </td>
                  <td>{p.onMap}</td>
                  <td>
                    <strong>{p.available}</strong>
                  </td>
                  <td>{p.outOfPlay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}
