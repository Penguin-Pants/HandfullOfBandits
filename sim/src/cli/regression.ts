// Regression cases from notes (07 s9; 09 s7; 11 P4-06). A case is the source session's package hash,
// scenario, seed, options, the commands from session start to the note's action and expectations
// taken from the stored run. `runCase` replays the commands under a target package and reports
// `same`, `changed` (with the per-round metric diff, 09 s7.2 item 3), `incompatible` (a missing
// scenario or option, or the first rejected command; never forced) or `error`.
// `compareRounds` is the per-round metric diff of two branch paths (09 s6 "compare two branches").
import { existsSync } from "node:fs";
import { canonicalJson } from "../engine/core/canonical.ts";
import type { AnyCommand, GameState, JsonValue, LogEntry, Ruleset, Violation } from "../engine/core/types.ts";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { createEngine, type Engine } from "../engine/index.ts";
import { loadPackage, readPackageDir, withSessionOptions } from "../package/load.ts";
import type { Db } from "../store/migrate.ts";
import { openStore } from "../store/migrate.ts";
import { pathTo, type ActionRow } from "../store/repos/actions.ts";
import { getAnnotation } from "../store/repos/annotations.ts";
import { listCommands } from "../store/repos/commands.ts";
import { logEntriesOf } from "../store/repos/log-entries.ts";
import { getCase, listCases, saveCase, saveRun, type RunOutcome } from "../store/repos/regression.ts";
import { getSession } from "../store/repos/sessions.ts";
import { loadState } from "../store/repos/states.ts";
import { formatIssue } from "./validate.ts";

/** 09 s7.1 expectation types. A state fact and a log fact hold after the case's last action. */
export type Expectation =
  | { readonly type: "stateFact"; readonly path: string; readonly value: JsonValue }
  | { readonly type: "metric"; readonly round: number; readonly key: string; readonly value: JsonValue }
  | { readonly type: "logFact"; readonly kind: string; readonly ruleRef: string | null; readonly data: JsonValue }
  | { readonly type: "outcome"; readonly winner: string | null; readonly labels: readonly string[] };

export interface CaseStep {
  readonly actionId: string;
  readonly commands: readonly { readonly commandId: string; readonly command: AnyCommand }[];
}

export interface CaseInputs {
  readonly scenarioId: string;
  readonly seed: number;
  readonly options: Readonly<Record<string, string | number>>;
  readonly steps: readonly CaseStep[];
  readonly expectations: readonly Expectation[];
  /** `deck` of the original start state, to flag a changed card order (09 s7.2 item 1). */
  readonly deck: JsonValue;
}

export interface Mismatch {
  readonly expected: Expectation;
  readonly actual: JsonValue;
}

export interface RunReport {
  readonly outcome: RunOutcome;
  /** Missing scenario or option, or the first rejected command with its violations. */
  readonly firstFailure: { readonly commandId: string | null; readonly reason: string; readonly violations: readonly Violation[] } | null;
  readonly diff: { readonly deckOrderDiffers: boolean; readonly mismatches: readonly Mismatch[]; readonly extraRounds: readonly number[] };
}

/** State parts a state fact covers: game facts, not bookkeeping (meta, rng, turn, deck). */
const STATE_ROOTS = ["tracks", "flags", "spaces", "pools", "markerPools"] as const;
/** RoundMetrics fields a metric covers: tracks, scores, margins and Harm (09 s7.2 item 3). */
const METRIC_KEYS = ["scores", "margins", "harm", "legitimacy", "europe", "emergencyRule", "postures", "legalSpace", "successor", "closureCase", "ceasefire"] as const;

type Flat = Map<string, JsonValue>;

/** Dotted leaf paths of a value. Arrays are leaves. */
function flatten(value: unknown, prefix: string, out: Flat = new Map()): Flat {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix === "" ? k : `${prefix}.${k}`, out);
  } else out.set(prefix, (value ?? null) as JsonValue);
  return out;
}

const same = (a: unknown, b: unknown): boolean => canonicalJson(a ?? null) === canonicalJson(b ?? null);

function stateFlat(state: GameState): Flat {
  const out: Flat = new Map();
  for (const root of STATE_ROOTS) flatten(state[root], root, out);
  return out;
}

/** Metric leaves per round from RoundMetrics data. A later entry of a round replaces an earlier one. */
function roundFlats(metrics: readonly unknown[]): Map<number, Flat> {
  const rounds = new Map<number, Flat>();
  for (const m of metrics) {
    const d = m as Record<string, unknown>;
    const out: Flat = new Map();
    for (const key of METRIC_KEYS) flatten(d[key], key, out);
    rounds.set(Number(d["round"]), out);
  }
  return rounds;
}

/** Metric expectations for every round in `metrics`. */
export function metricFacts(metrics: readonly unknown[]): Expectation[] {
  return [...roundFlats(metrics)].flatMap(([round, flat]) => [...flat].map(([key, value]): Expectation => ({ type: "metric", round, key, value })));
}

/** Expectations from a stored run: state facts the last action changed, its applied effects, every round's metrics and the result. */
export function expectationsOf(before: GameState, after: GameState, entries: readonly LogEntry[], metrics: readonly unknown[]): Expectation[] {
  const old = stateFlat(before);
  const changed = [...stateFlat(after)].filter(([path, value]) => !same(old.get(path), value));
  return [
    ...changed.map(([path, value]): Expectation => ({ type: "stateFact", path, value })),
    ...entries.filter((e) => e.kind === "EffectApplied").map((e): Expectation => ({ type: "logFact", kind: e.kind, ruleRef: e.ruleRef, data: e.data })),
    ...metricFacts(metrics),
    ...(after.ended === null ? [] : [{ type: "outcome", winner: after.ended.winner, labels: after.ended.labels } as const]),
  ];
}

/** Metric expectations against rounds: mismatches and the rounds the expectations do not name. */
export function checkMetrics(expected: readonly Expectation[], metrics: readonly unknown[]): { mismatches: Mismatch[]; extraRounds: number[] } {
  const rounds = roundFlats(metrics);
  const named = new Set(expected.flatMap((e) => (e.type === "metric" ? [e.round] : [])));
  const mismatches = expected.flatMap((e): Mismatch[] => {
    if (e.type !== "metric") return [];
    const actual = rounds.get(e.round)?.get(e.key) ?? null;
    return same(actual, e.value) ? [] : [{ expected: e, actual }];
  });
  return { mismatches, extraRounds: [...rounds.keys()].filter((r) => !named.has(r)).sort((a, b) => a - b) };
}

/** Replay a case under `ruleset` (09 s7.2). Pure apart from the engine. */
export function runCase(engine: Engine, ruleset: Ruleset, c: CaseInputs): RunReport {
  const noDiff = { deckOrderDiffers: false, mismatches: [], extraRounds: [] };
  const incompatible = (commandId: string | null, reason: string, violations: readonly Violation[] = []): RunReport => ({ outcome: "incompatible", firstFailure: { commandId, reason, violations }, diff: noDiff });
  const scenario = ruleset.scenarios[c.scenarioId];
  if (scenario === undefined) return incompatible(null, `missing scenario ${c.scenarioId}`);
  const missing = Object.keys(c.options).find((o) => !(o in scenario.options));
  if (missing !== undefined) return incompatible(null, `missing option ${missing} in scenario ${c.scenarioId}`);
  try {
    const rules = withSessionOptions(ruleset, c.scenarioId, c.options);
    const start = engine.start(rules, c.scenarioId, c.seed);
    const deckOrderDiffers = !same(start.state.deck, c.deck);
    let state = start.state;
    const metrics: unknown[] = [];
    let last: LogEntry[] = [];
    for (const step of c.steps) {
      last = [];
      for (const { commandId, command } of step.commands) {
        const result = engine.apply(rules, state, command);
        if (!result.ok) return { ...incompatible(commandId, `command ${commandId} is not valid under the target rules`, result.validation.violations), diff: { ...noDiff, deckOrderDiffers } };
        state = result.transition.state;
        last.push(...result.transition.logEntries);
        metrics.push(...result.transition.logEntries.filter((e) => e.kind === "RoundMetrics").map((e) => e.data));
      }
    }
    const facts = stateFlat(state);
    const applied = last.filter((e) => e.kind === "EffectApplied");
    const { mismatches, extraRounds } = checkMetrics(c.expectations, metrics);
    for (const e of c.expectations) {
      if (e.type === "stateFact") {
        const actual = facts.get(e.path) ?? null;
        if (!same(actual, e.value)) mismatches.push({ expected: e, actual });
      } else if (e.type === "logFact") {
        if (!applied.some((x) => x.kind === e.kind && x.ruleRef === e.ruleRef && same(x.data, e.data))) mismatches.push({ expected: e, actual: null });
      } else if (e.type === "outcome") {
        const actual = state.ended === null ? null : { winner: state.ended.winner, labels: [...state.ended.labels] };
        if (!same(actual, { winner: e.winner, labels: e.labels })) mismatches.push({ expected: e, actual });
      }
    }
    return { outcome: mismatches.length === 0 && extraRounds.length === 0 ? "same" : "changed", firstFailure: null, diff: { deckOrderDiffers, mismatches, extraRounds } };
  } catch (e) {
    return { outcome: "error", firstFailure: { commandId: null, reason: e instanceof Error ? e.message : String(e), violations: [] }, diff: noDiff };
  }
}

function stateOf(db: Db, hash: string): GameState {
  const s = loadState(db, hash);
  if (s === null) throw new RangeError(`No stored state ${hash}.`);
  return JSON.parse(s.content) as GameState;
}

/** Stored RoundMetrics data on a path, in order. */
const pathMetrics = (db: Db, path: readonly ActionRow[]): unknown[] => path.flatMap((a) => logEntriesOf(db, a.action_id).filter((e) => e.kind === "RoundMetrics").map((e) => e.data));

/** Steps after setup on a path, each with its stored commands. */
function pathSteps(db: Db, path: readonly ActionRow[]): CaseStep[] {
  return path.slice(1).map((a) => ({ actionId: a.action_id, commands: listCommands(db, a.action_id).map((c) => ({ commandId: c.command_id, command: JSON.parse(c.payload) as AnyCommand })) }));
}

/** Make a case from a note's action (07 s9 items 1 and 2). Throws a RangeError a user can read. */
export function createCase(db: Db, annotationId: string, label: string | null): { caseId: string; expectations: number; commands: number } {
  const note = getAnnotation(db, annotationId);
  if (note === null) throw new RangeError(`No note ${annotationId}.`);
  if (note.action_id === null) throw new RangeError(`Note ${annotationId} links no action (anchor ${note.anchor}).`);
  const session = getSession(db, note.session_id);
  if (session === null) throw new RangeError(`No session ${note.session_id}.`);
  const path = pathTo(db, note.action_id);
  const target = path.at(-1);
  if (target === undefined || target.state_hash_before === null) throw new RangeError(`Note ${annotationId} links the setup action; a case needs an action after setup.`);
  const steps = pathSteps(db, path);
  const commands = steps.flatMap((s) => s.commands);
  const expectations = expectationsOf(stateOf(db, target.state_hash_before), stateOf(db, target.state_hash_after), logEntriesOf(db, target.action_id), pathMetrics(db, path));
  const caseId = saveCase(db, {
    sourceSessionId: session.session_id, sourceActionId: target.action_id, sourceAnnotationId: note.annotation_id, packageHash: session.package_hash,
    seed: session.seed, scenarioId: session.scenario_id, options: session.options,
    commandRange: { first: commands[0]?.commandId ?? null, last: commands.at(-1)?.commandId ?? null },
    expectations, label: label ?? note.text.split("\n")[0]?.slice(0, 80) ?? annotationId,
  });
  return { caseId, expectations: expectations.length, commands: commands.length };
}

/** A stored case's inputs. Commands stop at the stored last command: a pending action may have grown since. */
function caseInputs(db: Db, caseId: string): CaseInputs {
  const c = getCase(db, caseId);
  if (c === null) throw new RangeError(`No case ${caseId}.`);
  const path = pathTo(db, c.source_action_id);
  const { last } = JSON.parse(c.command_range) as { last: string | null };
  const steps = pathSteps(db, path);
  const stop = steps.flatMap((s) => s.commands).findIndex((x) => x.commandId === last) + 1;
  if (stop === 0) throw new RangeError(`Case ${caseId}: command ${String(last)} is not on the path to ${c.source_action_id}.`);
  let before = 0;
  const cut = steps.map((s) => {
    const kept = { ...s, commands: s.commands.slice(0, Math.max(0, stop - before)) };
    before += s.commands.length;
    return kept;
  }).filter((s) => s.commands.length > 0);
  const setup = path[0];
  if (setup === undefined) throw new RangeError(`Case ${caseId} has no setup action.`);
  return {
    scenarioId: c.scenario_id, seed: c.seed, options: JSON.parse(c.options) as Record<string, string | number>, steps: cut,
    expectations: JSON.parse(c.expectations) as Expectation[], deck: stateOf(db, setup.state_hash_after).deck,
  };
}

const show = (v: unknown): string => JSON.stringify(v);

function describe(e: Expectation): string {
  if (e.type === "stateFact") return `state ${e.path}`;
  if (e.type === "metric") return `round ${String(e.round)} ${e.key}`;
  if (e.type === "logFact") return `log ${e.kind}${e.ruleRef === null ? "" : ` rule ${e.ruleRef}`} ${show(e.data)}`;
  return "outcome";
}

/** Report lines: outcome, first failure, deck flag, then the mismatches (old against new). */
export function reportLines(r: RunReport): string[] {
  const value = (e: Expectation): unknown => (e.type === "outcome" ? { winner: e.winner, labels: e.labels } : e.type === "logFact" ? "present" : e.value);
  return [
    r.outcome,
    ...(r.firstFailure === null ? [] : [`  ${r.firstFailure.reason}`, ...r.firstFailure.violations.map((v) => `  violation ${v.code}: ${v.message}`)]),
    ...(r.diff.deckOrderDiffers ? ["  deck order differs"] : []),
    ...r.diff.mismatches.map((m) => `  ~ ${describe(m.expected)}: ${show(value(m.expected))} to ${m.expected.type === "logFact" ? "absent" : show(m.actual)}`),
    ...(r.diff.extraRounds.length === 0 ? [] : [`  + rounds ${r.diff.extraRounds.join(", ")} (not in the old run)`]),
  ];
}

type Result = { exitCode: number; lines: string[] };

function withStore(dbFile: string, work: (db: Db) => Result): Result {
  if (!existsSync(dbFile)) return { exitCode: 1, lines: [`error: no store at ${dbFile}`] };
  const db = openStore(dbFile);
  try {
    return work(db);
  } catch (e) {
    return { exitCode: 1, lines: [`error: ${e instanceof Error ? e.message : String(e)}`] };
  } finally {
    db.close();
  }
}

/** `sim regression create <annotationId> [--label text]`. */
export function createCommand(annotationId: string, dbFile: string, label: string | null): Result {
  return withStore(dbFile, (db) => {
    const made = createCase(db, annotationId, label);
    return { exitCode: 0, lines: [`case ${made.caseId}: ${String(made.commands)} commands, ${String(made.expectations)} expectations`] };
  });
}

/** `sim regression run <caseId> --package <dir>`: run, store the run row, print the report. Exit 0 only for `same`. */
export function runCommand(caseId: string, packageDir: string, dbFile: string): Result {
  return withStore(dbFile, (db) => {
    const loaded = loadPackage(readPackageDir(packageDir));
    if (!loaded.ok) return { exitCode: 1, lines: [`error: ${packageDir} does not load`, ...loaded.issues.filter((i) => i.level === "error").map(formatIssue)] };
    const report = runCase(createEngine(coinHandlers), loaded.ruleset, caseInputs(db, caseId));
    const runId = saveRun(db, { caseId, targetPackageHash: loaded.hash, outcome: report.outcome, firstFailure: report.firstFailure, diff: report.diff });
    return { exitCode: report.outcome === "same" ? 0 : 1, lines: [`run ${runId} of case ${caseId} against ${loaded.hash}`, ...reportLines(report)] };
  });
}

/** `sim regression list`: cases with their latest outcome. */
export function listCommand(dbFile: string): Result {
  return withStore(dbFile, (db) => {
    const cases = listCases(db);
    return { exitCode: 0, lines: cases.length === 0 ? ["no cases"] : cases.map((c) => `${c.case_id} ${c.last_outcome ?? "not run"} ${c.source_action_id} ${c.label}`) };
  });
}

/** Per-round metric diff of the paths to two actions, for example two branch heads (09 s6, s7.2 item 3). */
export function compareRounds(db: Db, oldActionId: string, newActionId: string): { mismatches: Mismatch[]; extraRounds: number[] } {
  return checkMetrics(metricFacts(pathMetrics(db, pathTo(db, oldActionId))), pathMetrics(db, pathTo(db, newActionId)));
}

/** `sim regression compare <actionId> <actionId>`. */
export function compareCommand(oldActionId: string, newActionId: string, dbFile: string): Result {
  return withStore(dbFile, (db) => {
    const d = compareRounds(db, oldActionId, newActionId);
    const lines = reportLines({ outcome: d.mismatches.length === 0 && d.extraRounds.length === 0 ? "same" : "changed", firstFailure: null, diff: { deckOrderDiffers: false, ...d } });
    return { exitCode: 0, lines };
  });
}
