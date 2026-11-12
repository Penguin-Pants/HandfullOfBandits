import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { fuzz } from "../src/cli/fuzz.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { replayFile, replaySession } from "../src/cli/replay.ts";
import { withSessionOptions } from "../src/package/load.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

// P2-12: replay CLI (T-DET, golden replay) and random play (T-FUZZ, 09 s2).
const golden = fileURLToPath(new URL("golden/full-campaign-seed-7.json", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "hob-replay-"));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("sim replay", () => {
  it("reports the full campaign golden file identical", () => {
    expect(replayFile(golden, kurdishDir)).toEqual({ exitCode: 0, lines: ["identical (158 commands)"] });
  });

  it("replays a stored session from its stored package", () => {
    const file = join(dir, "store.sqlite");
    const db = openStore(file);
    const service = new SessionService(db, fileURLToPath(new URL("../../game-packages", import.meta.url)));
    const { sessionId, head } = service.createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed: 3, name: "replay" });
    let state = head.state;
    let headId = head.actionId;
    for (let i = 0; i < 5; i++) {
      const res = service.submit(sessionId, scriptedPolicy(engine, ruleset, state), headId);
      state = res.head.state;
      headId = res.actionId;
    }
    db.close();
    expect(replaySession(sessionId, file)).toEqual({ exitCode: 0, lines: ["identical (5 actions)"] });
    expect(replaySession("nope", file).exitCode).toBe(1);
  });
});

describe("session options (04 s10.3)", () => {
  it("apply the chosen options to the session ruleset, not the scenario defaults", () => {
    const db = openStore(join(dir, "options.sqlite"));
    const service = new SessionService(db, fileURLToPath(new URL("../../game-packages", import.meta.url)));
    const { sessionId } = service.createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed: 1, name: "deny", options: { syriaMarchRestricted: "deny" } });
    expect(service.session(sessionId).ruleset.scenarios["full-campaign"]?.options["syriaMarchRestricted"]).toBe("deny");
    db.close();
  });

  it("refuse an option value the manifest does not list and an unknown option", () => {
    const db = openStore(join(dir, "refuse.sqlite"));
    const service = new SessionService(db, fileURLToPath(new URL("../../game-packages", import.meta.url)));
    for (const options of [{ syriaMarchRestricted: "maybe" }, { hotPursuit: 40 }, { unknown: "allow" }]) {
      expect(() => service.createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed: 1, name: "bad", options })).toThrow(expect.objectContaining({ status: 400 }));
    }
    db.close();
  });

  it("a threshold option applies only in a scenario that lists it, as an integer (DEC-24)", () => {
    const full = ruleset.scenarios["full-campaign"];
    if (full === undefined) throw new Error("full-campaign");
    // Test fixture: the full campaign with a State threshold option, as the archived Scenario B had.
    const listed = { ...ruleset, scenarios: { ...ruleset.scenarios, "full-campaign": { ...full, options: { ...full.options, "threshold.state": 49 } } } };
    const thresholds = (r: typeof ruleset, options: Record<string, string | number>): unknown => withSessionOptions(r, "full-campaign", options).scenarios["full-campaign"]?.thresholds;
    expect(thresholds(listed, {})).toEqual({ state: 49, pkk: 30 });
    expect(thresholds(listed, { "threshold.state": "47" })).toEqual({ state: 47, pkk: 30 });
    expect(thresholds(listed, { "threshold.state": 47 })).toEqual({ state: 47, pkk: 30 });
    expect(() => thresholds(listed, { "threshold.state": "x" })).toThrow(/needs an integer/);
    expect(thresholds(ruleset, { "threshold.state": "47" })).toEqual({ state: 49, pkk: 30 });
  });
});

describe("T-FUZZ: 50 seeds of the full campaign with random legal choices", () => {
  const report = fuzz(engine, ruleset, "full-campaign", 50, () => 0);
  it("ends every game with no exception, dead end or step overrun", () => {
    expect(report.failures).toEqual([]);
    expect(report.games).toBe(50);
    expect(report.steps).toBeGreaterThan(50 * 9);
  });
});
