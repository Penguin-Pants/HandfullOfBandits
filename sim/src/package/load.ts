// Package loader (04 s9, s10.2). readPackageDir does the file I/O. loadPackage is pure:
// schema check, cross-file checks, content hash and Ruleset (DEC-37).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseDocument } from "yaml";
import { canonicalHash } from "../engine/core/canonical.ts";
import { SINGLE_FACE } from "../engine/core/state.ts";
import { markersIn } from "../engine/core/terms.ts";
import type { Ruleset, RulesetScenario } from "../engine/core/types.ts";
import { parsePackageFile, type PackageFile } from "./schema/index.ts";
import { validatePackage, type PackageData, type PackageIssue } from "./validate.ts";

const CORE_FILES = ["manifest", "parameters", "factions", "pieces", "map", "tracks", "markers", "victory", "sequence"] as const;
/** Read when present. A package without them is valid. */
const OPTIONAL_FILES = ["assumptions"] as const;
const SCENARIO_DIR = "scenarios";

/** Parsed YAML by package path (`/` separators). A file that failed to parse holds its issues instead. */
export interface RawPackage {
  readonly files: Readonly<Record<string, unknown>>;
  readonly issues: readonly PackageIssue[];
}

export type LoadResult =
  | { readonly ok: true; readonly data: PackageData; readonly hash: string; readonly ruleset: Ruleset; readonly issues: readonly PackageIssue[] }
  | { readonly ok: false; readonly issues: readonly PackageIssue[] };

const READ_ROOT = new Set([...CORE_FILES, ...OPTIONAL_FILES].map((file) => `${file}.yaml`));
/** Root entries that are not read and need no warning. */
const QUIET_ROOT = new Set([SCENARIO_DIR, "CHANGELOG.md"]);

function readError(path: string, e: unknown): PackageIssue {
  const code = (e as NodeJS.ErrnoException).code ?? "unknown error";
  return { level: "error", code: "V-SCHEMA", file: path, path: "", id: null, message: `Cannot read this entry (${code}).` };
}

/** Sorted names in `dir`. An absent folder has none; any other read failure is an issue. */
function entries(dir: string, path: string, issues: PackageIssue[]): string[] {
  try {
    return readdirSync(dir).sort();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") issues.push(readError(path, e));
    return [];
  }
}

/**
 * Read the core files and `scenarios/*.yaml`. Every other entry gets a warning, so a misnamed
 * file is never skipped in silence. Sequence, actions and cards have no schema yet (DEC-40).
 * Optional files (assumptions) are read when present.
 */
export function readPackageDir(dir: string): RawPackage {
  const files: Record<string, unknown> = {};
  const issues: PackageIssue[] = [];
  const root = entries(dir, ".", issues);
  const scenarios = entries(join(dir, SCENARIO_DIR), SCENARIO_DIR, issues).map((name) => `${SCENARIO_DIR}/${name}`);
  const paths = [...root.filter((name) => READ_ROOT.has(name)), ...scenarios.filter((path) => path.endsWith(".yaml"))];
  const unread = [...root.filter((name) => !READ_ROOT.has(name) && !QUIET_ROOT.has(name)), ...scenarios.filter((path) => !path.endsWith(".yaml"))];
  for (const path of unread.sort()) {
    issues.push({ level: "warning", code: "V-SCHEMA", file: path, path: "", id: null, message: "Not read. The loader reads only the core files and scenarios/*.yaml (DEC-40)." });
  }
  for (const path of paths) {
    let text: string;
    try {
      text = readFileSync(join(dir, ...path.split("/")), "utf8");
    } catch (e) {
      issues.push(readError(path, e));
      continue;
    }
    const doc = parseDocument(text);
    const first = doc.errors[0];
    if (first === undefined) {
      files[path] = doc.toJS();
    } else {
      // First line only: the yaml message ends with a multi-line source excerpt.
      const message = `YAML error: ${(first.message.split("\n")[0] ?? "").replace(/:$/, "")}.`;
      issues.push({ level: "error", code: "V-SCHEMA", file: path, path: "", id: null, message });
    }
  }
  return { files, issues };
}

/** Nearest `id` field on the way down a path, so a schema issue names its element. */
function idAt(data: unknown, path: string): string | null {
  let node = data;
  let found: string | null = null;
  for (const key of path === "" ? [] : path.split(".")) {
    if (typeof node !== "object" || node === null) break;
    node = (node as Record<string, unknown>)[key];
    const id = typeof node === "object" && node !== null ? (node as Record<string, unknown>)["id"] : undefined;
    if (typeof id === "string") found = id;
  }
  return found;
}

/** V-SCHEMA for every file, then cross-file checks, hash and Ruleset. */
export function loadPackage(raw: RawPackage): LoadResult {
  const issues: PackageIssue[] = [...raw.issues];
  const parsed: Record<string, unknown> = {};
  const check = (file: PackageFile, path: string): void => {
    if (!(path in raw.files)) {
      if (!raw.issues.some((issue) => issue.file === path)) {
        issues.push({ level: "error", code: "V-SCHEMA", file: path, path: "", id: null, message: "File is missing." });
      }
      return;
    }
    const data = raw.files[path];
    const result = parsePackageFile(file, data);
    if (result.ok) {
      parsed[path] = result.value;
    } else {
      for (const issue of result.issues) {
        issues.push({ level: "error", code: "V-SCHEMA", file: path, path: issue.path, id: idAt(data, issue.path), message: issue.message });
      }
    }
  };
  for (const file of CORE_FILES) check(file, `${file}.yaml`);
  for (const file of OPTIONAL_FILES) if (`${file}.yaml` in raw.files) check(file, `${file}.yaml`);
  const scenarioPaths = Object.keys(raw.files).filter((path) => path.startsWith(`${SCENARIO_DIR}/`)).sort();
  for (const path of scenarioPaths) check("scenario", path);
  if (issues.some((issue) => issue.level === "error")) return { ok: false, issues };

  const data: PackageData = {
    manifest: parsed["manifest.yaml"] as PackageData["manifest"],
    parameters: parsed["parameters.yaml"] as PackageData["parameters"],
    factions: parsed["factions.yaml"] as PackageData["factions"],
    pieces: parsed["pieces.yaml"] as PackageData["pieces"],
    map: parsed["map.yaml"] as PackageData["map"],
    tracks: parsed["tracks.yaml"] as PackageData["tracks"],
    markers: parsed["markers.yaml"] as PackageData["markers"],
    victory: parsed["victory.yaml"] as PackageData["victory"],
    sequence: parsed["sequence.yaml"] as PackageData["sequence"],
    ...("assumptions.yaml" in parsed ? { assumptions: parsed["assumptions.yaml"] as NonNullable<PackageData["assumptions"]> } : {}),
    scenarios: Object.fromEntries(scenarioPaths.map((path) => [path, parsed[path] as PackageData["scenarios"][string]])),
  };
  // 04 s10.2: hash the normalized content, so whitespace and comments do not change it.
  const hash = canonicalHash(packageContent(data));
  issues.push(...validatePackage(data));
  if (issues.some((issue) => issue.level === "error")) return { ok: false, issues };
  return { ok: true, data, hash, ruleset: compileRuleset(data, hash), issues };
}

/**
 * Normalized package content by file path: the value the package hash covers. Its canonical JSON
 * is what the store saves (04 s10.3); `loadPackage({files: content, issues: []})` loads it again.
 */
export function packageContent(data: PackageData): Record<string, unknown> {
  const { scenarios, ...core } = data;
  return { ...Object.fromEntries(Object.entries(core).map(([file, value]) => [`${file}.yaml`, value])), ...scenarios };
}

/** The fields core reads (types.ts). Absent flip states and sides become empty lists. */
export function compileRuleset(data: PackageData, packageHash: string): Ruleset {
  const parameters = Object.fromEntries(data.parameters.map((p) => [p.id, p.value ?? null]));
  return {
    packageHash,
    rulesetVersion: data.manifest.rulesetVersion,
    factions: data.factions.map((f) => ({ id: f.id, kind: f.kind, resourcesTrack: f.resourcesTrack ?? null })),
    pieces: data.pieces.map((p) => ({
      id: p.id,
      faction: p.faction,
      count: p.count,
      states: p.states ?? [],
      placedAs: p.placedAs ?? null,
      startPool: p.startPool,
      countsForControl: p.countsForControl,
    })),
    spaces: data.map.spaces.map((s) => ({ id: s.id, hasSupportScale: s.hasSupportScale, kind: s.kind, terrain: s.terrain ?? null, pop: s.pop })),
    tracks: data.tracks.map((t) => {
      if (t.kind === "ordinal") return { id: t.id, kind: t.kind, steps: t.steps };
      // V-PARAM guarantees an integer cost for every overflow.
      const cost = t.overflow === undefined ? undefined : parameters[t.overflow.costParam];
      const overflow = t.overflow === undefined || typeof cost !== "number" ? null : { track: t.overflow.track, cost };
      return { id: t.id, kind: t.kind, min: t.min, max: t.max, overflow };
    }),
    markers: data.markers.map((m) => ({ id: m.id, count: m.count, sides: m.sides ?? [], blocks: m.blocks ?? [], capsLevel: m.capsLevel ?? null })),
    stacking: data.map.stacking.map((r) => ({
      pieces: r.pieces,
      max: r.max,
      spaceKind: r.spaceKind ?? null,
      terrain: r.terrain ?? null,
      spaces: r.spaces ?? null,
    })),
    levelRange: data.map.supportLevels === undefined ? 0 : (data.map.supportLevels.length - 1) / 2,
    parameters,
    victory: data.victory,
    sequence: {
      model: data.sequence.model,
      boxes: data.sequence.boxes.map((b) => b.id),
      adjacency: data.sequence.adjacency.map(([a, b]) => [a ?? "", b ?? ""] as const),
      swapAfter: data.sequence.swapAfter,
      firstEligibleAtStart: data.sequence.firstEligibleAtStart,
      passIncome: data.sequence.passIncome,
    },
    harmMarkers: markersIn(Object.values(data.victory.harmCount).flat()),
    scenarios: Object.fromEntries(Object.values(data.scenarios).map((s) => [s.id, compileScenario(data, s)])),
  };
}

type FaceCountsData = number | Readonly<Record<string, number>>;

/** A bare count is on the given face (DEC-40). */
function faces(counts: Readonly<Record<string, FaceCountsData>> | undefined, face: (type: string) => string): Record<string, Record<string, number>> {
  return Object.fromEntries(Object.entries(counts ?? {}).map(([type, n]) => [type, typeof n === "number" ? { [face(type)]: n } : { ...n }]));
}

function compileScenario(data: PackageData, scenario: PackageData["scenarios"][string]): RulesetScenario {
  const placedAs = new Map(data.pieces.map((p) => [p.id, p.placedAs ?? SINGLE_FACE]));
  return {
    campaigns: scenario.campaigns,
    tracks: scenario.tracks,
    spaces: Object.fromEntries(
      Object.entries(scenario.spaces).map(([id, s]) => [
        id,
        { level: s.level ?? null, pieces: faces(s.pieces, (type) => placedAs.get(type) ?? SINGLE_FACE), markers: faces(s.markers, () => SINGLE_FACE) },
      ]),
    ),
    available: scenario.available ?? {},
    outOfPlay: scenario.outOfPlay ?? {},
    flags: scenario.flags ?? {},
    thresholds: scenario.thresholds ?? {},
  };
}
