// Rally (research 06 s4.1): per location, place 1 Guerrilla, replace 2 Guerrillas with a Base, or
// at a Base place up to Pop + Bases or flip all Underground. Europe as a location: Europe +1.
// Optional Agitate in one space with a PKK Base or PKK Control (07 s1.3).
import { stackingRoom } from "../../../core/effects/common.ts";
import { createExec, type Exec } from "../../../core/exec.ts";
import { param } from "../../../core/params.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { at, type ActionHandler, type ActionOptions, type ActionPart } from "../action.ts";
import { count, hasTag, isTerrain, markers, pay, space } from "../common.ts";
import { rallyBaseOpen, rallyGuerrillasOpen } from "../common-pkk.ts";
import { EUROPE_SPACE, FACE, FACTION, MARKER, PIECE, TAG, TERRAIN, TRACK } from "../ids.ts";
import { asCount, asString } from "../plan.ts";
import { agitationCost, agitationExecute, agitationViolations, canAgitate, readAgitation, type AgitationSpend } from "./agitation.ts";

const ruleRef = "06 s4.1";
const AGITATE = "agitate";
type Option = "place" | "base" | "grow" | "flip";
const OPTIONS: readonly Option[] = ["place", "base", "grow", "flip"];

function banned(state: GameState): boolean {
  return markers(state, EUROPE_SPACE, MARKER.ban) > 0;
}

function costOf(ruleset: Ruleset, state: GameState, loc: string): number {
  return loc === EUROPE_SPACE && banned(state) ? param(ruleset, "rally.europeBanCost", "number") : param(ruleset, "rally.costPerLocation", "number");
}

/** Guerrillas the `grow` option may place: Pop (external box: rally.externalPop) + PKK Bases. */
function growLimit(ruleset: Ruleset, state: GameState, loc: string): number {
  const s = space(ruleset, loc);
  const pop = s?.kind === "external" ? param(ruleset, "rally.externalPop", "number") : (s?.pop ?? 0);
  return pop + count(state, loc, PIECE.pkkBase);
}

/** Guerrillas the plan places with `grow`: `count`, default the limit. Null: outside 1 to the limit. */
function growCount(ruleset: Ruleset, state: GameState, part: ActionPart, loc: string): number | null {
  const limit = growLimit(ruleset, state, loc);
  const n = asCount(part.perLocation[loc]?.["count"], limit);
  return n === null || n < 1 || n > limit ? null : n;
}

function agitations(options: ActionOptions): { space: string; spend: AgitationSpend | null }[] {
  return options.subActions.filter((s) => s.action === AGITATE).map((s) => ({ space: s.space, spend: readAgitation(s.params) }));
}

function option(part: ActionPart, loc: string): Option | null {
  const o = asString(part.perLocation[loc]?.["option"] ?? "place");
  return OPTIONS.find((x) => x === o) ?? null;
}

export const rally: ActionHandler = {
  id: "pkk.rally",
  faction: FACTION.pkk,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    let placing = 0;
    let basing = 0;
    for (const loc of part.locations) {
      const v = (code: string, message: string): void => { out.push(at(loc, code, message, ruleRef)); };
      const s = space(ruleset, loc);
      if (loc === EUROPE_SPACE) {
        const cap = banned(state) ? param(ruleset, "europe.banCap", "number") : Infinity;
        if (Number(state.tracks[TRACK.europe]) >= cap) v("rallyEuropeCap", "The Ban marker caps Europe at 3 (04 s3.6).");
        continue;
      }
      if (s === undefined || hasTag(ruleset, loc, TAG.noPieces) || hasTag(ruleset, loc, TAG.eventsOnly)) {
        v("rallyWhere", "Rally selects a domestic space, a host box or the Europe track.");
        continue;
      }
      if (s.kind === "domestic") {
        if (markers(state, loc, MARKER.displacement) > 0) v("rallyDisplaced", "No Rally in a space with a Displacement marker (06 s3.4).");
        const level = state.spaces[loc]?.level ?? 0;
        if (isTerrain(ruleset, loc, TERRAIN.city) && level > 0 && !hasTag(ruleset, loc, TAG.rallyAtSupport)) v("rallyCity", "A City at Support cannot Rally (03 s2.1).");
      } else if (!rallyGuerrillasOpen(state, loc)) {
        v("rallyHost", "The host posture closes Rally in this box (07 s5.1).");
      }
      const choice = option(part, loc);
      if (choice === null) {
        v("rallyOption", "Choose option place, base, grow or flip.");
      } else if (choice === "place") {
        placing += 1;
      } else if (choice === "base") {
        const need = param(ruleset, "rally.baseFromGuerrillas", "number");
        if (count(state, loc, PIECE.guerrilla) < need) v("rallyBaseGuerrillas", `A Base replaces ${String(need)} Guerrillas.`);
        if (stackingRoom(ruleset, state, loc, PIECE.pkkBase) < 1) v("rallyBaseStacking", "PKK Base stacking limit (03 s5).");
        if (s.kind === "external" && !rallyBaseOpen(state, loc)) v("rallyBaseHost", "The host posture does not allow a Base here (07 s5.1).");
        basing += 1;
      } else if (count(state, loc, PIECE.pkkBase) === 0) {
        v("rallyNeedsBase", "This option needs a PKK Base here.");
      } else if (choice === "grow") {
        const n = growCount(ruleset, state, part, loc);
        if (n === null) v("rallyGrowCount", `Place 1 to ${String(growLimit(ruleset, state, loc))} Guerrillas (Pop + Bases).`);
        placing += n ?? 0;
      }
    }
    if (basing > (state.pools[PIECE.pkkBase]?.available ?? 0)) out.push(at(null, "rallySupply", "No PKK Base is Available.", ruleRef));
    if (placing > 0 && (state.pools[PIECE.guerrilla]?.available ?? 0) === 0) out.push(at(null, "rallySupply", "No Guerrilla is Available.", ruleRef));
    const agits = agitations(options);
    if (agits.length > 1 || options.subActions.length > agits.length) out.push(at(null, "rallySubAction", "Rally allows one Agitate in one space.", ruleRef));
    // Agitate runs after the placements, so check it on that board (only when the spaces pass).
    const placed = createExec(ruleset, state, true);
    if (out.length === 0) placeAll(placed, part, { ...options, free: true });
    for (const a of agits) {
      if (!part.locations.includes(a.space)) out.push(at(a.space, "agitateNotSelected", "Agitate must be in a Rally space.", ruleRef));
      if (!canAgitate(ruleset, placed.state, a.space)) out.push(at(a.space, "agitateWhere", "Agitate needs a PKK Base or PKK Control.", ruleRef));
      if (a.spend === null) out.push(at(a.space, "agitateBadSpend", "Agitate spend is not well formed.", "07 s1.3"));
      else out.push(...agitationViolations(ruleset, placed.state, a.space, a.spend));
    }
    return out;
  },
  cost(ruleset, state, part, options) {
    const op = options.free ? 0 : part.locations.reduce((sum, loc) => sum + costOf(ruleset, state, loc), 0);
    return op + agitations(options).reduce((sum, a) => sum + (a.spend === null ? 0 : agitationCost(ruleset, a.spend)), 0);
  },
  execute(ctx, part, options) {
    placeAll(ctx, part, options);
    for (const a of agitations(options)) if (a.spend !== null) agitationExecute(ctx, a.space, a.spend);
  },
};

/** Pay per location (unless free) and resolve each location's option. */
function placeAll(ctx: Exec, part: ActionPart, options: ActionOptions): void {
    for (const loc of part.locations) {
      if (!options.free) pay(ctx, FACTION.pkk, costOf(ctx.ruleset, ctx.state, loc), ruleRef, loc);
      if (loc === EUROPE_SPACE) {
        ctx.apply({ type: "adjustTrack", track: TRACK.europe, delta: param(ctx.ruleset, "rally.europeGain", "number"), ruleRef, assumptionRef: null });
        continue;
      }
      const place = (n: number): void => {
        if (n > 0) ctx.apply({ type: "placePieces", piece: PIECE.guerrilla, count: n, space: loc, state: FACE.underground, ruleRef, assumptionRef: null });
      };
      const choice = option(part, loc);
      if (choice === "place") place(1);
      else if (choice === "grow") place(growCount(ctx.ruleset, ctx.state, part, loc) ?? 0);
      else if (choice === "flip") ctx.apply({ type: "setPieceState", piece: PIECE.guerrilla, space: loc, from: FACE.active, to: FACE.underground, count: "all", ruleRef, assumptionRef: null });
      else if (choice === "base") {
        // Active Guerrillas go first: they are the ones a later Assault could remove.
        let left = param(ctx.ruleset, "rally.baseFromGuerrillas", "number");
        for (const face of [FACE.active, FACE.underground]) {
          const n = Math.min(left, count(ctx.state, loc, PIECE.guerrilla, face));
          if (n > 0) ctx.apply({ type: "removePieces", piece: PIECE.guerrilla, state: face, count: n, space: loc, to: "available", ruleRef, assumptionRef: null });
          left -= n;
        }
        ctx.apply({ type: "placePieces", piece: PIECE.pkkBase, count: 1, space: loc, state: null, ruleRef, assumptionRef: null });
      }
    }
}
