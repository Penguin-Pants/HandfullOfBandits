import { describe, expect, it } from "vitest";
import { codes, engine, inCampaign, op, play, ruleset, turnOf } from "../../../test/board.ts";
import type { GameState } from "../core/types.ts";
import { availableFrom, SWITCH, switchesAt } from "./switches.ts";

// T-SEQ for the structural switches (research 10 s6.2; 11 P3c-01): flags set at setup and at each Reset.
const C3_ON = [SWITCH.villageClearance, SWITCH.covertAction, SWITCH.declareCeasefire, SWITCH.extendedPowers];
const on = (s: GameState): string[] => Object.values(SWITCH).filter((f) => s.flags[f] === true).sort();
const resetInto = (campaign: string, flags: Record<string, boolean> = {}): GameState => {
  const base = inCampaign(ruleset, turnOf("state"), campaign);
  return {
    ...base,
    flags: { ...base.flags, ...flags },
    meta: { ...base.meta, scenarioId: "full-campaign" },
    deck: { ...base.deck, currentCard: "DK-016", piles: [["DK-001"]] },
    turn: { ...base.turn, phase: "propaganda", step: ruleset.sequence.propagandaPhases.indexOf("reset") },
  };
};

describe("P3c-01 structural switches (10 s6.2)", () => {
  it("sets the switches of the first Campaign and every earlier one at setup", () => {
    for (const id of ["s0", "scenario-a", "full-campaign"]) expect(on(engine.start(ruleset, id, 7).state), id).toEqual([SWITCH.hotPursuit]);
    for (const id of ["scenario-b", "scenario-c"]) expect(on(engine.start(ruleset, id, 7).state), id).toEqual([...C3_ON].sort());
    expect(engine.start(ruleset, "scenario-b", 7).state.flags[SWITCH.hotPursuit]).toBe(false);
  });
  it("switches on and off at each Reset, as the 10 s6.2 rows", () => {
    const rows: [string, string[]][] = [
      ["C1", [SWITCH.hotPursuit]],
      ["C2", [SWITCH.hotPursuit]],
      ["C3", [...C3_ON].sort()],
      ["C4", [...C3_ON].sort()],
    ];
    for (const [from, before] of rows) {
      const start = resetInto(from);
      expect(on(start), from).toEqual(before);
      const next = rows[rows.findIndex(([c]) => c === from) + 1]?.[1] ?? [...C3_ON, SWITCH.returnByCivicAction].sort();
      const { state, entries } = play(start, { type: "Advance" });
      expect(on(state), `${from} to next`).toEqual(next);
      const changed = entries.filter((e) => e.kind === "EffectApplied" && Object.hasOwn(e.data, "flag")).map((e) => e.ruleRef);
      expect(changed.every((r) => r === "10 s6.2"), from).toBe(true);
    }
  });
  it("logs one flag change per switch entering C3, and none for a flag already set", () => {
    const { entries } = play(resetInto("C2"), { type: "Advance" });
    expect(entries.filter((e) => e.ruleRef === "10 s6.2").length).toBe(C3_ON.length + 1);
    const early = play(resetInto("C2", { [SWITCH.covertAction]: true }), { type: "Advance" });
    expect(early.entries.filter((e) => e.ruleRef === "10 s6.2").map((e) => e.data["flag"])).not.toContain(SWITCH.covertAction);
  });
  it("keeps a flag that an earlier event set when the Reset does not switch it", () => {
    const { state } = play(resetInto("C1", { [SWITCH.covertAction]: true }), { type: "Advance" });
    expect(state.turn.campaign).toBe("C2");
    expect(state.flags[SWITCH.covertAction]).toBe(true);
  });
  it("names the Campaign that switches each flag on", () => {
    expect(availableFrom(ruleset, SWITCH.covertAction)).toBe("available from Campaign C3");
    expect(availableFrom(ruleset, SWITCH.returnByCivicAction)).toBe("available from Campaign C5");
    expect(switchesAt(ruleset, "C5")).toMatchObject({ [SWITCH.hotPursuit]: false, [SWITCH.returnByCivicAction]: true });
    expect(switchesAt(ruleset, null)).toEqual({});
  });
  it("refuses the gated actions without throwing on a package stored before the switch rows (PR 62 review)", () => {
    const old = { ...ruleset, parameters: Object.fromEntries(Object.entries(ruleset.parameters).filter(([id]) => !id.startsWith("switch."))) };
    const legacy = (s: GameState) => engine.validate(old, s, { type: "DeclareCeasefire", faction: "pkk" }).violations.map((v) => v.message);
    expect(legacy(turnOf("pkk"))).toEqual(["Declare Ceasefire is not available in this package."]);
    const covert = op("state", "opSa", { op: "state.sweep", locations: ["botan"], sa: { action: "state.covert-action", locations: ["hakkari"], perLocation: {}, timing: "before" } });
    expect(() => engine.validate(old, turnOf("state"), covert)).not.toThrow();
    expect(codes(turnOf("state"), covert)).toContain("covertCampaign");
  });
});
