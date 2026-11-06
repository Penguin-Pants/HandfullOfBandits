// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import type { Api } from "../api.ts";
import { SignalPrompt, SIGNAL_SETTING, signalEnabled } from "./SignalPrompt.tsx";

// Propaganda prompt (P4-14; 07 s4.4): asks once per round, stores a `legal-politics-signal` note.
afterEach(() => { cleanup(); localStorage.clear(); });
const view = boardView(kurdish.ruleset, kurdish.data, turnOf("state"));
const focus = { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null } as const;
const note = (round: number, categories: string[]) => ({ context: JSON.stringify({ campaign: view.status.campaign, propaganda_round: round }), category_ids: JSON.stringify(categories) });
const render_ = (notes: unknown[]) => {
  const annotate = vi.fn().mockResolvedValue({ annotationId: "n" });
  const api = { annotations: vi.fn().mockResolvedValue(notes), annotate } as unknown as Api;
  render(<SignalPrompt api={api} sessionId="s" view={view} headActionId="a1" focus={focus} />);
  return annotate;
};

it("is off by default and on with the setting", () => {
  expect(signalEnabled()).toBe(false);
  localStorage.setItem(SIGNAL_SETTING, "on");
  expect(signalEnabled()).toBe(true);
});

it("asks once: Yes saves a y note anchored to the head action, then the question goes away", async () => {
  const annotate = render_([]);
  fireEvent.click(await screen.findByRole("button", { name: "Yes" }));
  await waitFor(() => { expect(screen.queryByLabelText("Legal Politics signal")).toBeNull(); });
  expect(annotate).toHaveBeenCalledWith("s", { anchor: "executed", actionId: "a1", text: "y", categoryIds: ["legal-politics-signal"], focus });
});

it("No saves an n note", async () => {
  const annotate = render_([]);
  fireEvent.click(await screen.findByRole("button", { name: "No" }));
  await waitFor(() => { expect(annotate).toHaveBeenCalled(); });
  expect(annotate.mock.calls[0]?.[1]).toMatchObject({ text: "n" });
});

it("does not ask again when this round already has an answer, but asks for another round", async () => {
  render_([note(view.status.propagandaRound, ["legal-politics-signal"])]);
  await waitFor(() => { expect(screen.queryByRole("button", { name: "Yes" })).toBeNull(); });
  cleanup();
  render_([note(view.status.propagandaRound + 1, ["legal-politics-signal"]), note(view.status.propagandaRound, ["balance"])]);
  expect(await screen.findByRole("button", { name: "Yes" })).toBeTruthy();
});
