// Menu bar helper for UI tests: open a menu by name, then run one of its items.
import { fireEvent, screen } from "@testing-library/react";

/** Run `item` from the menu bar's `menu`. Works for plain, checkbox and radio items. */
export function menu(name: string, item: string | RegExp): void {
  fireEvent.click(screen.getByRole("menuitem", { name }));
  const menuEl = screen.getByRole("menu", { name });
  const target = [...menuEl.querySelectorAll<HTMLElement>('[role^="menuitem"]')].find((el) => {
    const label = el.querySelector(".menu-label")?.textContent ?? "";
    return typeof item === "string" ? label === item : item.test(label);
  });
  if (target === undefined) throw new Error(`No item ${String(item)} in the ${name} menu`);
  fireEvent.click(target);
}

/** The aria-checked state of a checkbox or radio item; opens the menu and closes it again. */
export function menuChecked(name: string, item: string): boolean {
  fireEvent.click(screen.getByRole("menuitem", { name }));
  const el = [...screen.getByRole("menu", { name }).querySelectorAll<HTMLElement>("[aria-checked]")].find((e) => e.querySelector(".menu-label")?.textContent === item);
  fireEvent.click(screen.getByRole("menuitem", { name }));
  return el?.getAttribute("aria-checked") === "true";
}
