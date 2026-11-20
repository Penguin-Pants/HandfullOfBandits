// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SessionRow } from "./api.ts";
import { mockApi } from "../../test/ui/mock-api.ts";
import { App } from "./App.tsx";

afterEach(cleanup);

describe("App menu bar", () => {
  it("opens each screen from the Game menu", async () => {
    render(<App api={mockApi()} />);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Game" }));
    expect(screen.getByRole("menuitem", { name: "Feedback review" }).getAttribute("aria-keyshortcuts")).toBe("F");
    fireEvent.click(screen.getByRole("menuitem", { name: "Feedback review" }));
    expect(screen.getByLabelText("Feedback review")).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Game" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Home" }));
    expect(screen.queryByLabelText("Feedback review")).toBeNull();
  });

  it("F opens Feedback review, but not while typing in a field", async () => {
    render(<App api={mockApi()} />);
    const field = document.createElement("input");
    document.body.append(field);
    fireEvent.keyDown(field, { key: "f" });
    expect(screen.queryByLabelText("Feedback review")).toBeNull();
    fireEvent.keyDown(window, { key: "f" });
    expect(await screen.findByLabelText("Feedback review")).toBeTruthy();
    field.remove();
  });

  it("returns Home from a Play screen that failed to load", async () => {
    const row = { session_id: "S1", name: "saved", scenario_id: "short", seed: 1, status: "active" } as SessionRow;
    render(<App api={mockApi({ sessions: () => Promise.resolve([row]), session: () => Promise.reject(new Error("gone")) })} />);
    fireEvent.click(await screen.findByRole("button", { name: "Resume" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(await screen.findByRole("button", { name: "Resume" })).toBeTruthy();
  });
});
