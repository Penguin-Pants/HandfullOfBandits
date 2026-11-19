// variants/<name>.yaml (audit Plan 4 V1): the setup fields one variant changes on its package.
// The loader applies it to the package in the same folder (package/variant.ts). Available is never
// set: it is derived from the piece totals (scenario.ts `available`).
import { z } from "zod";
import { count, id, packageHash } from "./common.ts";
import { spaceSetup } from "./scenario.ts";

export const variantSchema = z.strictObject({
  /** Hash of the package the variant was made on. A different package hash gives a warning. */
  base: packageHash,
  /** Scenario the variant changes. */
  scenario: id,
  thresholds: z.record(id, z.int()).optional(),
  tracks: z.record(id, z.union([z.int(), id])).optional(),
  /** Each entry replaces the scenario's whole entry for that space. `{}` empties the space. */
  spaces: z.record(id, spaceSetup).optional(),
  /** Piece totals (pieces.yaml `count`). */
  pieces: z.record(id, count.min(1)).optional(),
  outOfPlay: z.record(id, count).optional(),
});
