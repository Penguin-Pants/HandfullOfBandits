// Regional board (08 s3.1): approximate map of the region (region.ts). Cell fill shows the
// Support level, the badge shows Control, tokens show pieces with counts. Spaces the last action
// changed get an amber outline. Click selects; Shift-click adds to the selection. A drag from one
// space to another plans a move (UC-5); planned moves show as arrows.
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { BoardView, SpaceView } from "../api.ts";
import { chipOf, LevelMarker, MarkerChips } from "./markers.tsx";
import { PieceIcon } from "./PieceIcon.tsx";
import { isInset, MAP_H, MAP_W, MAP_X0, pathOf, regionCells, TURKEY, type Point } from "./region.ts";

const INSET_W = 116;
const INSET_H = 90;
const TOKEN = 30;

/** Hover text: name, Pop and terrain, level, Control, pieces and markers, one per line. */
export function spaceTooltip(space: SpaceView): string {
  const face = (f: string): string => (f === "default" ? "" : ` (${f})`);
  return [
    `${space.name} · ${space.kind === "domestic" ? `Pop ${String(space.pop)}${space.terrain === null ? "" : ` · ${space.terrain}`}` : "external box"}`,
    `Level: ${space.levelName ?? "none"} · Control: ${space.control ?? "none"}`,
    `Pieces: ${space.pieces.map((p) => `${String(p.count)} ${p.piece}${face(p.face)}`).join(", ") || "none"}`,
    ...(space.markers.length === 0 ? [] : [`Markers: ${space.markers.map((m) => `${String(m.count)} ${m.hidden ? "covert" : m.marker}${face(m.side)}`).join(", ")}`]),
    "Click to select · Shift-click to add · Drag to another space to move pieces",
  ].join("\n");
}

export interface BoardProps {
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
  return `color-mix(in srgb, ${tint} ${String(Math.abs(level) * 22)}%, var(--cell))`;
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
        {control !== undefined && <tspan fill={control.color}>{" ■"}</tspan>}
      </text>
      {space.pieces.map((p, i) => {
        const inRow = Math.min(perRow, space.pieces.length - Math.floor(i / perRow) * perRow);
        const left = x - (inRow * TOKEN) / 2 + 8;
        return <PieceIcon key={`${p.piece}-${p.face}`} piece={p} color={color(p.faction)} x={left + (i % perRow) * TOKEN} y={top + 8 + Math.floor(i / perRow) * 20} />;
      })}
      <LevelMarker space={space} x={x} y={top - 36} />
      {space.markers.length > 0 && <MarkerChips markers={space.markers} x={x} y={top + rows * 20 + 12} />}
    </g>
  );
}

function Space({ space, cell, clip, selected, changed, onSelect, onGrab }: { space: SpaceView; cell: Point[] | null; clip: string | undefined; selected: boolean; changed: boolean; onSelect: BoardProps["onSelect"]; onGrab: (id: string) => void }) {
  const outline = selected ? "var(--accent)" : changed ? "var(--changed)" : null;
  const box = cell === null ? { x: space.x - INSET_W / 2, y: space.y - INSET_H / 2 } : null;
  return (
    <g
      role="button"
      aria-label={space.name}
      aria-pressed={selected}
      tabIndex={0}
      className="map-space"
      data-space={space.id}
      onPointerDown={(e) => { if (e.button === 0) onGrab(space.id); }}
      onClick={(e) => { onSelect(space.id, e.shiftKey); }}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(space.id, e.shiftKey); }}
    >
      <title>{spaceTooltip(space)}</title>
      {box === null ? (
        <>
          <path d={pathOf(cell ?? [])} clipPath={clip} fill={space.kind === "domestic" ? levelColor(space.level) : "var(--abroad)"} stroke="var(--cell-line)" strokeWidth={1.5} />
          {outline !== null && <path d={pathOf(cell ?? [])} clipPath={clip} fill="none" stroke={outline} strokeWidth={6} strokeDasharray={selected ? undefined : "8 5"} />}
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

export function Board({ view, selected, onSelect, changed = [], onDrag, arrows = [] }: BoardProps) {
  const cells = regionCells(view.spaces);
  const turkey = pathOf(TURKEY);
  const [grab, setGrab] = useState<{ from: string; at: Pt | null } | null>(null);
  const centre = (id: string): Pt | null => {
    const s = view.spaces.find((x) => x.id === id);
    return s === undefined ? null : { x: s.x, y: s.y };
  };
  // A release outside the map ends the drag without a move.
  useEffect(() => {
    if (grab === null) return;
    const end = (): void => { setGrab(null); };
    window.addEventListener("pointerup", end);
    return () => { window.removeEventListener("pointerup", end); };
  }, [grab !== null]);
  const from = grab === null ? null : centre(grab.from);
  return (
    <svg
      viewBox={`0 0 ${String(MAP_W)} ${String(MAP_H)}`}
      role="img"
      aria-label="Board"
      className={grab === null ? "map" : "map dragging"}
      onPointerMove={(e) => { if (grab !== null) setGrab({ ...grab, at: toMap(e.currentTarget, e) }); }}
      onPointerUp={(e) => {
        if (grab === null) return;
        const to = spaceAt(e);
        setGrab(null);
        if (to !== null && to !== grab.from) onDrag?.(grab.from, to);
      }}
    >
      <defs>
        <clipPath id="clip-turkey">
          <path d={turkey} />
        </clipPath>
        <clipPath id="clip-abroad">
          <path d={`M${String(MAP_X0)},0H${String(MAP_W)}V${String(MAP_H)}H${String(MAP_X0)}Z${turkey}`} clipRule="evenodd" />
        </clipPath>
        <marker id="arrow-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0L10,5L0,10Z" className="map-arrow-head" />
        </marker>
      </defs>
      <rect x={0} y={0} width={MAP_X0 - 10} height={MAP_H} fill="var(--inset)" />
      <text x={(MAP_X0 - 10) / 2} y={20} textAnchor="middle" className="map-marker">
        Off map
      </text>
      {view.spaces.map((s) => (
        <Space
          key={s.id}
          space={s}
          cell={isInset(s) ? null : (cells.domestic.get(s.id) ?? cells.external.get(s.id) ?? null)}
          clip={isInset(s) || !cells.geographic ? undefined : s.kind === "domestic" ? "url(#clip-turkey)" : "url(#clip-abroad)"}
          selected={selected.includes(s.id)}
          changed={changed.includes(s.id)}
          onSelect={onSelect}
          onGrab={(id) => { if (onDrag !== undefined) setGrab({ from: id, at: null }); }}
        />
      ))}
      {cells.geographic && <path d={turkey} fill="none" stroke="var(--border)" strokeWidth={2.5} pointerEvents="none" />}
      {view.spaces.map((s) => (
        <Tokens key={s.id} space={s} view={view} x={s.x} y={s.y + 6} />
      ))}
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
      <span className="legend-item">
        <span className="swatch" style={{ border: "3px dashed var(--changed)" }} /> Changed by last action
      </span>
    </div>
  );
}

/** Detail card for the selected space (08 s3.1 item 4). */
export function SpaceDetail({ space }: { readonly space: SpaceView }) {
  return (
    <section className="panel" aria-label={`${space.name} detail`}>
      <h3>{space.name}</h3>
      <div className="muted">
        {space.kind} {space.terrain ?? ""} · Pop {space.pop}
      </div>
      <div>Level: {space.levelName ?? "none"} · Control: {space.control ?? "none"}</div>
      <ul>
        {space.pieces.map((p) => (
          <li key={`${p.piece}-${p.face}`}>
            {p.count} {p.piece} {p.face === "default" ? "" : p.face}
          </li>
        ))}
        {space.markers.map((m) => (
          <li key={`${m.marker}-${m.side}`}>
            {m.count} {m.hidden ? "Covert (face down)" : m.marker} {m.side === "default" ? "" : m.side}
          </li>
        ))}
      </ul>
      {space.tags.length > 0 && <div className="muted">Tags: {space.tags.join(", ")}</div>}
      {space.confidence !== null && <div className="muted">Confidence: {space.confidence}</div>}
    </section>
  );
}
