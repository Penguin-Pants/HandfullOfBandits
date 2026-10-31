import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { rollDie } from "../src/engine/core/rng.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { getAction, storedSteps } from "../src/store/repos/actions.ts";
import { listCommands } from "../src/store/repos/commands.ts";
import { kurdishDir } from "./kurdish-package.ts";

it("saves, resumes, replays and undoes the rolling SA and replacement Rally as one action", () => {
  const dir = mkdtempSync(join(tmpdir(), "hob-pressure-"));
  const pkg = join(dir, "package");
  cpSync(kurdishDir, pkg, {recursive: true});
  const scenario = join(pkg, "scenarios/s0.yaml");
  writeFileSync(scenario, readFileSync(scenario, "utf8").replace("posture.kdp: host", "posture.kdp: tolerant"));
  const path = join(dir, "store.sqlite");
  let db = openStore(path);
  try {
    let service = new SessionService(db, dir);
    let created = service.createSession({dir: pkg, scenarioId: "s0", seed: 0, name: "backfire"});
    for (let seed = 1; rollDie(created.head.state.rng).value !== 1; seed++) {
      if (seed > 100) throw new Error("No backfire seed");
      created = service.createSession({dir: pkg, scenarioId: "s0", seed, name: "backfire"});
    }
    const id = created.sessionId;
    const revealed = service.submit(id, {type: "Advance"}, created.head.actionId);
    const original = {type: "ChooseOperation", faction: "pkk", box: "opSa", plan: {op: "pkk.rally", locations: ["kdp-zone"], perLocation: {}, sa: {action: "pkk.host-pressure", timing: "before", locations: ["kdp-zone"], perLocation: {}}, subActions: []}};
    const first = service.submit(id, original, revealed.actionId);
    expect(getAction(db, first.actionId)?.status).toBe("pending");
    const pendingHash = first.head.stateHash;
    db.close(); db = openStore(path); service = new SessionService(db, dir);
    expect(service.session(id).head.stateHash).toBe(pendingHash);
    expect(service.legalChoices(id)).toMatchObject({faction: "pkk", actions: [{id: "pkk.rally"}]});
    let session = service.session(id);
    expect(service.replayCheck(session.session, session.ruleset)).toBeNull();
    const next = service.submit(id, {type: "ChooseOperation", faction: "pkk", box: "opSa", plan: {op: "pkk.rally", locations: ["botan"], sa: null}}, first.actionId, first.head.stateHash);
    expect(next.actionId).toBe(first.actionId);
    expect(() => service.submit(id,{type: "Pass",faction: "state"},first.actionId,first.head.stateHash)).toThrow(/moved on/);
    expect(getAction(db, next.actionId)?.status).toBe("committed");
    expect(listCommands(db, next.actionId)).toHaveLength(2);
    session = service.session(id);
    expect(storedSteps(db, session.session.current_branch_id).steps.at(-1)?.commands).toHaveLength(2);
    expect(service.replayCheck(session.session, session.ruleset)).toBeNull();
    expect(service.undo(id, next.actionId, next.head.stateHash)).toMatchObject({head: revealed.actionId, undoneAfterRandom: true});
    expect(service.session(id).head.stateHash).toBe(revealed.head.stateHash);
    const again = service.submit(id, original, revealed.actionId);
    expect(service.undo(id, again.actionId, again.head.stateHash)).toMatchObject({head: revealed.actionId, undoneAfterRandom: true});
  } finally {db.close(); rmSync(dir, {recursive: true, force: true});}
});
