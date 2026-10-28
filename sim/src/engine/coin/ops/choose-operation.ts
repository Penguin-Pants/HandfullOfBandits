// ChooseOperation (research 05 s2.2 step 3, s3.1; 06 s1): an Op, optionally with one SA, in a box.
import { createExec, PreviewStop, type Exec } from "../../core/exec.ts";
import type { AnyCommand, CommandHandler, GameState, JsonObject, Ruleset, SubAction, Violation } from "../../core/types.ts";
import { BOX, placeCylinder, sequenceViolations } from "../sequence/ct.ts";
import { at, type ActionHandler, type ActionOptions, type ActionPart } from "./action.ts";
import { resources } from "./common.ts";
import { HARMFUL_ACTIONS } from "./ids.ts";
import { asList, asObject, asString } from "./plan.ts";
import { flagHarmful, notePassOnly } from "../stop-rules.ts";
import { actionHandlers } from "./registry.ts";

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

/** Parse and check a ChooseOperation command. Returns violations, or the plan when it is legal. */
function parse(ruleset: Ruleset, state: GameState, command: AnyCommand): { violations: Violation[]; plan: ParsedPlan | null } {
  const fail = (code: string, message: string): { violations: Violation[]; plan: null } => ({ violations: [at(null, code, message, ruleRef)], plan: null });
  const faction = String(command["faction"]);
  const box = String(command["box"]);
  if (!OP_BOXES.includes(box)) return fail("notAnOpBox", `Box "${box}" is not an Operation box. Use ${OP_BOXES.join(", ")}.`);
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
  if (sa !== null && saOptions !== null && sa.timing === "before") {
    if (checkPart(sa.handler, sa.part, saOptions, state)) checkPart(op, opPart, options, simulate(ruleset, state, (ctx) => { sa.handler.execute(ctx, sa.part, saOptions); }));
  } else if (checkPart(op, opPart, options, state) && sa !== null && saOptions !== null) {
    // The board after a rolling Op is known only at execution, so execute checks the SA again.
    checkPart(sa.handler, sa.part, saOptions, simulate(ruleset, state, (ctx) => { op.execute(ctx, opPart, options); }));
  }
  return violations.length > 0 ? { violations, plan: null } : { violations: [], plan: { op, part: opPart, sa, options, saOptions } };
}

export const chooseOperationHandler: CommandHandler = {
  ruleRef,
  check: (ruleset, state, command) => parse(ruleset, state, command).violations,
  execute(ctx: Exec, command) {
    const { plan } = parse(ctx.ruleset, ctx.state, command);
    if (plan === null) throw new Error("ChooseOperation executed without a legal plan");
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
    runSa("before");
    plan.op.execute(ctx, plan.part, plan.options);
    runSa("after");
  },
};
