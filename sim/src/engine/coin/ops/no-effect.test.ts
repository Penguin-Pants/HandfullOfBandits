// Decision 18 (m-17; rules 3.1): a selected location must change. A piece entering or leaving is a change.
import { expect, it } from "vitest";
import type { LogEntry } from "../../core/types.ts";
import { turnOf } from "../../../../test/board.ts";
import { unchangedLocations } from "./no-effect.ts";

const state = turnOf("pkk");
const entry = (kind: LogEntry["kind"], data: LogEntry["data"]): LogEntry => ({ kind, stateSeq: 0, ruleRef: null, assumptionRef: null, data });

it("reports a location with the same contents and no moves as unchanged", () => {
  expect(unchangedLocations(state, state, ["hakkari", "sirnak"], [])).toEqual(["hakkari", "sirnak"]);
});

it("counts the origin and destination of an applied move as changed", () => {
  const moved = [entry("EffectApplied", { effect: "movePieces", from: "sirnak", to: "hakkari", count: 2 })];
  expect(unchangedLocations(state, state, ["hakkari", "sirnak", "mardin"], moved)).toEqual(["mardin"]);
});

it("does not count a skipped move or another effect as a change", () => {
  const other = [entry("EffectSkipped", { effect: "movePieces", from: "sirnak", to: "hakkari", count: 2 }), entry("EffectApplied", { effect: "placePieces", space: "hakkari" })];
  expect(unchangedLocations(state, state, ["hakkari", "sirnak"], other)).toEqual(["hakkari", "sirnak"]);
});
