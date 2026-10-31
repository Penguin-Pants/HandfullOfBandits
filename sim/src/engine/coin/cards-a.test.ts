import { expect, it } from "vitest";
import { codes, play, setMarkers, setPieces, turnOf, withCard, withRoll } from "../../../test/board.ts";
import type { GameState } from "../core/types.ts";
const plan = (locations: string[]) => ({locations, perLocation: {}});
const fixture = (faction: "state" | "pkk", card: string) => {
  let s = withRoll(withCard(turnOf(faction), card), 6);
  s = {...s, flags: {...s.flags, law3175: true}, pools: {...s.pools, guards: {available: 16, outOfPlay: 0}}};
  for (const id of ["hakkari", "botan", "mardin-batman"]) s = setPieces(s, id, "guards", 2);
  return setMarkers(setMarkers(s, "hakkari", "pkkHarm", 1), "botan", "stateHarm", 1);
};
const troops = (id: string, n: number) => ({spaces: {[id]: {pieces: {troops: {default: n}}}}});
const level = (id: string, n: number) => ({spaces: {[id]: {level: n}}});
const marker = (id: string, m: string, n = 1) => ({spaces: {[id]: {markers: {[m]: {default: n}}}}});
const track = (id: string, n: number | string) => ({tracks: {[id]: n}});
const mod = (id: string) => ({modifiers: [{id}]});
const active = (id: string, n: number) => ({spaces: {[id]: {pieces: {guerrilla: {active: n}}}}});
const rows: readonly [string, "unshaded" | "shaded", readonly unknown[], object][] = [
  ["DK-004","unshaded",["PKK Resources"],track("resources.pkk",3)], ["DK-004","shaded",[],mod("ernk")],
  ["DK-006","unshaded",[],mod("tribal-allies")],
  ["DK-007","unshaded",[plan(["botan"])],{spaces: {"diyarbakir-city": {pieces: {police: {default: 3}}}}}], ["DK-007","shaded",[],mod("extra-agitate")],
  ["DK-009","unshaded",[plan(["syria-bekaa"])],track("posture.syria","tolerant")], ["DK-009","shaded",[],mod("academy")],
  ["DK-010","unshaded",[],{...mod("rivals"),...track("resources.pkk",3)}], ["DK-010","shaded",["van-bitlis"],{spaces: {"van-bitlis": {pieces: {guerrilla: {underground: 1}}}},...track("resources.pkk",7)}],
  ["DK-011","unshaded",[plan(["botan"])],active("botan",2)], ["DK-011","shaded",[],mod("ambush")],
  ["DK-013","unshaded",[{locations: ["kdp-zone"], sa: {locations: ["kdp-zone"], perLocation: {"kdp-zone": {moves: [{from: "hakkari", count: 2}]}}}}],marker("kdp-zone","disputedHarm")], ["DK-013","shaded",[2],track("resources.pkk",6)],
  ["DK-017","unshaded",[["kdp-zone"]],{spaces: {"kdp-zone": {pieces: {guerrilla: {underground: 2}}, markers: {disputedHarm: {default: 1}}}}}], ["DK-017","shaded",["hakkari",3],{spaces: {hakkari: {pieces: {guerrilla: {underground: 5}}}}}],
  ["DK-018","unshaded",[2],{...marker("mardin-batman","disputedHarm"),...track("europe",0)}], ["DK-018","shaded",["Redress",["hakkari"]],{...track("resources.pkk",3),...marker("hakkari","pkkHarm",0)}],
  ["DK-019","unshaded",[plan(["syria-bekaa"])],track("posture.syria","tolerant")], ["DK-019","shaded",[plan(["syria-bekaa"])],{spaces: {"syria-bekaa": {pieces: {guerrilla: {underground: 3}}}}}],
  ["DK-020","unshaded",[plan(["botan"]),plan(["hakkari"])],active("hakkari",2)], ["DK-020","shaded",[],{tracks: {legitimacy: 9,europe: 2}}],
  ["DK-021","unshaded",["botan"],{...marker("botan","disputedHarm"),...track("europe",0)}], ["DK-021","shaded",["mardin-batman"],marker("mardin-batman","disputedHarm")],
  ["DK-022","unshaded",[],mod("strike-force")], ["DK-022","shaded",[],{tracks: {"resources.state": 9,"resources.pkk": 6}}],
  ["DK-023","unshaded",[],{spaces: {hakkari: {pieces: {troops: {default: 4}}},botan: {pieces: {troops: {default: 3}}}}}], ["DK-023","shaded",[],track("europe",2)],
  ["DK-024","unshaded",[],{tracks: {legitimacy: 12,"resources.state": 10}}], ["DK-024","shaded",[],marker("diyarbakir-city","reception")],
  ["DK-025","unshaded",["dersim"],{...marker("dersim","pkkHarm"),...track("europe",0)}], ["DK-025","shaded",["elazig"],marker("elazig","pkkHarm")],
  ["DK-026","unshaded",[],track("legitimacy",12)], ["DK-026","shaded",["diyarbakir-city"],level("diyarbakir-city",-1)],
  ["DK-027","unshaded",["2 in botan, 2 in hakkari",plan(["botan"])],troops("botan",4)], ["DK-027","shaded",[plan(["hakkari"])],{...active("hakkari",2),...track("resources.state",10)}],
  ["DK-028","unshaded",[plan(["europe"])],track("europe",0)], ["DK-028","shaded",[plan(["europe"])],track("europe",3)],
  ["DK-029","unshaded",[["sanliurfa"]],level("sanliurfa",2)], ["DK-029","shaded",[],{...level("diyarbakir-city",-1),...track("europe",2)}],
  ["DK-030","unshaded",[],{...marker("hakkari","pkkHarm",2),...track("europe",0)}], ["DK-030","shaded",[],marker("hakkari","pkkHarm",2)],
  ["DK-031","unshaded",[],{spaces: {hakkari: {pieces: {police: {default: 2},guards: {default: 3}}}}}], ["DK-031","shaded",[2,["hakkari"],["botan"]],{spaces: {hakkari: {pieces: {guards: {default: 1}}},botan: {pieces: {guards: {default: 1}}}}}],
  ["DK-032","unshaded",[],track("legitimacy",12)], ["DK-032","shaded",[],{tracks: {legitimacy: 9,europe: 2}}],
  ["DK-033","unshaded",["mardin-batman"],marker("mardin-batman","stateHarm")], ["DK-033","shaded",["hakkari"],{...level("hakkari",-2),...track("legitimacy",9)}],
  ["DK-034","unshaded",[plan(["botan"])],active("botan",1)], ["DK-034","shaded",[],{...level("botan",-2),...track("legitimacy",9)}],
];
for (const [card, side, answers, expected] of rows) it(`${card} ${side}: printed effect fixture`, () => {
  const faction = side === "unshaded" ? "state" : "pkk";
  let state: GameState = fixture(faction, card);
  if (card === "DK-013" && side === "unshaded") state = setPieces(setPieces(state,"kdp-zone","guerrilla",0),"kdp-zone","guerrilla",3,"active");
  if (card === "DK-033") state = setMarkers(state,"hakkari","pkkHarm",0);
  expect(play(state,{type: "ChooseEvent",faction,side,answers}).state).toMatchObject(expected);
});
it("enforces free action card constraints and original piece inventory", () => {
  expect(codes(fixture("state","DK-009"),{type: "ChooseEvent",faction: "state",side: "unshaded",answers: [plan(["europe"])]})).toContain("eventConstraint");
  expect(codes(fixture("state","DK-011"),{type: "ChooseEvent",faction: "state",side: "unshaded",answers: [plan(["sanliurfa"])]})).toContain("eventConstraint");
  const state = setPieces(setPieces(fixture("pkk","DK-031"),"hakkari","guards",1),"botan","guards",0);
  expect(codes(state,{type: "ChooseEvent",faction: "pkk",side: "shaded",answers: [2,["hakkari"],["hakkari"]]})).toContain("badAnswer");
});
it("DK-006 applies Guard Abuse once in every qualifying space before choosing a Guard-space shift", () => {
  const initial = setMarkers(setPieces(fixture("pkk","DK-006"),"mardin-batman","guards",1),"mardin-batman","disputedHarm",1);
  const {state} = play(initial,{type: "ChooseEvent",faction: "pkk",side: "shaded",answers: [["hakkari"]]});
  expect(state.tracks["legitimacy"]).toBe(7);
  expect(state.spaces["hakkari"]?.pieces["guards"]?.["default"]).toBe(1);
  expect(state.spaces["botan"]?.pieces["guards"]?.["default"]).toBe(1);
  expect(state.spaces["mardin-batman"]?.pieces["guards"]?.["default"]).toBe(0);
  expect(state.spaces["hakkari"]?.level).toBe(-1); // PKK Harm blocks Opposition.
  expect(state.spaces["botan"]?.markers["stateHarm"]?.["default"]).toBe(1);
});
it("Guard Abuse skips clean Guard spaces and applies only once when several Harm markers share a space", () => {
  const base = setPieces(setMarkers(fixture("pkk","DK-006"),"hakkari","stateHarm",1),"dersim","guards",1);
  const after = play(base,{type: "ChooseEvent",faction: "pkk",side: "shaded",answers: [["dersim"]]}).state;
  expect(after.tracks["legitimacy"]).toBe(8);
  expect(after.spaces["dersim"]?.pieces["guards"]?.["default"]).toBe(1);
  expect(after.spaces["dersim"]?.level).toBe(-1);
  expect(after.spaces["hakkari"]?.pieces["guards"]?.["default"]).toBe(1);
});
it("Guard Abuse with no Guards asks only the optional zero-space shift and changes no Legitimacy", () => {
  const base = withCard(turnOf("pkk"),"DK-006");
  expect(play(base,{type: "ChooseEvent",faction: "pkk",side: "shaded",answers: [[]]}).state.tracks["legitimacy"]).toBe(10);
});
it("structural C2 Always lines run on reveal and survive a choice of the opposite Event side", () => {
  const base = turnOf("pkk");
  const reveal = play({...base,turn: {...base.turn,phase: "setup"},deck: {...base.deck,currentCard: null,piles: [["DK-019","DK-020","DK-035"]]}},{type: "Advance"});
  expect(reveal.state.tracks["posture.syria"]).toBe("tolerant");
  const event = play(reveal.state,{type: "ChooseEvent",faction: "pkk",side: "shaded",answers: [null]});
  expect(event.state.tracks["posture.syria"]).toBe("host");
  const ohal = play(event.state,{type: "Pass",faction: "state"});
  expect(ohal.state.tracks["emergencyRule"]).toBe("ohal");
  expect(ohal.state.deck.currentCard).toBe("DK-020");
});
