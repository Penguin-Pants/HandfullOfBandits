import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { scriptedPolicy } from "../src/cli/play.ts";
import type { AnyCommand, GameState } from "../src/engine/core/types.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { listMetrics } from "../src/store/repos/metrics.ts";
import { engine, ruleset } from "./board.ts";

// P2-11 integration suite: the HTTP API runs a short S0 session end to end.
const dir = mkdtempSync(join(tmpdir(), "hob-api-"));
const file = join(dir, "store.sqlite");
const packages = fileURLToPath(new URL("../../game-packages", import.meta.url));
const kurdish = join(packages, "kurdish-coin", "0.1.0");
const db = openStore(file);
const app = buildApp(new SessionService(db, packages));
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

interface HeadView {
  readonly actionId: string;
  readonly stateHash: string;
  readonly state: GameState;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- the caller names the response shape
async function call<T>(method: "GET" | "POST", url: string, payload?: unknown): Promise<{ status: number; body: T }> {
  const res = await app.inject({ method, url, ...(payload === undefined ? {} : { payload: payload as object }) });
  return { status: res.statusCode, body: res.json<T>() };
}

describe("HTTP API (P2-11)", () => {
  let sessionId = "";
  let head: HeadView | null = null;

  it("lists packages with validation, scenarios, blocked scenarios and assumptions", async () => {
    const { status, body } = await call<{ packageId: string; ok: boolean; scenarios: { id: string; blockedBy: string[] }[]; assumptions: unknown[] }[]>("GET", "/api/packages");
    expect(status).toBe(200);
    const pkg = body.find((p) => p.packageId === "kurdish-coin");
    expect(pkg?.ok).toBe(true);
    expect(pkg?.scenarios.find((s) => s.id === "s0")?.blockedBy).toEqual([]);
    expect(pkg?.scenarios.find((s) => s.id === "full-campaign")?.blockedBy.length).toBeGreaterThan(0);
    expect(pkg?.assumptions).toHaveLength(17);
  });

  it("refuses a blocked scenario and creates an S0 session", async () => {
    expect((await call("POST", "/api/sessions", { dir: kurdish, scenarioId: "full-campaign", seed: 7, name: "x" })).status).toBe(422);
    const created = await call<{ sessionId: string; head: HeadView }>("POST", "/api/sessions", { dir: kurdish, scenarioId: "s0", seed: 7, name: "API test" });
    expect(created.status).toBe(201);
    sessionId = created.body.sessionId;
    head = created.body.head;
    expect(head.state.deck.piles[0]).toHaveLength(9);
    expect((await call<unknown[]>("GET", "/api/sessions")).body).toHaveLength(1);
  });

  it("validates a command without changing the session, and lists legal choices", async () => {
    const result = await call<{ ok: boolean }>("POST", `/api/sessions/${sessionId}/validate`, { command: { type: "Pass", faction: "pkk" } });
    expect(result.body.ok).toBe(false);
    expect((await call<{ phase: string; advance: boolean }>("GET", `/api/sessions/${sessionId}/legal`)).body).toMatchObject({ phase: "setup", advance: true });
  });

  it("rejects a stale head (one active writer per session)", async () => {
    const stale = await call("POST", `/api/sessions/${sessionId}/commands`, { command: { type: "Advance" }, headActionId: "old" });
    expect(stale.status).toBe(409);
  });

  it("plays S0 to the end through the API, storing every action, the metrics row and the result", async () => {
    let state = head?.state;
    let headId = head?.actionId ?? "";
    let steps = 0;
    while (state !== undefined && state.ended === null && steps < 200) {
      const command: AnyCommand = scriptedPolicy(engine, ruleset, state);
      const res = await call<{ actionId: string; head: HeadView }>("POST", `/api/sessions/${sessionId}/commands`, { command, headActionId: headId });
      expect(res.status).toBe(200);
      headId = res.body.actionId;
      state = res.body.head.state;
      steps++;
      if (steps === 1) {
        // UC-5: forms for every action, so an Event's free action of the other faction can be planned.
        const legal = (await call<{ faction: string; forms: { id: string }[] }>("GET", `/api/sessions/${sessionId}/legal`)).body;
        expect(legal.faction).not.toBeNull();
        expect(legal.forms.map((f) => f.id)).toEqual(expect.arrayContaining(["state.garrison", "pkk.march"]));
      }
    }
    expect(state?.ended).not.toBeNull();
    const history = await call<{ action: { kind: string }; entries: { text: string }[] }[]>("GET", `/api/sessions/${sessionId}/history`);
    expect(history.body).toHaveLength(steps + 1);
    expect(history.body[1]?.entries[0]?.text).toMatch(/\.$/);
    expect(listMetrics(db, sessionId)).toHaveLength(1);
    const session = await call<{ session: { status: string } }>("GET", `/api/sessions/${sessionId}`);
    expect(session.body.session.status).toBe("ended");
  });

  it("saves a note with auto context on an action without moving the head", async () => {
    const history = await call<{ action: { action_id: string; state_hash_after: string } }[]>("GET", `/api/sessions/${sessionId}/history`);
    const target = history.body[2]?.action;
    const before = await call<{ head: HeadView }>("GET", `/api/sessions/${sessionId}`);
    const saved = await call<{ annotationId: string }>("POST", `/api/sessions/${sessionId}/annotations`, { anchor: "executed", actionId: target?.action_id, text: "Cheap move.", categoryIds: ["balance"] });
    expect(saved.status).toBe(201);
    const notes = await call<{ action_id: string; state_hash: string; context: string }[]>("GET", `/api/sessions/${sessionId}/annotations`);
    expect(notes.body[0]).toMatchObject({ action_id: target?.action_id, state_hash: target?.state_hash_after });
    expect(JSON.parse(notes.body[0]?.context ?? "{}")).toMatchObject({ session_id: sessionId, action_id: target?.action_id });
    expect((await call<{ head: HeadView }>("GET", `/api/sessions/${sessionId}`)).body.head.actionId).toBe(before.body.head.actionId);
  });

  it("stores a proposed note with the drafted plan and its violations (T-ANN-02)", async () => {
    const proposed = { type: "Pass", faction: "state" };
    const saved = await call<{ annotationId: string }>("POST", `/api/sessions/${sessionId}/annotations`, { anchor: "proposed", actionId: null, text: "Why not?", categoryIds: [], proposed });
    expect(saved.status).toBe(201);
    const notes = await call<{ annotation_id: string; anchor: string; action_id: string | null; context: string }[]>("GET", `/api/sessions/${sessionId}/annotations`);
    const note = notes.body.find((n) => n.annotation_id === saved.body.annotationId);
    expect(note).toMatchObject({ anchor: "proposed", action_id: null });
    const context = JSON.parse(note?.context ?? "{}") as { plan?: unknown; validation?: { violations: unknown[] } };
    expect(context.plan).toEqual(proposed);
    expect(context.validation?.violations.length).toBeGreaterThan(0);
  });

  it("ends a session with one debrief; a second debrief replaces the first (T-UI-06, T-ANN-08 store part)", async () => {
    const first = await call<{ debriefId: string }>("POST", `/api/sessions/${sessionId}/end`, { debrief: "Short game." });
    const second = await call<{ debriefId: string }>("POST", `/api/sessions/${sessionId}/end`, { debrief: "Short game, clear PKK lead." });
    expect(second.body.debriefId).toBe(first.body.debriefId);
    const notes = await call<{ anchor: string; text: string }[]>("GET", `/api/sessions/${sessionId}/annotations`);
    expect(notes.body.filter((n) => n.anchor === "debrief").map((n) => n.text)).toEqual(["Short game, clear PKK lead."]);
    expect((await call<{ debriefId: null }>("POST", `/api/sessions/${sessionId}/end`, { debrief: null })).body.debriefId).toBeNull();
  });

  it("serves a stored state by hash", async () => {
    const res = await call<{ state: GameState }>("GET", `/api/states/${head?.stateHash ?? ""}`);
    expect(res.body.state.meta.scenarioId).toBe("s0");
  });

  it("on resume with a changed code fingerprint, replays: identical stays active, different is read-only", () => {
    db.prepare("UPDATE sessions SET code_fingerprint = 'old', status = 'active' WHERE session_id = ?").run(sessionId);
    const fresh = new SessionService(db, packages);
    const { session } = fresh.session(sessionId);
    expect(session.status).toBe("active");
    // Changed rules: a different pass income changes the hash after the first Pass.
    const changed = { ...ruleset, sequence: { ...ruleset.sequence, passIncome: { state: 5, pkk: 5 } } };
    expect(fresh.replayCheck(session, changed)).toMatch(new RegExp(`^${sessionId}-A\\d+$`));
    expect(fresh.replayCheck(session, ruleset)).toBeNull();
  });
});
