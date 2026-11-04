// Legal Politics phase (research 05 s6.5; 07 s6.3, s6.4; approved text docs/prototype/29, DEC-65).
// From C3, skipped while Legal Space is Absent. Choice `{closureFiling: true}`: the State files a
// closure case first. Then procedure table lines 1 to 6 run in order. The Closure Case marker is
// flag `closureCase`; the Successor marker value is track `successor`.
import { createExec, type Exec } from "../../core/exec.ts";
import { param } from "../../core/params.ts";
import { SINGLE_FACE } from "../../core/state.ts";
import type { GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";
import { ceasefireStep, ceasefireViolations } from "./ceasefire-step.ts";
import { adjustEurope, controlOf, markers, space } from "../ops/common.ts";
import { FACTION, MARKER, TRACK } from "../ops/ids.ts";
import { violation, type PropagandaPhase } from "./phase.ts";

const ruleRef = "07 s6.4";
const LEGAL = "legalSpace";
const SUCCESSOR = "successor";
const CASE = "closureCase";

function officeSpaces(ruleset: Ruleset, state: GameState): string[] {
  return ruleset.spaces.filter((s) => markers(state, s.id, MARKER.office) > 0).map((s) => s.id);
}

function order(ruleset: Ruleset): string[] {
  return param(ruleset, "legal.officeOrder", "list").map(String);
}

/** Line 4 eligibility: Pop 2 or more, no Office, no PKK Control, not at an Active level. */
function eligible(ruleset: Ruleset, state: GameState, id: string): boolean {
  return (space(ruleset, id)?.pop ?? 0) >= param(ruleset, "legal.officeMinPop", "number") && markers(state, id, MARKER.office) === 0
    && controlOf(ruleset, state, id) !== FACTION.pkk && Math.abs(state.spaces[id]?.level ?? 0) < ruleset.levelRange;
}

/** Place up to `n` Offices, one per eligible space, in line 4 order. */
function place(ctx: Exec, n: number, ref: string): void {
  for (let i = 0; i < n; i++) {
    const id = order(ctx.ruleset).find((s) => eligible(ctx.ruleset, ctx.state, s));
    if (id === undefined) return;
    ctx.apply({ type: "placeMarker", marker: MARKER.office, space: id, side: SINGLE_FACE, ruleRef: ref, assumptionRef: null });
  }
}

/** Violations for a State closure filing (07 s6.3). */
export function closureViolations(ruleset: Ruleset, state: GameState): Violation[] {
  const ref = "07 s6.3";
  if (!["open", "prosecuted"].includes(String(state.tracks[LEGAL]))) return [violation("closureSpace", "A closure case needs Legal Space Open or Prosecuted.", ref)];
  if (officeSpaces(ruleset, state).length === 0) return [violation("closureOffice", "A closure case needs at least 1 Office on the map.", ref)];
  if (state.flags[CASE] === true) return [violation("closurePending", "A Closure Case marker is already on the track.", ref)];
  return [];
}

function fileCase(ctx: Exec, ref: string): void {
  ctx.apply({ type: "setFlag", flag: CASE, value: true, ruleRef: ref, assumptionRef: null });
}

export const legalPoliticsPhase: PropagandaPhase = {
  id: "legalPolitics",
  ruleRef: "05 s6.5",
  check(ruleset, state, choice) {
    const filing = choice?.["closureFiling"] === true ? closureViolations(ruleset, state) : [];
    if (filing.length > 0 || state.tracks[LEGAL] === "absent") return filing;
    // The ceasefire step meets the board after the procedure table, as in `run`.
    const ctx = createExec(ruleset, state);
    procedure(ctx, choice);
    return ceasefireViolations(ruleset, ctx.state, choice);
  },
  run(ctx, choice) {
    if (ctx.state.tracks[LEGAL] === "absent") {
      ctx.log("EffectSkipped", { effect: "legalPolitics", reason: "legalSpaceAbsent" }, "05 s6.5");
      return;
    }
    procedure(ctx, choice);
    // 05 s6.5 item 3: the ceasefire step follows the procedure table.
    ceasefireStep(ctx, choice);
  },
};

/** Line 3: the Office limit for the current Legal Space. */
function officeLimit(ctx: Exec): number {
  return param(ctx.ruleset, ctx.state.tracks[LEGAL] === "open" ? "legal.limitOpen" : "legal.limitProsecuted", "number");
}

function officeCount(ruleset: Ruleset, state: GameState): number {
  return officeSpaces(ruleset, state).reduce((n, id) => n + markers(state, id, MARKER.office), 0);
}

/** Lines 3 and 4: below the limit, place 1 Office. HEP Founded runs them as a card procedure (DK-037). */
export function officeLines(ctx: Exec): void {
  if (officeCount(ctx.ruleset, ctx.state) < officeLimit(ctx)) place(ctx, 1, `${ruleRef} line 4`);
}

/** Line 1: ban. Successor at the Office count, all Offices removed, Legitimacy and Europe costs. Card procedure `legal.ban` (DK-060, DK-068). */
export function ban(ctx: Exec): void {
  const { ruleset } = ctx;
  const ref = `${ruleRef} line 1`;
  ctx.apply({ type: "setTrack", track: LEGAL, value: "banned", ifEquals: null, ruleRef: ref, assumptionRef: null });
  ctx.apply({ type: "setTrack", track: SUCCESSOR, value: officeCount(ruleset, ctx.state), ifEquals: null, ruleRef: ref, assumptionRef: null });
  for (const id of officeSpaces(ruleset, ctx.state)) for (let i = markers(ctx.state, id, MARKER.office); i > 0; i--) ctx.apply({ type: "removeMarker", marker: MARKER.office, space: id, side: SINGLE_FACE, ruleRef: ref, assumptionRef: null });
  ctx.apply({ type: "adjustTrack", track: TRACK.legitimacy, delta: -param(ruleset, "legal.banLegitimacy", "number"), ruleRef: ref, assumptionRef: null });
  adjustEurope(ctx, param(ruleset, "legal.banEurope", "number"), ref, "PA-04");
  ctx.apply({ type: "setFlag", flag: CASE, value: false, ruleRef: ref, assumptionRef: null });
}

/**
 * Line 2: the successor returns at Prosecuted with Successor - `less` Offices, minimum 1, in line 4 order.
 * Card procedures `legal.successor` (DK-065, less 1) and `legal.successorFull` (DK-067, less 0).
 */
export function successor(ctx: Exec, less: number): void {
  const ref = `${ruleRef} line 2`;
  ctx.apply({ type: "setTrack", track: LEGAL, value: "prosecuted", ifEquals: null, ruleRef: ref, assumptionRef: null });
  place(ctx, Math.max(1, Number(ctx.state.tracks[SUCCESSOR]) - less), ref);
  ctx.apply({ type: "setTrack", track: SUCCESSOR, value: 0, ifEquals: null, ruleRef: ref, assumptionRef: null });
}

/** Closure filing and procedure table lines 1 to 6 (07 s6.3, s6.4). */
function procedure(ctx: Exec, choice: JsonObject | null): void {
  const { ruleset } = ctx;
  const pending = ctx.state.flags[CASE] === true;
  if (choice?.["closureFiling"] === true) {
    fileCase(ctx, "07 s6.3");
    ctx.apply({ type: "setTrack", track: LEGAL, value: "prosecuted", ifEquals: null, ruleRef: "07 s6.3", assumptionRef: null });
  }
  if (pending) {
    ban(ctx);
    return;
  }
  if (ctx.state.tracks[LEGAL] === "banned") {
    successor(ctx, 1);
    return;
  }
  officeLines(ctx);
  const limit = officeLimit(ctx);
  // Line 5: remove to the limit. Offices outside the list go first (DEC-65 point 1), then latest in the list.
  const list = order(ruleset);
  const rank = (id: string): number => (list.includes(id) ? list.indexOf(id) : list.length);
  while (officeCount(ruleset, ctx.state) > limit) {
    const id = [...officeSpaces(ruleset, ctx.state)].sort((a, b) => rank(b) - rank(a))[0];
    if (id === undefined) break;
    ctx.apply({ type: "removeMarker", marker: MARKER.office, space: id, side: SINGLE_FACE, ruleRef: `${ruleRef} line 5`, assumptionRef: null });
  }
  // Line 6: the prosecutor files at the limit (DD-19.1).
  if (officeCount(ruleset, ctx.state) === limit && ctx.state.flags[CASE] !== true) fileCase(ctx, `${ruleRef} line 6`);
}
