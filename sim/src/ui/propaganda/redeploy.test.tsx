// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { PropagandaPanel } from "./PropagandaPanel.tsx";
afterEach(cleanup);
it("builds a Redeploy route from map selections without typed input", () => {
  const view = boardView(kurdish.ruleset, kurdish.data, turnOf("state"));
  const at = {...view, status: {...view.status, propagandaStep: view.status.propagandaPhases.indexOf("redeploy")}};
  const onCommit = vi.fn();
  const props = {view: at, legal: {faction: null, phase: "propaganda", advance: false}, onCommit};
  const page = render(<PropagandaPanel {...props} selected={["hakkari"]} />);
  fireEvent.click(screen.getByRole("button", {name: "Use Hakkari as origin"}));
  page.rerender(<PropagandaPanel {...props} selected={["diyarbakir-city"]} />);
  fireEvent.click(screen.getByRole("button", {name: "Add route"}));
  fireEvent.click(screen.getByRole("button", {name: "Redeploy pieces"}));
  expect(onCommit).toHaveBeenCalledWith({type: "PropagandaChoice", phase: "redeploy", choice: {troops: [{from: "hakkari", to: "diyarbakir-city", count: 1}], police: [], guerrilla: []}});
  expect(page.container.querySelectorAll("input, textarea, select")).toHaveLength(0);
});
