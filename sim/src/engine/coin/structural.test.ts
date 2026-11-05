import { describe, expect, it } from "vitest";
import { codes, engine, inCampaign, pieces, play, ruleset, setMarkers, setPieces, setTrack, turnOf, withCard } from "../../../test/board.ts";
import type { AnyCommand, GameState } from "../core/types.ts";
import { income } from "./propaganda/resources.ts";
import { entryText } from "../../server/text.ts";

// T-EVT for the structural cards (11 P3b-06a; approved text docs/prototype/31 s5, DEC-67).
// S0 board: Botan is the only domestic space with a PKK Base (level -1, no Office).
const event = (faction: string, side: string, answers: unknown[] = []): AnyCommand => ({ type: "ChooseEvent", faction, side, answers });
const c3 = (s: GameState): GameState => inCampaign(ruleset, s, "C3");
const reveal = (card: string, s: GameState = engine.start(ruleset, "s0", 1).state): GameState => c3({ ...s, deck: { ...s.deck, piles: [[card, "DK-016"]] } });
const offices = (s: GameState): string[] => ruleset.spaces.filter((x) => (s.spaces[x.id]?.markers["office"]?.["default"] ?? 0) > 0).map((x) => x.id);
const leadership = (s: GameState): Readonly<Record<string, number>> | undefined => s.spaces["syria-bekaa"]?.markers["leadership"];
const abroad = (s: GameState): GameState => setMarkers(setMarkers(s, "syria-bekaa", "leadership", 0, "present"), "syria-bekaa", "leadership", 1, "abroad");

describe("HEP Founded (DK-037)", () => {
  it("Always: Legal Space to Open, procedure lines 3 and 4 twice place 2 Offices", () => {
    const { state } = play(reveal("DK-037"), { type: "Advance" });
    expect(state.tracks["legalSpace"]).toBe("open");
    expect(offices(state)).toEqual(["diyarbakir-city", "western-cities"]);
    expect(state.flags["closureCase"]).not.toBe(true);
  });

  it("Always logs the approved line once", () => {
    const { entries } = play(reveal("DK-037"), { type: "Advance" });
    expect(entries.filter((e) => e.kind === "CardNote").map(entryText)).toEqual(["HEP Founded: Legal Space to Open. Offices placed by procedure lines 3 and 4 (twice). (DK-037 Always)"]);
  });

  it("Always fires once: a declined Pivotal window does not run it again", () => {
    let board = reveal("DK-037");
    board = { ...board, hands: { ...board.hands, pkk: ["DK-015"] } };
    for (const id of ["botan", "hakkari", "dersim"]) board = setPieces(setPieces(board, id, "pkkBase", 1), id, "guerrilla", 3);
    const opened = play(board, { type: "Advance" }).state;
    expect(opened.turn.phase).toBe("pivotal");
    const declined = play(opened, { type: "ResolveDecision", decisionId: opened.pending?.id, answer: "decline" }).state;
    expect(offices(declined)).toEqual(["diyarbakir-city", "western-cities"]);
  });

  it("U: the State may file a closure case: marker placed, Legal Space to Prosecuted", () => {
    const open = setTrack(withCard(turnOf("state"), "DK-037"), "legalSpace", "open");
    const filed = play(open, event("state", "unshaded", ["File a closure case"])).state;
    expect(filed.flags["closureCase"]).toBe(true);
    expect(filed.tracks["legalSpace"]).toBe("prosecuted");
    const declined = play(open, event("state", "unshaded", ["Do not file"])).state;
    expect(declined.flags["closureCase"]).not.toBe(true);
    expect(declined.tracks["legalSpace"]).toBe("open");
  });

  it("U: the PKK may not execute the side (05 s5 item 1)", () => {
    expect(codes(withCard(turnOf("pkk"), "DK-037"), event("pkk", "unshaded", ["Do not file"]))).toEqual(["sideRestricted"]);
  });

  it("S: shifts 1 space with a PKK Base and no Office one level toward Opposition", () => {
    const { state } = play(withCard(turnOf("pkk"), "DK-037"), event("pkk", "shaded", [["botan"]]));
    expect(state.spaces["botan"]?.level).toBe(-2);
    const withOffice = setMarkers(withCard(turnOf("pkk"), "DK-037"), "botan", "office", 1);
    expect(play(withOffice, event("pkk", "shaded", [[]])).state.spaces["botan"]?.level).toBe(-1);
  });
});

describe("Northern Iraq Vacuum (DK-040)", () => {
  it("Always sets the Vacuum flag", () => {
    expect(play(reveal("DK-040"), { type: "Advance" }).state.flags["northernIraqVacuum"]).toBe(true);
  });

  const vacuum = (s: GameState): GameState => c3(withCard({ ...s, flags: { ...s.flags, northernIraqVacuum: true } }, "DK-040"));
  const sweep = { locations: ["kdp-zone"], perLocation: {}, sa: { locations: ["kdp-zone"], perLocation: { "kdp-zone": { moves: [{ from: "hakkari", count: 2 }] } } } };

  it("U: free Sweep in the KDP Zone with a free Cross-Border lift at Tolerant", () => {
    const board = setTrack(vacuum(turnOf("state")), "posture.kdp", "tolerant");
    const { state } = play(board, event("state", "unshaded", [sweep]));
    expect(pieces(state, "kdp-zone", "troops")).toEqual({ default: 2 });
    expect(state.tracks["resources.state"]).toBe(board.tracks["resources.state"]);
  });

  it("U: Cross-Border access applies; at Host the State can only skip", () => {
    const board = setTrack(vacuum(turnOf("state")), "posture.kdp", "host");
    expect(codes(board, event("state", "unshaded", [sweep]))).toEqual(["crossBorderAccess"]);
    expect(codes(board, event("state", "unshaded", [null]))).toEqual([]);
  });

  it("S: 2 Underground Guerrillas and 1 Base in the chosen zone at Tolerant; nothing at Restricted", () => {
    const board = setTrack(setPieces(vacuum(turnOf("pkk")), "puk-zone", "pkkBase", 0), "posture.puk", "tolerant");
    const { state } = play(board, event("pkk", "shaded", ["PUK Zone"]));
    expect(pieces(state, "puk-zone", "guerrilla")).toMatchObject({ underground: (pieces(board, "puk-zone", "guerrilla")["underground"] ?? 0) + 2 });
    expect(pieces(state, "puk-zone", "pkkBase")).toEqual({ default: 1 });
    const closed = setTrack(board, "posture.puk", "restricted");
    expect(play(closed, event("pkk", "shaded", ["PUK Zone"])).state.spaces["puk-zone"]).toEqual(closed.spaces["puk-zone"]);
  });
});

describe("Capture (DK-093)", () => {
  it("Always: with the Leadership Abroad, removes it and cuts PKK income by 1", () => {
    const board = abroad(reveal("DK-093"));
    const { state } = play(board, { type: "Advance" });
    expect(leadership(state)?.["abroad"] ?? 0).toBe(0);
    expect(state.flags["captured"]).toBe(true);
    expect(income(ruleset, state).pkk).toBe(income(ruleset, board).pkk - 1);
  });

  it("Always: with the Leadership Present, does nothing", () => {
    const board = reveal("DK-093");
    const { state, entries } = play(board, { type: "Advance" });
    expect(leadership(state)).toEqual(leadership(board));
    expect(entries.filter((e) => e.kind === "CardNote").map((e) => e.data["text"])).toEqual(["Capture: the Leadership is Present. The Always line does nothing."]);
    expect(state.flags["captured"]).not.toBe(true);
  });

  it("Capture income never goes below 0", () => {
    let board: GameState = setMarkers({ ...turnOf("pkk"), flags: { ...turnOf("pkk").flags, captured: true } }, "syria-bekaa", "leadership", 0, "present");
    for (const id of ["botan", "kdp-zone", "syria-bekaa"]) board = setPieces(board, id, "pkkBase", 0);
    board = setTrack(board, "europe", 0);
    expect(income(ruleset, board).pkk).toBe(0);
  });

  it("U: Leadership Present: Syria one step toward Hostile; entering Hostile flips it Abroad", () => {
    const board = setTrack(withCard(turnOf("state"), "DK-093"), "posture.syria", "restricted");
    const { state } = play(board, event("state", "unshaded"));
    expect(state.tracks["posture.syria"]).toBe("hostile");
    expect(leadership(state)).toMatchObject({ present: 0, abroad: 1 });
  });

  it("U: otherwise Legitimacy +1 and PKK Resources -3", () => {
    const board = abroad(withCard(turnOf("state"), "DK-093"));
    const { state } = play(board, event("state", "unshaded"));
    expect(state.tracks["legitimacy"]).toBe(Number(board.tracks["legitimacy"]) + 1);
    expect(state.tracks["resources.pkk"]).toBe(Number(board.tracks["resources.pkk"]) - 3);
    expect(state.tracks["posture.syria"]).toBe(board.tracks["posture.syria"]);
  });

  it("S: Europe +1 and 1 PKK Base space toward Opposition", () => {
    const board = setTrack(withCard(turnOf("pkk"), "DK-093"), "europe", 2);
    const { state } = play(board, event("pkk", "shaded", [["botan"]]));
    expect(state.tracks["europe"]).toBe(3);
    expect(state.spaces["botan"]?.level).toBe(-2);
  });

  it("S: the Event Europe rise stops at the Ban marker cap (04 s3.6)", () => {
    const board = setMarkers(setTrack(withCard(turnOf("pkk"), "DK-093"), "europe", 3), "europe", "ban", 1);
    expect(play(board, event("pkk", "shaded", [["botan"]])).state.tracks["europe"]).toBe(3);
  });
});
