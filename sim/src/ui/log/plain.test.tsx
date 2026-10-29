// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { causeOf } from "../../server/cause.ts";
import { boardView } from "../../server/view.ts";
import type { HistoryEntry, HistoryItem } from "../api.ts";
import { Tip } from "../common/Tip.tsx";
import { LogLines } from "./LogLines.tsx";
import { actionTitle, plainLines } from "./plain.ts";

// UI clarity round R1: plain-language log lines; R7: tooltips.
afterEach(cleanup);
const view = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));
let n = 0;
function entry(kind: string, data: Record<string, unknown>, extra: Partial<HistoryEntry> = {}): HistoryEntry {
  n += 1;
  return { entry_id: `E${String(n)}`, action_id: "A", n, kind, state_seq: 1, rule_ref: null, assumption_ref: null, data: JSON.stringify(data), text: "old technical text", cause: null, cardTitle: null, ...extra };
}
const one = (e: HistoryEntry, actor: string | null = "pkk"): string => plainLines([e], view, actor, false)[0]?.text ?? "";
const rally = { kind: "action", id: "pkk.rally", label: "Rally" } as const;
const event = { kind: "event", card: "DK-001", title: "Eruh and Şemdinli (15 Aug 1984)", side: "shaded" } as const;

describe("plain sentences per log kind", () => {
  it.each([
    [entry("CardRevealed", { card: "DK-001", type: "event" }, { cardTitle: "Eruh" }), 'Card "Eruh" revealed.'],
    [entry("CardRevealed", { card: "DK-016", type: "propaganda" }, { cardTitle: "Propaganda" }), 'Propaganda card "Propaganda" revealed.'],
    [entry("ChoiceMade", { faction: "pkk", box: "event", card: "DK-001", side: "shaded" }, { cardTitle: "Eruh" }), 'PKK chose Event: "Eruh", shaded.'],
    [entry("ChoiceMade", { faction: "state", box: "opSa" }), "State chose Op + SA."],
    [entry("ChoiceMade", { faction: "pkk", choice: "Hakkari" }), 'PKK chose "Hakkari".'],
    [entry("ChoiceMade", { faction: "pkk", spaces: ["botan", "hakkari"] }), "PKK picked Botan, Hakkari."],
    [entry("ChoiceMade", { faction: "pkk", freeAction: "pkk.attack", locations: ["botan"] }), "PKK planned a free Attack in Botan."],
    [entry("DieRolled", { purpose: "attackResult", space: "hakkari", roll: 2, guerrillas: 3, hit: true }), "Attack in Hakkari: rolled 2 against 3 Guerrillas, a hit."],
    [entry("ControlChanged", { space: "hakkari", before: "state", after: "pkk" }), "Hakkari: Control passed from State to PKK."],
    [entry("ControlChanged", { space: "botan", before: null, after: "pkk" }), "Botan: Control passed from no one to PKK."],
    [entry("EligibilityChanged", { firstEligible: "pkk", secondEligible: "state" }), "Next card: PKK is First Eligible, State is Second Eligible."],
    [entry("PhaseStarted", { phase: "civicAction" }), "Civic Action (State) phase started."],
    [entry("PhaseEnded", { phase: "upkeep" }), "Upkeep phase ended."],
    [entry("ValidationPassed", { command: "Advance" }), "The move was checked and is legal."],
    [entry("GameEnded", { winner: "pkk", reason: "finalScoring" }), "Game over: PKK wins (Final Scoring)."],
    [entry("StopRuleFlag", { rule: 3, faction: "state" }), "Design note: stop rule 3 flagged for State."],
    [entry("Undo", {}), "The last action was undone."],
  ])("%#", (e, text) => {
    expect(one(e)).toBe(text);
  });
});

describe("plain sentences per effect", () => {
  it.each([
    [entry("EffectApplied", { effect: "adjustTrack", track: "legitimacy", before: 10, after: 8, lost: 0 }), "Legitimacy fell by 2 (10 → 8)."],
    [entry("EffectApplied", { effect: "adjustTrack", track: "europe", before: 5, after: 5, lost: 1 }), "Europe stayed at 5 (1 over the track limit)."],
    [entry("EffectApplied", { effect: "setTrack", track: "posture.kdp", before: "host", after: "tolerant" }), "KDP posture changed from Host to Tolerant."],
    [entry("EffectApplied", { effect: "stepOrdinal", track: "emergencyRule", before: "ohal", after: "ohalExtendedPowers", lost: 0 }), "Emergency Rule changed from OHAL to OHAL Extended Powers."],
    [entry("EffectApplied", { effect: "setFlag", flag: "law3175", before: false, after: true }), "Law 3175 is now in force."],
    [entry("EffectApplied", { effect: "placePieces", piece: "guerrilla", space: "hakkari", face: "underground", count: 2 }, { cause: event }), 'PKK placed 2 Underground Guerrillas in Hakkari (Event "Eruh and Şemdinli (15 Aug 1984)", shaded).'],
    [entry("EffectApplied", { effect: "movePieces", piece: "guerrilla", from: "kdp-zone", to: "hakkari", face: "underground", arrive: "active", count: 1 }), "PKK moved 1 Underground Guerrilla from KDP Zone to Hakkari, now Active."],
    [entry("EffectApplied", { effect: "removePieces", piece: "troops", space: "hakkari", face: "default", count: 2, to: "available" }), "2 Troops removed from Hakkari."],
    [entry("EffectApplied", { effect: "setPieceState", piece: "guerrilla", space: "botan", from: "underground", to: "active", count: 2 }), "2 Guerrillas in Botan flipped from Underground to Active."],
    [entry("EffectApplied", { effect: "placeMarker", marker: "coercion", space: "botan", side: "default" }), "Coercion marker placed in Botan."],
    [entry("EffectApplied", { effect: "removeMarker", marker: "displacement", space: "dersim", side: "old" }), "Displacement (Old) marker removed from Dersim."],
    [entry("EffectApplied", { effect: "flipMarker", marker: "displacement", space: "dersim", from: "new", to: "old" }), "Displacement marker in Dersim flipped from New to Old."],
    [entry("EffectApplied", { effect: "shiftLevel", space: "botan", before: -1, after: -2, steps: 1 }), "Botan shifted from Passive Opposition to Active Opposition."],
    [entry("EffectApplied", { effect: "transferPool", piece: "guards", from: "outOfPlay", to: "available", count: 16 }), "16 Village Guards moved from Out of Play to Available."],
    [entry("EffectSkipped", { effect: "freeAction", action: "pkk.attack", reason: "declined" }), "The free Attack was declined."],
    [entry("EffectSkipped", { effect: "legalPolitics", reason: "legalSpaceAbsent" }), "Legal Politics skipped: Legal Space is Absent."],
    [entry("EffectSkipped", { effect: "coerceShift", space: "botan", reason: "block" }), "Coerce could not shift Botan: a marker blocks it."],
  ])("%#", (e, text) => {
    expect(one(e)).toBe(text);
  });
});

describe("fallbacks, folding, filtering", () => {
  it("never shows raw JSON for an unknown kind, effect or ID", () => {
    expect(one(entry("Mystery", { x: 1 }))).toBe("Mystery.");
    expect(one(entry("EffectApplied", { effect: "teleportPieces" }))).toBe("Teleport Pieces applied.");
    expect(one(entry("EffectApplied", { effect: "placePieces", piece: "drone", space: "mars-base", face: "default", count: 1 }), null)).toBe("Placed 1 Drone in Mars Base.");
    expect(one(entry("EffectApplied", {}, { data: "{broken" }))).toBe("Effect applied.");
    expect(one(entry("EffectSkipped", {}))).toBe("Effect skipped.");
  });

  it("folds a cost and its Resources change into one line with the cause", () => {
    const lines = plainLines([
      entry("CostPaid", { faction: "pkk", track: "resources.pkk", amount: 1, location: "dersim" }, { cause: rally, rule_ref: "06 s4.1" }),
      entry("EffectApplied", { effect: "adjustTrack", track: "resources.pkk", before: 5, after: 4, lost: 0 }),
      entry("EffectApplied", { effect: "placePieces", piece: "guerrilla", space: "dersim", face: "underground", count: 1 }, { cause: rally }),
    ], view, "pkk", true);
    expect(lines.map((l) => l.text)).toEqual(["PKK spent 1 Resource for Rally in Dersim (5 → 4).", "PKK placed 1 Underground Guerrilla in Dersim (Rally)."]);
    expect(lines[0]?.ref).toBe("06 s4.1");
  });

  it("drops bookkeeping only for the Last action box and keeps rule refs out of the text", () => {
    const es = [entry("PhaseStarted", { phase: "upkeep" }), entry("ValidationPassed", {}), entry("ControlChanged", { space: "botan", before: null, after: "pkk" }, { rule_ref: "coin.control", assumption_ref: "PA-06" })];
    expect(plainLines(es, view, null, true).map((l) => l.text)).toEqual(["Botan: Control passed from no one to PKK."]);
    expect(plainLines(es, view, null, false)).toHaveLength(3);
    const ref = plainLines(es, view, null, true)[0];
    expect(ref?.text).not.toMatch(/coin\.control|PA-06/);
    expect(ref?.ref).toBe("coin.control · Prototype assumption PA-06");
  });

  it("reads an older session's row from its data, not its stored technical text", () => {
    const old = entry("EffectApplied", { effect: "adjustTrack", track: "resources.state", before: 12, after: 10, lost: 0 }, { text: "adjustTrack: track resources.state, before 12, after 10, lost 0. (06 s2.1)" });
    expect(one(old)).toBe("State Resources fell by 2 (12 → 10).");
  });

  it("counts pieces in plain English", () => {
    expect(one(entry("EffectApplied", { effect: "placePieces", piece: "troops", space: "hakkari", face: "default", count: 1 }))).toBe("State placed 1 Troop in Hakkari.");
    expect(one(entry("EffectApplied", { effect: "placePieces", piece: "police", space: "hakkari", face: "default", count: 2 }))).toBe("State placed 2 Police in Hakkari.");
  });

  it("titles an action in plain words", () => {
    expect(actionTitle({ faction: "pkk", box: "event", summary: "ChooseEvent by pkk", phase: "card" }, view)).toBe("PKK took the Event");
    expect(actionTitle({ faction: "state", box: "opSa", summary: "ChooseOperation by state", phase: "card" }, view)).toBe("State chose Op + SA");
    expect(actionTitle({ faction: null, box: null, summary: "Advance", phase: "propaganda" }, view)).toBe("Propaganda step");
  });
});

describe("Tip and LogLines (R7)", () => {
  it("opens on focus with the rule reference and closes with Esc", async () => {
    render(<Tip text="06 s4.1"><button type="button">line</button></Tip>);
    fireEvent.focus(screen.getByRole("button", { name: "line" }));
    await waitFor(() => { expect(screen.getAllByText("06 s4.1").length).toBeGreaterThan(0); });
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    await waitFor(() => { expect(screen.queryAllByText("06 s4.1")).toHaveLength(0); });
  });

  it("renders a line with no reference without a hover target", () => {
    const item = { action: { faction: "pkk" }, entries: [entry("ControlChanged", { space: "botan", before: null, after: "pkk" })], notes: 0 } as unknown as HistoryItem;
    render(<LogLines item={item} view={view} playerOnly />);
    expect(screen.getByText("Botan: Control passed from no one to PKK.").getAttribute("tabindex")).toBeNull();
  });
});

describe("causeOf (server)", () => {
  it("reads an Event line, an Operation, a Propaganda phase or nothing from a rule reference", () => {
    expect(causeOf(kurdish.ruleset, "DK-001 shaded")).toMatchObject({ kind: "event", card: "DK-001", side: "shaded" });
    expect(causeOf(kurdish.ruleset, "06 s4.1")).toEqual(rally);
    expect(causeOf(kurdish.ruleset, "05 s6.3")).toEqual({ kind: "phase", id: "upkeep" });
    expect(causeOf(kurdish.ruleset, "coin.control")).toBeNull();
    expect(causeOf(kurdish.ruleset, null)).toBeNull();
  });
});
