// Structural switches (research 10 s6.2; 11 P3c-01). Parameters `switch.on.<Campaign>` and
// `switch.off.<Campaign>` list the flags that entering the Campaign sets true or false. Setup sets
// the result of every Campaign up to the first one; each Reset applies the Campaign it enters.
// A flag that no row changes keeps its value, so an event may set one earlier (10 s6.2 column 4).
import type { Exec } from "../core/exec.ts";
import { param } from "../core/params.ts";
import type { Ruleset } from "../core/types.ts";

const ruleRef = "10 s6.2";

export const SWITCH = {
  hotPursuit: "hotPursuit",
  villageClearance: "villageClearance",
  covertAction: "covertAction",
  declareCeasefire: "declareCeasefire",
  extendedPowers: "extendedPowers",
  returnByCivicAction: "returnByCivicAction",
} as const;

function row(ruleset: Ruleset, way: "on" | "off", campaign: string): string[] {
  const id = `switch.${way}.${campaign}`;
  return Object.hasOwn(ruleset.parameters, id) ? param(ruleset, id, "list").map(String) : [];
}

function order(ruleset: Ruleset): string[] {
  return Object.hasOwn(ruleset.parameters, "campaign.order") ? param(ruleset, "campaign.order", "list").map(String) : [];
}

/** The flag changes on entering `campaign`, in row order: on, then off. */
function changes(ruleset: Ruleset, campaign: string): [string, boolean][] {
  return [...row(ruleset, "on", campaign).map((f): [string, boolean] => [f, true]), ...row(ruleset, "off", campaign).map((f): [string, boolean] => [f, false])];
}

/** Every switch flag after entering every Campaign up to `campaign` in order (setup, 10 s1). A flag no row has set yet is false. */
export function switchesAt(ruleset: Ruleset, campaign: string | null): Readonly<Record<string, boolean>> {
  const campaigns = order(ruleset);
  if (campaign === null || !campaigns.includes(campaign)) return {};
  const all = campaigns.flatMap((c) => changes(ruleset, c)).map(([flag]): [string, boolean] => [flag, false]);
  return Object.fromEntries([...all, ...campaigns.slice(0, campaigns.indexOf(campaign) + 1).flatMap((c) => changes(ruleset, c))]);
}

/** Reset (05 s6.8): apply the rows of the Campaign the game enters. Logs only real changes. */
export function enterCampaign(ctx: Exec, campaign: string | null): void {
  if (campaign === null) return;
  for (const [flag, value] of changes(ctx.ruleset, campaign)) {
    if ((ctx.state.flags[flag] ?? false) !== value) ctx.apply({ type: "setFlag", flag, value, ruleRef, assumptionRef: null });
  }
}

/** The first Campaign that switches `flag` on, for messages. */
export function switchFrom(ruleset: Ruleset, flag: string): string {
  const found = order(ruleset).find((c) => row(ruleset, "on", c).includes(flag));
  if (found === undefined) throw new RangeError(`No Campaign switches "${flag}" on`);
  return found;
}

/** A package with Campaigns but no switch rows predates P3c-01: its switch gates never open. */
export function lacksSwitches(ruleset: Ruleset): boolean {
  return order(ruleset).length > 0 && !Object.keys(ruleset.parameters).some((id) => id.startsWith("switch."));
}
