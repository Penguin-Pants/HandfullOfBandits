// Turn phase IDs held in `state.turn.phase` (05 s6). Propaganda phase IDs come from sequence.yaml (P2-10).
export const PHASE = {
  /** After start, before the first card is revealed. */
  setup: "setup",
  /** An Event card is face up and factions act on it (research 05 s2.2). */
  card: "card",
  ended: "ended",
} as const;
