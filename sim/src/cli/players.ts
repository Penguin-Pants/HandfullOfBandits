// Player contracts for experiments (19 s4, s5; 20 Phases 3 and 5). A qualified player receives a
// frozen Observation and validated candidates and returns one candidate ID. It never receives the
// live GameState. Search uses only determinized states built from the observation, a search RNG
// that is separate from the game RNG and a transition budget that counts engine applies.
// Legacy full-state policies stay available only as labeled, unqualified controls.
import type { AnyCommand, FactionId, GameState, JsonObject, Ruleset } from "../engine/core/types.ts";
import type { Engine } from "../engine/index.ts";
import type { ApplyResult } from "../engine/core/types.ts";
import { decisionPoint, GENERATOR_VERSION, type Candidate, type DecisionKind } from "./candidates.ts";
import type { Observation, SearchRng } from "./player-observation.ts";
import { scriptedPolicy, type Policy } from "./play.ts";
import { resumeOperation, strategy } from "./strategies/index.ts";

export interface PlayerSpec {
  /** Stable ID, `<family>@<version>`. */
  readonly id: string;
  readonly family: string;
  readonly version: number;
  readonly faction: FactionId;
  /** Qualified players enter headline averages (19 s4). Controls and baselines never do. */
  readonly role: "qualified" | "control" | "baseline";
  /** observation: the restricted contract. fullState: legacy control that reads the live state. */
  readonly access: "observation" | "fullState";
  readonly params: JsonObject;
  readonly generatorVersion: string;
  /** Engine transitions per decision (19 s7: equal for comparable search players). */
  readonly budget: number;
  readonly description: string;
}

export interface DecisionRequest {
  readonly decisionId: string;
  readonly kind: DecisionKind;
  readonly faction: FactionId;
  readonly observation: Observation;
  readonly candidates: readonly Candidate[];
}

export interface Choice {
  readonly candidateId: string;
  readonly value: number;
  /** Evaluation components of the chosen plan: observed margins separate from estimates (19 s3). */
  readonly components: Readonly<Record<string, number>>;
  /** Best other generated candidate; not proof of the best legal move (19 s9). */
  readonly topAlternative: { readonly id: string; readonly value: number } | null;
  readonly notes: readonly string[];
}

/** Counts engine transitions for one decision. `apply` returns null once the budget is spent. */
export class TransitionBudget {
  used = 0;
  readonly limit: number;
  private readonly engine: Engine;
  constructor(engine: Engine, limit: number) {
    this.engine = engine;
    this.limit = limit;
  }
  get remaining(): number {
    return this.limit - this.used;
  }
  apply(ruleset: Ruleset, state: GameState, command: AnyCommand): ApplyResult | null {
    if (this.used >= this.limit) return null;
    this.used++;
    return this.engine.apply(ruleset, state, command);
  }
}

export interface SearchContext {
  readonly engine: Engine;
  readonly ruleset: Ruleset;
  readonly rng: SearchRng;
  readonly budget: TransitionBudget;
}

export interface ObservationPlayer {
  readonly spec: PlayerSpec;
  decide(request: DecisionRequest, ctx: SearchContext): Choice;
}

export interface FullStatePlayer {
  readonly spec: PlayerSpec;
  act(engine: Engine, ruleset: Ruleset, state: GameState): AnyCommand;
}

export type Player = ObservationPlayer | FullStatePlayer;

export const isObservationPlayer = (p: Player): p is ObservationPlayer => p.spec.access === "observation";

/** Apply automatic commands (no player choice) until a player decision or the end, within budget. */
export function settle(ctx: SearchContext, state: GameState): GameState | null {
  let s = state;
  for (let i = 0; i < 32 && s.ended === null; i++) { // literal-ok: more than the Propaganda phases in a row
    const point = decisionPoint(ctx.engine, ctx.ruleset, s);
    if (point.kind !== "auto") return s;
    const result = ctx.budget.apply(ctx.ruleset, s, point.command);
    if (result === null || !result.ok) return null;
    s = result.transition.state;
  }
  return s;
}

/** R-RANDOM baseline: uniform over generated legal candidates with the player RNG. Diagnostic only. */
export function randomLegal(faction: FactionId): ObservationPlayer {
  const prefix = faction === "state" ? "S" : "P";
  return {
    spec: { id: `${prefix}-RANDOM@1`, family: `${prefix}-RANDOM`, version: 1, faction, role: "baseline", access: "observation", params: {}, generatorVersion: GENERATOR_VERSION, budget: 0, description: "Uniform choice among generated legal candidates (diagnostic baseline)." },
    decide(request, ctx) {
      const pick = request.candidates[ctx.rng.int(request.candidates.length)];
      if (pick === undefined) throw new Error("randomLegal received no candidates");
      return { candidateId: pick.id, value: 0, components: {}, topAlternative: null, notes: [] };
    },
  };
}

/** Legacy research 12 s7 policies and the IC-2a scripted policy: full-state controls (19 s4). */
export function fullStateControl(name: string, faction: FactionId): FullStatePlayer {
  const policy: Policy = name === "scripted" ? scriptedPolicy : strategy(name);
  const prefix = faction === "state" ? "S" : "P";
  return {
    spec: {
      id: `${prefix}-CTRL-${name}@1`, family: `${prefix}-CTRL-${name}`, version: 1, faction, role: name === "scripted" ? "baseline" : "control", access: "fullState", params: { legacy: name },
      generatorVersion: "legacy", budget: 0,
      description: `Legacy ${name} policy. Reads the live state; uses the scripted policy for decisions it does not cover. Unqualified control, excluded from headline averages.`,
    },
    act: (engine, ruleset, state) => resumeOperation(engine, ruleset, state) ?? policy(engine, ruleset, state),
  };
}
