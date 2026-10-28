// `sim validate <dir>` (04 s9, 11 P1-05). One line per issue: level, code, file, path, ID, sentence.
import { loadPackage, readPackageDir } from "../package/load.ts";
import type { PackageIssue } from "../package/validate.ts";

export function formatIssue(issue: PackageIssue): string {
  const where = issue.path === "" ? issue.file : `${issue.file} ${issue.path}`;
  const id = issue.id === null ? "" : ` [${issue.id}]`;
  const scope = issue.scenario === undefined ? "" : ` (blocks scenario ${issue.scenario})`;
  return `${issue.level} ${issue.code} ${where}${id}: ${issue.message}${scope}`;
}

/** Exit code 1 when the package has an error, else 0. A scenario-scoped error blocks its scenario only (DEC-51). */
export function validateCommand(dir: string): { readonly exitCode: number; readonly lines: readonly string[] } {
  const result = loadPackage(readPackageDir(dir));
  const lines = result.issues.map(formatIssue);
  if (result.ok) lines.push(`ok ${dir} hash ${result.hash}`);
  return { exitCode: result.ok ? 0 : 1, lines };
}
