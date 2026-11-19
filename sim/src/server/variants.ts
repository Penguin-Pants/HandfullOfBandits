// Setup editor data (audit Plan 4 V2): the variants of a package, one overlay checked against it,
// and the base setup the editor shows. The service reads the folder; these functions are pure.
import type { LoadResult } from "../package/load.ts";
import type { SetupChange } from "../package/diff.ts";
import { parsePackageFile } from "../package/schema/index.ts";
import type { PackageData, PackageIssue } from "../package/validate.ts";
import { resolveVariant, variantFile, variantYaml, type Overlay } from "../package/variant.ts";

type Loaded = Extract<LoadResult, { ok: true }>;

/** A saved variant of a package and its check. `issues` are those of its own file. */
export interface VariantSummary {
  readonly name: string;
  readonly ok: boolean;
  readonly hash: string | null;
  readonly issues: readonly PackageIssue[];
}

/** The base setup of one scenario, as the editor shows it. `values` are the scenario's own fields. */
export interface SetupBase {
  readonly packageHash: string;
  readonly scenario: string;
  readonly spaces: readonly { readonly id: string; readonly name: string; readonly kind: string; readonly hasSupportScale: boolean }[];
  /** `faces`: flip states, or one face for a one-faced type. `placedAs`: the face a bare count means. */
  readonly pieces: readonly { readonly id: string; readonly faction: string; readonly count: number; readonly faces: readonly string[]; readonly placedAs: string | null }[];
  readonly factions: readonly { readonly id: string; readonly name: string }[];
  readonly tracks: readonly { readonly id: string; readonly display: string; readonly kind: "numeric" | "ordinal"; readonly min: number | null; readonly max: number | null; readonly steps: readonly string[] }[];
  /** Highest level step either way, 2 for Active Support and Active Opposition. */
  readonly levelRange: number;
  readonly values: {
    readonly thresholds: Readonly<Record<string, number>>;
    readonly tracks: Readonly<Record<string, number | string>>;
    readonly spaces: PackageData["scenarios"][string]["spaces"];
    readonly outOfPlay: Readonly<Record<string, number>>;
  };
}

/** One overlay checked against its package. `setup` is null when the overlay names no known scenario. */
export interface VariantCheck {
  readonly overlay: unknown;
  /** Export text; null when the overlay does not pass its schema. */
  readonly yaml: string | null;
  readonly ok: boolean;
  readonly hash: string | null;
  readonly issues: readonly PackageIssue[];
  readonly changes: readonly SetupChange[];
  readonly setup: SetupBase | null;
}

/** Export and save text of an overlay made in the editor. */
export const editorYaml = (name: string, overlay: Overlay): string => variantYaml(overlay, `Variant ${name}, made in the setup editor (audit Plan 4).`);

function setupBase(base: Loaded, scenarioId: string): SetupBase | null {
  const data = base.data;
  const scenario = Object.values(data.scenarios).find((s) => s.id === scenarioId);
  if (scenario === undefined) return null;
  return {
    packageHash: base.hash,
    scenario: scenarioId,
    spaces: data.map.spaces.map((s) => ({ id: s.id, name: s.name, kind: s.kind, hasSupportScale: s.hasSupportScale })),
    pieces: data.pieces.map((p) => ({ id: p.id, faction: p.faction, count: p.count, faces: p.states ?? [], placedAs: p.placedAs ?? null })),
    factions: data.factions.filter((f) => f.kind === "player").map((f) => ({ id: f.id, name: f.name })),
    tracks: data.tracks
      .filter((t) => Object.hasOwn(scenario.tracks, t.id))
      .map((t) => (t.kind === "numeric" ? { id: t.id, display: t.display, kind: t.kind, min: t.min, max: t.max, steps: [] } : { id: t.id, display: t.display, kind: t.kind, min: null, max: null, steps: t.steps })),
    levelRange: base.ruleset.levelRange,
    values: { thresholds: scenario.thresholds ?? {}, tracks: scenario.tracks, spaces: scenario.spaces, outOfPlay: scenario.outOfPlay ?? {} },
  };
}

/** Check overlay `data` as variant `name` of the loaded package. An overlay without `base` gets the package hash. */
export function checkVariant(base: Loaded, name: string, data: unknown): VariantCheck {
  const overlay = typeof data === "object" && data !== null && !Array.isArray(data) && !("base" in data) ? { base: base.hash, ...data } : data;
  const result = resolveVariant(base, name, overlay);
  const parsed = parsePackageFile("variant", overlay);
  const scenarioId = parsed.ok ? parsed.value.scenario : null;
  const resolved = result.ok ? Object.values(result.data.scenarios).find((s) => s.id === scenarioId) : undefined;
  return {
    overlay,
    yaml: parsed.ok ? editorYaml(name, parsed.value) : null,
    ok: result.ok,
    hash: result.ok ? result.hash : null,
    issues: result.issues,
    changes: resolved?.variant?.changes ?? [],
    setup: scenarioId === null ? null : setupBase(base, scenarioId),
  };
}

/** Check result as a list row: only the issues of the variant's own file. */
export function variantSummary(name: string, result: LoadResult): VariantSummary {
  return { name, ok: result.ok, hash: result.ok ? result.hash : null, issues: result.issues.filter((i) => i.file === variantFile(name)) };
}
