// P4-05 package diff tool (04 s10.1 item 3). Accept: lists changed parameters, cards, handlers and
// modules between two versions. Handlers are what the package selects: the sequence model, the
// Propaganda phase list, card procedures and card modifiers.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { diffCommand } from "../src/cli/diff.ts";
import { diffPackages } from "../src/package/diff.ts";
import type { PackageData } from "../src/package/validate.ts";
import { kurdish, kurdishDir } from "./kurdish-package.ts";

/** A writable copy of the Kurdish package data, typed loosely for edits. */
interface Draft {
  parameters: { id: string; value: unknown; tune?: boolean; source?: string }[];
  cards: Record<string, Record<string, unknown>[]>;
  scenarios: Record<string, Record<string, unknown>>;
  sequence: { propagandaPhases: string[]; model: string };
  manifest: { modules: string[]; changeDescription: string };
}
const copy = (): Draft => structuredClone(kurdish.data) as unknown as Draft;
const diff = (next: Draft, old: Draft = copy()) => diffPackages(old as unknown as PackageData, next as unknown as PackageData);
const card = (data: Draft, id: string): Record<string, unknown> => {
  for (const list of Object.values(data.cards)) for (const c of list) if (c["id"] === id) return c;
  throw new Error(`no card ${id}`);
};

describe("P4-05 diffPackages", () => {
  it("finds nothing between equal packages", () => {
    const d = diff(copy());
    expect(d.parameters).toEqual({ added: [], removed: [], changed: [] });
    expect(d.cards).toEqual({ added: [], removed: [], changed: [] });
    expect(d.handlers).toEqual({ added: [], removed: [], changed: [] });
    expect(d.modules).toEqual({ added: [], removed: [], changed: [] });
    expect(d.otherFiles).toEqual([]);
  });

  it("lists added, removed and changed parameters with old and new values", () => {
    const next = copy();
    const harm = next.parameters.find((p) => p.id === "harm.limit");
    if (harm === undefined) throw new Error("harm.limit");
    harm.value = 5;
    const europe = next.parameters.find((p) => p.id === "europe.income");
    if (europe === undefined) throw new Error("europe.income");
    europe.value = [0, 1, 1, 1, 2, 2];
    next.parameters = next.parameters.filter((p) => p.id !== "deck.topSize");
    next.parameters.push({ id: "test.added", value: 3, tune: true, source: "test" });
    const d = diff(next);
    expect(d.parameters.added).toEqual([{ id: "test.added", value: 3 }]);
    expect(d.parameters.removed).toEqual([{ id: "deck.topSize", value: 8 }]);
    expect(d.parameters.changed).toEqual([
      { id: "europe.income", fields: ["value"], from: [0, 0, 1, 1, 2, 2], to: [0, 1, 1, 1, 2, 2] },
      { id: "harm.limit", fields: ["value"], from: 6, to: 5 },
    ]);
  });

  it("lists a parameter whose value is equal but whose other fields changed", () => {
    const next = copy();
    const harm = next.parameters.find((p) => p.id === "harm.limit");
    if (harm === undefined) throw new Error("harm.limit");
    harm.tune = false;
    Reflect.deleteProperty(harm, "source");
    expect(diff(next).parameters.changed).toEqual([{ id: "harm.limit", fields: ["source", "tune"], from: 6, to: 6 }]);
  });

  it("lists changed card fields by card ID, also when a card moves to another file", () => {
    const next = copy();
    const dk1 = card(next, "DK-001");
    (dk1["shaded"] as Record<string, unknown>)["text"] = "New text";
    (dk1["unshaded"] as Record<string, unknown>)["effects"] = [];
    dk1["mandatory"] = true;
    const c1 = next.cards["cards/c1.yaml"] ?? [];
    const dk2 = c1.find((c) => c["id"] === "DK-002");
    if (dk2 === undefined) throw new Error("DK-002");
    next.cards["cards/c1.yaml"] = c1.filter((c) => c["id"] !== "DK-002");
    next.cards["cards/c2.yaml"] = [...(next.cards["cards/c2.yaml"] ?? []), dk2];
    const d = diff(next);
    expect(d.cards.added).toEqual([]);
    expect(d.cards.removed).toEqual([]);
    expect(d.cards.changed).toEqual([
      { id: "DK-001", fields: ["mandatory", "shaded.text", "unshaded.effects"] },
      { id: "DK-002", fields: ["file cards/c1.yaml to cards/c2.yaml"] },
    ]);
  });

  it("lists added and removed cards", () => {
    const next = copy();
    const c1 = next.cards["cards/c1.yaml"] ?? [];
    const dk1 = c1.find((c) => c["id"] === "DK-001");
    if (dk1 === undefined) throw new Error("DK-001");
    next.cards["cards/c1.yaml"] = [...c1.filter((c) => c["id"] !== "DK-001"), { ...dk1, id: "DK-900" }];
    const d = diff(next);
    expect(d.cards.added).toEqual([{ id: "DK-900", file: "cards/c1.yaml" }]);
    expect(d.cards.removed).toEqual([{ id: "DK-001", file: "cards/c1.yaml" }]);
  });

  it("lists handler selections: procedures and modifiers with their cards, phases and their order, the sequence model", () => {
    const next = copy();
    // DK-003 runs no procedure: give it one the old package never selects. DK-072 is the only customs-union card.
    const dk3 = card(next, "DK-003");
    (dk3["always"] as unknown[]).push({ type: "procedure", id: "test.procedure" });
    const c4 = next.cards["cards/c4.yaml"] ?? [];
    next.cards["cards/c4.yaml"] = JSON.parse(JSON.stringify(c4).replaceAll('"customs-union"', '"test-modifier"')) as typeof c4;
    next.sequence.propagandaPhases = ["resources", "victory", ...next.sequence.propagandaPhases.slice(2).filter((p) => p !== "reset")];
    next.sequence.model = "ct-two-faction@2";
    const d = diff(next);
    expect(d.handlers.added).toEqual([
      { id: "modifier test-modifier", where: "DK-072" },
      { id: "procedure test.procedure", where: "DK-003" },
    ]);
    expect(d.handlers.removed).toEqual([
      { id: "modifier customs-union", where: "DK-072" },
      { id: "propaganda phase reset", where: "sequence.yaml" },
    ]);
    expect(d.handlers.changed).toEqual([
      { id: "propaganda phase order", from: kurdish.data.sequence.propagandaPhases.join(", "), to: next.sequence.propagandaPhases.join(", ") },
      { id: "sequence model", from: "ct-two-faction@1", to: "ct-two-faction@2" },
    ]);
  });

  it("lists module changes by module ID, with major version changes", () => {
    const next = copy();
    next.manifest.modules = ["ct-two-faction@2", "kurdish-coin.test@1"];
    const prev = copy();
    prev.manifest.modules = ["ct-two-faction@1", "kurdish-coin.gone@3"];
    const d = diff(next, prev);
    expect(d.modules).toEqual({
      added: ["kurdish-coin.test@1"],
      removed: ["kurdish-coin.gone@3"],
      changed: [{ id: "ct-two-faction", from: "1", to: "2" }],
    });
  });

  it("names other files whose content changed, so no change goes unreported", () => {
    const next = copy();
    const s0 = next.scenarios["scenarios/s0.yaml"];
    if (s0 === undefined) throw new Error("s0");
    s0["title"] = "Changed";
    next.manifest.changeDescription = "Changed";
    Reflect.deleteProperty(next.scenarios, "scenarios/scenario-c.yaml");
    expect(diff(next).otherFiles).toEqual(["manifest.yaml", "scenarios/s0.yaml", "scenarios/scenario-c.yaml"]);
  });
});

describe("P4-05 sim diff", () => {
  const dir = mkdtempSync(join(tmpdir(), "hob diff-"));
  const r5 = join(dir, "0.1.1");
  cpSync(kurdishDir, r5, { recursive: true });
  const edit = (file: string, from: RegExp, to: string): void => {
    const path = join(r5, file);
    const text = readFileSync(path, "utf8");
    if (!from.test(text)) throw new Error(`${file}: no match for ${String(from)}`);
    writeFileSync(path, text.replace(from, to));
  };
  edit("manifest.yaml", /^version: .*$/m, "version: 0.1.1\nparent: {version: 0.1.0, rulesetVersion: R4}");
  edit("manifest.yaml", /^rulesetVersion: .*$/m, "rulesetVersion: R5");
  edit("parameters.yaml", /\{id: harm\.limit, value: 6,/, "{id: harm.limit, value: 5,");
  edit("cards/c1.yaml", /Martial law reinforcement: place 2 Troops/, "Martial law reinforcement: place 3 Troops");
  const broken = join(dir, "broken");
  cpSync(kurdishDir, broken, { recursive: true });
  writeFileSync(join(broken, "parameters.yaml"), "- {id: harm.limit\n");
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  it("prints both versions and every changed parameter, card, handler and module", () => {
    const { exitCode, lines } = diffCommand(kurdishDir, r5);
    expect(exitCode).toBe(0);
    expect(lines[0]).toBe(`old kurdish-coin 0.1.0 R4 hash ${kurdish.hash}`);
    expect(lines[1]).toMatch(/^new kurdish-coin 0.1.1 R5 hash [0-9a-f]{64} parent 0\.1\.0 R4$/);
    expect(lines.slice(2)).toEqual([
      "Parameters: 1 changed",
      "  ~ harm.limit value: 6 to 5",
      "Cards: 1 changed",
      "  ~ DK-001: unshaded.text",
      "Handlers: no change",
      "Modules: no change",
      "Other files changed: manifest.yaml",
    ]);
  });

  it("says no change for the same folder", () => {
    const { exitCode, lines } = diffCommand(kurdishDir, kurdishDir);
    expect(exitCode).toBe(0);
    expect(lines.slice(2)).toEqual(["Parameters: no change", "Cards: no change", "Handlers: no change", "Modules: no change"]);
  });

  it("warns when the new parent is not the old version", () => {
    const { lines } = diffCommand(r5, kurdishDir);
    expect(lines).toContain("warning: the new package does not name 0.1.1 R5 as its parent");
  });

  it("exits 1 with the load issues when a package does not load", () => {
    const { exitCode, lines } = diffCommand(kurdishDir, broken);
    expect(exitCode).toBe(1);
    expect(lines[0]).toBe(`error: ${broken} does not load`);
    expect(lines.slice(1).every((l) => l.startsWith("error V-SCHEMA parameters.yaml"))).toBe(true);
    expect(lines.length).toBeGreaterThan(1);
  });
});
