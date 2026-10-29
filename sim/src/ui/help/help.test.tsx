// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Help, KEYS } from "./Help.tsx";

afterEach(cleanup);

describe("Help", () => {
  it("lists every key and closes", () => {
    const onClose = vi.fn();
    render(<Help onClose={onClose} />);
    for (const [k] of KEYS) expect(screen.getByText(k, { selector: "kbd" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close (?)" }));
    expect(onClose).toHaveBeenCalled();
  });
});
