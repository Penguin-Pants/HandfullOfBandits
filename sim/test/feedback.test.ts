import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { playGame, replay, scriptedPolicy } from "../src/cli/play.ts";
import { replayFile } from "../src/cli/replay.ts";
import type { Ruleset } from "../src/engine/core/types.ts";
import { loadVariant } from "../src/package/variant.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";
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

describe("replay() with hashes not stored inside an action (Phase 4)", () => {
  const game = playGame(engine, short.ruleset, SHORT, 7, scriptedPolicy, 3);
  // Commands 1 and 2 as one stored action: the hash after command 1 is not stored.
  const grouped = { ...game, hashes: [game.hashes[0] ?? "", null, ...game.hashes.slice(2)] };

  it("checks a null hash at the next stored hash", () => {
    expect(replay(engine, short.ruleset, grouped)).toBeNull();
    expect(replay(engine, short.ruleset, { ...grouped, hashes: [...grouped.hashes.slice(0, 2), "wrong", ...grouped.hashes.slice(3)] })).toEqual({ step: 2, expected: "wrong", actual: game.hashes[2] });
  });
});

describe("replay record of a feedback prompt (AC6.1)", () => {
  // A copy of the short package that declares and lists `threshold.state` (mock data); thresholds enter the state at Propaganda (pipeline.ts).
  const listed = shortPackage("hob-feedback-options-");
  /** Edit one package file; a Windows checkout has CRLF line endings, so patterns allow `\r`. */
  const edit = (file: string, from: RegExp, to: string): void => {
    const text = readFileSync(join(listed.dir, file), "utf8");
    if (!from.test(text)) throw new Error(`${file} has no match for ${String(from)}`);
    writeFileSync(join(listed.dir, file), text.replace(from, to));
  };
  edit(join("scenarios", `${SHORT}.yaml`), /options: \{syriaMarchRestricted: allow\}/, "options: {syriaMarchRestricted: allow, threshold.state: 49}");
  edit("manifest.yaml", /^options:\r?\n/m, "options:\n  threshold.state:\n    values: [40, 49]\n    description: test only\n");
  afterAll(() => { rmSync(listed.root, { recursive: true, force: true }); });

  interface Play { readonly dir: string; readonly max: number; readonly scenario?: string; readonly ruleset?: Ruleset; readonly options?: Record<string, string>; readonly variant?: string; readonly text?: string }

  /** Play scripted commands (to the end, or `max`) and report with `text`. Defaults: the short fixture. */
  async function playAndReport({ dir: packageDir, max, scenario = SHORT, ruleset = short.ruleset, options, variant, text = "Replay this." }: Play): Promise<{ sessionId: string; prompt: string; replay: { file: string; record: unknown } | undefined; noteHash: string | null | undefined }> {
    const created = service.createSession({ dir: packageDir, scenarioId: scenario, seed: 11, name: "replay", ...(options === undefined ? {} : { options }), ...(variant === undefined ? {} : { variant }) });
    let at = created.head;
    let atId = at.actionId;
    for (let i = 0; i < max && at.state.ended === null; i++) {
      const res = service.submit(created.sessionId, scriptedPolicy(engine, ruleset, at.state), atId);
      at = res.head;
      atId = res.actionId;
    }
    const res = await app.inject({ method: "POST", url: `/api/sessions/${created.sessionId}/feedback`, payload: { text } });
    const { annotationId, prompt, replay } = res.json<{ annotationId: string; prompt: string; replay?: { file: string; record: unknown } }>();
    const noteHash = service.annotations(created.sessionId).find((n) => n.annotation_id === annotationId)?.state_hash;
    return { sessionId: created.sessionId, prompt, replay, noteHash };
  }

  /** Write a record to a file, as the prompt tells the user, and replay it with `replayFile`. */
  function replayRecordFile(sessionId: string, record: string, packageDir: string): { exitCode: number; lines: string[]; finalHash: unknown } {
    const file = join(dir, `replay-${sessionId}.json`);
    writeFileSync(file, record);
    return { ...replayFile(file, packageDir), finalHash: (JSON.parse(record) as { hashes?: unknown[] }).hashes?.at(-1) };
  }

  const inPrompt = (prompt: string): string | undefined => /## Replay record\n[\s\S]*?```json\n([\s\S]*?)\n```/.exec(prompt)?.[1];

  it("replays to the note's state hash", async () => {
    const report = await playAndReport({ dir: fixture.dir, max: 3 });
    const out = replayRecordFile(report.sessionId, inPrompt(report.prompt) ?? "{}", fixture.dir);
    expect(out.lines).toEqual(["identical (3 commands)"]);
    expect(out.exitCode).toBe(0);
    expect(out.finalHash).toBe(report.noteHash);
  });

  it("replays a session that started with options (replayFile applies them)", async () => {
    const report = await playAndReport({ dir: listed.dir, max: 500, options: { "threshold.state": "40" } });
    const out = replayRecordFile(report.sessionId, inPrompt(report.prompt) ?? "{}", listed.dir);
    expect(out.lines[0]).toMatch(/^identical \(\d+ commands\)$/);
    expect(out.exitCode).toBe(0);
    expect(out.finalHash).toBe(report.noteHash);
  });

  it("returns a record above the 60 KB limit separately, and it replays (AC6.3)", async () => {
    const report = await playAndReport({ dir: fixture.dir, max: 3, text: "x".repeat(61 * 1024) });
    expect(inPrompt(report.prompt)).toBeUndefined();
    expect(report.replay?.file).toBe(`replay-${report.sessionId}.json`);
    const out = replayRecordFile(report.sessionId, JSON.stringify(report.replay?.record), fixture.dir);
    expect(out.lines).toEqual(["identical (3 commands)"]);
    expect(out.finalHash).toBe(report.noteHash);
  });

  it("replays a session that started with a setup variant (Codex review)", async () => {
    const variant = loadVariant(kurdishDir, "dd25-variant-a");
    if (!variant.ok) throw new Error("dd25-variant-a must load");
    const report = await playAndReport({ dir: kurdishDir, max: 3, scenario: "full-campaign", ruleset: variant.ruleset, variant: "dd25-variant-a" });
    const out = replayRecordFile(report.sessionId, inPrompt(report.prompt) ?? "{}", kurdishDir);
    expect(out.lines).toEqual(["identical (3 commands)"]);
    expect(out.finalHash).toBe(report.noteHash);
  });
});
