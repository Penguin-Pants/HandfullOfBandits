// Cross-Border access and lift (06 s3.2). Troops remain until Redeploy.
import { param } from "../../../core/params.ts";
import type { GameState, Ruleset } from "../../../core/types.ts";
import { at, type ActionHandler } from "../action.ts";
import { count, pay } from "../common.ts";
import { postureOf } from "../common-pkk.ts";
import { FACTION, FLAG_VACUUM, PIECE, POSTURE } from "../ids.ts";
import { asMoves } from "../plan.ts";

/** Normal access, including the post-Vacuum Tolerant exception. */
export function crossBorderOpen(r: Ruleset, s: GameState, box: string): boolean {
  const campaigns = param(r, "campaign.order", "list");
  const later = campaigns.indexOf(s.turn.campaign ?? "") >= campaigns.indexOf("C3");
  const open = (host: string): boolean => {
    const p = postureOf(s, host);
    return p === POSTURE.restricted || p === POSTURE.hostile || p === POSTURE.aligned || (p === POSTURE.tolerant && later && s.flags[FLAG_VACUUM] === true);
  };
  return box === "kdp-zone" ? open(box) : box === "puk-zone" && open(box) && open("kdp-zone");
}

export const crossBorder: ActionHandler = {
  id: "state.cross-border", faction: FACTION.state, kind: "sa", ruleRef: "06 s3.2", accompanies: ["state.sweep", "state.assault"], timing: "before",
  check(r, s, p, o) {
    const box = p.locations[0] ?? "";
    const fail = (code: string, message: string) => [at(box, code, message, "06 s3.2")];
    if (p.locations.length !== 1 || !["kdp-zone", "puk-zone"].includes(box) || !o.opLocations.includes(box)) return fail("crossBorderTarget", "Select one KDP or PUK Zone also selected for the Operation.");
    const moves = asMoves(p.perLocation[box]?.["moves"]);
    if (moves === null || moves.some(m => !["hakkari", "botan"].includes(m.from) || m.to !== null || m.face !== null)) return fail("crossBorderMoves", "Move Troops from Hakkari or Botan into the selected zone.");
    const moved = moves.reduce((n, m) => n + m.count, 0);
    if (moved > param(r, "crossBorder.maxTroops", "number")) return fail("crossBorderTroops", "Too many Troops in the lift.");
    for (const origin of ["hakkari", "botan"]) if (moves.filter(m => m.from === origin).reduce((n, m) => n + m.count, 0) > count(s, origin, PIECE.troops)) return fail("crossBorderSupply", "The origin has too few Troops.");
    if (typeof o.constraints["maxTroops"] === "number" && count(s, box, PIECE.troops) + moved > o.constraints["maxTroops"]) return fail("crossBorderTroops", "The card limits the zone force.");
    if (crossBorderOpen(r, s, box)) return [];
    const hot = box === "kdp-zone" && ["C1", "C2"].includes(s.turn.campaign ?? "") && r.scenarios[s.meta.scenarioId]?.options["hotPursuit"] !== "deny";
    return hot && count(s, box, PIECE.troops) + moved <= param(r, "crossBorder.hotPursuitTroops", "number") ? [] : fail("crossBorderAccess", "Posture denies access or the hot pursuit force exceeds its limit.");
  },
  cost: (r, s, p, o) => o.free || postureOf(s, p.locations[0] ?? "") === POSTURE.aligned ? 0 : param(r, "crossBorder.cost", "number"),
  execute(ctx, p, o) {
    const box = p.locations[0] ?? "";
    pay(ctx, FACTION.state, crossBorder.cost(ctx.ruleset, ctx.state, p, o), "06 s3.2", box);
    for (const move of asMoves(p.perLocation[box]?.["moves"]) ?? []) ctx.apply({type: "movePieces", piece: PIECE.troops, state: null, toState: null, count: move.count, from: move.from, to: box, ruleRef: "06 s3.2", assumptionRef: null});
  },
};
