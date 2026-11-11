// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { boardView } from "../../server/view.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { turnOf } from "../../../test/board.ts";
import { MapCanvas } from "./MapCanvas.tsx";
import { Board, SpaceDetail } from "./Board.tsx";
const view = boardView(kurdish.ruleset,kurdish.data,turnOf("pkk"));
afterEach(cleanup);
describe("map navigation and layers", () => {
  it("zooms, pans with arrow keys and restores the exact fit camera", () => {
    render(<MapCanvas view={view} selected={[]} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("button",{name:"Fit map"}));
    const board=screen.getByRole("img",{name:"Board"});
    const initial=board.getAttribute("viewBox");
    fireEvent.click(screen.getByRole("button",{name:"Zoom in"}));
    expect(board.getAttribute("viewBox")).not.toBe(initial);
    expect(screen.getByLabelText("Map zoom").textContent).toBe("125%");
    const zoomed=board.getAttribute("viewBox");
    fireEvent.keyDown(board,{key:"ArrowRight"});
    expect(board.getAttribute("viewBox")).not.toBe(zoomed);
    fireEvent.click(screen.getByRole("button",{name:"Fit map"}));
    expect(board.getAttribute("viewBox")).toBe(initial);
  });
  it("preserves selection access in every display mode and sends only supplied candidate IDs", () => {
    const select=vi.fn();
    render(<MapCanvas view={view} selected={[]} onSelect={select} eligible={["botan"]} />);
    for (const mode of ["Full","Forces","Political","Terrain"]) {
      fireEvent.click(screen.getByRole("button",{name:mode}));
      expect(screen.getByRole("img",{name:"Board"}).classList.contains(`mode-${mode.toLowerCase()}`)).toBe(true);
      expect(screen.getByRole("meter", {name:"Europe track"})).toBeTruthy();
      fireEvent.keyDown(screen.getByRole("button",{name:"Hakkari"}),{key:" "});
    }
    expect(select).toHaveBeenCalledTimes(4);
    expect(screen.getByRole("button",{name:"Botan"}).classList.contains("eligible")).toBe(true);
    expect(screen.getByRole("button",{name:"Hakkari"}).classList.contains("ineligible")).toBe(true);
  });
  it("finds a space by name and keeps the city independently selectable", () => {
    const select=vi.fn();
    const {container}=render(<MapCanvas view={view} selected={[]} onSelect={select} />);
    fireEvent.change(screen.getByLabelText("Find space"),{target:{value:"diyarbakir-city"}});
    expect(select).toHaveBeenCalledWith("diyarbakir-city",false);
    const rail=container.querySelector('.map-space[data-space="diyarbakir-city"]');
    if(rail === null) throw new Error("city space");
    fireEvent.click(rail,{shiftKey:true});
    expect(select).toHaveBeenLastCalledWith("diyarbakir-city",true);
  });
  it("retains complete dense contents in inspection while showing explicit overflow without scaling", () => {
    const original=view.spaces.find(s=>s.id === "botan");
    if(original === undefined) throw new Error("botan");
    const dense={...original,markers:Array.from({length:9},(_,i)=>({marker:`test${String(i)}`,count:i+1,hidden:false,side:"old"}))};
    const {container}=render(<><Board view={{...view,spaces:view.spaces.map(s=>s.id === dense.id ? dense : s)}} selected={[]} onSelect={vi.fn()} /><SpaceDetail space={dense} /></>);
    expect(container.querySelector('[data-info="botan"] .atlas-overflow')).not.toBeNull();
    expect(container.querySelector('[data-info="botan"] [transform*="scale"]')).toBeNull();
    for(const m of dense.markers) expect(screen.getByLabelText("Botan detail").textContent).toContain(`Test ${m.marker.slice(4)} (Old)`);
  });
});

it("distinguishes troops and police with letters as well as shade", () => {
  render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
  expect(screen.getAllByLabelText("troops default 2")[0]?.textContent).toContain("T");
  expect(screen.getAllByLabelText("police default 1")[0]?.textContent).toContain("P");
});

it("canceled Alt-pan does not discard the next valid space selection", () => {
  const select=vi.fn();
  render(<Board view={view} selected={[]} onSelect={select} onPan={vi.fn()} />);
  const board=screen.getByRole("img",{name:"Board"});
  const capture=vi.fn();
  Object.defineProperty(board,"setPointerCapture",{value:capture});
  fireEvent.pointerDown(board,{button:0,altKey:true,pointerId:1});
  expect(capture).toHaveBeenCalled();
  fireEvent.pointerCancel(board,{pointerId:1});
  fireEvent.click(screen.getByRole("button",{name:"Hakkari"}));
  expect(select).toHaveBeenCalledWith("hakkari",false);
});

it("keeps the Western Cities hit area and selection outline outside the country clip", () => {
  render(<Board view={view} selected={["western-cities"]} onSelect={vi.fn()} />);
  const area=screen.getByRole("button",{name:"Western Cities"});
  expect(area.querySelector(".atlas-area")?.getAttribute("clip-path")).toBeNull();
  expect(area.querySelector('[stroke-width="4"]')?.getAttribute("clip-path")).toBeNull();
});

it("finds the Europe track without adding it to an operation plan", () => {
  const select = vi.fn();
  render(<MapCanvas view={view} selected={[]} onSelect={select} />);
  expect(screen.getByRole("option", { name: "Europe track" })).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Find space"), { target: { value: "europe" } });
  expect(select).not.toHaveBeenCalled();
  fireEvent.focus(screen.getByRole("meter", { name: "Europe track" }));
  expect(select).not.toHaveBeenCalled();
});

describe("wheel zoom and drag pan", () => {
  const readout = (): string | null => screen.getByLabelText("Map zoom").textContent;
  const withCapture = (board: Element): void => {
    Object.defineProperty(board, "setPointerCapture", { value: vi.fn(), configurable: true });
    Object.defineProperty(board, "releasePointerCapture", { value: vi.fn(), configurable: true });
  };
  it("zooms in steps with the wheel and stops the page from scrolling", () => {
    render(<MapCanvas view={view} selected={[]} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit map" }));
    const board = screen.getByRole("img", { name: "Board" });
    expect(fireEvent.wheel(board, { deltaY: -100 })).toBe(false);
    expect(readout()).toBe("125%");
    expect(fireEvent.wheel(board, { deltaY: 100 })).toBe(false);
    expect(readout()).toBe("100%");
  });
  it("clamps wheel zoom between 100% and 400%", () => {
    render(<MapCanvas view={view} selected={[]} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit map" }));
    const board = screen.getByRole("img", { name: "Board" });
    fireEvent.wheel(board, { deltaY: 100 });
    expect(readout()).toBe("100%");
    for (let i = 0; i < 20; i++) fireEvent.wheel(board, { deltaY: -100 });
    expect(readout()).toBe("400%");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Zoom in" }).disabled).toBe(true);
  });
  it("pans with a primary-button drag on the background without selecting a space", () => {
    const select = vi.fn();
    render(<MapCanvas view={view} selected={[]} onSelect={select} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit map" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const board = screen.getByRole("img", { name: "Board" });
    withCapture(board);
    const before = board.getAttribute("viewBox");
    fireEvent.pointerDown(board, { button: 0, pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(board, { pointerId: 1, clientX: 140, clientY: 120 });
    fireEvent.pointerUp(board, { button: 0, pointerId: 1, clientX: 140, clientY: 120 });
    fireEvent.click(board);
    expect(board.getAttribute("viewBox")).not.toBe(before);
    expect(select).not.toHaveBeenCalled();
  });
  it("pans with a middle-button drag that starts on a space", () => {
    const onDrag = vi.fn();
    render(<MapCanvas view={view} selected={[]} onSelect={vi.fn()} onDrag={onDrag} />);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const board = screen.getByRole("img", { name: "Board" });
    withCapture(board);
    const before = board.getAttribute("viewBox");
    fireEvent.pointerDown(screen.getByRole("button", { name: "Hakkari" }), { button: 1, pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(board, { pointerId: 1, clientX: 60, clientY: 100 });
    fireEvent.pointerUp(screen.getByRole("button", { name: "Botan" }), { button: 1, pointerId: 1 });
    expect(board.getAttribute("viewBox")).not.toBe(before);
    expect(onDrag).not.toHaveBeenCalled();
  });
  it("keeps drag-to-plan for a primary-button drag that starts on a space", () => {
    const onDrag = vi.fn();
    render(<MapCanvas view={view} selected={[]} onSelect={vi.fn()} onDrag={onDrag} />);
    const board = screen.getByRole("img", { name: "Board" });
    withCapture(board);
    const before = board.getAttribute("viewBox");
    fireEvent.pointerDown(screen.getByRole("button", { name: "Hakkari" }), { button: 0, pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(board, { pointerId: 1, clientX: 160, clientY: 100 });
    fireEvent.pointerUp(screen.getByRole("button", { name: "Botan" }), { button: 0, pointerId: 1 });
    expect(onDrag).toHaveBeenCalledWith("hakkari", "botan");
    expect(board.getAttribute("viewBox")).toBe(before);
  });
  it("keeps the map inside the view when panning at a low zoom", () => {
    render(<MapCanvas view={view} selected={[]} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Fit map" }));
    const board = screen.getByRole("img", { name: "Board" });
    const fit = board.getAttribute("viewBox");
    for (let i = 0; i < 40; i++) fireEvent.keyDown(board, { key: "ArrowRight" });
    expect(board.getAttribute("viewBox")).toBe(fit);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    for (let i = 0; i < 80; i++) fireEvent.keyDown(board, { key: "ArrowRight" });
    const [x = 0, , w = 0] = (board.getAttribute("viewBox") ?? "").split(" ").map(Number);
    expect(x + w).toBeLessThanOrEqual(1280.001);
  });
});
