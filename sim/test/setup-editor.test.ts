// Audit Plan 4 V2: the setup editor's server side. Acceptance: each error of audit section 7.3
// shows inline (an issue on the variant file with the row it belongs to); a saved variant starts a
// session.
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "yaml";
import { afterAll, describe, expect, it } from "vitest";
import { stackingRoom } from "../src/engine/core/effects/common.ts";
import { loadPackageContent } from "../src/store/repos/packages.ts";
import { getSession } from "../src/store/repos/sessions.ts";
import { buildApp } from "../src/server/app.ts";
import { ServiceError, SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { kurdish, kurdishDir } from "./kurdish-package.ts";

const temp = mkdtempSync(join(tmpdir(), "hob setup editor "));
const root = join(temp, "packages");
const dir = join(root, "kurdish-coin", "0.1.0");
cpSync(kurdishDir, dir, { recursive: true });
const db = openStore(join(temp, "store.sqlite"));
const service = new SessionService(db, root);
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(temp, { recursive: true, force: true });
});

const base = kurdish.data.scenarios["scenarios/full-campaign.yaml"];
if (base === undefined) throw new Error("no full campaign");
/** The base entry of a space with `pieces` replaced. */
const space = (id: string, pieces: Record<string, number>, level?: number) => ({ [id]: { ...(level === undefined ? {} : { level }), pieces } });
const check = (overlay: Record<string, unknown>) => service.checkVariant({ dir, overlay: { scenario: "full-campaign", ...overlay } });

const thrown = (f: () => unknown): ServiceError => {
  try {
    f();
  } catch (e) {
    if (e instanceof ServiceError) return e;
    throw e;
  }
  throw new Error("no ServiceError");
};

describe("audit 7.3 setup errors show inline (V2)", () => {
  it.each([
    ["1. more pieces than the faction owns", { spaces: space("hakkari", { troops: 17, police: 1, guerrilla: 2 }, -1) }, "error", "V-PIECES", "", "troops"],
    ["2. three State Bases in a space", { spaces: space("elazig", { troops: 1, police: 1, stateBase: 3 }, 1) }, "error", "V-STACK", "spaces.elazig.pieces", "elazig"],
    ["2. Guards in a City", { spaces: space("van-city", { police: 1, guards: 1 }), outOfPlay: { guards: 15 } }, "error", "V-STACK", "spaces.van-city.pieces", "van-city"],
    ["2. a PKK Base in Western Cities", { spaces: space("western-cities", { troops: 2, police: 2, stateBase: 1, pkkBase: 1 }, 1) }, "error", "V-STACK", "spaces.western-cities.pieces", "western-cities"],
    ["3. a Guard on the map before Law 3175", { spaces: space("hakkari", { troops: 2, police: 1, guards: 1, guerrilla: 2 }, -1), outOfPlay: { guards: 15 } }, "warning", "V-PIECES", "", "guards"],
    ["3. Guards Available before Law 3175", { outOfPlay: { guards: 10 } }, "warning", "V-PIECES", "", "guards"],
    ["4. Troops in an external box", { spaces: space("kdp-zone", { troops: 1, guerrilla: 4, pkkBase: 1 }) }, "error", "V-STACK", "spaces.kdp-zone.pieces", "kdp-zone"],
    ["4. Police in an external box", { spaces: space("puk-zone", { police: 1 }) }, "error", "V-STACK", "spaces.puk-zone.pieces", "puk-zone"],
    ["4. a Guerrilla in Iran", { spaces: space("iran", { guerrilla: 1 }) }, "error", "V-STACK", "spaces.iran.pieces", "iran"],
    ["4. a piece in Europe", { spaces: space("europe", { guerrilla: 1 }) }, "error", "V-STACK", "spaces.europe.pieces", "europe"],
    ["5. a level outside -2 to +2", { spaces: space("siirt", { police: 1, guerrilla: 1 }, -3) }, "error", "V-RANGE", "spaces.siirt.level", "siirt"],
    ["5. a level in an external box", { spaces: space("kdp-zone", { guerrilla: 4, pkkBase: 1 }, 1) }, "error", "V-RANGE", "spaces.kdp-zone.level", "kdp-zone"],
  ])("%s", (_name, overlay, level, code, path, id) => {
    const result = check(overlay);
    expect(result.ok).toBe(level === "warning");
    expect(result.issues).toContainEqual(expect.objectContaining({ level, code, file: "variants/draft.yaml", path, id }));
  });

  it("keeps the setup-only rules out of play: Cross-Border Troops still fit in the KDP Zone", () => {
    const start = { spaces: { "kdp-zone": { pieces: {} } } } as unknown as Parameters<typeof stackingRoom>[1];
    expect(stackingRoom(kurdish.ruleset, start, "kdp-zone", "troops")).toBe(Number.POSITIVE_INFINITY);
    expect(stackingRoom(kurdish.ruleset, start, "iran", "guerrilla")).toBe(Number.POSITIVE_INFINITY);
  });

  it("gives the base package no setup warning", () => {
    expect(kurdish.issues).toEqual([]);
  });
});

describe("checkVariant (V2)", () => {
  it("fills base, returns the base setup, the changes and the export text", () => {
    const result = check({ thresholds: { state: 43 } });
    expect(result).toMatchObject({ ok: true, overlay: { base: kurdish.hash, scenario: "full-campaign", thresholds: { state: 43 } } });
    expect(result.issues).toEqual([]);
    expect(result.changes).toEqual([{ kind: "threshold", space: null, id: "state", face: null, from: 49, to: 43 }]);
    expect(result.setup?.spaces.map((s) => s.id).slice(0, 3)).toEqual(["hakkari", "sirnak", "siirt"]);
    expect(result.setup?.pieces.find((p) => p.id === "guerrilla")).toEqual({ id: "guerrilla", faction: "pkk", count: 30, faces: ["underground", "active"], placedAs: "underground" });
    expect(result.setup?.values.spaces["siirt"]).toEqual(base.spaces["siirt"]);
    expect(result.setup?.tracks.find((t) => t.id === "emergencyRule")?.steps.length).toBeGreaterThan(1);
    expect(result.yaml).toMatch(/^# Variant draft/);
    expect(parse(result.yaml ?? "")).toEqual(result.overlay);
  });

  it("writes one line per field and per space", () => {
    const result = check({ thresholds: { state: 43, pkk: 38 }, spaces: space("siirt", { police: 2, guerrilla: 1 }, -1) });
    expect(result.yaml?.split("\n")).toEqual([
      "# Variant draft, made in the setup editor (audit Plan 4).",
      `base: ${kurdish.hash}`,
      "scenario: full-campaign",
      "thresholds: { state: 43, pkk: 38 }",
      "spaces:",
      "  siirt: { level: -1, pieces: { police: 2, guerrilla: 1 } }",
      "",
    ]);
  });

  it("imports YAML text and opens a saved variant", () => {
    expect(service.checkVariant({ dir, text: "scenario: full-campaign\nthresholds: {pkk: 38}\n" }).changes).toEqual([{ kind: "threshold", space: null, id: "pkk", face: null, from: 32, to: 38 }]);
    expect(service.checkVariant({ dir, name: "dd25-thresholds-43-38" })).toMatchObject({ ok: true, overlay: { thresholds: { state: 43, pkk: 38 } } });
  });

  it("warns on an imported variant made on another package", () => {
    expect(service.checkVariant({ dir, text: `base: ${"f".repeat(64)}\nscenario: full-campaign\n` }).issues).toContainEqual(expect.objectContaining({ level: "warning", code: "V-VARIANT" }));
  });

  it("refuses two sources, bad YAML and an unknown name", () => {
    expect(thrown(() => service.checkVariant({ dir, name: "x", text: "a: 1" })).status).toBe(400);
    expect(thrown(() => service.checkVariant({ dir, text: "a: [" })).status).toBe(400);
    expect(thrown(() => service.checkVariant({ dir, name: "nothing-here" })).status).toBe(404);
  });

  it("returns no setup and no export for an overlay that fails its schema", () => {
    const result = service.checkVariant({ dir, overlay: { scenario: "full-campaign", available: { troops: 1 } } });
    expect(result).toMatchObject({ ok: false, yaml: null, setup: null });
  });
});

describe("saveVariant and sessions on a variant (V2)", () => {
  const overlay = { scenario: "full-campaign", base: "0".repeat(64), thresholds: { state: 43, pkk: 38 }, spaces: space("siirt", { police: 2, guerrilla: 1 }, -1) };

  it("saves a variant that the package lists and a session starts from", () => {
    const saved = service.saveVariant({ dir, name: "editor-test", overlay, replace: false });
    expect(saved).toMatchObject({ name: "editor-test", ok: true, issues: [] });
    const text = readFileSync(join(dir, "variants", "editor-test.yaml"), "utf8");
    expect(parse(text)).toMatchObject({ base: kurdish.hash, thresholds: { state: 43, pkk: 38 } });
    const listed = service.listPackages().find((p) => p.dir === dir)?.variants.find((v) => v.name === "editor-test");
    expect(listed).toEqual(saved);

    const { sessionId } = service.createSession({ dir, scenarioId: "full-campaign", seed: 3, name: "on a variant", variant: "editor-test" });
    const row = getSession(db, sessionId);
    expect(row?.package_hash).toBe(saved.hash);
    const content = JSON.parse(loadPackageContent(db, saved.hash ?? "") ?? "{}") as Record<string, { variant?: { name: string; base: string } }>;
    expect(content["scenarios/full-campaign.yaml"]?.variant).toMatchObject({ name: "editor-test", base: kurdish.hash });
    expect(service.session(sessionId).ruleset.scenarios["full-campaign"]?.thresholds).toEqual({ state: 43, pkk: 38 });
    expect(service.session(sessionId).head.state.pools["police"]?.available).toBe(3);
  });

  it("refuses an existing name unless replace", () => {
    expect(thrown(() => service.saveVariant({ dir, name: "editor-test", overlay, replace: false })).status).toBe(409);
    expect(service.saveVariant({ dir, name: "editor-test", overlay: { ...overlay, thresholds: { state: 44 } }, replace: true }).ok).toBe(true);
    expect(parse(readFileSync(join(dir, "variants", "editor-test.yaml"), "utf8"))).toMatchObject({ thresholds: { state: 44 } });
  });

  it("refuses an overlay that fails the schema", () => {
    const e = thrown(() => service.saveVariant({ dir, name: "bad-schema", overlay: { scenario: "full-campaign", available: { troops: 1 } }, replace: false }));
    expect(e.status).toBe(422);
    expect(e.message).toMatch(/schema/);
  });

  it("refuses errors, a bad name and a folder outside the packages root", () => {
    expect(thrown(() => service.saveVariant({ dir, name: "broken", overlay: { scenario: "full-campaign", spaces: space("iran", { guerrilla: 1 }) }, replace: false })).status).toBe(422);
    expect(existsSync(join(dir, "variants", "broken.yaml"))).toBe(false);
    expect(thrown(() => service.saveVariant({ dir, name: "../escape", overlay, replace: false })).status).toBe(400);
    expect(thrown(() => service.saveVariant({ dir: kurdishDir, name: "outside", overlay, replace: false })).status).toBe(403);
    expect(existsSync(join(kurdishDir, "variants", "outside.yaml"))).toBe(false);
  });

  it("refuses a session on an unknown or broken variant", () => {
    expect(thrown(() => service.createSession({ dir, scenarioId: "full-campaign", seed: 1, name: "x", variant: "nothing-here" })).status).toBe(404);
  });

  it("refuses a variant of another scenario and lists each variant's scenario (PR #130 review)", () => {
    const e = thrown(() => service.createSession({ dir, scenarioId: "short", seed: 1, name: "x", variant: "dd25-thresholds-43-38" }));
    expect(e.status).toBe(400);
    expect(e.message).toBe('Variant "dd25-thresholds-43-38" changes scenario "full-campaign", not "short".');
    expect(service.listPackages().find((p) => p.dir === dir)?.variants.find((v) => v.name === "dd25-thresholds-43-38")?.scenario).toBe("full-campaign");
  });
});

describe("variant routes (V2)", () => {
  it("checks, saves and starts through HTTP", async () => {
    const checked = await app.inject({ method: "POST", url: "/api/variants/check", payload: { dir, overlay: { scenario: "full-campaign", thresholds: { pkk: 36 } } } });
    expect(checked.statusCode).toBe(200);
    expect(checked.json<{ ok: boolean }>().ok).toBe(true);
    const saved = await app.inject({ method: "POST", url: "/api/variants", payload: { dir, name: "route-test", overlay: { scenario: "full-campaign", thresholds: { pkk: 36 } } } });
    expect(saved.statusCode).toBe(201);
    const started = await app.inject({ method: "POST", url: "/api/sessions", payload: { dir, scenarioId: "full-campaign", seed: 2, name: "r", variant: "route-test" } });
    expect(started.statusCode).toBe(201);
  });

  it("rejects a request without dir, without overlay or with a non-string variant", async () => {
    expect((await app.inject({ method: "POST", url: "/api/variants/check", payload: {} })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/variants", payload: { dir, name: "x" } })).statusCode).toBe(400);
    expect((await app.inject({ method: "POST", url: "/api/sessions", payload: { dir, scenarioId: "full-campaign", seed: 2, variant: 3 } })).statusCode).toBe(400);
  });
});
