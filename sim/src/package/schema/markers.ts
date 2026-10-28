// markers.yaml (04 s4.4; research 04 s4).
import { z } from "zod";
import { count, elementList, id, idList, ruleMeta, uniqueList } from "./common.ts";

export const markersSchema = elementList(
  z.strictObject({
    id,
    count: count.min(1),
    /** Sides, for example [new, old]. Absent: one side. */
    sides: idList(2).optional(),
    hidden: z.boolean().optional(),
    /** Shift directions this marker blocks in its space. */
    blocks: uniqueList(z.enum(["support", "opposition"]), 1).optional(),
    /** No shift takes a level past ±capsLevel in a space with this marker (DEC-39). */
    capsLevel: count.optional(),
    ...ruleMeta,
  }),
);
