// Forces panel: each faction's pieces on the map, Available and out of play (04 s2).
import type { BoardView } from "../api.ts";
import { PieceIcon } from "../board/PieceIcon.tsx";

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
                    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
                      <PieceIcon piece={{ piece: p.piece, faction: p.faction, face: "default", count: 0, shape: p.shape, colorVariant: p.colorVariant, emblem: null, isBase: p.isBase }} color={f.color} x={9} y={9} bare />
                    </svg>{" "}
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
