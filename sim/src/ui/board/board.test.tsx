// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { Forces } from "../status/Forces.tsx";
import { StatusBar } from "../status/StatusBar.tsx";
import { TrackCard } from "../status/TrackCard.tsx";
import { setMarkers, setPieces } from "../../../test/board.ts";
import { changedSpaces } from "../play/Play.tsx";
import { Board, Legend, SpaceDetail, spaceTooltip } from "./Board.tsx";
import { ATLAS } from "./atlas-data.ts";
import { isInset, regionCells, voronoi } from "./region.ts";

// P2-14: the board draws every location from the server view model; selection and detail card.
afterEach(cleanup);
const view = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));

describe("Board", () => {
  it("draws all 18 locations with their pieces", () => {
    render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(18);
    expect(screen.getByLabelText("guerrilla underground 3")).toBeTruthy();
  });

  it("selects on click and adds with Shift", () => {
    const onSelect = vi.fn();
    render(<Board view={view} selected={["botan"]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Hakkari" }), { shiftKey: true });
    expect(onSelect).toHaveBeenCalledWith("hakkari", true);
    expect(screen.getByRole("button", { name: "Botan" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("shows the detail card and the status bar", () => {
    const botan = view.spaces.find((s) => s.id === "botan");
    if (botan === undefined) throw new Error("botan");
    render(
      <>
        <SpaceDetail space={botan} />
        <StatusBar view={view} />
      </>,
    );
    expect(screen.getByText("Level: Passive Opposition · Control: none")).toBeTruthy();
    expect(screen.getByText(/Underground Guerrilla/)).toBeTruthy();
    expect(screen.getByLabelText("State score").textContent).toBe("StateScore 21 of 49Margin -28Harm 0 of 6");
  });
});

describe("map geometry", () => {
  it("gives every located space its projected area; Western Cities and Europe move to the ribbon", () => {
    const cells = regionCells(view.spaces);
    for (const s of view.spaces) {
      const cell = cells.domestic.get(s.id) ?? cells.external.get(s.id);
      if (isInset(s)) {
        expect(cell).toBeUndefined();
        continue;
      }
      expect(cell?.length ?? 0).toBeGreaterThanOrEqual(3);
      const label = ATLAS.spaces[s.id]?.labels[0];
      expect(label).toBeDefined();
      if (label === undefined) continue;
      const xs = (cell ?? []).map(p => p[0]);
      const ys = (cell ?? []).map(p => p[1]);
      expect(label.x).toBeGreaterThanOrEqual(Math.min(...xs));
      expect(label.x).toBeLessThanOrEqual(Math.max(...xs));
      expect(label.y).toBeGreaterThanOrEqual(Math.min(...ys));
      expect(label.y).toBeLessThanOrEqual(Math.max(...ys));
    }
    expect(view.spaces.filter(isInset).map((s) => s.id).sort()).toEqual(["europe", "western-cities"]);
  });

  it("falls back to one unclipped diagram for a session stored with the old schematic layout", () => {
    const old = { ...view, spaces: view.spaces.map((s) => (s.id === "hakkari" ? { ...s, x: 820, y: 520 } : s)) };
    const cells = regionCells(old.spaces);
    expect(cells.geographic).toBe(false);
    expect(cells.external.size).toBe(0);
    expect(cells.domestic.has("kdp-zone")).toBe(true);
    expect(regionCells(view.spaces).geographic).toBe(true);
    render(<Board view={old} selected={[]} onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Hakkari" }).querySelector("path")?.getAttribute("clip-path")).toBeNull();
    expect(Number(screen.getByRole("button",{name:"Europe"}).querySelector("rect")?.getAttribute("x"))).toBeGreaterThanOrEqual(0);
  });

  it("splits the plane on the bisector of two sites", () => {
    const cells = voronoi([{ id: "a", at: [300, 350] }, { id: "b", at: [700, 350] }]);
    expect(Math.max(...(cells.get("a") ?? []).map((p) => p[0]))).toBeCloseTo(500);
    expect(Math.min(...(cells.get("b") ?? []).map((p) => p[0]))).toBeCloseTo(500);
  });
});

describe("change outline", () => {
  it("lists only the spaces an action changed and outlines them on the board", () => {
    const after = boardView(kurdish.ruleset, kurdish.data, setPieces(turnOf("pkk"), "dersim", "guerrilla", 1));
    expect(changedSpaces(view, after)).toEqual(["dersim"]);
    render(<Board view={after} selected={[]} onSelect={vi.fn()} changed={["dersim"]} />);
    expect(screen.getByRole("button", { name: "Dersim" }).querySelector('[stroke-width="4"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Botan" }).querySelector('[stroke-width="4"]')).toBeNull();
  });

  it("shows a legend entry for each piece on the board", () => {
    render(<Legend view={view} />);
    expect(screen.getByLabelText("Legend").textContent).toMatch(/guerrilla \(underground\)/);
  });
});

describe("victory track and forces", () => {
  it("places each faction marker at its score and flags its threshold", () => {
    render(<StatusBar view={view} />);
    expect(screen.getByLabelText("State score 21").textContent).toBe("State 21");
    expect(screen.getByLabelText("Victory track").querySelectorAll(".vt-cell")).toHaveLength(51);
    // A flag label near the end of the track is right-aligned so it stays on screen.
    expect(screen.getByText("State wins at 49").parentElement?.classList.contains("end")).toBe(true);
    expect(screen.getByText("PKK wins at 30").parentElement?.classList.contains("end")).toBe(false);
    expect(screen.getByText("State wins at 49")).toBeTruthy();
    expect(screen.getByText("PKK wins at 30")).toBeTruthy();
  });

  it("lists each piece type on the map, Available and out of play", () => {
    render(<Forces view={view} />);
    const guards = view.forces.find((f) => f.piece === "guards");
    expect(guards?.outOfPlay).toBeGreaterThan(0);
    expect(screen.getByLabelText("State forces").textContent).toContain(`guards00${String(guards?.outOfPlay)}`);
    const total = view.forces.find((f) => f.piece === "guerrilla");
    expect((total?.onMap ?? 0) + (total?.available ?? 0) + (total?.outOfPlay ?? 0)).toBe(30);
  });
});

describe("map markers", () => {
  it("draws a level marker for Support or Opposition and a chip per space marker", () => {
    const marked = boardView(kurdish.ruleset, kurdish.data, setMarkers(setMarkers(turnOf("pkk"), "botan", "coercion", 2), "botan", "displacement", 1, "old"));
    const botan = marked.spaces.find(s => s.id === "botan");
    if (botan === undefined) throw new Error("botan");
    render(<><Board view={marked} selected={[]} onSelect={vi.fn()} /><SpaceDetail space={botan} /></>);
    expect(screen.getByRole("button", { name: "Botan" }).ownerDocument.querySelectorAll("[aria-label=\"Passive Opposition\"]").length).toBe(marked.spaces.filter((s) => s.levelName === "passiveOpposition").length);
    expect(screen.getByLabelText("Botan detail").textContent).toContain("2 Coercion");
    expect(screen.getByLabelText("Botan detail").textContent).toContain("1 Displacement (Old)");
    expect(screen.getByLabelText("Leadership present 1").textContent).toContain("present");
  });
});

describe("map tooltip", () => {
  it("lists level, Control, pieces and markers on separate lines", () => {
    const marked = boardView(kurdish.ruleset, kurdish.data, setMarkers(turnOf("pkk"), "botan", "coercion", 1));
    const botan = marked.spaces.find((s) => s.id === "botan");
    if (botan === undefined) throw new Error("botan");
    const lines = spaceTooltip(botan).split("\n");
    expect(lines[0]).toBe("Botan · Pop 2 · mountain");
    expect(lines[1]).toBe("Level: Passive Opposition · Control: none");
    expect(lines[2]).toMatch(/^Pieces: .*Underground Guerrilla/);
    expect(lines[3]).toBe("Markers: 1 Coercion");
  });
});

describe("Resources and politics card (UC-7)", () => {
  it("lists the tracks that have no place on the map, none of the ones drawn on a map box", () => {
    render(<TrackCard view={view} />);
    const card = screen.getByLabelText("Resources and politics");
    for (const name of ["State Resources", "PKK Resources", "Legitimacy", "Emergency Rule", "Ceasefire", "Legal Space"]) expect(card.querySelector(`[aria-label="${name}"]`)).not.toBeNull();
    for (const name of ["Syria posture", "KDP posture", "PUK posture", "Europe"]) expect(card.querySelector(`[aria-label="${name}"]`)).toBeNull();
  });

  it("draws Resources as a bar with the value, Legitimacy as numbered boxes, step tracks as steps", () => {
    render(<TrackCard view={view} />);
    expect(screen.getByLabelText("State Resources").textContent).toContain("12");
    expect(screen.getByLabelText("State Resources").querySelector(".track-bar")).not.toBeNull();
    const legit = screen.getByLabelText("Legitimacy");
    expect(legit.querySelectorAll(".mini-box")).toHaveLength(21);
    expect(legit.querySelector("[aria-current]")?.textContent).toBe("10");
    const er = screen.getByLabelText("Emergency Rule");
    expect([...er.querySelectorAll(".mini-step")].map((e) => e.textContent)).toEqual(["Martial Law", "OHAL", "OHAL Extended Powers", "Normalizing"]);
    expect(er.querySelector("[aria-current]")?.textContent).toBe("Martial Law");
  });

  it("falls back to words for a value with no readable name", () => {
    const odd = { ...view, status: { ...view.status, tracks: [{ id: "mood", display: "Mood", value: "veryTense", steps: ["calm", "veryTense"] }] } };
    render(<TrackCard view={odd} />);
    expect(screen.getByLabelText("Mood").querySelector("[aria-current]")?.textContent).toBe("Very Tense");
  });

  it("the status bar no longer repeats the tracks", () => {
    render(<StatusBar view={view} />);
    expect(screen.queryByLabelText("Tracks")).toBeNull();
    expect(screen.queryByLabelText("Legitimacy")).toBeNull();
  });
});

describe("map boxes and terrain (UC-7)", () => {
  it("shows each host posture on its box and the Europe track in the Europe box", () => {
    render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    const kdp = screen.getByLabelText("KDP posture track");
    expect(kdp.querySelector("[aria-current]")?.textContent).toBe("KDP: Host");
    expect(screen.getByLabelText("Syria posture track")).toBeTruthy();
    expect(screen.getByLabelText("PUK posture track")).toBeTruthy();
    const europe = screen.getByLabelText("Europe track");
    expect(europe.querySelectorAll("text")).toHaveLength(1);
    expect(europe.querySelector("[aria-current]")?.textContent).toBe(`Europe: ${String(view.status.tracks.find((t) => t.id === "europe")?.value)}`);
  });

  it("shades every Mountain space, draws the sourced lake without rivers and no links between spaces", () => {
    const { container } = render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    const mountains = view.spaces.filter((s) => s.terrain === "mountain" && !isInset(s)).map((s) => s.id);
    const drawn = new Set([...container.querySelectorAll("[data-terrain='mountain']")].map((e) => e.getAttribute("data-of")));
    expect([...drawn].sort()).toEqual([...mountains].sort());
    expect(container.querySelector(".map-relief.mountain")?.getAttribute("clip-path")).toBe("url(#clip-mountains)");
    expect(container.querySelectorAll(".map-river")).toHaveLength(0);
    expect(container.querySelectorAll(".map-lake")).toHaveLength(1);
    expect(container.querySelectorAll("line:not(.map-arrow line)")).toHaveLength(0);
  });
});

describe("map drag (UC-5)", () => {
  it("a drag from one space to another reports the move; a press and release on one space does not", () => {
    const onDrag = vi.fn();
    render(<Board view={view} selected={[]} onSelect={vi.fn()} onDrag={onDrag} />);
    const hakkari = screen.getByRole("button", { name: "Hakkari" });
    const botan = screen.getByRole("button", { name: "Botan" });
    fireEvent.pointerDown(hakkari, { button: 0 });
    fireEvent.pointerUp(hakkari, { button: 0 });
    expect(onDrag).not.toHaveBeenCalled();
    fireEvent.pointerDown(hakkari, { button: 0 });
    fireEvent.pointerUp(botan, { button: 0 });
    expect(onDrag).toHaveBeenCalledWith("hakkari", "botan");
  });

  it("draws an arrow with the piece count for each planned move", () => {
    render(<Board view={view} selected={[]} onSelect={vi.fn()} arrows={[{ from: "hakkari", to: "botan", count: 3 }]} />);
    const moves = screen.getByLabelText("Planned moves");
    expect(moves.querySelectorAll("line")).toHaveLength(1);
    expect(moves.textContent).toBe("3");
  });
});

describe("approved atlas board", () => {
  it("separates real geography from selectable areas and removes river lines", () => {
    const { container } = render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    expect(container.querySelector("[data-geography='country-borders']")).not.toBeNull();
    expect(container.querySelector("[data-geography='lake-van']")?.getAttribute("d")?.length).toBeGreaterThan(1000);
    expect(container.querySelectorAll(".map-river")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Diyarbakir" }).querySelector("image")?.getAttribute("href")).toBe("/diyarbakir-city.png");
    expect(screen.getByRole("button", { name: "Diyarbakir hinterland" })).toBeTruthy();
  });

  it("shows a printed population and separate live Control and Support counters, including empty slots", () => {
    const { container } = render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    const city = container.querySelector("[data-info='diyarbakir-city']");
    expect(city?.querySelector("[aria-label='Population 2']")?.textContent).toBe("2");
    expect(city?.querySelector("[aria-label='State Control']")).not.toBeNull();
    const botan = container.querySelector("[data-info='botan']");
    expect(botan?.querySelector("[aria-label='No Control']")).not.toBeNull();
    expect(botan?.querySelector("[aria-label='Passive Opposition']")?.textContent).toContain("×1");
    const rural = container.querySelector("[data-info='diyarbakir-rural']");
    expect(rural?.querySelector("[aria-label='Neutral']")).not.toBeNull();
  });

  it("renders the same atlas for a saved view while keeping all legal links unchanged", () => {
    const before = JSON.stringify(view);
    const { container } = render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    expect(container.querySelectorAll("[data-info]")).toHaveLength(18);
    expect(JSON.stringify(view)).toBe(before);
    expect(view.links.some(l => [l.a, l.b].includes("mardin-batman") && [l.a, l.b].includes("kdp-zone"))).toBe(false);
  });
});

it.each([
  ["activeSupport", 2, "Active Support", "×2"],
  ["passiveSupport", 1, "Passive Support", "×1"],
  ["activeOpposition", -2, "Active Opposition", "×2"],
] as const)("updates live counters for %s and PKK Control", (levelName, level, label, multiplier) => {
  const changed = { ...view, spaces: view.spaces.map(s => s.id === "botan" ? { ...s, level, levelName, control: "pkk" } : s) };
  const { container } = render(<Board view={changed} selected={[]} onSelect={vi.fn()} />);
  const info = container.querySelector("[data-info='botan']");
  expect(info?.querySelector("[aria-label='PKK Control']")?.textContent).toBe("PKK");
  expect(info?.querySelector(`[aria-label='${label}']`)?.textContent).toContain(multiplier);
});

it("keeps the city and hinterland independently keyboard-selectable", () => {
  const select = vi.fn();
  render(<Board view={view} selected={[]} onSelect={select} />);
  fireEvent.keyDown(screen.getByRole("button", {name: "Diyarbakir"}), {key: "Enter"});
  fireEvent.keyDown(screen.getByRole("button", {name: "Diyarbakir hinterland"}), {key: "Enter",shiftKey: true});
  expect(select.mock.calls).toEqual([["diyarbakir-city",false],["diyarbakir-rural",true]]);
});

describe("approved readable layout", () => {
  it("keeps only Europe and Western Cities in the off-map column", () => {
    const {container} = render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    expect([...container.querySelectorAll("[data-callout]")].map(e=>e.getAttribute("data-info")).sort()).toEqual(["europe","western-cities"]);
    expect(container.querySelector("[data-geography='outside-play']")?.textContent).toContain("Malatya");
    expect(screen.getAllByRole("button")).toHaveLength(18);
  });

  it("highlights the exact rules neighbors without implying a city connection", () => {
    const {container} = render(<Board view={view} selected={["elazig"]} onSelect={vi.fn()} />);
    expect([...container.querySelectorAll(".map-space.neighbor")].map(e=>e.getAttribute("data-space")).sort()).toEqual(["bingol-mus","dersim","diyarbakir-rural"]);
    expect(container.querySelector(".map-space[data-space='diyarbakir-rural'] .atlas-outline")?.getAttribute("d")).not.toContain("A94");
    const city = container.querySelector("[data-space='diyarbakir-city'] image");
    expect(city?.getAttribute("opacity")).toBe("0.3");
  });

  it("shows compact resources with the full track available on expansion", () => {
    render(<TrackCard view={view} />);
    const card = screen.getByLabelText("Resources and politics");
    expect(card.querySelectorAll("details")).toHaveLength(6);
    expect(card.querySelector("[aria-label='Emergency Rule'] summary")?.textContent).toContain("Martial Law");
    expect(card.querySelector("[aria-label='State Resources'] summary")?.textContent).toContain("12");
    expect(card.querySelector("[aria-label='Legitimacy'] .mini-track")?.children).toHaveLength(21);
  });
});
