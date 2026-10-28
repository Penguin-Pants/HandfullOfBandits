// Resources phase (research 05 s6.2): State and PKK income, maximum 50 by the track range.
import { param } from "../../core/params.ts";
import type { GameState, Ruleset } from "../../core/types.ts";
import { controlOf, count, isTerrain } from "../ops/common.ts";
import { postureOf } from "../ops/common-pkk.ts";
import { FACTION, HOST_OF, MARKER, PIECE, POSTURE, SYRIA_BOX, TERRAIN, TRACK } from "../ops/ids.ts";
import type { PropagandaPhase } from "./phase.ts";

const ruleRef = "05 s6.2";

/** Income per faction for the current board. */
export function income(ruleset: Ruleset, state: GameState): { state: number; pkk: number } {
  const legit = Number(state.tracks[TRACK.legitimacy]);
  const bases = ruleset.spaces
    .filter((s) => isTerrain(ruleset, s.id, TERRAIN.mountain, TERRAIN.plain) && s.kind === "domestic" && controlOf(ruleset, state, s.id) === FACTION.state && count(state, s.id, PIECE.stateBase) > 0)
    .reduce((sum, s) => sum + s.pop, 0);
  const stateIncome = param(ruleset, "income.state.base", "number") + Math.floor(legit / param(ruleset, "income.state.legitimacyDivisor", "number")) + bases;
  const domestic = ruleset.spaces.filter((s) => s.kind === "domestic").reduce((sum, s) => sum + count(state, s.id, PIECE.pkkBase), 0);
  const open = (box: string): boolean => [POSTURE.host, POSTURE.tolerant].includes(postureOf(state, box) as "host");
  const external = Object.keys(HOST_OF).filter(open).reduce((sum, box) => sum + count(state, box, PIECE.pkkBase), 0);
  const present = (state.spaces[SYRIA_BOX]?.markers[MARKER.leadership]?.["present"] ?? 0) > 0;
  const syria = postureOf(state, SYRIA_BOX);
  const leadership = !present ? 0 : syria === POSTURE.host ? param(ruleset, "income.pkk.leadershipHost", "number") : syria === POSTURE.tolerant ? param(ruleset, "income.pkk.leadershipTolerant", "number") : 0;
  const europe = param(ruleset, "europe.income", "list")[Number(state.tracks[TRACK.europe])];
  const pkkIncome =
    domestic * param(ruleset, "income.pkk.domesticBase", "number") + external * param(ruleset, "income.pkk.externalBase", "number") + leadership + (typeof europe === "number" ? europe : 0);
  return { state: stateIncome, pkk: pkkIncome };
}

export const resourcesPhase: PropagandaPhase = {
  id: "resources",
  ruleRef,
  check: () => [],
  run(ctx) {
    const gain = income(ctx.ruleset, ctx.state);
    for (const faction of [FACTION.state, FACTION.pkk] as const) {
      const track = ctx.ruleset.factions.find((f) => f.id === faction)?.resourcesTrack ?? null;
      if (track !== null) ctx.apply({ type: "adjustTrack", track, delta: gain[faction], ruleRef, assumptionRef: null });
      ctx.write((s) => ({ ...s, history: { ...s.history, [`income.${faction}`]: gain[faction] } }));
    }
  },
};
