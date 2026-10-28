// scenarios/*.yaml (04 s4.10). V-PIECES, V-STACK and V-OPTIONS run in the loader.
import { z } from "zod";
import { count, id, idList, optionValue, text } from "./common.ts";

/** A count, or counts per flip state or side. */
const faceCounts = z.union([count, z.record(id, count)]);

const spaceSetup = z.strictObject({
  /** Signed steps from Neutral, positive toward Support (DEC-36). */
  level: z.int().optional(),
  pieces: z.record(id, faceCounts).optional(),
  markers: z.record(id, faceCounts).optional(),
});

export const scenarioSchema = z.strictObject({
  id,
  title: text,
  campaigns: idList(1),
  /** Propaganda round that ends the game. */
  finalRound: count.min(1),
  /** Event cards per Campaign pile. Absent: the research pile size (05 s1.1). */
  pileSize: count.min(1).optional(),
  tracks: z.record(id, z.union([z.int(), id])),
  spaces: z.record(id, spaceSetup),
  available: z.record(id, count).optional(),
  outOfPlay: z.record(id, count).optional(),
  pivotals: z.record(id, idList(0)).optional(),
  flags: z.record(id, z.boolean()).optional(),
  thresholds: z.record(id, z.int()).optional(),
  options: z.record(id, optionValue).optional(),
  excludedCards: z.array(z.strictObject({ card: id, reason: text })).optional(),
  testOnly: z.boolean().optional(),
});
