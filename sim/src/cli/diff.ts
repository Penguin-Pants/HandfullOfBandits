// `sim diff <old-dir> <new-dir>` (04 s10.1 item 3; 11 P4-05). Changed parameters, cards, handlers
// and modules between two package versions, then other changed files. Exit 1 when one does not load.
import { loadPackage, readPackageDir } from "../package/load.ts";
import { diffPackages, type Changes } from "../package/diff.ts";
import type { PackageData } from "../package/validate.ts";
import { formatIssue } from "./validate.ts";

const value = (v: unknown): string => (typeof v === "string" ? v : JSON.stringify(v));

function section<Item, Changed>(title: string, c: Changes<Item, Changed>, item: (i: Item) => string, change: (c: Changed) => string): string[] {
  const counts = ([["added", c.added], ["removed", c.removed], ["changed", c.changed]] as const).filter(([, list]) => list.length > 0);
  if (counts.length === 0) return [`${title}: no change`];
  return [
    `${title}: ${counts.map(([name, list]) => `${String(list.length)} ${name}`).join(", ")}`,
    ...c.added.map((i) => `  + ${item(i)}`),
    ...c.removed.map((i) => `  - ${item(i)}`),
    ...c.changed.map((i) => `  ~ ${change(i)}`),
  ];
}

const label = (d: PackageData): string => `${d.manifest.packageId} ${d.manifest.version} ${d.manifest.rulesetVersion}`;

/** Version rules for two packages whose content differs (04 s10.1 items 1 and 3). */
function warnings(a: PackageData, b: PackageData): string[] {
  const parent = b.manifest.parent;
  return [
    ...(a.manifest.rulesetVersion === b.manifest.rulesetVersion ? [`warning: the content changed but rulesetVersion is still ${a.manifest.rulesetVersion} (04 s10.1 item 1)`] : []),
    ...(label(a) === label(b) || (parent?.version === a.manifest.version && parent.rulesetVersion === a.manifest.rulesetVersion) ? [] : [`warning: the new package does not name ${a.manifest.version} ${a.manifest.rulesetVersion} as its parent`]),
  ];
}

export function diffCommand(oldDir: string, newDir: string): { readonly exitCode: number; readonly lines: readonly string[] } {
  const load = (dir: string) => ({ dir, result: loadPackage(readPackageDir(dir)) });
  const [old, next] = [load(oldDir), load(newDir)];
  const failed = [old, next].flatMap(({ dir, result }) => (result.ok ? [] : [`error: ${dir} does not load`, ...result.issues.filter((i) => i.level === "error").map(formatIssue)]));
  if (!old.result.ok || !next.result.ok) return { exitCode: 1, lines: failed };
  const [a, b] = [old.result.data, next.result.data];
  const parent = b.manifest.parent;
  const d = diffPackages(a, b);
  return {
    exitCode: 0,
    lines: [
      `old ${label(a)} hash ${old.result.hash}`,
      `new ${label(b)} hash ${next.result.hash}${parent === undefined ? "" : ` parent ${parent.version} ${parent.rulesetVersion}`}`,
      ...(old.result.hash === next.result.hash ? [] : warnings(a, b)),
      ...section("Parameters", d.parameters, (p) => `${p.id} = ${value(p.value)}`, (p) => `${p.id} ${p.fields.map((f) => (f === "value" ? `value: ${value(p.from)} to ${value(p.to)}` : f)).join(", ")}`),
      ...section("Cards", d.cards, (c) => `${c.id} (${c.file})`, (c) => `${c.id}: ${c.fields.join(", ")}`),
      ...section("Handlers", d.handlers, (h) => `${h.id} (${h.where})`, (h) => `${h.id}: ${h.from} to ${h.to}`),
      ...section("Modules", d.modules, (m) => m, (m) => `${m.id}: @${m.from} to @${m.to}`),
      ...(d.otherFiles.length === 0 ? [] : [`Other files changed: ${d.otherFiles.join(", ")}`]),
    ],
  };
}
