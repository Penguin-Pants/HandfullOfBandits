// Approved option 2: geography, printed population and live COIN counters stay separate.
import type { BoardView, SpaceView } from "../api.ts";
import { ATLAS, type AtlasSpace } from "./atlas-data.ts";
import { levelLabel, MarkerChips } from "./markers.tsx";
import { PieceIcon } from "./PieceIcon.tsx";

/** Domestic off-map boxes use the same printed population and two holding boxes. */
export function atlasLayout(space: SpaceView): AtlasSpace | undefined {
  const layout = ATLAS.spaces[space.id];
  if (layout !== undefined || space.kind !== "domestic" || !space.tags.includes("noLandLinks")) return layout;
  const { x, y } = space;
  return {
    source: [x, y], path: `M${String(x - 58)},${String(y - 45)}h116v90h-116Z`, rings: [],
    labels: [{ text: space.name, x: x - 6, y: y - 22, size: 11 }],
    population: [x + 41, y - 32, 11], counters: [[x - 28, y - 10, 25], [x + 3, y - 10, 25]],
    stack: [x - 40, y + 23, 80, 18],
  };
}

function Counter({ x, y, size, label, lines, color, solid = false }: { readonly x: number; readonly y: number; readonly size: number; readonly label: string; readonly lines: readonly string[]; readonly color: string | null; readonly solid?: boolean }) {
  return (
    <g aria-label={label} className="atlas-counter">
      <rect x={x} y={y} width={size} height={size} fill={solid && color !== null ? color : "#f5efde"} stroke={color ?? "#8a7b62"} strokeWidth={.65} />
      {lines.map((line, i) => (
        <text key={line} x={x + size / 2} y={y + size * (lines.length === 1 ? .57 : .34 + i * .26)} textAnchor="middle" textLength={line.length > 5 ? size - 3 : undefined} lengthAdjust="spacingAndGlyphs" style={{ fontSize: size * .23 }} fill={solid ? "#fff9e9" : color ?? "#4d493c"} className={label.includes("Support") || label.includes("Opposition") ? "level-marker" : undefined}>
          {line}
        </text>
      ))}
    </g>
  );
}

/** The name, printed population and both holding boxes always use the approved interior layout. */
export function AtlasInfo({ space, view, layout }: { readonly space: SpaceView; readonly view: BoardView; readonly layout: AtlasSpace }) {
  const faction = view.factions.find(f => f.id === space.control);
  const level = levelLabel(space);
  const active = Math.abs(space.level ?? 0) > 1;
  const positive = (space.level ?? 0) > 0;
  const controlBox = layout.counters?.[0];
  const levelBox = layout.counters?.[1];
  const pop = layout.population;
  return (
    <g data-info={space.id} pointerEvents="none">
      {layout.labels.map((label, i) => <text key={i} x={label.x} y={label.y} style={{ fontSize: label.size }} textAnchor="middle" className="map-label atlas-label">{label.text}</text>)}
      {pop !== undefined && <g aria-label={`Population ${String(space.pop)}`} className="atlas-population">
        <rect x={pop[0]} y={pop[1]} width={pop[2]} height={pop[2]} />
        <text x={pop[0] + pop[2] / 2} y={pop[1] + pop[2] * .8} textAnchor="middle" fontSize={pop[2] * .8}>{space.pop}</text>
      </g>}
      {controlBox !== undefined && <Counter x={controlBox[0]} y={controlBox[1]} size={controlBox[2]} label={faction === undefined ? "No Control" : `${faction.name} Control`} lines={faction === undefined ? ["Control"] : [faction.name.toUpperCase(), "CONTROL"]} color={faction?.color ?? null} solid={faction !== undefined} />}
      {levelBox !== undefined && <Counter x={levelBox[0]} y={levelBox[1]} size={levelBox[2]} label={level ?? "Neutral"} lines={level === null ? ["Neutral"] : [active ? "ACTIVE" : "PASSIVE", positive ? "SUPPORT" : "OPPOSITION", active ? "×2" : "×1"]} color={level === null ? null : positive ? "#9b3431" : "#526c40"} solid={active} />}
      <Stack space={space} view={view} bounds={layout.stack} />
    </g>
  );
}

/** Fit live piece and marker groups into their reserved area, including unusually full stacks. */
function Stack({ space, view, bounds }: { readonly space: SpaceView; readonly view: BoardView; readonly bounds: readonly [number, number, number, number] }) {
  const [x, y, w, h] = bounds;
  const columns = Math.min(3, Math.max(space.pieces.length, space.markers.length));
  if (columns === 0) return null;
  const pieceRows = Math.ceil(space.pieces.length / columns);
  const markerRows = Math.ceil(space.markers.length / columns);
  const width = columns * 30;
  const height = pieceRows * 20 + markerRows * 36;
  const scale = Math.min(1, w / width, h / height);
  return <g className="atlas-stack" transform={`translate(${String(x + (w - width * scale) / 2)} ${String(y + (h - height * scale) / 2)}) scale(${String(scale)})`}>
    {space.pieces.map((piece, i) => <PieceIcon key={`${piece.piece}-${piece.face}`} piece={piece} color={view.factions.find(f => f.id === piece.faction)?.color ?? "#444"} x={8 + (i % columns) * 30} y={8 + Math.floor(i / columns) * 20} />)}
    {Array.from({ length: markerRows }, (_, row) => <MarkerChips key={row} markers={space.markers.slice(row * columns, (row + 1) * columns)} x={width / 2} y={pieceRows * 20 + row * 36 + 12} />)}
  </g>;
}

/** Country lines do not create game links. The lake is decorative, never a hit target. */
export function AtlasGeography() {
  return <g pointerEvents="none" aria-hidden="true">
    <path d={ATLAS.lake} className="map-lake" data-geography="lake-van" />
    <path d={ATLAS.countryBorders} className="country-border-halo" />
    <path d={ATLAS.countryBorders} className="country-border" data-geography="country-borders" />
    <text x={600} y={105} textAnchor="middle" className="country-name">T U R K E Y</text>
  </g>;
}
