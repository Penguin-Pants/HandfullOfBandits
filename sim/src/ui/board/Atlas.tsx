// Reviewed readable atlas: geometry and layout are static; every game value stays live.
import type { BoardView, SpaceView } from "../api.ts";
import { ATLAS, type AtlasSpace } from "./atlas-data.ts";
import { levelLabel, MarkerChips } from "./markers.tsx";
import { PieceIcon } from "./PieceIcon.tsx";

export function atlasLayout(space: SpaceView): AtlasSpace | undefined {
  return ATLAS.spaces[space.id] ?? ATLAS.insets[space.id];
}

function Counter({ x, y, width, height, label, lines, color, solid = false }: { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly label: string; readonly lines: readonly string[]; readonly color: string | null; readonly solid?: boolean }) {
  return <g aria-label={label} className="atlas-counter">
    <rect x={x} y={y} width={width} height={height} fill={solid && color !== null ? color : "#f5efde"} stroke={color ?? "#8a7b62"} strokeWidth={.65} />
    {lines.map((line, i) => <text key={line} x={x + width / 2} y={y + (height - (lines.length - 1) * 12) / 2 + 4 + i * 12} textAnchor="middle" textLength={line.length > 6 ? width - 7 : undefined} lengthAdjust="spacingAndGlyphs" style={{ fontSize: 12 }} fill={solid ? "#fff9e9" : color ?? "#4d493c"} className={label.includes("Support") || label.includes("Opposition") ? "level-marker" : undefined}>{line}</text>)}
  </g>;
}

export function AtlasInfo({ space, view, layout }: { readonly space: SpaceView; readonly view: BoardView; readonly layout: AtlasSpace }) {
  const faction = view.factions.find(f => f.id === space.control);
  const level = levelLabel(space);
  const active = Math.abs(space.level ?? 0) > 1;
  const positive = (space.level ?? 0) > 0;
  const controlBox = layout.counters?.[0];
  const levelBox = layout.counters?.[1];
  const pop = layout.population;
  const multiplier = active ? "×2" : "×1";
  let levelLines = level === null ? ["NEUTRAL"] : [active ? "ACTIVE" : "PASSIVE", positive ? "SUPPORT" : "OPPOSE", multiplier];
  if (levelBox !== undefined && levelBox[3] < 36 && levelLines.length === 3) levelLines = [levelLines[0] ?? "", `${levelLines[1] ?? ""} ${multiplier}`];
  if (layout.inlineCounters) levelLines = [level === null ? "Neutral" : `${level} ${multiplier}`];
  return <g data-info={space.id} pointerEvents="none">
    {layout.labels.map((label, i) => <text key={i} x={label.x} y={label.y} style={{ fontSize: label.size }} textAnchor="middle" className="map-label atlas-label">{label.text}</text>)}
    {pop !== undefined && <g aria-label={`Population ${String(space.pop)}`} className="atlas-population">
      <rect x={pop[0]} y={pop[1]} width={pop[2]} height={pop[2]} />
      <text x={pop[0] + pop[2] / 2} y={pop[1] + pop[2] * .8} textAnchor="middle" fontSize={pop[3]}>{space.pop}</text>
    </g>}
    {controlBox !== undefined && <Counter x={controlBox[0]} y={controlBox[1]} width={controlBox[2]} height={controlBox[3]} label={faction === undefined ? "No Control" : `${faction.name} Control`} lines={layout.inlineCounters ? [faction === undefined ? "No Control" : `${faction.name} Control`] : faction === undefined ? ["NO", "CONTROL"] : [faction.name.toUpperCase(), "CONTROL"]} color={faction?.color ?? null} solid={faction !== undefined} />}
    {levelBox !== undefined && <Counter x={levelBox[0]} y={levelBox[1]} width={levelBox[2]} height={levelBox[3]} label={level ?? "Neutral"} lines={levelLines} color={level === null ? null : positive ? "#9b3431" : "#526c40"} solid={active} />}
    <Stack space={space} view={view} bounds={layout.stack} pitch={layout.stackPitch ?? 36} />
  </g>;
}

/** Normal stacks retain 17px counts. Dense stacks still fit, with full values in space detail. */
function Stack({ space, view, bounds, pitch }: { readonly space: SpaceView; readonly view: BoardView; readonly bounds: readonly [number, number, number, number]; readonly pitch: number }) {
  const [x, y, w, h] = bounds;
  const total = space.pieces.length + space.markers.length;
  const columns = Math.min(3, total);
  if (columns === 0) return null;
  const rows = Math.ceil(total / columns);
  const heights = Array.from({ length: rows }, (_, row) => Math.min(total, (row + 1) * columns) > space.pieces.length ? 34 : 22);
  const offsets = heights.map((_, row) => heights.slice(0, row).reduce((a, b) => a + b, 0));
  const width = columns * pitch + (space.pieces.some(p => p.count >= 10) ? 3 : 0);
  const height = heights.reduce((a, b) => a + b, 0);
  const scale = Math.min(1, w / width, h / height);
  return <g className="atlas-stack" transform={`translate(${String(x + (w - width * scale) / 2)} ${String(y + (h - height * scale) / 2)}) scale(${String(scale)})`}>
    {space.pieces.map((piece, i) => <PieceIcon key={`${piece.piece}-${piece.face}`} piece={piece} color={view.factions.find(f => f.id === piece.faction)?.color ?? "#444"} x={10 + (i % columns) * pitch} y={12 + (offsets[Math.floor(i / columns)] ?? 0)} />)}
    {space.markers.map((marker, i) => {
      const slot = space.pieces.length + i;
      return <MarkerChips key={`${marker.marker}-${marker.side}`} markers={[marker]} x={(slot % columns) * pitch + pitch / 2} y={(offsets[Math.floor(slot / columns)] ?? 0) + 12} />;
    })}
  </g>;
}

export function AtlasRibbon() {
  return <g data-ribbon="off-map" pointerEvents="none">
    <rect x={0} y={-ATLAS.ribbonHeight} width={ATLAS.width} height={ATLAS.ribbonHeight} fill="#eee4cd" />
    <text x={800} y={-36} className="ribbon-key">Fine brown: playable area</text>
    <text x={800} y={-20} className="ribbon-key">Slate dash-dot: country border</text>
  </g>;
}

/** One shared playable network; country frontiers remain a distinct decorative layer. */
export function AtlasGeography() {
  return <g pointerEvents="none" aria-hidden="true" clipPath="url(#clip-map)">
    <path d={ATLAS.borders} className="playable-boundaries" />
    <path d={ATLAS.lake} className="map-lake" data-geography="lake-van" />
    <path d={ATLAS.countryBorders} className="country-border-halo" />
    <path d={ATLAS.countryBorders} className="country-border" data-geography="country-borders" />
  </g>;
}
