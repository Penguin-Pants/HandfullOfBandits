// Phase 2 (20): durable runner, CLI and replay. Real worker threads and the real CLI.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync, gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { Artifacts, fsWriter, readJournal, type ArtifactWriter } from "../src/cli/experiment-artifacts.ts";
import { runExperiment, type GameRecord } from "../src/cli/experiment.ts";
import { runGame, type JournalEvent } from "../src/cli/game-runner.ts";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import type { ObservationPlayer } from "../src/cli/players.ts";
import { replayExperiment } from "../src/cli/replay.ts";
import { engine, ruleset } from "./board.ts";
import { devManifest, tempDir, writeManifest } from "./experiment-helpers.ts";

const main = fileURLToPath(new URL("../src/cli/main.ts", import.meta.url));
const results = (dir: string): GameRecord[] => JSON.parse(readFileSync(join(dir, "results.json"), "utf8")) as GameRecord[];
/** Results without wall-clock fields, for semantic comparison. */
const semantic = (dir: string): unknown => results(dir).map((r) => ({ ...r, ms: 0 }));

describe("experiment runner (20 Phase 2)", () => {
  it("runs several seeds through the real CLI into a path with spaces and replays every game", () => {
    const dir = tempDir("hob exp cli ");
    const manifest = writeManifest(dir, devManifest());
    const out = join(dir, "run one");
    const run = spawnSync(process.execPath, [main, "experiment", "run", manifest, "--out", out], { encoding: "utf8" });
    expect(run.status, run.stderr + run.stdout).toBe(0);
    expect(run.stdout).toContain("\"complete\":3");
    for (const f of ["manifest.json", "identity.json", "players.json", "package-content.json", "schedule.json", "results.json", "failures.json", "status.json"]) expect(existsSync(join(out, f))).toBe(true);
    expect(JSON.parse(readFileSync(join(out, "status.json"), "utf8"))).toMatchObject({ state: "complete", scheduled: 3, recorded: 3 });
    expect(readdirSync(join(out, "games")).every((f) => f.endsWith(".jsonl.gz"))).toBe(true);
    const replay = spawnSync(process.execPath, [main, "experiment", "replay", out], { encoding: "utf8" });
    expect(replay.status, replay.stdout).toBe(0);
    expect(replay.stdout).toContain("3/3 games identical");
    // Wrong flags and an existing output directory are rejected.
    expect(spawnSync(process.execPath, [main, "experiment", "run", manifest, "--outt", out], { encoding: "utf8" }).status).toBe(2);
    const again = spawnSync(process.execPath, [main, "experiment", "run", manifest, "--out", out], { encoding: "utf8" });
    expect(again.status).toBe(1);
    expect(again.stdout).toContain("already exists");
  }, 120000);

  it("reproduces the same commands, hashes and results on a rerun, and keeps options in replay", async () => {
    const dir = tempDir();
    const manifest = writeManifest(dir, devManifest({ conditions: [{ id: "deny", options: { hotPursuit: "deny", syriaMarchRestricted: "deny" } }], seeds: { registry: "development", blocks: [{ from: 21, count: 2 }] } }));
    const a = await runExperiment(manifest, join(dir, "a"));
    const b = await runExperiment(manifest, join(dir, "b"));
    expect(a.experimentHash).toBe(b.experimentHash);
    expect(semantic(join(dir, "a"))).toEqual(semantic(join(dir, "b")));
    const steps = (d: string): unknown[] => readJournal(d, results(d)[0]?.gameId ?? "").flatMap((e) => (e.t === "step" ? [[e.command, e.hash]] : []));
    expect(steps(join(dir, "a"))).toEqual(steps(join(dir, "b")));
    expect(replayExperiment(join(dir, "a")).exitCode).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, "a", "identity.json"), "utf8"))).toMatchObject({ conditions: { deny: { hotPursuit: "deny", syriaMarchRestricted: "deny" } } });
  }, 120000);

  it("detects a changed hash in a journal", async () => {
    const dir = tempDir();
    const out = join(dir, "run");
    await runExperiment(writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 31, count: 1 }] } })), out);
    const id = results(out)[0]?.gameId ?? "";
    const file = join(out, "games", `${id.replaceAll(/[^A-Za-z0-9._-]/g, "_")}.jsonl.gz`);
    const lines = gunzipSync(readFileSync(file)).toString("utf8").split("\n");
    const step = JSON.parse(lines[3] ?? "{}") as { hash: string };
    lines[3] = JSON.stringify({ ...step, hash: "0".repeat(64) });
    writeFileSync(file, gzipSync(lines.join("\n")));
    const replay = replayExperiment(out);
    expect(replay.exitCode).toBe(1);
    expect(replay.lines[0]).toContain("differs at step 3");
  }, 120000);

  it("does not count a truncated journal of a completed game as identical", async () => {
    const dir = tempDir();
    const out = join(dir, "cut");
    await runExperiment(writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 33, count: 1 }] } })), out);
    const id = results(out)[0]?.gameId ?? "";
    const file = join(out, "games", `${id.replaceAll(/[^A-Za-z0-9._-]/g, "_")}.jsonl.gz`);
    const lines = gunzipSync(readFileSync(file)).toString("utf8").trim().split("\n");
    writeFileSync(file, gzipSync(lines.slice(0, 5).join("\n")));
    const replay = replayExperiment(out);
    expect(replay.exitCode).toBe(1);
    expect(replay.lines.join("\n")).toMatch(/incomplete replay/);
  }, 120000);

  it("records a game that exceeds its wall limit as a timeout with a replayable prefix, and continues", async () => {
    const dir = tempDir();
    const out = join(dir, "slow");
    const outcome = await runExperiment(writeManifest(dir, devManifest({ matchups: [{ state: "S-ADAPT@1", pkk: "P-ADAPT@1" }, { state: "S-RANDOM@1", pkk: "P-RANDOM@1" }], seeds: { registry: "development", blocks: [{ from: 41, count: 1 }] }, limits: { commands: 2000, decisionMs: null, gameMs: 1000 } })), out);
    // Every scheduled game is recorded; the fast game may also time out under heavy test load.
    expect((outcome.byStatus["timeout"] ?? 0) + (outcome.byStatus["complete"] ?? 0)).toBe(2);
    const [slow] = results(out);
    expect(slow?.status).toBe("timeout");
    expect(readJournal(out, slow?.gameId ?? "").at(-1)).toMatchObject({ t: "end", status: "timeout" });
    expect((JSON.parse(readFileSync(join(out, "failures.json"), "utf8")) as unknown[])[0]).toEqual({ gameId: slow?.gameId, status: "timeout", reason: expect.stringContaining("worker terminated") as unknown, replayablePrefix: slow?.commands });
    expect(replayExperiment(out).exitCode).toBe(0);
  }, 30000);

  it("persists replayable setup before a worker can stall or exit during startup", async () => {
    const dir = tempDir();
    for (const [name, code, status] of [["stall", "setInterval(() => {}, 1000);", "timeout"], ["exit", "process.exit(3);", "workerError"]] as const) {
      const worker = join(dir, `${name}.mjs`);
      writeFileSync(worker, code);
      const out = join(dir, name);
      const manifest = writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 41, count: 1 }] }, limits: { commands: 5, decisionMs: null, gameMs: 1000 } }));
      const outcome = await runExperiment(manifest, out, { workerUrl: pathToFileURL(worker) });
      expect(outcome.byStatus).toEqual({ [status]: 1 });
      const game = results(out)[0];
      expect(game?.startHash).toMatch(/^[0-9a-f]{64}$/);
      expect(game?.finalHash).toBe(game?.startHash);
      expect(readJournal(out, game?.gameId ?? "").map((e) => e.t)).toEqual(["start", "end"]);
      expect(replayExperiment(out).exitCode).toBe(0);
    }
  }, 30000);

  it("aborts if the worker reports a different setup", async () => {
    const dir = tempDir();
    const worker = join(dir, "wrong-setup.mjs");
    writeFileSync(worker, 'import { parentPort } from "node:worker_threads"; parentPort.on("message", () => parentPort.postMessage({ t: "start", startHash: "wrong" }));');
    const out = join(dir, "wrong");
    const manifest = writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 41, count: 1 }] } }));
    await expect(runExperiment(manifest, out, { workerUrl: pathToFileURL(worker) })).rejects.toThrow("Worker setup differs");
    expect(JSON.parse(readFileSync(join(out, "status.json"), "utf8"))).toMatchObject({ state: "aborted" });
  }, 30000);

  it("records a worker that dies as workerError and a command cap as commandLimit", async () => {
    const dir = tempDir();
    const dying = join(dir, "dying-worker.mjs");
    writeFileSync(dying, "process.exit(3);\n");
    const out = join(dir, "dead");
    const outcome = await runExperiment(writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 51, count: 2 }] } })), out, { workerUrl: pathToFileURL(dying) });
    expect(outcome.byStatus).toEqual({ workerError: 2 });
    const capped = await runExperiment(writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 51, count: 1 }] }, limits: { commands: 5, decisionMs: null, gameMs: 60000 } }), "capped.json"), join(dir, "capped"));
    expect(capped.byStatus).toEqual({ commandLimit: 1 });
    expect(replayExperiment(join(dir, "capped")).exitCode).toBe(0);
  }, 120000);

  it("stops with an aborted status when the disk fails", async () => {
    const dir = tempDir();
    let appends = 0;
    const failing: ArtifactWriter = { ...fsWriter, append: (file, data) => { if (++appends > 3) throw new Error("ENOSPC: no space left"); fsWriter.append(file, data); } };
    const out = join(dir, "full");
    await expect(runExperiment(writeManifest(dir, devManifest({ concurrency: 3 })), out, { writer: failing })).rejects.toThrow(/ENOSPC/);
    // Every worker stops: no game writes after the rejection.
    const after = appends;
    await new Promise((r) => setTimeout(r, 1500));
    expect(appends).toBe(after);
    expect(JSON.parse(readFileSync(join(out, "status.json"), "utf8"))).toMatchObject({ state: "aborted", error: "ENOSPC: no space left" });
  }, 120000);

  it("recovers the valid prefix of a journal with a truncated last line", () => {
    const dir = tempDir();
    const a = new Artifacts(join(dir, "x"));
    a.create();
    const start: JournalEvent = { t: "start", gameId: "g", seed: 1, startHash: "h", job: { gameId: "g", seed: 1, conditionId: "c", players: {}, playerSeeds: {}, repeat: 0 }, deck: [] };
    a.journal("g", start);
    writeFileSync(join(dir, "x", "games", "g.jsonl"), `${JSON.stringify(start)}\n{"t":"step","i":0,"comm`, { flag: "w" });
    expect(readJournal(join(dir, "x"), "g")).toEqual([start]);
  });
});

describe("game failures are incomplete, never losses (19 s5, s7)", () => {
  const play = (pkk: ObservationPlayer, limits = { commands: 2000, decisionMs: null }): JournalEvent[] => {
    const events: JournalEvent[] = [];
    runGame(engine, ruleset, "scenario-a", { gameId: "g", seed: 3, conditionId: "c", players: { state: "S-RANDOM@1", pkk: "P-X@1" }, playerSeeds: { state: 1, pkk: 2 }, repeat: 0 }, (id) => (id === "P-X@1" ? pkk : resolvePlayer(id)), limits, (e) => events.push(e));
    return events;
  };
  const random = resolvePlayer("P-RANDOM@1") as ObservationPlayer;

  it("ends with failed status when a player throws, keeping the prefix", () => {
    let calls = 0;
    const events = play({ spec: { ...random.spec, id: "P-X@1" }, decide: (r, c) => { if (++calls > 2) throw new Error("boom"); return random.decide(r, c); } });
    expect(events.at(-1)).toMatchObject({ t: "end", status: "failed", result: null });
    expect(JSON.stringify(events.at(-1))).toContain("boom");
    expect(events.filter((e) => e.t === "step").length).toBeGreaterThan(0);
  });

  it("rejects an unknown candidate instead of substituting another player", () => {
    const events = play({ spec: { ...random.spec, id: "P-X@1" }, decide: () => ({ candidateId: "made-up", value: 0, components: {}, topAlternative: null, notes: [] }) });
    expect(events.at(-1)).toMatchObject({ t: "end", status: "failed" });
    expect(JSON.stringify(events.at(-1))).toContain("unknown candidate");
  });

  it("refuses a player whose faction differs from its seat", () => {
    expect(() => runGame(engine, ruleset, "scenario-a", { gameId: "g", seed: 3, conditionId: "c", players: { state: "P-RANDOM@1", pkk: "P-RANDOM@1" }, playerSeeds: {}, repeat: 0 }, resolvePlayer, { commands: 10, decisionMs: null }, () => undefined)).toThrow(/plays pkk, not state/);
  });

  it("applies the decision time limit to full-state controls too", () => {
    let now = 0;
    const events: JournalEvent[] = [];
    runGame(engine, ruleset, "scenario-a", { gameId: "g", seed: 3, conditionId: "c", players: { state: "S-CTRL-concentration@1", pkk: "P-CTRL-sanctuary@1" }, playerSeeds: { state: 1, pkk: 2 }, repeat: 0 }, resolvePlayer, { commands: 2000, decisionMs: 5 }, (e) => events.push(e), () => (now += 10));
    expect(events.at(-1)).toMatchObject({ t: "end", status: "decisionTimeLimit" });
  });

  it("ends with decisionTimeLimit when a decision is too slow", () => {
    let now = 0;
    const events: JournalEvent[] = [];
    runGame(engine, ruleset, "scenario-a", { gameId: "g", seed: 3, conditionId: "c", players: { state: "S-RANDOM@1", pkk: "P-RANDOM@1" }, playerSeeds: { state: 1, pkk: 2 }, repeat: 0 }, resolvePlayer, { commands: 2000, decisionMs: 5 }, (e) => events.push(e), () => (now += 10));
    expect(events.at(-1)).toMatchObject({ t: "end", status: "decisionTimeLimit" });
  });
});

describe("resume an interrupted run", () => {
  it("keeps sealed games, replays unfinished ones and gives the same results as an uninterrupted run", async () => {
    const dir = tempDir("hob resume ");
    const manifest = writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 71, count: 4 }] } }));
    const full = join(dir, "full");
    await runExperiment(manifest, full);
    // Simulate a restart: two games never finished (one sealed journal removed, one left as a plain partial file),
    // no results and a running status.
    const cut = join(dir, "cut");
    cpSync(full, cut, { recursive: true });
    const [kept, lost, partial] = results(full).map((r) => r.gameId);
    const sealed = (id: string | undefined): string => join(cut, "games", `${(id ?? "").replaceAll(/[^A-Za-z0-9._-]/g, "_")}.jsonl`);
    rmSync(`${sealed(lost)}.gz`);
    const lines = gunzipSync(readFileSync(`${sealed(partial)}.gz`)).toString("utf8").split("\n").slice(0, 3);
    rmSync(`${sealed(partial)}.gz`);
    writeFileSync(sealed(partial), `${lines.join("\n")}\n{"t":"st`);
    for (const f of ["results.json", "failures.json"]) rmSync(join(cut, f));
    writeFileSync(join(cut, "status.json"), JSON.stringify({ state: "running", scheduled: 4 }));
    // The run started under another commit: its recorded experiment hash stays the run's identity.
    const identity = JSON.parse(readFileSync(join(cut, "identity.json"), "utf8")) as Record<string, unknown>;
    writeFileSync(join(cut, "identity.json"), JSON.stringify({ ...identity, experimentHash: "f".repeat(64) }));
    const before = readFileSync(`${sealed(kept)}.gz`);
    const log: string[] = [];
    const run = spawnSync(process.execPath, [main, "experiment", "run", manifest, "--out", cut, "--resume"], { encoding: "utf8" });
    expect(run.status, run.stderr + run.stdout).toBe(0);
    log.push(run.stdout);
    expect(log.join()).toContain("resuming: 2 of 4 games kept");
    expect(log.join()).toContain(`experiment ${"f".repeat(64)} in`);
    expect(semantic(cut)).toEqual(semantic(full));
    expect(readFileSync(`${sealed(kept)}.gz`)).toEqual(before);
    expect(existsSync(sealed(partial))).toBe(false);
    expect(JSON.parse(readFileSync(join(cut, "status.json"), "utf8"))).toMatchObject({ state: "complete", recorded: 4, resumes: [{ kept: 2 }] });
    expect(replayExperiment(cut).lines.at(-1)).toBe("4/4 games identical");
  }, 120000);

  it("refuses to resume a complete run, a missing directory or a different manifest", async () => {
    const dir = tempDir();
    const manifest = writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 75, count: 1 }] } }));
    const out = join(dir, "run");
    await expect(runExperiment(manifest, out, { resume: true })).rejects.toThrow(/nothing to resume/);
    await runExperiment(manifest, out);
    await expect(runExperiment(manifest, out, { resume: true })).rejects.toThrow(/already complete/);
    writeFileSync(join(out, "status.json"), JSON.stringify({ state: "running" }));
    const other = writeManifest(dir, devManifest({ seeds: { registry: "development", blocks: [{ from: 76, count: 1 }] } }), "other.json");
    await expect(runExperiment(other, out, { resume: true })).rejects.toThrow(/different manifest/);
  }, 120000);
});
