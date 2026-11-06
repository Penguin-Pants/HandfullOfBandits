// Geography, live information and artwork remain independent of rules data.
import type { BoardView, SpaceView } from "../api.ts";
import { ATLAS, type AtlasSpace } from "./atlas-data.ts";
import { chipOf, levelLabel } from "./markers.tsx";
import { PieceIcon } from "./PieceIcon.tsx";
import { presentation, statusLayout } from "./layout.ts";
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
  const names = space.id === "diyarbakir-rural" ? ["Diyarbakir", "hinterland"] : space.id === "diyarbakir-city" ? ["Diyarbakir","CITY"] : space.id === "western-cities" ? ["Western","Cities"] : [space.name];
  const [control, political, population] = statusLayout(space);
  const alignment = level ?? (space.level === null ? null : "Neutral");
  return <g data-callout={p.callout ? "true" : undefined} data-info={space.id} pointerEvents="none">
    {names.map((text,i) => <text key={text} x={p.x+p.width/2} y={p.y+(space.id === "elazig" ? 26 : 20)+i*LABEL_LINE} textAnchor="middle" className={text === "CITY" ? "atlas-subtitle" : "map-label atlas-label"}>{text}</text>)}
    {control !== undefined && political !== undefined && population !== undefined && <>
      <g className="atlas-counter" aria-label={faction === undefined ? "No Control" : `${faction.name} Control`}>
        <rect x={control.x} y={control.y} width={control.width} height={control.height} rx={3} fill={faction?.color ?? "#ede5d1"} />
        <text x={control.x+control.width/2} y={control.y+16} textAnchor="middle" fill={faction === undefined ? "#453d2b" : "#fff"}>{faction?.name ?? "No control"}</text>
      </g>
      <g className="atlas-population" aria-label={`Population ${String(space.pop)}`}>
        <rect x={population.x} y={population.y} width={population.width} height={population.height} rx={2} />
        <text x={population.x+population.width/2} y={population.y+17} textAnchor="middle">{space.pop}</text>
      </g>
      <g className="atlas-political" aria-label={alignment ?? "No alignment scale"}>
        {level !== null && <title>{level} {Math.abs(space.level ?? 0)>1 ? "×2" : "×1"}</title>}
        <text x={political.x+political.width/2} y={political.y+16} textAnchor="middle" className="level-marker" fill={(space.level ?? 0)>0 ? "#7d2525" : (space.level ?? 0)<0 ? "#28532b" : "#514735"}>{alignment?.replace("Opposition","Opp.")}</text>
      </g>
    </>}
    {space.id === "iran" && <text x={p.x+p.width/2} y={p.y+44} textAnchor="middle" className="atlas-special">EVENTS ONLY</text>}
    {space.id === "europe" && <text x={p.x+p.width/2} y={p.y+44} textAnchor="middle" className="atlas-special">TRACK ONLY</text>}
    <Stack space={space} view={view} layout={layout} />
  </g>;
}

/** Fixed-size counted pieces. Dense contents keep an explicit inspection affordance. */
function Stack({space, view, layout}: {readonly space:SpaceView; readonly view:BoardView; readonly layout:AtlasSpace}) {
  const total = space.pieces.length+space.markers.length;
  if (total === 0) return null;
  const columns = total === 4 ? 2 : Math.min(3,total);
  const [x,y,w] = layout.stack;
  const positions = Array.from({length:Math.min(total,6)},(_,i) => ({x:x+(w-columns*40)/2+10+(i%columns)*40,y:y+Math.floor(i/columns)*29}));
  const contained = (point:{x:number;y:number}): boolean => layout.rings.length === 0 || [[point.x-11,point.y-11],[point.x+27,point.y-11],[point.x-11,point.y+13],[point.x+27,point.y+13]].every(([px,py]) => layout.rings.filter(r=>inside([px ?? 0,py ?? 0],r)).length%2 === 1);
  const capacity = positions.findIndex(p=>!contained(p));
  const available = capacity < 0 ? positions.length : capacity;
  const shown = total > available ? Math.max(0,available-1) : available;
  const pieces = space.pieces.slice(0,shown);
  const markers = space.markers.slice(0,shown-pieces.length);
  return <g className="atlas-stack">
    {pieces.map((piece,i) => <PieceIcon key={`${piece.piece}-${piece.face}`} piece={piece} color={view.factions.find(f=>f.id === piece.faction)?.color ?? "#444"} x={positions[i]?.x ?? x} y={positions[i]?.y ?? y} />)}
    {markers.map((m,i) => {
      const at = positions[pieces.length+i] ?? {x,y};
      const chip = chipOf(m.hidden ? "covert" : m.marker);
      return <g key={`${m.marker}-${m.side}`} aria-label={`${chip.name}${m.side === "default" ? "" : ` ${m.side}`} ${String(m.count)}`} transform={`translate(${String(at.x)} ${String(at.y)})`}>
        <circle r={10} fill={chip.fill} /><text y={4} textAnchor="middle" className="chip-code">{chip.code}</text><text x={14} y={6} className="map-count">{m.count}</text><title>{`${chip.name} ${m.side} ${String(m.count)}`}</title>
      </g>;
    })}
    {total > shown && <g className="atlas-overflow" aria-label={`${String(total-shown)} more force or marker groups; select to inspect`}><text x={positions[shown]?.x ?? x} y={(positions[shown]?.y ?? y)+6}>+{total-shown}</text><title>Select this space to inspect every piece type, face, marker and count.</title></g>}
  </g>;
}

export function AtlasContext() {
  return <g pointerEvents="none" aria-hidden="true" data-geography="outside-play">
    <defs><pattern id="context-hatch" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width={9} height={9} fill="#d9ddd3" /><path d="M0,0V9" stroke="#a5afa0" opacity={.55} /></pattern></defs>
    <path d={ATLAS.context} fill="url(#context-hatch)" stroke="#9ca594" />
    <text x={240} y={371} textAnchor="middle" className="context-name">Malatya</text><text x={240} y={390} textAnchor="middle" className="context-note">OUTSIDE PLAY</text>
  </g>;
}

export function AtlasGeography() {
  return <g pointerEvents="none" aria-hidden="true">
    <path d={ATLAS.lake} className="map-lake" data-geography="lake-van" />
    <text x={940} y={380} textAnchor="middle" className="lake-label">Lake Van</text>
    <path d={ATLAS.countryBorders} className="country-border-halo" />
    <path d={ATLAS.countryBorders} className="country-border" data-geography="country-borders" />
    <text x={790} y={46} textAnchor="middle" className="country-name">T U R K E Y</text>
    <text x={300} y={890} textAnchor="middle" className="country-name">S Y R I A</text>
    <text x={930} y={923} textAnchor="middle" className="country-name">I R A Q</text>
  </g>;
}
