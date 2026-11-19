// Audit Plan 2 S1: a bot takes one seat of a play session. Full campaigns through the session
// service with each seat a bot and the other a scripted "human" that picks generated candidates.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { decisionPoint, generateCandidates, type DecisionKind } from "../src/cli/candidates.ts";
import { SearchRng } from "../src/cli/player-observation.ts";
import type { AnyCommand, FactionId, GameState, JsonObject, Ruleset } from "../src/engine/core/types.ts";
import { seatBots } from "../src/main.ts";
import { buildApp } from "../src/server/app.ts";
import { ServiceError, SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

const dir = mkdtempSync(join(tmpdir(), "hob-seat-"));
const db = openStore(join(dir, "store.sqlite"));
const service = new SessionService(db, join(kurdishDir, "..", ".."), seatBots);
const app = buildApp(service);
afterAll(async () => {
  await app.close();
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const start = (seats: Record<string, unknown>, seed = 5) => service.createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed, name: "seat", seats });

/** The "human": the n-th generated candidate of its decision, with a fixed RNG. */
function human(ruleset: Ruleset, state: GameState, kind: DecisionKind, faction: FactionId, rng: SearchRng, extra: JsonObject = {}): AnyCommand {
  const options = generateCandidates(engine, ruleset, state, kind, faction, { familyCap: 14, broad: false, ...extra }).candidates;
  const pick = options[rng.int(options.length)];
  if (pick === undefined) throw new Error(`no ${kind} candidate for ${faction}`);
  return pick.command;
}

interface Played { readonly sessionId: string; readonly botActions: number; readonly partials: number; readonly kinds: Set<string> }

/** Play a full campaign: the bot acts when the service says so; the human and automatic steps otherwise. */
function play(seats: Record<string, string>, seed: number): Played {
  const created = start(seats, seed);
  const { sessionId } = created;
  const rng = new SearchRng(seed);
  let head = created.head;
  let botActions = 0;
  let partials = 0;
  const kinds = new Set<string>();
  for (let i = 0; i < 3000 && head.state.ended === null; i++) {
    const { ruleset } = service.session(sessionId);
    const point = decisionPoint(engine, ruleset, head.state);
    if (point.kind !== "auto" && point.kind !== "none") kinds.add(point.kind);
    const bot = service.botToAct(sessionId);
    if (bot !== null) {
      const step = service.botStep(sessionId, head.actionId, head.stateHash, null);
      if (step.actionId === null) {
        // A bot State part of a joint choice: the human PKK extends it.
        partials++;
        const kind = point.kind === "redeployState" ? "redeployPkk" : "legalPoliticsPkk";
        const extra = point.kind === "redeployState" ? { stateRedeploy: { troops: step.partial?.["troops"] ?? [], police: step.partial?.["police"] ?? [] } } : { stateLegalPolitics: step.partial ?? {} };
        head = service.submit(sessionId, human(ruleset, head.state, kind, "pkk", rng, extra), head.actionId, head.stateHash).head;
      } else {
        botActions++;
        head = service.session(sessionId).head;
      }
      continue;
    }
    if (point.kind === "none") throw new Error(`stall: ${point.reason}`);
    if (point.kind === "auto") {
      head = service.submit(sessionId, point.command, head.actionId, head.stateHash).head;
      continue;
    }
    if ((point.kind === "redeployState" || point.kind === "legalPoliticsState") && seats["pkk"] !== undefined) {
      // A human State part of a joint choice: the PKK bot extends it.
      const own = human(ruleset, head.state, point.kind, "state", rng);
      const step = service.botStep(sessionId, head.actionId, head.stateHash, (own["choice"] ?? {}) as JsonObject);
      expect(step.actionId).not.toBeNull();
      partials++;
      head = service.session(sessionId).head;
      continue;
    }
    head = service.submit(sessionId, human(ruleset, head.state, point.kind, point.faction, rng, point.kind === "legalPoliticsPkk" ? { stateLegalPolitics: {} } : {}), head.actionId, head.stateHash).head;
  }
  expect(head.state.ended).not.toBeNull();
  return { sessionId, botActions, partials, kinds };
}

describe("bot seat: session set-up", () => {
  it("lists the qualified roster for the Home screen", () => {
    const ids = service.seatPlayers().map((p) => p.id);
    expect(ids).toContain("S-ADAPT@4");
    expect(ids).toContain("P-SURV@4");
    expect(service.seatPlayers().filter((p) => p.recommended === true).map((p) => p.id)).toEqual(["S-CON@4"]);
  });

  it.each([
    [{ state: "S-NOPE@1" }, "Unknown player"],
    [{ state: "P-SURV@4" }, "plays pkk, not state"],
    [{ state: "S-CTRL-concentration@1" }, "cannot take a seat"],
    [{ europe: "S-ADAPT@4" }, "Unknown seat faction"],
  ])("refuses seats %j", (seats, message) => {
    expect(() => start(seats)).toThrow(message);
  });

  it("refuses a seat when the server has no bots", () => {
    const plain = new SessionService(db, join(kurdishDir, "..", ".."));
    expect(() => plain.createSession({ dir: kurdishDir, scenarioId: "full-campaign", seed: 1, name: "x", seats: { state: "S-ADAPT@4" } })).toThrow("no bot players");
  });

  it("refuses a bot step when a human acts, and a stale head", () => {
    const { sessionId, head } = start({ state: "S-RANDOM@1" });
    // Setup: an automatic Advance, no player decision.
    expect(service.botToAct(sessionId)).toBeNull();
    expect(() => service.botStep(sessionId, head.actionId, head.stateHash, null)).toThrow(ServiceError);
    const moved = service.submit(sessionId, { type: "Advance" }, head.actionId, head.stateHash);
    expect(() => service.botStep(sessionId, head.actionId, head.stateHash, null)).toThrow("moved on");
    expect(moved.head.state.turn.phase).toBe("card");
  });

  it("refuses a human command at the bot's decision", () => {
    const { sessionId, head } = start({ pkk: "P-RANDOM@1" });
    // The PKK is First Eligible on card 1 (sequence.yaml firstEligibleAtStart).
    const card = service.submit(sessionId, { type: "Advance" }, head.actionId, head.stateHash).head;
    expect(service.botToAct(sessionId)).toBe("pkk");
    expect(() => service.submit(sessionId, { type: "Pass", faction: "pkk" }, card.actionId, card.stateHash)).toThrow("The pkk bot acts now.");
  });
});

describe("bot seat: full campaigns", () => {
  it("a State bot plays every State decision; its records are in the History", () => {
    const run = play({ state: "S-RANDOM@1" }, 11);
    expect(run.botActions).toBeGreaterThan(20);
    expect(run.partials).toBeGreaterThan(0);
    const history = service.history(run.sessionId);
    const stateCards = history.filter((h) => h.action.faction === "state" && h.action.kind === "cardChoice");
    expect(stateCards.length).toBeGreaterThan(0);
    // Every State card choice came from the bot and says why.
    for (const h of stateCards) {
      const [record] = h.bot as { player: string; selected: string; candidates: number }[];
      expect(record?.player).toBe("S-RANDOM@1");
      expect(record?.candidates).toBeGreaterThan(0);
    }
    // The bot State part of a joint choice is recorded on the action the human PKK committed.
    expect(history.some((h) => (h.bot as { kind: string }[]).some((r) => r.kind === "redeployState"))).toBe(true);
    // Every PKK card choice is the human's: no bot record.
    expect(history.filter((h) => h.action.faction === "pkk" && h.action.kind === "cardChoice").every((h) => h.bot.length === 0)).toBe(true);
    // The stored commands replay to the same head (DEC-19).
    const { session, ruleset } = service.session(run.sessionId);
    expect(service.replayCheck(session, ruleset)).toBeNull();
  }, 240_000);

  it("a PKK bot extends the human State part of Redeploy and Legal Politics", () => {
    const run = play({ pkk: "P-RANDOM@1" }, 12);
    expect(run.partials).toBeGreaterThan(0);
    const history = service.history(run.sessionId);
    expect(history.some((h) => (h.bot as { kind: string }[]).some((r) => r.kind === "redeployPkk"))).toBe(true);
    expect(history.filter((h) => h.action.faction === "pkk" && h.action.kind === "cardChoice").every((h) => h.bot.length === 1)).toBe(true);
  }, 240_000);
});

describe("bot seat: HTTP", () => {
  it("creates a seated session, reports the bot to act and steps it", async () => {
    const created = await app.inject({ method: "POST", url: "/api/sessions", payload: { dir: kurdishDir, scenarioId: "full-campaign", seed: 3, name: "http", seats: { state: "S-RANDOM@1" } } });
    expect(created.statusCode).toBe(201);
    const { sessionId, head } = created.json<{ sessionId: string; head: { actionId: string; stateHash: string } }>();
    await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/commands`, payload: { command: { type: "Advance" }, headActionId: head.actionId } });
    const now = (await app.inject({ method: "GET", url: `/api/sessions/${sessionId}` })).json<{ botToAct: string | null; head: { actionId: string; stateHash: string; state: GameState } }>();
    const first = now.head.state.initiative.firstEligible;
    expect(now.botToAct).toBe(first === "state" ? "state" : null);
    const bad = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/bot-step`, payload: { headActionId: now.head.actionId, partial: [1] } });
    expect(bad.statusCode).toBe(400);
    const seats = await app.inject({ method: "GET", url: "/api/seat-players" });
    expect(seats.json<{ id: string }[]>().length).toBeGreaterThan(0);
    if (first === "state") {
      const step = await app.inject({ method: "POST", url: `/api/sessions/${sessionId}/bot-step`, payload: { headActionId: now.head.actionId, headStateHash: now.head.stateHash } });
      expect(step.statusCode).toBe(200);
      expect(step.json<{ actionId: string | null }>().actionId).not.toBeNull();
    }
    const refused = await app.inject({ method: "POST", url: "/api/sessions", payload: { dir: kurdishDir, scenarioId: "full-campaign", seed: 3, name: "x", seats: "state" } });
    expect(refused.statusCode).toBe(400);
  });
});

describe("bot seat: decision review (audit Plan 2 S4)", () => {
  it("a v4 card decision records the top candidates with their commands, values and the sampled line", () => {
    const { sessionId, head } = start({ pkk: "P-SURV@4" });
    service.submit(sessionId, { type: "Advance" }, head.actionId, head.stateHash);
    const now = service.session(sessionId).head;
    const step = service.botStep(sessionId, now.actionId, now.stateHash, null);
    const [record] = step.records as { selected: string; review: { id: string; value: number | null; command: { type: string } }[]; line?: { faction: string; command: { type: string } }[] }[];
    expect(record?.review.length).toBeGreaterThanOrEqual(2);
    expect(record?.review.length).toBeLessThanOrEqual(4);
    expect(record?.review[0]?.id).toBe(record?.selected);
    expect(record?.review.every((c) => typeof c.command.type === "string" && c.value !== null)).toBe(true);
    expect(record?.line?.length ?? 0).toBeGreaterThan(0);
    expect(record?.line?.some((p) => p.faction === "state")).toBe(true);
    // The History shows the same record for the committed action.
    const last = service.history(sessionId).at(-1);
    expect(last?.bot).toEqual(step.records);
  }, 120_000);
});
