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

/** Even-odd ray test. */
export function inside(p: Point, poly: readonly Point[]): boolean {
  let hit = false;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length] ?? a;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < a[0] + ((p[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1])) hit = !hit;
  });
  return hit;
}

/**
 * Cells for located spaces. `geographic`: every domestic point lies inside the border, so domestic
 * and external sets are split at the border. Otherwise (a session stored with an older schematic
 * layout) all located spaces share one diagram with no border clip.
 */
export function regionCells(spaces: readonly SpaceView[]): { geographic: boolean; domestic: Map<string, Point[]>; external: Map<string, Point[]> } {
  const located = spaces.filter((s) => !isInset(s));
  const site = (s: SpaceView): { id: string; at: Point } => ({ id: s.id, at: [s.x, s.y] });
  const geographic = located.every((s) => (s.kind === "domestic") === inside([s.x, s.y], TURKEY));
  if (!geographic) return { geographic, domestic: voronoi(located.map(site)), external: new Map() };
  return { geographic, domestic: voronoi(located.filter((s) => s.kind === "domestic").map(site)), external: voronoi(located.filter((s) => s.kind !== "domestic").map(site)) };
}

/** A longitude and latitude in map units (the map.yaml layout projection). */
const geo = (lon: number, lat: number): Point => [(lon - 37.3) * 108 + 150, (40.4 - lat) * 150];

/** Rivers for orientation (UC-7), traced through approximate towns on their course. */
export const RIVERS: readonly { readonly name: string; readonly path: readonly Point[] }[] = [
  // Euphrates: Keban, Malatya plain, Atatürk Dam, Birecik, into Syria at Jarablus.
  { name: "Euphrates", path: [geo(39.6, 38.85), geo(39.3, 38.8), geo(38.9, 38.45), geo(38.6, 37.95), geo(38.3, 37.55), geo(38.0, 37.05), geo(38.0, 36.6)] },
  // Tigris: Hazar Lake, Diyarbakır, Hasankeyf, Cizre, the Iraq border.
  { name: "Tigris", path: [geo(39.4, 38.5), geo(39.9, 38.15), geo(40.2, 37.9), geo(40.9, 37.85), geo(41.4, 37.7), geo(41.9, 37.45), geo(42.2, 37.3), geo(42.5, 37.0), geo(42.9, 36.6)] },
];

/** Lake Van outline (UC-7), approximate. */
export const LAKE_VAN: readonly Point[] = [
  geo(42.3, 38.75), geo(42.7, 38.95), geo(43.2, 39.0), geo(43.55, 38.85), geo(43.45, 38.45), geo(43.1, 38.4), geo(42.75, 38.55), geo(42.45, 38.55),
];
