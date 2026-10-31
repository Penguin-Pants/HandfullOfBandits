import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { afterAll, expect, it } from "vitest";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";
import { playGame, replay, scriptedPolicy, type PlayRecord } from "../src/cli/play.ts";
const golden = new URL("golden/scenario-a-seed-7.json",import.meta.url);
const game = playGame(engine,ruleset,"scenario-a",7,scriptedPolicy);
if (process.env["UPDATE_GOLDEN"] === "1" || !existsSync(golden)) {
  const record: PlayRecord = {scenario: game.scenario,seed: game.seed,commands: game.commands,hashes: game.hashes,ended: game.ended};
  writeFileSync(golden,`${JSON.stringify(record,null,1)}\n`);
}
const stored = JSON.parse(readFileSync(golden,"utf8")) as PlayRecord;
const temp = mkdtempSync(join(tmpdir(),"hob-a-cli-"));
afterAll(() => {rmSync(temp,{recursive: true,force: true});});
it("Scenario A passes V-ENCODE, uses the full setup and ends in round two", () => {
  const a = ruleset.scenarios["scenario-a"];
  expect(a?.blockedBy).toEqual([]);
  expect(a?.campaigns).toEqual(["C1","C2"]);
  expect(a?.pivotals).toEqual({state: [],pkk: ["DK-015"]});
  expect(engine.start(ruleset,"scenario-a",7).state.spaces).toEqual(engine.start(ruleset,"s0",7).state.spaces);
  expect(game.ended).toBe(true);
  expect(game.state.turn.propagandaRound).toBe(2);
  expect(game.state.ended?.reason).toBe("final scoring");
});
it("replays the Scenario A golden file hash by hash", () => {
  expect(game.hashes).toEqual(stored.hashes);
  expect(replay(engine,ruleset,stored)).toBeNull();
});
it("runs batch and golden replay through the real CLI", () => {
  const main = fileURLToPath(new URL("../src/cli/main.ts",import.meta.url));
  const out = join(temp,"paired metrics.csv");
  const batch = spawnSync(process.execPath,[main,"batch","--games","2","--strategy","concentration,coerce-only","--swap-seats","--package",kurdishDir,"--out",out],{encoding: "utf8"});
  expect(batch.status,batch.stderr).toBe(0);
  expect(batch.stdout).toContain("State:");
  expect(readFileSync(out,"utf8").trim().split("\n")).toHaveLength(5);
  const result = spawnSync(process.execPath,[main,"replay",fileURLToPath(golden),"--package",kurdishDir],{encoding: "utf8"});
  expect(result.status,result.stderr).toBe(0);
  expect(result.stdout).toContain(`identical (${String(game.commands.length)} commands)`);
});
