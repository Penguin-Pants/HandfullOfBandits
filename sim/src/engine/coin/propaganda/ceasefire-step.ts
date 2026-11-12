// Ceasefire step of the Legal Politics phase (research 07 s7.3; rules 8.6; approved text
// docs/prototype/30, DEC-66). One choice holds both factions' answers, State first (solo play,
// GAP-O01): `{accept, pkkEnd, leave: {state, pkk}}`. A ceasefire is temporary and never ends the
// game (decision 1, 2026-11-12).
import type { Exec } from "../../core/exec.ts";
import { param } from "../../core/params.ts";
import type { GameState, JsonObject, Ruleset } from "../../core/types.ts";
import { CEASEFIRE, endCeasefire } from "../ceasefire.ts";
import { adjustEurope } from "../ops/common.ts";
import { FACTION } from "../ops/ids.ts";
import { asObject } from "../ops/plan.ts";

const ruleRef = "07 s7.3";

function yes(o: JsonObject | null, key: string): boolean {
  return o?.[key] === true;
}

/** What each faction may choose at the ceasefire step now. */
export function ceasefireOptions(ruleset: Ruleset, state: GameState): { accept: boolean; leave: boolean } {
  const status = String(state.tracks[CEASEFIRE]);
  const stateBroken = ruleset.spaces.some((s) => (state.spaces[s.id]?.markers["restraintBroken"]?.[FACTION.state] ?? 0) > 0);
  return { accept: status === "declared" && !stateBroken, leave: status === "reciprocalRestraint" };
}

/** Run the ceasefire step. */
export function ceasefireStep(ctx: Exec, choice: JsonObject | null): void {
  const c = asObject(choice?.["ceasefire"]);
  const options = ceasefireOptions(ctx.ruleset, ctx.state);
  // Step 1: Declared.
  if (ctx.state.tracks[CEASEFIRE] === "declared") {
    if (options.accept && yes(c, "accept")) ctx.apply({ type: "setTrack", track: CEASEFIRE, value: "reciprocalRestraint", ifEquals: null, ruleRef: `${ruleRef} step 1`, assumptionRef: null });
    else if (yes(c, "pkkEnd")) {
      if (ctx.state.flags["ceasefireDeclaredByPkk"] === true) adjustEurope(ctx, -param(ctx.ruleset, "ceasefire.endEurope", "number"), `${ruleRef} step 1`);
      endCeasefire(ctx, `${ruleRef} step 1`);
    }
  }
  // Step 2: leaving Reciprocal Restraint, State first (DEC-66 point 5). Only the PKK pays.
  if (ctx.state.tracks[CEASEFIRE] !== "reciprocalRestraint") return;
  const leave = asObject(c?.["leave"]);
  const leaver = [FACTION.state, FACTION.pkk].find((f) => yes(leave, f));
  if (leaver === undefined) return;
  if (leaver === FACTION.pkk) adjustEurope(ctx, -param(ctx.ruleset, "ceasefire.endEurope", "number"), `${ruleRef} step 2`);
  endCeasefire(ctx, `${ruleRef} step 2`);
}
