// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import type { Api } from "../api.ts";
import type { JsonValue } from "../../engine/core/types.ts";
import { emptyPlans } from "../faction/plan.ts";
import { PivotalPanel } from "./PivotalPanel.tsx";
afterEach(cleanup);

const windowView = (answers: JsonValue[]) => {
  const base = boardView(kurdish.ruleset,kurdish.data,turnOf("pkk"));
  return {...base,status: {...base.status,phase: "pivotal",pending: {id: "pivot-1",faction: "pkk",prompt: "Play a Pivotal Event instead of this card, or decline for this card?",answers,ruleRef: "05 s4"}}};
};
const props = (api: Partial<Api> = {}) => ({api: api as Api, sessionId: "s1", forms: [], plan: emptyPlans.event, dispatch: vi.fn()});

it("allocates ARGK recruits with buttons or declines only the current card", () => {
  const onCommit = vi.fn();
  const page = render(<PivotalPanel view={windowView(["decline",{card: "DK-015",maxPlace: 4}])} onCommit={onCommit} {...props()} />);
  fireEvent.click(screen.getByRole("button",{name: "More Botan"}));
  fireEvent.click(screen.getByRole("button",{name: "More Botan"}));
  fireEvent.click(screen.getByRole("button",{name: "Play ARGK Formed"}));
  expect(onCommit).toHaveBeenLastCalledWith({type: "PlayPivotal",faction: "pkk",card: "DK-015",placements: {botan: 2}});
  fireEvent.click(screen.getByRole("button",{name: "Decline for this card"}));
  expect(onCommit).toHaveBeenLastCalledWith({type: "ResolveDecision",decisionId: "pivot-1",answer: "decline"});
  expect(page.container.querySelectorAll("input,select,textarea")).toHaveLength(0);
});

it("plays Serhildan through its space question, then commits the answered command", async () => {
  const question = {kind: "spaces",prompt: "Pick 0 to 3 spaces",options: ["botan","hakkari"],min: 0,max: 3};
  const validate = vi.fn()
    .mockResolvedValueOnce({ok: false,violations: [{code: "needsAnswer",message: "Pick",ruleRef: "x",location: null,question}],warnings: []})
    .mockResolvedValueOnce({ok: true,violations: [],warnings: []});
  const onCommit = vi.fn();
  render(<PivotalPanel view={windowView(["decline",{card: "DK-054"}])} onCommit={onCommit} {...props({validate})} />);
  expect(screen.getByText(/Shift up to 3 spaces with PKK pieces and no Office/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name: "Play Serhildan"}));
  await waitFor(() => { expect(screen.getByRole("button",{name: "Pick 0"})).toBeTruthy(); });
  fireEvent.click(screen.getByRole("button",{name: "Pick 0"}));
  await waitFor(() => { expect(onCommit).toHaveBeenCalledWith({type: "PlayPivotal",faction: "pkk",card: "DK-054",answers: [[]]}); });
  expect(validate).toHaveBeenNthCalledWith(1,"s1",{type: "PlayPivotal",faction: "pkk",card: "DK-054",answers: []});
});
