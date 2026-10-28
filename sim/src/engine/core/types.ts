// Core engine types (05 s2, s3, s10; 03 s6.1).
// Every type is plain JSON, so canonicalJson can hash it (05 s8 item 6).
// Optional values are null, never a missing key. Every map is keyed by ID,
// so N factions need no type change (DEC-18).
import type { RngState } from "./rng.ts";

export type FactionId = string;
export type SpaceId = string;
export type PieceTypeId = string;
export type MarkerTypeId = string;
export type TrackId = string;
export type CardId = string;
export type RuleRef = string;
export type AssumptionRef = string;

export type JsonValue = string | number | boolean | null | readonly JsonValue[] | JsonObject;
export interface JsonObject {
  readonly [key: string]: JsonValue;
}

// The package compiles to a Ruleset (03 s5). These are the fields core reads.
// The P1-05 loader builds them from the P1-04 schema output (DEC-37). P1-07 primitives read
// stacking, levels, blocks, caps and overflow. P1-09 derive reads pop, Control and victory terms.

export interface RulesetFaction {
  readonly id: FactionId;
  readonly kind: "player" | "nonPlayer";
}

export interface RulesetPiece {
  readonly id: PieceTypeId;
  readonly faction: FactionId;
  readonly count: number;
  /** Flip states, for example [underground, active]. Empty: one face (SINGLE_FACE in state.ts). */
  readonly states: readonly string[];
  /** Face a placement uses when the effect names none (05 s7). Null: SINGLE_FACE. */
  readonly placedAs: string | null;
  readonly startPool: "available" | "outOfPlay";
  readonly countsForControl: boolean;
}

export interface RulesetSpace {
  readonly id: SpaceId;
  readonly hasSupportScale: boolean;
  readonly kind: "domestic" | "external";
  readonly terrain: string | null;
  readonly pop: number;
}

/** At most `max` of `pieces` in each space that matches every non-null filter (04 s4.3). */
export interface RulesetStacking {
  readonly pieces: readonly PieceTypeId[];
  readonly max: number;
  readonly spaceKind: "domestic" | "external" | null;
  readonly terrain: readonly string[] | null;
  readonly spaces: readonly SpaceId[] | null;
}

export type RulesetTrack =
  | {
      readonly id: TrackId;
      readonly kind: "numeric";
      readonly min: number;
      readonly max: number;
      /** A loss the track cannot pay costs `cost` per unpaid point on `track` (research 04 s3.2, DEC-41). */
      readonly overflow: { readonly track: TrackId; readonly cost: number } | null;
    }
  | { readonly id: TrackId; readonly kind: "ordinal"; readonly steps: readonly string[] };

export interface RulesetMarker {
  readonly id: MarkerTypeId;
  readonly count: number;
  /** Sides, for example [new, old]. Empty: one side (SINGLE_FACE in state.ts). */
  readonly sides: readonly string[];
  /** Shift directions this marker blocks in its space. */
  readonly blocks: readonly ("support" | "opposition")[];
  /** No shift takes a level past ±capsLevel in its space (DEC-39). Null: no cap. */
  readonly capsLevel: number | null;
}

// Condition and formula terms (04 s8): a closed set, no expression strings (03 s6.2).
// Space conditions hold for one space. Track, campaign and card conditions come with P2-05.

export type SpaceCondition =
  | { readonly type: "spaceKind"; readonly kind: "domestic" | "external" }
  | { readonly type: "terrainIn"; readonly terrain: readonly string[] }
  /** Signed levels from Neutral (DEC-36). A space with no support scale never matches. */
  | { readonly type: "spaceLevelIn"; readonly levels: readonly number[] }
  | { readonly type: "control"; readonly faction: FactionId }
  /** At least one piece or marker of a listed type, any face. */
  | { readonly type: "spaceHas"; readonly pieces: readonly PieceTypeId[]; readonly markers: readonly MarkerTypeId[] }
  | { readonly type: "all"; readonly of: readonly SpaceCondition[] }
  | { readonly type: "any"; readonly of: readonly SpaceCondition[] }
  | { readonly type: "not"; readonly of: SpaceCondition };

/** Pieces and markers count on the map only, never in pools. Null `where`: every space. */
export type FormulaTerm =
  | { readonly type: "sumPopWhere"; readonly where: SpaceCondition }
  | { readonly type: "countPieces"; readonly pieces: readonly PieceTypeId[]; readonly where: SpaceCondition | null }
  | {
      readonly type: "countMarkers";
      readonly markers: readonly MarkerTypeId[];
      /** Null: every side. */
      readonly sides: readonly string[] | null;
      readonly where: SpaceCondition | null;
    }
  | { readonly type: "trackValue"; readonly track: TrackId }
  | { readonly type: "divideFloor"; readonly of: FormulaTerm; readonly by: number }
  | { readonly type: "multiply"; readonly of: FormulaTerm; readonly by: number }
  | { readonly type: "add"; readonly terms: readonly FormulaTerm[] }
  | { readonly type: "constant"; readonly value: number };

/** victory.yaml subset (04 s4.9). Each list is a sum of terms. */
export interface RulesetVictory {
  readonly scores: Readonly<Record<FactionId, readonly FormulaTerm[]>>;
  /** The only source of Harm counts (DEC-38). */
  readonly harmCount: Readonly<Record<FactionId, readonly FormulaTerm[]>>;
  /** Named totals, for example Total Support. */
  readonly totals: Readonly<Record<string, readonly FormulaTerm[]>>;
}

/** A parameters.yaml value (04 s4.5). */
export type ParamValue = number | string | readonly (number | string)[];

export interface Ruleset {
  readonly packageHash: string;
  readonly rulesetVersion: string;
  readonly factions: readonly RulesetFaction[];
  readonly pieces: readonly RulesetPiece[];
  readonly spaces: readonly RulesetSpace[];
  readonly tracks: readonly RulesetTrack[];
  readonly markers: readonly RulesetMarker[];
  readonly stacking: readonly RulesetStacking[];
  /** Highest level magnitude: ±levelRange from Neutral (DEC-39). 0 without supportLevels. */
  readonly levelRange: number;
  /** parameters.yaml by ID. Null: an entry with no value (only non-tune entries, V-PARAM). Read with param(). */
  readonly parameters: Readonly<Record<string, ParamValue | null>>;
  readonly victory: RulesetVictory;
  /** Marker types that a harmCount term counts. Their empty supply warns (PA-09). */
  readonly harmMarkers: readonly MarkerTypeId[];
  /** Scenario thresholds by scenario ID, then faction. */
  readonly thresholds: Readonly<Record<string, Readonly<Record<FactionId, number>>>>;
}

// Game state (05 s2). Derived values are never stored here.

/** Count per face. Every face of the type has a key, zero included. */
export type FaceCounts = Readonly<Record<string, number>>;

export interface SpaceState {
  /** Every piece type of the ruleset, by flip state. */
  readonly pieces: Readonly<Record<PieceTypeId, FaceCounts>>;
  /** Signed steps from Neutral: positive toward Support. Null: no support scale. */
  readonly level: number | null;
  /** Every marker type of the ruleset, by side. */
  readonly markers: Readonly<Record<MarkerTypeId, FaceCounts>>;
}

export interface Modifier {
  readonly id: string;
  readonly sourceCard: CardId;
  readonly duration: "game" | "untilReset";
  readonly params: JsonObject;
}

export interface HiddenMarker {
  readonly marker: MarkerTypeId;
  readonly space: SpaceId;
  /** Engine stateSeq at placement. The store maps it to its action ID. */
  readonly placedAtSeq: number;
}

export interface Decision {
  readonly id: string;
  readonly faction: FactionId;
  readonly prompt: string;
  readonly answers: readonly JsonValue[];
  readonly ruleRef: RuleRef;
}

export interface GameResult {
  readonly winner: FactionId | null;
  readonly reason: string;
  readonly labels: readonly string[];
  /** 09 s6 record sheet, computed at game end. */
  readonly recordSheet: JsonObject;
}

export interface GameState {
  readonly meta: {
    readonly packageHash: string;
    readonly rulesetVersion: string;
    readonly scenarioId: string;
    readonly seed: number;
    readonly stateSeq: number;
  };
  readonly rng: RngState;
  readonly turn: {
    readonly campaign: string | null;
    readonly propagandaRound: number;
    readonly cardIndex: number;
    readonly phase: string;
    readonly step: number;
  };
  readonly deck: {
    readonly piles: readonly (readonly CardId[])[];
    readonly currentCard: CardId | null;
    readonly played: readonly CardId[];
    readonly setAside: readonly CardId[];
  };
  /** Pivotal cards per player faction. */
  readonly hands: Readonly<Record<FactionId, readonly CardId[]>>;
  readonly initiative: {
    /** Cylinder box per player faction. Null until the sequence model places it. */
    readonly boxes: Readonly<Record<FactionId, string | null>>;
    readonly firstEligible: FactionId | null;
    readonly secondEligible: FactionId | null;
    readonly actedThisCard: readonly FactionId[];
  };
  readonly spaces: Readonly<Record<SpaceId, SpaceState>>;
  readonly pools: Readonly<Record<PieceTypeId, { readonly available: number; readonly outOfPlay: number }>>;
  /** Available count per marker type. */
  readonly markerPools: Readonly<Record<MarkerTypeId, number>>;
  /** Numeric tracks hold a number. Ordinal tracks hold a step ID. */
  readonly tracks: Readonly<Record<TrackId, number | string>>;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly modifiers: readonly Modifier[];
  readonly hidden: readonly HiddenMarker[];
  readonly pending: Decision | null;
  /** Per-game counters needed by rules. */
  readonly history: Readonly<Record<string, number>>;
  readonly ended: GameResult | null;
}

// Derived view (05 s1 item 5, s9 item 1). Recomputed by derive, never stored in state.

export interface DerivedView {
  /** Controlling faction per space. Null: no Control. */
  readonly control: Readonly<Record<SpaceId, FactionId | null>>;
  /** Named totals, for example Total Support. */
  readonly totals: Readonly<Record<string, number>>;
  readonly scores: Readonly<Record<FactionId, number>>;
  readonly harm: Readonly<Record<FactionId, number>>;
  /** Score minus the scenario threshold, for each faction with a threshold. */
  readonly margins: Readonly<Record<FactionId, number>>;
}

// Commands (05 s3).

export interface SpecialActivityPlan {
  readonly action: string;
  readonly locations: readonly string[];
  readonly perLocation: Readonly<Record<string, JsonObject>>;
  readonly timing: "before" | "after";
}

export interface SubAction {
  readonly action: string;
  readonly space: SpaceId;
  readonly params: JsonObject;
}

export interface ActionPlan {
  readonly op: string;
  /** Ordered space or box IDs. */
  readonly locations: readonly string[];
  readonly perLocation: Readonly<Record<string, JsonObject>>;
  readonly sa: SpecialActivityPlan | null;
  readonly subActions: readonly SubAction[];
}

export type Command =
  | { readonly type: "PlayPivotal"; readonly faction: FactionId; readonly card: CardId }
  | { readonly type: "ChooseEvent"; readonly faction: FactionId; readonly side: "unshaded" | "shaded" }
  | { readonly type: "ChooseOperation"; readonly faction: FactionId; readonly box: string; readonly plan: ActionPlan }
  | { readonly type: "Pass"; readonly faction: FactionId }
  | { readonly type: "DeclareCeasefire"; readonly faction: FactionId }
  | { readonly type: "ResolveDecision"; readonly decisionId: string; readonly answer: JsonValue }
  | { readonly type: "PropagandaChoice"; readonly phase: string; readonly choice: JsonValue }
  | { readonly type: "Advance" };

// Effects: core primitives (04 s5; 03 s6.1 items 4 to 6). Locations and counts are
// resolved before core applies them. Card-level primitives (choice, forEachSpace) come in P2-05.

interface EffectSource {
  readonly ruleRef: RuleRef;
  readonly assumptionRef: AssumptionRef | null;
}

export type Effect = EffectSource &
  (
    | {
        readonly type: "placePieces";
        readonly piece: PieceTypeId;
        readonly count: number;
        readonly space: SpaceId;
        /** Null: the piece's default placement face (05 s7). */
        readonly state: string | null;
      }
    | {
        readonly type: "removePieces";
        readonly piece: PieceTypeId;
        readonly state: string | null;
        readonly count: number;
        readonly space: SpaceId;
        readonly to: "available" | "outOfPlay";
      }
    | {
        readonly type: "movePieces";
        readonly piece: PieceTypeId;
        readonly state: string | null;
        readonly count: number;
        readonly from: SpaceId;
        readonly to: SpaceId;
      }
    | {
        readonly type: "setPieceState";
        readonly piece: PieceTypeId;
        readonly space: SpaceId;
        readonly from: string;
        readonly to: string;
        readonly count: number | "all";
      }
    | { readonly type: "adjustTrack"; readonly track: TrackId; readonly delta: number }
    | {
        readonly type: "setTrack";
        readonly track: TrackId;
        readonly value: number | string;
        readonly ifEquals: number | string | null;
      }
    | {
        readonly type: "stepOrdinal";
        readonly track: TrackId;
        readonly direction: "next" | "previous";
        readonly steps: number;
      }
    | { readonly type: "placeMarker"; readonly marker: MarkerTypeId; readonly space: SpaceId; readonly side: string }
    | { readonly type: "removeMarker"; readonly marker: MarkerTypeId; readonly space: SpaceId; readonly side: string }
    | { readonly type: "flipMarker"; readonly marker: MarkerTypeId; readonly space: SpaceId; readonly side: string }
    | { readonly type: "setFlag"; readonly flag: string; readonly value: boolean }
    | {
        readonly type: "shiftLevel";
        readonly space: SpaceId;
        readonly direction: "support" | "opposition" | "neutral";
        readonly steps: number;
      }
  );

// Log entries (05 s10). The store adds entryId and action ID (06 s2, s3.6).

export type LogKind =
  | "CardRevealed"
  | "ChoiceMade"
  | "ValidationPassed"
  | "CostPaid"
  | "EffectApplied"
  | "EffectSkipped"
  | "DieRolled"
  | "DecisionOpened"
  | "DecisionAnswered"
  | "ControlChanged"
  | "EligibilityChanged"
  | "PhaseStarted"
  | "PhaseEnded"
  | "ScoreCheck"
  | "GameEnded"
  | "StopRuleFlag";

export interface LogEntry {
  readonly kind: LogKind;
  /** stateSeq of the state the entry belongs to. */
  readonly stateSeq: number;
  readonly ruleRef: RuleRef | null;
  readonly assumptionRef: AssumptionRef | null;
  readonly data: JsonObject;
}
