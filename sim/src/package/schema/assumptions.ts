// assumptions.yaml (04 s7): one entry per prototype assumption (PA) from 02-rules-gap-analysis.md.
import { z } from "zod";
import { elementList, id, idList, text } from "./common.ts";

export const assumptionsSchema = elementList(
  z.strictObject({
    id: z.string().regex(/^PA-\d{2}$/, "Use PA-nn"),
    gap: id,
    text,
    appliesTo: idList(1),
    status: z.enum(["provisional", "accepted", "replaced"]),
  }),
);
