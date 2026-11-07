import { describe, expect, it } from "vitest";
import { codes, engine, pieces, play, ruleset, setPieces, setTrack, turnOf, withCard } from "../../../test/board.ts";
import type { AnyCommand } from "../core/types.ts";
import { createExec } from "../core/exec.ts";
import { runEffects } from "./events.ts";

const board = (posture = "hostile") => setPieces(setPieces(setTrack(withCard(turnOf("pkk"), "DK-084"), "posture.puk", posture), "kdp-zone", "guerrilla", 2), "kdp-zone", "guerrilla", 2, "active");
const command = (answers: unknown[], chooseMoveFaces = true): AnyCommand => ({ type: "ChooseEvent", faction: "pkk", side: "shaded", answers, chooseMoveFaces });
const direction = "KDP Zone to PUK Zone";

describe("P4-15 card move source faces", () => {
  it("asks the executor for source faces before the next card question", () => {
    const result = engine.validate(ruleset, board(), command([direction, 2]));
    expect(result.violations[0]).toMatchObject({ code: "needsAnswer", question: { kind: "count", space: "kdp-zone", min: 0, max: 2 } });
    expect(result.violations[0]?.question?.prompt).toContain("underground");
  });

  it.each(["hostile", "host"])("moves the chosen mix into a %s zone", (posture) => {
    for (const underground of [0, 1, 2]) {
      const { state, entries } = play(board(posture), command([direction, 2, underground, "KDP Zone"]));
      expect(pieces(state, "kdp-zone", "guerrilla")).toEqual({ underground: 2 - underground, active: underground });
      expect(pieces(state, "puk-zone", "guerrilla")).toMatchObject(posture === "hostile" ? { active: 2 } : { underground, active: 2 - underground });
      expect(entries.filter(e => e.kind === "EffectApplied" && e.data["effect"] === "movePieces").reduce((sum, e) => sum + Number(e.data["count"]), 0)).toBe(2);
    }
  });

  it.each([-1, 3, 0.5, "1", null])("rejects an invalid face count %s", (answer) => {
    expect(codes(board(), command([direction, 2, answer, "KDP Zone"]))).toEqual(["badAnswer"]);
  });

  it("bounds the choice by the faces present", () => {
    const state = setPieces(board(), "kdp-zone", "guerrilla", 1);
    expect(engine.validate(ruleset, state, command([direction, 2])).violations[0]?.question).toMatchObject({ min: 0, max: 1 });
    expect(codes(state, command([direction, 2, 2, "KDP Zone"]))).toEqual(["badAnswer"]);
  });

  it("needs no extra answer for zero movement, a single face or a forced mix", () => {
    expect(codes(board(), command([direction, 0, "KDP Zone"]))).toEqual([]);
    expect(codes(setPieces(board(), "kdp-zone", "guerrilla", 0), command([direction, 2, "KDP Zone"]))).toEqual([]);
    expect(codes(setPieces(board(), "kdp-zone", "guerrilla", 1, "active"), command([direction, 3, "KDP Zone"]))).toEqual([]);
  });

  it("keeps legacy mixed-stack defaults with no opt-in", () => {
    for (const posture of ["hostile", "host"]) {
      const legacy = { type: "ChooseEvent", faction: "pkk", side: "shaded", answers: [direction, 2, "KDP Zone"] };
      const result = play(board(posture), legacy);
      expect(pieces(result.state, "kdp-zone", "guerrilla")).toEqual(posture === "hostile" ? { underground: 2, active: 0 } : { underground: 0, active: 2 });
      expect(play(board(posture), command(legacy.answers, false))).toEqual(result);
    }
  });

  it("uses the same choices for a State executor", () => {
    const state = board();
    const acting = { ...state, initiative: { ...state.initiative, firstEligible: "state", secondEligible: "pkk" } };
    const moved = play(acting, { ...command([direction, 2, 2, "KDP Zone"]), faction: "state" }).state;
    expect(pieces(moved, "kdp-zone", "guerrilla")).toEqual({ underground: 0, active: 2 });
  });

  it.each(["source face", "stacking", "short supply", "nested"])("handles %s through the existing core move", (variant) => {
    const r = variant === "stacking" ? { ...ruleset, stacking: [{ pieces: ["guerrilla"], max: 1, spaceKind: null, terrain: null, spaces: ["puk-zone"] }] } : ruleset;
    const ctx = createExec(r, board("host"));
    const move = { type: "movePieces" as const, piece: "guerrilla", state: variant === "source face" ? "active" : null, toState: null, count: variant === "short supply" ? 6 : 2, from: "kdp-zone", to: "puk-zone" };
    const effects = variant === "nested" ? [{ type: "forEachSpace" as const, where: { type: "spaceKind" as const, kind: "external" as const }, min: 1, max: 1, effects: [{ ...move, from: "selected" }] }] : [move];
    runEffects({ ctx, faction: "pkk", answers: variant === "nested" ? [["kdp-zone"], 1] : variant === "stacking" ? [1] : [], chooseMoveFaces: true, ruleRef: "P4-15" }, effects);
    expect(pieces(ctx.state, "puk-zone", "guerrilla")).toMatchObject(variant === "source face" ? { active: 2 } : variant === "short supply" ? { underground: 2, active: 2 } : variant === "stacking" ? { underground: 1 } : { underground: 1, active: 1 });
    if (variant === "stacking" || variant === "short supply") expect(ctx.entries.filter(e => e.kind === "EffectSkipped").map(e => e.data["reason"])).toContain(variant === "stacking" ? "stacking" : "absent");
  });
});
