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

describe("Review P4-01 (07 s7)", () => {
  afterEach(() => { localStorage.clear(); });

  it("sends the ruleset version filter and shows the ruleset column", async () => {
    const review = vi.fn(() => Promise.resolve([row]));
    render(<Review api={mockApi({ review })} onOpenState={vi.fn()} />);
    expect(await screen.findByRole("cell", { name: "R1" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("rulesetVersion"), { target: { value: "R1" } });
    await waitFor(() => { expect(review).toHaveBeenLastCalledWith({ rulesetVersion: "R1" }); });
  });

  it("sets the status of the selected notes, then reloads", async () => {
    const second = { ...row, annotationId: "N2", text: "Second" };
    const review = vi.fn(() => Promise.resolve([row, second]));
    const setNoteStatus = vi.fn(() => Promise.resolve({ updated: 2 }));
    render(<Review api={mockApi({ review, setNoteStatus })} onOpenState={vi.fn()} />);
    const mark = await screen.findByRole<HTMLButtonElement>("button", { name: "Mark addressed" });
    expect(mark.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Second" }));
    fireEvent.click(mark);
    await waitFor(() => { expect(setNoteStatus).toHaveBeenCalledWith(["N1"], "addressed"); });
    await waitFor(() => { expect(review).toHaveBeenCalledTimes(2); });
  });

  it("saves a named filter in the browser, applies it after a reload and deletes it", async () => {
    const review = vi.fn(() => Promise.resolve([row]));
    const first = render(<Review api={mockApi({ review })} onOpenState={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("status"), { target: { value: "open" } });
    fireEvent.change(screen.getByLabelText("Filter name"), { target: { value: "Open notes" } });
    fireEvent.click(screen.getByRole("button", { name: "Save filter" }));
    first.unmount();
    render(<Review api={mockApi({ review })} onOpenState={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open notes" }));
    await waitFor(() => { expect(review).toHaveBeenLastCalledWith({ status: "open" }); });
    expect(screen.getByLabelText<HTMLInputElement>("status").value).toBe("open");
    fireEvent.click(screen.getByRole("button", { name: "Delete Open notes" }));
    expect(screen.queryByRole("button", { name: "Open notes" })).toBeNull();
    expect(localStorage.getItem("hob.review.savedFilters")).toBe("{}");
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
