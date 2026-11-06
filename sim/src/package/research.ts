// Research documents named by a package manifest (`researchBase`), read for the rule index
// (11 P4-08). The base is relative to the repository root, the folder that holds the package root.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

/**
 * Markdown files of the research folder by file name. No documents when the base is unset, the
 * folder is missing or the base points outside the repository root (the manifest is data, not a
 * path to trust).
 */
export function readResearchDocs(packagesRoot: string, researchBase: string | undefined): Record<string, string> {
  if (researchBase === undefined) return {};
  const root = dirname(packagesRoot);
  const dir = resolve(root, researchBase);
  const inside = relative(root, dir);
  if (inside.startsWith("..") || isAbsolute(inside) || !existsSync(dir)) return {};
  const docs: Record<string, string> = {};
  for (const name of readdirSync(dir).sort()) if (name.endsWith(".md")) docs[name] = readFileSync(join(dir, name), "utf8");
  return docs;
}
