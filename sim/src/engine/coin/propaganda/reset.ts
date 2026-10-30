import { discardMomentum } from "../../core/modifiers.ts";
// Reset (research 05 s6.8; DEC-53). Every Guerrilla flips, including Hostile and Aligned boxes.
import { resetEligibility } from "../sequence/ct.ts";
import type { PropagandaPhase } from "./phase.ts";
import { violation } from "./phase.ts";
const ruleRef = "05 s6.8";
export const resetPhase: PropagandaPhase = {
  id: "reset", ruleRef,
  check(ruleset, state) {
    const campaigns = ruleset.scenarios[state.meta.scenarioId]?.campaigns ?? [];
    return campaigns.indexOf(state.turn.campaign ?? "") < 0 || campaigns[campaigns.indexOf(state.turn.campaign ?? "") + 1] === undefined
      ? [violation("noNextCampaign", "The final round ends before Reset. There is no next Campaign.", ruleRef)] : [];
  },
  run(ctx) {
    for (const s of ctx.ruleset.spaces) {
      if ((ctx.state.spaces[s.id]?.markers["coercion"]?.["default"] ?? 0) > 0) ctx.apply({type: "removeMarker", marker: "coercion", space: s.id, side: "default", ruleRef, assumptionRef: null});
      ctx.apply({type: "setPieceState", piece: "guerrilla", space: s.id, from: "active", to: "underground", count: "all", ruleRef, assumptionRef: null});
    }
    discardMomentum(ctx);
    for (const s of ctx.ruleset.spaces) for (const side of ["state", "pkk"]) for (let i = ctx.state.spaces[s.id]?.markers["restraintBroken"]?.[side] ?? 0; i > 0; i--) ctx.apply({type: "removeMarker", marker: "restraintBroken", space: s.id, side, ruleRef, assumptionRef: null});
    const campaigns = ctx.ruleset.scenarios[ctx.state.meta.scenarioId]?.campaigns ?? [];
    const next = campaigns[campaigns.indexOf(ctx.state.turn.campaign ?? "") + 1] ?? null;
    ctx.write(s => resetEligibility(ctx.ruleset, {...s, turn: {...s.turn, campaign: next}}));
    ctx.log("EligibilityChanged", {firstEligible: ctx.state.initiative.firstEligible, secondEligible: ctx.state.initiative.secondEligible, campaign: next}, ruleRef);
  },
};
