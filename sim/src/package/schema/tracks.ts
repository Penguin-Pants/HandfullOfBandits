// tracks.yaml (04 s4.4). Numeric tracks have a range. Ordinal tracks have named steps.
import { z } from "zod";
import { elementList, id, idList, ruleMeta, text } from "./common.ts";

const shared = { id, owner: id.optional(), display: text, ...ruleMeta };

export const tracksSchema = elementList(
  z.discriminatedUnion("kind", [
    z
      .strictObject({
        ...shared,
        kind: z.literal("numeric"),
        min: z.int(),
        max: z.int(),
        /** A loss this track cannot pay costs the value of `costParam` per unpaid point on `track` (DEC-41). */
        overflow: z.strictObject({ track: id, costParam: id }).optional(),
      })
      .refine((track) => track.min <= track.max, { message: "min must not exceed max", path: ["max"] }),
    z.strictObject({ ...shared, kind: z.literal("ordinal"), steps: idList(2) }),
  ]),
);
