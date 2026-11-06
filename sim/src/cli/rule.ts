// `sim rule "<ref>" [--package <dir>]`: print the research text a log rule ref cites (11 P4-08).
import { lookupRule, ruleIndexOf } from "../annotate/rule-index.ts";
import { loadPackage, readPackageDir } from "../package/load.ts";

export function ruleCommand(ref: string, packageDir: string): { exitCode: number; lines: string[] } {
  const loaded = loadPackage(readPackageDir(packageDir));
  if (!loaded.ok) return { exitCode: 1, lines: [`error: the package does not load: ${packageDir}`] };
  const found = lookupRule(ruleIndexOf(loaded.data.rules), ref);
  const lines = found.sections.flatMap((s) => [`${s.cite} ${s.heading} (${s.file})`, "", ...(s.text === "" ? [] : [s.text, ""]), ...(s.subsections.length === 0 ? [] : [`Subsections: ${s.subsections.join("; ")}`, ""])]);
  if (found.missing.length > 0) lines.push(`Not found in the package rules.yaml: ${found.missing.join(", ")}`);
  if (found.other.length > 0) lines.push(`No research section cited: ${found.other.join("; ")}`);
  return { exitCode: found.sections.length > 0 ? 0 : 1, lines: found.sections.length === 0 && lines.length === 0 ? ["error: empty ref"] : lines };
}
