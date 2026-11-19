// Experiment run reader for the app (audit Plan 3 A5): lists the run directories under one root,
// reads a run's latest report and games, and gives the recorded commands of one game so the server
// can open it as a session. The server wires this module in from the app entry (server code
// cannot import cli). Only directory names found under the root are accepted as run IDs.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gameSteps, readArchive } from "./experiment-artifacts.ts";
import type { GameRecord } from "./experiment.ts";
import type { GameJob } from "./game-runner.ts";

const json = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));

/** The newest `analysis-v<n>` folder of a run that holds a report, or null. */
function latestAnalysis(dir: string): string | null {
  const versions = readdirSync(dir).flatMap((name) => { const m = /^analysis-v(\d+)$/.exec(name); return m === null || !existsSync(join(dir, name, "report.md")) ? [] : [Number(m[1])]; });
  return versions.length === 0 ? null : join(dir, `analysis-v${String(Math.max(...versions))}`);
}

export function experimentRuns(root: string) {
  const ids = (): string[] => (existsSync(root) ? readdirSync(root).filter((id) => statSync(join(root, id)).isDirectory() && existsSync(join(root, id, "manifest.json"))).sort() : []);
  const dirOf = (id: string): string => {
    if (!ids().includes(id)) throw new RangeError(`Unknown experiment run "${id}".`);
    return join(root, id);
  };
  const summary = (id: string) => {
    const dir = join(root, id);
    const manifest = json(join(dir, "manifest.json")) as { stage: string; description: string };
    const status = existsSync(join(dir, "status.json")) ? (json(join(dir, "status.json")) as { state?: string; scheduled?: number }) : {};
    return { id, stage: manifest.stage, description: manifest.description, state: status.state ?? "unknown", scheduled: status.scheduled ?? 0, hasReport: latestAnalysis(dir) !== null };
  };
  return {
    list: () => ids().map(summary),
    detail: (id: string) => {
      const dir = dirOf(id);
      const analysis = latestAnalysis(dir);
      const review = new Set(analysis === null || !existsSync(join(analysis, "analysis.json")) ? [] : (json(join(analysis, "analysis.json")) as { review?: { all?: string[] } }).review?.all ?? []);
      const results = existsSync(join(dir, "results.json")) ? (json(join(dir, "results.json")) as GameRecord[]) : [];
      return {
        ...summary(id),
        report: analysis === null ? null : readFileSync(join(analysis, "report.md"), "utf8"),
        games: results.map((g) => ({ gameId: g.gameId, condition: g.conditionId, state: g.state, pkk: g.pkk, seed: g.seed, status: g.status, winner: g.result?.winner ?? null, commands: g.commands, review: review.has(g.gameId) })),
      };
    },
    game: (id: string, gameId: string) => {
      const dir = dirOf(id);
      const job = (json(join(dir, "schedule.json")) as GameJob[]).find((j) => j.gameId === gameId);
      if (job === undefined) throw new RangeError(`Run "${id}" has no game "${gameId}".`);
      const identity = json(join(dir, "identity.json")) as { scenario: string; conditions: Record<string, Record<string, string>> };
      const { startHash, steps } = gameSteps(dir, gameId, readArchive(dir));
      if (startHash === null) throw new RangeError(`Run "${id}" has no record of game "${gameId}".`);
      return { packageFiles: json(join(dir, "package-content.json")) as Record<string, unknown>, scenario: identity.scenario, options: identity.conditions[job.conditionId] ?? {}, seed: job.seed, startHash, steps };
    },
  };
}
