import { expect, it } from "vitest";
import { codes, engine, op, play, ruleset, setPieces, turnOf } from "../../../test/board.ts";
const ready = () => {
  const base = setPieces(setPieces(turnOf("state"), "hakkari", "pkkBase", 1), "hakkari", "guerrilla", 5);
  return {...base, hands: {...base.hands, pkk: ["DK-015"]}, deck: {...base.deck, currentCard: null, piles: [["DK-001"]]}, turn: {...base.turn, phase: "setup"}};
};
it("offers ARGK to the Second Eligible before any card action and consumes the hand on play", () => {
  const revealed = play(ready(), {type: "Advance"}).state;
  expect(revealed.pending?.faction).toBe("pkk");
  expect(codes(revealed, op("state", "opOnly", {op: "state.train", locations: ["diyarbakir-city"]}))).toContain("notCardPlay");
  const played = play(revealed, {type: "PlayPivotal", faction: "pkk", card: "DK-015", placements: {botan: 4}}).state;
  expect(played.hands["pkk"]).toEqual([]);
  expect(played.deck.currentCard).toBe("DK-015");
  expect(played.deck.played).toContain("DK-001");
  expect(played.initiative.firstEligible).toBe("pkk");
  expect(played.initiative.actedThisCard).toEqual(["pkk"]);
  expect(played.tracks["resources.pkk"]).toBe(8);
  expect(played.spaces["botan"]?.pieces["guerrilla"]?.["underground"]).toBe(6);
});
it("declines only this card and rejects bad placements and wrong-faction play", () => {
  const state = play(ready(), {type: "Advance"}).state;
  expect(codes(state, {type: "PlayPivotal", faction: "state", card: "DK-015", placements: {}})).toContain("pivotalPriority");
  expect(codes(state, {type: "PlayPivotal", faction: "pkk", card: "DK-015", placements: {botan: 5}})).toContain("pivotalPlacements");
  const declined = play(state, {type: "ResolveDecision", decisionId: state.pending?.id, answer: "decline"}).state;
  expect(declined.pending).toBeNull();
  expect(declined.hands["pkk"]).toEqual(["DK-015"]);
  expect(declined.initiative.actedThisCard).toEqual([]);
});
for (const placements of [{}, {botan: 1}]) it(`ARGK flips Guerrillas at every PKK Base, with ${String(Object.keys(placements).length)} placement spaces (DEC-55)`, () => {
  let state: ReturnType<typeof turnOf> = ready();
  for (const [id, count] of [["botan", 1], ["hakkari", 1], ["kdp-zone", 2], ["syria-bekaa", 1], ["mardin-batman", 2]] as const) state = setPieces(state, id, "guerrilla", count, "active");
  const revealed = play(state, {type: "Advance"}).state;
  const after = play(revealed, {type: "PlayPivotal", faction: "pkk", card: "DK-015", placements}).state;
  for (const [id, underground] of [["botan", 3 + (placements.botan ?? 0)], ["hakkari", 6], ["kdp-zone", 5], ["syria-bekaa", 3]] as const) {
    expect(after.spaces[id]?.pieces["guerrilla"]).toEqual({underground, active: 0});
  }
  expect(after.spaces["mardin-batman"]?.pieces["guerrilla"]).toEqual({underground: 1, active: 2});
  expect(after.tracks["resources.pkk"]).toBe(8);
});

it("keeps the revealed card’s Always effect and the Pivotal player's next-card eligibility", () => {
  const card = ruleset.cards["DK-001"];
  if (card === undefined) throw new Error("DK-001");
  const r = {...ruleset,cards: {...ruleset.cards,"DK-001": {...card,always: [{type: "adjustTrack" as const,track: "legitimacy",delta: 1}]}}};
  const apply = (s: ReturnType<typeof turnOf>, c: Parameters<typeof engine.apply>[2]) => {
    const result = engine.apply(r,s,c);
    if (!result.ok) throw new Error(JSON.stringify(result.validation.violations));
    return result.transition.state;
  };
  const start = ready();
  const revealed = apply({...start,deck: {...start.deck,piles: [["DK-001","DK-014"]]}},{type: "Advance"});
  expect(revealed.tracks["legitimacy"]).toBe(11);
  const pivotal = apply(revealed,{type: "PlayPivotal",faction: "pkk",card: "DK-015",placements: {}});
  expect(pivotal.tracks["legitimacy"]).toBe(11);
  expect(engine.validate(r,pivotal,{type: "ChooseEvent",faction: "state",side: "unshaded"}).ok).toBe(false);
  expect(engine.validate(r,pivotal,op("state","opSa",{op: "state.train",locations: ["diyarbakir-city"],perLocation: {"diyarbakir-city": {option: "place",police: 1}}})).ok).toBe(true);
  const next = apply(pivotal,{type: "Pass",faction: "state"});
  expect(next.deck.currentCard).toBe("DK-014");
  expect(next.initiative.firstEligible).toBe("pkk");
  expect(next.tracks["legitimacy"]).toBe(11);
  expect(next.pending).toBeNull();
});
it("offers a declined ARGK again on the next card without consuming it", () => {
  const start = ready();
  const revealed = play({...start,deck: {...start.deck,piles: [["DK-001","DK-014"]]}},{type: "Advance"}).state;
  const declined = play(revealed,{type: "ResolveDecision",decisionId: revealed.pending?.id,answer: "decline"}).state;
  const first = play(declined,{type: "Pass",faction: "state"}).state;
  const next = play(first,{type: "Pass",faction: "pkk"}).state;
  expect(next.pending?.faction).toBe("pkk");
  expect(next.pending?.id).not.toBe(revealed.pending?.id);
  expect(next.hands["pkk"]).toEqual(["DK-015"]);
});
