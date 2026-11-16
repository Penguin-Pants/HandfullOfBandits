import { describe, expect, it } from "vitest";
import type { SpaceView } from "../api.ts";
import { boardView } from "../../server/view.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { turnOf } from "../../../test/board.ts";
import { blockTransform, presentation, SPREAD_CAP, spreadPlan, statusLayout, toBoard } from "./layout.ts";
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
      expect(p.x + p.width).toBeLessThanOrEqual(ATLAS.width);
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

describe("individual pieces (spread plan)", () => {
  const sirnak = view.spaces.find(s => s.id === "sirnak");
  const area = ATLAS.spaces.sirnak;
  if (sirnak === undefined || area === undefined) throw new Error("sirnak");
  const withCounts = (count: number, groups = sirnak.pieces.length) => ({ ...sirnak, markers: [], pieces: sirnak.pieces.slice(0, groups).map(p => ({ ...p, count })) });

  it("places one sprite per piece and no count while every group is at the cap or below", () => {
    const plan = spreadPlan(sirnak, area);
    if (plan === null) throw new Error("the start setup must fit");
    expect(plan.groups.map(g => g.at.length)).toEqual(sirnak.pieces.map(p => p.count));
    expect(plan.groups.every(g => g.count === null)).toBe(true);
    expect(spreadPlan(sirnak, area)).toEqual(plan);
  });

  it("draws one sprite and the exact total for a group above the cap, even with room to spare", () => {
    const plan = spreadPlan(withCounts(SPREAD_CAP + 3, 1), area);
    expect(plan?.groups[0]?.at).toHaveLength(1);
    expect(plan?.groups[0]?.count?.text).toBe(String(SPREAD_CAP + 3));
  });

  it("draws one sprite per piece for a group at the cap", () => {
    const plan = spreadPlan(withCounts(SPREAD_CAP, 1), area);
    expect(plan?.groups[0]?.at).toHaveLength(SPREAD_CAP);
    expect(plan?.groups[0]?.count).toBeNull();
  });

  it("keeps every sprite inside the area border", () => {
    for (const s of view.spaces) {
      const layout = ATLAS.spaces[s.id];
      const plan = layout === undefined ? null : spreadPlan(s, layout);
      if (plan === null || layout === undefined) continue;
      for (const g of plan.groups) for (const p of g.at) for (const point of [[p.x - 12, p.y - 15], [p.x + 12, p.y + 13]] as const)
        expect(layout.rings.filter(r => inside(toBoard(layout, point), r)).length % 2, s.id).toBe(1);
    }
  });

  it("never uses more rows than the piles in a host area, so the posture counter below stays inside the border", () => {
    const syria = view.spaces.find(s => s.id === "syria-bekaa");
    const host = ATLAS.spaces["syria-bekaa"];
    const guerrilla = syria?.pieces.find(p => p.piece === "guerrilla");
    if (syria === undefined || host === undefined || guerrilla === undefined) throw new Error("syria");
    const crowded = { ...syria, markers: [], pieces: [{ ...guerrilla, face: "active", count: 6 }, { ...guerrilla, face: "underground", count: 6 }] };
    expect(spreadPlan(crowded, host)?.rows ?? 1).toBe(1);
    expect(spreadPlan(syria, host)?.rows).toBe(1);
  });

  it("returns null when even one sprite per group does not fit, so the area falls back to piles", () => {
    // Batman City is the smallest area (DD-22): five piece groups and eight marker chips do not fit even as single sprites.
    const city = view.spaces.find(s => s.id === "batman-city");
    const layout = ATLAS.spaces["batman-city"];
    if (city === undefined || layout === undefined) throw new Error("batman-city");
    const markers = ["coercion", "stateHarm", "pkkHarm", "disputedHarm", "displacement", "reception", "office", "covert"].map(marker => ({ marker, side: "default", count: 1, hidden: false }));
    expect(spreadPlan({ ...crowded(city), markers }, layout)).toBeNull();
  });

  it("shrinks a group to one sprite and its total only where the area has no room", () => {
    const sprites = (id: string) => {
      const s = view.spaces.find(v => v.id === id);
      const layout = ATLAS.spaces[id];
      if (s === undefined || layout === undefined) throw new Error(id);
      const plan = spreadPlan(crowded(s), layout);
      for (const g of plan?.groups ?? []) for (const p of g.at) for (const point of [[p.x - 12, p.y - 15], [p.x + 12, p.y + 13]] as const)
        expect(layout.rings.filter(r => inside(toBoard(layout, point), r)).length % 2, id).toBe(1);
      return plan?.groups.map(g => [g.at.length, g.count?.text ?? null]);
    };
    expect(sprites("mardin")).toEqual([[4, null], [3, null], [5, null], [1, null], [1, null]]);
    expect(sprites("van-city")).toEqual([[4, null], [3, null], [1, "5"], [1, null], [1, null]]);
  });

  // Four groups after a PKK Rally replaces Guerrillas with a Base. The stack box sits on the south border, so a second row cannot fit.
  const piece = (id: string) => {
    const found = view.spaces.flatMap(s => s.pieces).find(p => p.piece === id);
    if (found === undefined) throw new Error(id);
    return found;
  };
  const rallied = (s: SpaceView): SpaceView => ({ ...s, markers: [], pieces: [{ ...piece("troops"), count: 3 }, { ...piece("police"), count: 2 }, { ...piece("guerrilla"), count: 1 }, { ...piece("pkkBase"), count: 1 }] });
  // A busy space: five groups, one of them 5 Guerrillas.
  const crowded = (s: SpaceView): SpaceView => ({ ...s, markers: [], pieces: [{ ...piece("troops"), count: 4 }, { ...piece("police"), count: 3 }, { ...piece("guerrilla"), count: 5 }, { ...piece("pkkBase"), count: 1 }, { ...piece("stateBase"), count: 1 }] });

  it("uses the free width of the area when the stack box is too narrow, so Şanlıurfa shows all four groups", () => {
    const urfa = view.spaces.find(s => s.id === "sanliurfa");
    const layout = ATLAS.spaces.sanliurfa;
    if (urfa === undefined || layout === undefined) throw new Error("sanliurfa");
    const plan = spreadPlan(rallied(urfa), layout);
    expect(plan?.groups.map(g => g.at.length)).toEqual([3, 2, 1, 1]);
    for (const g of plan?.groups ?? []) for (const p of g.at) for (const point of [[p.x - 12, p.y - 15], [p.x + 12, p.y + 13]] as const)
      expect(layout.rings.filter(r => inside(point, r)).length % 2).toBe(1);
  });

  it("keeps every sprite clear of the name and political status labels", () => {
    for (const s of view.spaces) for (const load of [rallied, crowded]) {
      const layout = ATLAS.spaces[s.id];
      const plan = layout === undefined ? null : spreadPlan(load(s), layout);
      if (plan === null) continue;
      const labels = [presentation(s), ...statusLayout(s)];
      for (const g of plan.groups) for (const p of g.at)
        expect(labels.some(b => p.x - 12 < b.x + b.width && p.x + 12 > b.x && p.y - 15 < b.y + b.height && p.y + 13 > b.y), s.id).toBe(false);
    }
  });
});

describe("reduced block scale (DD-22)", () => {
  const area = { info: [100, 200, 120] as const, stack: [104, 300, 112, 58] as const };

  it("leaves a block at full scale untouched", () => {
    expect(blockTransform({ ...area })).toBeUndefined();
    expect(blockTransform({ ...area, scale: 1 })).toBeUndefined();
    expect(toBoard({ ...area }, [150, 250])).toEqual([150, 250]);
  });

  it("scales a block about its centre, so the centre point stays fixed and the corners move inwards", () => {
    const small = { ...area, scale: 0.5 };
    // Centre: x 100 + 120 / 2, y (200 + 300 + 58) / 2.
    expect(blockTransform(small)).toBe("translate(160 279) scale(0.5) translate(-160 -279)");
    expect(toBoard(small, [160, 279])).toEqual([160, 279]);
    expect(toBoard(small, [100, 200])).toEqual([130, 239.5]);
  });
});
