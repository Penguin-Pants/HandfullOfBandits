// Decorative artwork stays independent from area geometry, country lines and live game data.
import type { BoardView } from "../api.ts";
import { isInset, MAP_H, MAP_W, MAP_X0, pathOf, regionCells } from "./region.ts";
import { ATLAS } from "./atlas-data.ts";

export function Terrain({ view, cells }: { view: BoardView; cells: ReturnType<typeof regionCells> }) {
  const mountains = view.spaces.filter(s => s.terrain === "mountain" && !isInset(s));
  const relief = { x: MAP_X0, y: 0, width: MAP_W - MAP_X0, height: MAP_H, fill: "url(#atlas-artwork)" };
  return <g pointerEvents="none" aria-hidden="true" data-artwork="historical-atlas">
    <defs>
      <pattern id="atlas-artwork" patternUnits="userSpaceOnUse" x={MAP_X0} width={MAP_W - MAP_X0} height={MAP_H}>
        <image href="/atlas-terrain.png" width={MAP_W - MAP_X0} height={MAP_H} preserveAspectRatio="none" />
      </pattern>
      <clipPath id="clip-mountains">
        {mountains.map(s => <path key={s.id} d={cells.geographic ? ATLAS.spaces[s.id]?.path : pathOf(cells.domestic.get(s.id) ?? [])} data-terrain="mountain" data-of={s.id} />)}
      </clipPath>
    </defs>
    <rect {...relief} className="map-relief" />
    <rect {...relief} className="map-relief mountain" clipPath="url(#clip-mountains)" />
  </g>;
}
