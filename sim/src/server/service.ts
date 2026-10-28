// Session service (11 P2-11; 03 s4): wraps the engine and the store. The only writer to SQLite.
// A session reloads its rules from the stored package content (04 s10.3, DEC-12). A changed code
// fingerprint forces a replay check on first load (DEC-19): identical resumes, else read-only.
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildContext } from "../annotate/context.ts";
import type { UiFocus } from "../annotate/types.ts";
import { derive } from "../engine/coin/derive.ts";
import { coinHandlers } from "../engine/coin/handlers.ts";
import { activeFaction, legalBoxes } from "../engine/coin/sequence/ct.ts";
import { legalOps } from "../engine/coin/stop-rules.ts";
import { canonicalJson } from "../engine/core/canonical.ts";
import type { AnyCommand, GameState, JsonObject, JsonValue, LogEntry, Ruleset, ValidationResult } from "../engine/core/types.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, packageContent, readPackageDir, type LoadResult } from "../package/load.ts";
import type { PackageData, PackageIssue } from "../package/validate.ts";
import type { Db } from "../store/migrate.ts";
import { commitAction, listActions, type ActionKind, type ActionRow } from "../store/repos/actions.ts";
import { listAnnotations, saveAnnotation, type Anchor, type AnnotationRow } from "../store/repos/annotations.ts";
import { listCategories, type CategoryRow } from "../store/repos/categories.ts";
import { listCommands } from "../store/repos/commands.ts";
import { listEntries, type LogEntryRow } from "../store/repos/log-entries.ts";
import { saveMetrics } from "../store/repos/metrics.ts";
import { loadPackageContent, savePackageVersion } from "../store/repos/packages.ts";
import { createSession, getSession, type SessionRow } from "../store/repos/sessions.ts";
import { loadState } from "../store/repos/states.ts";
import { codeFingerprint } from "./fingerprint.ts";
import { entryText } from "./text.ts";

export const APP_VERSION = "0.1.0";

/** A request the service refuses; the HTTP layer maps `status`. */
export class ServiceError extends Error {
  readonly status: number;
  readonly detail: unknown;
  constructor(status: number, message: string, detail: unknown = null) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export interface PackageSummary {
  readonly dir: string;
  readonly packageId: string | null;
  readonly version: string | null;
  readonly title: string | null;
  readonly hash: string | null;
  readonly ok: boolean;
  readonly issues: readonly PackageIssue[];
  readonly scenarios: readonly { readonly id: string; readonly title: string; readonly blockedBy: readonly string[]; readonly testOnly: boolean }[];
  /** Prototype assumptions listed at session start (02 s3 item 4). */
  readonly assumptions: readonly { readonly id: string; readonly text: string; readonly status: string }[];
  readonly options: Readonly<Record<string, readonly (string | number)[]>>;
}

export interface Head {
  readonly actionId: string;
  readonly stateHash: string;
  readonly state: GameState;
  readonly derived: ReturnType<typeof derive>;
}

const KIND: Readonly<Record<string, ActionKind>> = { ChooseEvent: "cardChoice", ChooseOperation: "cardChoice", Pass: "cardChoice", PlayPivotal: "pivotal", PropagandaChoice: "propagandaChoice", Advance: "advance" };

function summarize(data: PackageData, dir: string, result: LoadResult): PackageSummary {
  const ruleset = result.ok ? result.ruleset : null;
  return {
    dir,
    packageId: data.manifest.packageId,
    version: data.manifest.version,
    title: data.manifest.title,
    hash: result.ok ? result.hash : null,
    ok: result.ok,
    issues: result.issues,
    scenarios: Object.values(data.scenarios).map((s) => ({ id: s.id, title: s.title, blockedBy: ruleset?.scenarios[s.id]?.blockedBy ?? [], testOnly: s.testOnly ?? false })),
    assumptions: (data.assumptions ?? []).map((a) => ({ id: a.id, text: a.text, status: a.status })),
    options: Object.fromEntries(Object.entries(data.manifest.options ?? {}).map(([k, o]) => [k, o.values])),
  };
}

export class SessionService {
  private readonly engine = createEngine(coinHandlers);
  private readonly rulesets = new Map<string, { ruleset: Ruleset; data: PackageData }>();
  private readonly checked = new Set<string>();
  readonly db: Db;
  readonly packagesRoot: string;

  constructor(db: Db, packagesRoot: string) {
    this.db = db;
    this.packagesRoot = packagesRoot;
  }

  /** Package folders `<root>/<packageId>/<version>/` with their validation result. */
  listPackages(): PackageSummary[] {
    const out: PackageSummary[] = [];
    for (const id of readdirSync(this.packagesRoot).sort()) {
      const idDir = join(this.packagesRoot, id);
      if (id.startsWith("_") || !statSync(idDir).isDirectory()) continue;
      for (const version of readdirSync(idDir).sort()) {
        const dir = join(idDir, version);
        if (statSync(dir).isDirectory()) out.push(this.validate(dir));
      }
    }
    return out;
  }

  validate(dir: string): PackageSummary {
    const raw = readPackageDir(dir);
    const result = loadPackage(raw);
    if (!result.ok) return { dir, packageId: null, version: null, title: null, hash: null, ok: false, issues: result.issues, scenarios: [], assumptions: [], options: {} };
    return summarize(result.data, dir, result);
  }

  /** Start a session: store the package content, run `start`, commit the setup action. */
  createSession(input: { dir: string; scenarioId: string; seed: number; name: string; options?: Readonly<Record<string, string | number>> }): { sessionId: string; head: Head } {
    const loaded = loadPackage(readPackageDir(input.dir));
    if (!loaded.ok) throw new ServiceError(422, "The package has errors.", loaded.issues);
    const scenario = loaded.ruleset.scenarios[input.scenarioId];
    if (scenario === undefined) throw new ServiceError(404, `Unknown scenario "${input.scenarioId}".`);
    if (scenario.blockedBy.length > 0) throw new ServiceError(422, `Scenario "${input.scenarioId}" cannot start.`, scenario.blockedBy);
    if (!Number.isSafeInteger(input.seed) || input.seed < 0) throw new ServiceError(400, "The seed must be a safe integer of 0 or more.");
    const m = loaded.data.manifest;
    savePackageVersion(this.db, {
      packageHash: loaded.hash, packageId: m.packageId, version: m.version, rulesetVersion: m.rulesetVersion, schemaVersion: m.schemaVersion,
      parentVersion: m.parent?.version ?? null, changeDescription: m.changeDescription, content: canonicalJson(packageContent(loaded.data)), appVersion: APP_VERSION,
    });
    this.rulesets.set(loaded.hash, { ruleset: loaded.ruleset, data: loaded.data });
    const start = this.engine.start(loaded.ruleset, input.scenarioId, input.seed);
    const turn = start.state.turn;
    const created = createSession(
      this.db,
      {
        name: input.name, packageHash: loaded.hash, scenarioId: input.scenarioId, seed: input.seed, options: input.options ?? scenario.options,
        appVersion: APP_VERSION, codeFingerprint: codeFingerprint(), modules: m.modules, excludedCards: scenario.excludedCards,
      },
      {
        faction: null, cardId: null, campaign: turn.campaign, propagandaRound: turn.propagandaRound, cardIndex: turn.cardIndex, phase: turn.phase, box: null,
        summary: `Setup ${input.scenarioId}, seed ${String(input.seed)}`, stateAfter: this.stateInput(loaded.ruleset, start.state, start.stateHash),
        status: "committed", commands: [], entries: start.logEntries.map((e) => ({ ...e, text: entryText(e) })),
      },
    );
    this.checked.add(created.sessionId);
    return { sessionId: created.sessionId, head: this.head(created.sessionId) };
  }

  listSessions(): SessionRow[] {
    return this.db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC").all() as SessionRow[];
  }

  session(sessionId: string): { session: SessionRow; head: Head; ruleset: Ruleset; data: PackageData } {
    const row = getSession(this.db, sessionId);
    if (row === null) throw new ServiceError(404, `Unknown session "${sessionId}".`);
    const { ruleset, data } = this.rules(row.package_hash);
    if (!this.checked.has(sessionId)) {
      this.checked.add(sessionId);
      if (row.code_fingerprint !== codeFingerprint() && this.replayCheck(row, ruleset) !== null) {
        this.db.prepare("UPDATE sessions SET status = 'readOnly' WHERE session_id = ?").run(sessionId);
      }
    }
    return { session: getSession(this.db, sessionId) ?? row, head: this.head(sessionId), ruleset, data };
  }

  /** Replay the session's committed actions; returns the first differing action ID or null (DEC-19). */
  replayCheck(row: SessionRow, ruleset: Ruleset): string | null {
    const actions = listActions(this.db, row.current_branch_id).filter((a) => a.status !== "undone");
    let state = this.engine.start(ruleset, row.scenario_id, row.seed);
    if (state.stateHash !== actions[0]?.state_hash_after) return actions[0]?.action_id ?? "setup";
    for (const action of actions.slice(1)) {
      for (const c of listCommands(this.db, action.action_id)) {
        const result = this.engine.apply(ruleset, state.state, JSON.parse(c.payload) as AnyCommand);
        if (!result.ok) return action.action_id;
        state = result.transition;
      }
      if (state.stateHash !== action.state_hash_after) return action.action_id;
    }
    return null;
  }

  validateCommand(sessionId: string, command: AnyCommand): ReturnType<typeof this.engine.validate> {
    const { head, ruleset } = this.session(sessionId);
    return this.engine.validate(ruleset, head.state, command);
  }

  /**
   * Apply a command and commit it as one action. `headActionId` must be the current head:
   * a stale writer (a second tab) is rejected (11 P2-11 risk).
   */
  submit(sessionId: string, command: AnyCommand, headActionId: string): { actionId: string; head: Head; entries: readonly LogEntryRow[] } {
    const { session, head, ruleset } = this.session(sessionId);
    if (session.status === "readOnly") throw new ServiceError(409, "The session is read-only: rules code changed since it was played.");
    if (headActionId !== head.actionId) throw new ServiceError(409, "The session moved on. Reload before acting.", { head: head.actionId });
    const result = this.engine.apply(ruleset, head.state, command);
    if (!result.ok) throw new ServiceError(422, "The command is not legal.", result.validation);
    const t = result.transition;
    const turn = head.state.turn;
    const faction = typeof command["faction"] === "string" ? command["faction"] : null;
    const commit = commitAction(this.db, {
      sessionId, kind: KIND[command.type] ?? "advance", faction, cardId: head.state.deck.currentCard, campaign: turn.campaign, propagandaRound: turn.propagandaRound,
      cardIndex: turn.cardIndex, phase: turn.phase, box: typeof command["box"] === "string" ? command["box"] : command.type === "ChooseEvent" ? "event" : command.type === "Pass" ? "pass" : null,
      summary: `${command.type}${faction === null ? "" : ` by ${faction}`}`, stateHashBefore: head.stateHash, stateAfter: this.stateInput(ruleset, t.state, t.stateHash),
      status: "committed", commands: [{ type: command.type, payload: command, validation: result.validation, rngBefore: head.state.rng }],
      entries: t.logEntries.map((e) => ({ ...e, text: entryText(e) })),
    });
    for (const e of t.logEntries.filter((x) => x.kind === "RoundMetrics")) {
      saveMetrics(this.db, { sessionId, branchId: session.current_branch_id, round: Number(e.data["round"]), actionId: commit.actionId, data: e.data });
    }
    if (t.state.ended !== null) this.db.prepare("UPDATE sessions SET status = 'ended', result = ? WHERE session_id = ?").run(JSON.stringify(t.state.ended), sessionId);
    return { actionId: commit.actionId, head: this.head(sessionId), entries: listEntries(this.db, commit.actionId) };
  }

  /** Legal boxes, the open question and sample legal Ops for the active faction (05 s1 item 2). */
  legalChoices(sessionId: string): JsonValue {
    const { head, ruleset } = this.session(sessionId);
    const faction = activeFaction(head.state);
    if (faction === null) {
      const advance = this.engine.validate(ruleset, head.state, { type: "Advance" });
      return { faction: null, phase: head.state.turn.phase, advance: advance.ok, violations: advance.violations.map((v) => ({ ...v })) } as unknown as JsonValue;
    }
    const ops = legalOps(ruleset, head.state, faction, Number.MAX_SAFE_INTEGER).map((c) => {
      const plan = c["plan"] as { op: string; locations: string[] };
      return { op: plan.op, location: plan.locations[0] ?? null };
    });
    return { faction, phase: head.state.turn.phase, boxes: legalBoxes(ruleset, head.state, faction), ops };
  }

  history(sessionId: string): { action: ActionRow; entries: LogEntryRow[]; notes: number }[] {
    const { session } = this.session(sessionId);
    const notes = listAnnotations(this.db, sessionId);
    return listActions(this.db, session.current_branch_id).map((action) => ({ action, entries: listEntries(this.db, action.action_id), notes: notes.filter((n) => n.action_id === action.action_id).length }));
  }

  state(hash: string): { state: GameState; derived: unknown } {
    const stored = loadState(this.db, hash);
    if (stored === null) throw new ServiceError(404, `Unknown state "${hash}".`);
    return { state: JSON.parse(stored.content) as GameState, derived: JSON.parse(stored.derived) as unknown };
  }

  categories(): CategoryRow[] {
    return listCategories(this.db);
  }

  annotations(sessionId: string): AnnotationRow[] {
    this.session(sessionId);
    return listAnnotations(this.db, sessionId);
  }

  /** Save a note with its auto context (07 s4). Never changes game state (T-ANN-04). */
  annotate(sessionId: string, input: { anchor: Anchor; actionId: string | null; text: string; categoryIds: readonly string[]; focus: UiFocus; proposed?: AnyCommand }): string {
    const { session, head, ruleset, data } = this.session(sessionId);
    if (input.text.trim() === "") throw new ServiceError(400, "A note needs text.");
    const view = (state: GameState, stateHash: string) => ({ state, stateHash, derived: derive(ruleset, state) });
    let action = null;
    if (input.actionId !== null) {
      const row = listActions(this.db, session.current_branch_id).find((a) => a.action_id === input.actionId);
      if (row === undefined) throw new ServiceError(404, `Unknown action "${input.actionId}".`);
      const before = row.state_hash_before === null ? null : this.state(row.state_hash_before);
      const after = this.state(row.state_hash_after);
      const [cmd] = listCommands(this.db, row.action_id);
      const command = cmd === undefined ? { type: "Setup" } : (JSON.parse(cmd.payload) as AnyCommand);
      const entries = listEntries(this.db, row.action_id).map((e) => ({ kind: e.kind, stateSeq: e.state_seq, ruleRef: e.rule_ref, assumptionRef: e.assumption_ref, data: JSON.parse(e.data) as JsonObject })) as LogEntry[];
      action = {
        actionId: row.action_id, kind: row.kind, command, entries, validation: cmd === undefined ? { ok: true, violations: [], warnings: [], preview: { effects: [] } } : (JSON.parse(cmd.validation) as ValidationResult),
        before: before === null || row.state_hash_before === null ? null : view(before.state, row.state_hash_before), after: view(after.state, row.state_hash_after),
      };
    } else if (input.proposed !== undefined) {
      action = { actionId: null, kind: null, command: input.proposed, validation: this.engine.validate(ruleset, head.state, input.proposed), entries: [], before: null, after: null };
    }
    const card = head.state.deck.currentCard === null ? null : (ruleset.cards[head.state.deck.currentCard]?.title ?? null);
    const context = buildContext({
      ruleset, packageId: data.manifest.packageId, packageVersion: data.manifest.version, sessionId, branchId: session.current_branch_id, appVersion: APP_VERSION,
      head: view(head.state, head.stateHash), lastActionId: head.actionId, activeFaction: activeFaction(head.state), currentCardTitle: card, focus: input.focus,
      action, legalChoices: input.anchor === "proposed" || input.anchor === "decision" ? this.legalChoices(sessionId) : null, ruleSources: {},
    });
    const stateHash = action?.after?.stateHash ?? head.stateHash;
    return saveAnnotation(this.db, { sessionId, branchId: session.current_branch_id, anchor: input.anchor, actionId: input.actionId, stateHash, decisionId: null, context, categoryIds: input.categoryIds, text: input.text });
  }

  private rules(hash: string): { ruleset: Ruleset; data: PackageData } {
    const cached = this.rulesets.get(hash);
    if (cached !== undefined) return cached;
    const content = loadPackageContent(this.db, hash);
    if (content === null) throw new ServiceError(500, `Package ${hash} is not stored.`);
    const loaded = loadPackage({ files: JSON.parse(content) as Record<string, unknown>, issues: [] });
    if (!loaded.ok) throw new ServiceError(500, "The stored package no longer loads.", loaded.issues);
    const entry = { ruleset: loaded.ruleset, data: loaded.data };
    this.rulesets.set(hash, entry);
    return entry;
  }

  private head(sessionId: string): Head {
    const row = getSession(this.db, sessionId);
    const actionId = row?.head_action_id ?? null;
    if (row === null || actionId === null) throw new ServiceError(404, `Session "${sessionId}" has no head.`);
    const action = this.db.prepare("SELECT state_hash_after FROM actions WHERE action_id = ?").get(actionId) as { state_hash_after: string };
    const { state } = this.state(action.state_hash_after);
    const { ruleset } = this.rules(row.package_hash);
    return { actionId, stateHash: action.state_hash_after, state, derived: derive(ruleset, state) };
  }

  private stateInput(ruleset: Ruleset, state: GameState, hash: string): { hash: string; content: string; derived: unknown } {
    return { hash, content: canonicalJson(state), derived: derive(ruleset, state) };
  }
}
