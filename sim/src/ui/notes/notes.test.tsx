// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CategoryRow, NoteInput } from "../api.ts";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
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
const focus = (): NoteInput["focus"] => ({ panel: "board", selectedSpace: "sirnak", selectedPieces: [], hoveredActionId: null });
const plan = { type: "ChooseOperation", faction: "pkk", box: "limitedOp", plan: {} };

describe("defaultAnchor", () => {
  it("anchors to the last action for 20 seconds (T-ANN-01), then to a drafted plan (T-ANN-02), a state or the session", () => {
    const base = { lastActionId: "S-A3", lastActionAt: 1000, draft: null, selectedSpace: null };
    expect(defaultAnchor({ ...base, now: 21_000 })).toEqual({ anchor: "executed", actionId: "S-A3" });
    expect(defaultAnchor({ ...base, now: 21_001, draft: plan })).toEqual({ anchor: "proposed", actionId: null, proposed: plan });
    expect(defaultAnchor({ ...base, now: 99_000, selectedSpace: "sirnak" })).toEqual({ anchor: "state", actionId: null });
    expect(defaultAnchor({ ...base, now: 99_000 })).toEqual({ anchor: "session", actionId: null });
  });

  it("reads #category tags", () => {
    expect(hashCategories("too strong #balance #nope", ["balance"])).toEqual(["balance"]);
  });
});

describe("NoteBar (T-UI-02)", () => {
  it("shows nothing until the menu handle opens it", () => {
    const handle = createRef<{ readonly open: () => void }>();
    const { container } = render(<NoteBar handle={handle} categories={categories} anchor={() => ({ anchor: "session", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} />);
    expect(container.textContent).toBe("");
    act(() => { handle.current?.open(); });
    expect(screen.getByLabelText("Note text")).toBeTruthy();
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Escape" });
    expect(screen.queryByLabelText("Note text")).toBeNull();
  });

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

  it("N moves focus back to an open note (UC-4)", async () => {
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "session", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} />);
    fireEvent.keyDown(window, { key: "n" });
    const box = screen.getByLabelText("Note text");
    await waitFor(() => { expect(document.activeElement).toBe(box); });
    box.blur();
    fireEvent.keyDown(window, { key: "n" });
    await waitFor(() => { expect(document.activeElement).toBe(box); });
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
    expect(screen.queryByLabelText("Note text")).toBeNull();
    fireEvent.keyDown(window, { key: "N" });
    const box = screen.getByLabelText("Note text");
    fireEvent.change(box, { target: { value: "x" } });
    fireEvent.keyDown(box, { key: "Escape" });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Note text")).toBeNull();
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

describe("Report to Claude (feedback prompt Phase 3)", () => {
  const report = () => vi.fn(() => Promise.resolve({ annotationId: "N7", prompt: "# Feedback from play\n\n> Rally is wrong" }));

  it("Ctrl+Enter sends the note with its frozen anchor and focus and shows the prompt (AC1.1)", async () => {
    const onSave = vi.fn(() => Promise.resolve("N1"));
    const onReport = report();
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "executed", actionId: "S-A3" })} focus={focus} onSave={onSave} onReport={onReport} />);
    fireEvent.keyDown(window, { key: "n" });
    const box = screen.getByLabelText("Note text");
    fireEvent.change(box, { target: { value: "Rally is wrong" } });
    fireEvent.keyDown(box, { key: "Enter", ctrlKey: true });
    await waitFor(() => { expect(onReport).toHaveBeenCalledWith({ anchor: "executed", actionId: "S-A3", text: "Rally is wrong", categoryIds: [], focus: focus() }); });
    expect(onSave).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog", { name: "Prompt for Claude Code" });
    expect(dialog.querySelector("textarea")?.value).toBe("# Feedback from play\n\n> Rally is wrong");
  });

  it("the Report to Claude button saves the note once, closes the bar and says it is saved (AC1.2)", async () => {
    const onSave = vi.fn(() => Promise.resolve("N1"));
    const onReport = report();
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={onSave} onReport={onReport} />);
    fireEvent.keyDown(window, { key: "n" });
    fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "Rally is wrong" } });
    const button = screen.queryByRole("button", { name: "Report to Claude" });
    expect(button).not.toBeNull();
    if (button !== null) fireEvent.click(button);
    expect(await screen.findByText("Saved (state)")).toBeTruthy();
    expect(onReport).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Note text")).toBeNull();
  });

  it("the prompt dialog copies, downloads as .md and closes (D1)", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} onReport={report()} />);
    fireEvent.keyDown(window, { key: "n" });
    fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "Rally is wrong" } });
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Enter", ctrlKey: true });
    await screen.findByRole("dialog", { name: "Prompt for Claude Code" });
    const copy = screen.queryByRole("button", { name: "Copy" });
    expect(copy).not.toBeNull();
    if (copy !== null) fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledWith("# Feedback from play\n\n> Rally is wrong");
    const link = screen.getByRole("link", { name: "Download .md" });
    expect(link.getAttribute("download")).toBe("feedback-N7.md");
    expect(decodeURIComponent((link.getAttribute("href") ?? "").replace("data:text/markdown;charset=utf-8,", ""))).toBe("# Feedback from play\n\n> Rally is wrong");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.fails("offers the separate replay record as a .json download, and no link without one (AC6.3)", async () => {
    const record = { scenario: "full-campaign", seed: 7, commands: [], hashes: ["h1"], ended: false };
    const onReport = vi.fn(() => Promise.resolve({ annotationId: "N8", prompt: "# Feedback from play", replay: { file: "replay-S1.json", record } }));
    const { unmount } = render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} onReport={onReport} />);
    fireEvent.keyDown(window, { key: "n" });
    fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "Big game" } });
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Enter", ctrlKey: true });
    await screen.findByRole("dialog", { name: "Prompt for Claude Code" });
    const link = screen.queryByRole("link", { name: "Download replay .json" });
    expect(link?.getAttribute("download")).toBe("replay-S1.json");
    expect(JSON.parse(decodeURIComponent((link?.getAttribute("href") ?? "").replace("data:application/json;charset=utf-8,", "")))).toEqual(record);
    unmount();
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} onReport={report()} />);
    fireEvent.keyDown(window, { key: "n" });
    fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "Small game" } });
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Enter", ctrlKey: true });
    await screen.findByRole("dialog", { name: "Prompt for Claude Code" });
    expect(screen.queryByRole("link", { name: "Download replay .json" })).toBeNull();
  });

  it("says whether Copy worked (review F2)", async () => {
    const writeText = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} onReport={report()} />);
    fireEvent.keyDown(window, { key: "n" });
    fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "Rally is wrong" } });
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Enter", ctrlKey: true });
    await screen.findByRole("dialog", { name: "Prompt for Claude Code" });
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => { expect(screen.queryByText("Copied.")).not.toBeNull(); });
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => { expect(screen.queryByText("Copy failed. Select the text and copy it.")).not.toBeNull(); });
  });

  it("retries a failed report as a report when Enter is pressed (Codex review)", async () => {
    const onSave = vi.fn(() => Promise.resolve("N1"));
    const onReport = vi.fn().mockRejectedValueOnce(new Error("server down")).mockResolvedValueOnce({ annotationId: "N7", prompt: "# Feedback from play" });
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={onSave} onReport={onReport} />);
    fireEvent.keyDown(window, { key: "n" });
    const box = screen.getByLabelText("Note text");
    fireEvent.change(box, { target: { value: "Rally is wrong" } });
    fireEvent.keyDown(box, { key: "Enter", ctrlKey: true });
    expect((await screen.findByRole("alert")).textContent).toContain("server down");
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Enter" });
    await waitFor(() => { expect(onReport).toHaveBeenCalledTimes(2); });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("keeps the prompt dialog when the note bar opens again (review F3)", async () => {
    render(<NoteBar categories={categories} anchor={() => ({ anchor: "state", actionId: null })} focus={focus} onSave={vi.fn(() => Promise.resolve("N1"))} onReport={report()} />);
    fireEvent.keyDown(window, { key: "n" });
    fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "Rally is wrong" } });
    fireEvent.keyDown(screen.getByLabelText("Note text"), { key: "Enter", ctrlKey: true });
    await screen.findByRole("dialog", { name: "Prompt for Claude Code" });
    fireEvent.keyDown(window, { key: "n" });
    expect(screen.getByLabelText("Note text")).toBeTruthy();
    expect(screen.queryByRole("dialog", { name: "Prompt for Claude Code" })).not.toBeNull();
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
    const action = { action_id: "S-A2", summary: "Pass by pkk", status: "undone", faction: "pkk", box: "pass", phase: "card" } as never;
    const entry = { entry_id: "S-A2-E2", kind: "EffectApplied", rule_ref: "05 s3.2", assumption_ref: null, data: JSON.stringify({ effect: "adjustTrack", track: "resources.pkk", before: 5, after: 6, lost: 0 }), cause: null, cardTitle: null } as never;
    render(<HistoryDrawer items={[{ action, entries: [entry], notes: 2 }]} view={boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"))} />);
    expect(screen.getByText("PKK Resources rose by 1 (5 → 6).")).toBeTruthy();
    expect(screen.getByText(/PKK passed/)).toBeTruthy();
    expect(screen.getByText(/2 notes/)).toBeTruthy();
    expect(screen.getByText("S-A2").closest("li")?.getAttribute("style")).toMatch(/line-through/);
  });

  it("closes with its Close button", () => {
    const onClose = vi.fn();
    render(<HistoryDrawer items={[]} view={boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"))} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close (H)" }));
    expect(onClose).toHaveBeenCalled();
  });
});
