// Ceasefire step of the Legal Politics phase (research 07 s7.3, s7.4; 09 s5; approved text
// docs/prototype/30, DEC-66). One choice holds both factions' answers, State first (solo play,
// GAP-O01): `{accept, pkkEnd, talks: {state, pkk}, outcome: {state, pkk, removals}, leave: {state, pkk}}`.
// Track `ceasefireRounds` counts the ceasefire steps the current Reciprocal Restraint or Talks has
// already been in force at: 1 means "in force at the previous Propaganda round, no breach since".
import type { Exec } from "../../core/exec.ts";
import { param } from "../../core/params.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";
import { CEASEFIRE, endCeasefire } from "../ceasefire.ts";
import { adjustEurope, count } from "../ops/common.ts";
import { EMERGENCY, FACTION, PIECE, TRACK } from "../ops/ids.ts";
import { asObject } from "../ops/plan.ts";
import { negotiatedOutcome } from "../victory.ts";
import { violation } from "./phase.ts";

const ruleRef = "07 s7.3";
export const ROUNDS = "ceasefireRounds";
const HELD = ["reciprocalRestraint", "talks"];

function yes(o: JsonObject | null, key: string): boolean {
  return o?.[key] === true;
}

/** Domestic Guerrillas the PKK removes for a Negotiated Outcome: half, round up (07 s7.4 item 3). */
export function outcomeRemovals(ruleset: Ruleset, state: GameState): number {
  return Math.ceil(ruleset.spaces.filter((s) => s.kind === "domestic").reduce((n, s) => n + count(state, s.id, PIECE.guerrilla), 0) / 2);
}

/** What each faction may choose at the ceasefire step now. */
export function ceasefireOptions(ruleset: Ruleset, state: GameState): { accept: boolean; vote: boolean; outcome: boolean; leave: boolean; removals: number } {
  const status = String(state.tracks[CEASEFIRE]);
  const held = Number(state.tracks[ROUNDS] ?? 0) >= 1;
  const stateBroken = ruleset.spaces.some((s) => (state.spaces[s.id]?.markers["restraintBroken"]?.[FACTION.state] ?? 0) > 0);
  return {
    accept: status === "declared" && !stateBroken,
    vote: status === "reciprocalRestraint" && held,
    outcome: status === "talks" && held && state.tracks["legalSpace"] !== "banned",
    leave: HELD.includes(status),
    removals: outcomeRemovals(ruleset, state),
  };
}

/** Violations of the ceasefire part of a Legal Politics choice. */
export function ceasefireViolations(ruleset: Ruleset, state: GameState, choice: JsonObject | null): Violation[] {
  const outcome = asObject(asObject(choice?.["ceasefire"])?.["outcome"]);
  if (!yes(outcome, "state") || !yes(outcome, "pkk") || !ceasefireOptions(ruleset, state).outcome) return [];
  const removals = asObject(outcome?.["removals"]) ?? {};
  const need = outcomeRemovals(ruleset, state);
  const entries = Object.entries(removals);
  const fits = entries.every(([id, n]) => typeof n === "number" && Number.isInteger(n) && n >= 0 && ruleset.spaces.find((s) => s.id === id)?.kind === "domestic" && n <= count(state, id, PIECE.guerrilla));
  const total = entries.reduce((sum, [, n]) => sum + (typeof n === "number" ? n : 0), 0);
  return fits && total === need ? [] : [violation("outcomeRemovals", `Remove exactly ${String(need)} domestic Guerrillas for the Negotiated Outcome.`, "07 s7.4")];
}

/** Run the ceasefire step. Returns true when a Negotiated Outcome ended the game. */
export function ceasefireStep(ctx: Exec, choice: JsonObject | null): boolean {
  const c = asObject(choice?.["ceasefire"]);
  const options = ceasefireOptions(ctx.ruleset, ctx.state);
  const start = String(ctx.state.tracks[CEASEFIRE]);
  const set = (value: string, ref: string): void => { ctx.apply({ type: "setTrack", track: CEASEFIRE, value, ifEquals: null, ruleRef: ref, assumptionRef: null }); };
  // Step 1: Declared.
  if (start === "declared") {
    if (options.accept && yes(c, "accept")) set("reciprocalRestraint", `${ruleRef} step 1`);
    else if (yes(c, "pkkEnd")) {
      if (ctx.state.flags["ceasefireDeclaredByPkk"] === true) adjustEurope(ctx, -param(ctx.ruleset, "ceasefire.endEurope", "number"), `${ruleRef} step 1`);
      endCeasefire(ctx, `${ruleRef} step 1`);
    }
  }
  // Step 2: Talks vote. One no keeps Reciprocal Restraint (DEC-66 point 1).
  const talks = asObject(c?.["talks"]);
  if (options.vote && yes(talks, "state") && yes(talks, "pkk")) set("talks", `${ruleRef} step 2`);
  // Step 3: Negotiated Outcome.
  const outcome = asObject(c?.["outcome"]);
  if (options.outcome && yes(outcome, "state") && yes(outcome, "pkk")) {
    const ref = "07 s7.4";
    ctx.apply({ type: "setTrack", track: TRACK.emergencyRule, value: EMERGENCY.normalizing, ifEquals: null, ruleRef: ref, assumptionRef: null });
    ctx.apply({ type: "setTrack", track: "legalSpace", value: "open", ifEquals: null, ruleRef: ref, assumptionRef: null });
    for (const [space, n] of Object.entries(asObject(outcome?.["removals"]) ?? {})) {
      if (typeof n === "number" && n > 0) ctx.apply({ type: "removePieces", piece: PIECE.guerrilla, state: null, count: n, space, to: "available", ruleRef: ref, assumptionRef: "PA-01" });
    }
    negotiatedOutcome(ctx, Number(ctx.state.tracks[ROUNDS] ?? 0) >= param(ctx.ruleset, "negotiated.waiveCovertRounds", "number"));
    return true;
  }
  // Step 4: leaving, State first (DEC-66 point 5). A refused outcome may end Talks here (point 4).
  const leave = asObject(c?.["leave"]);
  for (const faction of [FACTION.state, FACTION.pkk]) {
    if (!yes(leave, faction)) continue;
    const now = String(ctx.state.tracks[CEASEFIRE]);
    if (now === "talks") set("reciprocalRestraint", `${ruleRef} step 4`);
    else if (now === "reciprocalRestraint") {
      if (faction === FACTION.pkk) adjustEurope(ctx, -param(ctx.ruleset, "ceasefire.endEurope", "number"), `${ruleRef} step 4`);
      endCeasefire(ctx, `${ruleRef} step 4`);
    }
  }
  // Held rounds: +1 when the same restraint holds through this step, 1 when it starts here, else 0.
  const end = String(ctx.state.tracks[CEASEFIRE]);
  const next = !HELD.includes(end) ? 0 : end === start ? Number(ctx.state.tracks[ROUNDS] ?? 0) + 1 : 1;
  if (next !== Number(ctx.state.tracks[ROUNDS] ?? 0)) ctx.apply({ type: "setTrack", track: ROUNDS, value: next, ifEquals: null, ruleRef, assumptionRef: null });
  return false;
}
