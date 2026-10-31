// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf, withCard } from "../../../test/board.ts";
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

  it("forces bar shows counts and opens the full tables", async () => {
    await render1();
    expect(screen.queryByLabelText("State forces")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Show forces table/ }));
    expect(screen.getByLabelText("State forces")).toBeTruthy();
  });
});
