import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { scriptedPolicy } from "../src/cli/play.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine } from "./board.ts";
import { SHORT, short, shortPackage } from "./short-game.ts";

// Feedback prompt Phase 1: POST /api/sessions/:id/feedback saves a feedback note and returns the prompt.
const dir = mkdtempSync(join(tmpdir(), "hob-feedback-"));
const db = openStore(join(dir, "store.sqlite"));
const fixture = shortPackage("hob-feedback-short-");
const service = new SessionService(db, dir);
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
  rmSync(fixture.root, { recursive: true, force: true });
});

const { sessionId, head } = service.createSession({ dir: fixture.dir, scenarioId: SHORT, seed: 7, name: "feedback" });
let state = head.state;
let headId = head.actionId;
for (let i = 0; i < 3; i++) {
  const res = service.submit(sessionId, scriptedPolicy(engine, short.ruleset, state), headId);
  state = res.head.state;
  headId = res.actionId;
}
const space = Object.keys(state.spaces)[0] ?? "";

describe("POST /api/sessions/:id/feedback", () => {
  it("saves a feedback note and returns its prompt", async () => {
    const res = await app.inject({
      method: "POST", url: `/api/sessions/${sessionId}/feedback`,
      payload: { text: "Rally looks wrong here.", focus: { panel: "board", selectedSpace: space, selectedPieces: [], hoveredActionId: null }, diagnostics: { errors: [{ kind: "request", method: "POST", path: "/api/x?y=1", status: 409, message: "moved on" }] } },
    });
    expect(res.statusCode).toBe(201);
    const { annotationId, prompt } = res.json<{ annotationId: string; prompt: string }>();
    expect(service.annotations(sessionId).find((n) => n.annotation_id === annotationId)?.category_ids).toBe('["feedback"]');
    expect(prompt.startsWith("# Feedback from play\n\n> Rally looks wrong here.\n")).toBe(true);
    expect(prompt).toMatch(/Check out commit `([0-9a-f]{40}|unknown)`\./);
    expect(prompt).toContain(`Selected space: ${space}.`);
    expect(prompt).toContain("| state | human |");
    expect(prompt).toContain("- request POST /api/x: 409 moved on");
  });

  it("refuses a note with no text and an unknown session", async () => {
    const empty = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/feedback`, payload: { text: " " } });
    expect(empty.statusCode).toBe(400);
    const unknown = await app.inject({ method: "POST", url: "/api/sessions/nope/feedback", payload: { text: "x" } });
    expect(unknown.statusCode).toBe(404);
  });

  it("keeps a proposed command and shows its plan and validation (review: Codex P2)", async () => {
    const proposed = scriptedPolicy(engine, short.ruleset, state);
    const res = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/feedback`, payload: { anchor: "proposed", text: "Why is this legal?", proposed } });
    expect(res.statusCode).toBe(201);
    const { prompt } = res.json<{ prompt: string }>();
    expect(prompt).toContain(`## Proposed command\n\n\`${JSON.stringify(proposed)}\``);
    expect(prompt).toMatch(/Validation: `\{"violations":\[.*\],"warnings":/);
  });
});
