// Audit Plan 4 V4: printable setup sheet. Acceptance: the sheet matches the rule 10.2 layout for
// the baseline. A variant sheet adds its change list; the session export prints the same text.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { setupSheetCommand } from "../src/cli/setup-sheet.ts";
import { exportJson } from "../src/export/json.ts";
import { exportMarkdown } from "../src/export/markdown.ts";
import { changeLines, setupSheet } from "../src/export/setup-sheet.ts";
import { derive } from "../src/engine/coin/derive.ts";
import { coinHandlers } from "../src/engine/coin/handlers.ts";
import { createEngine } from "../src/engine/index.ts";
import { packageContent } from "../src/package/load.ts";
import { resolveVariant } from "../src/package/variant.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { tempDir } from "./experiment-helpers.ts";
import { kurdish, kurdishDir } from "./kurdish-package.ts";

const main = fileURLToPath(new URL("../src/cli/main.ts", import.meta.url));
const rules = readFileSync(fileURLToPath(new URL("../../docs/rules/prototype-rules.md", import.meta.url)), "utf8");
/** Rule 10.2 paragraphs: from its heading to the next one. */
const rule102 = (rules.split("## 10.2 Starting Position")[1] ?? "").split("\n## ")[0]?.trim().split(/\n\n/) ?? [];
const temps: string[] = [];
afterAll(() => {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
});

const sheet = (variant: string | null): string => {
  const r = setupSheetCommand(kurdishDir, variant, "full-campaign", null);
  expect(r.exitCode, r.lines.join("\n")).toBe(0);
  return r.lines.join("\n");
};
/** Paragraphs of the sheet's Starting Position section. */
const section = (text: string): string[] => (text.split("## Starting Position")[1] ?? "").trim().split(/\n\n/);
const tableRows = (paragraph: string): string[] => paragraph.split("\n").filter((l) => l.startsWith("| ")).slice(1);

describe("setup sheet against rule 10.2 (audit Plan 4 V4)", () => {
  const baseline = section(sheet(null));
  const [tracks, legend, table, levels, closing] = baseline;
  const [ruleTracks, ruleLegend, ruleTable, ruleLevels, ruleClosing] = rule102;

  it("has the rule 10.2 sections in the same order", () => {
    expect(baseline).toHaveLength(5);
    expect(rule102).toHaveLength(5);
  });

  it("writes the same tracks sentence and Campaign", () => {
    expect(tracks?.split(". ")[0]).toBe(ruleTracks?.split(". ")[0]);
    expect(tracks?.split(". ")[0]).toBe("Set State Resources 12, PKK Resources 5, Legitimacy 10, Europe 1 and Campaign C1");
  });

  it("writes the same legend, levels and closing paragraph", () => {
    expect(legend).toBe(ruleLegend);
    expect(levels).toBe(ruleLevels);
    expect(closing).toBe(ruleClosing);
  });

  it("writes the same table header and the same row for every space", () => {
    expect(table?.split("\n").slice(0, 2)).toEqual(ruleTable?.split("\n").slice(0, 2));
    // Rule 10.2 shortens "Diyarbakır City (Amed)", the name of the map table (rule 1.3) and the package.
    const ours = tableRows(table ?? "").map((r) => r.replace("Diyarbakır City (Amed)", "Diyarbakır City"));
    expect([...ours].sort()).toEqual([...tableRows(ruleTable ?? "")].sort());
  });
});

describe("variant sheets (audit Plan 4 V4)", () => {
  it("lists the changes and shows them in the table and pools", () => {
    const text = sheet("dd25-setup-police");
    expect(text).toMatch(/^# Setup sheet: Full campaign \(1984-1999\), variant dd25-setup-police\n/);
    expect(text).toContain(`Variant \`dd25-setup-police\`, made on package \`${kurdish.hash.slice(0, 12)}\`.`);
    expect(text).toContain("## Changes from the package setup\n\n- Siirt: +1 Police (from Available).\n- Bitlis: +1 Police (from Available).\n- Available Police: 2 (was 4).\n");
    expect(text).toContain("| Siirt | 2P | 1G |");
    expect(text).toContain("Available: 14 Troops, 2 Police, 4 State Bases");
  });

  it("writes new thresholds and their margins", () => {
    const text = sheet("dd25-thresholds-43-38");
    expect(text).toContain("- State threshold 43 (was 49).\n- PKK threshold 38 (was 32).");
    expect(text).toContain("Thresholds: State 43, PKK 38.");
    expect(text).toContain("Starting margins: −22 and −32.");
  });

  it("marks a piece on its other face, and a level change", () => {
    const v = resolveVariant(kurdish, "faces", { base: kurdish.hash, scenario: "full-campaign", spaces: { "kdp-zone": { pieces: { guerrilla: { underground: 3, active: 1 }, pkkBase: 1 } }, mardin: { level: 1, pieces: { troops: 1, police: 1, guerrilla: 1 } } } });
    if (!v.ok) throw new Error(JSON.stringify(v.issues));
    const start = { available: {}, scores: {}, margins: {}, harm: {}, control: {} };
    const text = setupSheet(packageContent(v.data), v.hash, "full-campaign", start);
    expect(text).toContain("| KDP Zone | — | 4G (1 Active), 1B |");
    expect(text).toContain("All Guerrillas below start Underground unless their cell names another state.");
    expect(text).toContain("- Mardin: Passive Support (was Neutral).");
    expect(text).toContain("- KDP Zone: −1 Guerrilla (Underground).\n- KDP Zone: +1 Guerrilla (Active).");
  });

  it("writes an empty Available pool as none and treats zero counts as empty (review fix)", () => {
    const content = structuredClone(packageContent(kurdish.data)) as Record<string, { spaces?: Record<string, unknown> }>;
    const scenario = content["scenarios/full-campaign.yaml"];
    if (scenario?.spaces === undefined) throw new Error("no scenario");
    scenario.spaces["mus"] = { pieces: { troops: 0 } };
    const { state } = createEngine(coinHandlers).start(kurdish.ruleset, "full-campaign", 0);
    const view = derive(kurdish.ruleset, state);
    const text = setupSheet(content, kurdish.hash, "full-campaign", { available: {}, scores: view.scores, margins: view.margins, harm: view.harm, control: { ...view.control, mus: null } });
    expect(text).toContain("Available: none.");
    expect(text).toContain("Şırnak, Siirt and Bitlis have no Control.");
    expect(text).toContain("| Muş | — | — |");
  });

  it("writes totals, Out of Play and track changes", () => {
    const content = packageContent(kurdish.data);
    expect(changeLines([
      { kind: "total", space: null, id: "police", face: null, from: 24, to: 26 },
      { kind: "outOfPlay", space: null, id: "guards", face: null, from: 16, to: 10 },
      { kind: "track", space: null, id: "emergencyRule", face: null, from: "martialLaw", to: "ohal" },
    ], content)).toEqual(["Police total: 26 (was 24).", "Out of Play Guards: 10 (was 16).", "Emergency Rule Ohal (was Martial Law)."]);
  });
});

describe("sim setup-sheet (audit Plan 4 V4)", () => {
  it("writes a new file and never overwrites one", () => {
    const out = join(tempDir(), "sheet.md");
    const first = spawnSync(process.execPath, [main, "setup-sheet", kurdishDir, "--variant", "dd25-variant-a", "--out", out], { encoding: "utf8" });
    expect(first.status, first.stderr).toBe(0);
    expect(readFileSync(out, "utf8")).toContain("# Setup sheet: Full campaign (1984-1999), variant dd25-variant-a");
    const again = spawnSync(process.execPath, [main, "setup-sheet", kurdishDir, "--out", out], { encoding: "utf8" });
    expect(again.status).toBe(1);
  });

  it("refuses an unknown variant or scenario, and bad options", () => {
    expect(setupSheetCommand(kurdishDir, "nothing-here", "full-campaign", null).exitCode).toBe(1);
    expect(setupSheetCommand(kurdishDir, null, "short", null)).toEqual({ exitCode: 1, lines: ['error: unknown scenario "short"'] });
    expect(spawnSync(process.execPath, [main, "setup-sheet", kurdishDir, "--colour", "red"], { encoding: "utf8" }).status).toBe(2);
    expect(spawnSync(process.execPath, [main, "setup-sheet", kurdishDir, "--variant"], { encoding: "utf8" }).status).toBe(2);
  });
});

describe("session export names the variant with the sheet's text (audit Plan 4 V4)", () => {
  it("prints the variant and its change lines", () => {
    const dir = tempDir("hob sheet export ");
    temps.push(dir);
    const root = join(dir, "packages");
    const pkg = join(root, "kurdish-coin", "0.1.0");
    cpSync(kurdishDir, pkg, { recursive: true });
    const db = openStore(join(dir, "s.sqlite"));
    try {
      const service = new SessionService(db, root);
      const { sessionId } = service.createSession({ dir: pkg, scenarioId: "full-campaign", seed: 4, name: "paper twin", variant: "dd25-setup-police" });
      const md = exportMarkdown(exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "test", exportedAt: "2026-11-19T00:00:00Z" }));
      expect(md).toContain("Scenario full-campaign, setup variant dd25-setup-police, seed 4.");
      const sheetLines = (sheet("dd25-setup-police").split("## Changes from the package setup\n\n")[1] ?? "").split("\n\n")[0];
      expect(md).toContain(`variant dd25-setup-police, made on package ${kurdish.hash.slice(0, 12)}.\n\n${sheetLines ?? ""}\n`);
    } finally {
      db.close();
    }
    expect(existsSync(pkg)).toBe(true);
  });
});
