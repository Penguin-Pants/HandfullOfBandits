// P4-12: Markdown and CSV downloads per session (07 s8; 11 P4-12). The Home row links to them (checked in e2e/smoke.mjs).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { exportCsv } from "../src/export/csv.ts";
import { exportJson } from "../src/export/json.ts";
import { exportMarkdown } from "../src/export/markdown.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob-export-links-"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(kurdishDir, "..", ".."));
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const { sessionId } = service.createSession({ dir: kurdishDir, scenarioId: "scenario-a", seed: 3, name: "links" });
const expected = exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "" });

describe("P4-12 export downloads", () => {
  it("serves the Markdown export as a download", async () => {
    const res = await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/export.md` });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/markdown");
    expect(res.headers["content-disposition"]).toBe(`attachment; filename="session-${sessionId}.md"`);
    expect(res.body.replace(/Exported: \S+\./, "Exported: .")).toBe(exportMarkdown(expected));
    expect(res.body).toContain("# ");
  });

  it.each(["annotations", "actions", "metrics"] as const)("serves %s.csv as a download", async (file) => {
    const res = await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/export.csv?file=${file}` });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toBe(`attachment; filename="session-${sessionId}-${file}.csv"`);
    expect(res.body).toBe(exportCsv(expected)[file]);
  });

  it("refuses an unknown CSV file and an unknown session", async () => {
    expect((await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/export.csv?file=states` })).statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/export.csv` })).statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: "/api/sessions/nope/export.md" })).statusCode).toBe(404);
    expect((await app.inject({ method: "GET", url: "/api/sessions/nope/export.csv?file=actions" })).statusCode).toBe(404);
  });
});
