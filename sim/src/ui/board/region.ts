// Map geometry for the board (08 s3.1): each located space gets a Voronoi cell around its
// map.yaml layout point. Domestic cells are clipped to an approximate Turkey border, external
// cells to the land outside it. Western Cities and Europe have no place on the regional map,
// so they sit in a left inset. Approximate, for orientation only: not a survey map.
import type { SpaceView } from "../api.ts";

export type Point = readonly [number, number];
export const MAP_W = 1000;
export const MAP_H = 700;
/** Left edge of the regional map; the inset column is to its left. */
export const MAP_X0 = 130;

/**
 * Turkey's border in map units, same projection as map.yaml layout:
 * x = (lon - 37.3) * 108 + 150, y = (40.4 - lat) * 150. Closed along the top and left edges.
 */
export const TURKEY: readonly Point[] = [
  [MAP_X0, 0], [MAP_W, 0], [960, 97], [922, 210], [901, 315], [917, 397], [960, 480],
  [809, 472], [695, 495], [571, 499], [463, 525], [334, 558], [226, 532], [MAP_X0, 540],
];

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

/** Cells for located spaces: domestic and external sets are split separately. */
export function regionCells(spaces: readonly SpaceView[]): { domestic: Map<string, Point[]>; external: Map<string, Point[]> } {
  const located = spaces.filter((s) => !isInset(s));
  const sites = (kind: boolean): { id: string; at: Point }[] => located.filter((s) => (s.kind === "domestic") === kind).map((s) => ({ id: s.id, at: [s.x, s.y] }));
  return { domestic: voronoi(sites(true)), external: voronoi(sites(false)) };
}
