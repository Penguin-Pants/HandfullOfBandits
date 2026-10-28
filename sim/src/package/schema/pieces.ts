// pieces.yaml (04 s4.2). Shapes DEC-29, emblems DEC-30.
// `emblemState` and `placedAs` must name a flip state: V-REF in the loader.
import { z } from "zod";
import { count, elementList, id, idList, ruleMeta } from "./common.ts";

export const piecesSchema = elementList(
  z
    .strictObject({
      id,
      faction: id,
      count: count.min(1),
      isBase: z.boolean(),
      /** Flip states, for example [underground, active]. Absent: one face. */
      states: idList(2).optional(),
      placedAs: id.optional(),
      countsForControl: z.boolean(),
      movable: z.boolean(),
      startPool: z.enum(["available", "outOfPlay"]),
      shape: z.enum(["cube", "cylinder", "disc", "octagon"]),
      colorVariant: z.enum(["base", "light"]).optional(),
      emblem: z.enum(["crescentStar", "starCircle"]).optional(),
      emblemState: id.optional(),
      ...ruleMeta,
    })
    .refine((piece) => (piece.states === undefined) === (piece.placedAs === undefined), {
      message: "Set placedAs if and only if states is set",
      path: ["placedAs"],
    }),
);
