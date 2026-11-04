// Covert Action (research 06 s3.5; approved text docs/prototype/28). With Garrison or Sweep, from
// C3, at Legitimacy 4 or more: in one space with State Control, Police, an Underground Guerrilla
// and no Office, remove 1 Underground Guerrilla without Activation and place 1 face-down Covert
// marker. The space need not be an Op space (06 s1 item 3). Reveal and check penalty:
// `revealCovert` (propaganda/legitimacy.ts) and `checkStandings` (victory.ts).
import { param } from "../../../core/params.ts";
import { SINGLE_FACE } from "../../../core/state.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { controlOf, count, markers } from "../common.ts";
import { FACE, FACTION, MARKER, PIECE, TRACK } from "../ids.ts";

const ruleRef = "06 s3.5";

export const covertAction: ActionHandler = {
  id: "state.covert-action",
  faction: FACTION.state,
  kind: "sa",
  ruleRef,
  accompanies: ["state.garrison", "state.sweep"],
  check(ruleset, state, part) {
    const out: Violation[] = [];
    const campaigns = param(ruleset, "campaign.order", "list").map(String);
    const from = param(ruleset, "covert.from", "string");
    if (campaigns.indexOf(state.turn.campaign ?? "") < campaigns.indexOf(from)) out.push(at(null, "covertCampaign", `Covert Action is available from Campaign ${from}.`, ruleRef));
    const legitimacy = Number(state.tracks[TRACK.legitimacy]);
    const need = param(ruleset, "covert.minLegitimacy", "number");
    if (legitimacy < need) out.push(at(null, "covertLegitimacy", `Covert Action needs Legitimacy ${String(need)} or more. Legitimacy is ${String(legitimacy)}.`, ruleRef));
    if ((state.markerPools[MARKER.covert] ?? 0) === 0) out.push(at(null, "covertSupply", "No Covert marker is available.", ruleRef));
    if (part.locations.length !== 1) return [...out, at(null, "covertSpaces", "Select exactly 1 space for Covert Action.", ruleRef)];
    const loc = part.locations[0] ?? "";
    if (controlOf(ruleset, state, loc) !== FACTION.state || count(state, loc, PIECE.police) === 0 || count(state, loc, PIECE.guerrilla, FACE.underground) === 0) return [...out, at(loc, "covertWhere", "Covert Action needs State Control, Police and an Underground Guerrilla in the space.", ruleRef)];
    if (markers(state, loc, MARKER.office) > 0) return [...out, at(loc, "covertOffice", "Covert Action never targets a space with an Office.", ruleRef)];
    return out;
  },
  cost: () => 0,
  execute(ctx, part) {
    const loc = part.locations[0] ?? "";
    ctx.apply({ type: "removePieces", piece: PIECE.guerrilla, state: FACE.underground, count: 1, space: loc, to: "available", ruleRef, assumptionRef: null });
    ctx.apply({ type: "placeMarker", marker: MARKER.covert, space: loc, side: SINGLE_FACE, ruleRef, assumptionRef: null });
  },
};
