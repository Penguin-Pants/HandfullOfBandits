// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import { emptyPlans } from "../faction/plan.ts";
import { EventPanel } from "../event/EventPanel.tsx";

// One card on the table: the current card face up in the event panel; no deck and no repeat.
afterEach(cleanup);

const panel = (state: ReturnType<typeof turnOf>) => (
  <EventPanel api={mockApi()} sessionId="S" view={boardView(kurdish.ruleset, kurdish.data, state)} faction="pkk" eventOpen onCommit={vi.fn()} forms={[]} plan={emptyPlans.event} dispatch={vi.fn()} />
);

describe("current card", () => {
  it("shows the current card face up once, with its ID, type, title and both sides", () => {
    render(panel(withCard(turnOf("pkk"), "DK-001")));
    const face = screen.getByLabelText("Current card DK-001");
    expect(face.textContent).toContain("Eruh");
    expect(screen.getAllByText(/Eruh/)).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Execute unshaded" })).toBeTruthy();
    expect(screen.queryByText(/Card presentation|cards left|Deck/)).toBeNull();
  });

  it("shows no card before the first card is revealed", () => {
    const state = turnOf("pkk");
    const { container } = render(panel({ ...state, deck: { ...state.deck, currentCard: null } }));
    expect(container.textContent).toBe("");
  });
});
