// Rule procedures that a card effect may run by name (`procedure` effect; docs/prototype/31 s8 item 3).
import type { Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import { SINGLE_FACE } from "../core/state.ts";
import { count, markers, space } from "./ops/common.ts";
import { FACE, MARKER, PIECE } from "./ops/ids.ts";
import { officeLines } from "./propaganda/legal-politics.ts";
import { revealRandomCovert } from "./propaganda/legitimacy.ts";

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

export const procedures: Readonly<Record<string, (ctx: Exec) => void>> = {
  "legal.officeLines": officeLines,
  "covert.revealRandom": (ctx) => { revealRandomCovert(ctx, "Covert reveal", "07 s10.2 item 2"); },
  "hizbullah.unattributed": unattributedKillings,
};
