// Map names use one bundled font so their width is the same on Windows, Mac and Linux (Georgia is absent on Linux).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dir = import.meta.dirname;
const css = readFileSync(join(dir, "styles.css"), "utf8");

describe("map name font", () => {
  it("every map and atlas label rule names the bundled Crimson Pro first", () => {
    const rules = [...css.matchAll(/^\.(?:map|atlas)-label\s*\{([^}]*)\}/gm)].map(m => m[1] ?? "").filter(body => /font(-family)?\s*:/.test(body));
    expect(rules.length).toBeGreaterThan(0);
    for (const body of rules) expect(body).toMatch(/font(?:-family)?\s*:[^;]*?(?:var\(--label-font\)|"Crimson Pro")/);
    expect(css).toMatch(/--label-font:\s*"Crimson Pro"/);
  });

  it("the UI entry loads both label weights from the bundled package", () => {
    const main = readFileSync(join(dir, "main.tsx"), "utf8");
    expect(main).toContain("@fontsource/crimson-pro/latin-600.css");
    expect(main).toContain("@fontsource/crimson-pro/latin-700.css");
  });
});
