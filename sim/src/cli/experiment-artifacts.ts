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
