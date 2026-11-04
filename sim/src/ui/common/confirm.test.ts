// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { confirmWarnings } from "./confirm.ts";

afterEach(() => { vi.restoreAllMocks(); });

it("commits with no warnings and asks once with every warning (05 s4 item 6)", () => {
  const ask = vi.spyOn(window, "confirm").mockReturnValue(false);
  expect(confirmWarnings([])).toBe(true);
  expect(ask).not.toHaveBeenCalled();
  expect(confirmWarnings([{ message: "This breaks the ceasefire." }])).toBe(false);
  expect(ask).toHaveBeenCalledWith("This breaks the ceasefire.\nCommit anyway?");
});
