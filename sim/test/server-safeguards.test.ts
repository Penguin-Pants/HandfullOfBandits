import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { kurdishDir } from "./kurdish-package.ts";

describe("server safety boundaries", () => {
  it("keeps a session read-only after a replay exception, including subsequent requests", async () => {
    const db = openStore(":memory:");
    const service = new SessionService(db, "");
    const created = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 7, name: "Replay failure" });
    const advanced = service.submit(created.sessionId, { type: "Advance" }, created.head.actionId, created.head.stateHash);
    db.prepare("UPDATE commands SET payload = 'invalid-json' WHERE action_id = ?").run(advanced.actionId);
    db.prepare("UPDATE sessions SET code_fingerprint = 'old' WHERE session_id = ?").run(created.sessionId);
    const app = buildApp(new SessionService(db, ""));
    try {
      for (let i = 0; i < 2; i++) {
        const res = await app.inject({ url: `/api/sessions/${created.sessionId}` });
        expect(res.statusCode).toBe(200);
        expect(res.json<{ session: { status: string } }>().session.status).toBe("readOnly");
        for (const route of ["commands", "undo", "branches"]) {
          const refused = await app.inject({ method: "POST", url: `/api/sessions/${created.sessionId}/${route}`, payload: { command: { type: "Pass", faction: "state" }, headActionId: advanced.actionId, headStateHash: advanced.head.stateHash, actionId: created.head.actionId } });
          expect(refused.statusCode).toBe(409);
        }
      }
      expect(new SessionService(db, "").session(created.sessionId).session.status).toBe("readOnly");
    } finally { await app.close(); db.close(); }
  });

  it("serves UI assets and fallback pages but rejects sibling paths and directory links", async () => {
    const root = mkdtempSync(join(tmpdir(), "hob ui "));
    const ui = join(root, "ui");
    const outside = join(root, "ui-private");
    mkdirSync(ui); mkdirSync(outside);
    writeFileSync(join(ui, "index.html"), "INDEX");
    writeFileSync(join(ui, "app.js"), "ASSET");
    writeFileSync(join(outside, "probe.txt"), "PRIVATE");
    symlinkSync(outside, join(ui, "link"), "junction");
    const db = openStore(":memory:");
    const app = buildApp(new SessionService(db, ""), ui);
    try {
      expect((await app.inject({ url: "/app.js" })).body).toBe("ASSET");
      expect((await app.inject({ url: "/play/session" })).body).toBe("INDEX");
      for (const url of ["/..%2fui-private/probe.txt", "/%2e%2e%2fui-private/probe.txt", "/..%5cui-private%5cprobe.txt", "/link/probe.txt"]) {
        const res = await app.inject({ url });
        expect(res.body).not.toBe("PRIVATE");
        expect(res.statusCode).toBe(404);
      }
    } finally { await app.close(); db.close(); rmSync(root, { recursive: true, force: true }); }
  });
});
