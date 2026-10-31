import { expect, it } from "vitest";
import { ruleset, turnOf } from "../../../test/board.ts";
import { createExec } from "./exec.ts";
import { addModifier, discardMomentum, hasModifier, modifierLimit } from "./modifiers.ts";
it("P3a-03: stores a sourced modifier, replaces its side and discards only Momentum", () => {
  const ctx = createExec(ruleset, turnOf("pkk"));
  addModifier(ctx, {id: "ernk", sourceCard: "DK-004", duration: "game", params: {}});
  addModifier(ctx, {id: "ambush", sourceCard: "DK-011", duration: "untilReset", params: {maxSpaces: 3}});
  expect(hasModifier(ctx.state, "ernk")).toBe(true);
  expect(modifierLimit(ctx.state, "ambush", "maxSpaces", 2)).toBe(3);
  expect(modifierLimit(ctx.state, "missing", "maxSpaces", 2)).toBe(2);
  addModifier(ctx, {id: "ambush", sourceCard: "DK-011", duration: "untilReset", params: {maxSpaces: 4}});
  expect(ctx.state.modifiers.filter(m => m.id === "ambush")).toHaveLength(1);
  expect(modifierLimit(ctx.state, "ambush", "maxSpaces", 2)).toBe(4);
  discardMomentum(ctx);
  expect(ctx.state.modifiers.map(m => m.id)).toEqual(["ernk"]);
  expect(ctx.entries.some(e => e.data["effect"] === "discardMomentum")).toBe(true);
});
it("rejects an unknown source and ignores malformed numeric limits", () => {
  const ctx = createExec(ruleset, turnOf("pkk"));
  expect(() => { addModifier(ctx, {id: "unknown", sourceCard: "missing", duration: "game", params: {}}); }).toThrow(/source card/);
  addModifier(ctx, {id: "ernk", sourceCard: "DK-004", duration: "game", params: {x: "wrong"}});
  expect(modifierLimit(ctx.state, "ernk", "x", 1)).toBe(1);
  expect(hasModifier(ctx.state, "missing")).toBe(false);
});
