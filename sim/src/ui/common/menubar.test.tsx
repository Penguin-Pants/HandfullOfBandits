// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MenuBar, type Menu } from "./MenuBar.tsx";

afterEach(cleanup);

const setup = (onUndo = vi.fn(), onWindow = vi.fn()) => {
  const menus: Menu[] = [
    { label: "Game", items: [{ label: "Undo", shortcut: "Ctrl+Z", onSelect: onUndo }, "separator", { label: "Locked", disabled: true, onSelect: vi.fn() }] },
    { label: "View", items: [{ label: "Tracks", checked: true, onSelect: vi.fn() }, { label: "Full", radio: true, checked: false, onSelect: vi.fn() }] },
  ];
  window.addEventListener("keydown", onWindow);
  render(<MenuBar menus={menus} status={<span>Card 1</span>} />);
  return () => { window.removeEventListener("keydown", onWindow); };
};

describe("MenuBar", () => {
  it("opens a menu, shows the shortcut and runs an item, then closes", () => {
    const undo = vi.fn();
    const done = setup(undo);
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Game" }));
    const item = screen.getByRole("menuitem", { name: "Undo" });
    expect(item.getAttribute("aria-keyshortcuts")).toBe("Control+Z");
    expect(item.textContent).toContain("Ctrl+Z");
    fireEvent.click(item);
    expect(undo).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByText("Card 1")).toBeTruthy();
    done();
  });

  it("marks checkbox and radio items and does not run a disabled item", () => {
    const done = setup();
    fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Tracks" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("menuitemradio", { name: "Full" }).getAttribute("aria-checked")).toBe("false");
    fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Game" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Locked" }));
    expect(screen.getByRole("menu")).toBeTruthy();
    done();
  });

  it("moves with arrow keys, and Esc closes the menu without reaching the page key handlers", () => {
    const onWindow = vi.fn();
    const done = setup(vi.fn(), onWindow);
    const game = screen.getByRole("menuitem", { name: "Game" });
    game.focus();
    fireEvent.keyDown(game, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Undo" }));
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("menuitemcheckbox", { name: "Tracks" }));
    fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "View" }));
    expect(onWindow).not.toHaveBeenCalled();
    done();
  });

  it("closes on a click outside", () => {
    const done = setup();
    fireEvent.click(screen.getByRole("menuitem", { name: "Game" }));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).toBeNull();
    done();
  });
});
