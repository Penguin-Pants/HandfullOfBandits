// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useReducer } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import type { AnyCommand, Api, LegalChoices, ValidationResult } from "../api.ts";
import { EventPanel } from "../event/EventPanel.tsx";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { FactionPanel } from "./FactionPanel.tsx";
import { actionForms } from "../../server/forms.ts";
import { emptyPlan, emptyPlans, planReducer, plansReducer } from "./plan.ts";
import { PlanForm } from "./PlanForm.tsx";

const rallyFields = actionForms.find((f) => f.id === "pkk.rally")?.fields ?? [];

// P2-15 component tests with a mocked API: every illegal action shows a reason (T-UI-03), plan
// building with live validation and preview, inline Decisions, Propaganda flow.
afterEach(cleanup);

const legal: LegalChoices = {
  faction: "pkk",
  phase: "card",
  first: true,
  boxes: [
    { box: "event", allowed: true, reason: null },
    { box: "limitedOp", allowed: true, reason: null },
    { box: "opOnly", allowed: false, reason: "Not open after the First Eligible's choice (05 s2.3)." },
    { box: "opSa", allowed: true, reason: null },
    { box: "pass", allowed: true, reason: null },
  ],
  actions: [
    { id: "pkk.rally", label: "Rally", cost: "1 per location", summary: "", fields: [{ key: "option", label: "Option", kind: "select", options: ["place", "flip"] }], subAction: { id: "agitate", fields: [{ key: "shifts", label: "Shifts", kind: "number" }] }, kind: "op", ok: true, reason: null, locations: ["botan"] },
    { id: "pkk.coerce", label: "Coerce", cost: "1 per space", summary: "", fields: [], subAction: null, kind: "op", ok: false, reason: "Coerce needs a Neutral or Support space.", locations: [] },
    { id: "pkk.extort", label: "Extort", cost: "0", summary: "", fields: [], subAction: null, kind: "sa", ok: true, reason: null, locations: [] },
    { id: "pkk.strike-collaborators", label: "Strike Collaborators", cost: "1 per space", summary: "", fields: actionForms.find((f) => f.id === "pkk.strike-collaborators")?.fields ?? [], subAction: null, timing: "before", kind: "sa", ok: true, reason: null, locations: [] },
  ],
};
const ok: ValidationResult = { ok: true, violations: [], warnings: [], preview: { effects: [{ type: "adjustTrack", track: "resources.pkk", delta: -1, ruleRef: "06 s4.1", assumptionRef: null }] } };

const pkkView = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));

/** FactionPanel with the shared plan reducer and stand-ins for map clicks and drags (UC-5). */
function Faction({ api, legal: choices = legal, onCommit = vi.fn(), onDraft = vi.fn() }: { api: Api; legal?: LegalChoices; onCommit?: (c: AnyCommand) => void; onDraft?: (c: AnyCommand | null) => void }) {
  const [plan, dispatch] = useReducer(planReducer, emptyPlan);
  return (
    <>
      <button type="button" onClick={() => { dispatch({ type: "click", id: "botan", add: false }); }}>map botan</button>
      <button type="button" onClick={() => { dispatch({ type: "click", id: "dersim", add: false }); }}>map dersim</button>
      <button type="button" onClick={() => { dispatch({ type: "drag", from: "hakkari", to: "botan" }); }}>drag hakkari botan</button>
      <FactionPanel api={api} sessionId="S" view={pkkView} legal={choices} plan={plan} dispatch={dispatch} onCommit={onCommit} onDraft={onDraft} />
    </>
  );
}
const click = (name: string | RegExp): void => { fireEvent.click(screen.getByRole("button", { name })); };
const lastPlan = (onDraft: ReturnType<typeof vi.fn>): Record<string, unknown> | undefined => (onDraft.mock.lastCall?.[0] as { plan: Record<string, unknown> } | undefined)?.plan;

describe("FactionPanel", () => {
  it("shows a reason for every grey box and action (T-UI-03)", () => {
    render(<Faction api={mockApi()} />);
    expect(screen.getByRole("button", { name: "Op Only" }).getAttribute("title")).toMatch(/Not open/);
    fireEvent.click(screen.getByRole("button", { name: "Limited Op" }));
    const coerce = screen.getByRole("button", { name: "Coerce" });
    expect((coerce as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Coerce needs a Neutral or Support space.")).toBeTruthy();
  });

  it("E4 track: pointing at a box shows what it leaves open for the other faction and who is 1st next (UC-8)", () => {
    const track: LegalChoices = { ...legal, other: "state", placed: { pkk: null, state: null }, boxes: [
      { box: "event", allowed: true, reason: null, otherMay: ["opSa", "pass"], nextFirst: "pkk" },
      { box: "limitedOp", allowed: true, reason: null, otherMay: ["opOnly", "opSa", "pass"], nextFirst: "pkk" },
      { box: "opOnly", allowed: true, reason: null, otherMay: ["limitedOp", "pass"], nextFirst: "state" },
      { box: "opSa", allowed: true, reason: null, otherMay: ["event", "limitedOp", "pass"], nextFirst: "state" },
      { box: "pass", allowed: true, reason: null, otherMay: ["event", "limitedOp", "opOnly", "opSa", "pass"], nextFirst: "pkk" },
    ] };
    render(<Faction api={mockApi()} legal={track} />);
    const effect = screen.getByLabelText("Choice effect");
    expect(effect.textContent).toMatch(/Point at a box/);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Op Only" }));
    expect(effect.textContent).toBe("If PKK takes Op Only: State may take Limited Op or Pass. Next card State is 1st Eligible.");
    const theirs = screen.getByRole("group", { name: "State (2nd) boxes" });
    expect(theirs.querySelector('[aria-label="State Limited Op: open"]')).not.toBeNull();
    expect(theirs.querySelector('[aria-label="State Event: closed"]')).not.toBeNull();
    fireEvent.mouseLeave(screen.getByRole("button", { name: "Op Only" }));
    fireEvent.focus(screen.getByRole("button", { name: "Op + SA" }));
    expect(effect.textContent).toContain("State may take Event, Limited Op or Pass");
  });

  it("E4 track for the Second Eligible: the 1st faction's cylinder in its box, own boxes as buttons (UC-8)", () => {
    const second: LegalChoices = { ...legal, first: false, other: "pkk", placed: { pkk: "opSa", state: null }, boxes: [
      { box: "event", allowed: true, reason: null, otherMay: null, nextFirst: null },
      { box: "limitedOp", allowed: true, reason: null, otherMay: null, nextFirst: null },
      { box: "opOnly", allowed: false, reason: "Not open", otherMay: null, nextFirst: null },
      { box: "opSa", allowed: false, reason: "Not open", otherMay: null, nextFirst: null },
      { box: "pass", allowed: true, reason: null, otherMay: null, nextFirst: null },
    ] };
    render(<Faction api={mockApi()} legal={{ ...second, faction: "state" }} />);
    const firstRow = screen.getByRole("group", { name: "PKK (1st) boxes" });
    expect(firstRow.querySelector('[aria-label="PKK Op + SA: taken"]')?.textContent).toContain("PKK");
    expect(screen.getByLabelText("Choice effect").textContent).toBe("PKK took Op + SA: State may take Event, Limited Op or Pass.");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Op Only" }).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Limited Op" }).disabled).toBe(false);
  });

  it("keeps an Op open in Op + SA, since a preceding SA may make it legal", () => {
    render(<Faction api={mockApi()} />);
    fireEvent.click(screen.getByRole("button", { name: "Op + SA" }));
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Coerce" }).disabled).toBe(false);
    expect(screen.getByText("Coerce needs a Neutral or Support space.")).toBeTruthy();
  });

  it("validates the plan live, previews effects and commits", async () => {
    const validate = vi.fn(() => Promise.resolve(ok));
    const onCommit = vi.fn();
    render(<Faction api={mockApi({ validate })} onCommit={onCommit} />);
    click("Limited Op");
    click("Rally");
    click("map botan");
    click("Place");
    await waitFor(() => { expect(screen.getByLabelText("Preview").textContent).toMatch(/resources.pkk/); });
    click("Commit (Enter)");
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ type: "ChooseOperation", box: "limitedOp", plan: expect.objectContaining({ perLocation: { botan: { option: "place" } } }) as unknown }));
  });

  it("builds sub-action spend and the SA's spaces and counts by clicks only (UC-5)", async () => {
    const onDraft = vi.fn();
    render(<Faction api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} onDraft={onDraft} />);
    click("Op + SA");
    click("Rally");
    click("map botan");
    click("Botan");
    click("More Shifts");
    click("Strike Collaborators");
    click("Strike Collaborators spaces");
    click("map dersim");
    // Strike Collaborators removes 1 Guard when unset, so the stepper starts at 1.
    expect(screen.getByRole("group", { name: "Dersim Guards" }).querySelector("output")?.textContent).toBe("1");
    click("More Dersim Guards");
    await waitFor(() => {
      const plan = lastPlan(onDraft);
      expect(plan?.["locations"]).toEqual(["botan"]);
      expect(plan?.["sa"]).toEqual({ action: "pkk.strike-collaborators", locations: ["dersim"], perLocation: { dersim: { guards: 2 } }, timing: "before" });
      expect(plan?.["subActions"]).toEqual([{ action: "agitate", space: "botan", params: { shifts: 1 } }]);
    });
    expect(document.querySelectorAll("input, textarea, select")).toHaveLength(0);
    click("Strike Collaborators");
    await waitFor(() => { expect(lastPlan(onDraft)?.["sa"]).toBeNull(); });
    expect(screen.queryByLabelText("SA plan")).toBeNull();
    click("Strike Collaborators");
    click("Strike Collaborators spaces");
    expect(screen.getByText("No spaces yet.", { selector: "[aria-label='SA plan'] p" })).toBeTruthy();
  });

  it("lets the player choose the timing of an SA with no fixed order", async () => {
    const onDraft = vi.fn();
    render(<Faction api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} onDraft={onDraft} />);
    click("Op + SA");
    click("Rally");
    click("Extort");
    click("Before the Op");
    await waitFor(() => { expect((lastPlan(onDraft)?.["sa"] as { timing: string } | null)?.timing).toBe("before"); });
  });

  it("a drag on the map adds a move with a piece count stepper (UC-5)", async () => {
    const marchForm = actionForms.find((f) => f.id === "pkk.march");
    if (marchForm === undefined) throw new Error("no March form");
    const march: LegalChoices = { ...legal, actions: [{ ...marchForm, kind: "op", ok: true, reason: null, locations: [] }] };
    const onDraft = vi.fn();
    render(<Faction api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} legal={march} onDraft={onDraft} />);
    click("Limited Op");
    expect(screen.getByRole("button", { name: "March" }).getAttribute("title")).toMatch(/Move Guerrillas 1 step/);
    click("March");
    expect(screen.getByText(/drag on the map/)).toBeTruthy();
    expect(screen.getByLabelText("Plan").textContent).toMatch(/Move Guerrillas 1 step/);
    click("drag hakkari botan");
    click("More Pieces Hakkari to Botan");
    await waitFor(() => { expect(lastPlan(onDraft)?.["perLocation"]).toEqual({ botan: { moves: [{ from: "hakkari", count: 2 }] } }); });
    click("Remove move Hakkari to Botan");
    await waitFor(() => { expect(lastPlan(onDraft)?.["perLocation"]).toEqual({ botan: {} }); });
  });

  it("commits a valid plan with Enter and clears it with Esc", async () => {
    const onCommit = vi.fn();
    render(<Faction api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} onCommit={onCommit} />);
    const build = async (): Promise<void> => {
      click("Limited Op");
      click("Rally");
      click("map botan");
      await waitFor(() => { expect(screen.getByLabelText("Preview")).toBeTruthy(); });
    };
    await build();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Rally" })).toBeNull();
    await build();
    fireEvent.keyDown(screen.getByRole("button", { name: "Place" }), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("button", { name: "map botan" }), { key: "Enter" });
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("button", { name: "Rally" }), { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Rally" })).toBeNull();
    await build();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ type: "ChooseOperation", box: "limitedOp" }));
  });

  it("shows violations of an illegal plan with their rule", async () => {
    const validate = vi.fn(() => Promise.resolve({ ok: false, violations: [{ code: "rallyCity", message: "A City at Support cannot Rally (03 s2.1).", ruleRef: "06 s4.1", location: "botan" }], warnings: [], preview: { effects: [] } }));
    render(<Faction api={mockApi({ validate })} />);
    click("Limited Op");
    click("Rally");
    click("map botan");
    await waitFor(() => { expect(screen.getByText(/botan: A City at Support cannot Rally/)).toBeTruthy(); });
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Commit (Enter)" }).disabled).toBe(true);
  });
});

describe("EventPanel", () => {
  it("asks each question inline, then commits the completed event", async () => {
    const view = boardView(kurdish.ruleset, kurdish.data, withCard(turnOf("state"), "DK-001"));
    const validate = vi.fn((_id: string, command: AnyCommand): Promise<ValidationResult> =>
      Promise.resolve(
        !Array.isArray(command["answers"]) || command["answers"].length === 0
          ? { ok: false, violations: [{ code: "needsAnswer", message: "Choose", ruleRef: "DK-001", location: null, question: { kind: "option" as const, prompt: "Choose: Hakkari or Botan", options: ["Hakkari", "Botan"], min: 1, max: 1 } }], warnings: [], preview: { effects: [] } }
          : ok,
      ),
    );
    const onCommit = vi.fn();
    render(<EventPanel api={mockApi({ validate })} sessionId="S" view={view} faction="state" eventOpen onCommit={onCommit} forms={[]} plan={emptyPlan} dispatch={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Execute unshaded (U)" }));
    fireEvent.click(await screen.findByRole("button", { name: "2. Botan" }));
    await waitFor(() => { expect(onCommit).toHaveBeenCalledWith({ type: "ChooseEvent", faction: "state", side: "unshaded", answers: ["Botan"] }); });
  });

  it("answers a free-action plan question with a plan built by clicks (UC-5)", async () => {
    const view = boardView(kurdish.ruleset, kurdish.data, withCard(turnOf("pkk"), "DK-001"));
    const question = { kind: "plan" as const, prompt: "Plan the free pkk.rally (or null to skip)", options: [], min: 0, max: 1, action: "pkk.rally" };
    const validate = vi.fn((_id: string, command: AnyCommand): Promise<ValidationResult> =>
      Promise.resolve(Array.isArray(command["answers"]) && command["answers"].length > 0 ? ok : { ok: false, violations: [{ code: "needsAnswer", message: "Plan", ruleRef: "DK-001", location: null, question }], warnings: [], preview: { effects: [] } }),
    );
    const onCommit = vi.fn();
    function Harness() {
      // A Faction panel draft left its map target on the SA: the free action builds its own plan.
      const [plans, dispatch] = useReducer(plansReducer, { ...emptyPlans, faction: { ...emptyPlan, target: "sa" as const } });
      return (
        <>
          <button type="button" onClick={() => { dispatch({ type: "click", id: "botan", add: false }); }}>map botan</button>
          <EventPanel api={mockApi({ validate })} sessionId="S" view={view} faction="pkk" eventOpen onCommit={onCommit} forms={legal.actions ?? []} plan={plans.event} dispatch={(e) => { dispatch({ ...e, owner: "event" }); }} onFreeAction={(open) => { dispatch({ type: "activate", owner: open ? "event" : "faction" }); }} />
        </>
      );
    }
    render(<Harness />);
    click("Execute unshaded (U)");
    expect(await screen.findByText(/Plan the free Rally, or skip it/)).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Submit plan" }).disabled).toBe(true);
    click("map botan");
    click("Place");
    click("Submit plan");
    await waitFor(() => { expect(onCommit).toHaveBeenCalledWith({ type: "ChooseEvent", faction: "pkk", side: "unshaded", answers: [{ op: "pkk.rally", locations: ["botan"], perLocation: { botan: { option: "place" } }, sa: null }] }); });
    expect(document.querySelectorAll("textarea")).toHaveLength(0);
  });

  it("greys Execute with a reason when the Event box is closed", () => {
    const view = boardView(kurdish.ruleset, kurdish.data, withCard(turnOf("state"), "DK-014"));
    render(<EventPanel api={mockApi()} sessionId="S" view={view} faction="state" eventOpen={false} onCommit={vi.fn()} forms={[]} plan={emptyPlan} dispatch={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Execute unshaded (U)" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute("title")).toMatch(/not open/);
  });
});

describe("plan fields", () => {
  it("shows the handler default for an unset Rally grow count (UC-5)", () => {
    const view = pkkView;
    render(<PlanForm view={view} faction="pkk" op={{ id: "pkk.rally", label: "Rally", fields: rallyFields }} plan={{ ...emptyPlan, op: { locations: ["botan"], values: {}, moves: {} } }} dispatch={vi.fn()} />);
    expect(screen.getByRole("group", { name: "Botan Grow count" }).querySelector("output")?.textContent).toBe("max");
  });
});

describe("move faces", () => {
  it("offers every flip state of the moving piece, even when the origin holds one face now (UC-5)", () => {
    const hakkari = pkkView.spaces.find((x) => x.id === "hakkari");
    const onlyUnderground = { ...pkkView, spaces: pkkView.spaces.map((x) => (x === hakkari ? { ...x, pieces: x.pieces.filter((p) => p.face !== "active") } : x)) };
    const plan = { ...emptyPlan, op: { locations: ["botan"], values: {}, moves: { botan: [{ from: "hakkari", count: 1 }] } } };
    render(<PlanForm view={onlyUnderground} faction="pkk" op={{ id: "pkk.march", label: "March", fields: [{ key: "moves", label: "Moves", kind: "moves" }] }} plan={plan} dispatch={vi.fn()} />);
    const faces = screen.getByRole("group", { name: "Face Hakkari to Botan" });
    expect([...faces.querySelectorAll("button")].map((b) => b.textContent)).toEqual(["Underground", "Active"]);
  });
});

describe("PropagandaPanel", () => {
  it("lists phases with the open one, advances, and sends spends for the selected spaces", () => {
    const base = turnOf("pkk");
    const state = { ...base, turn: { ...base.turn, phase: "propaganda", step: 5, propagandaRound: 1 } };
    const view = boardView(kurdish.ruleset, kurdish.data, state);
    const onCommit = vi.fn();
    render(<PropagandaPanel view={view} legal={{ faction: null, phase: "propaganda", advance: true }} selected={["elazig"]} onCommit={onCommit} />);
    expect(screen.getByText("Civic Action (State)", { selector: "li" }).getAttribute("aria-current")).toBe("step");
    expect(screen.getByLabelText("Phase guide").textContent).toContain("at most half of Legitimacy");
    fireEvent.click(screen.getByRole("button", { name: "Advance (Space)" }));
    expect(onCommit).toHaveBeenCalledWith({ type: "Advance" });
    click(/^More .+ Shifts$/);
    fireEvent.click(screen.getByRole("button", { name: "Spend in selected spaces" }));
    expect(onCommit).toHaveBeenLastCalledWith({ type: "PropagandaChoice", phase: "civicAction", choice: { spaces: { elazig: { shifts: 1 } } } });
  });

  it("offers only the legal Emergency Rule steps in the Legitimacy phase", () => {
    const base = turnOf("pkk");
    const probe = boardView(kurdish.ruleset, kurdish.data, base).status.propagandaPhases.indexOf("legitimacy");
    const ohal = { ...base, tracks: { ...base.tracks, emergencyRule: "ohal" }, turn: { ...base.turn, phase: "propaganda", step: probe, propagandaRound: 1 } };
    const onCommit = vi.fn();
    render(<PropagandaPanel view={boardView(kurdish.ruleset, kurdish.data, ohal)} legal={{ faction: null, phase: "propaganda", advance: true }} selected={[]} onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Normalizing" }));
    expect(onCommit).toHaveBeenLastCalledWith({ type: "PropagandaChoice", phase: "legitimacy", choice: { emergencyStep: "normalizing" } });
    expect(screen.queryByRole("button", { name: "Martial Law" })).toBeNull();
  });

  it("sends the chosen Guard removal count per space in Upkeep", () => {
    const base = turnOf("pkk");
    const probe = boardView(kurdish.ruleset, kurdish.data, base).status.propagandaPhases.indexOf("upkeep");
    const view = boardView(kurdish.ruleset, kurdish.data, { ...base, turn: { ...base.turn, phase: "propaganda", step: probe, propagandaRound: 1 } });
    const onCommit = vi.fn();
    render(<PropagandaPanel view={view} legal={{ faction: null, phase: "propaganda", advance: false }} selected={["elazig", "botan"]} onCommit={onCommit} />);
    click(/^More Elaz.+ Guards to remove$/);
    fireEvent.click(screen.getByRole("button", { name: "Remove Guards in selected spaces" }));
    expect(onCommit).toHaveBeenLastCalledWith({ type: "PropagandaChoice", phase: "upkeep", choice: { removeGuards: { elazig: 2, botan: 1 } } });
  });
});
