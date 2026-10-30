// Agitation (research 07 s1.3): PKK spends in one space. Used by Rally (06 s4.1) and the Propaganda
// Agitation phase (05 s6.6, P2-10). Removals come before the shift they unblock.
import type { Exec } from "../../../core/exec.ts";
import { SINGLE_FACE } from "../../../core/state.ts";
import { param } from "../../../core/params.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../../core/types.ts";
import { at } from "../action.ts";
import { controlOf, count, markers, pay } from "../common.ts";
import { FACTION, MARKER, PIECE } from "../ids.ts";
import { asCount } from "../plan.ts";

const ruleRef = "07 s1.3";

export interface AgitationSpend {
  readonly coercion: number;
  readonly pkkHarm: number;
  readonly shifts: number;
}

export function readAgitation(params: JsonObject): AgitationSpend | null {
  const values = { coercion: asCount(params["coercion"]), pkkHarm: asCount(params["pkkHarm"]), shifts: asCount(params["shifts"]) };
  return Object.values(values).some((v) => v === null) ? null : (values as AgitationSpend);
}

export function agitationCost(ruleset: Ruleset, spend: AgitationSpend): number {
  return (
    spend.coercion * param(ruleset, "agitation.coercionCost", "number") +
    spend.pkkHarm * param(ruleset, "agitation.redressCost", "number") +
    spend.shifts * param(ruleset, "agitation.shiftCost", "number")
  );
}

/** Marker and shift limits. The caller checks where Agitation may happen. */
export function agitationViolations(ruleset: Ruleset, state: GameState, spaceId: string, spend: AgitationSpend): Violation[] {
  const v = (code: string, message: string): Violation => at(spaceId, code, message, ruleRef);
  const out: Violation[] = [];
  if (spend.coercion > markers(state, spaceId, MARKER.coercion)) out.push(v("agitateNoMarker", "Not that many Coercion markers here."));
  if (spend.pkkHarm > markers(state, spaceId, MARKER.pkkHarm)) out.push(v("agitateNoMarker", "Not that many PKK Harm markers here."));
  if (spend.shifts > 0) {
    const max = param(ruleset, "agitation.maxShifts", "number");
    const level = state.spaces[spaceId]?.level ?? null;
    const office = ruleset.markers.find((m) => m.id === MARKER.office)?.capsLevel ?? ruleset.levelRange;
    const cap = markers(state, spaceId, MARKER.office) > 0 ? Math.min(office, ruleset.levelRange) : ruleset.levelRange;
    if (spend.shifts > max) out.push(v("agitateTooManyShifts", `At most ${String(max)} shifts per space.`));
    if (markers(state, spaceId, MARKER.coercion) > spend.coercion) out.push(v("agitateBlocked", "A Coercion marker blocks the shift. Remove it first."));
    if (markers(state, spaceId, MARKER.pkkHarm) > spend.pkkHarm) out.push(v("agitateBlocked", "A PKK Harm marker blocks shifts toward Opposition. Redress it first."));
    if (level === null || level - spend.shifts < -cap) out.push(v("agitateNoRoom", "The space cannot shift that far toward Opposition."));
  }
  return out;
}

export function agitationExecute(ctx: Exec, spaceId: string, spend: AgitationSpend): void {
  pay(ctx, FACTION.pkk, agitationCost(ctx.ruleset, spend), ruleRef, spaceId);
  const remove = (marker: string, n: number): void => {
    for (let i = 0; i < n; i++) ctx.apply({ type: "removeMarker", marker, space: spaceId, side: SINGLE_FACE, ruleRef, assumptionRef: null });
  };
  remove(MARKER.coercion, spend.coercion);
  remove(MARKER.pkkHarm, spend.pkkHarm);
  if (spend.shifts > 0) ctx.apply({ type: "shiftLevel", space: spaceId, direction: "opposition", steps: spend.shifts, ruleRef, assumptionRef: null });
}

/** Where the PKK may Agitate, in a Rally or in Propaganda: a space with a PKK Base or PKK Control
 * (07 s1.3; one rule for both, designer decision after the S0 playtests). */
export function canAgitate(ruleset: Ruleset, state: GameState, spaceId: string): boolean {
  return count(state, spaceId, PIECE.pkkBase) > 0 || controlOf(ruleset, state, spaceId) === FACTION.pkk;
}
