import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { kurdish, kurdishDir } from "./kurdish-package.ts";
import { join } from "node:path";
type Point = readonly [number, number];
const spaces = kurdish.data.map.spaces;
const segments = (rings: readonly (readonly Point[])[]) => rings.flatMap(r => r.map((p, i) => [p, r[(i + 1) % r.length] ?? p] as const));
function shared(a: readonly Point[], b: readonly Point[]): boolean {
  const [p, q] = a; const [r, s] = b;
  if (p === undefined || q === undefined || r === undefined || s === undefined) return false;
  const dx = q[0]-p[0], dy = q[1]-p[1], length = Math.hypot(dx,dy);
  if (length < .1) return false;
  const distance = (v: Point) => Math.abs(dx*(v[1]-p[1])-dy*(v[0]-p[0]))/length;
  if (distance(r) > .03 || distance(s) > .03) return false;
  const project = (v: Point) => ((v[0]-p[0])*dx+(v[1]-p[1])*dy)/length;
  return Math.min(length,Math.max(project(r),project(s)))-Math.max(0,Math.min(project(r),project(s))) > .1;
}
it("has one SVG polygon per space and all and only the 25 research borders", () => {
  const svg = readFileSync(join(kurdishDir,"map/draft-map.svg"),"utf8");
  const ids = [...svg.matchAll(/<path id="([^"]+)"/g)].map(m => m[1]);
  expect(ids.sort()).toEqual(spaces.map(s => s.id).sort());
  expect(svg).toContain('viewBox="0 0 1366 768"');
  expect(svg).toContain('DRAFT');
  const expected = kurdish.data.map.links.map(l => [l.a,l.b].sort().join("|")).sort();
  const actual: string[] = [];
  for (const [i,a] of spaces.entries()) {
    expect(a.polygon).toBeDefined();
    if (a.polygon === undefined) continue;
    const scaleA = a.polygon.scale;
    const first = segments([a.polygon.outer,...(a.polygon.holes ?? [])]).map(s => s.map(([x,y]) => [x/scaleA,y/scaleA] as const));
    for (const b of spaces.slice(i+1)) {
      if (b.polygon === undefined) continue;
      const scaleB = b.polygon.scale;
      const second = segments([b.polygon.outer,...(b.polygon.holes ?? [])]).map(s => s.map(([x,y]) => [x/scaleB,y/scaleB] as const));
      if (first.some(p => second.some(q => shared(p,q)))) actual.push([a.id,b.id].sort().join("|"));
    }
  }
  expect(expected).toHaveLength(25);
  expect(actual.sort()).toEqual(expected);
});
