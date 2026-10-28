// sequence.yaml (04 s4.6): the sequence model and its initiative track.
// Box IDs are a closed set, because the engine reads each box's meaning (research 05 s2.2).
// V-FACTIONS (player count fits the model) and V-REF run in the loader.
import { z } from "zod";
import { count, id, text, uniqueList } from "./common.ts";

export const boxId = z.enum(["event", "limitedOp", "opOnly", "opSa", "pass"]);

export const sequenceSchema = z.strictObject({
  /** Sequence model as `id@major` (03 s6). */
  model: z.string().regex(/^[a-z0-9][a-z0-9.-]*@(0|[1-9]\d*)$/, "Use id@major"),
  boxes: z
    .array(z.strictObject({ id: boxId, label: text }))
    .min(2)
    .refine((boxes) => new Set(boxes.map((b) => b.id)).size === boxes.length, "Box IDs must be unique"),
  /** Responder graph (research 05 s2.3): the Second Eligible may take a box adjacent to the First's box. */
  adjacency: z.array(uniqueList(boxId, 2).max(2)).min(1),
  /** First Eligible choices that make the other faction First Eligible on the next card (05 s2.4). */
  swapAfter: uniqueList(boxId, 1),
  firstEligibleAtStart: id,
  /** Resources gained by a Pass, per faction (05 s3.2). */
  passIncome: z.record(id, count),
  /** Propaganda phase handler IDs in order (research 05 s6). The loader checks them against the registry. */
  propagandaPhases: z.array(id).min(1),
  source: text.optional(),
});
