// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { turnOf } from "../../test/board.ts";
import { kurdish } from "../../test/kurdish-package.ts";
import { mockApi } from "../../test/ui/mock-api.ts";
import { boardView } from "../server/view.ts";
import type { BoardView, Head, NoteInput, ReviewRow, SessionRow } from "./api.ts";
import { NoteBar } from "./notes/NoteBar.tsx";
import { Play } from "./play/Play.tsx";
import { Review } from "./review/Review.tsx";
import { StateViewer } from "./state-viewer/StateViewer.tsx";

afterEach(cleanup);
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const focus = (): NoteInput["focus"] => ({ panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null });
const anchor = () => ({ anchor: "session" as const, actionId: null });
const state = turnOf("state");
const view = boardView(kurdish.ruleset, kurdish.data, state);
const head: Head = { actionId: "A1", stateHash: "h1", state, derived: null as never, view };
const session = () => Promise.resolve({ session: { name: "test", status: "active" } as SessionRow, head });
const legal = () => Promise.resolve({ faction: null, phase: "card", advance: false });
const row: ReviewRow = { annotationId: "N1", sessionId: "S", sessionName: "test", createdAt: "2026-11-07", anchor: "session", actionId: null, stateHash: null, categories: [], text: "old result", status: "open", faction: null, cardId: null, version: null, rulesetVersion: null, spaces: [] };

it("preserves edits during a note save and refuses overlapping submissions", async () => {
  const pending = deferred<string>();
  const onSave = vi.fn(() => pending.promise);
  render(<NoteBar categories={[]} anchor={anchor} focus={focus} onSave={onSave} />);
  fireEvent.click(screen.getByRole("button", { name: "Note (N)" }));
  const box = screen.getByLabelText<HTMLTextAreaElement>("Note text");
  fireEvent.change(box, { target: { value: "submitted draft" } });
  fireEvent.keyDown(box, { key: "Enter" });
  fireEvent.change(box, { target: { value: "new draft" } });
  fireEvent.keyDown(box, { key: "Enter" });
  expect(onSave).toHaveBeenCalledTimes(1);
  await act(async () => { pending.resolve("N1"); await pending.promise; });
  expect(screen.getByLabelText<HTMLTextAreaElement>("Note text").value).toBe("new draft");
});

it("does not clear a reopened note when an earlier save completes", async () => {
  const pending = deferred<string>();
  render(<NoteBar categories={[]} anchor={anchor} focus={focus} onSave={() => pending.promise} />);
  fireEvent.click(screen.getByRole("button", { name: "Note (N)" }));
  const box = screen.getByLabelText("Note text");
  fireEvent.change(box, { target: { value: "first" } });
  fireEvent.keyDown(box, { key: "Enter" });
  fireEvent.keyDown(box, { key: "Escape" });
  fireEvent.click(screen.getByRole("button", { name: "Note (N)" }));
  fireEvent.change(screen.getByLabelText("Note text"), { target: { value: "second" } });
  await act(async () => { pending.resolve("N1"); await pending.promise; });
  expect(screen.getByLabelText<HTMLTextAreaElement>("Note text").value).toBe("second");
});

it("shows a note save error, retains the draft and permits retry", async () => {
  const onSave = vi.fn().mockRejectedValueOnce(new Error("save unavailable")).mockResolvedValue("N1");
  render(<NoteBar categories={[]} anchor={anchor} focus={focus} onSave={onSave} />);
  fireEvent.click(screen.getByRole("button", { name: "Note (N)" }));
  const box = screen.getByLabelText<HTMLTextAreaElement>("Note text");
  fireEvent.change(box, { target: { value: "keep me" } });
  fireEvent.keyDown(box, { key: "Enter" });
  expect((await screen.findByRole("alert")).textContent).toContain("save unavailable");
  expect(box.value).toBe("keep me");
  fireEvent.keyDown(box, { key: "Enter" });
  await screen.findByText("Saved (session)");
  expect(onSave).toHaveBeenCalledTimes(2);
});

it.each(["legal", "categories"] as const)("recovers a failed %s load and offers Home", async (method) => {
  const failing = vi.fn().mockRejectedValueOnce(new Error("load unavailable")).mockImplementation(method === "legal" ? legal : () => Promise.resolve([]));
  const onExit = vi.fn();
  render(<Play api={mockApi({ session, legal, [method]: failing })} sessionId="S" onExit={onExit} />);
  expect((await screen.findByRole("alert")).textContent).toContain("load unavailable");
  fireEvent.keyDown(window, { key: "z", ctrlKey: true });
  fireEvent.click(screen.getByRole("button", { name: "Home" }));
  expect(onExit).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await screen.findByRole("button", { name: "Note (N)" });
  expect(failing).toHaveBeenCalledTimes(2);
});

it("ignores old review responses and removes stale bulk selections during loading", async () => {
  const old = deferred<ReviewRow[]>();
  const latest = deferred<ReviewRow[]>();
  const review = vi.fn().mockResolvedValueOnce([row]).mockImplementationOnce(() => old.promise).mockImplementationOnce(() => latest.promise);
  render(<Review api={mockApi({ review })} onOpenState={vi.fn()} />);
  await screen.findByText("old result");
  fireEvent.click(screen.getByLabelText("Select all"));
  fireEvent.change(screen.getByLabelText("Search"), { target: { value: "old" } });
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Mark addressed" }).disabled).toBe(true);
  expect(screen.queryByText("old result")).toBeNull();
  fireEvent.change(screen.getByLabelText("Search"), { target: { value: "new" } });
  await act(async () => { latest.resolve([{ ...row, text: "new result" }]); await latest.promise; });
  await act(async () => { old.resolve([row]); await old.promise; });
  expect(screen.queryByText("old result")).toBeNull();
  expect(screen.getByText("new result")).toBeTruthy();
});

it("shows review failures and retries the current filter", async () => {
  const review = vi.fn().mockRejectedValueOnce(new Error("review unavailable")).mockResolvedValue([row]);
  render(<Review api={mockApi({ review })} onOpenState={vi.fn()} />);
  expect((await screen.findByRole("alert")).textContent).toContain("review unavailable");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await screen.findByText("old result");
});

it("never shows an old board under the current state hash", async () => {
  const old = deferred<BoardView>();
  const stateView = vi.fn().mockImplementationOnce(() => old.promise).mockResolvedValue({ ...view, status: { ...view.status, cardIndex: 99 } });
  render(<StateViewer api={mockApi({ stateView })} sessionId="S" before="before" after="after" onBack={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Before" }));
  await screen.findByText("Card 99");
  await act(async () => { old.resolve(view); await old.promise; });
  expect(screen.getByText("Card 99")).toBeTruthy();
  expect(screen.queryByText("Card 0")).toBeNull();
});

it("can retry a failed state view", async () => {
  const stateView = vi.fn().mockRejectedValueOnce(new Error("view unavailable")).mockResolvedValue(view);
  render(<StateViewer api={mockApi({ stateView })} sessionId="S" before={null} after="after" onBack={vi.fn()} />);
  expect((await screen.findByRole("alert")).textContent).toContain("view unavailable");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => { expect(screen.getByText("Card 0")).toBeTruthy(); });
});

it("keeps a new note draft when the post-save refresh fails", async () => {
  const saved = deferred<{ annotationId: string }>();
  const history = vi.fn().mockResolvedValueOnce([]).mockRejectedValue(new Error("refresh unavailable"));
  render(<Play api={mockApi({ session, legal, history, annotate: () => saved.promise })} sessionId="S" />);
  fireEvent.click(await screen.findByRole("button", { name: "Note (N)" }));
  const box = screen.getByLabelText("Note text");
  fireEvent.change(box, { target: { value: "first" } });
  fireEvent.keyDown(box, { key: "Enter" });
  fireEvent.change(box, { target: { value: "second" } });
  await act(async () => { saved.resolve({ annotationId: "N1" }); await saved.promise; });
  expect((await screen.findByRole("alert")).textContent).toContain("refresh unavailable");
  expect(screen.getByLabelText<HTMLTextAreaElement>("Note text").value).toBe("second");
});
