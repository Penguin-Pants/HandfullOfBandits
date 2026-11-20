// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { setTrack, turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { PropagandaPanel } from "./PropagandaPanel.tsx";
afterEach(cleanup);
it("builds a Redeploy route from two map clicks (origin, then destination) without typed input", () => {
  const view = boardView(kurdish.ruleset, kurdish.data, turnOf("state"));
  const at = {...view, status: {...view.status, propagandaStep: view.status.propagandaPhases.indexOf("redeploy")}};
  const onCommit = vi.fn();
  const props = {view: at, legal: {faction: null, phase: "propaganda", advance: false}, onCommit};
  const page = render(<PropagandaPanel {...props} selected={[]} />);
  page.rerender(<PropagandaPanel {...props} selected={["hakkari"]} />);
  expect(screen.getByLabelText("Redeploy routes").textContent).toMatch(/From: Hakkari\. To: click its destination on the map\./);
  page.rerender(<PropagandaPanel {...props} selected={["diyarbakir-city"]} />);
  expect(screen.getByLabelText("Redeploy routes").textContent).toMatch(/From: Hakkari\. To: Diyarbak/);
  fireEvent.click(screen.getByRole("button", {name: "Add route"}));
  fireEvent.click(screen.getByRole("button", {name: "Redeploy pieces"}));
  expect(onCommit).toHaveBeenCalledWith({type: "PropagandaChoice", phase: "redeploy", choice: {troops: [{from: "hakkari", to: "diyarbakir-city", count: 1}], police: [], guerrilla: []}});
  expect(page.container.querySelectorAll("input, textarea, select")).toHaveLength(0);
});

it("starts the next route at the next map click and lets the player clear the origin", () => {
  const view = boardView(kurdish.ruleset, kurdish.data, turnOf("state"));
  const at = {...view, status: {...view.status, propagandaStep: view.status.propagandaPhases.indexOf("redeploy")}};
  const onCommit = vi.fn();
  const props = {view: at, legal: {faction: null, phase: "propaganda", advance: false}, onCommit, human: "pkk"};
  const page = render(<PropagandaPanel {...props} selected={[]} />);
  page.rerender(<PropagandaPanel {...props} selected={["hakkari"]} />);
  fireEvent.click(screen.getByRole("button", {name: "Clear origin"}));
  expect(screen.getByLabelText("Redeploy routes").textContent).toMatch(/From: click a map space\./);
  page.rerender(<PropagandaPanel {...props} selected={["sirnak"]} />);
  page.rerender(<PropagandaPanel {...props} selected={["hakkari"]} />);
  fireEvent.click(screen.getByRole("button", {name: "Add route"}));
  page.rerender(<PropagandaPanel {...props} selected={["mardin"]} />);
  page.rerender(<PropagandaPanel {...props} selected={["sirnak"]} />);
  fireEvent.click(screen.getByRole("button", {name: "Add route"}));
  fireEvent.click(screen.getByRole("button", {name: "Redeploy pieces"}));
  expect(onCommit).toHaveBeenCalledWith({type: "PropagandaChoice", phase: "redeploy", choice: {troops: [], police: [], guerrilla: [{from: "sirnak", to: "hakkari", count: 1}, {from: "mardin", to: "sirnak", count: 1}]}});
});

it("names the Restricted host cost when a Guerrilla destination is Restricted (07 s5.1)", () => {
  const state = setTrack(turnOf("state"), "posture.kdp", "restricted");
  const view = boardView(kurdish.ruleset, kurdish.data, state);
  const at = {...view, status: {...view.status, propagandaStep: view.status.propagandaPhases.indexOf("redeploy")}};
  const props = {view: at, legal: {faction: null, phase: "propaganda", advance: false}, onCommit: vi.fn(), human: "pkk"};
  const page = render(<PropagandaPanel {...props} selected={[]} />);
  page.rerender(<PropagandaPanel {...props} selected={["hakkari"]} />);
  expect(screen.queryByText(/Restricted host/)).toBeNull();
  page.rerender(<PropagandaPanel {...props} selected={["kdp-zone"]} />);
  expect(screen.getByText(/Restricted host: Guerrillas arrive Active and the PKK pays 1 Resource/)).toBeTruthy();
});
