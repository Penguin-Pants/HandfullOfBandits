// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { CardTable } from "./CardTable.tsx";

// Card table: deck face down with its count; the current card face up beside it.
afterEach(cleanup);

describe("CardTable", () => {
  it("in setup shows the deck as the reveal button and an empty card slot", () => {
    const view = boardView(kurdish.ruleset, kurdish.data, { ...turnOf("pkk"), deck: { ...turnOf("pkk").deck, currentCard: null } });
    const onReveal = vi.fn();
    render(<CardTable view={view} onReveal={onReveal} />);
    expect(screen.getByText("No card yet")).toBeTruthy();
    expect(screen.getByText(`${String(view.status.deckCount)} cards left`)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reveal first card (Space)" }));
    expect(onReveal).toHaveBeenCalled();
  });

  it("shows the current card face up and the deck without a button", () => {
    const view = boardView(kurdish.ruleset, kurdish.data, withCard(turnOf("pkk"), "DK-001"));
    render(<CardTable view={view} onReveal={null} />);
    expect(screen.getByLabelText("Current card DK-001").textContent).toContain("Eruh");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
