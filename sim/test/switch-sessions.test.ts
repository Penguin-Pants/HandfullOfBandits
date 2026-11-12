// P3c-01: a session stored before the switch rows (10 s6.2) opens read-only. Its stored package has
// `campaign.order` but no `switch.*` rows, so every switch gate would stay closed (owner decision).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { SessionService } from "../src/server/service.ts";
import { pack, unpack } from "../src/store/common.ts";
import { openStore } from "../src/store/migrate.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob-switch-"));
const db = openStore(join(dir, "store.sqlite"));
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

describe("P3c-01 sessions stored before the switch rows", () => {
  const packages = join(kurdishDir, "..", "..");
  const { sessionId, head } = new SessionService(db, packages).createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed: 1, name: "old" });

  it("stay active with the switch rows", () => {
    expect(new SessionService(db, packages).session(sessionId).session.status).toBe("active");
  });
  it("open read-only and refuse commands without them", () => {
    const row = db.prepare("SELECT package_hash FROM sessions WHERE session_id = ?").get(sessionId) as { package_hash: string };
    const stored = db.prepare("SELECT content FROM package_versions WHERE package_hash = ?").get(row.package_hash) as { content: Buffer };
    const files = JSON.parse(unpack(stored.content)) as Record<string, unknown>;
    const params = files["parameters.yaml"] as { id: string }[];
    files["parameters.yaml"] = params.filter((p) => !p.id.startsWith("switch."));
    db.prepare("UPDATE package_versions SET content = ? WHERE package_hash = ?").run(pack(JSON.stringify(files)), row.package_hash);
    const fresh = new SessionService(db, packages);
    expect(fresh.session(sessionId).session.status).toBe("readOnly");
    expect(() => fresh.submit(sessionId, { type: "Advance" }, head.actionId)).toThrow(expect.objectContaining({ status: 409 }));
  });
});
