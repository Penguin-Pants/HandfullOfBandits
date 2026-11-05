// Rule procedures that a card effect may run by name (`procedure` effect; docs/prototype/31 s8 item 3).
import type { Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import { SINGLE_FACE } from "../core/state.ts";
import { CARD_REF, CEASEFIRE, declareCeasefire, endCeasefire, pkkRestraintBroken } from "./ceasefire.ts";
import { count, markers, space } from "./ops/common.ts";
import { FACE, MARKER, PIECE, TRACK } from "./ops/ids.ts";
import { ceasefireOptions } from "./propaganda/ceasefire-step.ts";
import { ban, officeLines, successor } from "./propaganda/legal-politics.ts";
import { onMap, revealRandomCovert } from "./propaganda/legitimacy.ts";

/**
 * Unattributed killings (07 s10.1 item 2; DK-053, DEC-68). No faction chooses: remove 1 Office from the
 * highest-Pop listed space with one, else 1 Guerrilla (Underground first) from the highest-Pop listed
 * space with one. Ties go in the `hizbullah.spaces` order. Place a Disputed Harm marker there.
 */
function unattributedKillings(ctx: Exec): void {
  const ref = "07 s10.1 item 2";
  const order = param(ctx.ruleset, "hizbullah.spaces", "list").map(String);
  const pop = (id: string): number => space(ctx.ruleset, id)?.pop ?? 0;
  const highest = (ok: (id: string) => boolean): string | undefined => order.filter(ok).reduce<string | undefined>((best, id) => (best === undefined || pop(id) > pop(best) ? id : best), undefined);
  const office = highest((id) => markers(ctx.state, id, MARKER.office) > 0);
  const target = office ?? highest((id) => count(ctx.state, id, PIECE.guerrilla) > 0);
  if (target === undefined) {
    ctx.log("EffectSkipped", { effect: "procedure", procedure: "hizbullah.unattributed", reason: "noTarget" }, ref);
    return;
  }
  if (office !== undefined) ctx.apply({ type: "removeMarker", marker: MARKER.office, space: target, side: SINGLE_FACE, ruleRef: ref, assumptionRef: null });
  else {
    const face = count(ctx.state, target, PIECE.guerrilla, FACE.underground) > 0 ? FACE.underground : FACE.active;
    ctx.apply({ type: "removePieces", piece: PIECE.guerrilla, state: face, count: 1, space: target, to: "available", ruleRef: ref, assumptionRef: null });
  }
  ctx.apply({ type: "placeMarker", marker: MARKER.disputedHarm, space: target, side: SINGLE_FACE, ruleRef: ref, assumptionRef: null });
}

/**
 * The State accepts a declared ceasefire by card (DK-057): Reciprocal Restraint. As the ceasefire
 * step (07 s7.3 step 1), not with the State Restraint Broken marker (DEC-73). The card adds its Legitimacy.
 */
function acceptCeasefire(ctx: Exec): void {
  const ref = "07 s7.3 step 1";
  if (!ceasefireOptions(ctx.ruleset, ctx.state).accept) {
    ctx.log("EffectSkipped", { effect: "procedure", procedure: "ceasefire.accept", reason: "cannotAccept" }, ref);
    return;
  }
  ctx.apply({ type: "setTrack", track: CEASEFIRE, value: "reciprocalRestraint", ifEquals: null, ruleRef: ref, assumptionRef: null });
}

/** Legitimacy change from a card procedure, under the Event rule as other card effects (05 s5); zero logs nothing. */
function legitimacy(ctx: Exec, delta: number): void {
  if (delta !== 0) ctx.apply({ type: "adjustTrack", track: TRACK.legitimacy, delta, ruleRef: "05 s5", assumptionRef: null });
}

/** HRW report, official denial (DK-069 unshaded): fewer than `hrw.denialBelow` Displacement markers (New and Old, DEC-69 point 8) on the map, Legitimacy up; otherwise down. */
function hrwDenial(ctx: Exec): void {
  const below = onMap(ctx.ruleset, ctx.state, MARKER.displacement) < param(ctx.ruleset, "hrw.denialBelow", "number");
  legitimacy(ctx, (below ? 1 : -1) * param(ctx.ruleset, "hrw.denialLegitimacy", "number"));
}

/** Report loss (DK-069, DK-087 shaded: Displacement, New and Old; DK-086 shaded: State Harm): Legitimacy -1 per `report.markersPerLoss` markers on the map, round down, at most `report.maxLoss`. */
function reportLoss(ctx: Exec, marker: string): void {
  const per = Math.floor(onMap(ctx.ruleset, ctx.state, marker) / param(ctx.ruleset, "report.markersPerLoss", "number"));
  legitimacy(ctx, -Math.min(per, param(ctx.ruleset, "report.maxLoss", "number")));
}

export const procedures: Readonly<Record<string, (ctx: Exec) => void>> = {
  "legal.ban": ban,
  "legal.successor": (ctx) => { successor(ctx, 1); },
  "legal.successorFull": (ctx) => { successor(ctx, 0); },
  "legal.officeLines": officeLines,
  "covert.revealRandom": (ctx) => { revealRandomCovert(ctx, "Covert reveal", "07 s10.2 item 2"); },
  "hizbullah.unattributed": unattributedKillings,
  "ceasefire.declare": declareCeasefire,
  "ceasefire.accept": acceptCeasefire,
  "ceasefire.end": (ctx) => { endCeasefire(ctx, CARD_REF); },
  "ceasefire.pkkBroken": pkkRestraintBroken,
  "hrw.denial": hrwDenial,
  "hrw.report": (ctx) => { reportLoss(ctx, MARKER.displacement); },
  "strasbourg.report": (ctx) => { reportLoss(ctx, MARKER.stateHarm); },
};
