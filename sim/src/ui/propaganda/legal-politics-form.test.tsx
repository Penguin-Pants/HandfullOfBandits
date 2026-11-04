// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { setTrack, turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { PropagandaPanel } from "./PropagandaPanel.tsx";

// Ceasefire step form (P3b-05; docs/prototype/30 s2.1, DEC-66 point 2: State first, both on screen).
afterEach(cleanup);
const panel = (ceasefire: string, rounds: number, selected: string[] = []) => {
  const state = setTrack(setTrack(setTrack(turnOf("state"), "legalSpace", "open"), "ceasefire", ceasefire), "ceasefireRounds", rounds);
  const view = boardView(kurdish.ruleset, kurdish.data, state);
  const at = { ...view, status: { ...view.status, propagandaStep: view.status.propagandaPhases.indexOf("legalPolitics") } };
  const onCommit = vi.fn();
  render(<PropagandaPanel view={at} legal={{ faction: null, phase: "propaganda", advance: true }} selected={selected} onCommit={onCommit} />);
  return onCommit;
};

it("sends both Talks votes, State first", () => {
  const onCommit = panel("reciprocalRestraint", 1);
  for (const b of screen.getAllByRole("button", { name: "Vote yes to Talks" })) fireEvent.click(b);
  fireEvent.click(screen.getByRole("button", { name: "Submit ceasefire choices" }));
  expect(onCommit).toHaveBeenCalledWith({ type: "PropagandaChoice", phase: "legalPolitics", choice: { ceasefire: { talks: { state: true, pkk: true } } } });
});

it("asks for Guerrilla removals when both accept the Negotiated Outcome", () => {
  const onCommit = panel("talks", 1, ["hakkari"]);
  for (const b of screen.getAllByRole("button", { name: "Accept the Negotiated Outcome" })) fireEvent.click(b);
  expect(screen.getByText("PKK: select spaces and remove 3 domestic Guerrillas in total.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Submit ceasefire choices" }));
  expect(onCommit.mock.calls[0]?.[0]).toMatchObject({ choice: { ceasefire: { outcome: { state: true, pkk: true, removals: { hakkari: 0 } } } } });
});

it("shows no ceasefire step while no ceasefire is in force", () => {
  panel("none", 0);
  expect(screen.queryByLabelText("Ceasefire step")).toBeNull();
});
