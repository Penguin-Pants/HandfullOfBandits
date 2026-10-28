// Seeded random source for the engine (05 s8, DEC-11).
// Generator: xoshiro128** 1.1 by Blackman and Vigna (https://prng.di.unimi.it/).
// Seeding: two SplitMix64 outputs fill the four 32-bit state words, low word first,
// as the authors recommend. SplitMix64 never yields an all-zero state.
// Every function is pure: it returns the drawn value and the next state.

export type RngState = readonly [number, number, number, number];

export interface Drawn<T> {
  readonly value: T;
  readonly rng: RngState;
}

const UINT32_RANGE = 2 ** 32;
const MASK64 = (1n << 64n) - 1n;

function splitMix64(x: bigint): { x: bigint; value: bigint } {
  const next = (x + 0x9e3779b97f4a7c15n) & MASK64;
  let z = next;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK64;
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK64;
  return { x: next, value: z ^ (z >> 31n) };
}

function low32(v: bigint): number {
  return Number(v & 0xffffffffn);
}

function high32(v: bigint): number {
  return Number(v >> 32n);
}

/** Builds the generator state from a session seed (06 s3: integer). */
export function seedRng(seed: number): RngState {
  if (!Number.isSafeInteger(seed) || seed < 0) {
    throw new RangeError(`Seed must be a safe integer >= 0, got ${String(seed)}`);
  }
  const first = splitMix64(BigInt(seed));
  const second = splitMix64(first.x);
  return [low32(first.value), high32(first.value), low32(second.value), high32(second.value)];
}

function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/** One xoshiro128** step: a uniform 32-bit unsigned integer. */
export function nextUint32(rng: RngState): Drawn<number> {
  let [s0, s1, s2, s3] = rng;
  const value = Math.imul(rotl(Math.imul(s1, 5) >>> 0, 7), 9) >>> 0;
  const t = (s1 << 9) >>> 0;
  s2 = (s2 ^ s0) >>> 0;
  s3 = (s3 ^ s1) >>> 0;
  s1 = (s1 ^ s2) >>> 0;
  s0 = (s0 ^ s3) >>> 0;
  s2 = (s2 ^ t) >>> 0;
  s3 = rotl(s3, 11);
  return { value, rng: [s0, s1, s2, s3] };
}

/**
 * Uniform integer in [0, bound). Draws in the top partial block are rejected,
 * so the result has no modulo bias.
 */
export function randomInt(rng: RngState, bound: number): Drawn<number> {
  if (!Number.isInteger(bound) || bound < 1 || bound > UINT32_RANGE) {
    throw new RangeError(`Bound must be an integer in [1, 2^32], got ${String(bound)}`);
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % bound);
  let state = rng;
  for (;;) {
    const drawn = nextUint32(state);
    state = drawn.rng;
    if (drawn.value < limit) return { value: drawn.value % bound, rng: state };
  }
}

/** Die roll in [1, sides]. */
export function rollDie(rng: RngState, sides = 6): Drawn<number> {
  if (!Number.isInteger(sides) || sides < 1) {
    throw new RangeError(`Sides must be an integer >= 1, got ${String(sides)}`);
  }
  const drawn = randomInt(rng, sides);
  return { value: drawn.value + 1, rng: drawn.rng };
}

/** One item, each with equal chance. */
export function pickRandom<T>(rng: RngState, items: readonly T[]): Drawn<T> {
  if (items.length === 0) throw new RangeError("Cannot pick from an empty list");
  const drawn = randomInt(rng, items.length);
  return { value: items[drawn.value] as T, rng: drawn.rng };
}

/** Fisher-Yates shuffle from the last index down. Returns a new list. */
export function shuffle<T>(rng: RngState, items: readonly T[]): Drawn<T[]> {
  const result = [...items];
  let state = rng;
  for (let i = result.length - 1; i > 0; i--) {
    const drawn = randomInt(state, i + 1);
    state = drawn.rng;
    const j = drawn.value;
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return { value: result, rng: state };
}
