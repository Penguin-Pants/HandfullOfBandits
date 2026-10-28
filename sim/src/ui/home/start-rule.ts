// Home Start rule (08 s6): Start is disabled while the package has errors or the scenario is blocked.
import type { PackageSummary } from "../api.ts";

/** Reasons Start is disabled. Empty: Start is enabled. */
export function startBlockers(pkg: PackageSummary | undefined, scenarioId: string, seed: string): string[] {
  if (pkg === undefined) return ["Choose a package."];
  const out: string[] = [];
  const errors = pkg.issues.filter((i) => i.level === "error" && i.scenario === undefined);
  if (!pkg.ok || errors.length > 0) out.push(`The package has ${String(errors.length)} errors.`);
  const scenario = pkg.scenarios.find((s) => s.id === scenarioId);
  if (scenario === undefined) out.push("Choose a scenario.");
  else if (scenario.blockedBy.length > 0) out.push(`Scenario ${scenario.id} is blocked: ${scenario.blockedBy.length.toString()} errors.`);
  if (!/^\d+$/.test(seed) || !Number.isSafeInteger(Number(seed))) out.push("The seed must be a whole number of 0 or more.");
  return out;
}
