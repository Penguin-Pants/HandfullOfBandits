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
  // Location rules from each handler's check() (round 3: audited against every violation code).
  it("Assault: Underground Guerrillas protect Bases (assaultTargets)", () => {
    expect(summary("state.assault")).toMatch(/A Base goes only when no Guerrilla, Underground or Active, remains/);
  });
  it("Rally: no Displacement, no City at Support except Western Cities, host must allow (rallyDisplaced, rallyCity, rallyHost)", () => {
    expect(summary("pkk.rally")).toMatch(/without a Displacement marker/);
    expect(summary("pkk.rally")).toMatch(/City at Support only in Western Cities/);
    expect(summary("pkk.rally")).toMatch(/host box whose posture allows it/);
  });
  it("March: no March into Western Cities, Europe or Iran (marchWhere, marchHost)", () => {
    expect(summary("pkk.march")).toMatch(/never into Western Cities, Europe or Iran/);
  });
  it("Sweep: never Western Cities (sweepWhere)", () => {
    expect(summary("state.sweep")).toMatch(/other than Western Cities/);
  });
  it("Coerce and Extort: no Displacement marker (coerceDisplaced, extortDisplaced)", () => {
    expect(summary("pkk.coerce")).toMatch(/no Displacement marker/);
    expect(summary("pkk.extort")).toMatch(/no Displacement marker/);
  });
  it("Ambush and Attack: where they may go (ambushGuerrilla, attackWhere)", () => {
    expect(summary("pkk.ambush")).toMatch(/each with an Underground Guerrilla/);
    expect(summary("pkk.attack")).toMatch(/In a space with Guerrillas and State pieces/);
  });
  it("every action has a summary", () => {
    for (const f of actionForms) expect(f.summary.length).toBeGreaterThan(20);
  });
});
it("active card forms allow the second Agitate and Academy recruits", async () => {
  const {formsFor} = await import("./forms.ts");
  const {turnOf} = await import("../../test/board.ts");
  const state = {...turnOf("pkk"), modifiers: [{id: "extra-agitate", sourceCard: "DK-007", duration: "untilReset" as const, params: {maxSpaces: 2}}, {id: "academy", sourceCard: "DK-009", duration: "game" as const, params: {extra: 2}}]};
  const form = formsFor(state).find(f => f.id === "pkk.rally");
  expect(form?.subAction?.maxSpaces).toBe(2);
  expect(form?.fields.some(f => f.key === "extra")).toBe(true);
  expect(formsFor(turnOf("pkk")).find(f => f.id === "pkk.rally")?.fields.some(f => f.key === "extra")).toBe(false);
});
