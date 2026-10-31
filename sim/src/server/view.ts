// Board and status view model (11 P2-14; 08 s3.1, s3.5). The server builds it from the package and
// the state, so the UI draws without computing rules (DEC-04).
import { emergencyMoves } from "../engine/coin/propaganda/legitimacy.ts";
import { derive } from "../engine/coin/derive.ts";
import { activeFaction } from "../engine/coin/sequence/ct.ts";
import { param } from "../engine/core/params.ts";
import type { GameState, Ruleset } from "../engine/core/types.ts";
import type { PackageData } from "../package/validate.ts";

export interface PieceView {
  readonly piece: string;
  readonly faction: string;
  readonly face: string;
  readonly count: number;
  readonly shape: string;
  readonly colorVariant: string;
  /** Emblem shown on this face, or null. */
  readonly emblem: string | null;
  readonly isBase: boolean;
}

export interface CardView {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly encoded: boolean;
  readonly unshaded: { readonly text: string; readonly owner: string | null; readonly blockOnly: boolean } | null;
  readonly shaded: { readonly text: string; readonly owner: string | null; readonly blockOnly: boolean } | null;
}

export interface SpaceView {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly terrain: string | null;
  readonly pop: number;
  readonly x: number;
  readonly y: number;
  readonly level: number | null;
  readonly levelName: string | null;
  readonly control: string | null;
  readonly pieces: readonly PieceView[];
  readonly markers: readonly { readonly marker: string; readonly side: string; readonly count: number; readonly hidden: boolean }[];
  readonly tags: readonly string[];
  readonly confidence: string | null;
}

/** One piece type's totals: on the map, Available and out of play (04 s2). */
export interface ForceView {
  readonly piece: string;
  readonly faction: string;
  readonly shape: string;
  readonly colorVariant: string;
  readonly isBase: boolean;
  /** Flip states (faces) of this piece type; empty: one face. */
  readonly states: readonly string[];
  readonly onMap: number;
  readonly available: number;
  readonly outOfPlay: number;
}

export interface BoardView {
  readonly spaces: readonly SpaceView[];
  readonly forces: readonly ForceView[];
  /** Support level IDs from most Opposition to most Support; level 0 is the middle one. */
  readonly supportLevels: readonly string[];
  readonly links: readonly { readonly a: string; readonly b: string; readonly kind: string }[];
  readonly factions: readonly { readonly id: string; readonly name: string; readonly color: string }[];
  readonly status: {
    readonly campaign: string | null;
    readonly phase: string;
    readonly cardIndex: number;
    readonly propagandaRound: number;
    readonly card: CardView | null;
    readonly pending?: GameState["pending"];
    readonly modifiers?: readonly {readonly id: string; readonly title: string; readonly duration: "game" | "untilReset"}[];
    /** Cards left face down in the draw piles, and cards already played. */
    readonly deckCount: number;
    readonly playedCount: number;
    /** Propaganda phase IDs and the open one (05 s6). */
    readonly propagandaPhases: readonly string[];
    readonly propagandaStep: number;
    /** Emergency Rule steps the State may move to in the Legitimacy phase (07 s8.2). */
    readonly emergencyMoves: readonly string[];
    readonly active: string | null;
    readonly firstEligible: string | null;
    readonly secondEligible: string | null;
    readonly boxes: Readonly<Record<string, string | null>>;
    /** Tracks with their range (numeric) or steps (ordinal), for the status pills (R4). */
    readonly tracks: readonly { readonly id: string; readonly display: string; readonly value: string | number; readonly min?: number; readonly max?: number; readonly steps?: readonly string[] }[];
    readonly scores: Readonly<Record<string, number>>;
    readonly thresholds: Readonly<Record<string, number>>;
    readonly margins: Readonly<Record<string, number>>;
    readonly harm: Readonly<Record<string, number>>;
    readonly harmLimit: number;
    readonly ended: GameState["ended"];
  };
}

function cardView(ruleset: Ruleset, id: string): CardView {
  const c = ruleset.cards[id];
  const side = (s: NonNullable<typeof c>["unshaded"] | undefined): CardView["unshaded"] => (s === null || s === undefined ? null : { text: s.text, owner: s.owner, blockOnly: s.blockOnly });
  return { id, title: c?.title ?? id, type: c?.type ?? "unknown", encoded: c?.encoded ?? false, unshaded: side(c?.unshaded), shaded: side(c?.shaded) };
}

export function boardView(ruleset: Ruleset, data: PackageData, state: GameState): BoardView {
  const view = derive(ruleset, state);
  const factions = new Map(data.factions.map((f) => [f.id, f]));
  const levels = data.map.supportLevels ?? [];
  const middle = (levels.length - 1) / 2;
  const hidden = new Set(data.markers.filter((m) => m.hidden === true).map((m) => m.id));
  const spaces = data.map.spaces.map((s): SpaceView => {
    const here = state.spaces[s.id];
    const level = here?.level ?? null;
    return {
      id: s.id,
      name: s.name,
      kind: s.kind,
      terrain: s.terrain ?? null,
      pop: s.pop,
      x: s.layout.x,
      y: s.layout.y,
      level: s.hasSupportScale ? level : null,
      levelName: s.hasSupportScale && level !== null ? (levels[middle + level] ?? null) : null,
      control: view.control[s.id] ?? null,
      pieces: data.pieces.flatMap((p) =>
        Object.entries(here?.pieces[p.id] ?? {})
          .filter(([, n]) => n > 0)
          .map(([face, count]) => ({
            piece: p.id, faction: p.faction, face, count, shape: p.shape, colorVariant: p.colorVariant ?? "base", isBase: p.isBase,
            emblem: p.emblem !== undefined && (p.emblemState === undefined || p.emblemState === face) ? p.emblem : null,
          })),
      ),
      markers: data.markers.flatMap((m) => Object.entries(here?.markers[m.id] ?? {}).filter(([, n]) => n > 0).map(([side, count]) => ({ marker: m.id, side, count, hidden: hidden.has(m.id) }))),
      tags: s.tags ?? [],
      confidence: s.confidence ?? null,
    };
  });
  const card = state.deck.currentCard;
  const forces = data.pieces.map((p): ForceView => ({
    piece: p.id, faction: p.faction, shape: p.shape, colorVariant: p.colorVariant ?? "base", isBase: p.isBase, states: p.states ?? [],
    onMap: Object.values(state.spaces).reduce((sum, sp) => sum + Object.values(sp.pieces[p.id] ?? {}).reduce((a, n) => a + n, 0), 0),
    available: state.pools[p.id]?.available ?? 0,
    outOfPlay: state.pools[p.id]?.outOfPlay ?? 0,
  }));
  return {
    spaces,
    forces,
    supportLevels: levels,
    links: data.map.links.map((l) => ({ a: l.a, b: l.b, kind: l.kind })),
    factions: data.factions.map((f) => ({ id: f.id, name: f.name, color: factions.get(f.id)?.color ?? f.color })),
    status: {
      pending: state.pending,
      campaign: state.turn.campaign,
      phase: state.turn.phase,
      cardIndex: state.turn.cardIndex,
      propagandaRound: state.turn.propagandaRound,
      card: card === null ? null : cardView(ruleset, card),
      modifiers: state.modifiers.map(m => ({id: m.id, title: ruleset.cards[m.sourceCard]?.title ?? m.sourceCard, duration: m.duration})),
      deckCount: state.deck.piles.reduce((n, pile) => n + pile.length, 0),
      playedCount: state.deck.played.length,
      propagandaPhases: ruleset.sequence.propagandaPhases,
      propagandaStep: state.turn.step,
      emergencyMoves: emergencyMoves(ruleset, state),
      active: activeFaction(state),
      firstEligible: state.initiative.firstEligible,
      secondEligible: state.initiative.secondEligible,
      boxes: state.initiative.boxes,
      tracks: data.tracks.map((t) => ({
        id: t.id, display: t.display, value: state.tracks[t.id] ?? "",
        ...(t.kind === "numeric" ? { min: t.min, max: t.max } : { steps: t.steps }),
      })),
      scores: view.scores,
      thresholds: ruleset.scenarios[state.meta.scenarioId]?.thresholds ?? {},
      margins: view.margins,
      harm: view.harm,
      harmLimit: Object.hasOwn(ruleset.parameters, "harm.limit") ? param(ruleset, "harm.limit", "number") : 0,
      ended: state.ended,
    },
  };
}
