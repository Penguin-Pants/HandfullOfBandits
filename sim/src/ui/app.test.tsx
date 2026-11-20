// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
});
