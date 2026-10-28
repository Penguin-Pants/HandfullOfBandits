// manifest.yaml (04 s3).
import { z } from "zod";
import { id, optionValue, text } from "./common.ts";

const semver = z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, "Use semver MAJOR.MINOR.PATCH");
const rulesetVersion = z.string().regex(/^R(0|[1-9]\d*)$/, "Use R<integer>");

export const manifestSchema = z.strictObject({
  packageId: id,
  version: semver,
  rulesetVersion,
  /** Keep 1 until Phase 2 ends (11 P1-04). */
  schemaVersion: z.literal(1),
  parent: z.strictObject({ version: semver, rulesetVersion }).optional(),
  changeDescription: text,
  title: text,
  /** Rule modules as `id@major`, for example `kurdish-coin.village-clearance@1`. */
  modules: z.array(z.string().regex(/^[a-z0-9][a-z0-9.-]*@(0|[1-9]\d*)$/, "Use id@major")),
  /** Competing options (ALT and PA choices) with their allowed values. */
  options: z.record(id, z.strictObject({ values: z.array(optionValue).min(2), description: text.optional() })).optional(),
  researchBase: text.optional(),
});
