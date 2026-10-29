// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf, withCard } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { mockApi } from "../../../test/ui/mock-api.ts";
import { boardView } from "../../server/view.ts";
import type { AnyCommand, LegalChoices, ValidationResult } from "../api.ts";
import { EventPanel } from "../event/EventPanel.tsx";
import { PropagandaPanel } from "../propaganda/PropagandaPanel.tsx";
import { FactionPanel } from "./FactionPanel.tsx";
import { parseMoves, toCommand } from "./plan.ts";

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
    { id: "pkk.rally", label: "Rally", cost: "1 per location", fields: [{ key: "option", label: "Option", kind: "select", options: ["place", "flip"] }], subAction: { id: "agitate", fields: [{ key: "shifts", label: "Shifts", kind: "number" }] }, kind: "op", ok: true, reason: null, locations: ["botan"] },
    { id: "pkk.coerce", label: "Coerce", cost: "1 per space", fields: [], subAction: null, kind: "op", ok: false, reason: "Coerce needs a Neutral or Support space.", locations: [] },
    { id: "pkk.extort", label: "Extort", cost: "0", fields: [], subAction: null, kind: "sa", ok: true, reason: null, locations: [] },
    { id: "pkk.strike-collaborators", label: "Strike Collaborators", cost: "1 per space", fields: [{ key: "guards", label: "Guards", kind: "number" }], subAction: null, timing: "before", kind: "sa", ok: true, reason: null, locations: [] },
  ],
};
const ok: ValidationResult = { ok: true, violations: [], warnings: [], preview: { effects: [{ type: "adjustTrack", track: "resources.pkk", delta: -1, ruleRef: "06 s4.1", assumptionRef: null }] } };

describe("plan helpers", () => {
  it("parses moves and builds a ChooseOperation command", () => {
    expect(parseMoves("hakkari:2, botan:1:active")).toEqual([{ from: "hakkari", count: 2 }, { from: "botan", count: 1, face: "active" }]);
    expect(parseMoves("x")).toBeNull();
    expect(parseMoves("botan>hakkari:1, botan:1")).toEqual([{ from: "botan", to: "hakkari", count: 1 }, { from: "botan", count: 1 }]);
    expect(parseMoves("botan>:1")).toBeNull();
    const command = toCommand("pkk", { box: "limitedOp", op: "pkk.rally", locations: ["botan"], values: { botan: { option: "place" } }, sa: null, subAction: null }, legal.actions ?? []);
    expect(command).toEqual({ type: "ChooseOperation", faction: "pkk", box: "limitedOp", plan: { op: "pkk.rally", locations: ["botan"], perLocation: { botan: { option: "place" } }, sa: null, subActions: [] } });
  });
});

describe("FactionPanel", () => {
  it("shows a reason for every grey box and action (T-UI-03)", () => {
    render(<FactionPanel api={mockApi()} sessionId="S" legal={legal} selected={[]} onCommit={vi.fn()} onDraft={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Op Only" }).getAttribute("title")).toMatch(/Not open/);
    fireEvent.click(screen.getByRole("button", { name: "Limited Op" }));
    const coerce = screen.getByRole("button", { name: "Coerce" });
    expect((coerce as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Coerce needs a Neutral or Support space.")).toBeTruthy();
  });

  it("shows on the eligibility track what each box leaves open and who is First Eligible next", () => {
    const track: LegalChoices = { ...legal, other: "state", placed: { pkk: null, state: null }, boxes: [
      { box: "opSa", allowed: true, reason: null, otherMay: ["event", "limitedOp", "pass"], nextFirst: "state" },
      { box: "limitedOp", allowed: true, reason: null, otherMay: ["opOnly", "opSa", "pass"], nextFirst: "pkk" },
    ] };
    render(<FactionPanel api={mockApi()} sessionId="S" legal={track} selected={[]} onCommit={vi.fn()} onDraft={vi.fn()} />);
    const opSa = screen.getByLabelText("Op + SA box").textContent;
    expect(opSa).toContain("Then state: Event, Limited Op, Pass");
    expect(opSa).toContain("Next card 1st: state");
    expect(screen.getByLabelText("Limited Op box").textContent).toContain("Next card 1st: pkk");
  });

  it("marks the boxes closed to the Second Eligible and shows where the First Eligible's cylinder is", () => {
    const second: LegalChoices = { ...legal, first: false, other: "pkk", placed: { pkk: "opSa", state: null }, boxes: [
      { box: "opSa", allowed: false, reason: "Not open", otherMay: null, nextFirst: null },
      { box: "event", allowed: true, reason: null, otherMay: null, nextFirst: null },
    ] };
    render(<FactionPanel api={mockApi()} sessionId="S" legal={second} selected={[]} onCommit={vi.fn()} onDraft={vi.fn()} />);
    expect(screen.getByLabelText("Op + SA box").textContent).toContain("pkk");
    expect(screen.getByLabelText("Op + SA box").textContent).toContain("Closed");
  });

  it("keeps an Op open in Op + SA, since a preceding SA may make it legal", () => {
    render(<FactionPanel api={mockApi()} sessionId="S" legal={legal} selected={[]} onCommit={vi.fn()} onDraft={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Op + SA" }));
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Coerce" }).disabled).toBe(false);
    expect(screen.getByText("Coerce needs a Neutral or Support space.")).toBeTruthy();
  });

  it("validates the plan live, previews effects and commits", async () => {
    const validate = vi.fn(() => Promise.resolve(ok));
    const onCommit = vi.fn();
    render(<FactionPanel api={mockApi({ validate })} sessionId="S" legal={legal} selected={["botan"]} onCommit={onCommit} onDraft={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Limited Op" }));
    fireEvent.click(screen.getByRole("button", { name: "Rally" }));
    fireEvent.change(screen.getByLabelText("Option"), { target: { value: "place" } });
    await waitFor(() => { expect(screen.getByLabelText("Preview").textContent).toMatch(/resources.pkk/); });
    fireEvent.click(screen.getByRole("button", { name: "Commit (Enter)" }));
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ type: "ChooseOperation", box: "limitedOp" }));
  });

  it("puts sub-action spend and per-space SA fields into the plan", async () => {
    const onDraft = vi.fn();
    render(<FactionPanel api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} sessionId="S" legal={legal} selected={["botan"]} onCommit={vi.fn()} onDraft={onDraft} />);
    fireEvent.click(screen.getByRole("button", { name: "Op + SA" }));
    fireEvent.click(screen.getByRole("button", { name: "Rally" }));
    fireEvent.change(screen.getByLabelText("agitate space"), { target: { value: "botan" } });
    fireEvent.change(screen.getByLabelText("Shifts"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("SA"), { target: { value: "pkk.strike-collaborators" } });
    fireEvent.change(screen.getByLabelText("SA spaces"), { target: { value: "dersim" } });
    fireEvent.change(screen.getByLabelText("Guards"), { target: { value: "2" } });
    await waitFor(() => {
      const plan = (onDraft.mock.lastCall?.[0] as { plan: Record<string, unknown> } | undefined)?.plan;
      expect(plan?.["sa"]).toEqual({ action: "pkk.strike-collaborators", locations: ["dersim"], perLocation: { dersim: { guards: 2 } }, timing: "before" });
      expect(plan?.["subActions"]).toEqual([{ action: "agitate", space: "botan", params: { shifts: 1 } }]);
    });
  });

  it("lets the player choose the timing of an SA with no fixed order", async () => {
    const onDraft = vi.fn();
    render(<FactionPanel api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} sessionId="S" legal={legal} selected={["botan"]} onCommit={vi.fn()} onDraft={onDraft} />);
    fireEvent.click(screen.getByRole("button", { name: "Op + SA" }));
    fireEvent.click(screen.getByRole("button", { name: "Rally" }));
    fireEvent.change(screen.getByLabelText("SA"), { target: { value: "pkk.extort" } });
    fireEvent.change(screen.getByLabelText("SA timing"), { target: { value: "before" } });
    await waitFor(() => {
      const plan = (onDraft.mock.lastCall?.[0] as { plan: { sa: { timing: string } | null } } | undefined)?.plan;
      expect(plan?.sa?.timing).toBe("before");
    });
  });

  it("commits a valid plan with Enter and clears it with Esc", async () => {
    const onCommit = vi.fn();
    render(<FactionPanel api={mockApi({ validate: vi.fn(() => Promise.resolve(ok)) })} sessionId="S" legal={legal} selected={["botan"]} onCommit={onCommit} onDraft={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Limited Op" }));
    fireEvent.click(screen.getByRole("button", { name: "Rally" }));
    await waitFor(() => { expect(screen.getByLabelText("Preview")).toBeTruthy(); });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "Rally" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Limited Op" }));
    fireEvent.click(screen.getByRole("button", { name: "Rally" }));
    await waitFor(() => { expect(screen.getByLabelText("Preview")).toBeTruthy(); });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ type: "ChooseOperation", box: "limitedOp" }));
  });

  it("shows violations of an illegal plan with their rule", async () => {
    const validate = vi.fn(() => Promise.resolve({ ok: false, violations: [{ code: "rallyCity", message: "A City at Support cannot Rally (03 s2.1).", ruleRef: "06 s4.1", location: "botan" }], warnings: [], preview: { effects: [] } }));
    render(<FactionPanel api={mockApi({ validate })} sessionId="S" legal={legal} selected={["botan"]} onCommit={vi.fn()} onDraft={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Limited Op" }));
    fireEvent.click(screen.getByRole("button", { name: "Rally" }));
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
    render(<EventPanel api={mockApi({ validate })} sessionId="S" view={view} faction="state" eventOpen onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Execute unshaded (U)" }));
    fireEvent.click(await screen.findByRole("button", { name: "2. Botan" }));
    await waitFor(() => { expect(onCommit).toHaveBeenCalledWith({ type: "ChooseEvent", faction: "state", side: "unshaded", answers: ["Botan"] }); });
  });

  it("answers a free-action plan question with the typed plan", async () => {
    const view = boardView(kurdish.ruleset, kurdish.data, withCard(turnOf("state"), "DK-001"));
    const question = { kind: "plan" as const, prompt: "Plan the free pkk.rally (or null to skip)", options: [], min: 0, max: 1 };
    const validate = vi.fn((_id: string, command: AnyCommand): Promise<ValidationResult> =>
      Promise.resolve(Array.isArray(command["answers"]) && command["answers"].length > 0 ? ok : { ok: false, violations: [{ code: "needsAnswer", message: "Plan", ruleRef: "DK-001", location: null, question }], warnings: [], preview: { effects: [] } }),
    );
    const onCommit = vi.fn();
    render(<EventPanel api={mockApi({ validate })} sessionId="S" view={view} faction="state" eventOpen onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Execute unshaded (U)" }));
    const input = await screen.findByLabelText("Plan (JSON)");
    fireEvent.change(input, { target: { value: "{bad" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit plan" }));
    expect(screen.getByText("The plan is not valid JSON.")).toBeTruthy();
    fireEvent.change(input, { target: { value: '{"locations": ["botan"], "perLocation": {"botan": {}}}' } });
    fireEvent.click(screen.getByRole("button", { name: "Submit plan" }));
    await waitFor(() => { expect(onCommit).toHaveBeenCalledWith({ type: "ChooseEvent", faction: "state", side: "unshaded", answers: [{ locations: ["botan"], perLocation: { botan: {} } }] }); });
  });

  it("greys Execute with a reason when the Event box is closed", () => {
    const view = boardView(kurdish.ruleset, kurdish.data, withCard(turnOf("state"), "DK-014"));
    render(<EventPanel api={mockApi()} sessionId="S" view={view} faction="state" eventOpen={false} onCommit={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Execute unshaded (U)" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute("title")).toMatch(/not open/);
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
    fireEvent.change(screen.getByLabelText("shifts"), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: "Spend in selected spaces" }));
    expect(onCommit).toHaveBeenLastCalledWith({ type: "PropagandaChoice", phase: "civicAction", choice: { spaces: { elazig: { shifts: 1 } } } });
  });

  it("offers only the legal Emergency Rule steps in the Legitimacy phase", () => {
    const base = turnOf("pkk");
    const probe = boardView(kurdish.ruleset, kurdish.data, base).status.propagandaPhases.indexOf("legitimacy");
    const ohal = { ...base, tracks: { ...base.tracks, emergencyRule: "ohal" }, turn: { ...base.turn, phase: "propaganda", step: probe, propagandaRound: 1 } };
    const onCommit = vi.fn();
    render(<PropagandaPanel view={boardView(kurdish.ruleset, kurdish.data, ohal)} legal={{ faction: null, phase: "propaganda", advance: true }} selected={[]} onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "normalizing" }));
    expect(onCommit).toHaveBeenLastCalledWith({ type: "PropagandaChoice", phase: "legitimacy", choice: { emergencyStep: "normalizing" } });
    expect(screen.queryByRole("button", { name: "martialLaw" })).toBeNull();
  });

  it("sends the chosen Guard removal count per space in Upkeep", () => {
    const base = turnOf("pkk");
    const probe = boardView(kurdish.ruleset, kurdish.data, base).status.propagandaPhases.indexOf("upkeep");
    const view = boardView(kurdish.ruleset, kurdish.data, { ...base, turn: { ...base.turn, phase: "propaganda", step: probe, propagandaRound: 1 } });
    const onCommit = vi.fn();
    render(<PropagandaPanel view={view} legal={{ faction: null, phase: "propaganda", advance: false }} selected={["elazig", "botan"]} onCommit={onCommit} />);
    fireEvent.change(screen.getByLabelText("elazig Guards to remove"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Remove Guards in selected spaces" }));
    expect(onCommit).toHaveBeenLastCalledWith({ type: "PropagandaChoice", phase: "upkeep", choice: { removeGuards: { elazig: 2, botan: 1 } } });
  });
});
