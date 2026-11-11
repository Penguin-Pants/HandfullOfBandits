// Map names use one bundled font so their width is the same on Windows, Mac and Linux (Georgia is absent on Linux).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dir = import.meta.dirname;
// A Windows checkout has CRLF line ends. The tests read the rules with LF.
const css = readFileSync(join(dir, "styles.css"), "utf8").replaceAll("\r\n", "\n");

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

describe("map keyboard focus", () => {
  it("draws a focus ring on the area outline after every eligibility rule, so candidates keep it", () => {
    const focus = css.lastIndexOf(".map-space:focus-visible .atlas-outline {");
    expect(focus).toBeGreaterThan(-1);
    expect(focus).toBeGreaterThan(css.lastIndexOf(".map-space.eligible .atlas-area"));
    expect(focus).toBeGreaterThan(css.lastIndexOf(".map-space.ineligible .atlas-area"));
  });
});

describe("Map only scales on a narrow window", () => {
  it("opens the scales in flow at 1100 px or less, where the track card is not a positioned ancestor", () => {
    const narrow = css.slice(css.lastIndexOf("@media (max-width:1100px) {\n  .map-only .track-card"));
    const block = narrow.slice(0, narrow.indexOf("\n}"));
    expect(block).toMatch(/\.map-only \.track-card[^{]*\{[^}]*position:static/);
    expect(block).toMatch(/\.map-only \.track-scales\[open\] > \.political-tracks \{[^}]*position:static/);
  });
});
