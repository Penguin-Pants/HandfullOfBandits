// victory.yaml subset (04 s4.9, s8): scores, Harm counts and named totals as formula terms.
// harmLimit, checkSkipFirstRound, tieOrder, finalMargin and recordSheet come with P3a.
// IDs and levels in terms are checked by the loader (V-REF, V-RANGE, V-VICTORY).
import { z } from "zod";
import type { FormulaTerm, SpaceCondition } from "../../engine/core/types.ts";
import { count, id, idList, uniqueList } from "./common.ts";
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
  ]),
);

const where = condition.nullable().default(null);

const term: z.ZodType<FormulaTerm> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("sumPopWhere"), where: condition }),
    z.strictObject({ type: z.literal("countPieces"), pieces: idList(1), where }),
    z.strictObject({ type: z.literal("countMarkers"), markers: idList(1), sides: idList(1).nullable().default(null), where }),
    z.strictObject({ type: z.literal("trackValue"), track: id }),
    z.strictObject({ type: z.literal("divideFloor"), of: term, by: count.min(1) }),
    z.strictObject({ type: z.literal("multiply"), of: term, by: z.int() }),
    z.strictObject({ type: z.literal("add"), terms: z.array(term).min(1) }),
    z.strictObject({ type: z.literal("constant"), value: z.int() }),
  ]),
);

/** A sum of terms. */
const terms = z.array(term).min(1);

export const victorySchema = z.strictObject({
  scores: z.record(id, terms),
  harmCount: z.record(id, terms),
  totals: z.record(id, terms).default({}),
});
