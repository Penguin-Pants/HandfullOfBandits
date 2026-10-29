// Map markers (GMT COIN style): a square level marker for Support or Opposition, and round
// chips for space markers. Coercion plays the role of Terror in this design (it blocks shifts).
import type { SpaceView } from "../api.ts";

/** Short code and color per marker; unknown markers fall back to their first letters. */
const CHIP: Readonly<Record<string, { code: string; fill: string; name: string }>> = {
  coercion: { code: "C", fill: "#222", name: "Coercion (like Terror)" },
  stateHarm: { code: "SH", fill: "#8e1b1b", name: "State Harm" },
  pkkHarm: { code: "PH", fill: "#1b5e20", name: "PKK Harm" },
  disputedHarm: { code: "DH", fill: "#6d4c41", name: "Disputed Harm" },
  displacement: { code: "D", fill: "#5d4037", name: "Displacement" },
  reception: { code: "R", fill: "#1565c0", name: "Reception" },
  covert: { code: "?", fill: "#424242", name: "Covert (face down)" },
  office: { code: "O", fill: "#6a1b9a", name: "Office" },
  leadership: { code: "L", fill: "#00695c", name: "Leadership" },
};

export function chipOf(marker: string): { code: string; fill: string; name: string } {
  return CHIP[marker] ?? { code: marker.slice(0, 2).toUpperCase(), fill: "#555", name: marker };
}

const LEVEL: Readonly<Record<string, string>> = {
  activeSupport: "Active Support", passiveSupport: "Passive Support", passiveOpposition: "Passive Opposition", activeOpposition: "Active Opposition",
};

/** Level marker text, or null at Neutral or with no Support scale. */
export function levelLabel(space: SpaceView): string | null {
  return space.levelName === null ? null : (LEVEL[space.levelName] ?? null);
}

export function LevelMarker({ space, x, y }: { readonly space: SpaceView; readonly x: number; readonly y: number }) {
  const label = levelLabel(space);
  if (label === null || space.level === null) return null;
  const fill = space.level > 0 ? "var(--state)" : "var(--pkk)";
  const active = Math.abs(space.level) > 1;
  const w = label.length * 6 + 12;
  return (
    <g aria-label={label}>
      <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={2} fill={active ? fill : "var(--panel)"} stroke={fill} strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" className="level-marker" fill={active ? "#fff" : fill}>
        {label}
      </text>
    </g>
  );
}

export function MarkerChips({ markers, x, y }: { readonly markers: SpaceView["markers"]; readonly x: number; readonly y: number }) {
  const r = 9;
  const left = x - ((markers.length - 1) * (r * 2 + 6)) / 2;
  return (
    <>
      {markers.map((m, i) => {
        const chip = chipOf(m.hidden ? "covert" : m.marker);
        const cx = left + i * (r * 2 + 6);
        const side = m.side === "default" ? "" : ` ${m.side}`;
        return (
          <g key={`${m.marker}-${m.side}`} aria-label={`${chip.name}${side} ${String(m.count)}`}>
            <circle cx={cx} cy={y} r={r} fill={chip.fill} stroke="#fff" strokeWidth={1.5} strokeDasharray={m.side === "old" ? "3 2" : undefined} />
            <text x={cx} y={y + 3.5} textAnchor="middle" className="chip-code">
              {chip.code}
            </text>
            {m.side !== "default" && (
              <text x={cx} y={y + r + 9} textAnchor="middle" className="chip-side">
                {m.side}
              </text>
            )}
            {m.count > 1 && (
              <text x={cx + r} y={y - r + 2} className="chip-count">
                {m.count}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
