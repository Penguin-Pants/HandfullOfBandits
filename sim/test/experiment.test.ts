import { expect, it } from "vitest";
import { engine, ruleset } from "./board.ts";
import { runExperiment } from "../src/cli/experiment.ts";
import { replay, scriptedPolicy } from "../src/cli/play.ts";

it("records reproducible Scenario A matchups and rejects repeated seeds", () => {
  const manifest = {id: "test", scenario: "scenario-a", rulesHash: ruleset.packageHash, engineVersion: "test", statePlayer: "scripted", pkkPlayer: "scripted", seeds: [7]};
  const players = {state: scriptedPolicy, pkk: scriptedPolicy};
  const games = runExperiment(engine, ruleset, manifest, players);
  expect(games[0]?.ended).toBe(true);
  const first = games[0];
  expect.assert(first !== undefined);
  expect(replay(engine, ruleset, first)).toBeNull();
  expect(runExperiment(engine, ruleset, manifest, players)).toEqual(games);
  expect(() => runExperiment(engine, ruleset, {...manifest, seeds: [7, 7]}, players)).toThrow();
  expect(() => runExperiment(engine, ruleset, {...manifest, rulesHash: "wrong"}, players)).toThrow();
});
