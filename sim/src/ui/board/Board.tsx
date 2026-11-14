// Approved atlas board with live counters, selection and drag planning.
// Older layouts and other packages retain the schematic fallback (DEC-60).
import { ATLAS } from "./atlas-data.ts";
import type { AtlasSpace } from "./atlas-data.ts";
import { atlasLayout, AtlasContext, AtlasGeography, AtlasInfo } from "./Atlas.tsx";
import { Terrain } from "./Terrain.tsx";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { BoardView, SpaceView } from "../api.ts";
import { chipOf, LevelMarker, MarkerChips } from "./markers.tsx";
import { PieceIcon } from "./PieceIcon.tsx";
import { counted, words } from "../common/names.ts";
import { isEuropeTrack, spaceOfTrack } from "../status/tracks.ts";
import { spreadPlan } from "./layout.ts";
import { isInset, MAP_H, MAP_W, MAP_X0, pathOf, regionCells, type Point } from "./region.ts";

const INSET_W = 116;
const INSET_H = 90;
const TOKEN = 30;

/** "2 Underground Guerrillas": count, face and piece in words. */
const pieceText = (p: SpaceView["pieces"][number]): string => {
  const text = counted(p.count, p.piece);
  return p.face === "default" ? text : text.replace(/^(\d+) /, `$1 ${words(p.face)} `);
};
const markerText = (m: SpaceView["markers"][number]): string => `${String(m.count)} ${m.hidden ? "Covert (face down)" : words(m.marker)}${m.side === "default" ? "" : ` (${words(m.side)})`}`;
const levelLine = (space: SpaceView): string => `Level: ${space.levelName === null ? "none" : words(space.levelName)} · Control: ${space.control === null ? "none" : words(space.control)}`;

const orNone = (value: string | null): string => value === null ? "None" : words(value);
/** A heading line and one bullet line for each item, or "Heading: None". */
const listLines = (heading: string, items: readonly string[]): string[] => items.length === 0 ? [`${heading}: None`] : [`${heading}:`, ...items.map((item) => `• ${item}`)];

/** Hover text: one item of data on each line, then the pointer actions. */
export function spaceTooltip(space: SpaceView): string {
  return [
    space.name,
    ...(space.kind === "domestic" ? [`Pop: ${String(space.pop)}`, ...(space.terrain === null ? [] : [`Terrain: ${words(space.terrain)}`])] : ["External box"]),
    `Level: ${orNone(space.levelName)}`,
    `Control: ${orNone(space.control)}`,
    ...listLines("Pieces", space.pieces.map(pieceText)),
    ...(space.markers.length === 0 ? [] : listLines("Markers", space.markers.map(markerText))),
    "",
    "Click: select",
    "Shift-click: add to selection",
    "Drag: move pieces to another space",
  ].join("\n");
}

export interface BoardProps {
  readonly onReveal?: (id:string) => void;
  readonly mode?: "full" | "forces" | "political" | "terrain";
  readonly eligible?: readonly string[] | null;
  readonly camera?: {readonly zoom: number; readonly x: number; readonly y: number};
  readonly onPan?: (dx: number, dy: number) => void;
  /** A wheel step: direction (1 in, -1 out) and the pointer offset from the view centre in map units. */
  readonly onZoom?: (dir: 1 | -1, at: { readonly x: number; readonly y: number }) => void;
  readonly view: BoardView;
  readonly selected: readonly string[];
  readonly onSelect: (spaceId: string, add: boolean) => void;
  /** Spaces the last action changed. */
  readonly changed?: readonly string[];
  /** A drag from one space to another (UC-5). */
  readonly onDrag?: (from: string, to: string) => void;
  /** Planned moves, drawn as arrows with their piece count. */
  readonly arrows?: readonly { readonly from: string; readonly to: string; readonly count: number }[];
}

export function levelColor(level: number | null): string {
  if (level === null || level === 0) return "var(--cell)";
  const tint = level > 0 ? "var(--state)" : "var(--pkk)";
  return `color-mix(in srgb, ${tint} ${String(Math.abs(level) * 13)}%, var(--cell))`;
}

function Tokens({ space, view, x, y }: { space: SpaceView; view: BoardView; x: number; y: number }) {
  const color = (faction: string | null): string => view.factions.find((f) => f.id === faction)?.color ?? "var(--line)";
  const control = view.factions.find((f) => f.id === space.control);
  const perRow = 3;
  const rows = Math.ceil(space.pieces.length / perRow);
  const top = y - (rows * 20) / 2;
  return (
    <g pointerEvents="none">
      <text x={x} y={top - 10} textAnchor="middle" className="map-label">
        {space.name}
        {control !== undefined && <tspan className="control-layer" fill={control.color}>{" ■"}</tspan>}
      </text>
      <g className="force-layer">{space.pieces.map((p, i) => {
        const inRow = Math.min(perRow, space.pieces.length - Math.floor(i / perRow) * perRow);
        const left = x - (inRow * TOKEN) / 2 + 8;
        return <PieceIcon key={`${p.piece}-${p.face}`} piece={p} color={color(p.faction)} x={left + (i % perRow) * TOKEN} y={top + 8 + Math.floor(i / perRow) * 20} />;
      })}</g>
      <g className="political-layer"><LevelMarker space={space} x={x} y={top - 36} /></g>
      <g className="force-layer">{space.markers.length > 0 && <MarkerChips markers={space.markers} x={x} y={top + rows * 20 + 12} />}</g>
    </g>
  );
}

function Space({ space, cell, atlas, selected, neighbor, changed, eligible, onSelect, onGrab }: { space: SpaceView; cell: Point[] | null; atlas: AtlasSpace | undefined; selected: boolean; neighbor: boolean; changed: boolean; eligible: boolean | null; onSelect: BoardProps["onSelect"]; onGrab: (id: string) => void }) {
  const outline = selected ? "var(--accent)" : changed ? "var(--changed)" : null;
  const box = cell === null ? { x: space.x - INSET_W / 2, y: space.y - INSET_H / 2 } : null;
  return (
    <g
      role="button"
      aria-label={atlas?.labels.map(l => l.text).join(" ") ?? space.name}
      aria-pressed={selected}
      tabIndex={0}
      className={`map-space${neighbor ? " neighbor" : ""}${selected ? " selected" : ""}${eligible === true ? " eligible" : eligible === false ? " ineligible" : ""}`}
      data-space={space.id}
      onPointerDown={(e) => { if (e.button === 0) onGrab(space.id); }}
      onClick={(e) => { onSelect(space.id, e.shiftKey); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(space.id, e.shiftKey); } }}
    >
      <title>{spaceTooltip(space)}{eligible === null ? "" : eligible ? "\n\nCandidate target.\nValidate the complete plan before you commit." : "\n\nNot a standalone target.\nInspect or validate a combined plan for details."}</title>
      {atlas !== undefined ? (
        <>
          <path d={atlas.path} fill="#fff6dd" fillOpacity={.1} fillRule="evenodd" className="atlas-area" />
          {atlas.circle !== undefined && <>
            <defs><clipPath id="clip-city"><circle cx={atlas.circle[0]} cy={atlas.circle[1]} r={atlas.circle[2]} /></clipPath></defs>
            <circle cx={atlas.circle[0]} cy={atlas.circle[1]} r={atlas.circle[2]} fill="#f2e9d6" />
            <image href="/diyarbakir-city.png" x={atlas.circle[0] - atlas.circle[2]} y={atlas.circle[1] - atlas.circle[2]} width={atlas.circle[2] * 2} height={atlas.circle[2] * 2} opacity={.3} clipPath="url(#clip-city)" pointerEvents="none" />
          </>}
          <path d={space.id === "diyarbakir-rural" ? (atlas.path.split("Z")[0] ?? "")+"Z" : atlas.path} className="atlas-edge" fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="round" pointerEvents="none" />
          <path d={space.id === "diyarbakir-rural" ? (atlas.path.split("Z")[0] ?? "")+"Z" : atlas.path} className="atlas-outline" fill="none" stroke={outline ?? "#f4ecd6"} strokeWidth={outline === null ? 2.2 : 4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeDasharray={changed && !selected ? "8 5" : undefined} pointerEvents="none" />
        </>
      ) : box === null ? (
        <>
          <path d={pathOf(cell ?? [])} fill={levelColor(space.level)} stroke="var(--cell-line)" strokeWidth={1.2} strokeDasharray="6 3" />
          {outline !== null && <path d={pathOf(cell ?? [])} fill="none" stroke={outline} strokeWidth={6} strokeDasharray={selected ? undefined : "8 5"} />}
        </>
      ) : (
        <rect x={box.x} y={box.y} width={INSET_W} height={INSET_H} rx={6} fill={levelColor(space.level)} stroke={outline ?? "var(--cell-line)"} strokeWidth={outline === null ? 1.5 : 5} />
      )}
    </g>
  );
}

type Pt = { readonly x: number; readonly y: number };

/** The pointer in map units; null where the browser has no screen matrix (tests). */
function toMap(svg: SVGSVGElement, e: ReactPointerEvent): Pt | null {
  let m: DOMMatrix | null;
  try {
    m = svg.getScreenCTM();
  } catch {
    return null;
  }
  if (m === null) return null;
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

/** The space under the pointer at release (touch keeps the pointer on the start space). */
function spaceAt(e: ReactPointerEvent): string | null {
  const hit = typeof document.elementFromPoint === "function" ? document.elementFromPoint(e.clientX, e.clientY) : null;
  const el = hit ?? (e.target instanceof Element ? e.target : null);
  return el?.closest("[data-space]")?.getAttribute("data-space") ?? null;
}

/** An arrow between two points, stopped short of the end so the head stays visible. */
function Arrow({ a, b, label, live = false }: { readonly a: Pt; readonly b: Pt; readonly label?: string; readonly live?: boolean }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cut = live ? 0 : Math.min(26, len / 3);
  const end = { x: b.x - (dx / len) * cut, y: b.y - (dy / len) * cut };
  return (
    <g className={live ? "map-arrow live" : "map-arrow"}>
      <line x1={a.x} y1={a.y} x2={end.x} y2={end.y} markerEnd="url(#arrow-head)" />
      {label !== undefined && (
        <text x={(a.x + end.x) / 2} y={(a.y + end.y) / 2 - 6} textAnchor="middle" className="map-arrow-count">
          {label}
        </text>
      )}
    </g>
  );
}

function BoxTrack({ track, space, geographic }: {readonly geographic: boolean; readonly track: BoardView["status"]["tracks"][number]; readonly space: SpaceView }) {
  const numeric = track.steps === undefined;
  const layout = geographic ? atlasLayout(space) : undefined;
  const groups = space.pieces.length + space.markers.length;
  const columns = groups === 4 ? 2 : Math.min(3,Math.max(1,groups));
  const at = layout === undefined ? {x:space.x,y:space.y+(isInset(space) ? 20 : 48)} : {x:layout.info[0]+layout.info[2]/2,y:layout.info[1]+52+(groups > 0 ? (spreadPlan(space, layout)?.rows ?? Math.ceil(Math.min(groups,6)/columns))*33+17 : 5)};
  const width = layout === undefined ? 116 : layout.info[2]-6;
  const label = numeric ? `${track.display}: ${String(track.value)}` : `${track.display.replace(" posture", "")}: ${words(String(track.value))}`;
  return <g role="group" aria-label={`${track.display} track`} data-track-space={space.id} className="box-track" pointerEvents="none">
    <title>{`${track.display}: ${words(String(track.value))}. ${track.steps?.map(words).join(" → ") ?? ""}`}</title>
    <rect x={at.x-width/2} y={at.y-14} width={width} height={21} rx={4} />
    <text x={at.x} y={at.y} textAnchor="middle" aria-current="true">{label}</text>
  </g>;
}

/** A read-only scale in the left margin. It has no space hit area or move handlers. */
function EuropeTrack({ track, onReveal }: { readonly track: BoardView["status"]["tracks"][number]; readonly onReveal: BoardProps["onReveal"] }) {
  const { min, max, value } = track;
  if (min === undefined || max === undefined || typeof value !== "number") return null;
  const x = 44;
  const at = (n: number): number => 390 + (max - n) * 36;
  return <g className="europe-track" role="meter" tabIndex={0} aria-label={`${track.display} track`} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${String(value)} of ${String(max)}`} onFocus={() => onReveal?.(track.id)}>
    <title>{`${track.display}: ${String(value)}. Range ${String(min)} to ${String(max)}.`}</title>
    <g aria-hidden="true">
      <text x={64} y={330} textAnchor="middle" className="map-label atlas-label">{track.display}</text>
      <text x={64} y={354} textAnchor="middle" className="europe-track-label">TRACK</text>
      <line x1={x} x2={x} y1={at(max)} y2={at(min)} />
      {Array.from({length:max-min+1}, (_,i) => max-i).map(n => <g key={n} data-track-value={n} aria-current={n === value ? "true" : undefined}>
        <circle cx={x} cy={at(n)} r={n === value ? 18 : 16} />
        <text x={x} y={at(n)+7} textAnchor="middle" className="europe-track-number">{n}</text>
      </g>)}
      <text x={70} y={at(value)+5} className="europe-track-current">Current</text>
    </g>
  </g>;
}

export function Board({ view, selected, onSelect, changed = [], onDrag, arrows = [], mode = "full", eligible = null, camera = {zoom:1,x:0,y:0}, onPan, onZoom, onReveal }: BoardProps) {
  const cells = regionCells(view.spaces);
  const spaces = view.spaces.filter(s => !isEuropeTrack(s));
  const europe = view.spaces.find(isEuropeTrack);
  const pointerActive = useRef(false);
  const skipClick = useRef(false);
  const [panning, setPanning] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const lastPointer = useRef<Pt | null>(null);
  const base = cells.geographic ? {x:0,y:0,w:ATLAS.width,h:ATLAS.height} : {x:0,y:0,w:MAP_W,h:MAP_H};
  const bw = base.w / camera.zoom;
  const bh = base.h / camera.zoom;

  const [grab, setGrab] = useState<{ from: string; at: Pt | null } | null>(null);
  const centre = (id: string): Pt | null => {
    const s = view.spaces.find((x) => x.id === id);
    const layout = cells.geographic && s !== undefined ? atlasLayout(s) : undefined;
    return s === undefined ? null : layout === undefined ? { x: s.x, y: s.y } : { x: layout.stack[0] + layout.stack[2] / 2, y: layout.stack[1] + layout.stack[3] / 2 };
  };
  // A release outside the map ends the drag without a move.
  useEffect(() => {
    if (grab === null) return;
    const end = (): void => { pointerActive.current = false; setGrab(null); };
    window.addEventListener("pointerup", end);
    return () => { window.removeEventListener("pointerup", end); };
  }, [grab !== null]);
  // Screen pixels per map unit. The view keeps its aspect ratio, so the smaller side sets the scale.
  const pixelsPerUnit = (svg: SVGSVGElement): number => {
    const r = svg.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? Math.min(r.width / bw, r.height / bh) : 1;
  };
  // The wheel listener is not passive, so the page never scrolls over the board.
  const wheel = useRef<(e: WheelEvent) => void>(() => undefined);
  wheel.current = (e) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (svg === null || e.deltaY === 0) return;
    const r = svg.getBoundingClientRect();
    const s = pixelsPerUnit(svg);
    onZoom?.(e.deltaY < 0 ? 1 : -1, { x: (e.clientX - r.left - r.width / 2) / s, y: (e.clientY - r.top - r.height / 2) / s });
  };
  useEffect(() => {
    const svg = svgRef.current;
    if (svg === null) return;
    const on = (e: WheelEvent): void => { wheel.current(e); };
    svg.addEventListener("wheel", on, { passive: false });
    return () => { svg.removeEventListener("wheel", on); };
  }, []);
  const from = grab === null ? null : centre(grab.from);
  return (
    <svg
      ref={svgRef}
      viewBox={`${String(base.x + (base.w - bw) / 2 + camera.x)} ${String(base.y + (base.h - bh) / 2 + camera.y)} ${String(bw)} ${String(bh)}`}
      tabIndex={0}
      onFocusCapture={(e) => {const id = e.target instanceof Element ? e.target.closest("[data-space]")?.getAttribute("data-space") : null; if (!pointerActive.current && id !== null && id !== undefined) onReveal?.(id);}}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        const delta: Record<string, readonly [number,number]> = {ArrowLeft:[-30,0],ArrowRight:[30,0],ArrowUp:[0,-30],ArrowDown:[0,30]};
        const d = delta[e.key];
        if (d !== undefined) { e.preventDefault(); onPan?.(d[0] / camera.zoom, d[1] / camera.zoom); }
      }}
      onPointerDownCapture={(e) => {
        pointerActive.current = true;
        // Alt-drag, middle-button drag or a primary drag that starts off every space pans the map.
        const onSpace = e.target instanceof Element && e.target.closest("[data-space]") !== null;
        if (onPan === undefined || !(e.altKey || e.button === 1 || (e.button === 0 && !onSpace))) return;
        if (e.altKey || e.button === 1) { e.preventDefault(); e.stopPropagation(); }
        setPanning(true); skipClick.current = true; lastPointer.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      role="img"
      aria-label="Board"
      className={`map mode-${mode}${grab === null ? "" : " dragging"}`}
      onPointerMove={(e) => { if (panning) { const last = lastPointer.current; lastPointer.current = { x: e.clientX, y: e.clientY }; if (last !== null) { const scale = pixelsPerUnit(e.currentTarget); onPan?.((last.x - e.clientX) / scale, (last.y - e.clientY) / scale); } return; } if (grab !== null) setGrab({ ...grab, at: toMap(e.currentTarget, e) }); }}
      onClickCapture={(e) => {if (skipClick.current) {e.preventDefault(); e.stopPropagation(); skipClick.current = false;}}}
      onPointerCancel={() => {skipClick.current = false; pointerActive.current = false; setPanning(false); setGrab(null);}}
      onPointerUp={(e) => {
        pointerActive.current = false;
        if (panning) { setPanning(false); e.currentTarget.releasePointerCapture(e.pointerId); window.setTimeout(() => {skipClick.current = false;},0); return; }
        if (grab === null) return;
        const to = spaceAt(e);
        setGrab(null);
        if (to !== null && to !== grab.from) onDrag?.(grab.from, to);
      }}
    >
      <defs>
        <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" className="map-arrow-head" />
        </marker>
      </defs>
      <Terrain view={view} cells={cells} />
      <rect x={0} y={0} width={MAP_X0 - 1} height={cells.geographic ? ATLAS.height : MAP_H} className="map-inset" />
      {cells.geographic && <AtlasContext />}
      {spaces.map((s) => (
        <Space
          key={s.id}
          space={s}
          cell={isInset(s) ? null : (cells.domestic.get(s.id) ?? cells.external.get(s.id) ?? null)}
          atlas={cells.geographic ? atlasLayout(s) : undefined}
          eligible={eligible === null ? null : eligible.includes(s.id)}
          selected={selected.includes(s.id)}
          neighbor={view.links.some(l => l.a === s.id && selected.includes(l.b) || l.b === s.id && selected.includes(l.a))}
          changed={changed.includes(s.id)}
          onSelect={onSelect}
          onGrab={(id) => { if (onDrag !== undefined) setGrab({ from: id, at: null }); }}
        />
      ))}
      {cells.geographic && <AtlasGeography />}
      {/* The selected border is drawn again above all area and country borders, so no neighbor covers it. */}
      {cells.geographic && spaces.filter(sp => selected.includes(sp.id)).map(sp => {
        const area = atlasLayout(sp);
        const d = area === undefined ? null : sp.id === "diyarbakir-rural" ? `${area.path.split("Z")[0] ?? ""}Z` : area.path;
        return d === null ? null : <g key={sp.id} className="atlas-selected" data-of={sp.id} pointerEvents="none" fill="none" strokeLinejoin="round">
          <path d={d} className="casing" vectorEffect="non-scaling-stroke" /><path d={d} className="ring" vectorEffect="non-scaling-stroke" />
        </g>;
      })}
      {spaces.map((s) => {
        const layout = cells.geographic ? atlasLayout(s) : undefined;
        return layout === undefined ? <Tokens key={s.id} space={s} view={view} x={s.x} y={s.y + 6} /> : <AtlasInfo key={s.id} space={s} view={view} layout={layout} />;
      })}
      {europe !== undefined && view.status.tracks.filter(t => t.id === europe.id).map(t => <EuropeTrack key={t.id} track={t} onReveal={onReveal} />)}
      {mode !== "terrain" && view.status.tracks.map((t) => {
        const at = spaceOfTrack(t.id, view.spaces);
        return at === undefined || isEuropeTrack(at) ? null : <BoxTrack geographic={cells.geographic} key={t.id} track={t} space={at} />;
      })}
      <g pointerEvents="none" aria-label="Planned moves">
        {arrows.map((m, i) => {
          const a = centre(m.from);
          const b = centre(m.to);
          return a === null || b === null ? null : <Arrow key={`${m.from}-${m.to}-${String(i)}`} a={a} b={b} label={String(m.count)} />;
        })}
        {from !== null && grab?.at != null && <Arrow a={from} b={grab.at} live />}
      </g>
    </svg>
  );
}

/** Key to the board symbols. */
export function Legend({ view }: { readonly view: BoardView }) {
  const seen = new Map<string, SpaceView["pieces"][number]>();
  for (const s of view.spaces) for (const p of s.pieces) if (!seen.has(`${p.piece}-${p.face}`)) seen.set(`${p.piece}-${p.face}`, p);
  const color = (faction: string): string => view.factions.find((f) => f.id === faction)?.color ?? "var(--line)";
  return (
    <div className="legend" aria-label="Legend">
      {[...seen.values()].map((p) => (
        <span key={`${p.piece}-${p.face}`} className="legend-item">
          <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
            <PieceIcon piece={{ ...p, count: 0 }} color={color(p.faction)} x={9} y={9} bare />
          </svg>
          {p.piece}
          {p.face === "default" ? "" : ` (${p.face})`}
        </span>
      ))}
      {view.factions.map((f) => (
        <span key={f.id} className="legend-item">
          <span style={{ color: f.color }}>■</span> {f.name} Control
        </span>
      ))}
      <span className="legend-item">
        <span className="swatch" style={{ background: levelColor(2) }} /> Support
      </span>
      <span className="legend-item">
        <span className="swatch" style={{ background: levelColor(-2) }} /> Opposition
      </span>
      {[...new Set(view.spaces.flatMap((s) => s.markers.map((m) => (m.hidden ? "covert" : m.marker))))].map((id) => {
        const chip = chipOf(id);
        return (
          <span key={id} className="legend-item">
            <span className="swatch" style={{ background: chip.fill, borderRadius: "50%", color: "#fff", fontSize: 9, textAlign: "center", lineHeight: "14px" }}>{chip.code}</span> {chip.name}
          </span>
        );
      })}
      <span className="legend-item">None: no faction control. Neutral: no alignment. Opp.: Opposition. Active ×2; Passive ×1.</span>
      <span className="legend-item">Slate dash-dot: country border. Fine brown: playable area. Hatched grey: outside play. Dashed teal: rules connection to the selected space. Borders alone do not allow movement.</span>
      <span className="legend-item">
        <span className="swatch" style={{ border: "3px dashed var(--changed)" }} /> Changed by last action
      </span>
    </div>
  );
}

/** Detail card for the selected space (08 s3.1 item 4). */
export function SpaceDetail({ space, tracks = [] }: { readonly space: SpaceView; readonly tracks?: BoardView["status"]["tracks"] }) {
  return (
    <section className="panel" aria-label={`${space.name} detail`}>
      <h3>{space.name}</h3>
      <div className="muted">
        {space.kind} {space.terrain ?? ""} · Pop {space.pop}
      </div>
      <div>{levelLine(space)}</div>
      <ul>
        {space.pieces.map((p) => <li key={`${p.piece}-${p.face}`}>{pieceText(p)}</li>)}
        {space.markers.map((m) => <li key={`${m.marker}-${m.side}`}>{markerText(m)}</li>)}
      </ul>
      {tracks.filter(t => spaceOfTrack(t.id,[space]) !== undefined).map(t => <p key={t.id}><strong>{t.display}: {words(String(t.value))}</strong> · {t.steps?.map(words).join(" → ") ?? `${String(t.min)} to ${String(t.max)}`}</p>)}
      {space.tags.length > 0 && <div className="muted">Tags: {space.tags.map(words).join(", ")}</div>}
      {space.confidence !== null && <div className="muted">Confidence: {space.confidence}</div>}
    </section>
  );
}
