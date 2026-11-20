// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setMarkers, turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { menu, menuChecked } from "../../../test/ui/menu.ts";
import type { HistoryItem } from "../api.ts";
import { boardView } from "../../server/view.ts";
import type { Head, LegalChoices, SessionRow } from "../api.ts";
import { Play } from "./Play.tsx";

// T-UI-04: Undo restores the board and the faction panel.
afterEach(cleanup);

function head(id: string, card: string, acting: "state" | "pkk"): Head {
  const state = withCard(turnOf(acting), card);
  return { actionId: id, stateHash: id, state, derived: null as never, view: boardView(kurdish.ruleset, kurdish.data, state) };
}
/** One committed card action, so Undo has something to undo. */
const played = (): Promise<HistoryItem[]> => Promise.resolve([{ action: { action_id: "S-A3", summary: "Pass by state", status: "committed", faction: "state", box: "pass", phase: "card" }, entries: [], notes: 0 }] as never);
const legalFor = (faction: string): LegalChoices => ({ faction, phase: "card", first: true, boxes: [{ box: "pass", allowed: true, reason: null }], actions: [] });

describe("Play undo (T-UI-04)", () => {
  it("asks to confirm, calls undo with the head, and reloads the restored board and panel", async () => {
    const heads = [head("S-A3", "DK-012", "state"), head("S-A2", "DK-001", "pkk")];
    let n = 0;
    const session = vi.fn(() => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: heads[Math.min(n, 1)] as Head }));
    const legal = vi.fn(() => Promise.resolve(legalFor(n === 0 ? "state" : "pkk")));
    const undo = vi.fn(() => {
      n = 1;
      return Promise.resolve({ undone: "S-A3", head: "S-A2", undoneAfterRandom: false });
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, legal, undo, history: played })} sessionId="S" />);
    expect(await screen.findByLabelText("Current card DK-012")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /^State (First|Second) Eligible/ })).toBeTruthy();
    menu("Game", "Undo");
    await waitFor(() => { expect(undo).toHaveBeenCalledWith("S", "S-A3", "S-A3"); });
    expect(await screen.findByLabelText("Current card DK-001")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /^PKK (First|Second) Eligible/ })).toBeTruthy();
  });
});

describe("Play branch (P4-04)", () => {
  it("branches from a History action after a confirm and reloads that action's board", async () => {
    const heads = [head("S-A3", "DK-012", "state"), head("S-A2", "DK-001", "pkk")];
    let n = 0;
    const session = vi.fn(() => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: heads[n] as Head }));
    const legal = vi.fn(() => Promise.resolve(legalFor(n === 0 ? "state" : "pkk")));
    const action = (id: string, status: string) => ({ action: { action_id: id, summary: "Pass by pkk", status, faction: "pkk", box: "pass", phase: "card" }, entries: [], notes: 0 }) as never;
    const history = vi.fn(() => Promise.resolve([action("S-A2", "committed"), action("S-A9", "pending"), action("S-A3", "committed")]));
    const branch = vi.fn(() => {
      n = 1;
      return Promise.resolve({ branchId: "B2", head: heads[1] as Head });
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, legal, history, branch })} sessionId="S" />);
    await screen.findByLabelText("Current card DK-012");
    menu("Game", "History");
    // Neither a pending action (open Operation) nor the head (S-A3) offers a branch.
    expect(screen.getAllByRole("button", { name: "Branch from here" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Branch from here" }));
    await waitFor(() => { expect(branch).toHaveBeenCalledWith("S", "S-A2", "S-A3", "S-A3"); });
    expect(await screen.findByLabelText("Current card DK-001")).toBeTruthy();
  });
});

describe("Play rule text (P4-08)", () => {
  it("looks up the research text of a Last action line for the session", async () => {
    const h = head("S-A3", "DK-012", "state");
    const entry = { entry_id: "E1", action_id: "S-A3", n: 1, kind: "ControlChanged", state_seq: 1, rule_ref: "06 s3.2", assumption_ref: null, data: JSON.stringify({ space: "sirnak", before: null, after: "pkk" }), text: "", cause: null, cardTitle: null };
    const item = { action: { action_id: "S-A3", summary: "Pass by pkk", status: "committed", faction: "pkk", box: "pass", phase: "card" }, entries: [entry], notes: 0 } as never;
    const rule = vi.fn(() => Promise.resolve({ ref: "06 s3.2", sections: [{ cite: "06 s3.2", file: "06.md", section: "3.2", heading: "Cross-Border", text: "Pay 2 Resources.", subsections: [] }], missing: [], other: [] }));
    const api = mockApi({ session: vi.fn(() => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h })), legal: vi.fn(() => Promise.resolve(legalFor("state"))), history: vi.fn(() => Promise.resolve([item])), rule });
    render(<Play api={api} sessionId="S" />);
    const last = await screen.findByLabelText<HTMLDetailsElement>("Last action");
    expect(last.open).toBe(false);
    const summary = last.querySelector("summary");
    if (summary === null) throw new Error("Last action summary missing");
    fireEvent.click(summary);
    expect(last.open).toBe(true);
    fireEvent.click(await screen.findByRole("button", { name: "Rule text for 06 s3.2" }));
    expect(await screen.findByText("Pay 2 Resources.")).toBeTruthy();
    expect(rule).toHaveBeenCalledWith("S", "06 s3.2");
  });
});

it("activating fullscreen does not advance the turn", async () => {
  const h = head("S-A3", "DK-012", "state");
  const submit = vi.fn();
  const request = vi.fn(() => Promise.resolve());
  Object.defineProperty(document.documentElement, "requestFullscreen", { configurable: true, value: request });
  Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: true });
  try {
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h }), legal: () => Promise.resolve({ ...legalFor("state"), advance: true }), submit })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("menuitem", { name: "View" }));
    const item = screen.getByRole("menuitem", { name: "Fullscreen" });
    item.focus();
    fireEvent.keyDown(item, { key: " " });
    fireEvent.click(item);
    await waitFor(() => { expect(request).toHaveBeenCalledOnce(); });
    expect(submit).not.toHaveBeenCalled();
  } finally {
    Reflect.deleteProperty(document.documentElement, "requestFullscreen");
    Reflect.deleteProperty(document, "fullscreenEnabled");
  }
});

describe("Play map space (UC-4)", () => {
  const render1 = async (): Promise<void> => {
    const h = head("S-A3", "DK-012", "state");
    const api = mockApi({ session: vi.fn(() => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h })), legal: vi.fn(() => Promise.resolve(legalFor("state"))) });
    render(<Play api={api} sessionId="S" />);
    await screen.findByLabelText("Current card DK-012");
  };

  it("Key shows and hides the legend", async () => {
    await render1();
    expect(screen.queryByLabelText("Legend")).toBeNull();
    menu("View", "Key");
    expect(screen.getByLabelText("Legend")).toBeTruthy();
    expect(menuChecked("View", "Key")).toBe(true);
  });

  it("puts the status line in the menu bar and the screens in the Game menu", async () => {
    const onHome = vi.fn();
    const h = head("S-A3", "DK-012", "state");
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h }), legal: () => Promise.resolve(legalFor("state")) })} sessionId="S" screens={[{ label: "Home", onSelect: onHome }]} />);
    const status = await screen.findByLabelText("Status");
    expect(status.closest('[role="menubar"]')).not.toBeNull();
    expect(status.textContent).toMatch(/Card \d+ · DK-012/);
    menu("Game", "Home");
    expect(onHome).toHaveBeenCalledOnce();
    for (const top of ["Game", "View", "Map", "Help"]) expect(screen.getByRole("menuitem", { name: top })).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "Bot" })).toBeNull();
  });

  it("M hides the side panel and the forces, keeps the status line, and the View menu shows them again", async () => {
    await render1();
    expect(screen.getByLabelText("Forces")).toBeTruthy();
    fireEvent.keyDown(window, { key: "m" });
    expect(screen.getByLabelText("Status")).toBeTruthy();
    expect(screen.queryByLabelText("Forces")).toBeNull();
    expect(screen.queryByRole("complementary", { name: "Side panel" })).toBeNull();
    expect(menuChecked("View", "Map only")).toBe(true);
    menu("View", "Map only");
    expect(screen.getByRole("complementary", { name: "Side panel" })).toBeTruthy();
  });

  it("M works from the moment the loaded board is on screen", async () => {
    // Press M in the same tick as the commit that shows the board, before passive effects run.
    const pressed = new Promise<void>((resolve) => {
      const seen = new MutationObserver(() => {
        if (screen.queryByLabelText("Status") === null) return;
        seen.disconnect();
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "m" }));
        resolve();
      });
      seen.observe(document.body, { childList: true, subtree: true });
    });
    await render1();
    await pressed;
    await waitFor(() => { expect(screen.queryByRole("complementary", { name: "Side panel" })).toBeNull(); });
  });

  it("Map only keeps the selection, the camera and the action panel state", async () => {
    await render1();
    fireEvent.change(screen.getByLabelText("Find space"), { target: { value: "sirnak" } });
    menu("Map", "Zoom in");
    expect(screen.getByLabelText("Map zoom").textContent).not.toBe("100%");
    menu("Map", "Political");
    expect(screen.getByRole("img", { name: "Board" }).classList.contains("mode-political")).toBe(true);
    expect(menuChecked("Map", "Political")).toBe(true);
    const camera = screen.getByRole("img", { name: "Board" }).getAttribute("viewBox");
    const action = screen.getByRole("button", { name: "Clear (Esc)" });
    action.focus();
    fireEvent.keyDown(window, { key: "m" });
    expect(document.activeElement).not.toBe(action);
    for (const label of ["Status", "Resources and politics"]) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Şırnak" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("img", { name: "Board" }).getAttribute("viewBox")).toBe(camera);
    fireEvent.keyDown(window, { key: "m" });
    expect(screen.getByRole("button", { name: "Clear (Esc)" })).toBe(action);
    menu("Map", "Fit map");
    expect(screen.getByLabelText("Map zoom").textContent).toBe("100%");
  });

  it("forces bar shows counts and the View menu opens the full tables", async () => {
    await render1();
    expect(screen.queryByLabelText("State forces")).toBeNull();
    menu("View", "Forces table");
    expect(screen.getByLabelText("State forces")).toBeTruthy();
  });
});

it("opens a compact track without using Space to advance the game", async () => {
  const h = head("S-A3", "DK-012", "state");
  const submit = vi.fn(() => Promise.reject(new Error("Unexpected advance")));
  const api = mockApi({session: () => Promise.resolve({session: {name:"t",status:"active"} as SessionRow,head:h}),legal: () => Promise.resolve({...legalFor("state"),advance:true}),submit});
  render(<Play api={api} sessionId="S" />);
  await screen.findByLabelText("Resources and politics");
  const track = screen.getByLabelText("Legitimacy");
  const summary = track.querySelector("summary");
  if (summary === null) throw new Error("Track summary missing");
  fireEvent.keyDown(summary,{key:" "});
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(summary);
  expect((track as HTMLDetailsElement).open).toBe(true);
});

describe("Play hidden markers (P4-07)", () => {
  it("shows Covert markers by default and Hide Covert removes them from the map, legend and space hover text", async () => {
    const state = setMarkers(withCard(turnOf("state"), "DK-012"), "sirnak", "covert", 1);
    const h: Head = { actionId: "S-A3", stateHash: "S-A3", state, derived: null as never, view: boardView(kurdish.ruleset, kurdish.data, state) };
    const api = mockApi({ session: vi.fn(() => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h })), legal: vi.fn(() => Promise.resolve(legalFor("state"))) });
    render(<Play api={api} sessionId="S" />);
    await screen.findByLabelText("Current card DK-012");
    menu("View", "Key");
    fireEvent.change(screen.getByLabelText("Find space"), { target: { value: "sirnak" } });
    const botanText = (): string => { fireEvent.contextMenu(screen.getByRole("button", { name: "Şırnak" })); return screen.getByRole("tooltip").textContent; };
    const covert = (): number => document.querySelectorAll("[aria-label^='Covert (face down)']").length;
    expect(covert()).toBeGreaterThan(0);
    expect(screen.getByLabelText("Legend").textContent).toContain("Covert (face down)");
    expect(botanText()).toContain("1 Covert (face down)");
    expect(menuChecked("Map", "Hide Covert")).toBe(false);
    menu("Map", "Hide Covert");
    expect(menuChecked("Map", "Hide Covert")).toBe(true);
    expect(covert()).toBe(0);
    expect(screen.getByLabelText("Legend").textContent).not.toContain("Covert");
    expect(botanText()).toContain("Pieces");
    expect(botanText()).not.toContain("Covert");
    expect(screen.queryByLabelText("Şırnak detail")).toBeNull();
    menu("Map", "Hide Covert");
    expect(covert()).toBeGreaterThan(0);
  });
});

describe("Play first card and Undo (UI simplification)", () => {
  const setupHead = (): Head => {
    const state = turnOf("pkk");
    const s = { ...state, turn: { ...state.turn, phase: "setup" }, deck: { ...state.deck, currentCard: null } };
    return { actionId: "S-A1", stateHash: "S-A1", state: s, derived: null as never, view: boardView(kurdish.ruleset, kurdish.data, s) };
  };
  const setupItem = (id: string) => ({ action: { action_id: id, summary: "Setup", status: "committed", faction: null, box: null, phase: "setup" }, entries: [], notes: 0 }) as never;

  it("reveals the first card without a click, once per setup head", async () => {
    const submit = vi.fn(() => Promise.resolve({ actionId: "S-A2" }));
    const legal = vi.fn(() => Promise.resolve<LegalChoices>({ faction: null, phase: "setup", advance: true, violations: [] }));
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: setupHead() }), legal, submit: submit as never, history: () => Promise.resolve([setupItem("S-A1")]) })} sessionId="S" />);
    await waitFor(() => { expect(submit).toHaveBeenCalledWith("S", { type: "Advance" }, "S-A1", "S-A1"); });
    await waitFor(() => { expect(legal.mock.calls.length).toBeGreaterThan(1); });
    expect(submit).toHaveBeenCalledOnce();
  });

  it("offers a retry when the automatic reveal fails", async () => {
    const submit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ actionId: "S-A2" });
    const legal = () => Promise.resolve<LegalChoices>({ faction: null, phase: "setup", advance: true, violations: [] });
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: setupHead() }), legal, submit, history: () => Promise.resolve([setupItem("S-A1")]) })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("button", { name: "Retry the first card" }));
    await waitFor(() => { expect(submit).toHaveBeenCalledTimes(2); });
    expect(submit).toHaveBeenLastCalledWith("S", { type: "Advance" }, "S-A1", "S-A1");
  });

  it("does not reveal outside setup", async () => {
    const submit = vi.fn();
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: head("S-A3", "DK-012", "state") }), legal: () => Promise.resolve({ ...legalFor("state"), advance: true }), submit })} sessionId="S" />);
    await screen.findByLabelText("Current card DK-012");
    expect(submit).not.toHaveBeenCalled();
  });

  it("disables Undo and Ctrl+Z while only setup actions are committed", async () => {
    const undo = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: head("S-A2", "DK-012", "state") }), legal: () => Promise.resolve(legalFor("state")), undo, history: () => Promise.resolve([setupItem("S-A1"), setupItem("S-A2")]) })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Game" }));
    expect(screen.getByRole("menuitem", { name: "Undo" }).getAttribute("aria-disabled")).toBe("true");
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(confirm).not.toHaveBeenCalled();
    expect(undo).not.toHaveBeenCalled();
  });
});
