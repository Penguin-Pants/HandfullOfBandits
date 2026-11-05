// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockApi } from "../../../test/ui/mock-api.ts";
import type { MetricsTable, SessionRow } from "../api.ts";
import { Metrics } from "./Metrics.tsx";

// P4-03 metrics review screen: one row per round, columns grouped by research 12 s4 sheet item.
afterEach(cleanup);
const table: MetricsTable = {
  columns: [
    { key: "session_id", label: "Session", item: 0 }, { key: "round", label: "Round", item: 0 },
    { key: "legitimacy", label: "Legitimacy", item: 6 }, { key: "europe", label: "Europe", item: 6 },
    { key: "legal_space", label: "Legal Space", item: 9 },
    { key: "available.troops", label: "troops Available", item: 15 },
  ],
  rows: [{ session_id: "S1", round: 1, legitimacy: 9, europe: 2, legal_space: "open", "available.troops": 7 }],
};
const sessions = [{ session_id: "S1", name: "Try A" }, { session_id: "S2", name: "Try B" }] as unknown as SessionRow[];

describe("Metrics", () => {
  it("shows the rounds under sheet item groups and links the CSV of the shown sessions", async () => {
    const metrics = vi.fn(() => Promise.resolve(table));
    render(<Metrics api={mockApi({ metrics, sessions: () => Promise.resolve(sessions) })} />);
    expect(await screen.findByRole("cell", { name: "open" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Item 6" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Item 15" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "7" })).toBeTruthy();
    // The session cell shows the session name.
    expect(await screen.findByRole("cell", { name: "Try A" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Download metrics.csv" }).getAttribute("href")).toBe("/api/metrics.csv");
    expect(metrics).toHaveBeenLastCalledWith([]);
  });

  it("keeps the table of the current selection when an older response arrives last", async () => {
    let releaseAll: (t: MetricsTable) => void = () => undefined;
    const stale: MetricsTable = { ...table, rows: [{ ...table.rows[0], legal_space: "stale" }] };
    const metrics = vi.fn((ids: readonly string[]) => (ids.length === 0 ? new Promise<MetricsTable>((r) => { releaseAll = r; }) : Promise.resolve(table)));
    render(<Metrics api={mockApi({ metrics, sessions: () => Promise.resolve(sessions) })} />);
    fireEvent.click(await screen.findByRole("checkbox", { name: "Try B" }));
    expect(await screen.findByRole("cell", { name: "open" })).toBeTruthy();
    releaseAll(stale);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole("cell", { name: "stale" })).toBeNull();
  });

  it("limits the table and the CSV to the checked sessions", async () => {
    const metrics = vi.fn(() => Promise.resolve(table));
    render(<Metrics api={mockApi({ metrics, sessions: () => Promise.resolve(sessions) })} />);
    fireEvent.click(await screen.findByRole("checkbox", { name: "Try B" }));
    await waitFor(() => { expect(metrics).toHaveBeenLastCalledWith(["S2"]); });
    expect(screen.getByRole("link", { name: "Download metrics.csv" }).getAttribute("href")).toBe("/api/metrics.csv?sessions=S2");
  });
});
