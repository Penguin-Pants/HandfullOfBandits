import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canonicalHash, canonicalJson } from "../src/engine/core/canonical.ts";
import { setupState } from "../src/engine/core/state.ts";
import { loadPackage, readPackageDir } from "../src/package/load.ts";

// P1-03 accept: the full campaign setup state is under 30 KB as canonical JSON (05 s2, 06 s3.7).
// The setup comes from the Kurdish package (P2-02). Five piles of 20 card IDs and 2 Pivotals per
// faction stand in for the deck until P2-04, so the size covers a full deck.
const LIMIT_BYTES = 30 * 1024;
const dir = fileURLToPath(new URL("../../game-packages/kurdish-coin/0.1.0", import.meta.url));

describe("full campaign setup state", () => {
  const result = loadPackage(readPackageDir(dir));
  if (!result.ok) throw new Error("kurdish-coin must load");
  const setup = setupState(result.ruleset, "full-campaign", 2 ** 53 - 1);
  const cards = Array.from({ length: 100 }, (_, i) => `DK-${String(i + 1).padStart(3, "0")}`);
  const state = {
    ...setup,
    deck: { ...setup.deck, piles: [0, 1, 2, 3, 4].map((p) => cards.slice(p * 20, p * 20 + 20)) },
    hands: { state: ["DK-076", "DK-098"], pkk: ["DK-015", "DK-054"] },
  };
  const bytes = Buffer.byteLength(canonicalJson(state), "utf8");

  it(`serializes under ${String(LIMIT_BYTES)} bytes`, () => {
    expect(bytes).toBeLessThan(LIMIT_BYTES);
  });

  it("round trips through canonical JSON with the same hash", () => {
    const parsed: unknown = JSON.parse(canonicalJson(state));
    expect(parsed).toEqual(state);
    expect(canonicalHash(parsed)).toBe(canonicalHash(state));
  });
});
