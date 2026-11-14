// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setMarkers, turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import type { Head, LegalChoices, SessionRow } from "../api.ts";
import { Play } from "./Play.tsx";

// T-UI-04: Undo restores the board and the faction panel.
afterEach(cleanup);

function head(id: string, card: string, acting: "state" | "pkk"): Head {
  const state = withCard(turnOf(acting), card);
  return { actionId: id, stateHash: id, state, derived: null as never, view: boardView(kurdish.ruleset, kurdish.data, state) };
}
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
    render(<Play api={mockApi({ session, legal, undo })} sessionId="S" />);
    expect(await screen.findByText(/DK-012/, { selector: "span" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /^State (First|Second) Eligible/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Undo (Ctrl+Z)" }));
    await waitFor(() => { expect(undo).toHaveBeenCalledWith("S", "S-A3", "S-A3"); });
    expect(await screen.findByText(/DK-001/, { selector: "span" })).toBeTruthy();
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
    await screen.findByText(/DK-012/, { selector: "span" });
    fireEvent.click(screen.getByRole("button", { name: "History (H)" }));
    // Neither a pending action (open Operation) nor the head (S-A3) offers a branch.
    expect(screen.getAllByRole("button", { name: "Branch from here" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Branch from here" }));
    await waitFor(() => { expect(branch).toHaveBeenCalledWith("S", "S-A2", "S-A3", "S-A3"); });
    expect(await screen.findByText(/DK-001/, { selector: "span" })).toBeTruthy();
  });
});

describe("Play rule text (P4-08)", () => {
  it("looks up the research text of a Last action line for the session", async () => {
    const h = head("S-A3", "DK-012", "state");
    const entry = { entry_id: "E1", action_id: "S-A3", n: 1, kind: "ControlChanged", state_seq: 1, rule_ref: "06 s3.2", assumption_ref: null, data: JSON.stringify({ space: "botan", before: null, after: "pkk" }), text: "", cause: null, cardTitle: null };
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
    const button = await screen.findByRole("button", { name: "Fullscreen" });
    button.focus();
    fireEvent.keyDown(button, { key: " " });
    fireEvent.click(button);
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
    await screen.findByText(/DK-012/, { selector: "span" });
  };

  it("Key shows and hides the legend", async () => {
    await render1();
    expect(screen.queryByLabelText("Legend")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Key" }));
    expect(screen.getByLabelText("Legend")).toBeTruthy();
  });

  it("places game status in the sidebar and keeps navigation available", async () => {
    const onExit = vi.fn();
    const onReview = vi.fn();
    const h = head("S-A3", "DK-012", "state");
    render(<Play api={mockApi({ session: () => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h }), legal: () => Promise.resolve(legalFor("state")) })} sessionId="S" onExit={onExit} onReview={onReview} />);
    const status = await screen.findByLabelText("Status");
    expect(status.closest("aside")).toBe(screen.getByRole("complementary", { name: "Side panel" }));
    expect(screen.getByRole("heading", { name: "Game status" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: "Feedback review" }));
    expect(onExit).toHaveBeenCalledOnce();
    expect(onReview).toHaveBeenCalledOnce();
    expect(screen.queryByLabelText("Scores")).toBeNull();
  });

  it("M hides the status bar, side panel and forces bar, and shows them again", async () => {
    await render1();
    expect(screen.getByLabelText("Forces")).toBeTruthy();
    fireEvent.keyDown(window, { key: "m" });
    expect(screen.queryByLabelText("Status")).toBeNull();
    expect(screen.queryByLabelText("Forces")).toBeNull();
    expect(screen.queryByRole("complementary", { name: "Side panel" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show panels (M)" }));
    expect(screen.getByLabelText("Status")).toBeTruthy();
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
    await waitFor(() => { expect(screen.queryByLabelText("Status")).toBeNull(); });
  });

  it("hides actions without losing status, resources, forces, selection or the camera", async () => {
    await render1();
    fireEvent.change(screen.getByLabelText("Find space"), { target: { value: "botan" } });
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Political" }));
    const camera = screen.getByRole("img", { name: "Board" }).getAttribute("viewBox");
    const action = screen.getByRole("button", { name: "Clear (Esc)" });
    action.focus();
    fireEvent.click(screen.getByRole("button", { name: "Hide actions" }));
    const restore = screen.getByRole("button", { name: "Show actions" });
    expect(document.activeElement).toBe(restore);
    expect(restore.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("button", { name: "Clear (Esc)" })).toBeNull();
    for (const label of ["Status", "Resources and politics", "Forces"]) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Botan" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("img", { name: "Board" }).getAttribute("viewBox")).toBe(camera);
    fireEvent.click(restore);
    expect(screen.getByRole("button", { name: "Hide actions" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Clear (Esc)" })).toBe(action);
    fireEvent.click(screen.getByRole("button", { name: "Hide actions" }));
    fireEvent.keyDown(window, { key: "m" });
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show panels (M)" }));
    expect(screen.getByRole("button", { name: "Show actions" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show actions" }));
    expect(screen.getByRole("button", { name: "Clear (Esc)" })).toBe(action);
  });

  it("forces bar shows counts and opens the full tables", async () => {
    await render1();
    expect(screen.queryByLabelText("State forces")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Show forces table/ }));
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
    const state = setMarkers(withCard(turnOf("state"), "DK-012"), "botan", "covert", 1);
    const h: Head = { actionId: "S-A3", stateHash: "S-A3", state, derived: null as never, view: boardView(kurdish.ruleset, kurdish.data, state) };
    const api = mockApi({ session: vi.fn(() => Promise.resolve({ session: { name: "t", status: "active" } as SessionRow, head: h })), legal: vi.fn(() => Promise.resolve(legalFor("state"))) });
    render(<Play api={api} sessionId="S" />);
    await screen.findByText(/DK-012/, { selector: "span" });
    fireEvent.click(screen.getByRole("button", { name: "Key" }));
    fireEvent.change(screen.getByLabelText("Find space"), { target: { value: "botan" } });
    const botanText = (): string => [...document.querySelectorAll("title")].find((t) => t.textContent.startsWith("Botan\n"))?.textContent ?? "";
    const covert = (): number => document.querySelectorAll("[aria-label^='Covert (face down)']").length;
    expect(covert()).toBeGreaterThan(0);
    expect(screen.getByLabelText("Legend").textContent).toContain("Covert (face down)");
    expect(botanText()).toContain("• 1 Covert (face down)");
    const toggle = screen.getByRole("button", { name: "Hide Covert" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(covert()).toBe(0);
    expect(screen.getByLabelText("Legend").textContent).not.toContain("Covert");
    expect(botanText()).toContain("Pieces:");
    expect(botanText()).not.toContain("Covert");
    expect(screen.queryByLabelText("Botan detail")).toBeNull();
    fireEvent.click(toggle);
    expect(covert()).toBeGreaterThan(0);
  });
});
