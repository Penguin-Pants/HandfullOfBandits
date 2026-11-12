// ChooseOperation (research 05 s2.2 step 3, s3.1; 06 s1): an Op, optionally with one SA, in a box.
import { createExec, PreviewStop, type Exec } from "../../core/exec.ts";
import type { AnyCommand, CommandHandler, GameState, JsonObject, Ruleset, SubAction, Violation } from "../../core/types.ts";
import { BOX, placeCylinder, sequenceViolations } from "../sequence/ct.ts";
import { at, type ActionHandler, type ActionOptions, type ActionPart } from "./action.ts";
import { resources } from "./common.ts";
import { HARMFUL_ACTIONS } from "./ids.ts";
import { applyRestraint, restraintWarnings, type ActionUse } from "../ceasefire.ts";
import { asList, asMoves, asObject, asString } from "./plan.ts";
import { flagHarmful, notePassOnly } from "../stop-rules.ts";
import { actionHandlers } from "./registry.ts";

/** Validation view for the unexecuted Op. The real cylinder stays placed. */
export function operationState(state: GameState): GameState {
  if (state.pending?.resume?.kind !== "operation") return state;
  return { ...state, pending: null, turn: {...state.turn, phase: "card"}, initiative: {...state.initiative, actedThisCard: state.initiative.actedThisCard.filter(f => f !== state.pending?.faction)} };
}

const ruleRef = "06 s1";
const OP_BOXES: readonly string[] = [BOX.limitedOp, BOX.opOnly, BOX.opSa];

interface ParsedPlan {
  readonly op: ActionHandler;
  readonly part: ActionPart;
  readonly sa: { readonly handler: ActionHandler; readonly part: ActionPart; readonly timing: "before" | "after" } | null;
  readonly options: ActionOptions;
  readonly saOptions: ActionOptions | null;
}

function part(value: JsonObject): ActionPart | null {
  const locations = asList(value["locations"]);
  const perLocation = value["perLocation"] === undefined ? {} : asObject(value["perLocation"]);
  if (!locations.every((l) => typeof l === "string") || perLocation === null) return null;
  if (!Object.values(perLocation).every((v) => asObject(v) !== null)) return null;
  return { locations: locations.filter((l) => typeof l === "string"), perLocation: perLocation as Readonly<Record<string, JsonObject>> };
}

function subActions(value: unknown): SubAction[] | null {
  const list = asList(value);
  const out: SubAction[] = [];
  for (const item of list) {
    const o = asObject(item);
    const action = asString(o?.["action"]);
    const space = asString(o?.["space"]);
    const params = o?.["params"] === undefined ? {} : asObject(o["params"]);
    if (action === null || space === null || params === null) return null;
    out.push({ action, space, params });
  }
  return out;
}

/** State after `run`, stopped before its first die roll (05 s4 preview rule). */
function simulate(ruleset: Ruleset, state: GameState, run: (ctx: Exec) => void): GameState {
  const ctx = createExec(ruleset, state, true);
  try {
    run(ctx);
  } catch (e) {
    if (!(e instanceof PreviewStop)) throw e;
  }
  return ctx.state;
}

/**
 * Locations an Operation part uses: its selected locations and every other destination its moves
 * name (Garrison). One site with no Special Activity is a Limited Op (rules 2.3; research 05 s3.1 item 2).
 */
export function siteCount(opPart: { readonly locations: readonly string[]; readonly perLocation: Readonly<Record<string, JsonObject | undefined>> }): number {
  const sites = new Set(opPart.locations);
  for (const loc of opPart.locations) for (const m of asMoves(opPart.perLocation[loc]?.["moves"]) ?? []) if (m.to !== null) sites.add(m.to);
  return sites.size;
}

/** Parse and check a ChooseOperation command. Returns violations, or the plan when it is legal. */
function parse(ruleset: Ruleset, state: GameState, command: AnyCommand): { violations: Violation[]; plan: ParsedPlan | null } {
  const fail = (code: string, message: string): { violations: Violation[]; plan: null } => ({ violations: [at(null, code, message, ruleRef)], plan: null });
  const faction = String(command["faction"]);
  const box = String(command["box"]);
  if (!OP_BOXES.includes(box)) return fail("notAnOpBox", `Box "${box}" is not an Operation box. Use ${OP_BOXES.join(", ")}.`);
  const resume = state.pending?.resume;
  const waiting = state.pending;
  state = operationState(state);
  if (resume !== undefined) {
    const raw = asObject(command["plan"]);
    if (command["faction"] !== waiting?.faction || box !== resume.box || raw?.["op"] !== resume.op || (raw["sa"] !== null && raw["sa"] !== undefined)) return fail("resumeOperation", "Choose new locations for the saved Operation, without another Special Activity (DEC-54; DEC-56).");
  }
  const sequence = sequenceViolations(ruleset, state, command["faction"], box);
  if (sequence.length > 0) return { violations: sequence, plan: null };
  const raw = asObject(command["plan"]);
  const opPart = raw === null ? null : part(raw);
  const subs = subActions(raw?.["subActions"]);
  if (raw === null || opPart === null || subs === null) return fail("badPlan", "The plan is not well formed (05 s3.1).");
  const opId = asString(raw["op"]) ?? "";
  const op = actionHandlers[opId];
  if (op?.kind !== "op" || op.faction !== faction) return fail("unknownOp", `"${opId}" is not an Operation of ${faction}.`);
  const limited = box === BOX.limitedOp;
  const violations: Violation[] = [];
  if (new Set(opPart.locations).size !== opPart.locations.length) violations.push(at(null, "duplicateLocation", "Select each location once.", ruleRef));
  if (opPart.locations.length === 0) violations.push(at(null, "noLocation", "Select at least one location.", ruleRef));
  if (limited && opPart.locations.length > 1) violations.push(at(null, "limitedOneLocation", "A Limited Op selects one location (05 s3.1).", "05 s3.1"));
  // The box follows the action (rules 2.3). The responder's Op Only keeps any number of locations (05 s2.3 note 2).
  if (box === BOX.opOnly && resume === undefined && faction === state.initiative.firstEligible && siteCount(opPart) === 1) {
    violations.push(at(null, "opOnlyLocations", "Op Only needs two or more locations. One location with no Special Activity is a Limited Op (rules 2.3).", "05 s2.2"));
  }
  const rawSa = raw["sa"] === undefined || raw["sa"] === null ? null : asObject(raw["sa"]);
  let sa: ParsedPlan["sa"] = null;
  if (rawSa !== null) {
    const saPart = part(rawSa);
    const saId = asString(rawSa["action"]) ?? "";
    const handler = actionHandlers[saId];
    const timing = rawSa["timing"] === "before" ? "before" : rawSa["timing"] === "after" ? "after" : null;
    if (box !== BOX.opSa) violations.push(at(null, "saNotAllowed", `A Special Activity needs the Op + SA box, not ${box} (06 s1 item 2).`, "06 s1"));
    if (saPart === null || timing === null) return fail("badPlan", "The Special Activity part is not well formed (timing before or after, DEC-16).");
    if (new Set(saPart.locations).size !== saPart.locations.length) violations.push(at(null, "duplicateLocation", "Select each Special Activity location once.", ruleRef));
    if (handler?.kind !== "sa" || handler.faction !== faction) return fail("unknownSa", `"${saId}" is not a Special Activity of ${faction}.`);
    if (handler.accompanies !== "any" && !handler.accompanies.includes(op.id)) {
      violations.push(at(null, "saNotWithOp", `${handler.id} cannot accompany ${op.id}. It accompanies ${handler.accompanies.join(", ")}.`, handler.ruleRef));
    }
    if (handler.timing !== undefined && handler.timing !== timing) violations.push(at(null, "saTiming", `${handler.id} must run ${handler.timing} the Operation.`, handler.ruleRef));
    sa = { handler, part: saPart, timing };
  } else if (raw["sa"] !== undefined && raw["sa"] !== null) {
    return fail("badPlan", "The Special Activity part is not well formed.");
  }
  const options: ActionOptions = { faction, limited, free: false, constraints: {}, op: null, sa: sa?.handler.id ?? null, opLocations: [], saLocations: sa?.part.locations ?? [], subActions: subs };
  const saOptions: ActionOptions | null = sa === null ? null : { ...options, op: op.id, sa: null, opLocations: opPart.locations, saLocations: [], subActions: [] };
  // Each part is checked on the board it will meet, and paid from the Resources it will have:
  // an SA before the Op changes the Op's board and may add income (DEC-16).
  const checkPart = (handler: ActionHandler, p: ActionPart, o: ActionOptions, on: GameState): boolean => {
    const found = handler.check(ruleset, on, p, o);
    violations.push(...found);
    if (found.length > 0) return false;
    const cost = handler.cost(ruleset, on, p, o);
    const have = resources(ruleset, on, faction);
    if (cost > have) violations.push(at(null, "cannotPay", `${handler.id} costs ${String(cost)} Resources; ${faction} has ${String(have)} then (06 s1 item 4).`, "06 s1"));
    return cost <= have;
  };
  // A ceasefire breach applies before the action (07 s7.2), so the parts meet the board after it.
  const board = simulate(ruleset, state, (ctx) => { applyRestraint(ctx, faction, [{ id: op.id, part: opPart }, ...(sa === null ? [] : [{ id: sa.handler.id, part: sa.part }])]); });
  if (sa !== null && saOptions !== null && sa.timing === "before") {
    if (checkPart(sa.handler, sa.part, saOptions, board)) checkPart(op, opPart, options, simulate(ruleset, board, (ctx) => { sa.handler.execute(ctx, sa.part, saOptions); }));
  } else if (checkPart(op, opPart, options, board) && sa !== null && saOptions !== null) {
    // The board after a rolling Op is known only at execution, so execute checks the SA again.
    checkPart(sa.handler, sa.part, saOptions, simulate(ruleset, board, (ctx) => { op.execute(ctx, opPart, options); }));
  }
  return violations.length > 0 ? { violations, plan: null } : { violations: [], plan: { op, part: opPart, sa, options, saOptions } };
}

/**
 * Whether any legal, affordable replacement exists for an Operation paused by Host Pressure
 * (DEC-54, DEC-56 as amended 2026-11-04). Probes one-location plans: a one-Guerrilla March from
 * each origin into each destination, or each Rally option in each location. A larger legal plan
 * implies one of these is legal, so no probe passing means no replacement exists.
 */
function hasReplacement(ruleset: Ruleset, state: GameState, plan: ParsedPlan): boolean {
  const ids = ruleset.spaces.map((x) => x.id);
  const probes: ActionPart[] = plan.op.id === "pkk.march"
    ? ids.flatMap((to) => ids.filter((from) => from !== to).map((from) => ({ locations: [to], perLocation: { [to]: { moves: [{ from, count: 1 }] } } })))
    : ids.flatMap((loc) => ["place", "base", "grow", "flip"].map((option) => ({ locations: [loc], perLocation: { [loc]: { option } } })));
  const budget = resources(ruleset, state, plan.options.faction);
  // A replacement is a new resume command: no Special Activity and no optional sub-actions.
  const options: ActionOptions = { ...plan.options, sa: null, saLocations: [], subActions: [] };
  return probes.some((p) => plan.op.check(ruleset, state, p, options).length === 0 && plan.op.cost(ruleset, state, p, options) <= budget);
}

/** The Op and SA of a parsed plan, for the ceasefire table (07 s7.2). */
function uses(plan: ParsedPlan): ActionUse[] {
  return [{ id: plan.op.id, part: plan.part }, ...(plan.sa === null ? [] : [{ id: plan.sa.handler.id, part: plan.sa.part }])];
}

export const chooseOperationHandler: CommandHandler = {
  ruleRef,
  check: (ruleset, state, command) => parse(ruleset, state, command).violations,
  warnings(ruleset, state, command) {
    const { plan } = parse(ruleset, state, command);
    return plan === null ? [] : restraintWarnings(ruleset, state, plan.options.faction, uses(plan));
  },
  execute(ctx: Exec, command) {
    const { plan } = parse(ctx.ruleset, ctx.state, command);
    if (plan === null) throw new Error("ChooseOperation executed without a legal plan");
    if (ctx.state.pending?.resume?.kind === "operation") {
      const {id, ruleRef: decisionRef} = ctx.state.pending;
      ctx.write(s => ({...s, pending: null, turn: {...s.turn, phase: "card"}}));
      ctx.log("DecisionAnswered", {decisionId: id, op: plan.op.id, locations: [...plan.part.locations]}, decisionRef);
      applyRestraint(ctx, plan.options.faction, uses(plan));
      plan.op.execute(ctx, plan.part, plan.options);
      return;
    }
    const placed = placeCylinder(ctx.state, plan.options.faction, String(command["box"]));
    ctx.write(() => placed.state);
    ctx.log(placed.entry.kind, { ...placed.entry.data, op: plan.op.id, sa: plan.sa?.handler.id ?? null }, placed.entry.ruleRef);
    const runSa = (timing: "before" | "after"): void => {
      if (plan.sa?.timing !== timing || plan.saOptions === null) return;
      const found = plan.sa.handler.check(ctx.ruleset, ctx.state, plan.sa.part, plan.saOptions);
      if (found.length > 0) {
        ctx.log("EffectSkipped", { effect: "specialActivity", action: plan.sa.handler.id, reason: found.map((v) => v.code).join(",") }, plan.sa.handler.ruleRef);
        return;
      }
      const before = ctx.state;
      plan.sa.handler.execute(ctx, plan.sa.part, plan.saOptions);
      if (HARMFUL_ACTIONS.includes(plan.sa.handler.id)) flagHarmful(ctx, plan.sa.handler.id, plan.options.faction, before);
    };
    notePassOnly(ctx, plan.options.faction, false);
    applyRestraint(ctx, plan.options.faction, uses(plan));
    runSa("before");
    if (plan.sa?.handler.id === "pkk.host-pressure" && plan.sa.timing === "before" && (plan.op.check(ctx.ruleset, ctx.state, plan.part, plan.options).length > 0 || plan.op.cost(ctx.ruleset, ctx.state, plan.part, plan.options) > resources(ctx.ruleset, ctx.state, plan.options.faction))) {
      const march = plan.op.id === "pkk.march";
      const decisionRef = march ? "DEC-56" : "DEC-54";
      // No legal, affordable replacement: the Operation ends; the roll, posture change and costs stand.
      if (!hasReplacement(ctx.ruleset, ctx.state, plan)) {
        ctx.log("EffectSkipped", { effect: "operation", action: plan.op.id, reason: "noLegalReplacement" }, decisionRef);
        return;
      }
      const pending = {id: `operation-${String(ctx.state.meta.stateSeq)}`, faction: plan.options.faction, prompt: `Host Pressure changed access. Choose new legal ${march ? "March destinations" : "Rally locations"}. The roll and cost remain (${decisionRef}).`, answers: [], ruleRef: decisionRef, resume: {kind: "operation" as const, op: plan.op.id, box: String(command["box"])}};
      ctx.write(s => ({...s, pending, turn: {...s.turn, phase: "decision"}}));
      ctx.log("DecisionOpened", {decisionId: pending.id, prompt: pending.prompt}, decisionRef);
      return;
    }
    plan.op.execute(ctx, plan.part, plan.options);
    runSa("after");
  },
};
