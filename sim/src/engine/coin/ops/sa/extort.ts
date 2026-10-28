// Extort (research 06 s5.2; PA-12 replaced): in any chosen qualifying locations, Activate one
// Guerrilla and gain 1 Resource each. Domestic: Pop 1+, an Underground Guerrilla, PKK Control, no
// Displacement. External box: host Host or Tolerant and an Underground Guerrilla.
import { param } from "../../../core/params.ts";
import type { Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { activate, controlOf, count, markers, space } from "../common.ts";
import { rallyGuerrillasOpen } from "../common-pkk.ts";
import { FACE, FACTION, MARKER, PIECE } from "../ids.ts";

const ruleRef = "06 s5.2";

export const extort: ActionHandler = {
  id: "pkk.extort",
  faction: FACTION.pkk,
  kind: "sa",
  ruleRef,
  accompanies: "any",
  check(ruleset, state, part) {
    const out: Violation[] = [];
    for (const loc of part.locations) {
      const s = space(ruleset, loc);
      const v = (code: string, message: string): void => { out.push(at(loc, code, message, ruleRef)); };
      if (count(state, loc, PIECE.guerrilla, FACE.underground) === 0) v("extortGuerrilla", "Extort needs an Underground Guerrilla.");
      if (s?.kind === "domestic") {
        if (s.pop < param(ruleset, "extort.minPop", "number")) v("extortPop", "Extort needs Pop 1 or more.");
        if (controlOf(ruleset, state, loc) !== FACTION.pkk) v("extortControl", "Extort needs PKK Control.");
        if (markers(state, loc, MARKER.displacement) > 0) v("extortDisplaced", "No Extort in a space with a Displacement marker.");
      } else if (!rallyGuerrillasOpen(state, loc)) {
        v("extortHost", "Extort in a box needs its host at Host or Tolerant.");
      }
    }
    return out;
  },
  cost: () => 0,
  execute(ctx, part) {
    const track = ctx.ruleset.factions.find((f) => f.id === FACTION.pkk)?.resourcesTrack ?? null;
    for (const loc of part.locations) {
      activate(ctx, loc, 1, ruleRef, "PA-12");
      if (track !== null) ctx.apply({ type: "adjustTrack", track, delta: param(ctx.ruleset, "extort.gain", "number"), ruleRef, assumptionRef: "PA-12" });
    }
  },
};
