// P4-08 rule lookup: a log rule ref resolves to the text of the research section it cites.
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { buildRuleIndex, lookupRule } from "../src/annotate/rule-index.ts";
import { readResearchDocs } from "../src/package/research.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { logEntriesOf } from "../src/store/repos/log-entries.ts";
import { exportCommand } from "../src/cli/export.ts";
import { ruleCommand } from "../src/cli/rule.ts";
import { exportJson } from "../src/export/json.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const dir = mkdtempSync(join(tmpdir(), "hob-rules-"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(repo, "game-packages"));
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
const focus = { panel: "board" as const, selectedSpace: null, selectedPieces: [], hoveredActionId: null };
const { sessionId } = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 1, name: "rules" });

describe("rule lookup (P4-08)", () => {
  it("gives the research text for a ref through the service and the API", async () => {
    const r = service.ruleLookup(sessionId, "06 s3.2 item 3");
    expect(r.sections).toHaveLength(1);
    expect(r.sections[0]).toMatchObject({ cite: "06 s3.2", heading: "Cross-Border", file: "06-operations-and-special-activities.md" });
    expect(r.sections[0]?.text).toContain("Pay 2 Resources in addition to the Op cost");
    const res = await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/rules?ref=${encodeURIComponent("06 s3.2; DD-19.4")}` });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ref: "06 s3.2; DD-19.4", other: ["DD-19.4"], missing: [] });
  });

  it("refuses a request without a ref and an unknown session", async () => {
    expect((await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/rules` })).statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: `/api/sessions/${sessionId}/rules?ref=` })).statusCode).toBe(400);
    expect((await app.inject({ method: "GET", url: "/api/sessions/nope/rules?ref=06%20s3.2" })).statusCode).toBe(404);
  });

  it("reports every cite as missing when the research folder is absent", () => {
    const bare = join(dir, "bare");
    cpSync(join(repo, "game-packages"), join(bare, "game-packages"), { recursive: true });
    const lone = new SessionService(db, join(bare, "game-packages"));
    const { sessionId: id } = lone.createSession({ dir: join(bare, "game-packages", "kurdish-coin", "0.1.0"), scenarioId: "s0", seed: 2, name: "bare" });
    expect(lone.ruleLookup(id, "06 s3.2")).toMatchObject({ sections: [], missing: ["06 s3.2"] });
  });

  it("gives no index for a research base outside the repository root", () => {
    const outside = join(dir, "outside");
    cpSync(kurdishDir, join(outside, "game-packages", "kurdish-coin", "0.1.0"), { recursive: true });
    const manifest = join(outside, "game-packages", "kurdish-coin", "0.1.0", "manifest.yaml");
    writeFileSync(manifest, readFileSync(manifest, "utf8").replace(/^researchBase: .*$/m, `researchBase: ${join("..", "..", "..", "..", "..", "..", "..", "..", "..", repo.slice(1), "research", "research-final", "package-b-coin-design").replaceAll("\\", "/")}`));
    const far = new SessionService(db, join(outside, "game-packages"));
    const { sessionId: id } = far.createSession({ dir: join(outside, "game-packages", "kurdish-coin", "0.1.0"), scenarioId: "s0", seed: 3, name: "far" });
    expect(far.ruleLookup(id, "06 s3.2")).toMatchObject({ sections: [], missing: ["06 s3.2"] });
  });

  it("fills the research source of the rule refs in a note's context", () => {
    let head = service.session(sessionId).head;
    let cited: { actionId: string; ref: string } | undefined;
    for (let i = 0; i < 40 && cited === undefined && head.state.ended === null; i++) {
      const done = service.submit(sessionId, scriptedPolicy(engine, ruleset, head.state), head.actionId, head.stateHash);
      head = done.head;
      const ref = done.entries.map((e) => e.rule_ref).find((r) => r !== null && /\d{2} s\d/.test(r));
      if (ref !== undefined && ref !== null) cited = { actionId: done.actionId, ref };
    }
    expect(cited, "an action whose log cites a research section").toBeDefined();
    const id = service.annotate(sessionId, { anchor: "executed", actionId: cited?.actionId ?? null, text: "Check", categoryIds: [], focus });
    const note = service.annotations(sessionId).find((n) => n.annotation_id === id);
    const sources = (JSON.parse(note?.context ?? "{}") as { rule_sources: Record<string, string> }).rule_sources;
    expect(sources[cited?.ref ?? ""]).toMatch(/^\d{2}-.+\.md s\d/);
    expect(logEntriesOf(db, cited?.actionId ?? "").length).toBeGreaterThan(0);
  });
});

describe("rule index in exports and the CLI (P4-08)", () => {
  const options = { sessionIds: [sessionId], withStates: false, appVersion: "t", exportedAt: "2026-11-05T00:00:00Z" };
  it("puts the research source of each logged rule ref in the JSON export, once the session has logged some", () => {
    const withIndex = exportJson(db, { ...options, ruleIndex: service.ruleIndex }).packages[0]?.["ruleIndex"] as Record<string, string>;
    const refs = Object.keys(withIndex);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(withIndex[ref]).toMatch(/^\d{2}-.+\.md s\d/);
    expect(exportJson(db, options).packages[0]?.["ruleIndex"]).toEqual({});
  });

  it("writes the rule index into a CLI JSON export", () => {
    const out = join(dir, "cli-export.json");
    expect(exportCommand([sessionId], join(dir, "store.sqlite"), false, out, "t").exitCode).toBe(0);
    const pkg = (JSON.parse(readFileSync(out, "utf8")) as { packages: { ruleIndex: Record<string, string> }[] }).packages[0];
    expect(Object.keys(pkg?.ruleIndex ?? {}).length).toBeGreaterThan(0);
  });

  it("prints the section text for `sim rule` and exits 1 when nothing resolves", () => {
    const ok = ruleCommand("06 s3.2; DD-19.4; 06 s9.9", kurdishDir);
    expect(ok.exitCode).toBe(0);
    expect(ok.lines.join("\n")).toContain("06 s3.2 Cross-Border (06-operations-and-special-activities.md)");
    expect(ok.lines.join("\n")).toContain("Pay 2 Resources in addition to the Op cost");
    expect(ok.lines).toContain("Not found in the research files: 06 s9.9");
    expect(ok.lines).toContain("No research section cited: DD-19.4");
    expect(ruleCommand("debug.adjustTrack", kurdishDir).exitCode).toBe(1);
    expect(ruleCommand("06 s3.2", `${relative(process.cwd(), kurdishDir)}/../0.1.0`).exitCode).toBe(0);
    expect(ruleCommand("", kurdishDir)).toEqual({ exitCode: 1, lines: ["error: empty ref"] });
  });
});

describe("every rule ref in the engine and the package resolves (P4-08)", () => {
  const files = (root: string, ext: string): string[] =>
    readdirSync(root, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(root, e.name), ext) : e.name.endsWith(ext) && !e.name.endsWith(`.test${ext}`) ? [join(root, e.name)] : []));
  it("finds the cited research section for each literal in src/engine and game-packages", () => {
    const index = buildRuleIndex(readResearchDocs(join(repo, "game-packages"), "research/research-final/package-b-coin-design"));
    const sources = [...files(join(repo, "sim", "src", "engine"), ".ts"), ...files(join(repo, "game-packages"), ".yaml")].filter((f) => statSync(f).isFile());
    const bad: string[] = [];
    let seen = 0;
    for (const f of sources) {
      for (const m of readFileSync(f, "utf8").matchAll(/["']((?:\d{2} s\d[^"'\n]*))["']/g)) {
        seen++;
        const r = lookupRule(index, m[1] ?? "");
        if (r.missing.length > 0) bad.push(`${f.slice(repo.length)}: ${m[1] ?? ""} -> ${r.missing.join(", ")}`);
      }
    }
    expect(seen).toBeGreaterThan(100);
    expect(bad).toEqual([]);
  });
});
