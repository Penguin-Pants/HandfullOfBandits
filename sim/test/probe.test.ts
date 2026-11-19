// Audit Plan 1 D-04 (Plan 3 A4): probe players that steer play into rare systems, and the
// generator change they need (Strike Collaborators after the Operation, decision 10).
import { describe, expect, it, vi } from "vitest";
import { generateCandidates, type Candidate } from "../src/cli/candidates.ts";
import { runGame, type JournalEvent } from "../src/cli/game-runner.ts";
import { observe, SearchRng } from "../src/cli/player-observation.ts";
import { resolvePlayer } from "../src/cli/player-registry.ts";
import { TransitionBudget } from "../src/cli/players.ts";
import { focusHost, probePlayer, probeScore } from "../src/cli/strategies/probe.ts";
import type { AnyCommand, FactionId, GameState } from "../src/engine/core/types.ts";
import { engine, inCampaign, op, ruleset, setPieces, setTrack, turnOf, withCard } from "./board.ts";

vi.setConfig({ testTimeout: 120000 });

const rich = (s: GameState): GameState => setTrack(setTrack({ ...s, flags: { ...s.flags, law3175: true }, pools: { ...s.pools, guards: { available: 16, outOfPlay: 0 } } }, "resources.state", 30), "resources.pkk", 20);
const atCard = (s: GameState, cardIndex: number): GameState => ({ ...s, turn: { ...s.turn, cardIndex } });
const cards = (s: GameState, faction: FactionId): readonly Candidate[] => generateCandidates(engine, ruleset, s, "card", faction).candidates;
const pick = (s: GameState, faction: FactionId, candidates = cards(s, faction)): Candidate => {
  const choice = probePlayer(faction).decide({ decisionId: "d", kind: "card", faction, observation: observe(s, faction), candidates }, { engine, ruleset, rng: new SearchRng(1), budget: new TransitionBudget(engine, 0) });
  const found = candidates.find((c) => c.id === choice.candidateId);
  if (found === undefined) throw new Error("unknown candidate");
  return found;
};
const sa = (c: Candidate): Record<string, unknown> => ((c.command["plan"] as Record<string, unknown> | undefined)?.["sa"] ?? {}) as Record<string, unknown>;
const strikeBoard = (): GameState => setPieces(rich(turnOf("pkk")), "sirnak", "guards", 1);

describe("registry", () => {
  it("resolves S-PROBE@1 and P-PROBE@1 as baselines, never qualified", () => {
    for (const [id, faction] of [["S-PROBE@1", "state"], ["P-PROBE@1", "pkk"]] as const) expect(resolvePlayer(id).spec).toMatchObject({ id, faction, role: "baseline", access: "observation" });
  });
});

describe("candidate generator (decision 10, M-04)", () => {
  it("offers Strike Collaborators after the Operation as well as before", () => {
    const timings = new Set(cards(strikeBoard(), "pkk").filter((c) => sa(c)["action"] === "pkk.strike-collaborators").map((c) => sa(c)["timing"]));
    expect([...timings].sort()).toEqual(["after", "before"]);
  });
});

describe("State probe", () => {
  const board = rich(turnOf("state"));

  it("rotates the favored Special Activity by card: Village Clearance, Cross-Border, then Diplomacy", () => {
    // Şırnak with State Control under OHAL in C3: Village Clearance is legal (test/candidates.test.ts).
    const all = setTrack(setPieces(inCampaign(ruleset, board, "C3"), "sirnak", "troops", 6), "emergencyRule", "ohal");
    expect(sa(pick(atCard(all, 0), "state"))["action"]).toBe("state.village-clearance");
    // C1: KDP hot pursuit makes Cross-Border legal.
    expect([1, 2, 3].map((i) => sa(pick(atCard(board, i), "state"))["action"])).toEqual(["state.cross-border", "state.diplomacy", "state.diplomacy"]);
  });

  it("aims Diplomacy at the game's focus host, and at Syria from C3 while Syria is Host or Tolerant", () => {
    const s = atCard(board, 2);
    expect((sa(pick(s, "state"))["locations"] as string[])[0]).toBe(focusHost(observe(s, "state")));
    expect((sa(pick(inCampaign(ruleset, s, "C3"), "state"))["locations"] as string[])[0]).toBe("syria-bekaa");
  });

  it("plays DK-064 unshaded (Europe Ban) when the Event is open", () => {
    const s = withCard(inCampaign(ruleset, board, "C4"), "DK-064");
    expect(pick(s, "state").command).toMatchObject({ type: "ChooseEvent", side: "unshaded" });
  });

  it("files no closure case in Legal Politics, so the Prosecutor files at the Office limit", () => {
    const observation = observe(board, "state");
    const advance: Candidate = { id: "a", family: "propaganda:legalPolitics", command: { type: "Advance" } };
    const filing: Candidate = { id: "f", family: "propaganda:legalPolitics", command: { type: "PropagandaChoice", phase: "legalPolitics", choice: { closureFiling: true } } };
    expect(probeScore(advance, observation)).toBeGreaterThan(probeScore(filing, observation));
  });
});

describe("PKK probe", () => {
  it("plays DK-006 shaded (Guard Abuse) when the Event is open", () => {
    expect(pick(withCard(rich(turnOf("pkk")), "DK-006"), "pkk").command).toMatchObject({ type: "ChooseEvent", side: "shaded" });
  });

  it("takes Strike Collaborators after the Operation when it is legal", () => {
    expect(sa(pick(strikeBoard(), "pkk"))).toMatchObject({ action: "pkk.strike-collaborators", timing: "after" });
  });

  it("Marches into a Restricted box, with Host Pressure first in that box above a plain March", () => {
    const s = setTrack(setTrack(rich(turnOf("pkk")), "posture.kdp", "restricted"), "posture.puk", "tolerant");
    const o = observe(s, "pkk");
    const march = (box: string, pressure: string | null, timing = "before"): Candidate => ({ id: `${box}${pressure ?? ""}${timing}`, family: "op:pkk.march", command: op("pkk", "opSa", { op: "pkk.march", locations: [box], sa: pressure === null ? null : { action: "pkk.host-pressure", locations: [pressure], timing } }) });
    const rally = (box: string): Candidate => ({ id: `r${box}`, family: "op:pkk.rally", command: op("pkk", "opSa", { op: "pkk.rally", locations: [box], sa: { action: "pkk.host-pressure", locations: [box], timing: "before" } }) });
    const scores = [march("kdp-zone", "kdp-zone"), rally("puk-zone"), march("kdp-zone", null), march("kdp-zone", "kdp-zone", "after"), march("puk-zone", null), rally("syria-bekaa")].map((c) => probeScore(c, o));
    // Host Pressure where a backfire closes the box (March at Restricted, Rally at Tolerant), then a March into Restricted, then nothing.
    expect(scores).toEqual([88, 88, 85, 85, 0, 0]);
  });

  it("is random among candidates when none is a probe target", () => {
    const candidates = cards(turnOf("pkk"), "pkk").filter((c) => probeScore(c, observe(turnOf("pkk"), "pkk")) === 0);
    const picks = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((seed) => probePlayer("pkk").decide({ decisionId: "d", kind: "card", faction: "pkk", observation: observe(turnOf("pkk"), "pkk"), candidates }, { engine, ruleset, rng: new SearchRng(seed), budget: new TransitionBudget(engine, 0) }).candidateId));
    expect(picks.size).toBeGreaterThan(1);
  });
});

describe("focus host", () => {
  it("pushes PUK in two games of three and KDP in the third, by the first revealed card", () => {
    const host = (card: string): string => focusHost({ ...observe(turnOf("state"), "state"), played: [card] });
    expect(["DK-003", "DK-004", "DK-005"].map(host)).toEqual(["kdp-zone", "puk-zone", "puk-zone"]);
  });
});

describe("probe games", () => {
  it("complete full campaigns and reach Cross-Border, Diplomacy and Strike Collaborators after the Operation", () => {
    const seen = new Set<string>();
    for (const seed of [1, 2]) {
      const commands: AnyCommand[] = [];
      const status = runGame(engine, ruleset, "full-campaign", { gameId: `p${String(seed)}`, seed, conditionId: "default", players: { state: "S-PROBE@1", pkk: "P-PROBE@1" }, playerSeeds: { state: seed, pkk: seed + 100 }, repeat: 0 }, resolvePlayer, { commands: 4000, decisionMs: null }, (e: JournalEvent) => { if (e.t === "step") commands.push(e.command); });
      expect(status).toBe("complete");
      for (const c of commands) {
        const s = (c["plan"] as { sa?: { action?: string; timing?: string } } | undefined)?.sa;
        if (s?.action !== undefined) seen.add(s.action === "pkk.strike-collaborators" ? `${s.action}/${s.timing ?? ""}` : s.action);
      }
    }
    for (const id of ["state.cross-border", "state.diplomacy", "pkk.strike-collaborators/after"]) expect(seen).toContain(id);
  });
});
