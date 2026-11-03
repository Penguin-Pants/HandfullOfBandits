// Experiment artifact files (19 s9; 20 Phase 2). One immutable directory per attempt. JSON files
// are published atomically (write a temporary file, then rename). Game journals are JSON lines,
// appended after every applied command, and compressed when the game ends. A reader accepts a
// truncated last line, so an interrupted journal still yields its valid prefix.
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import type { JournalEvent } from "./game-runner.ts";

/** File operations, injectable so tests can simulate a failing disk. */
export interface ArtifactWriter {
  mkdir(dir: string): void;
  write(file: string, data: string | Buffer): void;
  append(file: string, data: string): void;
  rename(from: string, to: string): void;
  remove(file: string): void;
}

export const fsWriter: ArtifactWriter = {
  mkdir: (dir) => { mkdirSync(dir, { recursive: false }); },
  write: (file, data) => { writeFileSync(file, data); },
  append: (file, data) => { appendFileSync(file, data, "utf8"); },
  rename: (from, to) => { renameSync(from, to); },
  remove: (file) => { rmSync(file, { force: true }); },
};

/** Safe file name for a game ID (Windows and Linux). */
export function gameFile(gameId: string): string {
  return gameId.replaceAll(/[^A-Za-z0-9._-]/g, "_");
}

export class Artifacts {
  readonly dir: string;
  private readonly w: ArtifactWriter;
  constructor(dir: string, writer: ArtifactWriter = fsWriter) {
    this.dir = dir;
    this.w = writer;
  }

  /** Create the directory; an existing path is rejected so completed artifacts are never overwritten. */
  create(): void {
    if (existsSync(this.dir)) throw new Error(`Output ${this.dir} already exists; choose a new directory`);
    mkdirSync(this.dir, { recursive: true });
    this.w.mkdir(join(this.dir, "games"));
  }

  json(name: string, value: unknown): void {
    const file = join(this.dir, name);
    this.w.write(`${file}.tmp`, `${JSON.stringify(value, null, 1)}\n`);
    this.w.rename(`${file}.tmp`, file);
  }

  journal(gameId: string, event: JournalEvent): void {
    this.w.append(join(this.dir, "games", `${gameFile(gameId)}.jsonl`), `${JSON.stringify(event)}\n`);
  }

  /** Compress a finished journal atomically; the plain file goes only after the archive exists. */
  seal(gameId: string): void {
    const plain = join(this.dir, "games", `${gameFile(gameId)}.jsonl`);
    const sealed = `${plain}.gz`;
    this.w.write(`${sealed}.tmp`, gzipSync(readFileSync(plain)));
    this.w.rename(`${sealed}.tmp`, sealed);
    this.w.remove(plain);
  }
}

/** Journal events of one game, sealed or plain. A truncated final line is dropped, earlier ones kept. */
export function readJournal(dir: string, gameId: string): JournalEvent[] {
  const base = join(dir, "games", `${gameFile(gameId)}.jsonl`);
  const text = existsSync(`${base}.gz`) ? gunzipSync(readFileSync(`${base}.gz`)).toString("utf8") : existsSync(base) ? readFileSync(base, "utf8") : "";
  const out: JournalEvent[] = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    try {
      out.push(JSON.parse(line) as JournalEvent);
    } catch {
      break;
    }
  }
  return out;
}

/** One game in the compact replay archive: start hash, every command and every state hash. */
export interface ArchivedGame {
  readonly gameId: string;
  readonly startHash: string;
  readonly commands: readonly unknown[];
  readonly hashes: readonly string[];
  readonly end: unknown;
}

export const REPLAY_ARCHIVE = "replays.jsonl.gz";

/**
 * Write `replays.jsonl.gz` (all games, commands and hashes) and copy the full journals of
 * `keep` games to `review/`. The bulky per-game journals can then be left out of version
 * control: the archive replays every game, and a rerun of the frozen manifest regenerates them.
 */
export function archiveExperiment(dir: string, gameIds: readonly string[], keep: readonly string[]): { readonly games: number; readonly bytes: number } {
  const lines = gameIds.map((id) => {
    const events = readJournal(dir, id);
    const start = events.find((e) => e.t === "start");
    const steps = events.flatMap((e) => (e.t === "step" ? [e] : []));
    const game: ArchivedGame = { gameId: id, startHash: start?.t === "start" ? start.startHash : "", commands: steps.map((s) => s.command), hashes: steps.map((s) => s.hash), end: events.find((e) => e.t === "end") ?? null };
    return JSON.stringify(game);
  });
  const file = join(dir, REPLAY_ARCHIVE);
  if (existsSync(file)) throw new Error(`${file} exists; archives are never overwritten`);
  const data = gzipSync(`${lines.join("\n")}\n`, { level: 9 });
  writeFileSync(`${file}.tmp`, data);
  renameSync(`${file}.tmp`, file);
  const review = join(dir, "review");
  mkdirSync(review, { recursive: true });
  for (const id of keep) {
    const name = `${gameFile(id)}.jsonl.gz`;
    const from = join(dir, "games", name);
    if (existsSync(from)) writeFileSync(join(review, name), readFileSync(from));
  }
  return { games: lines.length, bytes: data.length };
}

/** Archived games by ID, or null when the directory has no archive. */
export function readArchive(dir: string): Map<string, ArchivedGame> | null {
  const file = join(dir, REPLAY_ARCHIVE);
  if (!existsSync(file)) return null;
  const out = new Map<string, ArchivedGame>();
  for (const line of gunzipSync(readFileSync(file)).toString("utf8").split("\n")) {
    if (line.trim() === "") continue;
    const g = JSON.parse(line) as ArchivedGame;
    out.set(g.gameId, g);
  }
  return out;
}
