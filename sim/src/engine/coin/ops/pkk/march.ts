// March (research 06 s4.2; 07 s5.1; PA-16): Guerrillas move one step into each destination.
// Per destination: `moves: [{from, count, face?}]`; each move is one group. Entry into a box at
// Restricted costs 1 more and the group Activates; Hostile or Aligned is closed. Syria at
// Restricted follows option syriaMarchRestricted (PA-16).
import { param } from "../../../core/params.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { adjacent, count, hasTag, pay, space } from "../common.ts";
import { entryToBox, statePieces } from "../common-pkk.ts";
import { FACE, FACTION, PIECE, SYRIA_BOX, TAG } from "../ids.ts";
import { asMoves } from "../plan.ts";

const ruleRef = "06 s4.2";

function costOf(ruleset: Ruleset, state: GameState, dest: string): number {
  const extra = entryToBox(ruleset, state, dest) === "restricted" ? param(ruleset, "march.restrictedExtraCost", "number") : 0;
  return param(ruleset, "march.costPerDestination", "number") + extra;
}

interface Group { readonly from: string; readonly face: string; readonly count: number; readonly group: number }

/**
 * Reserve each group's faces on the board before any arrival, so a piece moves one step only and
 * a group with no face named leaves with the faces that stood there (Underground first). One
 * shared inventory per origin and face; `short` lists groups that could not be reserved in full.
 */
function reserveGroups(state: GameState, part: Parameters<ActionHandler["check"]>[2]): { groups: Map<string, Group[]>; short: { from: string; need: number }[] } {
  const left = new Map<string, number>();
  const reserve = (from: string, face: string): number => left.get(`${from}|${face}`) ?? count(state, from, PIECE.guerrilla, face);
  const groups = new Map<string, Group[]>();
  const short: { from: string; need: number }[] = [];
  for (const dest of part.locations) {
    groups.set(
      dest,
      (asMoves(part.perLocation[dest]?.["moves"]) ?? []).flatMap((m) => {
        let need = m.count;
        const out = (m.face === null ? [FACE.underground, FACE.active] : [m.face]).flatMap((face) => {
          const n = Math.min(need, reserve(m.from, face));
          left.set(`${m.from}|${face}`, reserve(m.from, face) - n);
          need -= n;
          return n > 0 ? [{ from: m.from, face, count: n, group: m.count }] : [];
        });
        if (need > 0) short.push({ from: m.from, need: m.count });
        return out;
      }),
    );
  }
  return { groups, short };
}

export const march: ActionHandler = {
  id: "pkk.march",
  faction: FACTION.pkk,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part) {
    const out: Violation[] = [];
    for (const dest of part.locations) {
      const v = (code: string, message: string): void => { out.push(at(dest, code, message, ruleRef)); };
      if (space(ruleset, dest) === undefined || hasTag(ruleset, dest, TAG.noLandLinks) || hasTag(ruleset, dest, TAG.noPieces) || hasTag(ruleset, dest, TAG.eventsOnly)) {
        v("marchWhere", "No March into Western Cities, Europe or Iran (03 s4.2, s3).");
        continue;
      }
      if (entryToBox(ruleset, state, dest) === "closed") v("marchHost", "The host posture closes this box to March (07 s5.1).");
      const list = asMoves(part.perLocation[dest]?.["moves"]);
      if (list === null || list.length === 0) {
        v("badMoves", "Moves must be [{from, count, face?}] with at least one group.");
        continue;
      }
      for (const m of list) {
        if (!adjacent(ruleset, m.from, dest)) v("marchAdjacent", `Guerrillas move one step only: ${m.from} is not adjacent.`);
        if (m.face !== null && m.face !== FACE.underground && m.face !== FACE.active) v("badMoves", `Unknown face "${m.face}".`);
      }
    }
    if (out.length > 0) return out;
    for (const s of reserveGroups(state, part).short) {
      out.push(at(s.from, "marchGuerrillas", `Not enough such Guerrillas in ${s.from} for a group of ${String(s.need)} (each piece moves once).`, ruleRef));
    }
    return out;
  },
  cost: (ruleset, state, part, options) => (options.free ? 0 : part.locations.reduce((sum, dest) => sum + costOf(ruleset, state, dest), 0)),
  execute(ctx, part, options) {
    const threshold = param(ctx.ruleset, "march.activationThreshold", "number");
    const { groups } = reserveGroups(ctx.state, part);
    for (const dest of part.locations) {
      if (!options.free) pay(ctx, FACTION.pkk, costOf(ctx.ruleset, ctx.state, dest), ruleRef, dest);
      const restricted = entryToBox(ctx.ruleset, ctx.state, dest) === "restricted";
      for (const m of groups.get(dest) ?? []) {
        // Activation (06 s4.2 item 4) uses State pieces in the destination before the group arrives.
        const crossing = space(ctx.ruleset, dest)?.kind === "external" || space(ctx.ruleset, m.from)?.kind === "external";
        const atSupport = (ctx.state.spaces[dest]?.level ?? 0) > 0;
        const exposed = (atSupport || crossing) && m.group + statePieces(ctx.ruleset, ctx.state, dest) > threshold;
        ctx.apply({ type: "movePieces", piece: PIECE.guerrilla, state: m.face, toState: restricted || exposed ? FACE.active : null, count: m.count, from: m.from, to: dest, ruleRef, assumptionRef: restricted && dest === SYRIA_BOX ? "PA-16" : null });
      }
    }
  },
};
