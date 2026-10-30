// Plan form metadata per action (11 P2-15 risk: one generic form driven by handler metadata).
// Fields describe each location's `perLocation` choices in the ActionPlan (05 s3.1).

export interface FormField {
  readonly key: string;
  readonly label: string;
  readonly kind: "select" | "number" | "moves";
  readonly options?: readonly string[];
  /** Word shown while a number is unset (the handler's default), such as "max". */
  readonly blank?: string;
  /** The handler's value when unset, shown and sent as the starting value. */
  readonly default?: string;
}

export interface ActionForm {
  readonly id: string;
  readonly label: string;
  readonly cost: string;
  /** What the action does, in plain words (research 06). */
  readonly summary: string;
  readonly fields: readonly FormField[];
  /** Sub-action this Op may carry in one location (Civic Action, Agitate), with its spend fields. */
  readonly subAction: { readonly id: string; readonly fields: readonly FormField[] } | null;
  /** Timing an SA must use (DEC-16), when fixed. */
  readonly timing?: "before" | "after";
}

const spend = (key: string, label: string): FormField => ({ key, label, kind: "number" });
const civicAction = { id: "civicAction", fields: [spend("coercion", "Remove Coercion"), spend("reception", "Remove Reception"), spend("stateHarm", "Remove State Harm"), spend("displacement", "Remove Displacement"), spend("shifts", "Shifts")] };
const agitate = { id: "agitate", fields: [spend("coercion", "Remove Coercion"), spend("pkkHarm", "Remove PKK Harm"), spend("shifts", "Shifts")] };
// Moves are built on the map (UC-5): a drag from a space to its destination adds a move.
const moves: FormField = { key: "moves", label: "Moves", kind: "moves" };
const routes: FormField = { key: "moves", label: "Police moves", kind: "moves" };

export const actionForms: readonly ActionForm[] = [
  { id: "state.train", label: "Train", cost: "2 per space", summary: "Pick one option per space. Place up to 3 Troops and Police in a City or a space with a State Base. Or, after Law 3175, in a Mountain or Plain space with State Control and Police, place up to 2 Village Guards. Or, in a Mountain or Plain space with State Control, replace 2 Police with 1 State Base (at most 2 Bases there). In one space you may also pay for Civic Action, which shifts it toward Support (06 s2.1).", subAction: civicAction, fields: [{ key: "option", label: "Option", kind: "select", options: ["place", "guards", "base"] }, { key: "troops", label: "Troops", kind: "number" }, { key: "police", label: "Police", kind: "number" }, { key: "count", label: "Guards", kind: "number" }] },
  { id: "state.garrison", label: "Garrison", cost: "2 total", summary: "Move up to 6 Police between domestic spaces, never into or out of Western Cities. Then, in one space with Police, flip 1 Underground Guerrilla Active per Police and Village Guard there (1 per 2 in Mountains) (06 s2.2).", subAction: null, fields: [routes] },
  { id: "state.sweep", label: "Sweep", cost: "2 per space", summary: "In domestic spaces other than Western Cities: move Troops 1 step from adjacent spaces in, then flip 1 Underground Guerrilla Active per Troop, Police and Village Guard there (1 per 2 in Mountains) (06 s2.3).", subAction: null, fields: [moves] },
  { id: "state.assault", label: "Assault", cost: "2 per space", summary: "In domestic spaces with Troops, remove 1 Active PKK piece per Troop (1 per 2 Troops in Mountains; in a City, Police count as Troops). Active Guerrillas go first. A Base goes only when no Guerrilla, Underground or Active, remains there. Underground Guerrillas are never removed (06 s2.4).", subAction: null, fields: [] },
  { id: "pkk.rally", label: "Rally", cost: "1 per location", summary: "Select domestic spaces without a Displacement marker (a City at Support only in Western Cities), a host box whose posture allows it, or the Europe track (Europe +1; the Ban marker caps it at 3). In each space: place 1 Guerrilla, or replace 2 Guerrillas with 1 Base, or where a Base is, place Guerrillas up to Pop + Bases or flip all Guerrillas Underground. In one space with a PKK Base or PKK Control you may also pay for Agitation, which shifts it toward Opposition (06 s4.1).", subAction: agitate, fields: [{ key: "option", label: "Option", kind: "select", options: ["place", "base", "grow", "flip"] }, { key: "count", label: "Grow count", kind: "number", blank: "max" }] },
  { id: "pkk.march", label: "March", cost: "1 per destination", summary: "Move Guerrillas 1 step from adjacent spaces into each destination, never into Western Cities, Europe or Iran; a host posture can close a box. A group flips Active if the destination is at Support or the group crosses a border, and the group plus the State pieces there is more than 3. Entering a Restricted host box costs 1 more and flips the group Active (06 s4.2).", subAction: null, fields: [moves] },
  { id: "pkk.attack", label: "Attack", cost: "1 per space", summary: "In a space with Guerrillas and State pieces: flip all Guerrillas there Active and roll a die. If the roll is at most the number of Guerrillas, remove up to 2 State pieces. Each Troop removed costs 1 Guerrilla. A roll of 1 also places 1 Guerrilla (06 s4.3).", subAction: null, fields: [{ key: "prefer", label: "Remove first", kind: "select", options: ["troops", "police"] }, { key: "remove", label: "Remove up to", kind: "number", blank: "max" }] },
  { id: "pkk.coerce", label: "Coerce", cost: "1 per space, 2 at Pop 3+", summary: "In a Neutral or Support space with an Underground Guerrilla and no Displacement marker: flip 1 Guerrilla Active and place a Coercion marker; a space at Support also shifts 1 step toward Neutral. A space that already has a Coercion marker gets no shift. Coercion counts as PKK Harm (06 s4.4).", subAction: null, fields: [] },
  { id: "state.air-mobility", label: "Air Mobility", cost: "0", summary: "Move up to 4 Troops among up to 3 domestic spaces; origins count among the 3. Free (06 s3.1).", subAction: null, fields: [moves] },
  { id: "pkk.ambush", label: "Ambush", cost: "0", summary: "In up to 2 Attack spaces, each with an Underground Guerrilla: after the normal Attack (die roll and losses included), remove 1 more State piece in the Attack order (06 s5.1, PA-06).", subAction: null, fields: [], timing: "before" },
  { id: "pkk.extort", label: "Extort", cost: "0", summary: "Gain 1 Resource, and flip 1 Guerrilla Active, in each space with Pop 1 or more, PKK Control, an Underground Guerrilla and no Displacement marker, and in each external box whose host is Host or Tolerant and that has an Underground Guerrilla (06 s5.2).", subAction: null, fields: [] },
  { id: "pkk.strike-collaborators", label: "Strike Collaborators", cost: "1 per space", summary: "Needs Law 3175. In up to 2 spaces with an Underground Guerrilla and a Village Guard: remove up to 2 Guards in total, and in each space flip 1 Guerrilla Active and place PKK Harm. Europe -1. Warning: the PKK Harm marker blocks Agitation shifts in that space until the PKK pays 2 to remove it (06 s5.3, 07 s1.3).", subAction: null, fields: [{ key: "guards", label: "Guards", kind: "number", default: "1" }], timing: "before" },
];
