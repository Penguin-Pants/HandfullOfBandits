// Operation and Special Activity framework (research 06 s1; 05 s3.1, s4.1). One handler per action
// ID. ChooseOperation (choose-operation.ts) and free actions from events (P2-09) call them.
import type { Exec } from "../../core/exec.ts";
import type { FactionId, GameState, JsonObject, Ruleset, SubAction, Violation } from "../../core/types.ts";

/** The Op or SA part of a plan (05 s3.1). */
export interface ActionPart {
  /** Ordered space or box IDs. */
  readonly locations: readonly string[];
  /** Handler-specific choices per location. */
  readonly perLocation: Readonly<Record<string, JsonObject>>;
}

export interface ActionOptions {
  readonly faction: FactionId;
  /** Limited Op: one location, no SA (05 s3.1). */
  readonly limited: boolean;
  /** Free action from an event: no Resources cost, no eligibility change (05 s5 item 4). */
  readonly free: boolean;
  /** Event limits a free action must meet, for example `{spaces: [botan]}`. */
  readonly constraints: JsonObject;
  /** For an SA: the Op it accompanies. For an Op: null. */
  readonly op: string | null;
  /** For an Op: the SA in the same action. For an SA: null. */
  readonly sa: string | null;
  /** For an SA: the locations of its Op. For an Op: empty. */
  readonly opLocations: readonly string[];
  /** For an Op: the locations of its SA. For an SA: empty. */
  readonly saLocations: readonly string[];
  /** Civic Action or Agitate spends (06 s2.1, s4.1). */
  readonly subActions: readonly SubAction[];
}

export interface ActionHandler {
  readonly id: string;
  readonly faction: FactionId;
  readonly kind: "op" | "sa";
  readonly ruleRef: string;
  /** For an SA: the Op IDs it may accompany, or `any` (06 s1 item 2). */
  readonly accompanies: readonly string[] | "any";
  /** Location, availability and supply checks. Not the Resources check: the caller sums costs. */
  check(ruleset: Ruleset, state: GameState, part: ActionPart, options: ActionOptions): Violation[];
  /** Resources this part costs, sub-actions included. */
  cost(ruleset: Ruleset, state: GameState, part: ActionPart, options: ActionOptions): number;
  /** Pay and resolve. Runs only after `check` passed. */
  execute(ctx: Exec, part: ActionPart, options: ActionOptions): void;
}

/** A violation about one location. */
export function at(location: string | null, code: string, message: string, ruleRef: string): Violation {
  return { code, message, ruleRef, location };
}
