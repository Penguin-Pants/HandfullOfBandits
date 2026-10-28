// Annotation context builder (07 s4). Pure: every value comes from the input, so a note never
// changes game state (T-ANN-04). Context stores values, not full state; the state hash reaches
// the full state (07 s4.3). Field names follow 07 s4.1 and s4.2.
import type { FaceCounts, JsonObject, JsonValue, LogEntry, LogKind } from "../engine/core/types.ts";
import type { ActionContextInput, AnnotationContext, ContextInput, ViewedState } from "./types.ts";

function own<T>(record: Readonly<Record<string, T>> | undefined, key: string): T | undefined {
  return record !== undefined && Object.hasOwn(record, key) ? record[key] : undefined;
}

function entriesOf(entries: readonly LogEntry[], kind: LogKind): JsonObject[] {
  return entries.filter((e) => e.kind === kind).map((e) => ({ rule_ref: e.ruleRef, data: e.data }));
}

function unique(values: readonly (string | null)[]): string[] {
  return [...new Set(values.filter((v): v is string => v !== null))];
}

/** Changed face counts of one piece or marker map, as rows. */
function faceChanges(space: string, before: Readonly<Record<string, FaceCounts>>, after: Readonly<Record<string, FaceCounts>>, typeKey: string, faceKey: string): JsonObject[] {
  return Object.entries(after).flatMap(([type, faces]) =>
    Object.entries(faces).flatMap(([face, n]) => {
      const was = own(own(before, type), face) ?? 0;
      return was === n ? [] : [{ space, [typeKey]: type, [faceKey]: face, before: was, after: n }];
    }),
  );
}

/** Compact diff: tracks, levels, pieces, markers and Control (07 s4.2 `state_changes`). */
function stateChanges(before: ViewedState, after: ViewedState): JsonObject {
  const tracks = Object.entries(after.state.tracks).filter(([id, v]) => own(before.state.tracks, id) !== v);
  const spaces = Object.entries(after.state.spaces);
  const levels = spaces.filter(([id, s]) => own(before.state.spaces, id)?.level !== s.level);
  const control = Object.entries(after.derived.control).filter(([id, f]) => (own(before.derived.control, id) ?? null) !== f);
  return {
    tracks: Object.fromEntries(tracks.map(([id, v]) => [id, { before: own(before.state.tracks, id) ?? null, after: v }])),
    levels: Object.fromEntries(levels.map(([id, s]) => [id, { before: own(before.state.spaces, id)?.level ?? null, after: s.level }])),
    pieces: spaces.flatMap(([id, s]) => faceChanges(id, own(before.state.spaces, id)?.pieces ?? {}, s.pieces, "piece", "face")),
    markers: spaces.flatMap(([id, s]) => faceChanges(id, own(before.state.spaces, id)?.markers ?? {}, s.markers, "marker", "side")),
    control: Object.fromEntries(control.map(([id, f]) => [id, { before: own(before.derived.control, id) ?? null, after: f }])),
  };
}

/** Op and SA IDs of an ActionPlan command (05 s3.1), else null. */
function planIds(command: ActionContextInput["command"]): { op: string | null; sa: string | null } {
  const plan = command["plan"] as { op?: unknown; sa?: { action?: unknown } | null } | undefined;
  return {
    op: typeof plan?.op === "string" ? plan.op : null,
    sa: typeof plan?.sa?.action === "string" ? plan.sa.action : null,
  };
}

function actionFields(input: ContextInput, action: ActionContextInput): JsonObject {
  const ids = planIds(action.command);
  const ruleRefs = unique(action.entries.map((e) => e.ruleRef));
  return {
    action_id: action.actionId,
    action_kind: action.kind,
    op_id: ids.op,
    sa_id: ids.sa,
    plan: action.command as JsonValue,
    preconditions: entriesOf(action.entries, "ValidationPassed"),
    costs: entriesOf(action.entries, "CostPaid"),
    validation: { violations: action.validation.violations as unknown as JsonValue, warnings: action.validation.warnings as unknown as JsonValue },
    state_changes: action.before !== null && action.after !== null ? stateChanges(action.before, action.after) : null,
    calculations: entriesOf(action.entries, "DieRolled"),
    rule_refs: ruleRefs,
    assumption_refs: unique(action.entries.map((e) => e.assumptionRef)),
    rule_sources: Object.fromEntries(ruleRefs.flatMap((ref) => {
      const source = own(input.ruleSources, ref);
      return source === undefined ? [] : [[ref, source]];
    })),
    legal_choices_summary: input.legalChoices,
  };
}

export function buildContext(input: ContextInput): AnnotationContext {
  const { state, stateHash, derived } = input.head;
  const { ruleset } = input;
  const resources = ruleset.factions.flatMap((f): [string, JsonValue][] =>
    f.resourcesTrack === null ? [] : [[f.id, own(state.tracks, f.resourcesTrack) ?? null]],
  );
  return {
    session_id: input.sessionId,
    branch_id: input.branchId,
    package_id: input.packageId,
    version: input.packageVersion,
    ruleset_version: ruleset.rulesetVersion,
    package_hash: ruleset.packageHash,
    scenario_id: state.meta.scenarioId,
    campaign: state.turn.campaign,
    propaganda_round: state.turn.propagandaRound,
    card_index: state.turn.cardIndex,
    phase: state.turn.phase,
    active_faction: input.activeFaction,
    first_eligible: state.initiative.firstEligible,
    second_eligible: state.initiative.secondEligible,
    current_card_id: state.deck.currentCard,
    current_card_title: input.currentCardTitle,
    state_hash: stateHash,
    state_seq: state.meta.stateSeq,
    last_action_id: input.lastActionId,
    resources: Object.fromEntries(resources),
    tracks: state.tracks,
    scores: derived.scores,
    thresholds: own(ruleset.scenarios, state.meta.scenarioId)?.thresholds ?? {},
    margins: derived.margins,
    harm_counts: derived.harm,
    ui_focus: input.focus.panel,
    selected_space: input.focus.selectedSpace,
    selected_pieces: input.focus.selectedPieces,
    hovered_action_id: input.focus.hoveredActionId,
    app_version: input.appVersion,
    ...(input.action === null ? {} : actionFields(input, input.action)),
  };
}
