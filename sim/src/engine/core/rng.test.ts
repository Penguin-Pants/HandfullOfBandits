import { describe, expect, it } from "vitest";
import {
  nextUint32,
  pickRandom,
  randomInt,
  rollDie,
  seedRng,
  shuffle,
  type RngState,
} from "./rng.ts";

// T-DET (unit part). Known answers:
// - xoshiro128** from rand_xoshiro src/xoshiro128starstar.rs `reference` test,
//   which was produced with the reference C code (prng.di.unimi.it).
// - Seeded values from an independent Python reference whose SplitMix64 matches
//   rand_xoshiro src/splitmix64.rs `reference` test.

function draws(rng: RngState, count: number): { values: number[]; rng: RngState } {
  const values: number[] = [];
  let state = rng;
  for (let i = 0; i < count; i++) {
    const drawn = nextUint32(state);
    values.push(drawn.value);
    state = drawn.rng;
  }
  return { values, rng: state };
}

describe("nextUint32", () => {
  it("matches the xoshiro128** reference output for state [1, 2, 3, 4]", () => {
    expect(draws([1, 2, 3, 4], 10).values).toEqual([
      11520, 0, 5927040, 70819200, 2031721883, 1637235492, 1287239034, 3734860849, 3729100597,
      4258142804,
    ]);
  });

  it("does not change the input state", () => {
    const rng: RngState = [1, 2, 3, 4];
    nextUint32(rng);
    expect(rng).toEqual([1, 2, 3, 4]);
  });
});

describe("seedRng", () => {
  it.each([
    [0, [2065550767, 3793791033, 2713282036, 1853398634]],
    [1, [2298633409, 2433363436, 1703865447, 3203108257]],
    [42, [803958421, 3184996902, 2993090819, 686809907]],
    [Number.MAX_SAFE_INTEGER, [4021704095, 616124332, 3074421144, 818148089]],
  ])("fills the state from SplitMix64 for seed %i", (seed, state) => {
    expect(seedRng(seed)).toEqual(state);
  });

  it("gives the reference outputs after seeding", () => {
    expect(draws(seedRng(42), 6).values).toEqual([
      1776835114, 4165204688, 17111135, 2317295270, 2792088233, 2554630222,
    ]);
  });

  it.each([-1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1])("rejects seed %d", (seed) => {
    expect(() => seedRng(seed)).toThrow(RangeError);
  });
});

describe("randomInt", () => {
  it("rejects draws in the biased tail instead of using modulo", () => {
    // Seed 0: the first 4 outputs are at or above 2^31 + 1, the 5th is accepted.
    const bound = 2 ** 31 + 1;
    const result = randomInt(seedRng(0), bound);
    expect(result.value).toBe(1553311962);
    expect(result.rng).toEqual(draws(seedRng(0), 5).rng);
  });

  it("returns values in [0, bound)", () => {
    let rng = seedRng(3);
    for (let i = 0; i < 1000; i++) {
      const drawn = randomInt(rng, 7);
      expect(drawn.value).toBeGreaterThanOrEqual(0);
      expect(drawn.value).toBeLessThan(7);
      rng = drawn.rng;
    }
  });

  it("accepts the full 2^32 range", () => {
    expect(randomInt(seedRng(42), 2 ** 32).value).toBe(1776835114);
  });

  it.each([0, -1, 2.5, 2 ** 32 + 1])("rejects bound %d", (bound) => {
    expect(() => randomInt(seedRng(1), bound)).toThrow(RangeError);
  });
});

describe("rollDie", () => {
  it("rolls 1 to 6 by default with known answers", () => {
    const values: number[] = [];
    let rng = seedRng(42);
    for (let i = 0; i < 5; i++) {
      const drawn = rollDie(rng);
      values.push(drawn.value);
      rng = drawn.rng;
    }
    expect(values).toEqual([5, 3, 6, 3, 6]);
    expect(rng).toEqual([1174432527, 637232066, 1007288429, 3914278224]);
  });

  it.each([0, 1.5])("rejects %d sides", (sides) => {
    expect(() => rollDie(seedRng(1), sides)).toThrow(RangeError);
  });
});

describe("pickRandom", () => {
  it("picks with a known answer", () => {
    expect(pickRandom(seedRng(7), ["a", "b", "c", "d", "e"]).value).toBe("e");
  });

  it("rejects an empty list", () => {
    expect(() => pickRandom(seedRng(7), [])).toThrow(RangeError);
  });
});

describe("shuffle", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g", "h"];

  it("matches the Fisher-Yates known answer", () => {
    const result = shuffle(seedRng(42), items);
    expect(result.value).toEqual(["e", "h", "d", "g", "a", "f", "b", "c"]);
    expect(result.rng).toEqual([2003940184, 1502136927, 3832054527, 754331630]);
  });

  it("gives the same order for the same seed on two runs", () => {
    expect(shuffle(seedRng(99), items)).toEqual(shuffle(seedRng(99), items));
  });

  it("gives a different order for a different seed", () => {
    expect(shuffle(seedRng(1), items).value).not.toEqual(shuffle(seedRng(2), items).value);
  });

  it("does not change the input list", () => {
    shuffle(seedRng(42), items);
    expect(items).toEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);
  });
});
