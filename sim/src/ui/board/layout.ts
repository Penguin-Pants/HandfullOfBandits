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

/** At most this many sprites of one piece group are drawn one by one. A larger group is one sprite and its total. */
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
 * Positions for every piece of the space, in the order pieces then markers.
 * Each group is drawn one sprite per piece while the area has room. When it does not, the widest group shrinks to one sprite and its total, and the plan tries again.
 * A stack box narrower than the area is widened to the free width of its first row when the box alone does not fit.
 * Null when the groups do not fit inside the area border even as single sprites: the caller then draws piles and counts.
 */
export function spreadPlan(space: SpaceView, area: Pick<AtlasSpace, "stack" | "rings">): { readonly rows: number; readonly groups: readonly SpreadGroup[] } | null {
  // A group above the cap is always one sprite and its total.
  const collapsed = new Set(space.pieces.flatMap((p, i) => p.count > SPREAD_CAP ? [i] : []));
  for (;;) {
    const plan = place(space, area, unitsOf(space, collapsed));
    if (plan !== null) return plan;
    // Net width a group gives back when it shrinks to one sprite and a printed total. A group that would not get narrower is never shrunk.
    const saved = space.pieces.map((p, i) => collapsed.has(i) ? 0 : (p.count - 1) * (p.shape === "disc" ? 20 : 14) - (4 + 11 * String(p.count).length));
    const best = Math.max(0, ...saved);
    if (best === 0) return null;
    collapsed.add(saved.indexOf(best));
  }
}

interface Unit { readonly n: number; readonly half: number; readonly step: number; readonly body: number; readonly number: number; readonly text: string | null }

/** Sprite runs for each group. A collapsed piece group is one sprite and its total. */
function unitsOf(space: SpaceView, collapsed: ReadonlySet<number>): readonly Unit[] {
  return [
    ...space.pieces.map((p, i) => {
      const n = collapsed.has(i) ? 1 : p.count;
      const half = p.shape === "disc" ? 16 : 12;
      const step = p.shape === "disc" ? 20 : 14;
      const counted = collapsed.has(i);
      return { n, half, step, body: 2 * half + (n - 1) * step, number: counted ? 4 + 11 * String(p.count).length : 0, text: counted ? String(p.count) : null };
    }),
    ...space.markers.map(m => ({ n: 1, half: 10, step: 0, body: 20, number: 4 + 11 * String(m.count).length, text: String(m.count) })),
  ].filter(u => u.n > 0);
}

/** The stack box first, then the free width of the area. */
function place(space: SpaceView, area: Pick<AtlasSpace, "stack" | "rings">, units: readonly Unit[]): { readonly rows: number; readonly groups: readonly SpreadGroup[] } | null {
  const [x, y, w] = area.stack;
  const box = pack(space, area, units, x, y, w);
  if (box !== null || area.rings.length === 0) return box;
  const [left, right] = freeWidth(area.rings, x + w / 2, y + 8);
  return right - left > w ? pack(space, area, units, left, y, right - left) : null;
}

/** Even-odd test, so the city hole in the hinterland counts as outside. False when the area has no ring. */
const inArea = (rings: AtlasSpace["rings"], px: number, py: number): boolean => rings.filter(r => inside([px, py], r)).length % 2 === 1;

/** The widest span around `cx` where a sprite row centered on `cy` stays inside the border, less a margin for the border stroke. */
function freeWidth(rings: AtlasSpace["rings"], cx: number, cy: number): readonly [number, number] {
  const clear = (px: number): boolean => inArea(rings, px, cy - 17) && inArea(rings, px, cy + 15);
  let left = cx;
  let right = cx;
  while (clear(left - 1)) left -= 1;
  while (clear(right + 1)) right += 1;
  return [left + 4, right - 4];
}

function pack(space: SpaceView, area: Pick<AtlasSpace, "rings">, units: readonly Unit[], x: number, y: number, w: number): { readonly rows: number; readonly groups: readonly SpreadGroup[] } | null {
  const rows: Unit[][] = [];
  let width = 0;
  for (const u of units) {
    const row = rows.at(-1);
    if (row === undefined || width + GAP + u.body + u.number > w) { rows.push([u]); width = u.body + u.number; }
    else { row.push(u); width += GAP + u.body + u.number; }
  }
  const within = (px: number, py: number): boolean => area.rings.length === 0 || inArea(area.rings, px, py);
  // An inset box has no border ring. It holds one row.
  if (area.rings.length === 0 && rows.length > 1) return null;
  // A host area prints its posture counter below the pieces. More rows than the piles need would push it over the border.
  const piles = Math.min(units.length, 6);
  if (space.kind !== "domestic" && rows.length > Math.ceil(piles / (piles === 4 ? 2 : Math.min(3, piles)))) return null;
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
