// Diplomacy and Host Pressure (06 s3.3, s5.4; PA-02, PA-03).
import type { Exec } from "../../../core/exec.ts";
import { param } from "../../../core/params.ts";
import { at, type ActionHandler } from "../action.ts";
import { activate, count, pay } from "../common.ts";
import { postureOf } from "../common-pkk.ts";
import { FACTION, HOST_OF, MARKER, PIECE, POSTURE, SYRIA_BOX, TRACK } from "../ids.ts";

/** Apply a posture shift and the consequences of entering Hostile or Aligned (07 s5.1). */
export function shiftHost(ctx: Exec, box: string, delta: number, ruleRef: string): void {
  const track = HOST_OF[box];
  if (track === undefined) throw new RangeError(`No host for ${box}`);
  const cap = box === SYRIA_BOX && delta > 0 && postureOf(ctx.state, box) === POSTURE.hostile;
  if (!cap) ctx.apply({type: "stepOrdinal", track, direction: delta > 0 ? "next" : "previous", steps: Math.abs(delta), ruleRef, assumptionRef: box === SYRIA_BOX ? "PA-02" : null});
  const posture = postureOf(ctx.state, box);
  if (posture !== POSTURE.hostile && posture !== POSTURE.aligned) return;
  activate(ctx, box, count(ctx.state, box, PIECE.guerrilla), ruleRef);
  if (box === SYRIA_BOX && (ctx.state.spaces[box]?.markers[MARKER.leadership]?.["present"] ?? 0) > 0) ctx.apply({type: "flipMarker", marker: MARKER.leadership, space: box, side: "abroad", ruleRef, assumptionRef: null});
}

export const diplomacy: ActionHandler = {
  id: "state.diplomacy", faction: FACTION.state, kind: "sa", ruleRef: "06 s3.3", accompanies: "any",
  check: (_r, _s, p) => p.locations.length === 1 && (p.locations[0] === "europe" || HOST_OF[p.locations[0] ?? ""] !== undefined) ? [] : [at(null, "diplomacyTarget", "Choose one host box or Europe.", "06 s3.3")],
  cost: (r, _s, _p, o) => o.free ? 0 : param(r, "diplomacy.cost", "number"),
  execute(ctx, part, options) {
    const ruleRef = "06 s3.3";
    if (!options.free) pay(ctx, FACTION.state, param(ctx.ruleset, "diplomacy.cost", "number"), ruleRef);
    const target = part.locations[0] ?? "";
    const legitimacy = Number(ctx.state.tracks[TRACK.legitimacy]);
    const campaigns = param(ctx.ruleset, "campaign.order", "list");
    const campaign = campaigns.indexOf(ctx.state.turn.campaign ?? "");
    let modifier = legitimacy >= param(ctx.ruleset, "diplomacy.highLeg", "number") ? 1 : legitimacy <= param(ctx.ruleset, "diplomacy.lowLeg", "number") ? -1 : 0;
    if (target === SYRIA_BOX && campaign < campaigns.indexOf("C5")) modifier--;
    if (target === "kdp-zone" && campaign >= campaigns.indexOf("C3")) modifier++;
    modifier += typeof options.constraints["bonus"] === "number" ? options.constraints["bonus"] : 0;
    const raw = ctx.roll("Diplomacy", ruleRef);
    const result = raw + modifier;
    ctx.log("EffectApplied", {effect: "diplomacyRoll", raw, modifier, result, target}, ruleRef, "PA-03");
    const threshold = target !== "europe" && postureOf(ctx.state, target) === POSTURE.hostile ? "diplomacy.alignedRoll" : "diplomacy.successRoll";
    if (result < param(ctx.ruleset, threshold, "number")) return;
    if (target === "europe") ctx.apply({type: "adjustTrack", track: TRACK.europe, delta: -1, ruleRef, assumptionRef: null});
    else shiftHost(ctx, target, 1, ruleRef);
  },
};

export const hostPressure: ActionHandler = {
  id: "pkk.host-pressure", faction: FACTION.pkk, kind: "sa", ruleRef: "06 s5.4", accompanies: ["pkk.rally", "pkk.march"],
  check(_r, s, p) {
    const loc = p.locations[0] ?? "";
    if (p.locations.length !== 1 || HOST_OF[loc] === undefined || count(s, loc, PIECE.guerrilla) + count(s, loc, PIECE.pkkBase) === 0) return [at(loc, "hostPressureTarget", "Choose one host box with a PKK piece.", "06 s5.4")];
    return loc === SYRIA_BOX && (s.spaces[loc]?.markers[MARKER.leadership]?.["present"] ?? 0) === 0 ? [at(loc, "leadershipAbroad", "Host Pressure in Syria needs Leadership Present.", "06 s5.4")] : [];
  },
  cost: (r, _s, _p, o) => o.free ? 0 : param(r, "hostPressure.cost", "number"),
  execute(ctx, part, options) {
    const ruleRef = "06 s5.4";
    if (!options.free) pay(ctx, FACTION.pkk, param(ctx.ruleset, "hostPressure.cost", "number"), ruleRef);
    const loc = part.locations[0] ?? "";
    const roll = ctx.roll("Host Pressure", ruleRef);
    const prefix = loc === "kdp-zone" ? "hostPressure.kdp" : "hostPressure.other";
    if (roll >= param(ctx.ruleset, `${prefix}Success`, "number")) shiftHost(ctx, loc, -1, ruleRef);
    else if (roll <= param(ctx.ruleset, `${prefix}Backfire`, "number")) shiftHost(ctx, loc, 1, ruleRef);
  },
};
