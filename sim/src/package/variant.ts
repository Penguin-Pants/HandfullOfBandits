// Variant overlays (audit Plan 4 V1). A file `variants/<name>.yaml` in a package folder names only the
// setup fields it changes (schema/variant.ts). Applying it gives new package content with its own
// hash. The resolved scenario records the variant name, the base package hash and each change
// (schema/scenario.ts `variant`), so a stored session or run names its variant.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Document, isMap } from "yaml";
import { own } from "../engine/core/state.ts";
import { setupChanges } from "./diff.ts";
import { loadPackage, packageContent, parseYaml, readError, readPackageDir, VARIANT_DIR, type LoadResult, type RawPackage } from "./load.ts";
import { parsePackageFile, type PackageFileData } from "./schema/index.ts";
import type { PackageData, PackageIssue } from "./validate.ts";

export type Overlay = PackageFileData<"variant">;
type Loaded = Extract<LoadResult, { ok: true }>;

/** Variant names: lowercase letters, digits and '-', as experiment IDs. */
export const VARIANT_NAME = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Package path of a variant file. */
export const variantFile = (name: string): string => `${VARIANT_DIR}/${name}.yaml`;

/** Names of the `*.yaml` files in the package's variants folder, sorted. None when it has no folder. */
export function variantNames(dir: string): string[] {
  try {
    return readdirSync(join(dir, VARIANT_DIR)).filter((f) => f.endsWith(".yaml")).map((f) => f.slice(0, -".yaml".length)).sort();
  } catch (e) {
    // No folder, or a file in its place (the base loader ignores both).
    if (["ENOENT", "ENOTDIR"].includes((e as NodeJS.ErrnoException).code ?? "")) return [];
    throw e;
  }
}

/** Parsed YAML of `variants/<name>.yaml`, or the issue that stops it. */
export function readVariant(dir: string, name: string): { readonly data: unknown } | { readonly issues: readonly PackageIssue[] } {
  const file = variantFile(name);
  const fail = (message: string): { issues: PackageIssue[] } => ({ issues: [{ level: "error", code: "V-SCHEMA", file, path: "", id: name, message }] });
  if (!VARIANT_NAME.test(name)) return fail("A variant name uses lowercase letters, digits and '-' (at most 64).");
  let text: string;
  try {
    text = readFileSync(join(dir, VARIANT_DIR, `${name}.yaml`), "utf8");
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === "ENOENT" ? fail("File is missing.") : { issues: [{ ...readError(file, e), id: name }] };
  }
  const parsed = parseYaml(text);
  return "data" in parsed ? parsed : fail(parsed.message);
}

/** `{...a, ...b}`, or no field when both are absent: canonical JSON has no undefined. */
function merged<T>(key: string, a: Readonly<Record<string, T>> | undefined, b: Readonly<Record<string, T>> | undefined): Record<string, Record<string, T>> {
  return a === undefined && b === undefined ? {} : { [key]: { ...a, ...b } };
}

/**
 * Apply the overlay `data` (parsed YAML of `variants/<name>.yaml`) to a loaded package: the content
 * to load, with the overlay's own issues. Thresholds, tracks, pools and piece totals merge by key; a
 * space entry replaces the scenario's whole entry. Available is always derived. The result holds
 * only the variant's scenario.
 */
function applyVariant(base: Loaded, name: string, data: unknown): RawPackage {
  const file = variantFile(name);
  const parsed = parsePackageFile("variant", data);
  if (!parsed.ok) return { files: {}, issues: parsed.issues.map((i) => ({ level: "error", code: "V-SCHEMA", file, path: i.path, id: name, message: i.message })) };
  const v: Overlay = parsed.value;
  const issues: PackageIssue[] = [];
  if (v.base !== base.hash) {
    issues.push({ level: "warning", code: "V-VARIANT", file, path: "base", id: name, message: `Made on package ${v.base.slice(0, 12)}, but this package is ${base.hash.slice(0, 12)}. Check the changes, then set base to the new hash.` });
  }
  const entry = Object.entries(base.data.scenarios).find(([, s]) => s.id === v.scenario);
  for (const pieceId of Object.keys(v.pieces ?? {})) {
    if (!base.data.pieces.some((p) => p.id === pieceId)) issues.push({ level: "error", code: "V-REF", file, path: `pieces.${pieceId}`, id: pieceId, message: `Unknown piece "${pieceId}".` });
  }
  if (entry === undefined) issues.push({ level: "error", code: "V-REF", file, path: "scenario", id: v.scenario, message: `Unknown scenario "${v.scenario}".` });
  if (entry === undefined || issues.some((i) => i.level === "error")) return { files: {}, issues };
  const [path, scenario] = entry;
  type Scenario = PackageData["scenarios"][string];
  const resolved: Scenario = {
    ...scenario,
    tracks: { ...scenario.tracks, ...v.tracks },
    spaces: { ...scenario.spaces, ...v.spaces },
    ...merged("thresholds", scenario.thresholds, v.thresholds),
    ...merged("outOfPlay", scenario.outOfPlay, v.outOfPlay),
  };
  // Drop the stored pool (derived again) and any earlier variant record.
  for (const key of ["available", "variant"] as const) Reflect.deleteProperty(resolved, key);
  const next: PackageData = {
    ...base.data,
    pieces: base.data.pieces.map((p) => {
      const count = own(v.pieces, p.id);
      return count === undefined ? p : { ...p, count };
    }),
    // Only the variant's scenario: a changed piece total must not break another scenario's pools.
    scenarios: { [path]: resolved },
  };
  const variant = { name, base: base.hash, changes: setupChanges(base.data, next, v.scenario) };
  return { files: packageContent({ ...next, scenarios: { ...next.scenarios, [path]: { ...resolved, variant } } }), issues };
}

/**
 * Load the overlay `data` on a loaded package. A new issue on the changed scenario names the
 * variant file, because the variant caused it (the base package had no error).
 */
export function resolveVariant(base: Loaded, name: string, data: unknown): LoadResult {
  const raw = applyVariant(base, name, data);
  if (raw.issues.some((i) => i.level === "error")) return { ok: false, issues: raw.issues };
  const loaded = loadPackage(raw);
  const known = new Set(base.issues.map((i) => JSON.stringify(i)));
  const scenarioFiles = new Set(Object.keys(base.data.scenarios));
  const issues = loaded.issues.map((i) => (known.has(JSON.stringify(i)) || !scenarioFiles.has(i.file) ? i : { ...i, file: variantFile(name) }));
  return loaded.ok ? { ...loaded, issues } : { ok: false, issues };
}

/** Saved variant `name` of the package in `dir`, applied to that package once loaded. */
export function loadSavedVariant(base: Loaded, dir: string, name: string): LoadResult {
  const read = readVariant(dir, name);
  return "issues" in read ? { ok: false, issues: read.issues } : resolveVariant(base, name, read.data);
}

/** The package in `dir` with its variant `name` applied. */
export function loadVariant(dir: string, name: string): LoadResult {
  const base = loadPackage(readPackageDir(dir));
  return base.ok ? loadSavedVariant(base, dir, name) : base;
}

/** Overlay fields in file order. */
const FIELDS = ["base", "scenario", "thresholds", "tracks", "spaces", "pieces", "outOfPlay"] as const;

/**
 * YAML text of an overlay in the hand-written style (audit Plan 4 V2): one line per field, one line
 * per space. Fields it does not know are dropped.
 */
export function variantYaml(overlay: Overlay, comment: string): string {
  const ordered = Object.fromEntries(FIELDS.flatMap((f) => (overlay[f] === undefined ? [] : [[f, overlay[f]] as const])));
  const doc = new Document(ordered);
  if (isMap(doc.contents)) {
    for (const pair of doc.contents.items) {
      if (!isMap(pair.value)) continue;
      if ((pair.key as { value?: unknown }).value !== "spaces") pair.value.flow = true;
      else for (const space of pair.value.items) if (isMap(space.value)) space.value.flow = true;
    }
  }
  return `# ${comment}\n${doc.toString({ lineWidth: 0 })}`;
}

/**
 * Write `variants/<name>.yaml`. Refuses an existing file unless `replace`. Returns false when the
 * file exists and `replace` is false.
 */
export function writeVariant(dir: string, name: string, text: string, replace: boolean): boolean {
  if (!VARIANT_NAME.test(name)) throw new RangeError("A variant name uses lowercase letters, digits and '-' (at most 64).");
  mkdirSync(join(dir, VARIANT_DIR), { recursive: true });
  try {
    writeFileSync(join(dir, VARIANT_DIR, `${name}.yaml`), text, { flag: replace ? "w" : "wx" });
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw e;
  }
}
