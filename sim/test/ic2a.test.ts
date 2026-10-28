import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { playGame, replay, scriptedPolicy, type PlayRecord } from "../src/cli/play.ts";
import { engine, ruleset } from "./board.ts";

// IC-2a (11 build plan): the engine plays S0 to the end from a scripted policy and a fixed seed.
// The golden replay file holds the commands and the state hash after each one. Regenerate it only
// after a deliberate rules change: UPDATE_GOLDEN=1 make test.
const golden = new URL("golden/s0-seed-7.json", import.meta.url);
const SEED = 7;

describe("IC-2a: S0 engine-only playthrough", () => {
  const game = playGame(engine, ruleset, "s0", SEED, scriptedPolicy);
  if (process.env["UPDATE_GOLDEN"] === "1" || !existsSync(golden)) {
    const record: PlayRecord = { scenario: game.scenario, seed: game.seed, commands: game.commands, hashes: game.hashes, ended: game.ended };
    writeFileSync(golden, `${JSON.stringify(record, null, 1)}\n`);
  }
  const stored = JSON.parse(readFileSync(golden, "utf8")) as PlayRecord;

  it("plays every card and the final Propaganda round to final scoring", () => {
    expect(game.ended).toBe(true);
    expect(game.state.deck.played).toHaveLength(8);
    expect(game.state.ended).toMatchObject({ reason: "final scoring", labels: ["narrow", "test result, not comparable"] });
  });

  it("matches the golden replay hash by hash", () => {
    expect(game.hashes).toEqual(stored.hashes);
    expect(replay(engine, ruleset, stored)).toBeNull();
  });

  it("reports the first differing step when a command changes", () => {
    const changed = { ...stored, commands: stored.commands.map((c, i) => (i === 1 ? { type: "Pass", faction: "state" } : c)) };
    expect(replay(engine, ruleset, changed)?.step).toBeGreaterThan(0);
  });
});
