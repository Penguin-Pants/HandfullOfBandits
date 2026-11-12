// Short games for tests that play to the end (mock data, tests only). The package holds the full
// campaign only. The fixture is the full campaign setup with one Campaign, written to a
// temporary copy of the package so the loader, the server and the CLI read it as a real scenario.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadPackage, readPackageDir } from "../src/package/load.ts";
import { kurdishDir } from "./kurdish-package.ts";

/** One Campaign, 8 Event cards, the Propaganda card last, no Pivotal. Final round 1. */
export const SHORT = "short-c1";

const full = readFileSync(join(kurdishDir, "scenarios", "full-campaign.yaml"), "utf8");
function fixture(id: string, campaigns: string, finalRound: number, pivotals: string, extra: string): string {
  const edits: [string, string][] = [
    ["id: full-campaign", `id: ${id}`],
    ["title: Full campaign (1984-1999)", `title: Test fixture ${id}`],
    ["campaigns: [C1, C2, C3, C4, C5]", `campaigns: ${campaigns}`],
    ["finalRound: 5", `finalRound: ${String(finalRound)}`],
    ["pivotals: {state: [DK-076, DK-098], pkk: [DK-015, DK-054]}", `pivotals: ${pivotals}`],
  ];
  let text = full;
  for (const [from, to] of edits) {
    if (!text.includes(from)) throw new Error(`full-campaign.yaml has no line "${from}"`);
    text = text.replace(from, to);
  }
  return `${text}testOnly: true\n${extra}`;
}

/** Copy the Kurdish package into a new temporary folder and add the fixture. The caller removes `root`. */
export function shortPackage(prefix = "hob-short-"): { root: string; dir: string } {
  const root = mkdtempSync(join(tmpdir(), prefix));
  const dir = join(root, "kurdish-coin", "0.1.0");
  cpSync(kurdishDir, dir, { recursive: true });
  writeFileSync(join(dir, "scenarios", `${SHORT}.yaml`), fixture(SHORT, "[C1]", 1, "{state: [], pkk: []}", "pileSize: 8\npropagandaLast: true\n"));
  return { root, dir };
}

/** The package with the fixture, loaded once for engine tests. The temporary folder is removed at once. */
function load(): Extract<ReturnType<typeof loadPackage>, { ok: true }> {
  const { root, dir } = shortPackage();
  try {
    const result = loadPackage(readPackageDir(dir));
    if (!result.ok) throw new Error(`the short fixture must load: ${JSON.stringify(result.issues)}`);
    return result;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
export const short = load();
