// Plan form metadata per action (11 P2-15 risk: one generic form driven by handler metadata).
// Fields describe each location's `perLocation` choices in the ActionPlan (05 s3.1).

export interface FormField {
  readonly key: string;
  readonly label: string;
  readonly kind: "select" | "number" | "moves";
  readonly options?: readonly string[];
}

export interface ActionForm {
  readonly id: string;
  readonly label: string;
  readonly cost: string;
  readonly fields: readonly FormField[];
  /** Sub-action this Op may carry in one location (Civic Action, Agitate). */
  readonly subAction: string | null;
  /** Timing an SA must use (DEC-16), when fixed. */
  readonly timing?: "before" | "after";
}

const moves: FormField = { key: "moves", label: "Moves (from:count, ...)", kind: "moves" };

export const actionForms: readonly ActionForm[] = [
  { id: "state.train", label: "Train", cost: "2 per space", subAction: "civicAction", fields: [{ key: "option", label: "Option", kind: "select", options: ["place", "guards", "base"] }, { key: "troops", label: "Troops", kind: "number" }, { key: "police", label: "Police", kind: "number" }, { key: "count", label: "Guards", kind: "number" }] },
  { id: "state.garrison", label: "Garrison", cost: "2 total", subAction: null, fields: [moves] },
  { id: "state.sweep", label: "Sweep", cost: "2 per space", subAction: null, fields: [moves] },
  { id: "state.assault", label: "Assault", cost: "2 per space", subAction: null, fields: [] },
  { id: "pkk.rally", label: "Rally", cost: "1 per location", subAction: "agitate", fields: [{ key: "option", label: "Option", kind: "select", options: ["place", "base", "grow", "flip"] }, { key: "count", label: "Grow count", kind: "number" }] },
  { id: "pkk.march", label: "March", cost: "1 per destination", subAction: null, fields: [moves] },
  { id: "pkk.attack", label: "Attack", cost: "1 per space", subAction: null, fields: [{ key: "prefer", label: "Remove first", kind: "select", options: ["troops", "police"] }] },
  { id: "pkk.coerce", label: "Coerce", cost: "1 per space, 2 at Pop 3+", subAction: null, fields: [] },
  { id: "state.air-mobility", label: "Air Mobility", cost: "0", subAction: null, fields: [moves] },
  { id: "pkk.ambush", label: "Ambush", cost: "0", subAction: null, fields: [], timing: "before" },
  { id: "pkk.extort", label: "Extort", cost: "0", subAction: null, fields: [] },
  { id: "pkk.strike-collaborators", label: "Strike Collaborators", cost: "1 per space", subAction: null, fields: [{ key: "guards", label: "Guards", kind: "number" }], timing: "before" },
];
