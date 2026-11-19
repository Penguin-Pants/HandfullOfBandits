import { describe, expect, it } from "vitest";
import { pkkOptionText, statePartText } from "./bot-part.ts";

describe("joint choices with a State bot (audit Plan 2 S1)", () => {
  it("says what the bot chose", () => {
    expect(statePartText("redeploy", { troops: [], police: [] })).toBe("The State bot moves no Troops or Police.");
    expect(statePartText("redeploy", { troops: [{ from: "van", to: "hakkari", count: 2 }], police: [] }, (x) => x.toUpperCase())).toBe("The State bot moves 2 Troops from VAN to HAKKARI.");
    expect(statePartText("legalPolitics", { closureFiling: true, ceasefire: { accept: true } })).toBe("The State bot files a closure case and accepts the ceasefire.");
  });

  it("names each PKK Legal Politics option", () => {
    expect(pkkOptionText({ ceasefire: { accept: true } })).toBe("No PKK choice");
    expect(pkkOptionText({ ceasefire: { accept: true, leave: { pkk: true } } })).toBe("Leave Reciprocal Restraint (Europe -1)");
    expect(pkkOptionText({ ceasefire: { pkkEnd: true } })).toBe("End the ceasefire (Europe -1)");
  });
});
