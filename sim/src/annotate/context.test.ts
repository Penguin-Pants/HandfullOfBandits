import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { adjustTrackDebug } from "../../test/debug-command.ts";
import { derive } from "../engine/coin/derive.ts";
import { canonicalHash } from "../engine/core/canonical.ts";
import type { GameState, LogEntry, ValidationResult } from "../engine/core/types.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, readPackageDir } from "../package/load.ts";
import { buildContext } from "./context.ts";
import type { ActionContextInput, ContextInput, ViewedState } from "./types.ts";

// P1-12: T-ANN-03 and T-ANN-04 on the P1-10 transition (tiny package).
const loaded = loadPackage(readPackageDir(fileURLToPath(new URL("../../test/packages/tiny", import.meta.url))));
if (!loaded.ok) throw new Error(JSON.stringify(loaded.issues));
const ruleset = loaded.ruleset;
const engine = createEngine({ AdjustTrackDebug: adjustTrackDebug });
const command = { type: "AdjustTrackDebug", track: "cash.blue", delta: 2 };
const start = engine.start(ruleset, "start", 9);
const result = engine.apply(ruleset, start.state, command);
if (!result.ok) throw new Error("debug command must apply");
const { transition, validation } = result;

const viewed = (state: GameState): ViewedState => ({ state, stateHash: canonicalHash(state), derived: derive(ruleset, state) });
const before = viewed(start.state);
const after = viewed(transition.state);

// 07 s4.1 and s4.2 field names. `annotation_id` and `created_at` are annotation row columns (DEC-46).
const ALWAYS = [
  "session_id", "branch_id", "package_id", "version", "ruleset_version", "package_hash", "scenario_id", "campaign",
  "propaganda_round", "card_index", "phase", "active_faction", "first_eligible", "second_eligible", "current_card_id",
  "current_card_title", "state_hash", "state_seq", "last_action_id", "resources", "tracks", "scores", "thresholds",
  "margins", "harm_counts", "ui_focus", "selected_space", "selected_pieces", "hovered_action_id", "app_version",
];
const FOR_ACTIONS = [
  "action_id", "action_kind", "op_id", "sa_id", "plan", "preconditions", "costs", "validation", "state_changes",
  "calculations", "rule_refs", "assumption_refs", "rule_sources", "legal_choices_summary",
];
// Fields whose source has no value for this transition: no sequence model, deck or plan yet (P2-03 to P2-05).
// Eligibility comes from the sequence model since P2-03.
const NO_SOURCE = ["active_faction", "current_card_id", "current_card_title", "op_id", "sa_id", "legal_choices_summary"];

const executed: ActionContextInput = { actionId: "S1-A2", kind: "advance", command, validation, entries: transition.logEntries, before, after };
const input: ContextInput = {
  ruleset,
  packageId: "tiny",
  packageVersion: "0.1.0",
  sessionId: "S1",
  branchId: "B1",
  appVersion: "0.0.0",
  head: after,
  lastActionId: "S1-A2",
  activeFaction: null,
  currentCardTitle: null,
  focus: { panel: "board", selectedSpace: "farm", selectedPieces: ["soldier"], hoveredActionId: "train" },
  action: executed,
  legalChoices: null,
  ruleSources: { "debug.adjustTrack": "11 P1-10", "other.rule": "unused" },
};

describe("buildContext for an executed action", () => {
  const ctx = buildContext(input);

  it("has every 07 s4.1 and s4.2 field (T-ANN-03)", () => {
    expect(Object.keys(ctx).sort()).toEqual([...ALWAYS, ...FOR_ACTIONS].sort());
  });

  it("fills every field whose source has a value (T-ANN-03)", () => {
    const nulls = Object.entries(ctx).filter(([, v]) => v === null).map(([k]) => k);
    expect(nulls.sort()).toEqual([...NO_SOURCE].sort());
  });

  it("takes session, package, turn and head values from their sources", () => {
    expect(ctx).toMatchObject({
      session_id: "S1", branch_id: "B1", package_id: "tiny", version: "0.1.0", ruleset_version: "R1", package_hash: loaded.hash,
      scenario_id: "start", campaign: "C1", propaganda_round: 0, card_index: 0, phase: "setup",
      state_hash: transition.stateHash, state_seq: 1, last_action_id: "S1-A2", app_version: "0.0.0",
      ui_focus: "board", selected_space: "farm", selected_pieces: ["soldier"], hovered_action_id: "train",
    });
  });

  it("reads Resources per faction, all tracks and the derived view", () => {
    expect(ctx["resources"]).toEqual({ blue: 7, red: 3 });
    expect(ctx["tracks"]).toEqual({ "cash.blue": 7, "cash.red": 3, border: "open", standing: 0 });
    expect(ctx["scores"]).toEqual({ blue: 2, red: 1 });
    expect(ctx["thresholds"]).toEqual({ blue: 10, red: 8 });
    expect(ctx["margins"]).toEqual({ blue: -8, red: -7 });
    expect(ctx["harm_counts"]).toEqual({ blue: 0, red: 0 });
  });

  it("records the action, its plan, checks, refs and a compact state diff", () => {
    expect(ctx).toMatchObject({
      action_id: "S1-A2",
      action_kind: "advance",
      plan: command,
      preconditions: [{ rule_ref: "debug.adjustTrack", data: { command: "AdjustTrackDebug" } }],
      costs: [],
      calculations: [],
      validation: { violations: [], warnings: [] },
      rule_refs: ["debug.adjustTrack"],
      assumption_refs: [],
      rule_sources: { "debug.adjustTrack": "11 P1-10" },
      state_changes: { tracks: { "cash.blue": { before: 5, after: 7 } }, levels: {}, pieces: [], markers: [], control: {} },
    });
  });

  it("stays under 8 KB (07 s4.3)", () => {
    expect(Buffer.byteLength(JSON.stringify(ctx), "utf8")).toBeLessThan(8192);
  });

  it("does not change its input (T-ANN-04 engine part)", () => {
    const copy = structuredClone(input.head.state);
    buildContext(input);
    expect(input.head.state).toEqual(copy);
    expect(canonicalHash(input.head.state)).toBe(transition.stateHash);
  });
});

describe("buildContext diffs", () => {
  it("lists piece, level, marker and Control changes", () => {
    const s = start.state;
    const farm = s.spaces["farm"];
    if (farm === undefined) throw new Error("farm");
    const changed: GameState = {
      ...s,
      spaces: {
        ...s.spaces,
        farm: { level: 1, pieces: { ...farm.pieces, soldier: { default: 3 } }, markers: { ...farm.markers, mark: { new: 0, old: 1 } } },
      },
    };
    const ctx = buildContext({ ...input, head: viewed(changed), action: { ...executed, entries: [], before, after: viewed(changed) } });
    expect(ctx["state_changes"]).toEqual({
      tracks: {},
      levels: { farm: { before: 0, after: 1 } },
      pieces: [{ space: "farm", piece: "soldier", face: "default", before: 1, after: 3 }],
      markers: [{ space: "farm", marker: "mark", side: "old", before: 0, after: 1 }],
      control: { farm: { before: null, after: "blue" } },
    });
  });

  it("collects costs, rolls and PA refs from the entries", () => {
    const entries: LogEntry[] = [
      { kind: "CostPaid", stateSeq: 1, ruleRef: "op.train", assumptionRef: null, data: { track: "cash.blue", amount: 1 } },
      { kind: "DieRolled", stateSeq: 1, ruleRef: "op.attack", assumptionRef: "PA-06", data: { raw: 4, result: 4 } },
    ];
    const ctx = buildContext({ ...input, action: { ...executed, entries } });
    expect(ctx["costs"]).toEqual([{ rule_ref: "op.train", data: { track: "cash.blue", amount: 1 } }]);
    expect(ctx["calculations"]).toEqual([{ rule_ref: "op.attack", data: { raw: 4, result: 4 } }]);
    expect(ctx["rule_refs"]).toEqual(["op.train", "op.attack"]);
    expect(ctx["assumption_refs"]).toEqual(["PA-06"]);
  });
});

describe("buildContext for other anchors", () => {
  it("keeps a proposed plan, its violations, op, SA and legal choices, with no action or diff", () => {
    const plan = { op: "state.sweep", locations: ["farm"], perLocation: {}, sa: { action: "state.airMobility", locations: [], perLocation: {}, timing: "before" }, subActions: [] };
    const rejected: ValidationResult = { ok: false, violations: [{ code: "cost", message: "Too poor.", ruleRef: "state.sweep", location: "farm" }], warnings: [], preview: { effects: [] } };
    const ctx = buildContext({
      ...input,
      action: { actionId: null, kind: null, command: { type: "ChooseOperation", faction: "blue", box: "op", plan }, validation: rejected, entries: [], before: null, after: null },
      legalChoices: { boxes: ["pass"] },
    });
    expect(ctx).toMatchObject({
      action_id: null, action_kind: null, op_id: "state.sweep", sa_id: "state.airMobility", state_changes: null,
      validation: { violations: rejected.violations, warnings: [] }, legal_choices_summary: { boxes: ["pass"] },
    });
  });

  it("has only the 07 s4.1 fields and the turn values of the head without an action", () => {
    const withEligible = { ...after.state, initiative: { ...after.state.initiative, firstEligible: "red", secondEligible: "blue" } };
    const ctx = buildContext({ ...input, head: viewed(withEligible), action: null });
    expect(Object.keys(ctx).sort()).toEqual([...ALWAYS].sort());
    expect(ctx).toMatchObject({ first_eligible: "red", second_eligible: "blue" });
  });
});
