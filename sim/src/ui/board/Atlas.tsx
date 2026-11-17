// Geography, live information and artwork remain independent of rules data.
import type { BoardView, SpaceView } from "../api.ts";
import { ATLAS, type AtlasSpace } from "./atlas-data.ts";
import { chipOf, levelLabel } from "./markers.tsx";
import { PieceIcon, SPRITE } from "./PieceIcon.tsx";
import { blockTransform, presentation, spreadPlan, statusLayout, toBoard } from "./layout.ts";
import { inside } from "./region.ts";

/** Older packages retain their original schematic layout. */
export function atlasLayout(space: SpaceView): AtlasSpace | undefined {
  return ATLAS.spaces[space.id] ?? ATLAS.insets[space.id];
}

/** Name line pitch in SVG units: above the 22 px Georgia line box (about 25.3), so two-line names do not touch. */
const LABEL_LINE = 30;

export function AtlasInfo({ space, view, layout }: {readonly space: SpaceView; readonly view: BoardView; readonly layout: AtlasSpace}) {
  const p = presentation(space);
  const faction = view.factions.find(f => f.id === space.control);
  const level = levelLabel(space);
  const names = layout.labels.map(l => l.text);
  const [control, political, population] = statusLayout(space);
  const alignment = level ?? (space.level === null ? null : "Neutral");
  return <g data-callout={p.callout ? "true" : undefined} data-info={space.id} pointerEvents="none" transform={blockTransform(layout)}>
    {names.map((text,i) => <text key={text} x={p.x+p.width/2} y={p.y+20+i*LABEL_LINE} textAnchor="middle" className={text === "CITY" ? "atlas-subtitle" : "map-label atlas-label"}>{text}</text>)}
    {control !== undefined && political !== undefined && population !== undefined && <>
      <g className="atlas-counter" aria-label={faction === undefined ? "No Control" : `${faction.name} Control`}>
        <rect x={control.x+1.5} y={control.y+2} width={control.width} height={control.height} rx={3} className="counter-shadow" />
        <rect x={control.x} y={control.y} width={control.width} height={control.height} rx={3} fill={faction?.color ?? "#ede5d1"} className="counter-face" />
        <text x={control.x+control.width/2} y={control.y+16} textAnchor="middle" fill={faction === undefined ? "#453d2b" : "#fff"}>{faction?.name ?? "No control"}</text>
      </g>
      <g className="atlas-population" aria-label={`Population ${String(space.pop)}`}>
        <rect x={population.x+1.5} y={population.y+2} width={population.width} height={population.height} rx={2} className="counter-shadow" />
        <rect x={population.x} y={population.y} width={population.width} height={population.height} rx={2} />
        <text x={population.x+population.width/2} y={population.y+17} textAnchor="middle">{space.pop}</text>
      </g>
      <g className="atlas-political" aria-label={alignment ?? "No alignment scale"}>
        {level !== null && <title>{level} {Math.abs(space.level ?? 0)>1 ? "×2" : "×1"}</title>}
        {level !== null && <LevelCounter text={level.replace("Opposition","Opp.")} level={space.level ?? 0} x={political.x+political.width/2} y={political.y} />}
        <text x={political.x+political.width/2} y={political.y+16} textAnchor="middle" className={level === null ? "level-marker neutral" : "level-marker on-counter"} fill={level === null ? "#3d362a" : Math.abs(space.level ?? 0)>1 ? "#fff" : (space.level ?? 0)>0 ? "#7d1620" : "#1d4a2f"}>{alignment?.replace("Opposition","Opp.")}</text>
      </g>
    </>}
    {space.id === "iran" && <text x={p.x+p.width/2} y={p.y+44} textAnchor="middle" className="atlas-special">EVENTS ONLY</text>}
    <Stack space={space} view={view} layout={layout} />
  </g>;
}

/** Cardboard Support or Opposition counter behind the level text: solid when Active, pale when Passive. */
function LevelCounter({text, level, x, y}: {readonly text:string; readonly level:number; readonly x:number; readonly y:number}) {
  const width = text.length*7.4+14;
  const tint = level > 0 ? "#bd1f2c" : "#26734e";
  return <g aria-hidden="true">
    <rect x={x-width/2+1.5} y={y+2} width={width} height={21} rx={3} className="counter-shadow" />
    <rect x={x-width/2} y={y} width={width} height={21} rx={3} className="counter-face" fill={Math.abs(level) > 1 ? tint : level > 0 ? "#f4d9d3" : "#d6e6d2"} />
  </g>;
}

/** One cardboard marker chip with its count. */
function MarkerChip({marker:m, x, y, countX}: {readonly marker:SpaceView["markers"][number]; readonly x:number; readonly y:number; readonly countX:number}) {
  const chip = chipOf(m.hidden ? "covert" : m.marker);
  return <g aria-label={`${chip.name}${m.side === "default" ? "" : ` ${m.side}`} ${String(m.count)}`} transform={`translate(${String(x)} ${String(y)})`}>
    <rect x={-9} y={-8} width={20} height={20} rx={3} className="chip-shadow" /><rect x={-10} y={-10} width={20} height={20} rx={3} fill={chip.fill} className="chip-face" /><text y={4} textAnchor="middle" className="chip-code">{chip.code}</text><text x={countX} y={6} className="map-count">{m.count}</text><title>{`${chip.name} ${m.side} ${String(m.count)}`}</title>
  </g>;
}

/** Stack grid cell in map units: one sprite pile and its count. */
const CELL_W = 46;
const CELL_H = 33;

/** Fixed-size counted pieces. Dense contents keep an explicit inspection affordance. */
function Stack({space, view, layout}: {readonly space:SpaceView; readonly view:BoardView; readonly layout:AtlasSpace}) {
  const total = space.pieces.length+space.markers.length;
  if (total === 0) return null;
  const spread = spreadPlan(space, layout);
  if (spread !== null) return <g className="atlas-stack" data-stack="spread">
    {space.pieces.map((piece,i) => {
      const group = spread.groups[i];
      return group === undefined ? null : <g key={`${piece.piece}-${piece.face}`} aria-label={`${piece.piece} ${piece.face} ${String(piece.count)}`}>
        {group.at.map((at,n) => <PieceIcon key={n} piece={piece} color={view.factions.find(f=>f.id === piece.faction)?.color ?? "#444"} x={at.x} y={at.y} size={SPRITE} bare />)}
        {group.count !== null && <text x={group.count.x} y={group.count.y} className="map-count">{group.count.text}</text>}
      </g>;
    })}
    {space.markers.map((m,i) => {
      const group = spread.groups[space.pieces.length+i];
      const at = group?.at[0];
      return group === undefined || at === undefined ? null : <MarkerChip key={`${m.marker}-${m.side}`} marker={m} x={at.x} y={at.y} countX={(group.count?.x ?? at.x+14)-at.x} />;
    })}
  </g>;
  const columns = total === 4 ? 2 : Math.min(3,total);
  const [x,y,w] = layout.stack;
  const positions = Array.from({length:Math.min(total,6)},(_,i) => ({x:x+(w-columns*CELL_W)/2+15+(i%columns)*CELL_W,y:y+8+Math.floor(i/columns)*CELL_H}));
  const contained = (point:{x:number;y:number}): boolean => layout.rings.length === 0 || [[point.x-14,point.y-18],[point.x+29,point.y-18],[point.x-14,point.y+15],[point.x+29,point.y+15]].every(([px,py]) => layout.rings.filter(r=>inside(toBoard(layout,[px ?? 0,py ?? 0]),r)).length%2 === 1);
  const capacity = positions.findIndex(p=>!contained(p));
  const available = capacity < 0 ? positions.length : capacity;
  const shown = total > available ? Math.max(0,available-1) : available;
  const pieces = space.pieces.slice(0,shown);
  const markers = space.markers.slice(0,shown-pieces.length);
  return <g className="atlas-stack">
    {pieces.map((piece,i) => <PieceIcon key={`${piece.piece}-${piece.face}`} piece={piece} color={view.factions.find(f=>f.id === piece.faction)?.color ?? "#444"} x={positions[i]?.x ?? x} y={positions[i]?.y ?? y} size={SPRITE} />)}
    {markers.map((m,i) => {
      const at = positions[pieces.length+i] ?? {x,y};
      return <MarkerChip key={`${m.marker}-${m.side}`} marker={m} x={at.x} y={at.y} countX={16} />;
    })}
    {total > shown && <g className="atlas-overflow" aria-label={`${String(total-shown)} more force or marker groups; right-click, long press or focus the space to inspect`}><text x={positions[shown]?.x ?? x} y={(positions[shown]?.y ?? y)+6}>+{total-shown}</text><title>Right-click, long press or focus this space to inspect every piece type, face, marker and count.</title></g>}
  </g>;
}

/** Turkish provinces outside the playable area: the same terrain art, faded, with thin borders. */
export function AtlasContext() {
  const { mountain, plain, borders, labels } = ATLAS.outOfPlay;
  const layer = { x: 0, y: 0, width: ATLAS.width, height: ATLAS.height, preserveAspectRatio: "none", opacity: .32 };
  return <g pointerEvents="none" aria-hidden="true" data-geography="outside-play">
    <defs>
      <clipPath id="clip-oop-plain"><path d={plain} clipRule="evenodd" /></clipPath>
      <clipPath id="clip-oop-mountain"><path d={mountain} clipRule="evenodd" /></clipPath>
    </defs>
    <image href="/board-plains.webp" {...layer} clipPath="url(#clip-oop-plain)" />
    <image href="/board-highland.webp" {...layer} clipPath="url(#clip-oop-mountain)" />
    <path d={borders} className="oop-border" fill="none" />
    {labels.map((l, i) => <text key={i} x={l.x} y={l.y} textAnchor="middle" className="country-name oop-label">{l.text}</text>)}
  </g>;
}

export function AtlasGeography() {
  return <g pointerEvents="none" aria-hidden="true">
    <path d={ATLAS.lake} className="map-lake" data-geography="lake-van" />
    <path d={ATLAS.countryBorders} className="country-border-halo" />
    <path d={ATLAS.countryBorders} className="country-border" data-geography="country-borders" />
    {ATLAS.geoLabels.map(l => <text key={l.text} x={l.x} y={l.y} textAnchor="middle" className={l.kind === "lake" ? "lake-label" : "country-name"}>{l.text}</text>)}
  </g>;
}

/** The outline of a space. A hinterland has its city as a hole, drawn by the city: only the outer ring counts here. */
export function edgePath(area: AtlasSpace): string {
  return area.rings.length > 1 ? `${area.path.split("Z")[0] ?? ""}Z` : area.path;
}

/** City illustrations, drawn inside the city circle. */
export const CITY_ART: Readonly<Record<string, string>> = {
  "diyarbakir-city": "/diyarbakir-city.png",
  "van-city": "/van-city.webp",
  "batman-city": "/batman-city.webp",
};
