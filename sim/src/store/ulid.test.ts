import { describe, expect, it } from "vitest";
import { ulid } from "./ulid.ts";

describe("ulid", () => {
  it("encodes time then randomness in 26 Crockford base32 characters", () => {
    expect(ulid(0, new Uint8Array(10))).toBe("0".repeat(26));
    expect(ulid(0, new Uint8Array(10).fill(255))).toBe(`${"0".repeat(10)}${"Z".repeat(16)}`);
    // Time part of the spec example 01ARYZ6S41TSV4RRFFQ69G5FAV (https://github.com/ulid/spec).
    expect(ulid(1469918176385, new Uint8Array(10)).slice(0, 10)).toBe("01ARYZ6S41");
  });

  it("gives a new value on each call", () => {
    expect(ulid()).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(ulid()).not.toBe(ulid());
  });
});
