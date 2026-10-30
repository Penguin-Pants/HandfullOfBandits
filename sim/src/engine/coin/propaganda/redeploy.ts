// Redeploy (research 05 s6.7). Both factions use the Control and piece inventory before Redeploy.
import type { Effect, GameState, JsonObject, Ruleset, Violation } from "../../core/types.ts";
import { param } from "../../core/params.ts";
import { control } from "../derive.ts";
import { adjacent, count, pay, resources, space } from "../ops/common.ts";
import { entryToBox } from "../ops/common-pkk.ts";
import { asMoves } from "../ops/plan.ts";
import type { PropagandaPhase } from "./phase.ts";
import { violation } from "./phase.ts";
const ruleRef = "05 s6.7";
const pieces = ["troops", "police", "guerrilla"];

function plan(ruleset: Ruleset, state: GameState, choice: JsonObject | null): {effects: Effect[]; violations: Violation[]; cost: number} {
  const effects: Effect[] = [];
  const violations: Violation[] = [];
  const fail = (code: string, message: string): void => { violations.push(violation(code, message, ruleRef)); };
  if (Object.keys(choice ?? {}).some(k => !pieces.includes(k))) fail("badRedeploy", "Only Troops, Police and Guerrillas can redeploy.");
  const before = control(ruleset, state);
  const remaining = new Map<string, number>();
  const departures = new Map<string, number>();
  const restricted = new Set<string>();
  for (const piece of pieces) {
    const list = asMoves(choice?.[piece]);
    if (list === null) { fail("badRedeploy", "Choose routes with an origin, destination and positive whole count."); continue; }
    for (const m of list) {
      const dest = m.to === null ? undefined : space(ruleset, m.to);
      if (dest === undefined || space(ruleset, m.from) === undefined || m.from === m.to || (m.face !== null && (piece !== "guerrilla" || !["active", "underground"].includes(m.face)))) {
        fail("badRedeploy", "Choose different known spaces and a valid piece face."); continue;
      }
      const to = dest.id;
      const entry = entryToBox(ruleset, state, to);
      const allowed = piece === "troops" ? dest.kind === "domestic" && (dest.terrain === "city" || count(state, to, "stateBase") > 0)
        : piece === "police" ? before[to] === "state"
        : adjacent(ruleset, m.from, to) && count(state, to, "pkkBase") > 0 && entry !== "closed";
      if (!allowed) fail("redeployWhere", "Troops need a City or State Base, Police need State Control and Guerrillas need an adjacent PKK Base with host access.");
      if (piece === "guerrilla" && entry === "restricted") restricted.add(to);
      let left = m.count;
      const faces = piece === "guerrilla" ? m.face === null ? ["underground", "active"] : [m.face] : ["default"];
      for (const face of faces) {
        const key = `${m.from}|${piece}|${face}`;
        const have = remaining.get(key) ?? count(state, m.from, piece, face);
        const n = Math.min(left, have);
        remaining.set(key, have - n);
        left -= n;
        if (n > 0) effects.push({type: "movePieces", piece, from: m.from, to, count: n, state: face, toState: piece === "guerrilla" && entry === "restricted" ? "active" : null, ruleRef, assumptionRef: null});
      }
      if (left > 0) fail("redeploySupply", "Too many pieces leave an origin. Each piece can move once.");
      if (piece === "troops") departures.set(m.from, (departures.get(m.from) ?? 0) + m.count);
    }
  }
  for (const box of ["kdp-zone", "puk-zone"]) if ((departures.get(box) ?? 0) < count(state, box, "troops")) fail("redeployRequired", "All Troops in the KDP and PUK Zones must redeploy.");
  const cost = restricted.size === 0 ? 0 : restricted.size * param(ruleset, "march.restrictedExtraCost", "number");
  if (cost > resources(ruleset, state, "pkk")) fail("cannotPay", "The PKK cannot pay the Restricted host entry cost.");
  return {effects, violations, cost};
}
export const redeployPhase: PropagandaPhase = {
  id: "redeploy", ruleRef,
  check: (ruleset, state, choice) => plan(ruleset, state, choice).violations,
  run(ctx, choice) {
    const resolved = plan(ctx.ruleset, ctx.state, choice);
    pay(ctx, "pkk", resolved.cost, ruleRef);
    ctx.apply(...resolved.effects);
  },
};
