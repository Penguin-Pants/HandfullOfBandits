// Propaganda phase handlers by ID (sequence.yaml `propagandaPhases`, research 05 s6).
import { victoryPhase } from "../victory.ts";
import { agitationPhase, civicActionPhase } from "./civic-agitation.ts";
import { legitimacyPhase } from "./legitimacy.ts";
import type { PropagandaPhase } from "./phase.ts";
import { resourcesPhase } from "./resources.ts";
import { upkeepPhase } from "./upkeep.ts";
import { redeployPhase } from "./redeploy.ts";
import { resetPhase } from "./reset.ts";
import { legalPoliticsPhase } from "./legal-politics.ts";

export const propagandaPhases: Readonly<Record<string, PropagandaPhase>> = Object.fromEntries(
  [victoryPhase, resourcesPhase, upkeepPhase, legitimacyPhase, legalPoliticsPhase, civicActionPhase, agitationPhase, redeployPhase, resetPhase].map((p) => [p.id, p]),
);

/** The phase after which the final round ends with final scoring (05 s6.6 item 3). */
export const FINAL_AFTER = agitationPhase.id;
