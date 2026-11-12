// P4-15: real DK-084 commands survive save, reload and replay, with and without face choices.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { parse, stringify } from "yaml";
import { loadPackage, readPackageDir } from "../src/package/load.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { listCommands } from "../src/store/repos/commands.ts";
import { engine } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

it.each(["hostile", "host"])("stores and replays chosen and legacy faces into a %s zone", (posture) => {
  const dir = mkdtempSync(join(tmpdir(), "hob move faces "));
  const pkg = join(dir, "package with spaces");
  const path = join(dir, "store.sqlite");
  let db = openStore(path);
  try {
    cpSync(kurdishDir, pkg, { recursive: true });
    const file = join(pkg, "scenarios", "full-campaign.yaml");
    const scenario = parse(readFileSync(file, "utf8")) as { campaigns: string[]; tracks: Record<string, string>; spaces: Record<string, { pieces: Record<string, unknown> }> };
    scenario.campaigns = ["C5"];
    scenario.tracks["posture.puk"] = posture;
    const source = scenario.spaces["kdp-zone"];
    if (source === undefined) throw new Error("Missing KDP setup");
    source.pieces["guerrilla"] = { underground: 1, active: 2 };
    writeFileSync(file, stringify(scenario));
    const loaded = loadPackage(readPackageDir(pkg));
    if (!loaded.ok) throw new Error(JSON.stringify(loaded.issues));
    let seed = 0;
    while (engine.start(loaded.ruleset, "full-campaign", seed).state.deck.piles[0]?.[0] !== "DK-084") {
      if (++seed > 100) throw new Error("No DK-084 seed");
    }
    for (const choose of [false, true]) {
      let service = new SessionService(db, dir);
      const created = service.createSession({ dir: pkg, scenarioId: "full-campaign", seed, name: "face choices" });
      const id = created.sessionId;
      const revealed = service.submit(id, { type: "Advance" }, created.head.actionId);
      const command = { type: "ChooseEvent", faction: "pkk", side: "shaded", answers: ["KDP Zone to PUK Zone", 1, ...(choose ? [1] : []), "KDP Zone"], ...(choose ? { chooseMoveFaces: true } : {}) };
      const moved = service.submit(id, command, revealed.actionId);
      expect(JSON.parse(listCommands(db, moved.actionId)[0]?.payload ?? "null")).toEqual(command);
      const expected = choose || posture === "host" ? { underground: 0, active: 2 } : { underground: 1, active: 1 };
      expect(moved.head.state.spaces["kdp-zone"]?.pieces["guerrilla"]).toEqual(expected);
      db.close();
      db = openStore(path);
      service = new SessionService(db, dir);
      const resumed = service.session(id);
      expect(resumed.head.stateHash).toBe(moved.head.stateHash);
      expect(service.replayCheck(resumed.session, resumed.ruleset)).toBeNull();
    }
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
}, 30000);
