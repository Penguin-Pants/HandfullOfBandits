// P4-08 rule lookup: a log rule ref resolves to the text of the research section it cites.
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { lookupRule, ruleIndexOf } from "../src/annotate/rule-index.ts";
import { loadPackage, readPackageDir } from "../src/package/load.ts";
import { buildApp } from "../src/server/app.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { logEntriesOf } from "../src/store/repos/log-entries.ts";
import { exportCommand } from "../src/cli/export.ts";
import { ruleCommand } from "../src/cli/rule.ts";
import { rulesCommand } from "../src/cli/rules.ts";
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
const { sessionId } = service.createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed: 1, name: "rules" });

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

  it("gives no rule text for a package without rules.yaml, and an empty ruleIndex in its export", () => {
    const bare = join(dir, "bare", "game-packages");
    cpSync(kurdishDir, join(bare, "kurdish-coin", "0.1.0"), { recursive: true });
    rmSync(join(bare, "kurdish-coin", "0.1.0", "rules.yaml"));
    const lone = new SessionService(db, bare);
    const { sessionId: id } = lone.createSession({ dir: join(bare, "kurdish-coin", "0.1.0"), scenarioId: "full-campaign", seed: 2, name: "bare" });
    expect(lone.ruleLookup(id, "06 s3.2")).toMatchObject({ sections: [], missing: ["06 s3.2"] });
    expect(exportJson(db, { sessionIds: [id], withStates: false, appVersion: "t", exportedAt: "x" }).packages[0]?.["ruleIndex"]).toEqual({});
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
    const withIndex = exportJson(db, options).packages[0]?.["ruleIndex"] as Record<string, string>;
    const refs = Object.keys(withIndex);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(withIndex[ref]).toMatch(/^\d{2}-.+\.md s\d/);
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
    expect(ok.lines).toContain("Not found in the package rules.yaml: 06 s9.9");
    expect(ok.lines).toContain("No research section cited: DD-19.4");
    expect(ruleCommand("debug.adjustTrack", kurdishDir).exitCode).toBe(1);
    expect(ruleCommand("06 s3.2", `${relative(process.cwd(), kurdishDir)}/../0.1.0`).exitCode).toBe(0);
    expect(ruleCommand("", kurdishDir)).toEqual({ exitCode: 1, lines: ["error: empty ref"] });
  });
});

describe("rules.yaml generation (P4-08; DEC-83)", () => {
  it("is current: the committed file equals what the research documents give", () => {
    expect(rulesCommand(kurdishDir, true)).toMatchObject({ exitCode: 0 });
  });

  it("writes the file, then reports it stale after an edit and missing when absent", () => {
    const root = join(dir, "gen");
    cpSync(join(repo, "research"), join(root, "research"), { recursive: true });
    const pkg = join(root, "game-packages", "kurdish-coin", "0.1.0");
    cpSync(kurdishDir, pkg, { recursive: true });
    rmSync(join(pkg, "rules.yaml"));
    expect(rulesCommand(pkg, true).exitCode).toBe(1);
    expect(rulesCommand(pkg, false).exitCode).toBe(0);
    expect(rulesCommand(pkg, true).exitCode).toBe(0);
    // A Windows checkout holds the committed file with CRLF line endings.
    const lf = (file: string): string => readFileSync(file, "utf8").replaceAll("\r\n", "\n");
    expect(lf(join(pkg, "rules.yaml"))).toBe(lf(join(kurdishDir, "rules.yaml")));
    writeFileSync(join(pkg, "rules.yaml"), readFileSync(join(pkg, "rules.yaml"), "utf8").replace("Cross-Border", "Cross-Borders"));
    expect(rulesCommand(pkg, true).exitCode).toBe(1);
    writeFileSync(join(pkg, "rules.yaml"), readFileSync(join(pkg, "rules.yaml"), "utf8").replace("Cross-Borders", "Cross-Border").replaceAll("\n", "\r\n"));
    expect(rulesCommand(pkg, true).exitCode).toBe(0);
  });

  it("rewrites a rules.yaml that no longer passes the schema", () => {
    const pkg = join(dir, "broken", "game-packages", "kurdish-coin", "0.1.0");
    cpSync(kurdishDir, pkg, { recursive: true });
    writeFileSync(join(pkg, "rules.yaml"), "- id: nonsense\n");
    cpSync(join(repo, "research"), join(dir, "broken", "research"), { recursive: true });
    expect(rulesCommand(pkg, true).exitCode).toBe(1);
    expect(rulesCommand(pkg, false).exitCode).toBe(0);
    expect(rulesCommand(pkg, true).exitCode).toBe(0);
  });

  it("reads no documents from a research base outside the repository root", () => {
    const pkg = join(dir, "outside", "game-packages", "kurdish-coin", "0.1.0");
    cpSync(kurdishDir, pkg, { recursive: true });
    const manifest = join(pkg, "manifest.yaml");
    const real = join(repo, "research", "research-final", "package-b-coin-design").replaceAll("\\", "/");
    writeFileSync(manifest, readFileSync(manifest, "utf8").replace(/^researchBase: .*$/m, `researchBase: ${relative(join(dir, "outside"), real).replaceAll("\\", "/")}`));
    expect(rulesCommand(pkg, false).exitCode).toBe(1);
  });

  it("refuses a package with no research documents", () => {
    const pkg = join(dir, "norsch", "game-packages", "kurdish-coin", "0.1.0");
    cpSync(kurdishDir, pkg, { recursive: true });
    expect(rulesCommand(pkg, false)).toEqual({ exitCode: 1, lines: ["error: no research documents found; check manifest researchBase"] });
  });
});

describe("every rule ref in the engine and the package resolves (P4-08)", () => {
  const files = (root: string, ext: string): string[] =>
    readdirSync(root, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(root, e.name), ext) : e.name.endsWith(ext) && !e.name.endsWith(`.test${ext}`) ? [join(root, e.name)] : []));
  it("finds the cited section in rules.yaml for each literal in src/engine and game-packages", () => {
    const loaded = loadPackage(readPackageDir(kurdishDir));
    if (!loaded.ok) throw new Error("the package does not load");
    const index = ruleIndexOf(loaded.data.rules);
    const sources = [...files(join(repo, "sim", "src", "engine"), ".ts"), ...files(join(repo, "game-packages"), ".yaml")].filter((f) => statSync(f).isFile() && !f.endsWith("rules.yaml"));
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
