// Phase 3 (20): observation boundary. Players see public state only; hidden deck order, RNG and
// seed cannot change what they see, the candidates they get or the choices they make.
import { describe, expect, it } from "vitest";
import { decisionPoint, generateCandidates } from "../src/cli/candidates.ts";
import { freezeExperiment, parseManifest, runtimeIdentity } from "../src/cli/experiment-manifest.ts";
import { determinize, observe, samplePiles, SearchRng } from "../src/cli/player-observation.ts";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import { TransitionBudget, type ObservationPlayer } from "../src/cli/players.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { seedRng } from "../src/engine/core/rng.ts";
import type { GameState } from "../src/engine/core/types.ts";
import { engine, ruleset, setPieces } from "./board.ts";
import { devManifest } from "./experiment-helpers.ts";

/** Scripted play for `steps` commands from the Scenario A start. */
function after(seed: number, steps: number): GameState {
  let s = engine.start(ruleset, "scenario-a", seed).state;
  for (let i = 0; i < steps && s.ended === null; i++) {
    const r = engine.apply(ruleset, s, scriptedPolicy(engine, ruleset, s));
    if (!r.ok) throw new Error("scripted play must be legal");
    s = r.transition.state;
  }
  return s;
}

/** Same public position, different hidden future: other unseen cards in other order, other RNG and seed. */
function hiddenVariant(s: GameState): GameState {
  const unseenC1 = Object.values(ruleset.cards).filter((c) => c.campaign === "C1" && c.type !== "pivotal" && !s.deck.played.includes(c.id) && c.id !== s.deck.currentCard).map((c) => c.id);
  const piles = s.deck.piles.map((p, i) => (i === 0 ? [...unseenC1].reverse().slice(0, p.length) : [...p].reverse()));
  return { ...s, meta: { ...s.meta, seed: s.meta.seed + 999 }, rng: seedRng(4242), deck: { ...s.deck, piles } };
}

const live = (s: GameState, faction: string): string[] => {
  const point = decisionPoint(engine, ruleset, s);
  if (point.kind === "auto" || point.kind === "none") throw new Error("needs a decision");
  const projection = determinize(ruleset, observe(s, faction), new SearchRng(0));
  return generateCandidates(engine, ruleset, projection, point.kind, faction).candidates.filter((c) => engine.validate(ruleset, s, c.command).ok).map((c) => c.id);
};

describe("observation allowlist (19 s5)", () => {
  const s = after(5, 12);

  it("contains only public fields and never the seed, RNG, piles, set-aside cards or hidden marker data", () => {
    const o = observe(s, "state");
    expect(Object.keys(o).sort()).toEqual(["currentCard", "ended", "flags", "handCounts", "hiddenMarkers", "history", "initiative", "markerPools", "meta", "modifiers", "ownHand", "pending", "pileCounts", "played", "pools", "setAsideCount", "spaces", "tracks", "turn", "version", "viewer"].sort());
    expect(Object.keys(o.meta).sort()).toEqual(["packageHash", "rulesetVersion", "scenarioId", "stateSeq"]);
    const text = JSON.stringify(o);
    for (const card of s.deck.piles.flat()) if (!s.deck.played.includes(card) && card !== s.deck.currentCard) expect(text).not.toContain(card);
    expect(text).not.toContain(JSON.stringify(s.rng));
  });

  it("shows each faction its own Pivotal hand and only a count of the opponent's", () => {
    const start = engine.start(ruleset, "scenario-a", 1).state;
    expect(observe(start, "pkk").ownHand).toEqual(["DK-015"]);
    expect(observe(start, "state").ownHand).toEqual([]);
    expect(observe(start, "state").handCounts).toEqual({ state: 0, pkk: 1 });
  });

  it("is identical when only the hidden deck, RNG and seed differ", () => {
    for (const f of ["state", "pkk"]) expect(observe(hiddenVariant(s), f)).toEqual(observe(s, f));
  });

  it("is frozen: nested mutation throws and never reaches the engine state", () => {
    const o = observe(s, "pkk");
    const before = JSON.stringify(s);
    expect(() => { (o.spaces["botan"]?.pieces["guerrilla"] as Record<string, number>)["underground"] = 99; }).toThrow(TypeError);
    expect(() => { (o.tracks as Record<string, number>)["legitimacy"] = 0; }).toThrow(TypeError);
    expect(JSON.stringify(s)).toBe(before);
  });

  it("includes an open Pivotal decision, which is public", () => {
    const ready = setPieces(setPieces(engine.start(ruleset, "scenario-a", 1).state, "hakkari", "pkkBase", 1), "hakkari", "guerrilla", 6);
    const revealed = engine.apply(ruleset, ready, { type: "Advance" });
    expect.assert(revealed.ok);
    const found = revealed.transition.state;
    expect(found.turn.phase).toBe("pivotal");
    expect(observe(found, "state").pending?.id).toBe(found.pending?.id);
  });
});

describe("hidden-state equivalence for candidates and players (20 Phase 3)", () => {
  it("gives the same validated candidates for both factions when only hidden state differs", () => {
    for (const steps of [1, 6, 12, 20]) {
      const s = after(9, steps);
      const point = decisionPoint(engine, ruleset, s);
      if (point.kind === "auto" || point.kind === "none") continue;
      expect(live(hiddenVariant(s), point.faction)).toEqual(live(s, point.faction));
    }
  });

  it("makes the same qualified-player choice when only hidden state differs", () => {
    const s = after(9, 6);
    const point = decisionPoint(engine, ruleset, s);
    if (point.kind === "auto" || point.kind === "none") throw new Error("needs a decision");
    const player = resolvePlayer(point.faction === "state" ? "S-ADAPT@1" : "P-ADAPT@1") as ObservationPlayer;
    const choose = (st: GameState): string => {
      const observation = observe(st, point.faction);
      const projection = determinize(ruleset, observation, new SearchRng(0));
      const candidates = generateCandidates(engine, ruleset, projection, point.kind, point.faction).candidates;
      return player.decide({ decisionId: "d", kind: point.kind, faction: point.faction, observation, candidates }, { engine, ruleset, rng: new SearchRng(7), budget: new TransitionBudget(engine, player.spec.budget) }).candidateId;
    };
    expect(choose(hiddenVariant(s))).toBe(choose(s));
  });

  it("does not let an unqualified control enter a qualified stage unnoticed", () => {
    const manifest = parseManifest(JSON.stringify(devManifest({ stage: "pilot", matchups: [{ state: "S-CTRL-concentration@1", pkk: "P-POL@1" }] })));
    expect(() => freezeExperiment(manifest, "/", runtimeIdentity())).toThrow(/qualified players only/);
  });
});

describe("sampled futures follow the deck rules (19 s5; rules 10.3)", () => {
  it("never reuses seen cards and keeps mandatory cards in the top part, Propaganda in the bottom part", () => {
    const start = engine.start(ruleset, "scenario-a", 1).state;
    const mandatory = Object.values(ruleset.cards).filter((c) => c.mandatory).map((c) => c.id);
    const propaganda = Object.values(ruleset.cards).filter((c) => c.type === "propaganda").map((c) => c.id);
    const rng = new SearchRng(3);
    const firsts = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const piles = samplePiles(ruleset, observe(start, "pkk"), rng);
      expect(piles.map((p) => p.length)).toEqual(start.deck.piles.map((p) => p.length));
      for (const [k, pile] of piles.entries()) {
        expect(new Set(pile).size).toBe(pile.length);
        const real = start.deck.piles[k] ?? [];
        for (const id of pile) expect(Object.values(ruleset.cards).find((c) => c.id === id)?.campaign).toBe(k === 0 ? "C1" : "C2");
        for (const id of mandatory.filter((m) => pile.includes(m))) expect(pile.indexOf(id)).toBeLessThan(8);
        for (const id of propaganda.filter((m) => pile.includes(m))) expect(pile.indexOf(id)).toBeGreaterThanOrEqual(8);
        expect(pile.filter((c) => mandatory.includes(c)).sort()).toEqual(real.filter((c) => mandatory.includes(c)).sort());
      }
      firsts.add(piles[0]?.[0] ?? "");
    }
    expect(firsts.size).toBeGreaterThan(3);
  });

  it("respects revealed cards mid-pile: positions after revealed ones and no seen card again", () => {
    const s = after(5, 12);
    const o = observe(s, "state");
    const piles = samplePiles(ruleset, o, new SearchRng(1));
    const seen = new Set([...s.deck.played, s.deck.currentCard]);
    expect(piles.flat().some((c) => seen.has(c))).toBe(false);
    expect(piles.map((p) => p.length)).toEqual(o.pileCounts);
    const d = determinize(ruleset, o, new SearchRng(1));
    expect(d.meta.seed).not.toBe(s.meta.seed);
    expect(observe(d, "state")).toEqual(o);
  });
});
