// Civic Action (research 07 s1.3): State spends in one space. Used by Train (06 s2.1) and the
// Propaganda Civic Action phase (05 s6.6, P2-10). Removals come before the shift they unblock.
import type { Exec } from "../../../core/exec.ts";
import { param } from "../../../core/params.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../../core/types.ts";
import { at } from "../action.ts";
import { controlOf, count, markers, pay } from "../common.ts";
import { EMERGENCY, FACTION, MARKER, PIECE, TRACK } from "../ids.ts";
import { asCount } from "../plan.ts";

const ruleRef = "07 s1.3";

/** Counts per Civic Action step. */
export interface CivicSpend {
  readonly coercion: number;
  readonly reception: number;
  readonly stateHarm: number;
  readonly displacement: number;
  readonly shifts: number;
}

const STEPS = [
  ["coercion", MARKER.coercion, "civicAction.coercionCost"],
  ["reception", MARKER.reception, "civicAction.reliefCost"],
  ["stateHarm", MARKER.stateHarm, "civicAction.redressCost"],
  ["displacement", MARKER.displacement, "civicAction.returnCost"],
] as const;

export function readCivic(params: JsonObject): CivicSpend | null {
  const values = { coercion: asCount(params["coercion"]), reception: asCount(params["reception"]), stateHarm: asCount(params["stateHarm"]), displacement: asCount(params["displacement"]), shifts: asCount(params["shifts"]) };
  if (Object.values(values).some((v) => v === null)) return null;
  return values as CivicSpend;
}

export function civicCost(ruleset: Ruleset, spend: CivicSpend): number {
  return STEPS.reduce((sum, [key, , cost]) => sum + spend[key] * param(ruleset, cost, "number"), spend.shifts * param(ruleset, "civicAction.shiftCost", "number"));
}

/** Space conditions and step limits. `needTroops`: the Propaganda phase also needs a Troop (05 s6.6). */
export function civicViolations(ruleset: Ruleset, state: GameState, spaceId: string, spend: CivicSpend, needTroops: boolean): Violation[] {
  const v = (code: string, message: string): Violation => at(spaceId, code, message, ruleRef);
  const out: Violation[] = [];
  if (controlOf(ruleset, state, spaceId) !== FACTION.state) out.push(v("civicNeedsControl", "Civic Action needs State Control."));
  if (count(state, spaceId, PIECE.police) === 0) out.push(v("civicNeedsPolice", "Civic Action needs at least 1 Police."));
  if (needTroops && count(state, spaceId, PIECE.troops) === 0) out.push(v("civicNeedsTroops", "Civic Action in Propaganda needs at least 1 Troop (05 s6.6)."));
  for (const [key, marker] of STEPS) {
    if (spend[key] > markers(state, spaceId, marker)) out.push(v("civicNoMarker", `Only ${String(markers(state, spaceId, marker))} ${marker} markers are here.`));
  }
  if (spend.displacement > 0) {
    const campaigns = param(ruleset, "civicAction.returnCampaigns", "list");
    const normalizing = state.tracks[TRACK.emergencyRule] === EMERGENCY.normalizing;
    if (!normalizing && !campaigns.includes(state.turn.campaign ?? "")) out.push(at(spaceId, "civicNoReturn", "Return is legal only in C5, at Normalizing or by a Return event.", "07 s3.3"));
  }
  if (spend.shifts > 0) {
    const maxShifts = param(ruleset, "civicAction.maxShifts", "number");
    const level = state.spaces[spaceId]?.level ?? null;
    const capped = markers(state, spaceId, MARKER.office) > 0 ? (ruleset.markers.find((m) => m.id === MARKER.office)?.capsLevel ?? ruleset.levelRange) : ruleset.levelRange;
    if (spend.shifts > maxShifts) out.push(v("civicTooManyShifts", `At most ${String(maxShifts)} shifts per space.`));
    if (markers(state, spaceId, MARKER.coercion) > spend.coercion) out.push(v("civicBlocked", "A Coercion marker blocks the shift. Remove it first."));
    if (markers(state, spaceId, MARKER.reception) > spend.reception) out.push(at(spaceId, "civicBlocked", "A Reception marker blocks shifts toward Support. Pay relief first.", "07 s3.2"));
    if (markers(state, spaceId, MARKER.stateHarm) > spend.stateHarm) out.push(v("civicBlocked", "A State Harm marker blocks shifts toward Support. Redress it first."));
    if (level === null || level + spend.shifts > Math.min(capped, ruleset.levelRange)) out.push(v("civicNoRoom", "The space cannot shift that far toward Support."));
  }
  return out;
}

export function civicExecute(ctx: Exec, spaceId: string, spend: CivicSpend): void {
  pay(ctx, FACTION.state, civicCost(ctx.ruleset, spend), ruleRef, spaceId);
  for (const [key, marker] of STEPS) {
    for (let i = 0; i < spend[key]; i++) {
      const side = Object.entries(ctx.state.spaces[spaceId]?.markers[marker] ?? {}).find(([, n]) => n > 0)?.[0] ?? null;
      if (side !== null) ctx.apply({ type: "removeMarker", marker, space: spaceId, side, ruleRef, assumptionRef: null });
    }
  }
  if (spend.shifts > 0) ctx.apply({ type: "shiftLevel", space: spaceId, direction: "support", steps: spend.shifts, ruleRef, assumptionRef: null });
}
