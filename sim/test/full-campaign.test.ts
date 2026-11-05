// P3c-02: full campaign scenario (research 10 s2) and a long golden replay. Accept: the full
// campaign replays in under 10 seconds (05 s11). Scripted policy, seed 7. UPDATE_GOLDEN=1 rewrites the file.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { playGame, replay, scriptedPolicy, type PlayRecord } from "../src/cli/play.ts";
import { replayFile } from "../src/cli/replay.ts";
import { setupState } from "../src/engine/core/state.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

describe("full campaign setup (10 s2.1, s2.2, s2.3)", () => {
  const state = engine.start(ruleset, "full-campaign", 1).state;

  it("starts every track at its 10 s2.1 value in C1", () => {
    expect(state.turn.campaign).toBe("C1");
    expect(state.tracks).toMatchObject({
      "resources.state": 12, "resources.pkk": 5, legitimacy: 10, emergencyRule: "martialLaw", "posture.syria": "host", "posture.kdp": "host",
      "posture.puk": "tolerant", europe: 1, ceasefire: "none", legalSpace: "absent",
    });
  });

  it("sets the 10 s2.2 levels, the Leadership and no other marker", () => {
    const levels = Object.fromEntries(Object.entries(setupState(ruleset, "full-campaign", 1).spaces).filter(([, s]) => s.level !== null && s.level !== 0).map(([id, s]) => [id, s.level]));
    expect(levels).toEqual({ hakkari: -1, botan: -1, sanliurfa: 1, adiyaman: 1, elazig: 1, "western-cities": 1 });
    const markers = Object.entries(state.spaces).flatMap(([id, s]) => Object.entries(s.markers).flatMap(([m, sides]) => Object.entries(sides).filter(([, n]) => n > 0).map(([side]) => `${id}:${m}:${side}`)));
    expect(markers).toEqual(["syria-bekaa:leadership:present"]);
  });

  it("deals five piles, one per Campaign, and the 10 s2.3 Pivotal hands", () => {
    expect(state.deck.piles).toHaveLength(5);
    expect(state.hands).toEqual({ state: ["DK-076", "DK-098"], pkk: ["DK-015", "DK-054"] });
    expect(state.flags).toMatchObject({ law3175: false });
  });
});

describe("full campaign golden (seed 7)", () => {
  const golden = new URL("golden/full-campaign-seed-7.json", import.meta.url);
  const game = playGame(engine, ruleset, "full-campaign", 7, scriptedPolicy);
  if (process.env["UPDATE_GOLDEN"] === "1" || !existsSync(golden)) {
    const record: PlayRecord = { scenario: game.scenario, seed: game.seed, commands: game.commands, hashes: game.hashes, ended: game.ended };
    writeFileSync(golden, `${JSON.stringify(record, null, 1)}\n`);
  }
  const stored = JSON.parse(readFileSync(golden, "utf8")) as PlayRecord;

  it("plays all five Campaigns to final scoring in round five", () => {
    expect(game.ended).toBe(true);
    expect(game.state.turn).toMatchObject({ campaign: "C5", propagandaRound: 5 });
    expect(game.state.ended?.reason).toBe("final scoring");
  });

  it("replays the golden file hash by hash", () => {
    expect(game.hashes).toEqual(stored.hashes);
    expect(replay(engine, ruleset, stored)).toBeNull();
  });

  it("replays through the CLI, package load included, in under 10 seconds (05 s11)", () => {
    const start = performance.now();
    expect(replayFile(fileURLToPath(golden), kurdishDir)).toEqual({ exitCode: 0, lines: [`identical (${String(stored.commands.length)} commands)`] });
    expect(performance.now() - start).toBeLessThan(10_000);
  });
});
