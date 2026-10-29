// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { actionForms } from "../../server/forms.ts";
import { boardView } from "../../server/view.ts";
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

describe("Help: goals and actions", () => {
  it("explains how each faction wins, with this game's thresholds and Harm limit", () => {
    const view = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));
    render(<Help onClose={vi.fn()} view={view} forms={actionForms} />);
    const win = screen.getByLabelText("How to win").textContent;
    expect(win).toMatch(/State.*Total Support \+ Legitimacy/);
    expect(win).toMatch(/PKK.*Total Opposition \+ PKK Bases/);
    expect(win).toContain(`at least ${String(view.status.thresholds["state"])}`);
    expect(win).toContain(`at least ${String(view.status.thresholds["pkk"])}`);
    expect(win).toContain(`Harm count is ${String(view.status.harmLimit)} or less`);
  });

  it("lists what every action does, by faction", () => {
    render(<Help onClose={vi.fn()} view={boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"))} forms={actionForms} />);
    const actions = screen.getByLabelText("Actions").textContent;
    for (const f of actionForms) expect(actions).toContain(f.summary);
    expect(actions).toMatch(/Garrison.*Move up to 6 Police/);
  });
});
