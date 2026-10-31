import { describe, expect, it } from "vitest";
import { arrowsOf, dragMode, emptyPlan, emptyPlans, planReducer, plansReducer, toCommand, type PlanEvent, type PlanState } from "./plan.ts";

// UC-5: mouse-only plan building. Clicks pick spaces, drags add moves, steppers set counts.
const run = (...events: PlanEvent[]): PlanState => events.reduce(planReducer, emptyPlan);
const into: PlanEvent = { type: "modes", op: "into", sa: null };
const forms = [
  { id: "pkk.march", fields: [{ key: "moves", label: "Moves", kind: "moves" as const }] },
  { id: "pkk.rally", fields: [{ key: "option", label: "Option", kind: "select" as const, options: ["place"] }, { key: "count", label: "Count", kind: "number" as const }] },
];

describe("planReducer", () => {
  it("click picks one space; Shift-click adds or removes", () => {
    expect(run({ type: "click", id: "botan", add: false }, { type: "click", id: "hakkari", add: false }).op.locations).toEqual(["hakkari"]);
    expect(run({ type: "click", id: "botan", add: false }, { type: "click", id: "hakkari", add: true }, { type: "click", id: "botan", add: true }).op.locations).toEqual(["hakkari"]);
  });

  it("clicks build the SA's spaces while the SA is the target", () => {
    const plan = run({ type: "click", id: "botan", add: false }, { type: "target", target: "sa" }, { type: "click", id: "dersim", add: false });
    expect(plan.op.locations).toEqual(["botan"]);
    expect(plan.sa.locations).toEqual(["dersim"]);
  });

  it("a drag adds the destination and a move of 1; the same drag again adds 1 more", () => {
    const drag: PlanEvent = { type: "drag", from: "hakkari", to: "botan" };
    const plan = run(into, drag, drag);
    expect(plan.op.locations).toEqual(["botan"]);
    expect(plan.op.moves).toEqual({ botan: [{ from: "hakkari", count: 2 }] });
    expect(arrowsOf(plan)).toEqual([{ from: "hakkari", to: "botan", count: 2 }]);
  });

  it("draws arrows only for moves into spaces still in the plan", () => {
    const plan = run(into, { type: "drag", from: "hakkari", to: "botan" }, { type: "click", id: "dersim", add: false });
    expect(arrowsOf(plan)).toEqual([]);
  });

  it("Air Mobility drags add the origin and the destination to the SA spaces", () => {
    const plan = run({ type: "modes", op: null, sa: "both" }, { type: "target", target: "sa" }, { type: "drag", from: "hakkari", to: "botan" });
    expect(plan.sa.locations).toEqual(["botan", "hakkari"]);
    expect(plan.sa.moves).toEqual({ botan: [{ from: "hakkari", count: 1 }] });
  });

  it("clear empties one part and sends the map back to the Op", () => {
    const plan = run({ type: "modes", op: null, sa: "both" }, { type: "target", target: "sa" }, { type: "drag", from: "hakkari", to: "botan" }, { type: "clear", side: "sa" });
    expect(plan.sa).toEqual(emptyPlan.sa);
    expect(plan.target).toBe("op");
    expect(arrowsOf(plan)).toEqual([]);
  });

  it("a part whose action stops moving pieces drops its moves and arrows", () => {
    const plan = run(into, { type: "drag", from: "hakkari", to: "botan" }, { type: "modes", op: null, sa: null });
    expect(plan.op.locations).toEqual(["botan"]);
    expect(arrowsOf(plan)).toEqual([]);
  });

  it("a change between drag modes drops the moves built for the old mode (Garrison to Sweep)", () => {
    const route = run({ type: "modes", op: "route", sa: null }, { type: "click", id: "botan", add: false }, { type: "drag", from: "hakkari", to: "van-bitlis" });
    const sweep = planReducer(route, { type: "modes", op: "into", sa: null });
    expect(sweep.op.locations).toEqual(["botan"]);
    expect(sweep.op.moves).toEqual({});
    expect(arrowsOf(sweep)).toEqual([]);
  });

  it("Garrison drags keep every route under the one activation space", () => {
    const plan = run({ type: "modes", op: "route", sa: null }, { type: "drag", from: "dersim", to: "botan" }, { type: "drag", from: "agri", to: "hakkari" });
    expect(plan.op.locations).toEqual(["botan"]);
    expect(plan.op.moves).toEqual({ botan: [{ from: "dersim", count: 1 }, { from: "agri", to: "hakkari", count: 1 }] });
    expect(arrowsOf(plan).map((a) => a.to)).toEqual(["botan", "hakkari"]);
  });

  it("drags build the SA's moves while the SA is the target", () => {
    const plan = run({ type: "modes", op: null, sa: "into" }, { type: "target", target: "sa" }, { type: "drag", from: "hakkari", to: "botan" });
    expect(plan.sa.moves).toEqual({ botan: [{ from: "hakkari", count: 1 }] });
    expect(plan.op.locations).toEqual([]);
  });

  it("a drag does nothing for an action that moves nothing, or onto the same space", () => {
    expect(run({ type: "drag", from: "a", to: "b" })).toEqual(emptyPlan);
    expect(run(into, { type: "drag", from: "a", to: "a" })).toEqual(run(into));
  });

  it("steppers set a move's count and face; 0 removes the move", () => {
    const base = run(into, { type: "drag", from: "hakkari", to: "botan" });
    expect(planReducer(base, { type: "move", side: "op", loc: "botan", index: 0, count: 3, face: "underground" }).op.moves["botan"]).toEqual([{ from: "hakkari", count: 3, face: "underground" }]);
    expect(planReducer(base, { type: "move", side: "op", loc: "botan", index: 0, count: 0 }).op.moves["botan"]).toEqual([]);
  });

  it("reset empties the plan and keeps the drag modes of the chosen action", () => {
    expect(run(into, { type: "click", id: "botan", add: false }, { type: "reset" })).toEqual(run(into));
  });
});

describe("toCommand", () => {
  it("builds a ChooseOperation with values, moves, the SA and a sub-action", () => {
    const plan = run(into, { type: "drag", from: "hakkari", to: "botan" }, { type: "target", target: "sa" }, { type: "click", id: "dersim", add: false }, { type: "value", side: "sa", loc: "dersim", key: "count", value: "2" });
    const command = toCommand("pkk", { box: "opSa", op: "pkk.march", plan, sa: { action: "pkk.rally", timing: "after" }, subActions: [] }, forms);
    expect(command).toEqual({
      type: "ChooseOperation", faction: "pkk", box: "opSa",
      plan: { op: "pkk.march", locations: ["botan"], perLocation: { botan: { moves: [{ from: "hakkari", count: 1 }] } }, sa: { action: "pkk.rally", locations: ["dersim"], perLocation: { dersim: { count: 2 } }, timing: "after" }, subActions: [] },
    });
  });

  it("dragMode: route for Garrison, both for Air Mobility, into for other movers, null otherwise", () => {
    expect(dragMode(forms[0]?.fields, "state.garrison")).toBe("route");
    expect(dragMode(forms[0]?.fields, "state.air-mobility")).toBe("both");
    expect(dragMode(forms[0]?.fields, "pkk.march")).toBe("into");
    expect(dragMode(forms[1]?.fields, "pkk.rally")).toBeNull();
  });
});

describe("plansReducer (Faction panel and Event free action)", () => {
  it("keeps each panel's plan apart; the map builds the active one", () => {
    let s = emptyPlans;
    s = plansReducer(s, { type: "modes", op: "into", sa: null, owner: "faction" });
    s = plansReducer(s, { type: "activate", owner: "event" });
    s = plansReducer(s, { type: "modes", op: "route", sa: null, owner: "event" });
    s = plansReducer(s, { type: "drag", from: "dersim", to: "botan" });
    expect(s.event.op.moves).toEqual({ botan: [{ from: "dersim", count: 1 }] });
    s = plansReducer(s, { type: "activate", owner: "faction" });
    s = plansReducer(s, { type: "drag", from: "hakkari", to: "botan" });
    s = plansReducer(s, { type: "drag", from: "agri", to: "van-bitlis" });
    expect(s.faction.modes.op).toBe("into");
    expect(s.faction.op.moves).toEqual({ botan: [{ from: "hakkari", count: 1 }], "van-bitlis": [{ from: "agri", count: 1 }] });
  });

  it("using a panel hands the map to its plan; the free action keeps its draft", () => {
    let s = plansReducer(emptyPlans, { type: "activate", owner: "event" });
    s = plansReducer(s, { type: "click", id: "dersim", add: false });
    s = plansReducer(s, { type: "modes", op: "into", sa: null, owner: "faction" });
    expect(s.active).toBe("faction");
    s = plansReducer(s, { type: "click", id: "botan", add: false });
    expect(s.faction.op.locations).toEqual(["botan"]);
    s = plansReducer(s, { type: "value", side: "op", loc: "dersim", key: "option", value: "place", owner: "event" });
    expect(s.active).toBe("event");
    expect(s.event.op.locations).toEqual(["dersim"]);
  });

  it("activating the free action starts it empty; resetAll empties both", () => {
    let s = plansReducer(emptyPlans, { type: "click", id: "botan", add: false });
    s = plansReducer(s, { type: "activate", owner: "event" });
    s = plansReducer(s, { type: "click", id: "dersim", add: false });
    s = plansReducer(s, { type: "activate", owner: "event" });
    expect(s.event.op.locations).toEqual([]);
    expect(s.faction.op.locations).toEqual(["botan"]);
    expect(plansReducer(s, { type: "activate", owner: "faction" }).faction.op.locations).toEqual(["botan"]);
    expect(plansReducer(s, { type: "resetAll" })).toEqual({ ...emptyPlans, active: "event" });
  });
});
