import { describe, expect, it } from "vitest";
import { kurdish } from "../../test/kurdish-package.ts";
import { setMarkers, turnOf } from "../../test/board.ts";
import { boardView } from "./view.ts";

// P2-14 view model mapping: all 18 locations with counts, levels, markers and Control.
const { ruleset, data } = kurdish;

describe("boardView", () => {
  const view = boardView(ruleset, data, setMarkers(turnOf("pkk"), "dersim", "covert", 1));

  it("maps all 18 locations at their layout with level names and Control", () => {
    expect(view.spaces).toHaveLength(18);
    expect(view.spaces.find((s) => s.id === "botan")).toMatchObject({ x: 722, y: 435, level: -1, levelName: "passiveOpposition", control: null, pop: 2, terrain: "mountain" });
    expect(view.spaces.find((s) => s.id === "kdp-zone")).toMatchObject({ level: null, levelName: null, control: null });
    expect(view.spaces.find((s) => s.id === "hakkari")?.control).toBe("state");
  });

  it("lists pieces by face with shape, variant and emblem on its face only (DEC-29, DEC-30)", () => {
    const botan = view.spaces.find((s) => s.id === "botan");
    expect(botan?.pieces).toEqual([
      { piece: "troops", faction: "state", face: "default", count: 2, shape: "cube", colorVariant: "base", emblem: null, isBase: false },
      { piece: "police", faction: "state", face: "default", count: 1, shape: "cube", colorVariant: "light", emblem: null, isBase: false },
      { piece: "guerrilla", faction: "pkk", face: "underground", count: 2, shape: "octagon", colorVariant: "base", emblem: null, isBase: false },
      { piece: "pkkBase", faction: "pkk", face: "default", count: 1, shape: "disc", colorVariant: "base", emblem: null, isBase: true },
    ]);
    expect(view.spaces.find((s) => s.id === "elazig")?.pieces.find((p) => p.piece === "stateBase")?.emblem).toBe("crescentStar");
  });

  it("marks hidden markers, and fills the status bar from the server", () => {
    expect(view.spaces.find((s) => s.id === "dersim")?.markers).toEqual([{ marker: "covert", side: "default", count: 1, hidden: true }]);
    expect(view.status).toMatchObject({ campaign: "C1", scores: { state: 21, pkk: 4 }, thresholds: { state: 49, pkk: 30 }, margins: { state: -28, pkk: -26 }, harmLimit: 6, active: "pkk" });
    expect(view.status.tracks.find((t) => t.id === "legitimacy")).toEqual({ id: "legitimacy", display: "Legitimacy", value: 10 });
    expect(view.links).toHaveLength(25);
  });
});
