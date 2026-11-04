// Closed modifier IDs for C1 to C3. Parameters on each card supply all numeric limits.
export const MOD = {ernk: "ernk", tribalAllies: "tribal-allies", extraAgitate: "extra-agitate", academy: "academy", rivals: "rivals", ambush: "ambush", strikeForce: "strike-force", khk430: "khk-430", pressProsecutions: "press-prosecutions", pressReporting: "press-reporting"} as const;

export const MOD_PARAMS: Readonly<Record<string, readonly string[]>> = {
  [MOD.ernk]: [], [MOD.tribalAllies]: [], [MOD.extraAgitate]: ["maxSpaces"], [MOD.academy]: ["extra"],
  [MOD.rivals]: ["reduction"], [MOD.ambush]: ["maxSpaces"], [MOD.strikeForce]: ["maxTroops", "maxSpaces"],
  [MOD.khk430]: [], [MOD.pressProsecutions]: ["extra"], [MOD.pressReporting]: ["extra"],
};
