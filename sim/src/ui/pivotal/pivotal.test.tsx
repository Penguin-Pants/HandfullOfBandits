// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { PivotalPanel } from "./PivotalPanel.tsx";
afterEach(cleanup);
it("allocates ARGK recruits with buttons or declines only the current card", () => {
  const base = boardView(kurdish.ruleset,kurdish.data,turnOf("pkk"));
  const view = {...base,status: {...base.status,phase: "pivotal",pending: {id: "pivot-1",faction: "pkk",prompt: "ARGK window",answers: ["decline",{card: "DK-015",maxPlace: 4}],ruleRef: "05 s4"}}};
  const onCommit = vi.fn();
  const page = render(<PivotalPanel view={view} onCommit={onCommit} />);
  fireEvent.click(screen.getByRole("button",{name: "More Botan"}));
  fireEvent.click(screen.getByRole("button",{name: "More Botan"}));
  fireEvent.click(screen.getByRole("button",{name: "Play ARGK Formed"}));
  expect(onCommit).toHaveBeenLastCalledWith({type: "PlayPivotal",faction: "pkk",card: "DK-015",placements: {botan: 2}});
  fireEvent.click(screen.getByRole("button",{name: "Decline for this card"}));
  expect(onCommit).toHaveBeenLastCalledWith({type: "ResolveDecision",decisionId: "pivot-1",answer: "decline"});
  expect(page.container.querySelectorAll("input,select,textarea")).toHaveLength(0);
});
