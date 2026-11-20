// @vitest-environment jsdom
// Audit Plan 2 S1: the Play screen lets the seated bot act, joins a bot State part with the human
// PKK answers, sends a human State part to a PKK bot, walks Undo back past bot actions, and shows
// "Why?" for a bot command. Home starts a session with the chosen bot seat.
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setPieces, turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import type { GameState } from "../../engine/core/types.ts";
import type { BotRecord, Head, HistoryItem, LegalChoices, SessionRow } from "../api.ts";
import { Home } from "../home/Home.tsx";
import { BotWhy, commandText } from "../history/BotWhy.tsx";
import { BOT_SPEED_SETTING, botMoves, savedBotSpeed } from "./BotSpeed.tsx";
import { Play } from "./Play.tsx";

// The bot waits with setTimeout (R1.1): fake the timeouts. Testing Library flushes a setTimeout(0)
// after each act and moves a fake clock in waitFor only through a global `jest`: alias it to vi.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  vi.stubGlobal("jest", { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});
const tick = (ms: number): Promise<void> => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
/** Wait until the bot turn shows, then let the Normal wait run out. */
/** Choose a bot speed in the map tools select. */
const pick = (speed: string): void => { fireEvent.change(screen.getByLabelText("Bot speed"), { target: { value: speed } }); };
const botActs = async (): Promise<void> => {
  await screen.findByText(/is choosing/);
  await tick(1500);
};

const headOf = (id: string, state: GameState): Head => ({ actionId: id, stateHash: `h-${id}`, state, derived: null as never, view: boardView(kurdish.ruleset, kurdish.data, state) });
const cardHead = (id: string) => headOf(id, withCard(turnOf("state"), "DK-012"));
const redeployHead = (id: string) => {
  const s = turnOf("state");
  const step = kurdish.ruleset.sequence.propagandaPhases.indexOf("redeploy");
  return headOf(id, { ...s, turn: { ...s.turn, phase: "propaganda", step } });
};
const row = (seats: Record<string, string>): SessionRow => ({ name: "t", status: "active", seats: JSON.stringify(seats) }) as SessionRow;
const legalAdvance: LegalChoices = { faction: null, phase: "propaganda", advance: true, violations: [] };
const record: BotRecord = {
  id: "d1.0", kind: "card", faction: "state", player: "S-ADAPT@5", candidates: 12, selected: "a", value: 3.25, notes: ["2-move line on 3 leaders"], ms: 10,
  review: [
    { id: "a", family: "op:sweep", value: 3.25, components: { earnedMarginDiff: 1 }, command: { type: "ChooseOperation", faction: "state", box: "opSa", plan: { op: "state.sweep", locations: ["siirt"], sa: { action: "state.villageClearance", locations: ["siirt"] } } } },
    { id: "b", family: "pass", value: 1.5, components: {}, command: { type: "Pass", faction: "state" } },
  ],
  line: [{ faction: "pkk", command: { type: "Pass", faction: "pkk" } }, { faction: "state", command: { type: "ChooseEvent", faction: "state", side: "shaded" } }],
};
const item = (id: string, bot: readonly BotRecord[]): HistoryItem => ({ action: { action_id: id, status: "committed", faction: bot.length > 0 ? "state" : "pkk", box: "pass", phase: "card", summary: "Pass" }, entries: [], notes: 0, bot }) as never;

describe("Play with a bot seat", () => {
  it("steps the bot once for its head, then reloads", async () => {
    let n = 0;
    const heads = [cardHead("A1"), cardHead("A2")];
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: heads[n] as Head, botToAct: n === 0 ? "state" : null }));
    const botStep = vi.fn(() => { n = 1; return Promise.resolve({ actionId: "A2", partial: null, options: null, records: [record] }); });
    const legal = vi.fn(() => Promise.resolve<LegalChoices>({ faction: n === 0 ? "state" : "pkk", phase: "card", first: true, boxes: [], actions: [] }));
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    expect(await screen.findByText(/State bot \(S-ADAPT@5\) is choosing/)).toBeTruthy();
    await tick(1500);
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    expect(botStep).toHaveBeenCalledTimes(1);
    expect(botStep).toHaveBeenCalledWith("S", "A1", "h-A1");
    expect(screen.queryByText(/is choosing/)).toBeNull();
  });

  it("steps again when a continued Operation keeps the action ID but changes the state (PR 128 review)", async () => {
    let n = 0;
    const heads = [cardHead("A1"), { ...cardHead("A1"), stateHash: "h-A1b" }, cardHead("A2")];
    const session = vi.fn(() => Promise.resolve({ session: row({ pkk: "P-SURV@4" }), head: heads[n] as Head, botToAct: n < 2 ? "pkk" : null }));
    const botStep = vi.fn(() => { n++; return Promise.resolve({ actionId: "A1", partial: null, options: null, records: [record] }); });
    const legal = vi.fn(() => Promise.resolve<LegalChoices>({ faction: "pkk", phase: "card", first: true, boxes: [], actions: [] }));
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await botActs();
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    await tick(1500);
    await waitFor(() => { expect(botStep).toHaveBeenCalledTimes(2); });
    expect(botStep.mock.calls.map((c) => (c as unknown[])[2])).toEqual(["h-A1", "h-A1b"]);
  });

  it("lets the bot act again after a branch back to a head it already stepped from (PR 128 review)", async () => {
    let n = 0;
    const heads = [cardHead("A"), cardHead("B"), cardHead("A")];
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-CON@4" }), head: heads[n] as Head, botToAct: n === 1 ? null : "state" }));
    const botStep = vi.fn(() => { if (n === 0) n = 1; return Promise.resolve({ actionId: "B", partial: null, options: null, records: [record] }); });
    const history = vi.fn(() => Promise.resolve([item("A", []), item("B", [record])]));
    const branch = vi.fn(() => { n = 2; return Promise.resolve({ branchId: "b2", head: heads[2] as Head }); });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const legal = vi.fn(() => Promise.resolve<LegalChoices>({ faction: "state", phase: "card", first: true, boxes: [], actions: [] }));
    render(<Play api={mockApi({ session, legal, botStep, history, branch })} sessionId="S" />);
    await botActs();
    await waitFor(() => { expect(botStep).toHaveBeenCalledTimes(1); });
    fireEvent.click(await screen.findByRole("button", { name: "History (H)" }));
    fireEvent.click(await screen.findByRole("button", { name: "Branch from here" }));
    await waitFor(() => { expect(branch).toHaveBeenCalled(); });
    await botActs();
    await waitFor(() => { expect(botStep).toHaveBeenCalledTimes(2); });
  });

  it("shows the bot State part of Redeploy and sends only the human PKK routes", async () => {
    const statePart = { troops: [{ from: "van", to: "hakkari", count: 2 }], police: [], guerrilla: [] };
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: redeployHead("R1"), botToAct: "state" }));
    const botStep = vi.fn(() => Promise.resolve({ actionId: null, partial: statePart, options: null, records: [record] }));
    const submit = vi.fn(() => Promise.resolve({ actionId: "R2", head: redeployHead("R2"), entries: [] }));
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), botStep, submit })} sessionId="S" />);
    await botActs();
    expect(await screen.findByLabelText("State bot part")).toBeTruthy();
    expect(screen.getByLabelText("State bot part").textContent).toMatch(/moves 2 Troops from Van/);
    // The human PKK routes Guerrillas only; the server keeps the bot's Troops and Police.
    expect(screen.queryByRole("button", { name: "Troops" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Redeploy pieces" }));
    await waitFor(() => { expect(submit).toHaveBeenCalled(); });
    expect(submit).toHaveBeenCalledWith("S", { type: "PropagandaChoice", phase: "redeploy", choice: { troops: [], police: [], guerrilla: [] } }, "R1", "h-R1");
  });

  it("lets the human PKK build a Guerrilla Redeploy route on the map after the bot State part (R2)", async () => {
    const statePart = { troops: [{ from: "van-rural", to: "van-city", count: 2 }], police: [] };
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: redeployHead("R1"), botToAct: "state" }));
    const botStep = vi.fn(() => Promise.resolve({ actionId: null, partial: statePart, options: null, records: [record] }));
    const submit = vi.fn(() => Promise.resolve({ actionId: "R2", head: redeployHead("R2"), entries: [] }));
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), botStep, submit })} sessionId="S" />);
    await botActs();
    expect(await screen.findByLabelText("State bot part")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Hakkari" }));
    fireEvent.click(screen.getByRole("button", { name: /^Ş[ıi]rnak$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Add route" }));
    fireEvent.click(screen.getByRole("button", { name: "Redeploy pieces" }));
    await waitFor(() => { expect(submit).toHaveBeenCalled(); });
    expect(submit).toHaveBeenCalledWith("S", { type: "PropagandaChoice", phase: "redeploy", choice: { troops: [], police: [], guerrilla: [{ from: "hakkari", to: "sirnak", count: 1 }] } }, "R1", "h-R1");
  });

  it("sends a human State part of a joint phase to the PKK bot", async () => {
    const session = vi.fn(() => Promise.resolve({ session: row({ pkk: "P-SURV@4" }), head: redeployHead("R1"), botToAct: null, botExtends: true }));
    const botStep = vi.fn(() => Promise.resolve({ actionId: "R2", partial: null, options: null, records: [] }));
    const submit = vi.fn();
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), botStep, submit })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("button", { name: "Redeploy pieces" }));
    await waitFor(() => { expect(botStep).toHaveBeenCalled(); });
    expect(botStep).toHaveBeenCalledWith("S", "R1", "h-R1", { troops: [], police: [], guerrilla: [] });
    expect(submit).not.toHaveBeenCalled();
    // The human State routes Troops and Police only.
    expect(screen.queryByRole("button", { name: "Guerrilla" })).toBeNull();
  });

  it("submits an automatic Advance normally when no State decision is open for the PKK bot", async () => {
    const s = turnOf("state");
    const head = headOf("L1", { ...s, turn: { ...s.turn, phase: "propaganda", step: kurdish.ruleset.sequence.propagandaPhases.indexOf("legalPolitics") } });
    const session = vi.fn(() => Promise.resolve({ session: row({ pkk: "P-SURV@4" }), head, botToAct: null, botExtends: false }));
    const submit = vi.fn(() => Promise.resolve({ actionId: "L2", head, entries: [] }));
    const botStep = vi.fn();
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), submit, botStep })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("button", { name: /Advance|Skip/ }));
    await waitFor(() => { expect(submit).toHaveBeenCalledWith("S", { type: "Advance" }, "L1", "h-L1"); });
    expect(botStep).not.toHaveBeenCalled();
  });

  it("offers the PKK Legal Politics options the server sends after the bot State part", async () => {
    const s = turnOf("state");
    const head = headOf("L1", { ...s, turn: { ...s.turn, phase: "propaganda", step: kurdish.ruleset.sequence.propagandaPhases.indexOf("legalPolitics") } });
    const options = [{ ceasefire: { accept: true } }, { ceasefire: { accept: true, leave: { pkk: true } } }];
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-CON@4" }), head, botToAct: "state" }));
    const botStep = vi.fn(() => Promise.resolve({ actionId: null, partial: { ceasefire: { accept: true } }, options, records: [record] }));
    const submit = vi.fn(() => Promise.resolve({ actionId: "L2", head, entries: [] }));
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), botStep, submit })} sessionId="S" />);
    await botActs();
    expect((await screen.findByLabelText("State bot part")).textContent).toMatch(/accepts the ceasefire/);
    // Not "End the ceasefire": acceptance made it Reciprocal Restraint.
    expect(screen.queryByRole("button", { name: /End the ceasefire/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Leave Reciprocal Restraint (Europe -1)" }));
    await waitFor(() => { expect(submit).toHaveBeenCalledWith("S", { type: "PropagandaChoice", phase: "legalPolitics", choice: options[1] }, "L1", "h-L1"); });
  });

  it("stops the Undo walk at a joint action the human completed", async () => {
    const joined = { ...record, humanJoined: true };
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: cardHead("A3"), botToAct: null }));
    const history = vi.fn(() => Promise.resolve([item("A1", []), item("A2", [joined]), item("A3", [record])]));
    const undo = vi.fn((_: string, at: string) => Promise.resolve({ undone: at, head: "x", undoneAfterRandom: false, state: cardHead(at === "A3" ? "A2" : "A1") }));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, history, undo, legal: () => Promise.resolve<LegalChoices>({ faction: "pkk", phase: "card", first: true, boxes: [], actions: [] }) })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("button", { name: "Undo (Ctrl+Z)" }));
    await waitFor(() => { expect(undo).toHaveBeenCalledTimes(2); });
    expect(undo.mock.calls.map((c) => c[1])).toEqual(["A3", "A2"]);
  });

  it("undoes the bot actions after the human's last action, then that action", async () => {
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: cardHead("A3"), botToAct: null }));
    const history = vi.fn(() => Promise.resolve([item("A1", []), item("A2", [record]), item("A3", [record])]));
    const undo = vi.fn((_: string, at: string) => Promise.resolve({ undone: at, head: "x", undoneAfterRandom: false, state: cardHead(at === "A3" ? "A2" : "A1") }));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, history, undo, legal: () => Promise.resolve<LegalChoices>({ faction: "pkk", phase: "card", first: true, boxes: [], actions: [] }) })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("button", { name: "Undo (Ctrl+Z)" }));
    await waitFor(() => { expect(undo).toHaveBeenCalledTimes(3); });
    expect(undo.mock.calls.map((c) => c[1])).toEqual(["A3", "A2", "A1"]);
  });
});

describe("Bot pacing and last bot moves (Phase 3)", () => {
  const move = (n: number, from: string, to: string, count: number, face: string) => ({ entry_id: `B-E${String(n)}`, action_id: "B", n, kind: "EffectApplied", state_seq: n, rule_ref: null, assumption_ref: null, data: JSON.stringify({ effect: "movePieces", piece: "guerrilla", from, to, face, arrive: face, count }), text: "", cause: null, cardTitle: null });
  /** A bot action that moved 2 + 1 Guerrillas from Hakkari to Şırnak, and a human action before it. */
  const botItem = { ...item("B", [record]), entries: [move(1, "hakkari", "sirnak", 2, "underground"), move(2, "hakkari", "sirnak", 1, "active")] } as HistoryItem;
  const deferred = <T,>() => {
    let resolve: (v: T) => void = () => undefined;
    const promise = new Promise<T>((r) => { resolve = r; });
    return { promise, resolve };
  };
  /** The State bot acts at head A1; after its step the head is A2 and the human PKK acts. */
  const steps = (failure?: Error) => {
    const n = { at: 0 };
    const botStep = vi.fn(() => {
      if (failure !== undefined) return Promise.reject(failure);
      n.at = 1;
      return Promise.resolve({ actionId: "A2", partial: null, options: null, records: [record] });
    });
    const heads = [cardHead("A1"), cardHead("A2")];
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: heads[n.at] as Head, botToAct: n.at === 0 ? "state" : null }));
    const legal = vi.fn(() => Promise.resolve<LegalChoices>({ faction: n.at === 0 ? "state" : "pkk", phase: "card", first: true, boxes: [], actions: [] }));
    return { n, session, legal, botStep };
  };

  it("botMoves adds up a route's applied moves and skips other entries and human actions", () => {
    const skipped = { ...move(3, "van", "hakkari", 4, "default"), kind: "EffectSkipped" };
    const placed = { ...move(4, "van", "hakkari", 1, "default"), data: JSON.stringify({ effect: "placePieces", space: "van", count: 1 }) };
    expect(botMoves({ ...botItem, entries: [...botItem.entries, skipped, placed] })).toEqual([{ from: "hakkari", to: "sirnak", count: 3 }]);
    expect(botMoves({ ...botItem, bot: [] })).toEqual([]);
    expect(botMoves(undefined)).toEqual([]);
  });

  it("savedBotSpeed falls back to Normal for a missing or unknown value", () => {
    expect(savedBotSpeed()).toBe("normal");
    localStorage.setItem(BOT_SPEED_SETTING, "warp");
    expect(savedBotSpeed()).toBe("normal");
  });

  it("AC1.1: waits 1.5 s at Normal speed before the bot step", async () => {
    const { session, legal, botStep } = steps();
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1499);
    expect(botStep).not.toHaveBeenCalled();
    await tick(1);
    expect(botStep).toHaveBeenCalledTimes(1);
  });

  it.each([["slow", 3000], ["fast", 500]] as const)("AC1.2: reads the saved %s speed on mount and waits %i ms", async (speed, ms) => {
    localStorage.setItem(BOT_SPEED_SETTING, speed);
    const { session, legal, botStep } = steps();
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    expect(screen.getByLabelText<HTMLSelectElement>("Bot speed").value).toBe(speed);
    await tick(ms - 1);
    expect(botStep).not.toHaveBeenCalled();
    await tick(1);
    expect(botStep).toHaveBeenCalledTimes(1);
  });

  it("AC1.2: saves the chosen speed in the browser", async () => {
    const { session, legal, botStep } = steps();
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    // In the map tools row; the board title gives up its room there (styles.css, make ux).
    expect((await screen.findByLabelText("Bot speed")).closest(".map-navigation")).not.toBeNull();
    pick("fast");
    expect(localStorage.getItem(BOT_SPEED_SETTING)).toBe("fast");
  });

  it("shows the speed control only when the session has a bot seat", async () => {
    const session = vi.fn(() => Promise.resolve({ session: row({}), head: cardHead("A1"), botToAct: null }));
    render(<Play api={mockApi({ session, legal: () => Promise.resolve<LegalChoices>({ faction: "pkk", phase: "card", first: true, boxes: [], actions: [] }) })} sessionId="S" />);
    await screen.findByRole("button", { name: "Undo (Ctrl+Z)" });
    expect(screen.queryByLabelText("Bot speed")).toBeNull();
  });

  it("AC1.3: Pause sends no bot step; Normal resumes it", async () => {
    const { session, legal, botStep } = steps();
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1000);
    pick("pause");
    await tick(10000);
    expect(botStep).not.toHaveBeenCalled();
    pick("normal");
    await tick(1500);
    expect(botStep).toHaveBeenCalledTimes(1);
  });

  it("AC1.6: a speed change during the wait starts the wait again at the new speed", async () => {
    const { session, legal, botStep } = steps();
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1000);
    pick("slow");
    await tick(2999);
    expect(botStep).not.toHaveBeenCalled();
    await tick(1);
    expect(botStep).toHaveBeenCalledTimes(1);
  });

  it("AC1.4: shows the last bot action's moves as arrows and its changed spaces as outlines during the wait", async () => {
    const heads = [cardHead("A1"), headOf("A2", setPieces(withCard(turnOf("state"), "DK-012"), "sirnak", "guerrilla", 3))];
    const n = { at: 0 };
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: heads[n.at] as Head, botToAct: "state" }));
    const history = vi.fn(() => Promise.resolve(n.at === 0 ? [item("A1", [])] : [item("A1", []), botItem]));
    const botStep = vi.fn(() => { n.at = 1; return Promise.resolve({ actionId: "B", partial: null, options: null, records: [record] }); });
    const legal = () => Promise.resolve<LegalChoices>({ faction: "state", phase: "card", first: true, boxes: [], actions: [] });
    const { container } = render(<Play api={mockApi({ session, legal, botStep, history })} sessionId="S" />);
    await botActs();
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    const arrows = await screen.findByLabelText("Last bot moves");
    expect(arrows.querySelectorAll(".map-arrow")).toHaveLength(1);
    expect(arrows.textContent).toBe("3");
    expect(container.querySelector('[data-space="sirnak"] .changed-outline')).not.toBeNull();
    // The second bot step still waits, so the moves stay on screen.
    expect(botStep).toHaveBeenCalledTimes(1);
  });

  it("AC1.4: a human plan click hides the bot arrows (plan arrows win)", async () => {
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: cardHead("A2"), botToAct: null }));
    const history = vi.fn(() => Promise.resolve([item("A1", []), botItem]));
    render(<Play api={mockApi({ session, history, legal: () => Promise.resolve<LegalChoices>({ faction: "pkk", phase: "card", first: true, boxes: [], actions: [] }) })} sessionId="S" />);
    expect((await screen.findByLabelText("Last bot moves")).textContent).toBe("3");
    fireEvent.click(screen.getByRole("button", { name: "Hakkari" }));
    expect(screen.queryByLabelText("Last bot moves")?.textContent ?? "").toBe("");
  });

  it("AC1.5: Undo during the wait sends no bot step for the old head", async () => {
    const { n, session, legal, botStep } = steps();
    const pending = deferred<never>();
    const history = vi.fn(() => Promise.resolve([item("A1", [])]));
    const undo = vi.fn(() => pending.promise);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, legal, botStep, history, undo })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1000);
    fireEvent.click(screen.getByRole("button", { name: "Undo (Ctrl+Z)" }));
    await waitFor(() => { expect(undo).toHaveBeenCalled(); });
    await tick(5000);
    expect(botStep).not.toHaveBeenCalled();
    n.at = 1;
    pending.resolve({ undone: "A1", head: "x", undoneAfterRandom: false, state: cardHead("A2") } as never);
    await waitFor(() => { expect(screen.queryByText(/is choosing/)).toBeNull(); });
    await tick(5000);
    expect(botStep).not.toHaveBeenCalled();
  });

  it("AC1.5: Undo cancels the wait even when the reload after it is slow (PR 139 review)", async () => {
    const reload = deferred<never>();
    let calls = 0;
    const session = vi.fn(() => (++calls === 1 ? Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: cardHead("A1"), botToAct: "state" }) : reload.promise));
    const legal = () => Promise.resolve<LegalChoices>({ faction: "state", phase: "card", first: true, boxes: [], actions: [] });
    const botStep = vi.fn(() => new Promise<never>(() => undefined));
    const history = vi.fn(() => Promise.resolve([item("A1", [])]));
    const undo = vi.fn(() => Promise.resolve({ undone: "A1", head: "x", undoneAfterRandom: false, state: cardHead("A0") } as never));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, legal, botStep, history, undo })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1000);
    fireEvent.click(screen.getByRole("button", { name: "Undo (Ctrl+Z)" }));
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    await tick(5000);
    expect(botStep).not.toHaveBeenCalled();
  });

  it("a branch during the wait sends no bot step for the old head", async () => {
    const n = { at: 0 };
    const heads = [cardHead("A1"), cardHead("B1")];
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: heads[n.at] as Head, botToAct: "state" }));
    const legal = () => Promise.resolve<LegalChoices>({ faction: "state", phase: "card", first: true, boxes: [], actions: [] });
    const botStep = vi.fn(() => new Promise<never>(() => undefined));
    const history = vi.fn(() => Promise.resolve([item("A0", []), item("A1", [])]));
    const pending = deferred<never>();
    const branch = vi.fn(() => pending.promise);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, legal, botStep, history, branch })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1000);
    fireEvent.click(screen.getByRole("button", { name: "History (H)" }));
    fireEvent.click((await screen.findAllByRole("button", { name: "Branch from here" }))[0] as HTMLElement);
    await waitFor(() => { expect(branch).toHaveBeenCalled(); });
    await tick(5000);
    expect(botStep).not.toHaveBeenCalled();
    n.at = 1;
    pending.resolve({ branchId: "b2", head: heads[1] } as never);
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    await tick(1500);
    expect(botStep).toHaveBeenCalledTimes(1);
    expect(botStep).toHaveBeenCalledWith("S", "B1", "h-B1");
  });

  it("stops the wait on unmount", async () => {
    const { session, legal, botStep } = steps();
    const { unmount } = render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await screen.findByText(/is choosing/);
    await tick(1000);
    unmount();
    await tick(5000);
    expect(botStep).not.toHaveBeenCalled();
  });

  it("AC1.7: a bot step error shows its text and starts no new wait until Retry", async () => {
    const { session, legal, botStep } = steps(new Error("Bot failed: no legal play"));
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    await botActs();
    expect(await screen.findByText("Bot failed: no legal play")).toBeTruthy();
    pick("fast");
    await tick(10000);
    expect(botStep).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Bot failed: no legal play")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => { expect(screen.queryByText("Bot failed: no legal play")).toBeNull(); });
    await tick(500);
    expect(botStep).toHaveBeenCalledTimes(2);
  });
  it("AC1.7: a new head after a bot error (Undo) clears the error, and the bot acts again", async () => {
    const n = { at: 0 };
    const heads = [cardHead("A1"), cardHead("A0")];
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: heads[n.at] as Head, botToAct: "state" }));
    const legal = () => Promise.resolve<LegalChoices>({ faction: "state", phase: "card", first: true, boxes: [], actions: [] });
    const botStep = vi.fn(() => (n.at === 0 ? Promise.reject(new Error("Bot failed")) : new Promise<never>(() => undefined)));
    const history = vi.fn(() => Promise.resolve([item("A1", [])]));
    const undo = vi.fn(() => { n.at = 1; return Promise.resolve({ undone: "A1", head: "x", undoneAfterRandom: false, state: heads[1] } as never); });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Play api={mockApi({ session, legal, botStep, history, undo })} sessionId="S" />);
    await botActs();
    expect(await screen.findByText("Bot failed")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Undo (Ctrl+Z)" }));
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    await waitFor(() => { expect(screen.queryByText("Bot failed")).toBeNull(); });
    await tick(1500);
    expect(botStep).toHaveBeenCalledTimes(2);
    expect(botStep).toHaveBeenLastCalledWith("S", "A0", "h-A0");
  });
});

describe("Why? for a bot command", () => {
  const view = cardHead("A").view;
  it("lists the chosen play first, the alternatives, values, components and the line", () => {
    render(<BotWhy records={[record]} view={view} />);
    fireEvent.click(screen.getByText("Why?"));
    const items = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(items[0]).toMatch(/^Chosen: Op \+ SA: Sweep in Siirt \+ Village Clearance in Siirt, value 3\.3/);
    expect(items[0]).toMatch(/Earned Margin Diff 1\.0/);
    expect(items[1]).toBe("Pass, value 1.5");
    expect(screen.getByText(/Sampled line after the chosen play: PKK Pass, then State Event \(shaded\)\./)).toBeTruthy();
  });
  it("shows nothing for a human action", () => {
    const { container } = render(<BotWhy records={[]} view={view} />);
    expect(container.textContent).toBe("");
  });
  it("names Events, Pivotals and Propaganda choices", () => {
    expect(commandText({ type: "ChooseEvent", side: "shaded" }, view)).toBe("Event (shaded)");
    expect(commandText({ type: "PlayPivotal", card: "DK-015" }, view)).toBe("Play Pivotal DK-015");
    expect(commandText({ type: "PropagandaChoice", phase: "civicAction" }, view)).toBe("Civic Action choice");
  });
});

describe("Home bot seat", () => {
  it("defaults to the recommended bot and starts the session with its seat", async () => {
    const createSession = vi.fn(() => Promise.resolve({ sessionId: "S1", head: {} as never }));
    const seatPlayers = () => Promise.resolve([{ id: "P-SURV@4", faction: "pkk", description: "p" }, { id: "S-ADAPT@5", faction: "state", description: "s", recommended: true }]);
    render(<Home api={mockApi({ createSession, seatPlayers })} onOpen={vi.fn()} onCheck={vi.fn()} onSetup={vi.fn()} />);
    const select = await screen.findByLabelText("Opponent");
    await waitFor(() => { expect((select as HTMLSelectElement).value).toBe("S-ADAPT@5"); });
    const start = screen.getByRole("button", { name: "Start" });
    await waitFor(() => { expect((start as HTMLButtonElement).disabled).toBe(false); });
    fireEvent.click(start);
    await waitFor(() => { expect(createSession).toHaveBeenCalled(); });
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ seats: { state: "S-ADAPT@5" } }));
    fireEvent.change(select, { target: { value: "" } });
    fireEvent.click(start);
    await waitFor(() => { expect(createSession).toHaveBeenCalledTimes(2); });
    expect(createSession).toHaveBeenLastCalledWith(expect.not.objectContaining({ seats: expect.anything() as unknown }));
  });
});
