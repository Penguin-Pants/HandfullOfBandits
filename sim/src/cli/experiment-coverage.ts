// Coverage ledger and play diagnostics (19 s8; 20 Phase 6). Games are replayed from their journals
// to recover every engine log entry; each mechanic is then marked natural exposure (with counts),
// reviewed fixture (test references), not applicable, or unresolved. Natural exposure and fixture
// evidence stay separate: a fixture does not show natural strategic use.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { coinHandlers } from "../engine/coin/handlers.ts";
import type { AnyCommand, GameState, JsonObject, LogEntry, Ruleset } from "../engine/core/types.ts";
import { createEngine } from "../engine/index.ts";
import { loadPackage, withSessionOptions } from "../package/load.ts";
import { readArchive, readJournal } from "./experiment-artifacts.ts";
import { derive } from "../engine/coin/derive.ts";
import type { GameJob } from "./game-runner.ts";

export interface Mechanic {
  readonly id: string;
  readonly area: "Victory" | "Political economy" | "Civilian effects" | "Sanctuary" | "Sequence/cards";
  readonly label: string;
  /** Reviewed constructed fixtures (test file and test name). Empty: none. */
  readonly fixtures: readonly string[];
  /** Why the mechanic cannot arise in Scenario A, or null. */
  readonly notApplicable: string | null;
}

interface Seen { readonly entries: readonly LogEntry[]; readonly command: AnyCommand; readonly before: GameState }
type Probe = (x: Seen) => boolean;

const effect = (x: Seen, name: string, pred: (d: JsonObject) => boolean = () => true): boolean => x.entries.some((e) => e.kind === "EffectApplied" && e.data["effect"] === name && pred(e.data));
/** Text of a JSON value without object stringification. */
const str = (v: unknown): string => (typeof v === "string" ? v : JSON.stringify(v ?? null));
const plan = (c: AnyCommand): JsonObject => (typeof c["plan"] === "object" && c["plan"] !== null ? (c["plan"] as JsonObject) : {});
const sa = (c: AnyCommand): string | null => {
  const s = plan(c)["sa"];
  return typeof s === "object" && s !== null && !Array.isArray(s) ? str((s as JsonObject)["action"]) : null;
};
const sub = (c: AnyCommand, action: string): boolean => Array.isArray(plan(c)["subActions"]) && (plan(c)["subActions"] as JsonObject[]).some((x) => x["action"] === action);
const spends = (c: AnyCommand, phase: string): boolean => c.type === "PropagandaChoice" && c["phase"] === phase && Object.keys(((c["choice"] as JsonObject | undefined)?.["spaces"] ?? {}) as JsonObject).length > 0;
const standings = (x: Seen, kind: string): JsonObject[] => x.entries.filter((e) => e.kind === kind).flatMap((e) => (Array.isArray(e.data["standings"]) ? (e.data["standings"] as JsonObject[]) : []));
const ended = (x: Seen, reason: string): LogEntry | undefined => x.entries.find((e) => e.kind === "GameEnded" && e.data["reason"] === reason);
const ops = (op: string, sa0: string | null = null): Probe => (x) => x.command.type === "ChooseOperation" && plan(x.command)["op"] === op && (sa0 === null || sa(x.command) === sa0);

const F = {
  victory: "src/engine/coin/propaganda/propaganda.test.ts (Victory Phase)",
  mechanics: "test/mechanics-a.test.ts",
  multi: "src/engine/coin/propaganda/multi-round.test.ts",
  prop: "src/engine/coin/propaganda/propaganda.test.ts",
  redeploy: "src/engine/coin/propaganda/redeploy-reset.test.ts",
  host: "src/engine/coin/ops/host-actions.test.ts",
  cards: "src/engine/coin/cards-a.test.ts",
  events: "src/engine/coin/events.test.ts",
  pivotal: "src/engine/coin/pivotal.test.ts",
  sa: "src/engine/coin/ops/sa/sa.test.ts",
  pkk: "src/engine/coin/ops/pkk/pkk-ops.test.ts",
  state: "src/engine/coin/ops/state/state-ops.test.ts",
  ct: "src/engine/coin/sequence/ct.test.ts",
  qual: "src/cli/qualification.ts fixtures",
};

/** R8 mechanics with probes over replayed log entries and commands. */
export const MECHANICS: readonly (Mechanic & { readonly probe: Probe })[] = [
  { id: "V-first-check-skipped", area: "Victory", label: "First Propaganda skips the victory check", fixtures: [F.prop, F.multi], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "EffectSkipped" && e.data["effect"] === "victoryCheck") },
  { id: "V-opening-win", area: "Victory", label: "Win at the opening check", fixtures: [F.prop, F.qual], notApplicable: null, probe: (x) => ended(x, "victory check") !== undefined },
  { id: "V-simultaneous", area: "Victory", label: "Both factions qualify at one check", fixtures: [F.mechanics], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "ScoreCheck" && e.data["final"] === false && Array.isArray(e.data["qualified"]) && e.data["qualified"].length === 2) },
  { id: "V-harm-gate", area: "Victory", label: "Harm above six blocks an otherwise qualifying check", fixtures: [F.prop, F.qual], notApplicable: null, probe: (x) => standings(x, "ScoreCheck").some((s) => Number(s["margin"]) >= 0 && Number(s["harm"]) > 6) && x.entries.some((e) => e.kind === "ScoreCheck" && e.data["final"] === false) },
  { id: "V-negative-win", area: "Victory", label: "Final win with a negative margin", fixtures: [F.mechanics, F.qual], notApplicable: null, probe: (x) => { const e = ended(x, "final scoring"); return e !== undefined && standings(x, "GameEnded").some((s) => s["faction"] === e.data["winner"] && Number(s["margin"]) < 0); } },
  { id: "V-tie", area: "Victory", label: "Equal final margins decided by Harm, then PKK", fixtures: [F.mechanics], notApplicable: null, probe: (x) => { const s = standings(x, "GameEnded"); return ended(x, "final scoring") !== undefined && s.length === 2 && s[0]?.["margin"] === s[1]?.["margin"]; } },
  { id: "V-excess-harm", area: "Victory", label: "Final margin reduced by excess Harm", fixtures: [F.prop, F.qual], notApplicable: null, probe: (x) => ended(x, "final scoring") !== undefined && standings(x, "GameEnded").some((s) => Number(s["harm"]) > 6) },
  { id: "E-rally-agitate", area: "Political economy", label: "Rally Agitation", fixtures: [F.pkk, F.qual], notApplicable: null, probe: (x) => sub(x.command, "agitate") },
  { id: "E-train-civic", area: "Political economy", label: "Train Civic Action", fixtures: [F.state, F.qual], notApplicable: null, probe: (x) => sub(x.command, "civicAction") },
  { id: "E-propaganda-civic", area: "Political economy", label: "Propaganda Civic Action spending (Legitimacy cap)", fixtures: [F.prop, F.qual], notApplicable: null, probe: (x) => spends(x.command, "civicAction") },
  { id: "E-propaganda-agitation", area: "Political economy", label: "Propaganda Agitation spending", fixtures: [F.prop, F.qual], notApplicable: null, probe: (x) => spends(x.command, "agitation") },
  { id: "E-blocker-removal", area: "Political economy", label: "Removal of blocking markers before a shift (Coercion, Harm, Reception)", fixtures: [F.state, F.pkk, F.qual], notApplicable: null, probe: (x) => (spends(x.command, "civicAction") || spends(x.command, "agitation") || sub(x.command, "agitate") || sub(x.command, "civicAction")) && effect(x, "removeMarker") },
  { id: "C-state-harm", area: "Civilian effects", label: "State Harm placed", fixtures: [F.events, F.cards], notApplicable: null, probe: (x) => effect(x, "placeMarker", (d) => d["marker"] === "stateHarm") },
  { id: "C-pkk-harm", area: "Civilian effects", label: "PKK Harm placed", fixtures: [F.sa], notApplicable: null, probe: (x) => effect(x, "placeMarker", (d) => d["marker"] === "pkkHarm") },
  { id: "C-disputed-harm", area: "Civilian effects", label: "Disputed Harm placed (Cross-Border Assault)", fixtures: [F.host], notApplicable: null, probe: (x) => effect(x, "placeMarker", (d) => d["marker"] === "disputedHarm") },
  { id: "C-coercion", area: "Civilian effects", label: "Coerce places Coercion", fixtures: [F.pkk], notApplicable: null, probe: (x) => effect(x, "placeMarker", (d) => d["marker"] === "coercion") },
  { id: "C-guard-upkeep", area: "Civilian effects", label: "Guard upkeep paid", fixtures: [F.prop], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "CostPaid" && e.ruleRef === "05 s6.3") },
  { id: "C-upkeep-shortfall", area: "Civilian effects", label: "Guards removed for unpaid upkeep", fixtures: [F.prop, F.qual], notApplicable: null, probe: (x) => x.command.type === "PropagandaChoice" && x.command["phase"] === "upkeep" },
  { id: "C-guard-abuse", area: "Civilian effects", label: "Guard Abuse (DK-006 shaded)", fixtures: [F.cards], notApplicable: null, probe: (x) => x.command.type === "ChooseEvent" && x.entries.some((e) => e.kind === "ChoiceMade" && e.data["card"] === "DK-006" && e.data["side"] === "shaded") },
  { id: "C-strike", area: "Civilian effects", label: "Strike Collaborators", fixtures: [F.sa, F.host], notApplicable: null, probe: (x) => sa(x.command) === "pkk.strike-collaborators" && effect(x, "removePieces", (d) => d["piece"] === "guards") },
  { id: "C-europe", area: "Civilian effects", label: "Europe track change", fixtures: [F.prop, F.events], notApplicable: null, probe: (x) => effect(x, "adjustTrack", (d) => d["track"] === "europe" && d["before"] !== d["after"]) },
  { id: "C-marker-removal", area: "Civilian effects", label: "Harm or Coercion marker removed (Redress, Reset)", fixtures: [F.redeploy, F.qual], notApplicable: null, probe: (x) => effect(x, "removeMarker", (d) => ["stateHarm", "pkkHarm", "coercion"].includes(str(d["marker"]))) },
  { id: "C-reception", area: "Civilian effects", label: "Reception marker placed", fixtures: [F.prop], notApplicable: null, probe: (x) => effect(x, "placeMarker", (d) => d["marker"] === "reception") },
  { id: "C-displacement", area: "Civilian effects", label: "Displacement marker placed", fixtures: [F.prop], notApplicable: "No Scenario A action or C1/C2 card places Displacement; Village Clearance is outside this edition (rules 8.4). Its Legitimacy effect has a fixture.", probe: (x) => effect(x, "placeMarker", (d) => d["marker"] === "displacement") },
  ...(["syria", "kdp", "puk"] as const).flatMap((host) => (["host", "tolerant", "restricted", "hostile", "aligned"] as const).map((posture) => ({
    id: `H-${host}-${posture}`, area: "Sanctuary" as const, label: `${host} posture reaches ${posture}`, fixtures: [F.host, F.events],
    notApplicable: host === "syria" && posture === "aligned" ? "Syria has no Aligned step (rules 8.1)" : null,
    probe: (x: Seen) => ((host === "kdp" && posture === "host") || (host === "syria" && posture === "host") || (host === "puk" && posture === "tolerant")) ? true : effect(x, "stepOrdinal", (d) => d["track"] === `posture.${host}` && d["after"] === posture) || effect(x, "setTrack", (d) => d["track"] === `posture.${host}` && d["after"] === posture),
  }))),
  { id: "H-host-pressure", area: "Sanctuary", label: "Host Pressure", fixtures: [F.host], notApplicable: null, probe: (x) => sa(x.command) === "pkk.host-pressure" },
  { id: "H-diplomacy", area: "Sanctuary", label: "Diplomacy", fixtures: [F.host], notApplicable: null, probe: (x) => sa(x.command) === "state.diplomacy" },
  { id: "H-cross-border", area: "Sanctuary", label: "Cross-Border Sweep or Assault", fixtures: [F.host], notApplicable: null, probe: (x) => sa(x.command) === "state.cross-border" },
  { id: "H-hot-pursuit", area: "Sanctuary", label: "Early KDP hot pursuit (KDP Host or Tolerant)", fixtures: [F.host], notApplicable: null, probe: (x) => sa(x.command) === "state.cross-border" && JSON.stringify(plan(x.command)["sa"]).includes("kdp-zone") && ["host", "tolerant"].includes(str(x.before.tracks["posture.kdp"])) },
  { id: "H-interrupted", area: "Sanctuary", label: "Operation resumed after Host Pressure (interrupted continuation)", fixtures: [F.host, F.qual], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "DecisionOpened" && str(e.data["decisionId"]).startsWith("operation-")) },
  { id: "H-restricted-entry", area: "Sanctuary", label: "March into a Restricted box (+1, activates)", fixtures: [F.host, F.pkk], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "CostPaid" && e.ruleRef === "06 s4.2" && x.command.type === "ChooseOperation") && effect(x, "movePieces", (d) => d["arrive"] === "active" && ["syria-bekaa", "kdp-zone", "puk-zone"].includes(str(d["to"]))) },
  { id: "H-leadership-abroad", area: "Sanctuary", label: "Leadership flips Abroad", fixtures: [F.host], notApplicable: null, probe: (x) => effect(x, "flipMarker", (d) => d["marker"] === "leadership") },
  { id: "S-always", area: "Sequence/cards", label: "Mandatory Always line on reveal (DK-003, DK-005, DK-019, DK-020)", fixtures: [F.events, F.cards], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "CardRevealed" && ["DK-003", "DK-005", "DK-019", "DK-020"].includes(str(e.data["card"]))) },
  { id: "S-event-unshaded", area: "Sequence/cards", label: "Unshaded Event executed", fixtures: [F.events], notApplicable: null, probe: (x) => x.command.type === "ChooseEvent" && x.command["side"] === "unshaded" },
  { id: "S-event-shaded", area: "Sequence/cards", label: "Shaded Event executed", fixtures: [F.events], notApplicable: null, probe: (x) => x.command.type === "ChooseEvent" && x.command["side"] === "shaded" },
  { id: "S-argk-play", area: "Sequence/cards", label: "ARGK played", fixtures: [F.pivotal], notApplicable: null, probe: (x) => x.command.type === "PlayPivotal" },
  { id: "S-argk-decline", area: "Sequence/cards", label: "ARGK declined", fixtures: [F.pivotal], notApplicable: null, probe: (x) => x.command.type === "ResolveDecision" },
  { id: "S-pass", area: "Sequence/cards", label: "Pass", fixtures: [F.ct], notApplicable: null, probe: (x) => x.command.type === "Pass" },
  { id: "S-limited", area: "Sequence/cards", label: "Limited Op", fixtures: [F.ct], notApplicable: null, probe: (x) => x.command["box"] === "limitedOp" },
  { id: "S-op-only", area: "Sequence/cards", label: "Op Only", fixtures: [F.ct], notApplicable: null, probe: (x) => x.command["box"] === "opOnly" },
  { id: "S-op-sa", area: "Sequence/cards", label: "Op + SA", fixtures: [F.ct], notApplicable: null, probe: (x) => x.command["box"] === "opSa" },
  { id: "S-redeploy-moves", area: "Sequence/cards", label: "Redeploy with moves", fixtures: [F.redeploy], notApplicable: null, probe: (x) => x.command.type === "PropagandaChoice" && x.command["phase"] === "redeploy" && effect(x, "movePieces") },
  { id: "S-reset", area: "Sequence/cards", label: "Reset (Momentum discarded or Guerrillas flipped)", fixtures: [F.redeploy], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "PhaseStarted" && e.data["phase"] === "reset") },
  { id: "S-final-skips", area: "Sequence/cards", label: "Final round skips income, Redeploy and Reset", fixtures: [F.prop, F.multi], notApplicable: null, probe: (x) => x.entries.some((e) => e.kind === "EffectSkipped" && e.data["effect"] === "income") },
  { id: "S-emergency", area: "Sequence/cards", label: "Emergency Rule step chosen (OHAL to Normalizing or back)", fixtures: [F.prop], notApplicable: null, probe: (x) => x.command.type === "PropagandaChoice" && x.command["phase"] === "legitimacy" },
  ...["state.train", "state.garrison", "state.sweep", "state.assault", "pkk.rally", "pkk.march", "pkk.attack", "pkk.coerce"].map((op) => ({ id: `O-${op}`, area: "Sequence/cards" as const, label: `Operation ${op}`, fixtures: [F.state, F.pkk], notApplicable: null, probe: ops(op) })),
  ...["state.air-mobility", "pkk.ambush", "pkk.extort"].map((s) => ({ id: `A-${s}`, area: "Sequence/cards" as const, label: `Special Activity ${s}`, fixtures: [F.sa], notApplicable: null, probe: (x: Seen) => sa(x.command) === s })),
];

export interface LedgerEntry {
  readonly id: string;
  readonly area: string;
  readonly label: string;
  readonly status: "natural exposure" | "reviewed fixture" | "not applicable" | "unresolved";
  readonly games: number;
  readonly fixtures: readonly string[];
  readonly note: string | null;
}

export interface Diagnostics {
  readonly passShare: Readonly<Record<string, number>>;
  readonly maxFirstEligibleStreak: number;
  readonly meanUnusedResources: Readonly<Record<string, number>>;
  readonly passStreak3Games: Readonly<Record<string, number>>;
  readonly stopRuleFlags: Readonly<Record<string, number>>;
  readonly boxesByFaction: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly eligibilityRows: Readonly<Record<string, number>>;
  readonly eventSides: Readonly<Record<string, number>>;
}

/** Final score components of a completed game (19 s9 report: scoring routes). */
export interface FinalComponents { readonly winner: string | null; readonly support: number; readonly legitimacy: number; readonly opposition: number; readonly bases: number }

export interface Coverage {
  readonly games: number;
  readonly finals: Readonly<Record<string, FinalComponents>>;
  readonly ledger: readonly LedgerEntry[];
  readonly diagnostics: Diagnostics;
}

/** Replay every scheduled game (complete or prefix) and build the ledger and diagnostics. */
export function experimentCoverage(dir: string, ruleset?: Ruleset): Coverage {
  const identity = JSON.parse(readFileSync(join(dir, "identity.json"), "utf8")) as { scenario: string; conditions: Record<string, Record<string, string>> };
  let base = ruleset;
  if (base === undefined) {
    const loaded = loadPackage({ files: JSON.parse(readFileSync(join(dir, "package-content.json"), "utf8")) as Record<string, unknown>, issues: [] });
    if (!loaded.ok) throw new Error("captured package does not load");
    base = loaded.ruleset;
  }
  const engine = createEngine(coinHandlers);
  const jobs = JSON.parse(readFileSync(join(dir, "schedule.json"), "utf8")) as GameJob[];
  const hits = new Map<string, number>();
  const passes: Record<string, number> = {};
  const choices: Record<string, number> = {};
  const unused: Record<string, number[]> = { state: [], pkk: [] };
  const streakGames: Record<string, number> = {};
  const flags: Record<string, number> = {};
  const boxes: Record<string, Record<string, number>> = { state: {}, pkk: {} };
  const rows: Record<string, number> = {};
  const sides: Record<string, number> = {};
  let maxStreak = 0;
  const archive = readArchive(dir);
  const finals: Record<string, FinalComponents> = {};
  for (const job of jobs) {
    const r = withSessionOptions(base, identity.scenario, identity.conditions[job.conditionId] ?? {});
    const journal = readJournal(dir, job.gameId);
    const archived = archive?.get(job.gameId);
    const events = journal.length > 0 ? journal : (archived?.commands ?? []).map((command, i) => ({ t: "step" as const, i, command: command as AnyCommand, hash: archived?.hashes[i] ?? "", auto: null, decisions: [], checkpoints: [] }));
    let s = engine.start(r, identity.scenario, job.seed).state;
    const seen = new Set<string>();
    let lastFirst: string | null = null;
    let streak = 0;
    const passRun: Record<string, number> = {};
    const streaked = new Set<string>();
    for (const e of events) {
      if (e.t !== "step") continue;
      const result = engine.apply(r, s, e.command);
      if (!result.ok) break;
      const x: Seen = { entries: result.transition.logEntries, command: e.command, before: s };
      for (const m of MECHANICS) if (!seen.has(m.id) && m.probe(x)) seen.add(m.id);
      const faction = typeof e.command["faction"] === "string" ? e.command["faction"] : null;
      if (faction !== null && ["Pass", "ChooseEvent", "ChooseOperation"].includes(e.command.type) && s.turn.phase === "card") {
        choices[faction] = (choices[faction] ?? 0) + 1;
        const box = e.command.type === "Pass" ? "pass" : e.command.type === "ChooseEvent" ? "event" : str(e.command["box"]);
        const mine = boxes[faction] ?? {};
        mine[box] = (mine[box] ?? 0) + 1;
        boxes[faction] = mine;
        if (e.command.type === "Pass") { passes[faction] = (passes[faction] ?? 0) + 1; passRun[faction] = (passRun[faction] ?? 0) + 1; } else passRun[faction] = 0;
        if ((passRun[faction] ?? 0) >= 3) streaked.add(faction);
      }
      for (const entry of x.entries) {
        if (entry.kind === "StopRuleFlag") flags[`rule ${str(entry.data["rule"])}`] = (flags[`rule ${str(entry.data["rule"])}`] ?? 0) + 1;
        if (entry.kind === "EligibilityChanged") {
          const b = entry.data["boxes"];
          if (typeof b === "object" && b !== null && !Array.isArray(b)) {
            const key = `${str((b as JsonObject)[s.initiative.firstEligible ?? ""])} -> ${str((b as JsonObject)[s.initiative.secondEligible ?? ""])}`;
            rows[key] = (rows[key] ?? 0) + 1;
          }
          const next = str(entry.data["firstEligible"]);
          streak = next === lastFirst ? streak + 1 : 1;
          lastFirst = next;
          maxStreak = Math.max(maxStreak, streak);
        }
        if (entry.kind === "ChoiceMade" && typeof entry.data["side"] === "string") sides[`${str(entry.data["card"])} ${entry.data["side"]}`] = (sides[`${str(entry.data["card"])} ${entry.data["side"]}`] ?? 0) + 1;
      }
      s = result.transition.state;
    }
    for (const id of seen) hits.set(id, (hits.get(id) ?? 0) + 1);
    for (const f of streaked) streakGames[f] = (streakGames[f] ?? 0) + 1;
    if (s.ended !== null) {
      for (const f of ["state", "pkk"]) unused[f]?.push(Number(s.tracks[`resources.${f}`]));
      const totals = derive(r, s).totals;
      finals[job.gameId] = { winner: s.ended.winner, support: totals["totalSupport"] ?? 0, legitimacy: Number(s.tracks["legitimacy"]), opposition: totals["totalOpposition"] ?? 0, bases: totals["domesticPkkBases"] ?? 0 };
    }
  }
  const mean = (xs: readonly number[]): number => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);
  const ledger = MECHANICS.map((m): LedgerEntry => {
    const games = hits.get(m.id) ?? 0;
    const status = m.notApplicable !== null ? "not applicable" : games > 0 ? "natural exposure" : m.fixtures.length > 0 ? "reviewed fixture" : "unresolved";
    return { id: m.id, area: m.area, label: m.label, status, games, fixtures: m.fixtures, note: m.notApplicable };
  });
  return {
    games: jobs.length,
    finals,
    ledger,
    diagnostics: {
      passShare: Object.fromEntries(Object.keys(choices).map((f) => [f, (passes[f] ?? 0) / (choices[f] ?? 1)])),
      maxFirstEligibleStreak: maxStreak,
      meanUnusedResources: { state: mean(unused["state"] ?? []), pkk: mean(unused["pkk"] ?? []) },
      passStreak3Games: streakGames,
      stopRuleFlags: flags,
      boxesByFaction: boxes,
      eligibilityRows: rows,
      eventSides: sides,
    },
  };
}
