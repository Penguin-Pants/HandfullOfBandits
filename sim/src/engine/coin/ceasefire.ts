// Ceasefire declaration, restrictions and breach (research 07 s7.1, s7.2; 05 s4 item 6; approved
// text docs/prototype/30, DEC-66). A forbidden action stays legal: validation warns, and execution
// applies the breach before the action. The Restraint Broken marker goes in the action's first
// location; Legitimacy step 7 and Reset read it from any space.
import type { Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import type { CommandHandler, FactionId, GameState, Ruleset, Violation } from "../core/types.ts";
import type { ActionPart } from "./ops/action.ts";
import { adjustEurope, space } from "./ops/common.ts";
import { FACTION, TRACK } from "./ops/ids.ts";
import { activeFaction, BOX, legalBoxes, placeCylinder, sequenceViolations } from "./sequence/ct.ts";

const ruleRef = "07 s7.2";
export const CEASEFIRE = "ceasefire";
const MARKER_RB = "restraintBroken";
const DECLARED_PKK = ["pkk.attack", "pkk.ambush", "pkk.strike-collaborators"];
const STATE_LIMITED = ["state.assault", "state.village-clearance", "state.cross-border", "state.covert-action"];

/** One action of a command: its ID and part. */
export interface ActionUse { readonly id: string; readonly part: ActionPart }

/** What the actions do to the ceasefire now: nothing, place the State marker only, or breach. */
export function restraintEffect(ruleset: Ruleset, state: GameState, faction: FactionId, uses: readonly ActionUse[]): "none" | "marker" | "breach" {
  const status = String(state.tracks[CEASEFIRE]);
  if (status === "none" || state.tracks[CEASEFIRE] === undefined) return "none";
  const restraint = status === "reciprocalRestraint" || status === "talks";
  const forbidden = (u: ActionUse): boolean => {
    if (faction === FACTION.pkk) {
      if (DECLARED_PKK.includes(u.id)) return true;
      if (!restraint) return false;
      return u.id === "pkk.coerce" || (u.id === "pkk.rally" && u.part.locations.some((l) => space(ruleset, l)?.kind === "domestic" && u.part.perLocation[l]?.["option"] === "base"));
    }
    return STATE_LIMITED.includes(u.id);
  };
  if (!uses.some(forbidden)) return "none";
  return faction === FACTION.state && !restraint ? "marker" : "breach";
}

/** Breach warnings for validation (05 s4 item 6). */
export function restraintWarnings(ruleset: Ruleset, state: GameState, faction: FactionId, uses: readonly ActionUse[]): Violation[] {
  const effect = restraintEffect(ruleset, state, faction, uses);
  const text = effect === "none" ? null
    : faction === FACTION.pkk ? "This breaks the ceasefire: PKK Restraint Broken, Ceasefire to None, Europe -1."
    : effect === "marker" ? "This places the State Restraint Broken marker. The State can no longer accept this ceasefire."
    : "This breaks the ceasefire: State Restraint Broken, Ceasefire to None, Legitimacy -2.";
  return text === null ? [] : [{ code: "ceasefireBreach", message: text, ruleRef, location: null }];
}

function placeRestraintBroken(ctx: Exec, faction: FactionId, location: string): void {
  if (ctx.ruleset.spaces.some((s) => (ctx.state.spaces[s.id]?.markers[MARKER_RB]?.[faction] ?? 0) > 0)) return;
  ctx.apply({ type: "placeMarker", marker: MARKER_RB, space: location, side: faction, ruleRef, assumptionRef: null });
}

/** Set the ceasefire to None (breach, PKK end, leaving restraint). */
export function endCeasefire(ctx: Exec, ref: string): void {
  ctx.apply({ type: "setTrack", track: CEASEFIRE, value: "none", ifEquals: null, ruleRef: ref, assumptionRef: null });
}

/** Apply the ceasefire result of a faction's actions, before they execute (07 s7.2). */
export function applyRestraint(ctx: Exec, faction: FactionId, uses: readonly ActionUse[]): void {
  const effect = restraintEffect(ctx.ruleset, ctx.state, faction, uses);
  if (effect === "none") return;
  const location = uses.find((u) => u.part.locations.length > 0)?.part.locations[0] ?? ctx.ruleset.spaces[0]?.id ?? "";
  placeRestraintBroken(ctx, faction, location);
  if (effect === "marker") return;
  endCeasefire(ctx, ruleRef);
  if (faction === FACTION.pkk) adjustEurope(ctx, -param(ctx.ruleset, "ceasefire.pkkBreachEurope", "number"), ruleRef);
  else ctx.apply({ type: "adjustTrack", track: TRACK.legitimacy, delta: -param(ctx.ruleset, "ceasefire.stateBreachLegitimacy", "number"), ruleRef, assumptionRef: null });
}

/** DeclareCeasefire (07 s7.1): the PKK's card action in the Limited Op box, from C3. */
export const declareCeasefireHandler: CommandHandler = {
  ruleRef: "07 s7.1",
  check(ruleset, state, command) {
    const v = (code: string, message: string): Violation[] => [{ code, message, ruleRef: "07 s7.1", location: null }];
    if (command["faction"] !== FACTION.pkk) return [...v("ceasefireFaction", "Only the PKK declares a ceasefire (07 s7.1)."), ...sequenceViolations(ruleset, state, command["faction"], BOX.limitedOp)];
    const active = activeFaction(state);
    if (active === FACTION.pkk && !legalBoxes(ruleset, state, active).includes(BOX.limitedOp)) return v("ceasefireBox", "Declare Ceasefire uses the Limited Op box.");
    const seq = sequenceViolations(ruleset, state, command["faction"], BOX.limitedOp);
    if (seq.length > 0) return seq;
    const campaigns = param(ruleset, "campaign.order", "list").map(String);
    const from = param(ruleset, "ceasefire.from", "string");
    if (campaigns.indexOf(state.turn.campaign ?? "") < campaigns.indexOf(from)) return v("ceasefireCampaign", `Declare Ceasefire is available from Campaign ${from}.`);
    if (state.tracks[CEASEFIRE] !== "none") return v("ceasefireActive", "A ceasefire is already in force.");
    return [];
  },
  execute(ctx) {
    const placed = placeCylinder(ctx.state, FACTION.pkk, BOX.limitedOp);
    ctx.write(() => placed.state);
    ctx.log(placed.entry.kind, { ...placed.entry.data, action: "declareCeasefire" }, placed.entry.ruleRef);
    ctx.apply({ type: "setTrack", track: CEASEFIRE, value: "declared", ifEquals: null, ruleRef: "07 s7.1", assumptionRef: null });
    ctx.apply({ type: "setFlag", flag: "ceasefireDeclaredByPkk", value: true, ruleRef: "07 s7.1", assumptionRef: null });
    adjustEurope(ctx, param(ctx.ruleset, "ceasefire.declareEurope", "number"), "07 s7.1");
  },
};
