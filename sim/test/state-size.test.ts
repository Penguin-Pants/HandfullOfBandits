import { describe, expect, it } from "vitest";
import { canonicalHash, canonicalJson } from "../src/engine/core/canonical.ts";
import { fullSetupState } from "./full-setup.ts";

// P1-03 accept: the full campaign setup state is under 30 KB as canonical JSON (05 s2, 06 s3.7).
const LIMIT_BYTES = 30 * 1024;

describe("full campaign setup state", () => {
  const state = fullSetupState();
  const bytes = Buffer.byteLength(canonicalJson(state), "utf8");

  it("reconciles piece totals with research 10 s2.2", () => {
    const available = Object.fromEntries(Object.entries(state.pools).map(([id, pool]) => [id, pool.available]));
    expect(available).toEqual({ troops: 14, police: 8, guards: 0, stateBase: 4, guerrilla: 20, pkkBase: 9 });
    expect(state.pools["guards"]?.outOfPlay).toBe(16);
  });

  it(`serializes under ${String(LIMIT_BYTES)} bytes`, () => {
    expect(bytes).toBeLessThan(LIMIT_BYTES);
  });

  it("round trips through canonical JSON with the same hash", () => {
    const parsed: unknown = JSON.parse(canonicalJson(state));
    expect(parsed).toEqual(state);
    expect(canonicalHash(parsed)).toBe(canonicalHash(state));
  });
});
