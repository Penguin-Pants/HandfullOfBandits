// map.yaml (04 s4.3). V-LINKS and V-STACK run in the loader.
import { z } from "zod";
import { count, elementList, id, idList, ruleMeta, text, uniqueList } from "./common.ts";

const terrain = z.enum(["mountain", "plain", "city"]);
const spaceKind = z.enum(["domestic", "external"]);

const space = z
  .strictObject({
    id,
    name: text,
    kind: spaceKind,
    /** External boxes may set terrain for Cross-Border. */
    terrain: terrain.optional(),
    pop: count,
    hasSupportScale: z.boolean(),
    layout: z.strictObject({ x: z.int(), y: z.int() }),
    confidence: text.optional(),
    tags: idList(0).optional(),
    ...ruleMeta,
  })
  .refine((s) => s.kind === "external" || s.terrain !== undefined, {
    message: "A domestic space needs terrain",
    path: ["terrain"],
  });

const link = z.strictObject({
  a: id,
  b: id,
  kind: z.enum(["land", "external"]),
  /** Posture gate: the link is open only while the track is at one of these steps. */
  gate: z.strictObject({ track: id, steps: idList(1) }).optional(),
  ...ruleMeta,
});

/** At most `max` of the listed piece types in each space that matches every filter given. */
const stackingRule = z.strictObject({
  pieces: idList(1),
  max: count,
  spaceKind: spaceKind.optional(),
  terrain: uniqueList(terrain, 1).optional(),
  spaces: idList(1).optional(),
  ...ruleMeta,
});

export const mapSchema = z.strictObject({
  /** Level IDs from Opposition to Support. Odd length; the middle item is Neutral (DEC-39). */
  supportLevels: idList(1)
    .refine((levels) => levels.length % 2 === 1, "Use an odd number of levels, with Neutral in the middle")
    .optional(),
  spaces: elementList(space),
  links: z.array(link),
  stacking: z.array(stackingRule),
});
