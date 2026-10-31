// Decorative atlas artwork is independent of region geometry and gameplay state.
import type { BoardView } from "../api.ts";
import { isInset, LAKE_VAN, MAP_H, MAP_W, MAP_X0, pathOf, regionCells, RIVERS } from "./region.ts";

export function Terrain({ view, cells }: { readonly view: BoardView; readonly cells: ReturnType<typeof regionCells> }) {
  const mountains = view.spaces.filter(s => s.terrain === "mountain" && !isInset(s));
  const relief = {x: MAP_X0, y: 0, width: MAP_W - MAP_X0, height: MAP_H, fill: "url(#atlas-artwork)"};
  return (
    <g pointerEvents="none" aria-hidden="true" data-artwork="historical-atlas">
      <defs>
        <pattern id="atlas-artwork" patternUnits="userSpaceOnUse" x={MAP_X0} width={MAP_W - MAP_X0} height={MAP_H}>
          <image href="/atlas-terrain.png" width={MAP_W - MAP_X0} height={MAP_H} preserveAspectRatio="none" />
        </pattern>
        {(["domestic", "external"] as const).map(side => (
          <clipPath key={side} id={`clip-mountains-${side}`}>
            {mountains.filter(s => (s.kind === "domestic") === (side === "domestic")).map(s => {
              const cell = cells.domestic.get(s.id) ?? cells.external.get(s.id);
              return cell === undefined ? null : <path key={s.id} d={pathOf(cell)} data-terrain="mountain" data-of={s.id} />;
            })}
          </clipPath>
        ))}
      </defs>
      <rect {...relief} className="map-relief" />
      <g clipPath={cells.geographic ? "url(#clip-turkey)" : undefined}>
        <rect {...relief} className="map-relief mountain" clipPath="url(#clip-mountains-domestic)" />
      </g>
      <g clipPath={cells.geographic ? "url(#clip-abroad)" : undefined}>
        <rect {...relief} className="map-relief mountain" clipPath="url(#clip-mountains-external)" />
      </g>
      {cells.geographic && <path d={pathOf(LAKE_VAN)} className="map-lake" />}
      {cells.geographic && RIVERS.map(r => <path key={r.name} d={`M${r.path.map(p => p.join(",")).join("L")}`} className="map-river" />)}
    </g>
  );
}
