// Joint Propaganda choices with a bot seat (audit Plan 2 S1). Redeploy and Legal Politics take one
// command, State part first (rules 6.8, 8.6). When a bot holds the State seat, its part arrives
// first and the human PKK answers are added here; the server checks the joined command.

type Choice = Readonly<Record<string, unknown>>;

const obj = (v: unknown): Choice => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Choice) : {});

/** The bot State part joined with the human PKK answers of the same phase. */
export function withStatePart(phase: string, statePart: Choice, pkk: Choice): Choice {
  if (phase === "redeploy") return { ...pkk, troops: statePart["troops"] ?? [], police: statePart["police"] ?? [] };
  const state = obj(statePart["ceasefire"]);
  const mine = obj(pkk["ceasefire"]);
  const leave = { ...obj(state["leave"]), ...(obj(mine["leave"])["pkk"] === true ? { pkk: true } : {}) };
  const ceasefire = { ...state, ...(mine["pkkEnd"] === true ? { pkkEnd: true } : {}), ...(Object.keys(leave).length > 0 ? { leave } : {}) };
  return { ...statePart, ...(Object.keys(ceasefire).length > 0 ? { ceasefire } : {}) };
}

/** The State part in plain words, for the human PKK. */
export function statePartText(phase: string, statePart: Choice, name: (space: string) => string = (x) => x): string {
  if (phase === "redeploy") {
    const routes = ["troops", "police"].flatMap((p) => (Array.isArray(statePart[p]) ? (statePart[p] as Choice[]) : []).map((r) => `${String(r["count"])} ${p === "troops" ? "Troops" : "Police"} from ${name(String(r["from"]))} to ${name(String(r["to"]))}`));
    return routes.length === 0 ? "The State bot moves no Troops or Police." : `The State bot moves ${routes.join("; ")}.`;
  }
  const c = obj(statePart["ceasefire"]);
  const parts = [statePart["closureFiling"] === true ? "files a closure case" : null, c["accept"] === true ? "accepts the ceasefire" : null, obj(c["leave"])["state"] === true ? "leaves Reciprocal Restraint" : null].filter((x) => x !== null);
  return parts.length === 0 ? "The State bot makes no Legal Politics choice." : `The State bot ${parts.join(" and ")}.`;
}
