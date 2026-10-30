// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { CardTable } from "./CardTable.tsx";
afterEach(cleanup);
it("shows active card titles and when they expire", () => {
  const state = {...turnOf("pkk"), modifiers: [{id: "ernk", sourceCard: "DK-004", duration: "game" as const, params: {}}, {id: "ambush", sourceCard: "DK-011", duration: "untilReset" as const, params: {maxSpaces: 3}}]};
  render(<CardTable view={boardView(kurdish.ruleset, kurdish.data, state)} onReveal={null} />);
  expect(screen.getByText(/ERNK Founded.*rest of the game/)).toBeTruthy();
  expect(screen.getByText(/PKK Spring Offensive.*until Reset/)).toBeTruthy();
});
