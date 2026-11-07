// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FullscreenButton } from "./FullscreenButton.tsx";

let fullscreen: Element | null = null;
let request: ReturnType<typeof vi.fn>;
let exit: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fullscreen = null;
  request = vi.fn(() => Promise.resolve());
  exit = vi.fn(() => Promise.resolve());
  Object.defineProperties(document, {
    fullscreenElement: { configurable: true, get: () => fullscreen },
    fullscreenEnabled: { configurable: true, value: true },
    exitFullscreen: { configurable: true, value: exit },
  });
  Object.defineProperty(document.documentElement, "requestFullscreen", { configurable: true, value: request });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  for (const key of ["fullscreenElement", "fullscreenEnabled", "exitFullscreen"]) Reflect.deleteProperty(document, key);
  Reflect.deleteProperty(document.documentElement, "requestFullscreen");
});
function change(element: Element | null) {
  fullscreen = element;
  fireEvent(document, new Event("fullscreenchange"));
}

describe("Browser fullscreen", () => {
  it("requests the whole document only on click and waits for browser state", async () => {
    render(<FullscreenButton />);
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));
    await waitFor(() => { expect(request).toHaveBeenCalledOnce(); });
    expect(request.mock.contexts[0]).toBe(document.documentElement);
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeTruthy();
    change(document.documentElement);
    fireEvent.click(screen.getByRole("button", { name: "Exit fullscreen" }));
    await waitFor(() => { expect(exit).toHaveBeenCalledOnce(); });
    change(null);
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeTruthy();
  });
  it("reflects native entry and exit and removes its listener on unmount", () => {
    fullscreen = document.documentElement;
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<FullscreenButton />);
    expect(screen.getByRole("button", { name: "Exit fullscreen" })).toBeTruthy();
    change(null);
    expect(screen.getByRole("button", { name: "Fullscreen" })).toBeTruthy();
    unmount();
    expect(remove).toHaveBeenCalledWith("fullscreenchange", expect.any(Function));
  });
  it("explains unsupported fullscreen without disabling normal play", () => {
    Reflect.deleteProperty(document.documentElement, "requestFullscreen");
    render(<FullscreenButton />);
    fireEvent.click(screen.getByRole("button", { name: "Fullscreen" }));
    expect(screen.getByRole("status").textContent).toMatch(/not supported.*window/i);
    expect(request).not.toHaveBeenCalled();
  });
  it.each([false, true])("handles a rejected request (already fullscreen: %s)", async (active) => {
    if (active) fullscreen = document.documentElement;
    (active ? exit : request).mockRejectedValueOnce(new Error("Browser refused"));
    render(<FullscreenButton />);
    fireEvent.click(screen.getByRole("button", { name: active ? "Exit fullscreen" : "Fullscreen" }));
    await waitFor(() => { expect(screen.getByRole("status").textContent).toMatch(/could not.*fullscreen/i); });
    expect(screen.getByRole("button", { name: active ? "Exit fullscreen" : "Fullscreen" })).toBeTruthy();
  });
});
