// Schematic board (08 s3.1): nodes at map.yaml layout, links as edges, level band, Control ring,
// piece counts and marker chips. Click selects; Shift-click adds to the selection.
import type { BoardView, SpaceView } from "../api.ts";
import { PieceIcon } from "./PieceIcon.tsx";

const NODE_W = 120;
const NODE_H = 64;

export interface BoardProps {
  readonly view: BoardView;
  readonly selected: readonly string[];
  readonly onSelect: (spaceId: string, add: boolean) => void;
}

function levelColor(level: number | null): string {
  if (level === null || level === 0) return "var(--panel)";
  return level > 0 ? `color-mix(in srgb, var(--state) ${String(level * 15)}%, var(--panel))` : `color-mix(in srgb, var(--pkk) ${String(-level * 15)}%, var(--panel))`;
}

function Node({ space, view, selected, onSelect }: { space: SpaceView; view: BoardView; selected: boolean; onSelect: BoardProps["onSelect"] }) {
  const color = (faction: string | null): string => view.factions.find((f) => f.id === faction)?.color ?? "var(--line)";
  const x = space.x - NODE_W / 2;
  const y = space.y - NODE_H / 2;
  return (
    <g
      role="button"
      aria-label={space.name}
      aria-pressed={selected}
      tabIndex={0}
      onClick={(e) => { onSelect(space.id, e.shiftKey); }}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect(space.id, e.shiftKey); }}
    >
      <title>{`${space.name}: ${space.pieces.map((p) => `${String(p.count)} ${p.piece} ${p.face}`).join(", ") || "empty"}`}</title>
      <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={6} fill={levelColor(space.level)} stroke={space.control === null ? "var(--line)" : color(space.control)} strokeWidth={selected ? 5 : space.control === null ? 1 : 3} />
      <text x={x + 4} y={y + 12} fontSize={11} fontWeight={600}>
        {space.name}
      </text>
      <text x={x + NODE_W - 4} y={y + 12} fontSize={9} textAnchor="end">
        {space.kind === "domestic" ? `${space.terrain?.[0]?.toUpperCase() ?? ""}${String(space.pop)}` : "box"}
      </text>
      {space.pieces.map((p, i) => (
        <PieceIcon key={`${p.piece}-${p.face}`} piece={p} color={color(p.faction)} x={x + 10 + (i % 4) * 28} y={y + 28 + Math.floor(i / 4) * 18} />
      ))}
      {space.markers.length > 0 && (
        <text x={x + 4} y={y + NODE_H - 4} fontSize={9}>
          {space.markers.map((m) => `${m.hidden ? "Covert (face down)" : m.marker}${m.side === "default" ? "" : ` ${m.side}`}×${String(m.count)}`).join(" ")}
        </text>
      )}
    </g>
  );
}

export function Board({ view, selected, onSelect }: BoardProps) {
  const at = new Map(view.spaces.map((s) => [s.id, s]));
  return (
    <svg viewBox="0 0 1000 700" role="img" aria-label="Board" style={{ width: "100%", maxHeight: "70vh" }}>
      {view.links.map((l) => {
        const a = at.get(l.a);
        const b = at.get(l.b);
        if (a === undefined || b === undefined) return null;
        return <line key={`${l.a}-${l.b}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line)" strokeDasharray={l.kind === "external" ? "6 4" : undefined} />;
      })}
      {view.spaces.map((s) => (
        <Node key={s.id} space={s} view={view} selected={selected.includes(s.id)} onSelect={onSelect} />
      ))}
    </svg>
  );
}

/** Detail card for the selected space (08 s3.1 item 4). */
export function SpaceDetail({ space }: { readonly space: SpaceView }) {
  return (
    <section className="panel" aria-label={`${space.name} detail`}>
      <strong>{space.name}</strong> <span className="muted">{space.kind} {space.terrain ?? ""} Pop {space.pop}</span>
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
