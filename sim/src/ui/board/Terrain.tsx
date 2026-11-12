// Printed-board terrain: three static pre-rendered textures, clipped by the existing area paths.
// Artwork stays independent from area geometry, country lines and live game data.
import type { BoardView } from "../api.ts";
import { isInset, MAP_H, MAP_W, pathOf, regionCells } from "./region.ts";
import { ATLAS } from "./atlas-data.ts";

export function Terrain({ view, cells }: { view: BoardView; cells: ReturnType<typeof regionCells> }) {
  const located = view.spaces.filter(s => !isInset(s));
  const width = cells.geographic ? ATLAS.width : MAP_W;
  const height = cells.geographic ? ATLAS.height : MAP_H;
  const pathFor = (id: string): string | undefined => cells.geographic ? ATLAS.spaces[id]?.path : pathOf(cells.domestic.get(id) ?? []);
  const clip = (id: string, terrain: string, spaces: typeof located) => <clipPath id={id}>
    {spaces.map(s => <path key={s.id} d={pathFor(s.id)} clipRule="evenodd" data-terrain={terrain} data-of={s.id} />)}
  </clipPath>;
  const layer = { x: 0, y: 0, width, height, preserveAspectRatio: "none" };
  return <g pointerEvents="none" aria-hidden="true" data-artwork="printed-board">
    <defs>
      {clip("clip-mountains", "mountain", located.filter(s => s.terrain === "mountain" && s.kind === "domestic"))}
      {clip("clip-plains", "plain", located.filter(s => s.terrain === "plain" && s.kind === "domestic"))}
      {clip("clip-abroad", "mountain", located.filter(s => s.terrain === "mountain" && s.kind !== "domestic"))}
    </defs>
    <image href="/board-outside.webp" {...layer} className="map-relief outside" />
    <image href="/board-highland.webp" {...layer} className="map-relief abroad" clipPath="url(#clip-abroad)" />
    <image href="/board-plains.webp" {...layer} className="map-relief plain" clipPath="url(#clip-plains)" />
    <image href="/board-highland.webp" {...layer} className="map-relief mountain" clipPath="url(#clip-mountains)" />
  </g>;
}
