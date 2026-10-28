import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { loadPackage, readPackageDir } from "../../../package/load.ts";
import { pickRandom, randomInt, seedRng, type RngState } from "../rng.ts";
import { emptyState } from "../state.ts";
import type { Effect, GameState, LogEntry, Ruleset } from "../types.ts";
import { applyEffect } from "./index.ts";

// T-PRIM (09 s3, 11 P1-07) on the tiny package (P1-06).
const loaded = loadPackage(readPackageDir(fileURLToPath(new URL("../../../../test/packages/tiny", import.meta.url))));
if (!loaded.ok) throw new Error("tiny must load");
const ruleset: Ruleset = loaded.ruleset;
const src = { ruleRef: "T-PRIM", assumptionRef: null };

type EffectInput = Effect extends infer E ? (E extends unknown ? Omit<E, "ruleRef" | "assumptionRef"> : never) : never;

function run(state: GameState, ...effects: EffectInput[]): { state: GameState; entries: LogEntry[] } {
  const entries: LogEntry[] = [];
  for (const effect of effects) {
    const result = applyEffect(ruleset, state, { ...src, ...effect });
    state = result.state;
    entries.push(...result.entries);
  }
  return { state, entries };
}

const empty = emptyState(ruleset, "start", 1);
const at = (state: GameState, space: string, piece: string, face = "default"): number => state.spaces[space]?.pieces[piece]?.[face] ?? -1;
const kinds = (entries: readonly LogEntry[]): string[] =>
  entries.map((e) => `${e.kind}:${typeof e.data["reason"] === "string" ? e.data["reason"] : ""}`);

describe("piece primitives", () => {
  it("placePieces takes Available pieces onto the placedAs face", () => {
    const { state, entries } = run(empty, { type: "placePieces", piece: "rebel", count: 2, space: "hills", state: null });
    expect(at(state, "hills", "rebel", "hidden")).toBe(2);
    expect(state.pools["rebel"]?.available).toBe(4);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: "EffectApplied", ruleRef: "T-PRIM", data: { effect: "placePieces", count: 2 } });
  });

  it("placePieces places what the stacking limit allows and skips the rest", () => {
    const { state, entries } = run(empty, { type: "placePieces", piece: "fort", count: 2, space: "city", state: null });
    expect(at(state, "city", "fort")).toBe(1);
    expect(kinds(entries)).toEqual(["EffectApplied:", "EffectSkipped:stacking"]);
  });

  it("placePieces places what is Available and skips the rest", () => {
    const { state, entries } = run(empty, { type: "placePieces", piece: "soldier", count: 8, space: "city", state: null });
    expect(at(state, "city", "soldier")).toBe(6);
    expect(entries[1]).toMatchObject({ kind: "EffectSkipped", data: { reason: "supply", count: 2 } });
  });

  it("placePieces into a space where the type may not stack places none", () => {
    const { state, entries } = run(empty, { type: "placePieces", piece: "soldier", count: 1, space: "refuge", state: null });
    expect(at(state, "refuge", "soldier")).toBe(0);
    expect(kinds(entries)).toEqual(["EffectSkipped:stacking"]);
  });

  it("removePieces returns pieces to the named pool and skips what is absent", () => {
    const placed = run(empty, { type: "placePieces", piece: "rebel", count: 2, space: "hills", state: null }).state;
    const { state, entries } = run(placed, { type: "removePieces", piece: "rebel", state: null, count: 3, space: "hills", to: "outOfPlay" });
    expect(at(state, "hills", "rebel", "hidden")).toBe(0);
    expect(state.pools["rebel"]).toEqual({ available: 4, outOfPlay: 2 });
    expect(kinds(entries)).toEqual(["EffectApplied:", "EffectSkipped:absent"]);
  });

  it("movePieces keeps the face and obeys stacking at the destination", () => {
    const placed = run(
      empty,
      { type: "placePieces", piece: "rebel", count: 1, space: "hills", state: "shown" },
      { type: "placePieces", piece: "soldier", count: 2, space: "farm", state: null },
    ).state;
    const moved = run(placed, { type: "movePieces", piece: "rebel", state: "shown", toState: null, count: 1, from: "hills", to: "refuge" });
    expect(at(moved.state, "refuge", "rebel", "shown")).toBe(1);
    const blocked = run(placed, { type: "movePieces", piece: "soldier", state: null, toState: null, count: 2, from: "farm", to: "refuge" });
    expect(at(blocked.state, "farm", "soldier")).toBe(2);
    expect(kinds(blocked.entries)).toEqual(["EffectSkipped:stacking"]);
  });

  it("movePieces counts stacking room across faces", () => {
    const limited: Ruleset = { ...ruleset, stacking: [...ruleset.stacking, { pieces: ["rebel"], max: 3, spaceKind: null, terrain: null, spaces: ["refuge"] }] };
    let state = empty;
    for (const face of ["hidden", "shown"]) {
      state = applyEffect(limited, state, { ...src, type: "placePieces", piece: "rebel", count: 2, space: "hills", state: face }).state;
    }
    const { state: moved, entries } = applyEffect(limited, state, { ...src, type: "movePieces", piece: "rebel", state: null, toState: null, count: 4, from: "hills", to: "refuge" });
    expect(moved.spaces["refuge"]?.pieces["rebel"]).toEqual({ hidden: 2, shown: 1 });
    expect(entries.at(-1)).toMatchObject({ kind: "EffectSkipped", data: { count: 1, reason: "stacking" } });
  });

  it("movePieces lands on toState when given (DK-005: moved Guerrillas arrive Underground)", () => {
    const placed = run(empty, { type: "placePieces", piece: "rebel", count: 2, space: "hills", state: "shown" }).state;
    const { state } = run(placed, { type: "movePieces", piece: "rebel", state: null, toState: "hidden", count: 2, from: "hills", to: "farm" });
    expect(state.spaces["farm"]?.pieces["rebel"]).toEqual({ hidden: 2, shown: 0 });
  });

  it("transferPool moves a count or all between Available and Out of Play", () => {
    const all = run(empty, { type: "transferPool", piece: "camp", from: "outOfPlay", to: "available", count: "all" });
    expect(all.state.pools["camp"]).toEqual({ available: 2, outOfPlay: 0 });
    const short = run(empty, { type: "transferPool", piece: "camp", from: "outOfPlay", to: "available", count: 3 });
    expect(short.state.pools["camp"]).toEqual({ available: 2, outOfPlay: 0 });
    expect(kinds(short.entries)).toEqual(["EffectApplied:", "EffectSkipped:absent"]);
  });

  it("setPieceState flips a count or all", () => {
    const placed = run(empty, { type: "placePieces", piece: "rebel", count: 3, space: "hills", state: null }).state;
    const one = run(placed, { type: "setPieceState", piece: "rebel", space: "hills", from: "hidden", to: "shown", count: 1 }).state;
    expect(one.spaces["hills"]?.pieces["rebel"]).toEqual({ hidden: 2, shown: 1 });
    const all = run(one, { type: "setPieceState", piece: "rebel", space: "hills", from: "hidden", to: "shown", count: "all" }).state;
    expect(all.spaces["hills"]?.pieces["rebel"]).toEqual({ hidden: 0, shown: 3 });
  });
});

describe("track primitives", () => {
  it("adjustTrack stops at the end and loses the excess (PA-04)", () => {
    const { state, entries } = run(empty, { type: "adjustTrack", track: "cash.red", delta: 25 });
    expect(state.tracks["cash.red"]).toBe(20);
    expect(entries[0]).toMatchObject({ kind: "EffectApplied", assumptionRef: "PA-04", data: { before: 0, after: 20, lost: 5 } });
  });

  it("adjustTrack charges an unpaid loss to the overflow track (research 04 s3.2)", () => {
    const start = run(empty, { type: "setTrack", track: "standing", value: 1, ifEquals: null }, { type: "setTrack", track: "cash.blue", value: 5, ifEquals: null }).state;
    const { state, entries } = run(start, { type: "adjustTrack", track: "standing", delta: -3 });
    expect(state.tracks["standing"]).toBe(0);
    expect(state.tracks["cash.blue"]).toBe(1);
    expect(entries[1]).toMatchObject({ kind: "EffectApplied", data: { effect: "overflow", track: "cash.blue", unpaid: 2, before: 5, after: 1 } });
  });

  it("adjustTrack loses an overflow cost the overflow track cannot pay", () => {
    const { state } = run(empty, { type: "adjustTrack", track: "standing", delta: -2 });
    expect(state.tracks["cash.blue"]).toBe(0);
  });

  it("setTrack sets a value only when the ifEquals guard holds", () => {
    const set = run(empty, { type: "setTrack", track: "border", value: "closed", ifEquals: "open" });
    expect(set.state.tracks["border"]).toBe("closed");
    const guarded = run(set.state, { type: "setTrack", track: "border", value: "watched", ifEquals: "open" });
    expect(guarded.state.tracks["border"]).toBe("closed");
    expect(kinds(guarded.entries)).toEqual(["EffectSkipped:guard"]);
  });

  it("stepOrdinal stops at the last step (PA-04)", () => {
    const { state, entries } = run(empty, { type: "stepOrdinal", track: "border", direction: "next", steps: 5 });
    expect(state.tracks["border"]).toBe("closed");
    expect(entries[0]).toMatchObject({ assumptionRef: "PA-04", data: { before: "open", after: "closed", lost: 3 } });
  });

  it("setFlag sets a flag", () => {
    expect(run(empty, { type: "setFlag", flag: "law3175", value: true }).state.flags).toEqual({ law3175: true });
  });
});

describe("marker primitives", () => {
  it("placeMarker skips with supply exhausted when none is Available (PA-09)", () => {
    const place = { type: "placeMarker", marker: "harm", space: "city", side: "default" } as const;
    const { state, entries } = run(empty, place, place, place, place, place);
    expect(state.spaces["city"]?.markers["harm"]).toEqual({ default: 4 });
    expect(state.markerPools["harm"]).toBe(0);
    expect(entries[4]).toMatchObject({ kind: "EffectSkipped", assumptionRef: "PA-09", data: { reason: "supply" } });
  });

  it("placeMarker warns when a Harm marker type runs out (PA-09)", () => {
    const harm = { type: "placeMarker", marker: "harm", space: "city", side: "default" } as const;
    expect(run(empty, harm, harm, harm, harm, harm).entries[4]?.data).toMatchObject({ reason: "supply", warning: "harmSupplyExhausted" });
    const office = { type: "placeMarker", marker: "office", space: "city", side: "default" } as const;
    expect(run(empty, office, office).entries[1]?.data).not.toHaveProperty("warning");
  });

  it("removeMarker returns a marker to supply and skips when absent", () => {
    const placed = run(empty, { type: "placeMarker", marker: "mark", space: "farm", side: "new" }).state;
    const { state, entries } = run(
      placed,
      { type: "removeMarker", marker: "mark", space: "farm", side: "new" },
      { type: "removeMarker", marker: "mark", space: "farm", side: "new" },
    );
    expect(state.markerPools["mark"]).toBe(3);
    expect(kinds(entries)).toEqual(["EffectApplied:", "EffectSkipped:absent"]);
  });

  it("flipMarker turns one marker to the named side", () => {
    const placed = run(empty, { type: "placeMarker", marker: "mark", space: "farm", side: "new" }).state;
    const { state } = run(placed, { type: "flipMarker", marker: "mark", space: "farm", side: "old" });
    expect(state.spaces["farm"]?.markers["mark"]).toEqual({ new: 0, old: 1 });
  });
});

describe("shiftLevel", () => {
  const shift = (direction: "support" | "opposition" | "neutral", steps: number) =>
    ({ type: "shiftLevel", space: "city", direction, steps }) as const;

  it("shifts one level per step and stops at the end of the scale", () => {
    const { state, entries } = run(empty, shift("support", 3));
    expect(state.spaces["city"]?.level).toBe(2);
    expect(kinds(entries)).toEqual(["EffectApplied:", "EffectSkipped:end"]);
  });

  it("moves toward Neutral and stops there", () => {
    const start = run(empty, shift("opposition", 2)).state;
    expect(run(start, shift("neutral", 5)).state.spaces["city"]?.level).toBe(0);
  });

  it("does not shift in a direction a marker in the space blocks", () => {
    const marked = run(empty, { type: "placeMarker", marker: "harm", space: "city", side: "default" }).state;
    const { state, entries } = run(marked, shift("support", 1));
    expect(state.spaces["city"]?.level).toBe(0);
    expect(kinds(entries)).toEqual(["EffectSkipped:block"]);
    expect(run(marked, shift("opposition", 1)).state.spaces["city"]?.level).toBe(-1);
  });

  it("does not shift past the cap of a marker in the space (Office, DEC-39)", () => {
    const marked = run(empty, { type: "placeMarker", marker: "office", space: "city", side: "default" }).state;
    const { state, entries } = run(marked, shift("opposition", 2));
    expect(state.spaces["city"]?.level).toBe(-1);
    expect(kinds(entries)).toEqual(["EffectApplied:", "EffectSkipped:cap"]);
  });

  it("skips a space with no support scale", () => {
    const { state, entries } = run(empty, { type: "shiftLevel", space: "refuge", direction: "support", steps: 1 });
    expect(state.spaces["refuge"]?.level).toBeNull();
    expect(kinds(entries)).toEqual(["EffectSkipped:noScale"]);
  });
});

describe("unknown IDs", () => {
  it.each<EffectInput>([
    { type: "removePieces", piece: "rebel", state: null, count: 1, space: "sea", to: "available" },
    { type: "movePieces", piece: "rebel", state: null, toState: null, count: 1, from: "sea", to: "hills" },
    { type: "setPieceState", piece: "rebel", space: "sea", from: "hidden", to: "shown", count: 1 },
    { type: "removeMarker", marker: "harm", space: "sea", side: "default" },
    { type: "flipMarker", marker: "mark", space: "sea", side: "old" },
    { type: "placePieces", piece: "tank", count: 1, space: "city", state: null },
    { type: "adjustTrack", track: "gold", delta: 1 },
  ])("throw for $type, because package data is validated on load", (effect) => {
    expect(() => run(empty, effect)).toThrow(RangeError);
  });
});

describe("invariants under random effects", () => {
  const spaces = ruleset.spaces.map((s) => s.id);
  function randomEffect(rng: RngState): [Effect, RngState] {
    let r = rng;
    const draw = <T>(items: readonly T[]): T => {
      const drawn = pickRandom(r, items);
      r = drawn.rng;
      return drawn.value;
    };
    const type = draw(["placePieces", "removePieces", "movePieces", "setPieceState", "transferPool", "adjustTrack", "setTrack", "stepOrdinal", "placeMarker", "removeMarker", "flipMarker", "setFlag", "shiftLevel"] as const);
    const space = draw(spaces);
    const to = draw(spaces);
    const piece = draw(["soldier", "fort", "rebel", "camp"]);
    const drawnN = randomInt(r, 4);
    r = drawnN.rng;
    const n = drawnN.value;
    const face = piece === "rebel" ? (n % 2 === 0 ? "hidden" : "shown") : null;
    const marker = (["harm", "mark", "office"] as const)[n % 3] ?? "harm";
    const side = marker === "mark" ? (n % 2 === 0 ? "new" : "old") : "default";
    const effects: Record<Effect["type"], EffectInput> = {
      placePieces: { type: "placePieces", piece, count: n, space, state: face },
      removePieces: { type: "removePieces", piece, state: face, count: n, space, to: n % 2 === 0 ? "available" : "outOfPlay" },
      movePieces: { type: "movePieces", piece, state: face, toState: n === 3 && piece === "rebel" ? "shown" : null, count: n, from: space, to },
      transferPool: { type: "transferPool", piece, from: n % 2 === 0 ? "available" : "outOfPlay", to: n % 2 === 0 ? "outOfPlay" : "available", count: n === 3 ? "all" : n },
      setPieceState: { type: "setPieceState", piece: "rebel", space, from: "hidden", to: "shown", count: n },
      adjustTrack: { type: "adjustTrack", track: (["cash.blue", "cash.red", "standing"] as const)[n % 3] ?? "standing", delta: n * 9 - 13 },
      setTrack: { type: "setTrack", track: "border", value: "open", ifEquals: null },
      stepOrdinal: { type: "stepOrdinal", track: "border", direction: n % 2 === 0 ? "next" : "previous", steps: n },
      placeMarker: { type: "placeMarker", marker, space, side },
      removeMarker: { type: "removeMarker", marker, space, side },
      flipMarker: { type: "flipMarker", marker: "mark", space, side: n % 2 === 0 ? "new" : "old" },
      setFlag: { type: "setFlag", flag: "f", value: true },
      shiftLevel: { type: "shiftLevel", space, direction: (["support", "opposition", "neutral"] as const)[n % 3] ?? "neutral", steps: n },
    };
    return [{ ...src, ...effects[type] }, r];
  }

  function checkInvariants(state: GameState): void {
    for (const piece of ruleset.pieces) {
      const onMap = Object.values(state.spaces).reduce(
        (sum, s) => sum + Object.values(s.pieces[piece.id] ?? {}).reduce((a, b) => a + b, 0),
        0,
      );
      const pool = state.pools[piece.id];
      expect(onMap + (pool?.available ?? 0) + (pool?.outOfPlay ?? 0), piece.id).toBe(piece.count);
    }
    for (const marker of ruleset.markers) {
      const onMap = Object.values(state.spaces).reduce(
        (sum, s) => sum + Object.values(s.markers[marker.id] ?? {}).reduce((a, b) => a + b, 0),
        0,
      );
      expect(onMap + (state.markerPools[marker.id] ?? 0), marker.id).toBe(marker.count);
    }
    for (const track of ruleset.tracks) {
      const value = state.tracks[track.id];
      if (track.kind === "numeric") expect(value).toSatisfy((v: unknown) => typeof v === "number" && v >= track.min && v <= track.max);
      else expect(track.steps).toContain(value);
    }
    for (const space of ruleset.spaces) {
      const s = state.spaces[space.id];
      for (const rule of ruleset.stacking) {
        if (rule.spaceKind !== null && rule.spaceKind !== space.kind) continue;
        if (rule.terrain !== null && (space.terrain === null || !rule.terrain.includes(space.terrain))) continue;
        if (rule.spaces !== null && !rule.spaces.includes(space.id)) continue;
        const n = rule.pieces.reduce((sum, p) => sum + Object.values(s?.pieces[p] ?? {}).reduce((a, b) => a + b, 0), 0);
        expect(n).toBeLessThanOrEqual(rule.max);
      }
      if (s?.level != null) expect(Math.abs(s.level)).toBeLessThanOrEqual(ruleset.levelRange);
      for (const face of Object.values(s?.pieces ?? {}).flatMap((f) => Object.values(f))) expect(face).toBeGreaterThanOrEqual(0);
    }
  }

  it.each([1, 2, 3, 4, 5])("piece, marker, track, stacking and level invariants hold over 400 random effects (seed %i)", (seed) => {
    let rng = seedRng(seed);
    let state = empty;
    let applied = 0;
    for (let i = 0; i < 400; i++) {
      let effect: Effect;
      [effect, rng] = randomEffect(rng);
      const before = JSON.stringify(state);
      const result = applyEffect(ruleset, state, effect);
      expect(JSON.stringify(state), "input state unchanged").toBe(before);
      if (result.entries.some((e) => e.kind === "EffectApplied")) applied++;
      state = result.state;
      checkInvariants(state);
    }
    expect(applied).toBeGreaterThan(100);
  });
});
