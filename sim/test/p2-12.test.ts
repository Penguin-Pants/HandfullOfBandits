import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { fuzz } from "../src/cli/fuzz.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { replayFile, replaySession } from "../src/cli/replay.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

// P2-12: replay CLI (T-DET, golden replay) and random play (T-FUZZ, 09 s2).
const golden = fileURLToPath(new URL("golden/s0-seed-7.json", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "hob-replay-"));
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("sim replay", () => {
  it("reports the IC-2a golden file identical", () => {
    expect(replayFile(golden, kurdishDir)).toEqual({ exitCode: 0, lines: ["identical (24 commands)"] });
  });

  it("replays a stored session from its stored package", () => {
    const file = join(dir, "store.sqlite");
    const db = openStore(file);
    const service = new SessionService(db, fileURLToPath(new URL("../../game-packages", import.meta.url)));
    const { sessionId, head } = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 3, name: "replay" });
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
    const { sessionId } = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 1, name: "deny", options: { syriaMarchRestricted: "deny" } });
    expect(service.session(sessionId).ruleset.scenarios["s0"]?.options["syriaMarchRestricted"]).toBe("deny");
    db.close();
  });
});

describe("T-FUZZ: 50 seeds of S0 with random legal choices", () => {
  const report = fuzz(engine, ruleset, "s0", 50, () => 0);
  it("ends every game with no exception, dead end or step overrun", () => {
    expect(report.failures).toEqual([]);
    expect(report.games).toBe(50);
    expect(report.steps).toBeGreaterThan(50 * 9);
  });
});
