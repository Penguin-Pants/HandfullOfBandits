// Presentation bounds only. No rules, links or stored coordinates are modified.
import type { SpaceView } from "../api.ts";
import { ATLAS, type AtlasSpace } from "./atlas-data.ts";
import { inside } from "./region.ts";
import { isEuropeTrack } from "../status/tracks.ts";

export interface SpaceLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly callout: boolean;
}
/** Information anchors for geographic spaces, Western Cities and the Europe track. */
export function presentation(space: SpaceView): SpaceLayout {
  if (isEuropeTrack(space)) return {x:10,y:315,width:108,height:280,callout:true};
  const area = ATLAS.spaces[space.id] ?? ATLAS.insets[space.id];
  if (area === undefined) return {x:space.x-55,y:space.y-40,width:110,height:22,callout:false};
  const [x,y,width] = area.info;
  const lines = ["diyarbakir-rural","diyarbakir-city","western-cities"].includes(space.id) ? 2 : 1;
  return {x,y,width,height:lines*24,callout:ATLAS.insets[space.id] !== undefined};
}

/** A consistent name → control/population → political alignment hierarchy. */
export function statusLayout(space: SpaceView): readonly SpaceLayout[] {
  if (space.kind !== "domestic") return [];
  const p=presentation(space);
  const y = p.y + 20 + p.height - 10;
  return [{...p,x:p.x+4,y:y+1,width:p.width-34,height:21},{...p,y:y+27,height:22},{...p,x:p.x+p.width-24,y,width:22,height:23}];
}

/** At most this many sprites of one piece group are drawn one by one. A larger group also prints its total. */
export const SPREAD_CAP = 6;
const ROW = 31;
const GAP = 6;

export interface SpreadGroup {
  /** Sprite centers, left to right. A marker has one. */
  readonly at: readonly { readonly x: number; readonly y: number }[];
  /** The printed number: the total of a piece group above the cap, or the count of a marker. */
  readonly count: { readonly x: number; readonly y: number; readonly text: string } | null;
}

/**
 * Positions for every piece of the space drawn one by one, in the order pieces then markers.
 * Null when a group does not fit inside the area border: the caller then draws piles and counts.
 */
export function spreadPlan(space: SpaceView, area: Pick<AtlasSpace, "stack" | "rings">): { readonly rows: number; readonly groups: readonly SpreadGroup[] } | null {
  const [x, y, w] = area.stack;
  const units = [
    ...space.pieces.map(p => {
      const n = Math.min(p.count, SPREAD_CAP);
      const half = p.shape === "disc" ? 16 : 12;
      const step = p.shape === "disc" ? 20 : 14;
      const number = p.count > SPREAD_CAP ? 4 + 11 * String(p.count).length : 0;
      return { n, half, step, body: 2 * half + (n - 1) * step, number, text: p.count > SPREAD_CAP ? String(p.count) : null };
    }),
    ...space.markers.map(m => ({ n: 1, half: 10, step: 0, body: 20, number: 4 + 11 * String(m.count).length, text: String(m.count) })),
  ].filter(u => u.n > 0);
  const rows: (typeof units)[] = [];
  let width = 0;
  for (const u of units) {
    const row = rows.at(-1);
    if (row === undefined || width + GAP + u.body + u.number > w) { rows.push([u]); width = u.body + u.number; }
    else { row.push(u); width += GAP + u.body + u.number; }
  }
  const within = (px: number, py: number): boolean => area.rings.length === 0 || area.rings.filter(r => inside([px, py], r)).length % 2 === 1;
  // An inset box has no border ring. It holds one row.
  if (area.rings.length === 0 && rows.length > 1) return null;
  const groups: SpreadGroup[] = [];
  for (const [r, row] of rows.entries()) {
    const total = row.reduce((sum, u) => sum + u.body + u.number, 0) + GAP * (row.length - 1);
    const cy = y + 8 + r * ROW;
    let left = x + (w - total) / 2;
    for (const u of row) {
      const right = left + u.body + u.number;
      if (total > w || ![[left, cy - 17], [right, cy - 17], [left, cy + 15], [right, cy + 15]].every(([px = 0, py = 0]) => within(px, py))) return null;
      groups.push({
        at: Array.from({ length: u.n }, (_, i) => ({ x: left + u.half + i * u.step, y: cy })),
        count: u.text === null ? null : { x: left + u.body + 3, y: cy + 6, text: u.text },
      });
      left = right + GAP;
    }
  }
  return { rows: rows.length, groups };
}
