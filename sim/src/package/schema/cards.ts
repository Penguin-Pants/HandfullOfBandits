// cards/*.yaml (04 s4.8, s5; 11 P2-05). Each file is a list of cards. Effects and conditions use
// the `type` key form of victory.yaml. `count` is an integer or `{min, max}` (DEC-41).
// IDs inside effects are checked by the loader (V-EFFECT); deck rules by V-CARDS and V-ENCODE.
import { z } from "zod";
import type { CardEffect, SpaceCondition } from "../../engine/core/types.ts";
import { count, elementList, id, idList, text, uniqueList } from "./common.ts";
import { spaceKind, terrain } from "./map.ts";

const condition: z.ZodType<SpaceCondition> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("spaceKind"), kind: spaceKind }),
    z.strictObject({ type: z.literal("terrainIn"), terrain: uniqueList(terrain, 1) }),
    z.strictObject({ type: z.literal("spaceLevelIn"), levels: uniqueList(z.int(), 1) }),
    z.strictObject({ type: z.literal("control"), faction: id }),
    z
      .strictObject({ type: z.literal("spaceHas"), pieces: idList(0).default([]), markers: idList(0).default([]) })
      .refine((c) => c.pieces.length + c.markers.length > 0, { message: "List at least one piece or marker", path: ["pieces"] }),
    z.strictObject({ type: z.literal("all"), of: z.array(condition).min(1) }),
    z.strictObject({ type: z.literal("any"), of: z.array(condition).min(1) }),
    z.strictObject({ type: z.literal("not"), of: condition }),
    z.strictObject({ type: z.literal("adjacentTo"), space: id }),
    z.strictObject({ type: z.literal("selected") }),
    z.strictObject({ type: z.literal("trackAtLeast"), track: id, value: z.int() }),
    z.strictObject({ type: z.literal("trackAtMost"), track: id, value: z.int() }),
    z.strictObject({ type: z.literal("trackIn"), track: id, values: idList(1) }),
    z.strictObject({ type: z.literal("flag"), flag: id, value: z.boolean() }),
  ]),
);

const countSpec = z.union([
  count,
  z.strictObject({ min: count, max: count }).refine((c) => c.min <= c.max, { message: "min must not exceed max", path: ["max"] }),
]);
const pool = z.enum(["available", "outOfPlay"]);
const nullableId = id.nullable().default(null);

const effect: z.ZodType<CardEffect> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("placePieces"), piece: id, count: countSpec, space: id, state: nullableId }),
    z.strictObject({ type: z.literal("removePieces"), piece: id, state: nullableId, count: countSpec, space: id, to: pool.default("available") }),
    z.strictObject({ type: z.literal("movePieces"), piece: id, state: nullableId, toState: nullableId, count: countSpec, from: id, to: id }),
    z.strictObject({ type: z.literal("setPieceState"), piece: id, space: id, from: id, to: id, count: z.union([count, z.literal("all")]) }),
    z.strictObject({ type: z.literal("transferPool"), piece: id, from: pool, to: pool, count: z.union([count, z.literal("all")]) }),
    z.strictObject({ type: z.literal("adjustTrack"), track: id, delta: z.int() }),
    z.strictObject({ type: z.literal("setTrack"), track: id, value: z.union([z.int(), id]), ifEquals: z.union([z.int(), id]).nullable().default(null) }),
    z.strictObject({ type: z.literal("stepOrdinal"), track: id, direction: z.enum(["next", "previous"]), steps: count.min(1) }),
    z.strictObject({ type: z.enum(["placeMarker", "removeMarker", "flipMarker"]), marker: id, space: id, side: nullableId }),
    z.strictObject({ type: z.literal("setFlag"), flag: id, value: z.boolean() }),
    z.strictObject({ type: z.literal("shiftLevel"), space: id, direction: z.enum(["support", "opposition", "neutral"]), steps: count.min(1) }),
    z.strictObject({ type: z.literal("choice"), options: z.array(z.strictObject({ label: text, effects: z.array(effect) })).min(2) }),
    z.strictObject({ type: z.literal("conditional"), if: condition, then: z.array(effect), else: z.array(effect).default([]) }),
    z
      .strictObject({ type: z.literal("forEachSpace"), where: condition, min: count, max: count.min(1), effects: z.array(effect).min(1) })
      .refine((e) => e.min <= e.max, { message: "min must not exceed max", path: ["max"] }),
    z.strictObject({ type: z.literal("freeAction"), action: id, constraints: z.record(z.string(), z.json()).default({}) }),
  ]),
);

const side = z.strictObject({
  /** Exact prose from the deck CSV. Never edited by the encoder (04 s4.8). */
  text,
  owner: id.nullable(),
  effects: z.array(effect),
  blockOnly: z.boolean().default(false),
  tier: z.enum(["T0", "T1", "T2", "T3"]).optional(),
});

export const cardsSchema = elementList(
  z
    .strictObject({
      id,
      campaign: id,
      title: text,
      date: text.optional(),
      type: z.enum(["event", "capability", "momentum", "pivotal", "propaganda"]),
      mandatory: z.boolean().default(false),
      always: z.array(effect).default([]),
      unshaded: side.optional(),
      shaded: side.optional(),
      chainAfter: idList(0).default([]),
      encoding: z.strictObject({
        status: z.enum(["encoded", "notEncoded"]),
        encodedBy: text.optional(),
        reviewedAgainstText: z.boolean(),
        note: text.optional(),
      }),
      eventConfidence: z.enum(["High", "Moderate", "Low"]).optional(),
      deckEligible: z.boolean(),
      sources: idList(0).optional(),
    })
    .refine((card) => card.encoding.status === "notEncoded" || card.type === "propaganda" || (card.unshaded !== undefined && card.shaded !== undefined), {
      message: "An encoded card needs both sides",
      path: ["encoding", "status"],
    }),
);
