// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockApi, okPackage } from "../../../test/ui/mock-api.ts";
import { Home } from "./Home.tsx";
import { startBlockers } from "./start-rule.ts";

// P2-13 component tests for the Start rule (08 s6): disabled with errors; PA warnings listed.
afterEach(cleanup);

describe("startBlockers", () => {
  it("allows a clean package and scenario, and ignores errors that block another scenario", () => {
    expect(startBlockers(okPackage, "s0", "7")).toEqual([]);
  });
  it("blocks a blocked scenario, a package with errors, a bad seed and no package", () => {
    expect(startBlockers(okPackage, "full-campaign", "7")[0]).toMatch(/blocked/);
    expect(startBlockers({ ...okPackage, ok: false, issues: [{ level: "error", code: "V-REF", file: "map.yaml", path: "", id: null, message: "x" }] }, "s0", "7")[0]).toMatch(/1 errors/);
    expect(startBlockers(okPackage, "s0", "-1")).toEqual(["The seed must be a whole number of 0 or more."]);
    expect(startBlockers(undefined, "s0", "1")).toEqual(["Choose a package."]);
  });
});

describe("Home", () => {
  it("enables Start for S0, disables it for the blocked full campaign, and lists PA warnings", async () => {
    render(<Home api={mockApi()} onOpen={vi.fn()} onCheck={vi.fn()} />);
    const start = await screen.findByRole("button", { name: "Start" });
    await waitFor(() => { expect((start as HTMLButtonElement).disabled).toBe(false); });
    fireEvent.change(screen.getByLabelText("Scenario"), { target: { value: "full-campaign" } });
    expect((start as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/blocked: 1 errors/)).toBeTruthy();
    expect(screen.getByText(/1 prototype assumptions active/)).toBeTruthy();
  });

  it("starts a session with the seed, name and options, then opens it", async () => {
    const createSession = vi.fn(() => Promise.resolve({ sessionId: "S1", head: {} as never }));
    const onOpen = vi.fn();
    render(<Home api={mockApi({ createSession })} onOpen={onOpen} onCheck={vi.fn()} />);
    const start = await screen.findByRole("button", { name: "Start" });
    await waitFor(() => { expect((start as HTMLButtonElement).disabled).toBe(false); });
    fireEvent.change(screen.getByLabelText("Seed"), { target: { value: "42" } });
    fireEvent.click(start);
    await waitFor(() => { expect(onOpen).toHaveBeenCalledWith("S1"); });
    expect(createSession).toHaveBeenCalledWith({ dir: okPackage.dir, scenarioId: "s0", seed: 42, name: "s0-seed42", options: {} });
  });
});
