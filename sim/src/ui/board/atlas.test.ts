import { describe, expect, it } from "vitest";
import { boardView } from "../../server/view.ts";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { ATLAS } from "./atlas-data.ts";
import { toBoard } from "./layout.ts";
import { inside, usesAtlas } from "./region.ts";

const view = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));
const edges = (id: string): Set<string> => new Set(ATLAS.spaces[id]?.rings.flatMap(r => r.flatMap((a, i) => {
  const b = r[(i + 1) % r.length];
  if (b === undefined || a[0] === b[0] && a[1] === b[1]) return [];
  return [[a.join(","), b.join(",")].sort().join("|")];
})));
const segmentSets = new Map(Object.keys(ATLAS.spaces).map(id => [id, edges(id)]));
const shares = (a: string, b: string): boolean => [...(segmentSets.get(a) ?? [])].some(e => segmentSets.get(b)?.has(e));

describe("approved atlas geometry", () => {
  it("keeps cropped country frontiers renderable, including empty source segments", () => {
    expect(ATLAS.countryBorders).not.toMatch(/M(?:M|$)/);
    expect(ATLAS.countryBorders).toMatch(/^M-?[\d.]+,-?[\d.]+[LC]/);
  });

  it("has all and only the 30 shared domestic borders, including the three enclosed cities, plus Van City to Hakkari (DD-22)", () => {
    const domestic = view.spaces.filter(s => s.kind === "domestic" && !s.tags.includes("noLandLinks"));
    const actual = domestic.flatMap((a, i) => domestic.slice(i + 1).filter(b => shares(a.id, b.id)).map(b => [a.id, b.id].sort().join("|"))).sort();
    const land = view.links.filter(l => l.kind === "land").map(l => [l.a, l.b].sort().join("|")).sort();
    // Van City touches only Van hinterland on the map. Its link to Hakkari is a designer decision with no shared border.
    expect(land.filter(l => !actual.includes(l))).toEqual(["hakkari|van-city"]);
    expect(actual).toEqual(land.filter(l => l !== "hakkari|van-city"));
    for (const [city, hinterland] of [["diyarbakir-city", "diyarbakir-rural"], ["van-city", "van-rural"], ["batman-city", "batman-rural"]] as const) {
      expect(shares(city, hinterland), city).toBe(true);
      const circle = ATLAS.spaces[city]?.circle;
      if (circle === undefined) throw new Error("City circle missing");
      const point: [number, number] = [circle[0],circle[1]];
      expect(ATLAS.spaces[hinterland]?.rings.filter(r => inside(point,r)).length, hinterland).toBe(2);
      expect(ATLAS.spaces[city]?.rings.filter(r => inside(point,r)).length, city).toBe(1);
    }
  });

  it("shares the Syria frontier with KDP without a Mardin–KDP border", () => {
    expect(shares("syria-bekaa", "kdp-zone")).toBe(true);
    expect(shares("mardin", "kdp-zone")).toBe(false);
    expect(shares("kdp-zone", "puk-zone")).toBe(true);
    expect(view.links).toHaveLength(36);
    expect(view.links.some(l => [l.a,l.b].includes("syria-bekaa") && [l.a,l.b].includes("kdp-zone"))).toBe(false);
  });

  it("keeps piece stack anchors inside their areas", () => {
    for (const area of Object.values(ATLAS.spaces).filter(s => s.population !== undefined)) {
      const [x,y,w] = area.stack;
      for (const p of [[x+w/2,y]] as const) {
        expect(area.rings.filter(r => inside(p,r)).length % 2).toBe(1);
      }
    }
  });

  it("keeps province interiors disjoint after the common readability projection", () => {
    const domestic = view.spaces.filter(s => s.kind === "domestic" && !s.tags.includes("noLandLinks"));
    for (let y = 15; y < ATLAS.height; y += 30) for (let x = 15; x < ATLAS.width; x += 30) {
      const covering = domestic.filter(s => (ATLAS.spaces[s.id]?.rings.filter(r => inside([x,y],r)).length ?? 0) % 2 === 1);
      expect(covering.length).toBeLessThanOrEqual(1);
    }
  });

  it("prints the package names, which are the accurate Turkish names (DD-22)", () => {
    expect(view.spaces.find(s => s.id === "diyarbakir-city")?.name).toBe("Diyarbakır City (Amed)");
    expect(view.spaces.find(s => s.id === "diyarbakir-rural")?.name).toBe("Diyarbakır hinterland");
    expect(kurdish.data.map.spaces.find(s => s.id === "diyarbakir-city")?.name).toBe("Diyarbakır City (Amed)");
    expect(usesAtlas(view.spaces)).toBe(true);
    expect(usesAtlas(view.spaces.slice(1))).toBe(false);
    expect(usesAtlas(view.spaces.map(s => ({ ...s, x: s.x + 1 })))).toBe(false);
  });
  it("has an area, a block and a name line for each of the 18 domestic spaces and the external boxes (DD-22)", () => {
    const domestic = view.spaces.filter(s => s.kind === "domestic" && !s.tags.includes("noLandLinks"));
    expect(domestic).toHaveLength(17);
    for (const s of domestic) {
      const area = ATLAS.spaces[s.id];
      expect(area, s.id).toBeDefined();
      expect(area?.labels.length, s.id).toBeGreaterThan(0);
      expect(area?.population, s.id).toBeDefined();
      expect([area?.source[0], area?.source[1]], s.id).toEqual([s.x, s.y]);
    }
    for (const id of ["syria-bekaa", "kdp-zone", "puk-zone", "iran"]) expect(ATLAS.spaces[id], id).toBeDefined();
  });

  it("draws each space block, at its own scale, entirely inside the space border", () => {
    for (const s of view.spaces.filter(x => x.kind === "domestic" && !x.tags.includes("noLandLinks"))) {
      const area = ATLAS.spaces[s.id];
      if (area === undefined) throw new Error(`${s.id} has no area`);
      expect(area.scale ?? 1, s.id).toBeGreaterThanOrEqual(0.6);
      const [x, y, w] = area.info;
      const bottom = area.stack[1] + area.stack[3];
      for (const corner of [[x, y], [x + w, y], [x, bottom], [x + w, bottom]] as const)
        expect(area.rings.filter(r => inside(toBoard(area, corner), r)).length % 2, `${s.id} ${corner.join(",")}`).toBe(1);
    }
  });

  it("marks every Turkish province outside the playable area as out of play, with faded terrain and a label", () => {
    expect(ATLAS.outOfPlay.mountain.length).toBeGreaterThan(0);
    expect(ATLAS.outOfPlay.plain.length).toBeGreaterThan(0);
    expect(ATLAS.outOfPlay.labels.map(l => l.text)).toEqual(["OUT OF PLAY", "OUT OF PLAY"]);
    expect(ATLAS.geoLabels.map(l => l.text)).toEqual(["S Y R I A", "I R A Q", "Lake Van"]);
  });
});
