// Event runner (research 05 s5; 04 s5; 11 P2-09). Runs a card effect list in order and does as
// much as it can: core primitives skip and log what does not fit (05 s7). Choices come from the
// command's `answers`, consumed in execution order (PA-01, DEC-51). A missing or bad answer stops
// a check run with a violation that carries the question.
import { addModifier } from "../core/modifiers.ts";
import type { Exec } from "../core/exec.ts";
import { SINGLE_FACE } from "../core/state.ts";
import { matches, resolveSpace } from "../core/terms.ts";
import type { CardEffect, CountSpec, Effect, FactionId, JsonObject, JsonValue, Question, Violation } from "../core/types.ts";
import { shiftHost } from "./ops/sa/host-actions.ts";
import { HOST_OF, PIECE, FACE } from "./ops/ids.ts";
import { count } from "./ops/common.ts";
import { control } from "./derive.ts";
import type { ActionOptions, ActionPart } from "./ops/action.ts";
import { asList, asObject, asString } from "./ops/plan.ts";
import { actionHandlers } from "./ops/registry.ts";

/** Stops a check run at its first missing or bad answer. */
export class AnswerNeeded extends Error {
  readonly violation: Violation;
  constructor(violation: Violation) {
    super(violation.message);
    this.violation = violation;
  }
}

export interface EventRun {
  readonly ctx: Exec;
  readonly faction: FactionId;
  readonly answers: readonly JsonValue[];
  readonly ruleRef: string;
}

interface Cursor {
  next: number;
  selected: string | null;
}

function ask(run: EventRun, code: string, message: string, question?: Question): never {
  throw new AnswerNeeded({ code, message, ruleRef: run.ruleRef, location: null, ...(question === undefined ? {} : { question }) });
}

function answer(run: EventRun, cursor: Cursor, question: Question): JsonValue {
  const value = run.answers[cursor.next];
  if (value === undefined) ask(run, "needsAnswer", question.prompt, question);
  cursor.next++;
  return value;
}

function countOf(run: EventRun, cursor: Cursor, spec: CountSpec, what: string): number {
  if (typeof spec === "number") return spec;
  const value = answer(run, cursor, { kind: "count", prompt: `How many ${what}? (${String(spec.min)} to ${String(spec.max)})`, options: [], min: spec.min, max: spec.max, ...(cursor.selected === null ? {} : { space: cursor.selected }) });
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < spec.min || value > spec.max) ask(run, "badAnswer", `Answer ${String(spec.min)} to ${String(spec.max)} for ${what}.`);
  return value;
}

function space(cursor: Cursor, ref: string): string {
  return resolveSpace({ selected: cursor.selected }, ref);
}

/** Core effect of a card primitive, with counts and spaces resolved. Null: a card-level effect. */
function core(run: EventRun, cursor: Cursor, e: CardEffect): Effect | null {
  const src = { ruleRef: run.ruleRef, assumptionRef: null };
  switch (e.type) {
    case "placePieces":
      return { ...src, type: e.type, piece: e.piece, count: countOf(run, cursor, e.count, e.piece), space: space(cursor, e.space), state: e.state };
    case "removePieces":
      return { ...src, type: e.type, piece: e.piece, state: e.state, count: countOf(run, cursor, e.count, e.piece), space: space(cursor, e.space), to: e.to };
    case "movePieces":
      return { ...src, type: e.type, piece: e.piece, state: e.state, toState: e.toState, count: countOf(run, cursor, e.count, e.piece), from: space(cursor, e.from), to: space(cursor, e.to) };
    case "setPieceState":
      return { ...src, type: e.type, piece: e.piece, space: space(cursor, e.space), from: e.from, to: e.to, count: e.count };
    case "transferPool":
    case "adjustTrack":
    case "setTrack":
    case "stepOrdinal":
    case "setFlag":
      return { ...src, ...e };
    case "placeMarker":
    case "removeMarker":
    case "flipMarker": {
      const sides = run.ctx.ruleset.markers.find((m) => m.id === e.marker)?.sides ?? [];
      return { ...src, type: e.type, marker: e.marker, space: space(cursor, e.space), side: e.side ?? sides[0] ?? SINGLE_FACE };
    }
    case "shiftLevel":
      return { ...src, type: e.type, space: space(cursor, e.space), direction: e.direction, steps: e.steps };
    default:
      return null;
  }
}

function runList(run: EventRun, cursor: Cursor, effects: readonly CardEffect[]): void {
  for (const e of effects) runOne(run, cursor, e);
}

function runOne(run: EventRun, cursor: Cursor, e: CardEffect): void {
  const { ctx } = run;
  const primitive = core(run, cursor, e);
  if (primitive !== null) {
    const box = "track" in primitive ? Object.keys(HOST_OF).find(id => HOST_OF[id] === primitive.track) : undefined;
    if (box !== undefined && primitive.type === "stepOrdinal") shiftHost(ctx, box, primitive.direction === "next" ? primitive.steps : -primitive.steps, run.ruleRef);
    else ctx.apply(primitive);
    return;
  }
  const terms = { ruleset: ctx.ruleset, state: ctx.state, control: control(ctx.ruleset, ctx.state), selected: cursor.selected };
  switch (e.type) {
    case "choice": {
      const labels = e.options.map((o) => o.label);
      const value = answer(run, cursor, { kind: "option", prompt: `Choose: ${labels.join(" or ")}`, options: labels, min: 1, max: 1 });
      const index = typeof value === "number" ? value : labels.indexOf(asString(value) ?? "");
      const picked = e.options[index];
      if (picked === undefined) ask(run, "badAnswer", `Answer one of: ${labels.join(", ")}.`);
      ctx.log("ChoiceMade", { choice: picked.label, faction: run.faction }, run.ruleRef, "PA-01");
      runList(run, cursor, picked.effects);
      return;
    }
    case "conditional": {
      // Game terms ignore the space; a space term reads the current pick, else the first space.
      const at = cursor.selected ?? ctx.ruleset.spaces[0]?.id ?? "";
      runList(run, cursor, matches(terms, at, e.if) ? e.then : e.else);
      return;
    }
    case "forEachSpace": {
      const open = ctx.ruleset.spaces.filter((s) => matches(terms, s.id, e.where)).map((s) => s.id);
      const min = Math.min(e.min, open.length);
      const max = Math.min(e.max, open.length);
      let picks = open;
      if (e.all !== true) {
        const value = answer(run, cursor, { kind: "spaces", prompt: `Pick ${String(min)} to ${String(max)} spaces`, options: open, min, max });
        picks = asList(value).map(String);
        if (!Array.isArray(value) || picks.length < min || picks.length > max || new Set(picks).size !== picks.length || !picks.every((p) => open.includes(p))) {
          ask(run, "badAnswer", `Pick ${String(min)} to ${String(max)} different spaces from: ${open.join(", ") || "none"}.`);
        }
        ctx.log("ChoiceMade", { spaces: picks, faction: run.faction }, run.ruleRef, "PA-01");
      }
      const outer = cursor.selected;
      for (const pick of picks) {
        cursor.selected = pick;
        runList(run, cursor, e.effects);
      }
      cursor.selected = outer;
      return;
    }
    case "forEachPiece": {
      const inventory = Object.fromEntries(ctx.ruleset.spaces.filter(s => matches(terms, s.id, e.where)).map(s => [s.id, count(ctx.state, s.id, e.piece, e.state)]));
      const max = Math.min(e.max, Object.values(inventory).reduce((a, n) => a + n, 0));
      const n = countOf(run, cursor, {min: Math.min(e.min, max), max}, e.piece);
      const outer = cursor.selected;
      for (let i = 0; i < n; i++) {
        const options = Object.keys(inventory).filter(id => (inventory[id] ?? 0) > 0);
        const value = answer(run, cursor, {kind: "spaces", prompt: `Choose one ${e.piece} (${String(i + 1)} of ${String(n)})`, options, min: 1, max: 1});
        const picks = asList(value);
        const id = picks[0];
        if (!Array.isArray(value) || picks.length !== 1 || typeof id !== "string" || !options.includes(id)) ask(run, "badAnswer", "Choose one listed piece location.");
        inventory[id] = (inventory[id] ?? 0) - 1;
        cursor.selected = id;
        runList(run, cursor, e.effects);
      }
      cursor.selected = outer;
      return;
    }
    case "addModifier":
      addModifier(ctx, {id: e.id, sourceCard: ctx.state.deck.currentCard ?? "", duration: e.duration, params: e.params});
      return;
    case "freeAction":
      freeAction(run, cursor, e.action, e.constraints);
      return;
    default:
      return;
  }
}

/** A free Op or SA (05 s5 item 4): no Resources cost, no eligibility change. Answer: its plan, or null to skip. */
function freeAction(run: EventRun, cursor: Cursor, action: string, constraints: JsonObject): void {
  const { ctx } = run;
  const handler = actionHandlers[action];
  if (handler === undefined) ask(run, "unknownAction", `Unknown free action "${action}".`);
  const saId = asString(constraints["sa"]);
  const value = answer(run, cursor, { kind: "plan", prompt: `Plan the free ${action} (or null to skip)`, options: [], min: 0, max: 1, action, ...(saId === null ? {} : { sa: saId }) });
  if (value === null) {
    ctx.log("EffectSkipped", { effect: "freeAction", action, reason: "declined" }, run.ruleRef);
    return;
  }
  const plan = asObject(value);
  const part = plan === null ? null : readPart(plan);
  if (plan === null || part === null) ask(run, "badAnswer", `The free ${action} plan is not well formed.`);
  const saPlan = asObject(plan["sa"]);
  const saPart = saPlan === null ? null : readPart(saPlan);
  for (const p of [part, saPart]) {
    if (p !== null && new Set(p.locations).size !== p.locations.length) ask(run, "badAnswer", "Select each location of a free action once.");
  }
  const allowed = asList(constraints["spaces"]);
  const terrain = asList(constraints["terrain"]);
  if (part.locations.length === 0 || (typeof constraints["maxLocations"] === "number" && part.locations.length > constraints["maxLocations"]) || part.locations.some(id => (allowed.length > 0 && !allowed.includes(id)) || (terrain.length > 0 && !terrain.includes(ctx.ruleset.spaces.find(s => s.id === id)?.terrain ?? "")) || (constraints["undergroundAndTroops"] === true && (count(ctx.state, id, PIECE.guerrilla, FACE.underground) === 0 || count(ctx.state, id, PIECE.troops) === 0)))) ask(run, "eventConstraint", "The free action does not meet the card’s location limits.");
  const options: ActionOptions = { faction: handler.faction, limited: false, free: true, constraints, op: null, sa: saId, opLocations: [], saLocations: saPart?.locations ?? [], subActions: [] };
  const sa = saId === null ? undefined : actionHandlers[saId];
  if (sa !== undefined) {
    const saOptions: ActionOptions = { ...options, op: action, sa: null, opLocations: part.locations, saLocations: [] };
    const found = sa.check(ctx.ruleset, ctx.state, saPart ?? { locations: [], perLocation: {} }, saOptions);
    if (found.length > 0) ask(run, found[0]?.code ?? "badAnswer", found.map((v) => v.message).join(" "));
    sa.execute(ctx, saPart ?? { locations: [], perLocation: {} }, saOptions);
  }
  const found = handler.check(ctx.ruleset, ctx.state, part, options);
  if (found.length > 0) ask(run, found[0]?.code ?? "badAnswer", found.map((v) => v.message).join(" "));
  ctx.log("ChoiceMade", { freeAction: action, locations: [...part.locations] }, run.ruleRef);
  handler.execute(ctx, part, options);
}

function readPart(o: JsonObject): ActionPart | null {
  const locations = asList(o["locations"]);
  const per = o["perLocation"] === undefined ? {} : asObject(o["perLocation"]);
  if (!locations.every((l) => typeof l === "string") || per === null) return null;
  return { locations: locations.filter((l) => typeof l === "string"), perLocation: per as Readonly<Record<string, JsonObject>> };
}

/** Run an effect list. Throws AnswerNeeded at a missing or bad answer. */
export function runEffects(run: EventRun, effects: readonly CardEffect[]): void {
  runList(run, { next: 0, selected: null }, effects);
}
