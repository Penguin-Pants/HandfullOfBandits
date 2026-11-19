// @vitest-environment jsdom
// Audit Plan 2 S1: the Play screen lets the seated bot act, joins a bot State part with the human
// PKK answers, sends a human State part to a PKK bot, walks Undo back past bot actions, and shows
// "Why?" for a bot command. Home starts a session with the chosen bot seat.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import type { GameState } from "../../engine/core/types.ts";
import type { BotRecord, Head, HistoryItem, LegalChoices, SessionRow } from "../api.ts";
import { Home } from "../home/Home.tsx";
import { BotWhy, commandText } from "../history/BotWhy.tsx";
import { Play } from "./Play.tsx";

afterEach(cleanup);

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
    const botStep = vi.fn(() => { n = 1; return Promise.resolve({ actionId: "A2", partial: null, records: [record] }); });
    const legal = vi.fn(() => Promise.resolve<LegalChoices>({ faction: n === 0 ? "state" : "pkk", phase: "card", first: true, boxes: [], actions: [] }));
    render(<Play api={mockApi({ session, legal, botStep })} sessionId="S" />);
    expect(await screen.findByText(/State bot \(S-ADAPT@5\) is choosing/)).toBeTruthy();
    await waitFor(() => { expect(session).toHaveBeenCalledTimes(2); });
    expect(botStep).toHaveBeenCalledTimes(1);
    expect(botStep).toHaveBeenCalledWith("S", "A1", "h-A1");
    expect(screen.queryByText(/is choosing/)).toBeNull();
  });

  it("joins the bot State part of Redeploy with the human PKK routes", async () => {
    const statePart = { troops: [{ from: "van", to: "hakkari", count: 2 }], police: [], guerrilla: [] };
    const session = vi.fn(() => Promise.resolve({ session: row({ state: "S-ADAPT@5" }), head: redeployHead("R1"), botToAct: "state" }));
    const botStep = vi.fn(() => Promise.resolve({ actionId: null, partial: statePart, records: [record] }));
    const submit = vi.fn(() => Promise.resolve({ actionId: "R2", head: redeployHead("R2"), entries: [] }));
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), botStep, submit })} sessionId="S" />);
    expect(await screen.findByLabelText("State bot part")).toBeTruthy();
    expect(screen.getByLabelText("State bot part").textContent).toMatch(/moves 2 Troops from Van/);
    // The human PKK routes Guerrillas only; Advance is closed while the bot part waits.
    expect(screen.queryByRole("button", { name: "Troops" })).toBeNull();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: /Advance|Skip/ }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Redeploy pieces" }));
    await waitFor(() => { expect(submit).toHaveBeenCalled(); });
    expect(submit).toHaveBeenCalledWith("S", { type: "PropagandaChoice", phase: "redeploy", choice: { troops: statePart.troops, police: [], guerrilla: [] } }, "R1", "h-R1");
  });

  it("sends a human State part of a joint phase to the PKK bot", async () => {
    const session = vi.fn(() => Promise.resolve({ session: row({ pkk: "P-SURV@4" }), head: redeployHead("R1"), botToAct: null }));
    const botStep = vi.fn(() => Promise.resolve({ actionId: "R2", partial: null, records: [] }));
    const submit = vi.fn();
    render(<Play api={mockApi({ session, legal: () => Promise.resolve(legalAdvance), botStep, submit })} sessionId="S" />);
    fireEvent.click(await screen.findByRole("button", { name: "Redeploy pieces" }));
    await waitFor(() => { expect(botStep).toHaveBeenCalled(); });
    expect(botStep).toHaveBeenCalledWith("S", "R1", "h-R1", { troops: [], police: [], guerrilla: [] });
    expect(submit).not.toHaveBeenCalled();
    // The human State routes Troops and Police only.
    expect(screen.queryByRole("button", { name: "Guerrilla" })).toBeNull();
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
    render(<Home api={mockApi({ createSession, seatPlayers })} onOpen={vi.fn()} onCheck={vi.fn()} />);
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
