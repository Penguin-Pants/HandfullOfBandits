// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import type { ReviewRow } from "../api.ts";
import { StateViewer } from "../state-viewer/StateViewer.tsx";
import { Review } from "./Review.tsx";

// P2-17 component tests: review table with filters, read-only state viewer with before and after.
afterEach(cleanup);
const row: ReviewRow = { annotationId: "N1", sessionId: "S", sessionName: "s0 try", createdAt: "2026-10-28T10:00:00Z", anchor: "executed", actionId: "S-A3", stateHash: "h2", categories: [], text: "Odd move", status: "open", faction: "pkk", cardId: "DK-001", version: "0.1.0", rulesetVersion: "R1", spaces: ["botan"] };

describe("Review", () => {
  it("lists notes, sends filters and opens a note's state", async () => {
    const review = vi.fn(() => Promise.resolve([row]));
    const onOpenState = vi.fn();
    render(<Review api={mockApi({ review })} onOpenState={onOpenState} />);
    fireEvent.click(await screen.findByRole("button", { name: "Odd move" }));
    expect(onOpenState).toHaveBeenCalledWith("S", "h2");
    fireEvent.change(screen.getByLabelText("space"), { target: { value: "botan" } });
    await waitFor(() => { expect(review).toHaveBeenLastCalledWith({ space: "botan" }); });
  });
});

describe("StateViewer", () => {
  it("shows the after state, then the before state on toggle, read only", async () => {
    const before = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));
    const after = { ...before, status: { ...before.status, cardIndex: 2 } };
    const stateView = vi.fn((_id: string, hash: string) => Promise.resolve(hash === "h1" ? before : after));
    render(<StateViewer api={mockApi({ stateView })} sessionId="S" before="h1" after="h2" onBack={vi.fn()} />);
    expect(await screen.findByText("Card 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Before" }));
    expect(await screen.findByText("Card 0")).toBeTruthy();
    expect(screen.getByText("Read only")).toBeTruthy();
  });
});
