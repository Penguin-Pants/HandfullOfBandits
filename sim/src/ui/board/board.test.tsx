// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { Forces } from "../status/Forces.tsx";
import { StatusBar } from "../status/StatusBar.tsx";
import { setPieces } from "../../../test/board.ts";
import { changedSpaces } from "../play/Play.tsx";
import { Board, Legend, SpaceDetail } from "./Board.tsx";
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
    expect(screen.getByText(/Level: passiveOpposition/)).toBeTruthy();
    expect(screen.getByText(/score 21\/49 \(-28\)/)).toBeTruthy();
  });
});

describe("map geometry", () => {
  it("gives every located space a cell that holds its own point; Western Cities and Europe go in the inset", () => {
    const cells = regionCells(view.spaces);
    for (const s of view.spaces) {
      const cell = cells.domestic.get(s.id) ?? cells.external.get(s.id);
      if (isInset(s)) {
        expect(cell).toBeUndefined();
        continue;
      }
      expect(cell?.length ?? 0).toBeGreaterThanOrEqual(3);
      const xs = (cell ?? []).map((p) => p[0]);
      const ys = (cell ?? []).map((p) => p[1]);
      expect(s.x).toBeGreaterThanOrEqual(Math.min(...xs));
      expect(s.x).toBeLessThanOrEqual(Math.max(...xs));
      expect(s.y).toBeGreaterThanOrEqual(Math.min(...ys));
      expect(s.y).toBeLessThanOrEqual(Math.max(...ys));
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
    expect(screen.getByRole("button", { name: "Dersim" }).querySelectorAll("path")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Botan" }).querySelectorAll("path")).toHaveLength(1);
  });

  it("shows a legend entry for each piece on the board", () => {
    render(<Legend view={view} />);
    expect(screen.getByLabelText("Legend").textContent).toMatch(/guerrilla \(underground\)/);
  });
});

describe("victory track and forces", () => {
  it("places each faction marker at its score and flags its threshold", () => {
    render(<StatusBar view={view} />);
    expect(screen.getByLabelText("State score 21")).toBeTruthy();
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
