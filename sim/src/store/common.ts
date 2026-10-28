// Store helpers: clock, JSON columns and compressed content (06 s3).
import { gunzipSync, gzipSync } from "node:zlib";

/** Store clock: ISO 8601 UTC. Never read by the engine (05 s8 item 4). */
export function now(): string {
  return new Date().toISOString();
}

/** Text for a JSON column. Throws on a value JSON cannot hold, so the transaction rolls back. */
export function json(value: unknown): string {
  const text = JSON.stringify(value) as string | undefined;
  if (text === undefined) throw new TypeError("Value has no JSON form");
  return text;
}

export function pack(text: string): Buffer {
  return gzipSync(Buffer.from(text, "utf8"));
}

export function unpack(content: Buffer): string {
  return gunzipSync(content).toString("utf8");
}
