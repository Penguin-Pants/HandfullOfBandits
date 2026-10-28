import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { exportCommand } from "../src/cli/export.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { exportJson, validateExport, type CoinSimExport } from "../src/export/json.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

// P2-18: JSON export (07 s8.1). T-ANN-07, T-ANN-08, T-EXP; the S0 export holds the round metrics row.
const dir = mkdtempSync(join(tmpdir(), "hob-export-"));
const file = join(dir, "store.sqlite");
const db = openStore(file);
const service = new SessionService(db, join(kurdishDir, "..", ".."));
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
const focus = { panel: "board" as const, selectedSpace: null, selectedPieces: [], hoveredActionId: null };

const { sessionId, head } = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 7, name: "export" });
let state = head.state;
let headId = head.actionId;
let firstAction = "";
while (state.ended === null) {
  const res = service.submit(sessionId, scriptedPolicy(engine, ruleset, state), headId);
  if (firstAction === "") firstAction = res.actionId;
  state = res.head.state;
  headId = res.actionId;
}
const noteId = service.annotate(sessionId, { anchor: "executed", actionId: firstAction, text: "First card reveal.", categoryIds: ["pacing"], focus });
service.endSession(sessionId, "Short slice.");
const { debriefId } = service.endSession(sessionId, "Short slice; PKK ahead.");
const data: CoinSimExport = exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "2026-10-28T00:00:00Z" });

describe("JSON export coin-sim-export/1", () => {
  it("passes reference validation (T-ANN-07, T-EXP)", () => {
    expect(validateExport(data)).toEqual([]);
    expect(data.exportMeta.schema).toBe("coin-sim-export/1");
  });

  it("names the one debrief as the session's debrief_annotation_id; a second save replaced the first (T-ANN-08)", () => {
    expect(data.sessions[0]?.["debrief_annotation_id"]).toBe(debriefId);
    const debriefs = data.annotations.filter((a) => a["anchor"] === "debrief");
    expect(debriefs.map((a) => a["text"])).toEqual(["Short slice; PKK ahead."]);
  });

  it("holds the S0 round metrics row, the result and the referenced package, categories and states", () => {
    expect(data.metrics.filter((m) => m["propaganda_round"] === 1)).toHaveLength(1);
    expect(data.sessions[0]?.["result"]).toMatchObject({ reason: "final scoring" });
    expect(data.packages[0]?.["assumptions"]).toHaveLength(17);
    expect(data.categories.map((c) => c["category_id"])).toEqual(["pacing"]);
    expect(data.states.every((s) => s["derived"] !== null && !("content" in s))).toBe(true);
    expect(data.index.annotations.find((i) => i["annotation_id"] === noteId)).toMatchObject({ action_id: firstAction, package_hash: data.packages[0]?.["package_hash"] });
  });

  it("reports a reference that does not resolve", () => {
    const broken = { ...data, states: data.states.slice(1) };
    expect(validateExport(broken).length).toBeGreaterThan(0);
  });

  it("adds full state content with --with-states, and the CLI writes a valid file", () => {
    const full = exportJson(db, { sessionIds: [sessionId], withStates: true, appVersion: "0.1.0", exportedAt: "x" });
    expect(full.states.every((s) => s["content"] !== null && "content" in s)).toBe(true);
    db.pragma("wal_checkpoint(TRUNCATE)");
    const out = join(dir, "export.json");
    expect(exportCommand([sessionId], file, false, out, "0.1.0").exitCode).toBe(0);
    expect(validateExport(JSON.parse(readFileSync(out, "utf8")) as CoinSimExport)).toEqual([]);
    expect(exportCommand(["nope"], file, false, null, "0.1.0").exitCode).toBe(1);
  });
});
