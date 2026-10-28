// ULID (https://github.com/ulid/spec): 48-bit milliseconds then 80 random bits, Crockford base32.
// IDs are made in the store, never in the engine (06 s2).
import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function ulid(time: number = Date.now(), random: Uint8Array = randomBytes(10)): string {
  let out = "";
  let t = time;
  for (let i = 0; i < 10; i++) {
    out = (ALPHABET[t % 32] ?? "") + out;
    t = Math.floor(t / 32);
  }
  let bits = 0;
  let value = 0;
  for (const byte of random) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += ALPHABET[(value >> bits) & 31] ?? "";
    }
    value &= (1 << bits) - 1;
  }
  return out;
}
