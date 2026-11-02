import { describe, expect, it } from "vitest";
import { boardView } from "../../server/view.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { turnOf } from "../../../test/board.ts";
import { presentation, statusLayout } from "./layout.ts";
import { inside } from "./region.ts";
import { ATLAS } from "./atlas-data.ts";
const view = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));
describe("readable atlas layouts", () => {
  it("provides deterministic interior bounds without changing the view", () => {
    const before = JSON.stringify(view);
    for (const s of view.spaces) {
      const p = presentation(s);
      expect(p).toEqual(presentation(s));
      expect(p.width).toBeGreaterThanOrEqual(34);
      expect(p.x).toBeGreaterThanOrEqual(-130);
      expect(p.x + p.width).toBeLessThanOrEqual(1280);
      if (!p.callout && ATLAS.spaces[s.id] !== undefined) {
        const rings = ATLAS.spaces[s.id]?.rings ?? [];
        expect(rings.filter(r => inside([p.x+p.width/2,p.y+20],r)).length % 2, s.id).toBe(1);
      }
    }
    expect(JSON.stringify(view)).toBe(before);
  });
  it("keeps city information on the map and limits panels to the two off-map spaces", () => {
    const city = view.spaces.find(s => s.id === "diyarbakir-city");
    if (city === undefined) throw new Error("city");
    expect(presentation(city).callout).toBe(false);
    expect(view.spaces.filter(s => presentation(s).callout).map(s => s.id).sort()).toEqual(["europe", "western-cities"]);
  });
});

it.each(view.spaces.filter(s => s.kind === "domestic" && !s.tags.includes("noLandLinks")))("keeps all five political states in $id clear of the name and control", (space) => {
  for(const levelName of ["activeSupport","passiveSupport","neutral","passiveOpposition","activeOpposition"]) {
    const changed={...space,levelName};
    const p=presentation(changed);
    if(p.callout)continue;
    const boxes=statusLayout(changed);
    for(let i=0;i<boxes.length;i++) {
      const a=boxes[i];
      if(a === undefined)throw new Error("bounds");
      const rings=ATLAS.spaces[space.id]?.rings ?? [];
      for(const point of [[a.x+a.width/2,a.y+a.height/2]] as const) expect(rings.filter(r=>inside(point,r)).length%2,`${space.id} ${levelName}`).toBe(1);

    }
  }
},30000);
