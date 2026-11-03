import type { Engine } from "../engine/index.ts";
import type { Ruleset } from "../engine/core/types.ts";
import { playGame, type PlayRecord, type Policy } from "./play.ts";
import { decisionFaction } from "./strategies/index.ts";

/** A faction-specific matchup; callers must identify the exact rules and player versions. */
export interface ExperimentManifest {
  readonly id: string;
  readonly scenario: string;
  readonly rulesHash: string;
  readonly engineVersion: string;
  readonly statePlayer: string;
  readonly pkkPlayer: string;
  readonly seeds: readonly number[];
}

/** Record every command and state hash so each game can be independently replayed. */
export function runExperiment(engine: Engine, ruleset: Ruleset, manifest: ExperimentManifest, players: {readonly state: Policy; readonly pkk: Policy}): readonly PlayRecord[] {
  if (manifest.rulesHash !== ruleset.packageHash) throw new Error("Manifest rules hash does not match loaded package");
  if (ruleset.scenarios[manifest.scenario] === undefined) throw new Error("Unknown scenario");
  if ([manifest.id, manifest.engineVersion, manifest.statePlayer, manifest.pkkPlayer].some(value => value.trim() === "")) throw new Error("Manifest identity fields must not be empty");
  if (manifest.seeds.some(seed => !Number.isSafeInteger(seed) || seed < 0) || new Set(manifest.seeds).size !== manifest.seeds.length) throw new RangeError("Seeds must be distinct non-negative safe integers");
  return manifest.seeds.map(seed => {
    const game = playGame(engine, ruleset, manifest.scenario, seed, (e, r, state) => {
      const faction = decisionFaction(r, state);
      return (faction === "pkk" ? players.pkk : players.state)(e, r, state);
    });
    return {scenario: game.scenario, seed: game.seed, commands: game.commands, hashes: game.hashes, ended: game.ended};
  });
}
