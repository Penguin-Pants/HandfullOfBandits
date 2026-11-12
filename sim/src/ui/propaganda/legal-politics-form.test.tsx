// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { setTrack, turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { PropagandaPanel } from "./PropagandaPanel.tsx";

// Ceasefire step form (P3b-05; docs/prototype/30 s2.1, DEC-66 point 2: State first, both on screen).
afterEach(cleanup);
const panel = (ceasefire: string) => {
  const state = setTrack(setTrack(turnOf("state"), "legalSpace", "open"), "ceasefire", ceasefire);
  const view = boardView(kurdish.ruleset, kurdish.data, state);
  const at = { ...view, status: { ...view.status, propagandaStep: view.status.propagandaPhases.indexOf("legalPolitics") } };
  const onCommit = vi.fn();
  render(<PropagandaPanel view={at} legal={{ faction: null, phase: "propaganda", advance: true }} selected={[]} onCommit={onCommit} />);
  return onCommit;
};

it("sends the State acceptance of a declared ceasefire", () => {
  const onCommit = panel("declared");
  fireEvent.click(screen.getByRole("button", { name: "Accept the ceasefire" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit ceasefire choices" }));
  expect(onCommit).toHaveBeenCalledWith({ type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire: { accept: true } } });
});

it("sends each faction's choice to leave Reciprocal Restraint, State first", () => {
  const onCommit = panel("reciprocalRestraint");
  const leave = screen.getAllByRole("button", { name: "Leave Reciprocal Restraint" });
  expect(leave).toHaveLength(2);
  fireEvent.click(leave[1] as HTMLElement);
  fireEvent.click(screen.getByRole("button", { name: "Submit ceasefire choices" }));
  expect(onCommit).toHaveBeenCalledWith({ type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire: { leave: { pkk: true } } } });
});

it("offers no vote and no settlement during Reciprocal Restraint", () => {
  panel("reciprocalRestraint");
  expect(screen.getByLabelText("Ceasefire step").querySelectorAll("button")).toHaveLength(3);
});

it("shows no ceasefire step while no ceasefire is in force", () => {
  panel("none");
  expect(screen.queryByLabelText("Ceasefire step")).toBeNull();
});
