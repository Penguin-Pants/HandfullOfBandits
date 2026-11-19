import { describe, expect, it } from "vitest";
import { statePartText, withStatePart } from "./bot-part.ts";

describe("joint choices with a State bot (audit Plan 2 S1)", () => {
  it("Redeploy keeps the bot Troops and Police and the human Guerrillas", () => {
    const joined = withStatePart("redeploy", { troops: [{ from: "a", to: "b", count: 1 }], police: [], guerrilla: [] }, { troops: [{ from: "x", to: "y", count: 9 }], police: [], guerrilla: [{ from: "c", to: "d", count: 2 }] });
    expect(joined).toEqual({ troops: [{ from: "a", to: "b", count: 1 }], police: [], guerrilla: [{ from: "c", to: "d", count: 2 }] });
  });

  it("Legal Politics keeps the State answers and adds only PKK answers", () => {
    const state = { closureFiling: true, ceasefire: { accept: true } };
    expect(withStatePart("legalPolitics", state, { closureFiling: false, ceasefire: { accept: false, leave: { pkk: true, state: true } } }))
      .toEqual({ closureFiling: true, ceasefire: { accept: true, leave: { pkk: true } } });
    expect(withStatePart("legalPolitics", {}, { ceasefire: { pkkEnd: true } })).toEqual({ ceasefire: { pkkEnd: true } });
    expect(withStatePart("legalPolitics", { ceasefire: { leave: { state: true } } }, {})).toEqual({ ceasefire: { leave: { state: true } } });
    expect(withStatePart("legalPolitics", {}, {})).toEqual({});
  });

  it("says what the bot chose", () => {
    expect(statePartText("redeploy", { troops: [], police: [] })).toBe("The State bot moves no Troops or Police.");
    expect(statePartText("redeploy", { troops: [{ from: "van", to: "hakkari", count: 2 }], police: [] }, (x) => x.toUpperCase())).toBe("The State bot moves 2 Troops from VAN to HAKKARI.");
    expect(statePartText("legalPolitics", { closureFiling: true, ceasefire: { accept: true } })).toBe("The State bot files a closure case and accepts the ceasefire.");
  });
});
