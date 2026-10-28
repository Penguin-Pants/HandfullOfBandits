import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { validateCommand } from "../src/cli/validate.ts";
import { loadPackage, readPackageDir } from "../src/package/load.ts";

// P1-06: the "tiny" test package for engine tests. Accept: `sim validate` passes.
const tinyDir = fileURLToPath(new URL("packages/tiny", import.meta.url));

describe("tiny test package", () => {
  const result = loadPackage(readPackageDir(tinyDir));

  it("passes sim validate with no issues", () => {
    expect(validateCommand(tinyDir).exitCode).toBe(0);
    expect(result.issues).toEqual([]);
  });

  it("has 4 spaces, 2 player factions with 2 piece types and 1 track each, and 1 ordinal track", () => {
    if (!result.ok) throw new Error("tiny must load");
    const { factions, pieces, map, tracks } = result.data;
    expect(map.spaces).toHaveLength(4);
    expect(factions.map((f) => [f.id, f.kind])).toEqual([
      ["blue", "player"],
      ["red", "player"],
    ]);
    for (const faction of factions) {
      expect(pieces.filter((p) => p.faction === faction.id)).toHaveLength(2);
      expect(tracks.filter((t) => t.owner === faction.id)).toHaveLength(1);
    }
    expect(tracks.filter((t) => t.kind === "ordinal")).toHaveLength(1);
  });
});
