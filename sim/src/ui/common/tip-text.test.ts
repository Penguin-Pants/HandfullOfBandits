import { describe, expect, it } from "vitest";
import { tipParts } from "./tip-text.ts";

describe("tipParts", () => {
  it("splits sentences into paragraphs and lifts the closing rule cite", () => {
    const text = "Pick one option per space. Place up to 3 Troops. Or, in a Mountain space, replace 2 Police with 1 State Base (at most 2 Bases there). In one space you may pay for Civic Action (06 s2.1).";
    expect(tipParts(text)).toEqual({
      paragraphs: ["Pick one option per space.", "Place up to 3 Troops.", "Or, in a Mountain space, replace 2 Police with 1 State Base (at most 2 Bases there).", "In one space you may pay for Civic Action."],
      cite: "06 s2.1",
    });
  });

  it("keeps a cite with several sections and a plain text without one", () => {
    expect(tipParts("Move Troops. Roll a die (06 s3.4, 09 s3).").cite).toBe("06 s3.4, 09 s3");
    expect(tipParts("06 s4.1 · Prototype assumption PA-06")).toEqual({ paragraphs: ["06 s4.1 · Prototype assumption PA-06"], cite: null });
  });

  it("does not split inside a number or after a lowercase word", () => {
    expect(tipParts("Costs 1.5 more. Pop. of 3 at e.g. a City.").paragraphs).toEqual(["Costs 1.5 more.", "Pop. of 3 at e.g. a City."]);
  });

  it("handles empty text", () => {
    expect(tipParts("")).toEqual({ paragraphs: [], cite: null });
  });
});
