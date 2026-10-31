import { expect, it } from "vitest";
import { codes, op, play, setPieces, turnOf } from "../../../../test/board.ts";
import type { GameState } from "../../core/types.ts";
const mod = (s: GameState, id: string, params: Record<string, number> = {}): GameState => ({...s, modifiers: [{id, params, duration: "game", sourceCard: "DK-004"}]});
it("Tribal Allies removes only the Police prerequisite for Guard recruitment", () => {
  const base = setPieces(turnOf("state"), "dersim", "police", 0);
  const state = {...base, flags: {...base.flags, law3175: true}, pools: {...base.pools, guards: {available: 16, outOfPlay: 0}}};
  const command = op("state", "limitedOp", {op: "state.train", locations: ["dersim"], perLocation: {dersim: {option: "guards", count: 1}}});
  expect(codes(state, command)).toContain("trainGuardsWhere");
  expect(codes(mod(state, "tribal-allies"), command)).toEqual([]);
});
it("ERNK lets a Rally Agitate in a City with a Guerrilla without a Base or PKK Control", () => {
  const state = turnOf("pkk");
  const command = op("pkk", "limitedOp", {op: "pkk.rally", locations: ["diyarbakir-city"], subActions: [{action: "agitate", space: "diyarbakir-city", params: {shifts: 1}}]});
  expect(codes(state, command)).toContain("agitateWhere");
  expect(codes(mod(state, "ernk"), command)).toEqual([]);
});
it("the extra Agitate Momentum allows two different spaces at normal cost, never duplicate spending", () => {
  const state = setPieces(turnOf("pkk"), "hakkari", "pkkBase", 1);
  const subs = ["botan", "hakkari"].map(space => ({action: "agitate", space, params: {shifts: 1}}));
  const command = op("pkk", "opOnly", {op: "pkk.rally", locations: ["botan", "hakkari"], subActions: subs});
  expect(codes(state, command)).toContain("rallySubAction");
  const active = mod(state, "extra-agitate", {maxSpaces: 2});
  expect(codes(active, command)).toEqual([]);
  expect(play(active, command).state.tracks["resources.pkk"]).toBe(1);
  expect(codes(active, op("pkk", "limitedOp", {op: "pkk.rally", locations: ["botan"], subActions: [subs[0], subs[0]]}))).toContain("rallySubAction");
});
it("Academy adds chosen extra recruits in Syria while rivals reduce Mountain recruits to at least one", () => {
  const academy = mod(turnOf("pkk"), "academy", {extra: 2});
  const command = op("pkk", "limitedOp", {op: "pkk.rally", locations: ["syria-bekaa"], perLocation: {"syria-bekaa": {option: "grow", extra: 2}}});
  expect(play(academy, command).state.spaces["syria-bekaa"]?.pieces["guerrilla"]?.["underground"]).toBe(6);
  expect(codes(turnOf("pkk"), command)).toContain("rallyExtra");
  const rivals = mod(turnOf("pkk"), "rivals", {reduction: 1});
  expect(play(rivals, op("pkk", "limitedOp", {op: "pkk.rally", locations: ["botan"], perLocation: {botan: {option: "grow"}}})).state.spaces["botan"]?.pieces["guerrilla"]?.["underground"]).toBe(4);
});
it("Strike Force raises both Air Mobility limits and Ambush Momentum raises its Attack space limit", () => {
  const state = turnOf("state");
  const moves = [{from: "van-bitlis", count: 2}, {from: "diyarbakir-city", count: 3}, {from: "elazig", count: 1}];
  const command = op("state", "opSa", {op: "state.train", locations: ["diyarbakir-city"], perLocation: {"diyarbakir-city": {option: "place", police: 1}}, sa: {action: "state.air-mobility", timing: "before", locations: ["hakkari", "van-bitlis", "diyarbakir-city", "elazig"], perLocation: {hakkari: {moves}}}});
  expect(codes(state, command)).toContain("airMobilityTroops");
  expect(codes(mod(state, "strike-force", {maxTroops: 6, maxSpaces: 4}), command)).toEqual([]);
  const attack = op("pkk", "opSa", {op: "pkk.attack", locations: ["hakkari", "botan", "mardin-batman"], sa: {action: "pkk.ambush", timing: "before", locations: ["hakkari", "botan", "mardin-batman"], perLocation: {}}});
  expect(codes(turnOf("pkk"), attack)).toContain("ambushSpaces");
  expect(codes(mod(turnOf("pkk"), "ambush", {maxSpaces: 3}), attack)).toEqual([]);
});
it("an encoded Capability is a non-Pass choice even when Resources prevent every Op", async () => {
  const {hasNonPassChoice} = await import("../stop-rules.ts");
  const {ruleset, engine, withCard, setTrack} = await import("../../../../test/board.ts");
  const state = withCard(setTrack(turnOf("state"),"resources.state",0),"DK-004");
  expect(engine.validate(ruleset,state,{type: "ChooseEvent",faction: "state",side: "shaded",answers: []}).ok).toBe(true);
  expect(hasNonPassChoice(ruleset,state,"state")).toBe(true);
});

it("Ambush Momentum resolves three guaranteed hits without rolls, attrition or extra activation", () => {
  const locations = ["hakkari", "botan", "mardin-batman"];
  let state = turnOf("pkk");
  for (const space of locations) {
    state = setPieces(setPieces(setPieces(state, space, "guerrilla", 3), space, "guerrilla", 0, "active"), space, "troops", 2);
  }
  state = mod(state, "ambush", {maxSpaces: 3});
  const result = play(state, op("pkk", "opSa", {op: "pkk.attack", locations, sa: {action: "pkk.ambush", timing: "before", locations, perLocation: {}}}));
  expect(result.state.rng).toEqual(state.rng);
  expect(result.entries.some(e => e.kind === "DieRolled")).toBe(false);
  for (const space of locations) {
    expect(result.state.spaces[space]?.pieces["guerrilla"]).toEqual({underground: 2, active: 1});
    expect(result.state.spaces[space]?.pieces["troops"]?.["default"]).toBe(1);
  }
});
