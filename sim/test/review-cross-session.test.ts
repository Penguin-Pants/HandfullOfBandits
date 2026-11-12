// P4-01 cross-session review (07 s7): ruleset version filter and bulk status. Accept: notes from 3
// sessions filter by ruleset version. Two sessions run R4; the third runs a package copy marked R5.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob-review-"));
const r5 = join(dir, "packages", "kurdish-coin", "0.1.1");
cpSync(kurdishDir, r5, { recursive: true });
const manifest = join(r5, "manifest.yaml");
writeFileSync(manifest, readFileSync(manifest, "utf8").replace(/^rulesetVersion: .*$/m, "rulesetVersion: R5"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(dir, "packages"));
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const focus = { panel: "board" as const, selectedSpace: null, selectedPieces: [], hoveredActionId: null };
const note = (packageDir: string, name: string): string => {
  const { sessionId } = service.createSession({ dir: packageDir, scenarioId: "full-campaign", seed: 1, name });
  return service.annotate(sessionId, { anchor: "session", actionId: null, text: `Note in ${name}`, categoryIds: [], focus });
};
const [a, b, c] = [note(kurdishDir, "a"), note(kurdishDir, "b"), note(r5, "c")];
const ids = (filter: Record<string, string>) => service.review(filter).map((r) => r.annotationId).sort();

describe("P4-01 ruleset version filter (07 s7)", () => {
  it("filters notes from 3 sessions by ruleset version", () => {
    expect(ids({ rulesetVersion: "R4" })).toEqual([a, b].sort());
    expect(ids({ rulesetVersion: "R5" })).toEqual([c]);
    expect(ids({ rulesetVersion: "R3" })).toEqual([]);
    expect(ids({})).toEqual([a, b, c].sort());
  });
});

describe("P4-01 bulk status (07 s7)", () => {
  it("sets the status of every selected note in one request", async () => {
    const res = await app.inject({ method: "POST", url: "/api/review/status", payload: { annotationIds: [a, c], status: "addressed" } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ updated: 2 });
    expect(ids({ status: "addressed" })).toEqual([a, c].sort());
    expect(ids({ status: "open" })).toEqual([b]);
  });
  it("refuses a bad status or an unknown note and changes nothing", async () => {
    for (const payload of [{ annotationIds: [b], status: "done" }, { annotationIds: [], status: "wontfix" }, { annotationIds: "x", status: "wontfix" }]) {
      expect((await app.inject({ method: "POST", url: "/api/review/status", payload })).statusCode, JSON.stringify(payload)).toBe(400);
    }
    expect((await app.inject({ method: "POST", url: "/api/review/status", payload: { annotationIds: [b, "nope"], status: "wontfix" } })).statusCode).toBe(404);
    expect(ids({ status: "open" })).toEqual([b]);
  });
});
