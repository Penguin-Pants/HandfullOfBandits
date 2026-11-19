// Audit Plan 3 A5: the app lists experiment runs, shows a run's report and opens one recorded game
// as a session at a chosen decision, through the HTTP API.
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { writeAnalysis } from "../src/cli/experiment-analysis.ts";
import { gameSteps, readArchive } from "../src/cli/experiment-artifacts.ts";
import { experimentCoverage } from "../src/cli/experiment-coverage.ts";
import { experimentRuns } from "../src/cli/experiment-viewer.ts";
import { runExperiment } from "../src/cli/experiment.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService, type ExperimentRuns } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { devManifest, tempDir, writeManifest } from "./experiment-helpers.ts";

const packages = fileURLToPath(new URL("../../game-packages", import.meta.url));
const root = tempDir("hob viewer ");
const runs = join(root, "runs");
const db = openStore(join(root, "store.sqlite"));
const reader = experimentRuns(runs);
const app = buildApp(new SessionService(db, packages, null, reader));
let gameId = "";

beforeAll(async () => {
  mkdirSync(runs);
  const dir = join(runs, "view-run");
  await runExperiment(writeManifest(root, devManifest({ id: "view-run", seeds: { registry: "development", blocks: [{ from: 71, count: 1 }] } })), dir);
  writeAnalysis(dir, experimentCoverage(dir));
  gameId = reader.detail("view-run").games[0]?.gameId ?? "";
}, 120000);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(root, { recursive: true, force: true });
});

const get = async (url: string): Promise<{ status: number; body: unknown }> => { const r = await app.inject({ method: "GET", url }); return { status: r.statusCode, body: r.json() }; };
const open = async (id: string, game: string, decisions?: unknown): Promise<{ status: number; body: Record<string, unknown> }> => {
  const r = await app.inject({ method: "POST", url: `/api/experiments/${encodeURIComponent(id)}/games/${encodeURIComponent(game)}/open`, payload: decisions === undefined ? {} : { decisions } });
  return { status: r.statusCode, body: r.json() };
};

describe("experiment report viewer (audit Plan 3 A5)", () => {
  it("lists runs and shows a run's report and its games with the review selection marked", async () => {
    const list = await get("/api/experiments");
    expect(list.body).toEqual([{ id: "view-run", stage: "development", description: "test", state: "complete", scheduled: 1, hasReport: true }]);
    const detail = await get("/api/experiments/view-run");
    expect(detail.status).toBe(200);
    const d = detail.body as { report: string; games: { gameId: string; status: string; review: boolean; commands: number }[] };
    expect(d.report).toContain("# Experiment view-run (development)");
    expect(d.games).toHaveLength(1);
    expect(d.games[0]).toMatchObject({ gameId, status: "complete", review: true });
  });

  it("opens a game at a decision: the session head is the recorded state after that command", async () => {
    const steps = gameSteps(join(runs, "view-run"), gameId, readArchive(join(runs, "view-run"))).steps;
    const opened = await open("view-run", gameId, 12);
    expect(opened.status).toBe(201);
    expect(opened.body).toMatchObject({ applied: 12, total: steps.length, divergedAt: null });
    const session = await get(`/api/sessions/${String(opened.body["sessionId"])}`);
    expect((session.body as { head: { stateHash: string } }).head.stateHash).toBe(steps[11]?.hash);
    const all = await open("view-run", gameId);
    expect(all.body).toMatchObject({ applied: steps.length, divergedAt: null });
    const end = await get(`/api/sessions/${String(all.body["sessionId"])}`);
    expect((end.body as { session: { status: string }; head: { stateHash: string } })).toMatchObject({ session: { status: "ended" }, head: { stateHash: steps.at(-1)?.hash } });
  }, 120000);

  it("rejects unknown runs and games, paths outside the root and decisions out of range", async () => {
    expect((await get("/api/experiments/nope")).status).toBe(404);
    expect((await get(`/api/experiments/${encodeURIComponent("../runs")}`)).status).toBe(404);
    expect((await open("view-run", "no-such-game")).status).toBe(404);
    expect((await open("view-run", gameId, -1)).status).toBe(400);
    expect((await open("view-run", gameId, 100000)).status).toBe(400);
    expect((await open("view-run", gameId, "3")).status).toBe(400);
  });

  it("stops before the first command whose recorded hash this engine does not reproduce", () => {
    const real = reader.game("view-run", gameId);
    const changed: ExperimentRuns = { ...reader, game: () => ({ ...real, steps: real.steps.map((x, i) => (i === 4 ? { ...x, hash: "0".repeat(64) } : x)) }) };
    const service = new SessionService(db, packages, null, changed);
    expect(service.openExperimentGame("view-run", gameId, 10)).toMatchObject({ applied: 4, divergedAt: 5 });
    const moved: ExperimentRuns = { ...reader, game: () => ({ ...real, startHash: "0".repeat(64) }) };
    expect(() => new SessionService(db, packages, null, moved).openExperimentGame("view-run", gameId, 3)).toThrow(/starts from another position/);
  });

  it("shows no runs when the server has no reader", async () => {
    const bare = buildApp(new SessionService(db, packages));
    expect((await bare.inject({ method: "GET", url: "/api/experiments" })).json()).toEqual([]);
    expect((await bare.inject({ method: "GET", url: "/api/experiments/view-run" })).statusCode).toBe(404);
    await bare.close();
  });
});
