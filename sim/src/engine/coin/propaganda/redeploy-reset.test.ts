import { describe, expect, it } from "vitest";
import { codes, play, ruleset, setMarkers, setPieces, setTrack, turnOf } from "../../../../test/board.ts";
import type { GameState } from "../../core/types.ts";
const at = (s: GameState, phase: string): GameState => ({ ...s, turn: { ...s.turn, phase: "propaganda", step: ruleset.sequence.propagandaPhases.indexOf(phase) } });
const choose = (choice: unknown) => ({ type: "PropagandaChoice", phase: "redeploy", choice });

describe("P3a-01 (research 05 s6.7, s6.8; DEC-53)", () => {
  it("redeploys State pieces first and Guerrillas second without changing Control during the choices", () => {
    const start = at(turnOf("state"), "redeploy");
    const {state, entries} = play(start, choose({troops: [{from: "hakkari", to: "diyarbakir-city", count: 2}], police: [{from: "hakkari", to: "agri", count: 1}], guerrilla: [{from: "hakkari", to: "botan", count: 1}]}));
    expect(state.spaces["hakkari"]?.pieces["troops"]?.["default"]).toBe(0);
    expect(state.spaces["agri"]?.pieces["police"]?.["default"]).toBe(2);
    expect(state.spaces["botan"]?.pieces["guerrilla"]?.["underground"]).toBe(3);
    expect(entries.filter(e => e.kind === "EffectApplied").map(e => e.data["piece"])).toEqual(["troops", "police", "guerrilla"]);
  });
  it("requires all Troops in Iraq to leave and rejects invalid pieces, routes, faces and repeated departures", () => {
    const start = at(setPieces(turnOf("state"), "kdp-zone", "troops", 2), "redeploy");
    expect(codes(start, {type: "Advance"})).toContain("redeployRequired");
    for (const choice of [{guards: []}, {troops: "bad"}, {troops: [{from: "missing", to: "elazig", count: 1}]}, {troops: [{from: "hakkari", to: "elazig", count: 1, face: "active"}]}]) expect(codes(start, choose(choice))).toContain("badRedeploy");
    expect(codes(start, choose({troops: [{from: "hakkari", to: "elazig", count: 2}, {from: "hakkari", to: "van-bitlis", count: 1}]}))).toContain("redeploySupply");
    expect(codes(start, choose({troops: [{from: "kdp-zone", to: "dersim", count: 2}]}))).toContain("redeployWhere");
    expect(codes(start, choose({troops: [{from: "kdp-zone", to: "elazig", count: 2}]}))).toEqual([]);
  });
  it("rejects nonadjacent PKK Bases and Hostile entry; allows no movement", () => {
    const start = at(turnOf("pkk"), "redeploy");
    expect(codes(start, choose({guerrilla: [{from: "botan", to: "syria-bekaa", count: 1}]}))).toContain("redeployWhere");
    expect(codes(at(setTrack(start, "posture.kdp", "hostile"), "redeploy"), choose({guerrilla: [{from: "hakkari", to: "kdp-zone", count: 1}]}))).toContain("redeployWhere");
    expect(codes(start, {type: "Advance"})).toEqual([]);
  });
  it("at Reset flips even Hostile and Aligned box Guerrillas Underground, clears markers and Momentum and reveals with PKK first", () => {
    let base = setPieces(setPieces(turnOf("state"), "kdp-zone", "guerrilla", 2, "active"), "puk-zone", "guerrilla", 1, "active");
    base = setTrack(setTrack(setMarkers(setMarkers(base, "botan", "coercion", 2), "botan", "restraintBroken", 1, "state"), "posture.kdp", "hostile"), "posture.puk", "aligned");
    const start = at({...base, meta: {...base.meta, scenarioId: "full-campaign"}, modifiers: [{id: "cap", sourceCard: "DK-004", duration: "game", params: {}}, {id: "mom", sourceCard: "DK-007", duration: "untilReset", params: {}}], deck: {...base.deck, currentCard: "DK-016", piles: [["DK-001"]]}}, "reset");
    const {state, entries} = play(start, {type: "Advance"});
    expect(entries.findIndex(e => e.kind === "PhaseEnded" && e.data["phase"] === "reset")).toBeLessThan(entries.findIndex(e => e.kind === "CardRevealed"));
    expect(state.turn).toMatchObject({campaign: "C2", phase: "card", step: 0});
    expect(state.initiative.firstEligible).toBe("pkk");
    expect(state.deck.currentCard).toBe("DK-001");
    expect(state.spaces["kdp-zone"]?.pieces["guerrilla"]).toEqual({underground: 5, active: 0});
    expect(state.spaces["puk-zone"]?.pieces["guerrilla"]).toEqual({underground: 1, active: 0});
    expect(state.spaces["botan"]?.markers["coercion"]?.["default"]).toBe(1);
    expect(state.spaces["botan"]?.markers["restraintBroken"]?.["state"]).toBe(0);
    expect(state.modifiers.map(m => m.id)).toEqual(["cap"]);
  });
  it("keeps pre-Redeploy Control for Police even when Troop moves change it", () => {
    const tied = at(setPieces(turnOf("state"), "diyarbakir-city", "guerrilla", 6), "redeploy");
    expect(codes(tied, choose({troops: [{from: "hakkari", to: "diyarbakir-city", count: 2}], police: [{from: "hakkari", to: "diyarbakir-city", count: 1}]}))).toContain("redeployWhere");
    const controlled = at(setPieces(turnOf("state"), "diyarbakir-city", "guerrilla", 4), "redeploy");
    expect(codes(controlled, choose({troops: [{from: "diyarbakir-city", to: "elazig", count: 3}], police: [{from: "hakkari", to: "diyarbakir-city", count: 1}]}))).toEqual([]);
  });
  it("Restricted entry pays once per destination and Activates the group, or rejects insufficient Resources", () => {
    const start = at(setTrack(turnOf("pkk"), "posture.kdp", "restricted"), "redeploy");
    const command = choose({guerrilla: [{from: "hakkari", to: "kdp-zone", count: 1}]});
    const {state} = play(start, command);
    expect(state.tracks["resources.pkk"]).toBe(4);
    expect(state.spaces["kdp-zone"]?.pieces["guerrilla"]?.["active"]).toBe(1);
    expect(codes(setTrack(start, "resources.pkk", 0), command)).toContain("cannotPay");
    expect(codes(at(turnOf("pkk"), "reset"), {type: "Advance"})).toEqual(["noNextCampaign"]);
  });

});
