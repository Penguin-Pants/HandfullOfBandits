import { describe, expect, it } from "vitest";
import { boardView } from "../../server/view.ts";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { ATLAS } from "./atlas-data.ts";
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
    expect(ATLAS.countryBorders).toMatch(/^M-?[\d.]+,-?[\d.]+L/);
  });

  it("has all and only the 20 research domestic borders, including the enclosed city", () => {
    const domestic = view.spaces.filter(s => s.kind === "domestic" && !s.tags.includes("noLandLinks"));
    const actual = domestic.flatMap((a, i) => domestic.slice(i + 1).filter(b => shares(a.id, b.id)).map(b => [a.id, b.id].sort().join("|"))).sort();
    expect(actual).toEqual(view.links.filter(l => l.kind === "land").map(l => [l.a, l.b].sort().join("|")).sort());
    expect(shares("diyarbakir-city", "diyarbakir-rural")).toBe(true);
    expect(ATLAS.spaces["diyarbakir-rural"]?.rings.filter(r => inside([466.44,372],r)).length).toBe(2);
    expect(ATLAS.spaces["diyarbakir-city"]?.rings.filter(r => inside([466.44,372],r)).length).toBe(1);
  });

  it("shares the Syria frontier with KDP without a Mardin–KDP border", () => {
    expect(shares("syria-bekaa", "kdp-zone")).toBe(true);
    expect(shares("mardin-batman", "kdp-zone")).toBe(false);
    expect(shares("kdp-zone", "puk-zone")).toBe(true);
    expect(view.links).toHaveLength(25);
    expect(view.links.some(l => [l.a,l.b].includes("syria-bekaa") && [l.a,l.b].includes("kdp-zone"))).toBe(false);
  });

  it("keeps every reserved piece stack inside its area", () => {
    for (const area of Object.values(ATLAS.spaces).filter(s => s.population !== undefined)) {
      const [x,y,w,h] = area.stack;
      for (const p of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]] as const) {
        expect(area.rings.filter(r => inside(p,r)).length % 2).toBe(1);
      }
    }
  });

  it("uses current presentation labels without altering saved package names or hashes", () => {
    expect(view.spaces.find(s => s.id === "diyarbakir-city")?.name).toBe("Diyarbakir");
    expect(view.spaces.find(s => s.id === "diyarbakir-rural")?.name).toBe("Diyarbakir hinterland");
    expect(kurdish.data.map.spaces.find(s => s.id === "diyarbakir-city")?.name).toBe("Diyarbakır City (Amed)");
    expect(usesAtlas(view.spaces)).toBe(true);
    expect(usesAtlas(view.spaces.slice(1))).toBe(false);
    expect(usesAtlas(view.spaces.map(s => ({ ...s, x: s.x + 1 })))).toBe(false);
  });
});
