// parameters.yaml (04 s4.5). V-PARAM (every `tune` entry has a value) runs in the loader (P1-05).
import { z } from "zod";
import { elementList, id, text } from "./common.ts";

const scalar = z.union([z.int(), text]);

export const parametersSchema = elementList(
  z.strictObject({
    id,
    value: z.union([scalar, z.array(scalar)]).optional(),
    tune: z.boolean(),
    source: text.optional(),
  }),
);
