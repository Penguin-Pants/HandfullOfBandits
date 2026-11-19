// `sim validate <dir>` (04 s9, 11 P1-05). One line per issue: level, code, file, path, ID, sentence.
// Each variant in the package's variants folder is checked too (audit Plan 4 V1).
import { loadPackage, readPackageDir } from "../package/load.ts";
import type { PackageIssue } from "../package/validate.ts";
import { readVariant, resolveVariant, variantFile, variantNames } from "../package/variant.ts";

export function formatIssue(issue: PackageIssue): string {
  const where = issue.path === "" ? issue.file : `${issue.file} ${issue.path}`;
  const id = issue.id === null ? "" : ` [${issue.id}]`;
  const scope = issue.scenario === undefined ? "" : ` (blocks scenario ${issue.scenario})`;
  return `${issue.level} ${issue.code} ${where}${id}: ${issue.message}${scope}`;
}

/**
 * Exit code 1 when the package or one of its variants has an error, else 0. A scenario-scoped error
 * blocks its scenario only (DEC-51). A variant line lists only the issues of its own file.
 */
export function validateCommand(dir: string): { readonly exitCode: number; readonly lines: readonly string[] } {
  const result = loadPackage(readPackageDir(dir));
  const lines = result.issues.map(formatIssue);
  if (!result.ok) return { exitCode: 1, lines };
  lines.push(`ok ${dir} hash ${result.hash}`);
  let exitCode = 0;
  for (const name of variantNames(dir)) {
    const read = readVariant(dir, name);
    const variant = "issues" in read ? { ok: false as const, issues: read.issues } : resolveVariant(result, name, read.data);
    lines.push(...variant.issues.filter((i) => i.file === variantFile(name)).map(formatIssue));
    if (variant.ok) lines.push(`ok variant ${name} hash ${variant.hash}`);
    else {
      lines.push(`error: variant ${name} does not load`);
      exitCode = 1;
    }
  }
  return { exitCode, lines };
}
