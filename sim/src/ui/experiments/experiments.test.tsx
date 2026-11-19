// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockApi } from "../../../test/ui/mock-api.ts";
import type { ExperimentDetail } from "../api.ts";
import { Experiments } from "./Experiments.tsx";

// Audit Plan 3 A5: open a report, then jump to a game decision.
afterEach(cleanup);
const summary = { id: "run-a", stage: "pilot", description: "Test run", state: "complete", scheduled: 2, hasReport: true };
const detail: ExperimentDetail = {
  ...summary,
  report: "# Experiment run-a (pilot)\n\n| Cell | x |",
  games: [
    { gameId: "g~1", condition: "default", state: "S-A@1", pkk: "P-A@1", seed: 1, status: "complete", winner: "state", commands: 40, review: true },
    { gameId: "g~2", condition: "default", state: "S-A@1", pkk: "P-A@1", seed: 2, status: "complete", winner: "pkk", commands: 30, review: false },
  ],
};

describe("Experiments", () => {
  it("opens a report and jumps to a chosen decision of a game", async () => {
    const openExperimentGame = vi.fn(() => Promise.resolve({ sessionId: "S9", applied: 12, total: 40, divergedAt: null }));
    const onOpen = vi.fn();
    render(<Experiments api={mockApi({ experiments: () => Promise.resolve([summary]), experiment: () => Promise.resolve(detail), openExperimentGame })} onOpen={onOpen} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open run-a" }));
    expect((await screen.findByLabelText("Report")).textContent).toContain("# Experiment run-a (pilot)");
    expect(screen.getByRole("cell", { name: "g~1 (review)" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Decision for g~1"), { target: { value: "12" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Open at decision" })[0] as HTMLElement);
    await vi.waitFor(() => { expect(onOpen).toHaveBeenCalledWith("S9"); });
    expect(openExperimentGame).toHaveBeenCalledWith("run-a", "g~1", 12);
  });

  it("filters to the review selection and blocks a decision outside the game", async () => {
    render(<Experiments api={mockApi({ experiments: () => Promise.resolve([summary]), experiment: () => Promise.resolve(detail) })} onOpen={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open run-a" }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "Review selection only" }));
    expect(screen.queryByRole("cell", { name: "g~2" })).toBeNull();
    fireEvent.change(screen.getByLabelText("Decision for g~1"), { target: { value: "41" } });
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Open at decision" }).disabled).toBe(true);
  });

  it("says where a replay diverged and still offers the session", async () => {
    const onOpen = vi.fn();
    const openExperimentGame = vi.fn(() => Promise.resolve({ sessionId: "S7", applied: 4, total: 40, divergedAt: 5 }));
    render(<Experiments api={mockApi({ experiments: () => Promise.resolve([summary]), experiment: () => Promise.resolve(detail), openExperimentGame })} onOpen={onOpen} />);
    fireEvent.click(await screen.findByRole("button", { name: "Open run-a" }));
    fireEvent.click((await screen.findAllByRole("button", { name: "Open at decision" }))[0] as HTMLElement);
    expect((await screen.findByRole("status")).textContent).toContain("decision 5 differently");
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Go to session" }));
    expect(onOpen).toHaveBeenCalledWith("S7");
  });
});
