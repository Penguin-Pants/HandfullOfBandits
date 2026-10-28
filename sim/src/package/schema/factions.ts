// factions.yaml (04 s4.1). V-FACTIONS (player count fits the sequence model) runs in the loader.
import { z } from "zod";
import { elementList, id, idList, ruleMeta, text } from "./common.ts";

export const factionsSchema = elementList(
  z.strictObject({
    id,
    name: text,
    color: text,
    kind: z.enum(["player", "nonPlayer"]),
    resourcesTrack: id.optional(),
    pivotalHand: idList(0).optional(),
    ...ruleMeta,
  }),
);
