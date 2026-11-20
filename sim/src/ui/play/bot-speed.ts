// Bot pacing (R1.1 to R1.3): the wait before each bot action, the Bot menu choices that change it,
// and the last bot action's moves for the map. The speed is a browser setting, like SIGNAL_SETTING
// in ../propaganda/SignalPrompt.tsx.
import type { HistoryItem } from "../api.ts";

export const BOT_SPEED_SETTING = "hob.botSpeed";
export const BOT_SPEEDS = ["slow", "normal", "fast", "pause"] as const;
export type BotSpeedChoice = (typeof BOT_SPEEDS)[number];
/** Milliseconds before a bot action. Normal is the confirmed requirement; Slow and Fast are defaults. */
export const BOT_DELAYS: Readonly<Record<Exclude<BotSpeedChoice, "pause">, number>> = { slow: 3000, normal: 1500, fast: 500 };

export const savedBotSpeed = (): BotSpeedChoice => {
  const value = localStorage.getItem(BOT_SPEED_SETTING);
  return BOT_SPEEDS.find((s) => s === value) ?? "normal";
};

type Move = { readonly from: string; readonly to: string; readonly count: number };

/** The moves of a bot action, one per route, from its applied movePieces log entries; [] for a human action. */
export function botMoves(item: HistoryItem | undefined): Move[] {
  if (item === undefined || (item.bot ?? []).length === 0) return [];
  const moves = new Map<string, Move>();
  for (const e of item.entries) {
    if (e.kind !== "EffectApplied") continue;
    const d = JSON.parse(e.data) as { effect?: unknown; from?: unknown; to?: unknown; count?: unknown };
    if (d.effect !== "movePieces" || typeof d.from !== "string" || typeof d.to !== "string" || typeof d.count !== "number") continue;
    // One move logs one entry per piece face: add them into one arrow.
    const key = `${d.from}>${d.to}`;
    moves.set(key, { from: d.from, to: d.to, count: (moves.get(key)?.count ?? 0) + d.count });
  }
  return [...moves.values()];
}

export const BOT_SPEED_LABELS: Readonly<Record<BotSpeedChoice, string>> = { slow: "Slow", normal: "Normal", fast: "Fast", pause: "Pause" };

/** Save the Bot menu choice in the browser. */
export const saveBotSpeed = (speed: BotSpeedChoice): void => { localStorage.setItem(BOT_SPEED_SETTING, speed); };
