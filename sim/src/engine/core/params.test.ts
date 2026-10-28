import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadPackage, readPackageDir } from "../../package/load.ts";
import { param } from "./params.ts";
import type { Ruleset } from "./types.ts";

// P1-08: handlers read game numbers only through parameter IDs (04 s4.5).
const loaded = loadPackage(readPackageDir(fileURLToPath(new URL("../../../test/packages/tiny", import.meta.url))));
if (!loaded.ok) throw new Error("tiny must load");
const ruleset: Ruleset = {
  ...loaded.ruleset,
  parameters: { ...loaded.ruleset.parameters, "ui.label": "text", "harm.order": ["blue", 3], "ui.unset": null },
};

describe("param", () => {
  it("returns a number parameter from the package", () => {
    expect(param(ruleset, "train.costPerSpace", "number")).toBe(1);
    expect(param(ruleset, "standing.overflowCost", "number")).toBe(2);
  });

  it("returns a string or list parameter", () => {
    expect(param(ruleset, "ui.label", "string")).toBe("text");
    expect(param(ruleset, "harm.order", "list")).toEqual(["blue", 3]);
  });

  it("throws on an unknown ID", () => {
    expect(() => param(ruleset, "sweep.costPerSpace", "number")).toThrow(new RangeError('Unknown parameter "sweep.costPerSpace"'));
  });

  it("throws on an entry with no value", () => {
    expect(() => param(ruleset, "ui.unset", "string")).toThrow(new RangeError('Parameter "ui.unset" has no value'));
  });

  it("throws when the value is not the kind the handler reads", () => {
    expect(() => param(ruleset, "ui.label", "number")).toThrow(new TypeError('Parameter "ui.label" must be a number, got string'));
    expect(() => param(ruleset, "train.costPerSpace", "list")).toThrow(new TypeError('Parameter "train.costPerSpace" must be a list, got number'));
    expect(() => param(ruleset, "harm.order", "string")).toThrow(new TypeError('Parameter "harm.order" must be a string, got list'));
  });
});
