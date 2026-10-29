// Plan building (05 s3.1), mouse only (UC-5): map clicks pick an action's spaces, a drag from one
// space to another adds a move, and every count is a stepper. `planReducer` holds the map-driven
// part of the plan for the Op (or free action) and its SA; `toCommand` builds the command.
import type { AnyCommand, FormField } from "../api.ts";

export type Values = Readonly<Record<string, string>>;

/** One group of pieces moving (05 s3.1): into the location, or into `to` (Garrison). */
export interface Move {
  readonly from: string;
  readonly to?: string;
  readonly count: number;
  /** Flip state of the moving pieces; absent: any. */
  readonly face?: string;
}

export type Side = "op" | "sa";

export interface SidePlan {
  readonly locations: readonly string[];
  readonly values: Readonly<Record<string, Values>>;
  readonly moves: Readonly<Record<string, readonly Move[]>>;
}

export interface PlanState {
  /** Which part map clicks and drags build. */
  readonly target: Side;
  /** How a drag adds a move to each part; set when the player picks the action. */
  readonly modes: Readonly<Record<Side, DragMode>>;
  readonly op: SidePlan;
  readonly sa: SidePlan;
}

/** How a drag adds a move: into the destination (March, Sweep); into the destination with the
 * origin also among the spaces (Air Mobility, 06 s3.1); or a route ending anywhere, kept under the
 * one activation space (Garrison). Null: the action moves nothing. */
export type DragMode = "into" | "both" | "route" | null;

export type PlanEvent =
  | { readonly type: "click"; readonly id: string; readonly add: boolean }
  | { readonly type: "drag"; readonly from: string; readonly to: string }
  | { readonly type: "modes"; readonly op: DragMode; readonly sa: DragMode }
  | { readonly type: "target"; readonly target: Side }
  | { readonly type: "value"; readonly side: Side; readonly loc: string; readonly key: string; readonly value: string }
  | { readonly type: "move"; readonly side: Side; readonly loc: string; readonly index: number; readonly count: number; readonly face?: string | null }
  | { readonly type: "clear"; readonly side: Side }
  | { readonly type: "reset" };

const EMPTY: SidePlan = { locations: [], values: {}, moves: {} };
export const emptyPlan: PlanState = { target: "op", modes: { op: null, sa: null }, op: EMPTY, sa: EMPTY };

function click(plan: SidePlan, id: string, add: boolean): SidePlan {
  const locations = add ? (plan.locations.includes(id) ? plan.locations.filter((l) => l !== id) : [...plan.locations, id]) : [id];
  return { ...plan, locations };
}

function drag(plan: SidePlan, from: string, to: string, mode: DragMode): SidePlan {
  if (mode === null || from === to) return plan;
  // Garrison: one activation space holds every route; the first drag's destination becomes it.
  const loc = mode === "route" ? (plan.locations[0] ?? to) : to;
  const locations = [...plan.locations];
  for (const id of mode === "both" ? [loc, from] : [loc]) if (!locations.includes(id)) locations.push(id);
  const dest = mode === "route" && to !== loc ? to : undefined;
  const list = plan.moves[loc] ?? [];
  const same = list.findIndex((m) => m.from === from && m.to === dest && m.face === undefined);
  const next = same >= 0 ? list.map((m, i) => (i === same ? { ...m, count: m.count + 1 } : m)) : [...list, { from, ...(dest === undefined ? {} : { to: dest }), count: 1 }];
  return { ...plan, locations, moves: { ...plan.moves, [loc]: next } };
}

export function planReducer(state: PlanState, event: PlanEvent): PlanState {
  switch (event.type) {
    case "click":
      return { ...state, [state.target]: click(state[state.target], event.id, event.add) };
    case "drag":
      return { ...state, [state.target]: drag(state[state.target], event.from, event.to, state.modes[state.target]) };
    case "modes": {
      if (state.modes.op === event.op && state.modes.sa === event.sa) return state;
      // Moves follow the drag mode they were built for (a Garrison route has a `to` that Sweep or
      // March ignore), so a part whose mode changes keeps its spaces but drops its moves.
      const keep = (p: SidePlan, from: DragMode, to: DragMode): SidePlan => (from === to ? p : { ...p, moves: {} });
      return { ...state, modes: { op: event.op, sa: event.sa }, op: keep(state.op, state.modes.op, event.op), sa: keep(state.sa, state.modes.sa, event.sa) };
    }
    case "clear":
      return { ...state, target: "op", [event.side]: EMPTY };
    case "target":
      return { ...state, target: event.target };
    case "value": {
      const plan = state[event.side];
      return { ...state, [event.side]: { ...plan, values: { ...plan.values, [event.loc]: { ...plan.values[event.loc], [event.key]: event.value } } } };
    }
    case "move": {
      const plan = state[event.side];
      const list = (plan.moves[event.loc] ?? []).flatMap((m, i) => {
        if (i !== event.index) return [m];
        if (event.count < 1) return [];
        const face = event.face === undefined ? m.face : (event.face ?? undefined);
        return [{ from: m.from, ...(m.to === undefined ? {} : { to: m.to }), count: event.count, ...(face === undefined ? {} : { face }) }];
      });
      return { ...state, [event.side]: { ...plan, moves: { ...plan.moves, [event.loc]: list } } };
    }
    case "reset":
      return { ...emptyPlan, modes: state.modes };
  }
}

/** The drag mode of an action form: routes for Garrison, both ends for Air Mobility, moves into
 * the space for other movers. */
export function dragMode(fields: readonly FormField[] | undefined, id: string | null): DragMode {
  if (fields === undefined || !fields.some((f) => f.kind === "moves")) return null;
  return id === "state.garrison" ? "route" : id === "state.air-mobility" ? "both" : "into";
}

/** One location's per-location object: numbers, choices and its moves. */
export function perLocation(fields: readonly FormField[], values: Values, moves: readonly Move[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.kind === "moves") {
      if (moves.length > 0) out[f.key] = moves;
      continue;
    }
    const v = values[f.key] ?? f.default;
    if (v === undefined || v === "") continue;
    out[f.key] = f.kind === "number" ? Number(v) : v;
  }
  return out;
}

/** An action part `{locations, perLocation}` from one side of the plan. */
export function partOf(fields: readonly FormField[], plan: SidePlan): { locations: readonly string[]; perLocation: Record<string, unknown> } {
  return { locations: plan.locations, perLocation: Object.fromEntries(plan.locations.map((l) => [l, perLocation(fields, plan.values[l] ?? {}, plan.moves[l])])) };
}

export interface Draft {
  readonly box: string;
  readonly op: string;
  readonly plan: PlanState;
  readonly sa: { readonly action: string; readonly timing: "before" | "after" } | null;
  readonly subAction: { readonly action: string; readonly space: string; readonly params: Readonly<Record<string, number>> } | null;
}

export function toCommand(faction: string, draft: Draft, forms: readonly { id: string; fields: readonly FormField[] }[]): AnyCommand {
  const fields = (id: string): readonly FormField[] => forms.find((f) => f.id === id)?.fields ?? [];
  return {
    type: "ChooseOperation",
    faction,
    box: draft.box,
    plan: {
      op: draft.op,
      ...partOf(fields(draft.op), draft.plan.op),
      sa: draft.sa === null ? null : { action: draft.sa.action, ...partOf(fields(draft.sa.action), draft.plan.sa), timing: draft.sa.timing },
      subActions: draft.subAction === null ? [] : [draft.subAction],
    },
  };
}

/** Arrows to draw on the map for every planned move. */
export function arrowsOf(plan: PlanState): { from: string; to: string; count: number }[] {
  // Only spaces still in the plan: the command leaves out moves of a deselected space.
  return [plan.op, plan.sa].flatMap((p) => p.locations.flatMap((loc) => (p.moves[loc] ?? []).map((m) => ({ from: m.from, to: m.to ?? loc, count: m.count }))));
}

/** Who builds a plan: the Faction panel's Op, or an Event's free action. */
export type Owner = "faction" | "event";

/** One plan per panel, so a free action never changes the Faction panel's draft. Map clicks and
 * drags (events without an owner) build the active plan; a panel's own events name it and make
 * it active. */
export interface Plans {
  readonly active: Owner;
  readonly faction: PlanState;
  readonly event: PlanState;
}

export type PlansEvent =
  | (PlanEvent & { readonly owner?: Owner })
  | { readonly type: "activate"; readonly owner: Owner }
  | { readonly type: "resetAll" };

export const emptyPlans: Plans = { active: "faction", faction: emptyPlan, event: emptyPlan };

export function plansReducer(state: Plans, event: PlansEvent): Plans {
  if (event.type === "activate") {
    // A free action starts empty each time; going back to the Faction panel keeps its draft.
    if (event.owner === "faction") return state.active === "faction" ? state : { ...state, active: "faction" };
    return { ...state, active: "event", event: emptyPlan };
  }
  if (event.type === "resetAll") return { ...emptyPlans, active: state.active, faction: { ...emptyPlan, modes: state.faction.modes } };
  // A panel's own event also hands it the map, so the map builds the plan last worked on.
  const owner = event.owner ?? state.active;
  const next = planReducer(state[owner], event);
  return next === state[owner] && owner === state.active ? state : { ...state, active: owner, [owner]: next };
}
