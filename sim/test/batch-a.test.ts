import { expect, it } from "vitest";
import { strategy } from "../src/cli/strategies/index.ts";
import { runBatch } from "../src/cli/batch.ts";
import { engine, ruleset, turnOf, setPieces } from "./board.ts";
import { asObject, asList } from "../src/engine/coin/ops/plan.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
it("uses faction-specific legal policies and a legal fallback when their faction is swapped", () => {
  const state = turnOf("state");
  const pkk = turnOf("pkk");
  expect(strategy("concentration")(engine,ruleset,state)).toMatchObject({plan: {op: "state.sweep",subActions: []}});
  expect(strategy("civic-action")(engine,ruleset,state)).toMatchObject({plan: {op: "state.train",subActions: [{action: "civicAction"}]}});
  const sanctuary = strategy("sanctuary")(engine,ruleset,pkk);
  expect(sanctuary).toMatchObject({plan: {op: "pkk.rally"}});
  expect(["kdp-zone","puk-zone","syria-bekaa"]).toContain(asList(asObject(sanctuary["plan"])?.["locations"])[0]);
  expect(strategy("coerce-only")(engine,ruleset,pkk)).toMatchObject({plan: {op: "pkk.coerce"}});
  expect(strategy("concealment")(engine,ruleset,setPieces(pkk,"botan","guerrilla",1,"active"))).toMatchObject({plan: {op: "pkk.rally",perLocation: {botan: {option: "flip"}}}});
  expect(strategy("sanctuary")(engine,ruleset,state)).toEqual(scriptedPolicy(engine,ruleset,state));
  expect(() => strategy("unknown")).toThrow(/Unknown strategy/);
});
it("runs ten Scenario A games, swaps policies with paired seeds and emits round CSV and win rates", () => {
  const report = runBatch(engine,ruleset,{games: 10,strategies: ["concentration","coerce-only"],swapSeats: true});
  expect(report.games).toHaveLength(10);
  expect(report.games[0]).toMatchObject({seed: 0,swapped: false,stateStrategy: "concentration",pkkStrategy: "coerce-only"});
  expect(report.games[1]).toMatchObject({seed: 0,swapped: true,stateStrategy: "coerce-only",pkkStrategy: "concentration"});
  expect(report.games.every(g => g.rounds > 0 && g.rounds <= 2)).toBe(true);
  expect(report.csv.split("\n")[0]).toContain("state_strategy,pkk_strategy");
  expect(report.csv).toContain("state_score,pkk_score");
  expect(report.summary.join("\n")).toContain("State:");
  expect(report.summary.join("\n")).toContain("PKK:");
});

it("flags eight-or-more wins in ten and records the early winning round with full metrics", () => {
  const a = ruleset.scenarios["scenario-a"];
  if (a === undefined) throw new Error("scenario-a");
  const r = {...ruleset,scenarios: {...ruleset.scenarios,"scenario-a": {...a,thresholds: {state: -100,pkk: 1000}}}};
  const report = runBatch(engine,r,{games: 10,strategies: ["concentration","coerce-only"],swapSeats: true});
  expect(report.summary[0]).toContain("10/10");
  expect(report.summary[0]).toContain("FLAG:");
  expect(report.csv.trim().split("\n")).toHaveLength(21);
  for (const line of report.csv.trim().split("\n").slice(1).filter(row => row.split(",")[5] === "2")) expect(line.split(",").slice(13,15)).toEqual(["0","0"]);
  for (const line of report.csv.trim().split("\n").slice(1)) expect(line.split(",").slice(7,23).every(cell => cell !== "")).toBe(true);
});
it("rejects invalid batch requests before starting a game", () => {
  for (const games of [0,-1,1.5,Number.NaN]) expect(() => runBatch(engine,ruleset,{games,strategies: ["scripted","scripted"],swapSeats: false})).toThrow(/games/);
  expect(() => runBatch(engine,ruleset,{games: 1,seed: -1,strategies: ["scripted","scripted"],swapSeats: false})).toThrow(/seed/);
  expect(() => runBatch(engine,ruleset,{games: 1,strategies: ["unknown","scripted"],swapSeats: false})).toThrow(/Unknown strategy/);
});
it("sanctuary stacking falls back when host boxes close instead of treating Europe as a camp", () => {
  const base = turnOf("pkk");
  const state = {...base,tracks: {...base.tracks,"posture.syria": "hostile","posture.kdp": "hostile","posture.puk": "hostile"}};
  expect(strategy("sanctuary")(engine,ruleset,state)).toEqual(scriptedPolicy(engine,ruleset,state));
});
