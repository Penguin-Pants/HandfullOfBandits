// Rule module registry (03 s6). `package` imports only this file (03 s5), for V-FACTIONS and V-MODULE.
import { CT_PLAYERS } from "../coin/sequence/ct.ts";

/** Sequence models by `id@major`, with the player faction count each one supports (04 s4.1). */
export const sequenceModels: Readonly<Record<string, { readonly players: number }>> = {
  "ct-two-faction@1": { players: CT_PLAYERS },
};
