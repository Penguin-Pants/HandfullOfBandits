// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CategoryRow, NoteInput } from "../api.ts";
import { HistoryDrawer } from "../history/HistoryDrawer.tsx";
import { defaultAnchor, hashCategories } from "./anchor.ts";
import { EndSession } from "./EndSession.tsx";
import { NoteBar } from "./NoteBar.tsx";

// P2-16: anchors (T-ANN-01, T-ANN-02 UI part), note bar (T-UI-02), End session (T-UI-06), history.
afterEach(cleanup);
const categories: CategoryRow[] = [
  { category_id: "balance", label: "Balance concern", hotkey: "Alt+1", color: null, sort: 1, active: 1 },
  { category_id: "rule-ambiguity", label: "Rule ambiguity", hotkey: "Alt+2", color: null, sort: 2, active: 1 },
];
const focus = (): NoteInput["focus"] => ({ panel: "board", selectedSpace: "botan", selectedPieces: [], hoveredActionId: null });
const plan = { type: "ChooseOperation", faction: "pkk", box: "limitedOp", plan: {} };

describe("defaultAnchor", () => {
  it("anchors to the last action for 20 seconds (T-ANN-01), then to a drafted plan (T-ANN-02), a state or the session", () => {
    const base = { lastActionId: "S-A3", lastActionAt: 1000, draft: null, selectedSpace: null };
    expect(defaultAnchor({ ...base, now: 21_000 })).toEqual({ anchor: "executed", actionId: "S-A3" });
    expect(defaultAnchor({ ...base, now: 21_001, draft: plan })).toEqual({ anchor: "proposed", actionId: null, proposed: plan });
    expect(defaultAnchor({ ...base, now: 99_000, selectedSpace: "botan" })).toEqual({ anchor: "state", actionId: null });
    expect(defaultAnchor({ ...base, now: 99_000 })).toEqual({ anchor: "session", actionId: null });
  });

  it("reads #category tags", () => {
    expect(hashCategories("too strong #balance #nope", ["balance"])).toEqual(["balance"]);
  });
});

describe("NoteBar (T-UI-02)", () => {
  it("N opens it, Alt+2 and #tags add categories, Enter saves with the frozen anchor and focus", async () => {
    const onSave = vi.fn(() => Promise.resolve("N1"));
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "executed", actionId: "S-A3" })} focus={focus} onSave={onSave} />);
    fireEvent.keyDown(window, { key: "n" });
    const box = screen.getByLabelText("Note text");
    expect(screen.getByText("Note on: executed (S-A3)")).toBeTruthy();
    fireEvent.change(box, { target: { value: "Cheap Rally #balance" } });
    fireEvent.keyDown(box, { key: "2", altKey: true });
    fireEvent.keyDown(box, { key: "Enter" });
    await waitFor(() => { expect(onSave).toHaveBeenCalledWith({ anchor: "executed", actionId: "S-A3", text: "Cheap Rally #balance", categoryIds: ["rule-ambiguity", "balance"], focus: focus() }); });
    expect(await screen.findByText("Saved, linked to S-A3")).toBeTruthy();
  });

  it("Tab through all anchors and back keeps the executed action ID", () => {
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "executed", actionId: "S-A3" })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} />);
    fireEvent.keyDown(window, { key: "n" });
    const box = screen.getByLabelText("Note text");
    for (let i = 0; i < 4; i++) fireEvent.keyDown(box, { key: "Tab" });
    expect(screen.getByText("Note on: executed (S-A3)")).toBeTruthy();
  });

  it("Esc cancels without saving; keys typed elsewhere in a field do not open it", () => {
    const onSave = vi.fn(() => Promise.resolve("N1"));
    render(
      <>
        <input aria-label="plan field" />
        <NoteBar categories={categories} anchor={() => ({ anchor: "session", actionId: null })} focus={focus} onSave={onSave} />
      </>,
    );
    fireEvent.keyDown(screen.getByLabelText("plan field"), { key: "n" });
    expect(screen.getByText("Press N for a note")).toBeTruthy();
    fireEvent.keyDown(window, { key: "N" });
    const box = screen.getByLabelText("Note text");
    fireEvent.change(box, { target: { value: "x" } });
    fireEvent.keyDown(box, { key: "Escape" });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Press N for a note")).toBeTruthy();
  });

  it("sends the drafted plan with a proposed note", async () => {
    const onSave = vi.fn(() => Promise.resolve("N2"));
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "proposed", actionId: null, proposed: plan })} focus={focus} onSave={onSave} />);
    fireEvent.keyDown(window, { key: "n" });
    const box = screen.getByLabelText("Note text");
    fireEvent.change(box, { target: { value: "Why is this illegal?" } });
    fireEvent.keyDown(box, { key: "Enter" });
    await waitFor(() => { expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ anchor: "proposed", proposed: plan })); });
  });
});

describe("EndSession (T-UI-06)", () => {
  it("saves one debrief, or none on Skip", () => {
    const onEnd = vi.fn();
    render(<EndSession onEnd={onEnd} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip and end" }));
    expect(onEnd).toHaveBeenLastCalledWith(null);
    fireEvent.change(screen.getByLabelText("Debrief"), { target: { value: "S0 felt short." } });
    fireEvent.click(screen.getByRole("button", { name: "Save debrief and end" }));
    expect(onEnd).toHaveBeenLastCalledWith("S0 felt short.");
  });
});

describe("HistoryDrawer", () => {
  it("lists actions with entry text and note counts, undone struck through", () => {
    const action = { action_id: "S-A2", summary: "Pass by pkk", status: "undone" } as never;
    render(<HistoryDrawer items={[{ action, entries: [{ entry_id: "S-A2-E2", kind: "EffectApplied", text: "adjustTrack: delta 1." } as never], notes: 2 }]} />);
    expect(screen.getByText("adjustTrack: delta 1.")).toBeTruthy();
    expect(screen.getByText(/2 notes/)).toBeTruthy();
    expect(screen.getByText("S-A2").closest("li")?.getAttribute("style")).toMatch(/line-through/);
  });
});
