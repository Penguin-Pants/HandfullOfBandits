import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, expect, it, vi } from "vitest";
import { exportCommand } from "../src/cli/export.ts";
import { backupStore } from "../src/store/backup.ts";
import { openStore } from "../src/store/migrate.ts";
import { exportJson } from "../src/export/json.ts";
import { exportMarkdown } from "../src/export/markdown.ts";
import { SessionService } from "../src/server/service.ts";
import { kurdishDir } from "./kurdish-package.ts";
vi.mock("node:fs", async (original) => {
  const actual = await original<typeof import("node:fs")>();
  return { ...actual, readdirSync: vi.fn(actual.readdirSync) };
});
const dir = mkdtempSync(join(tmpdir(), "hob-phase3a-"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(kurdishDir, "..", ".."));
const {sessionId} = service.createSession({dir: kurdishDir, scenarioId: "s0", seed: 7, name: "tools"});
const focus = {panel: "board" as const, selectedSpace: null, selectedPieces: [], hoveredActionId: null};
afterAll(() => { db.close(); rmSync(dir, {recursive: true, force: true}); });
it("backs up committed WAL rows, restores independently and keeps the last ten", () => {
  const paths = Array.from({length: 12}, () => backupStore(db));
  const last = paths.at(-1);
  expect(last).not.toBeNull();
  if (last === null || last === undefined) throw new Error("No backup");
  expect(readdirSync(dirname(last)).filter(f => f.endsWith(".sqlite")).sort()).toEqual(paths.slice(-10).map(p => (p ?? "").split(/[\\/]/).at(-1)).sort());
  const restored = new Database(last, {readonly: true});
  expect(restored.prepare("SELECT session_id FROM sessions").get()).toMatchObject({session_id: sessionId});
  expect(restored.pragma("integrity_check", {simple: true})).toBe("ok");
  restored.close();
});
it("exports session metadata, assumptions, debrief first, action references and unattached notes", () => {
  service.annotate(sessionId, {anchor: "state", actionId: null, text: "State note *literal*", categoryIds: [], focus});
  service.endSession(sessionId, "Debrief text");
  const text = exportMarkdown(exportJson(db, {sessionIds: [sessionId], withStates: false, appVersion: "test", exportedAt: "2026-10-30"}));
  expect(text).toContain("tools");
  expect(text).toContain("s0");
  expect(text).toContain("PA-02");
  expect(text).toContain("State note \\*literal\\*");
  expect(text.indexOf("Debrief text")).toBeLessThan(text.indexOf("### Actions"));
  expect(text).toContain(sessionId);
});
it("FTS gives the same substring results, including short, Unicode and punctuation queries; edits update the index", async () => {
  const {searchAnnotations} = await import("../src/store/search.ts");
  const {editAnnotationText} = await import("../src/store/repos/annotations.ts");
  const texts = ['Mountain attack', 'Quoted "attack" * OR', 'İSTANBUL Straße', 'x_y% z', 'ÉCOLE'];
  const ids = texts.map(text => service.annotate(sessionId, {anchor: "state", actionId: null, text, categoryIds: [], focus}));
  for (const q of ['attack', 'ATT', 'ttac', 'a', '"attack"', '* OR', 'istanbul', 'i\u0307st', 'straße', 'éco', 'x_y%', '', 'not there']) {
    const expected = service.review({}).filter(r => r.text.toLowerCase().includes(q.toLowerCase())).map(r => r.annotationId).sort();
    expect(searchAnnotations(db, q).map(n => n.annotation_id).sort(), q).toEqual(expected);
  }
  editAnnotationText(db, ids[0] ?? '', 'Changed target');
  expect(searchAnnotations(db, 'Mountain').map(n => n.annotation_id)).not.toContain(ids[0]);
  expect(searchAnnotations(db, 'Changed').map(n => n.annotation_id)).toContain(ids[0]);
});
it("skips memory stores and leaves all prior backups intact if SQLite refuses a backup", () => {
  const memory = openStore(":memory:");
  expect(backupStore(memory)).toBeNull();
  memory.close();
  const directory = join(dir, "backups");
  const before = readdirSync(directory).sort();
  db.transaction(() => { expect(() => backupStore(db)).toThrow(); })();
  expect(readdirSync(directory).sort()).toEqual(before);
});
it("backs up before session start, with an independent complete snapshot", () => {
  const before = service.listSessions().length;
  service.createSession({dir: kurdishDir, scenarioId: "s0", seed: 8, name: "next"});
  const directory = join(dir, "backups");
  const latest = readdirSync(directory).sort().at(-1);
  const backup = new Database(join(directory, latest ?? ''), {readonly: true});
  expect(backup.prepare('SELECT COUNT(*) AS n FROM sessions').get()).toEqual({n: before});
  expect(service.listSessions()).toHaveLength(before + 1);
  backup.close();
});

it("the CLI exporter writes Markdown and reports an unknown session without a partial export", () => {
  const file = join(dir, "notes.md");
  expect(exportCommand([sessionId], db.name, false, file, "test", "markdown").exitCode).toBe(0);
  expect(readFileSync(file, "utf8")).toContain("Debrief text");
  expect(exportCommand(["unknown"], db.name, false, null, "test", "markdown").exitCode).toBe(1);
});
it("keeps action notes with multiple lines nested under their action", () => {
  const actionId = service.session(sessionId).head.actionId;
  service.annotate(sessionId, {anchor: "executed", actionId, text: "Action note\nSecond line", categoryIds: [], focus});
  const text = exportMarkdown(exportJson(db, {sessionIds: [sessionId], withStates: false, appVersion: "test", exportedAt: "today"}));
  expect(text).toContain("Action note\n    Second line");
  expect(text).toContain(actionId);
});
it("rebuilds the search index for pre-migration notes and removes deleted notes", async () => {
  const {searchAnnotations} = await import("../src/store/search.ts");
  const file = backupStore(db);
  if (file === null) throw new Error("No backup");
  const old = new Database(file);
  old.exec("DROP TRIGGER annotations_fts_insert; DROP TRIGGER annotations_fts_update; DROP TRIGGER annotations_fts_delete; DROP TABLE annotations_fts; PRAGMA user_version = 1;");
  old.close();
  const migrated = openStore(file);
  const matches = searchAnnotations(migrated, "Changed target");
  expect(matches).toHaveLength(1);
  const id = matches[0]?.annotation_id;
  migrated.prepare("DELETE FROM annotation_revisions WHERE annotation_id = ?").run(id);
  migrated.prepare("DELETE FROM annotations WHERE annotation_id = ?").run(id);
  expect(searchAnnotations(migrated, "Changed target")).toEqual([]);
  migrated.close();
});

it("preserves another process's backup when both choose the same filename", () => {
  const other = openStore(join(dir, "race.sqlite"));
  const first = backupStore(other);
  if (first === null) throw new Error("No backup");
  const before = readFileSync(first);
  // Model a directory snapshot taken before the other process completed its backup.
  vi.mocked(readdirSync).mockReturnValueOnce([]);
  expect(() => backupStore(other)).toThrow();
  expect(readFileSync(first)).toEqual(before);
  other.close();
});

it("the CLI parses Markdown format and rejects an unsupported format with a clear error", () => {
  const cli = fileURLToPath(new URL("../src/cli/main.ts", import.meta.url));
  const result = spawnSync(process.execPath, [cli, "export", sessionId, "--db", db.name, "--format", "markdown"], {encoding: "utf8"});
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Debrief text");
  const invalid = spawnSync(process.execPath, [cli, "export", sessionId, "--db", db.name, "--format", "html"], {encoding: "utf8"});
  expect(invalid.error).toBeUndefined();
  expect(invalid.status).toBe(1);
  expect(invalid.stdout).toBe("error: format must be json or markdown\n");
});
it("search preserves the review screen's session and note order", () => {
  service.annotate(sessionId, {anchor: "state", actionId: null, text: "Order sample first", categoryIds: [], focus});
  const newer = service.createSession({dir: kurdishDir, scenarioId: "s0", seed: 9, name: "order"}).sessionId;
  service.annotate(newer, {anchor: "state", actionId: null, text: "Order sample second", categoryIds: [], focus});
  db.prepare("UPDATE sessions SET updated_at = ? WHERE session_id = ?").run("2099-01-01T00:00:00Z", newer);
  const expected = service.review({}).filter(r => r.text.includes("Order sample")).map(r => r.annotationId);
  expect(service.review({q: "Order sample"}).map(r => r.annotationId)).toEqual(expected);
});
