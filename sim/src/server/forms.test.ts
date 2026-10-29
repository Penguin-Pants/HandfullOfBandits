import { describe, expect, it } from "vitest";
import { actionForms } from "./forms.ts";

// UC-6: each summary states the rule the engine runs (handler header comments cite each one).
const summary = (id: string): string => actionForms.find((f) => f.id === id)?.summary ?? "";

describe("action summaries match the engine", () => {
  it("Ambush adds 1 removal after the normal Attack (attack.ts, PA-06)", () => {
    expect(summary("pkk.ambush")).toMatch(/after the normal Attack/);
    expect(summary("pkk.ambush")).not.toMatch(/no die roll/i);
  });
  it("Assault: Police count as Troops in a City (assault.ts)", () => {
    expect(summary("state.assault")).toMatch(/City, Police count as Troops/);
  });
  it("Coerce: a Coercion marker already there blocks the shift (coerce.ts)", () => {
    expect(summary("pkk.coerce")).toMatch(/already has a Coercion marker/);
  });
  it("Extort: host boxes also pay (extort.ts)", () => {
    expect(summary("pkk.extort")).toMatch(/external box whose host is Host or Tolerant/);
  });
  it("Train: Guards and a new Base need a Mountain or Plain space with State Control (train.ts)", () => {
    expect(summary("state.train")).toMatch(/Mountain or Plain space with State Control and Police, place up to 2 Village Guards/);
    expect(summary("state.train")).toMatch(/Mountain or Plain space with State Control, replace 2 Police with 1 State Base/);
  });
  it("Strike Collaborators: at most 2 Guards in total (strike-collaborators.ts)", () => {
    expect(summary("pkk.strike-collaborators")).toMatch(/up to 2 Guards in total/);
  });
  it("every action has a summary", () => {
    for (const f of actionForms) expect(f.summary.length).toBeGreaterThan(20);
  });
});
