// Approved atlas geometry with a generic Voronoi fallback for older layouts and other packages.
import { ATLAS } from "./atlas-data.ts";
import type { SpaceView } from "../api.ts";

export type Point = readonly [number, number];
export const MAP_W = 1000;
export const MAP_H = 700;
/** Left edge of the regional map; the inset column is to its left. */
export const MAP_X0 = 130;

/** True when the space belongs in the inset (no regional location). */
export function isInset(space: SpaceView): boolean {
  return space.tags.includes("noLandLinks") || space.tags.includes("noPieces");
}

/** Keep the part of `poly` on the side of the bisector of a and b that holds a. */
function clipToSite(poly: readonly Point[], a: Point, b: Point): Point[] {
  const nx = b[0] - a[0];
  const ny = b[1] - a[1];
  const c = (nx * (a[0] + b[0]) + ny * (a[1] + b[1])) / 2;
  const side = (p: Point): number => nx * p[0] + ny * p[1] - c;
  const out: Point[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length] ?? p;
    const sp = side(p);
    const sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}

/** Voronoi cell of each site inside the map rectangle. */
export function voronoi(sites: readonly { id: string; at: Point }[]): Map<string, Point[]> {
  const frame: Point[] = [[MAP_X0, 0], [MAP_W, 0], [MAP_W, MAP_H], [MAP_X0, MAP_H]];
  return new Map(sites.map((s) => [s.id, sites.reduce((poly, o) => (o.id === s.id ? poly : clipToSite(poly, s.at, o.at)), frame)]));
}

export function pathOf(poly: readonly Point[]): string {
  return poly.length === 0 ? "" : `M${poly.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("L")}Z`;
}

/** Even-odd ray test. */
export function inside(p: Point, poly: readonly Point[]): boolean {
  let hit = false;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length] ?? a;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < a[0] + ((p[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1])) hit = !hit;
  });
  return hit;
}

/** Match the approved geometry only to its original package layout, including saved sessions. */
export function usesAtlas(spaces: readonly SpaceView[]): boolean {
  const located = spaces.filter(s => !isInset(s));
  return located.length === Object.keys(ATLAS.spaces).length && located.every(s => {
    const expected = ATLAS.spaces[s.id]?.source;
    return expected !== undefined && expected[0] === s.x && expected[1] === s.y;
  });
}

/** Old schematic layouts and other game packages keep their generated cells. */
export function regionCells(spaces: readonly SpaceView[]): { geographic: boolean; domestic: Map<string, Point[]>; external: Map<string, Point[]> } {
  const located = spaces.filter(s => !isInset(s));
  if (!usesAtlas(spaces)) return { geographic: false, domestic: voronoi(located.map(s => ({ id: s.id, at: [s.x, s.y] }))), external: new Map() };
  const cells = (kind: string): Map<string, Point[]> => new Map(located.filter(s => (s.kind === "domestic") === (kind === "domestic")).map(s => [s.id, [...(ATLAS.spaces[s.id]?.rings[0] ?? [])]]));
  return { geographic: true, domestic: cells("domestic"), external: cells("external") };
}
