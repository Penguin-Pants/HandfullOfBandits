// Readers for untrusted plan JSON (05 s3.1): commands come from outside the engine.
import type { JsonObject, JsonValue } from "../../core/types.ts";

export function asObject(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : null;
}

export function asList(value: unknown): readonly JsonValue[] {
  return Array.isArray(value) ? (value as JsonValue[]) : [];
}

/** A non-negative safe integer, `fallback` when absent, or null when present but invalid. */
export function asCount(value: unknown, fallback = 0): number | null {
  if (value === undefined) return fallback;
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/** Moves `[{from, to?, count}]` in a location's choices. Null: malformed. */
export function asMoves(value: unknown): { readonly from: string; readonly to: string | null; readonly count: number }[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  const moves = [];
  for (const item of value as unknown[]) {
    const o = asObject(item);
    const from = asString(o?.["from"]);
    const to = o?.["to"] === undefined ? null : asString(o["to"]);
    const count = asCount(o?.["count"], -1);
    if (o === null || from === null || (o["to"] !== undefined && to === null) || count === null || count < 1) return null;
    moves.push({ from, to, count });
  }
  return moves;
}
