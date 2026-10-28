// Mocked API for UI component tests (11 P2-13 to P2-17). Each method is overridable.
import type { Api, PackageSummary } from "../../src/ui/api.ts";

export const okPackage: PackageSummary = {
  dir: "/pk/kurdish-coin/0.1.0",
  packageId: "kurdish-coin",
  version: "0.1.0",
  title: "Kurdish COIN",
  hash: "a".repeat(64),
  ok: true,
  issues: [{ level: "error", code: "V-ENCODE", file: "scenarios/full-campaign.yaml", path: "", id: "DK-004", message: "Not encoded.", scenario: "full-campaign" }],
  scenarios: [
    { id: "s0", title: "S0 Opening (test)", blockedBy: [], testOnly: true },
    { id: "full-campaign", title: "Full campaign", blockedBy: ["V-ENCODE DK-004: Not encoded."], testOnly: false },
  ],
  assumptions: [{ id: "PA-01", text: "Executing faction chooses", status: "accepted" }],
  options: { syriaMarchRestricted: ["allow", "deny"] },
};

const never = (): Promise<never> => Promise.reject(new Error("not mocked"));

export function mockApi(overrides: Partial<Api> = {}): Api {
  return {
    packages: () => Promise.resolve([okPackage]),
    sessions: () => Promise.resolve([]),
    createSession: never,
    session: never,
    validate: never,
    submit: never,
    legal: never,
    history: () => Promise.resolve([]),
    state: never,
    categories: () => Promise.resolve([]),
    annotations: () => Promise.resolve([]),
    annotate: never,
    ...overrides,
  };
}
