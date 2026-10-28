// Propaganda phase handlers by ID (sequence.yaml `propagandaPhases`, research 05 s6).
import { victoryPhase } from "../victory.ts";
import { agitationPhase, civicActionPhase } from "./civic-agitation.ts";
import { legitimacyPhase } from "./legitimacy.ts";
import type { PropagandaPhase } from "./phase.ts";
import { resourcesPhase } from "./resources.ts";
import { upkeepPhase } from "./upkeep.ts";
import { violation } from "./phase.ts";

/** Legal Politics runs from C3 (05 s6.5). In the slice it only checks that Legal Space is Absent. */
const legalPolitics: PropagandaPhase = {
  id: "legalPolitics",
  ruleRef: "05 s6.5",
  check: (_ruleset, state) => (state.tracks["legalSpace"] === "absent" ? [] : [violation("notInSlice", "Legal Politics is not in the slice yet (Phase 3b).", "05 s6.5")]),
  run(ctx) {
    ctx.log("EffectSkipped", { effect: "legalPolitics", reason: "legalSpaceAbsent" }, "05 s6.5");
  },
};

/** Phases that only a non-final round reaches; not in the slice (Phase 3a). */
function later(id: string, ruleRef: string): PropagandaPhase {
  return { id, ruleRef, check: () => [violation("notInSlice", `The ${id} phase is not in the slice yet (Phase 3a).`, ruleRef)], run: () => undefined };
}

export const propagandaPhases: Readonly<Record<string, PropagandaPhase>> = Object.fromEntries(
  [victoryPhase, resourcesPhase, upkeepPhase, legitimacyPhase, legalPolitics, civicActionPhase, agitationPhase, later("redeploy", "05 s6.7"), later("reset", "05 s6.8")].map((p) => [p.id, p]),
);

/** The phase after which the final round ends with final scoring (05 s6.6 item 3). */
export const FINAL_AFTER = agitationPhase.id;
