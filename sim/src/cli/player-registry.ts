// Player IDs for experiments (19 s4). Qualified families come from strategies/roster.ts;
// controls wrap the legacy research 12 s7 policies; baselines are random-legal, scripted and the
// rare-system probes (strategies/probe.ts).
import type { FactionId } from "../engine/core/types.ts";
import { fullStateControl, randomLegal, type Player } from "./players.ts";
import { probePlayer } from "./strategies/probe.ts";
import { rosterPlayer } from "./strategies/roster.ts";
import { searchPlayer } from "./strategies/search.ts";
import { strategyNames } from "./strategies/index.ts";

/** Faction-specific legacy controls (19 s4). */
export const CONTROLS: Readonly<Record<FactionId, readonly string[]>> = { state: ["concentration", "civic-action", "emergency-rule"], pkk: ["sanctuary", "concealment", "coerce-only"] };

/** Resolve `<family>@<version>`; throws for an unknown ID. */
export function resolvePlayer(id: string): Player {
  const match = /^(.+)@(\d+)$/.exec(id);
  if (match === null) throw new RangeError(`Player ID ${id} must be <family>@<version>`);
  const [, family = "", version = ""] = match;
  const faction = family.startsWith("S-") ? "state" : family.startsWith("P-") ? "pkk" : null;
  if (faction === null) throw new RangeError(`Player ID ${id} must start with S- or P-`);
  const control = /^[SP]-CTRL-(.+)$/.exec(family)?.[1];
  let player: Player | null;
  if (family.endsWith("-RANDOM")) player = randomLegal(faction);
  else if (family.endsWith("-PROBE")) player = probePlayer(faction);
  else if (family.endsWith("-SEARCH")) player = searchPlayer(family, Number(version));
  else if (control !== undefined && (strategyNames as readonly string[]).includes(control) && (control === "scripted" || (CONTROLS[faction] ?? []).includes(control))) player = fullStateControl(control, faction);
  else player = rosterPlayer(family, Number(version));
  if (player?.spec.id !== id || player.spec.faction !== faction || String(player.spec.version) !== version) throw new RangeError(`Unknown player ${id}`);
  return player;
}
