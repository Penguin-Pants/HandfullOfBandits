// Civic Action and Agitation phase (research 05 s6.6; 07 s1.3), split into two handler IDs so the
// State spends first, then the PKK. Choice `{spaces: {space: spend}}`; Advance spends nothing.
// State total is capped at Legitimacy / civicAction.capDivisor, round down; each space needs State
// Control, Troops and Police. Agitation needs a PKK Base or PKK Control, as in Rally.
import { param } from "../../core/params.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";
import { resources } from "../ops/common.ts";
import { FACTION, TRACK } from "../ops/ids.ts";
import { asObject } from "../ops/plan.ts";
import { agitationCost, agitationExecute, agitationViolations, canAgitate, readAgitation } from "../ops/pkk/agitation.ts";
import { civicCost, civicExecute, civicViolations, readCivic } from "../ops/state/civic-action.ts";
import { violation, type PropagandaPhase } from "./phase.ts";

function entries(choice: JsonObject | null): [string, JsonObject][] | null {
  const spaces = asObject(choice?.["spaces"] ?? {});
  if (spaces === null) return null;
  const out: [string, JsonObject][] = [];
  for (const [space, v] of Object.entries(spaces)) {
    const o = asObject(v);
    if (o === null) return null;
    out.push([space, o]);
  }
  return out;
}

export const civicActionPhase: PropagandaPhase = {
  id: "civicAction",
  ruleRef: "05 s6.6",
  check(ruleset: Ruleset, state: GameState, choice) {
    const list = entries(choice);
    if (list === null) return [violation("badChoice", "spaces must map spaces to Civic Action spends.", "05 s6.6")];
    const out: Violation[] = [];
    let spent = 0;
    for (const [space, params] of list) {
      const spend = readCivic(params);
      if (spend === null) {
        out.push(violation("civicBadSpend", "Civic Action spend is not well formed.", "07 s1.3", space));
        continue;
      }
      out.push(...civicViolations(ruleset, state, space, spend, true));
      spent += civicCost(ruleset, spend);
    }
    const cap = Math.floor(Number(state.tracks[TRACK.legitimacy]) / param(ruleset, "civicAction.capDivisor", "number"));
    if (spent > cap) out.push(violation("civicCap", `State spending in this phase is capped at ${String(cap)} (Legitimacy / 2).`, "05 s6.6"));
    if (spent > resources(ruleset, state, FACTION.state)) out.push(violation("cannotPay", `Civic Action costs ${String(spent)}; the State cannot pay.`, "05 s6.6"));
    return out;
  },
  run(ctx, choice) {
    for (const [space, params] of entries(choice) ?? []) {
      const spend = readCivic(params);
      if (spend !== null) civicExecute(ctx, space, spend);
    }
  },
};

export const agitationPhase: PropagandaPhase = {
  id: "agitation",
  ruleRef: "05 s6.6",
  check(ruleset, state, choice) {
    const list = entries(choice);
    if (list === null) return [violation("badChoice", "spaces must map spaces to Agitation spends.", "05 s6.6")];
    const out: Violation[] = [];
    let spent = 0;
    for (const [space, params] of list) {
      const spend = readAgitation(params);
      if (spend === null) {
        out.push(violation("agitateBadSpend", "Agitation spend is not well formed.", "07 s1.3", space));
        continue;
      }
      if (!canAgitate(ruleset, state, space)) out.push(violation("agitateWhere", "Agitation needs a PKK Base or PKK Control (07 s1.3).", "07 s1.3", space));
      out.push(...agitationViolations(ruleset, state, space, spend));
      spent += agitationCost(ruleset, spend);
    }
    if (spent > resources(ruleset, state, FACTION.pkk)) out.push(violation("cannotPay", `Agitation costs ${String(spent)}; the PKK cannot pay.`, "05 s6.6"));
    return out;
  },
  run(ctx, choice) {
    for (const [space, params] of entries(choice) ?? []) {
      const spend = readAgitation(params);
      if (spend !== null) agitationExecute(ctx, space, spend);
    }
  },
};
