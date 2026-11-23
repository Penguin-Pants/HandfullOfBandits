import { describe, expect, it } from "vitest";
import { feedbackPrompt, type FeedbackInput } from "./feedback-prompt.ts";
import type { CoinSimExport } from "./json.ts";

// Mock data (tests only): one session, two actions, one note on the second action.
const context = {
  session_id: "S1", scenario_id: "full-campaign", campaign: "C2", propaganda_round: 2, card_index: 3, phase: "card", active_faction: "pkk",
  first_eligible: "pkk", second_eligible: "state", current_card_id: "DK-012", current_card_title: "Mountain Raid", state_hash: "h2",
  resources: { state: 14, pkk: 6 }, tracks: { legitimacy: 9, europe: 2, legalSpace: "open", ceasefire: "none" },
  scores: { state: 21, pkk: 17 }, thresholds: { state: 30, pkk: 25 }, harm_counts: { state: 3, pkk: 1 }, selected_space: "hakkari",
};
const annotation = { annotation_id: "N1", session_id: "S1", action_id: "A2", anchor: "executed", state_hash: "h2", text: "PKK Rally put a Guerrilla in a Controlled space.", category_ids: ["feedback"], context };
const data = {
  exportMeta: { schema: "coin-sim-export/1", appVersion: "0.1.0", exportedAt: "2026-11-23T00:00:00Z", filter: { sessionIds: ["S1"], withStates: true } },
  packages: [], categories: [], metrics: [], index: { annotations: [] },
  sessions: [{ session_id: "S1", scenario_id: "full-campaign", seed: 7, package_hash: "p1", code_fingerprint: "f1", app_version: "0.1.0", seats: { pkk: "pkk-heuristic@1" }, head_action_id: "A2" }],
  branches: [{ branch_id: "B1", session_id: "S1", forked_from_action_id: null }],
  actions: [
    { action_id: "A1", session_id: "S1", branch_id: "B1", branch_seq: 0, state_hash_before: null, state_hash_after: "h1", kind: "setup", commands: [], entries: [{ kind: "Setup", rule_ref: "2.1", data: {} }], botDecisions: [] },
    {
      action_id: "A2", session_id: "S1", branch_id: "B1", branch_seq: 1, state_hash_before: "h1", state_hash_after: "h2", kind: "command",
      commands: [
        { payload: { type: "ChooseOperation", faction: "pkk", box: "op", plan: { op: "rally" } }, validation: { ok: true, violations: [], warnings: [] } },
        { payload: { type: "Answer", choice: "x" }, validation: { ok: true, violations: [], warnings: [{ code: "W1", message: "low" }], preview: { effects: [] } } },
      ],
      entries: [{ kind: "PiecePlaced", rule_ref: "3.3.1", data: { space: "hakkari" } }],
      botDecisions: [{ player: "pkk-heuristic@1", chosen: "rally", score: 3 }],
    },
  ],
  states: [{
    state_hash: "h2", derived: { control: { hakkari: "state" } },
    content: { initiative: { boxes: { state: null, pkk: "event" } }, spaces: { hakkari: { level: -1, pieces: { guerrilla: { underground: 2, active: 0 }, police: { active: 1 } }, markers: { terror: { on: 1 }, base: { on: 0 } } } } },
  }],
  annotations: [annotation],
} as unknown as CoinSimExport;
const input: FeedbackInput = { annotation, data, code: { commit: "c0ffee", dirty: false, fingerprint: "f1" }, diagnostics: { errors: [] } };

describe("feedbackPrompt", () => {
  it("starts with the user's text, then the task line (AC2.1)", () => {
    const lines = feedbackPrompt(input).split("\n").filter((l) => l !== "");
    expect(lines.slice(0, 3)).toEqual(["# Feedback from play", "> PKK Rally put a Guerrilla in a Controlled space.", "Task: Find the root cause, write a failing test, fix it."]);
  });

  it("names the repository, commit, code fingerprint and rule files (AC2.2)", () => {
    const prompt = feedbackPrompt(input);
    expect(prompt).toContain("Repository: https://github.com/Penguin-Pants/HandfullOfBandits");
    expect(prompt).toContain("Check out commit `c0ffee`.");
    expect(prompt).toContain("Code fingerprint: `f1`.");
    expect(prompt).toContain("Read first: `AGENTS.md`, `docs/rules/prototype-rules.md`.");
    expect(prompt).not.toContain("Warning");
  });

  it("warns on local changes and on a session started on other engine code (Risk 1)", () => {
    expect(feedbackPrompt({ ...input, code: { ...input.code, dirty: true } })).toContain("Warning: the app ran with uncommitted changes. Commit `c0ffee` may not reproduce the problem.");
    const moved = feedbackPrompt({ ...input, code: { ...input.code, fingerprint: "f2" } });
    expect(moved).toContain("Warning: the session started on code fingerprint `f1`. The app now runs `f2`.");
    expect(moved).not.toContain("uncommitted");
  });

  it("shows scenario, seed, turn, card, eligibility, tracks, scores, thresholds and Harm (AC3.1)", () => {
    const prompt = feedbackPrompt(input);
    for (const line of [
      "Session: S1. Scenario: full-campaign. Seed: 7.",
      "Campaign C2, Propaganda round 2, card 3. Phase: card. Active faction: pkk.",
      "Card: DK-012 Mountain Raid.",
      "Eligibility: first pkk, second state.",
      "Resources: state=14, pkk=6.",
      "Tracks: legitimacy=9, europe=2, legalSpace=open, ceasefire=none.",
      "Scores: state=21, pkk=17. Thresholds: state=30, pkk=25.",
      "Harm counts: state=3, pkk=1.",
    ]) expect(prompt).toContain(line);
  });

  it("shows the selected space with level, Control, pieces and markers (AC3.2)", () => {
    expect(feedbackPrompt(input)).toContain("Selected space: hakkari. Level: -1. Control: state.\nPieces: guerrilla underground=2, police active=1.\nMarkers: terror on=1.");
    const none = { ...annotation, context: { ...context, selected_space: null } };
    expect(feedbackPrompt({ ...input, annotation: none })).toContain("Selected space: none.");
  });

  it("shows who plays each side (AC4.1)", () => {
    expect(feedbackPrompt(input)).toContain("## Seats\n\n| Faction | Player |\n| --- | --- |\n| state | human |\n| pkk | pkk-heuristic@1 |\n");
  });

  it("holds the bot decision record of a note on a bot action, and none on a human action (AC4.2)", () => {
    expect(feedbackPrompt(input)).toContain(`## Bot decision (action A2)\n\n\`\`\`json\n${JSON.stringify([{ player: "pkk-heuristic@1", chosen: "rally", score: 3 }], null, 2)}\n\`\`\`\n`);
    expect(feedbackPrompt({ ...input, annotation: { ...annotation, action_id: "A1" } })).not.toContain("## Bot decision");
  });

  it("holds the last N log entries with rule refs and the last N commands with validation (AC5.1)", () => {
    const all = feedbackPrompt(input);
    expect(all).toContain("## Recent log (last 2 of 2 entries)\n\n- A1 Setup, rule 2.1: `{}`\n- A2 PiecePlaced, rule 3.3.1: `{\"space\":\"hakkari\"}`\n");
    const last = feedbackPrompt({ ...input, limits: { log: 1, commands: 1 } });
    expect(last).toContain("## Recent log (last 1 of 2 entries)\n\n- A2 PiecePlaced");
    expect(last).not.toContain("A1 Setup");
    expect(last).toContain("## Recent commands (last 1 of 2)\n\n- A2 `{\"type\":\"Answer\",\"choice\":\"x\"}` Validation: `{\"ok\":true,\"violations\":[],\"warnings\":[{\"code\":\"W1\",\"message\":\"low\"}]}`\n");
    expect(last).not.toContain("ChooseOperation");
  });

  it("holds the last 10 client errors with only the path of API URLs (AC5.2, Risk 2)", () => {
    expect(feedbackPrompt(input)).toContain("## Client errors\n\nNone.\n");
    const errors = [
      ...Array.from({ length: 11 }, (_, i) => ({ kind: "error" as const, message: `boom ${String(i)}` })),
      { kind: "request" as const, method: "POST", path: "http://127.0.0.1:5173/api/sessions/S1/bot-step?x=1", status: 409, message: "The session moved on." },
    ];
    const prompt = feedbackPrompt({ ...input, diagnostics: { errors } });
    expect(prompt).toContain("## Client errors (last 10 of 12)\n\n- error: boom 2\n");
    expect(prompt).toContain("- request POST /api/sessions/S1/bot-step: 409 The session moved on.\n");
    expect(prompt).not.toContain("boom 1\n");
    expect(prompt).not.toContain("127.0.0.1");
  });

  it("reads the selected space and seats at the head state of the game state section, not the noted action's state (review F1)", () => {
    const past = feedbackPrompt({ ...input, annotation: { ...annotation, action_id: "A1", state_hash: "h1" } });
    expect(past).toContain("Selected space: hakkari. Level: -1. Control: state.");
    expect(past).toContain("| pkk | pkk-heuristic@1 |");
  });

  it("shows no rows for a limit of 0 (review F4)", () => {
    const prompt = feedbackPrompt({ ...input, diagnostics: { errors: [{ kind: "error", message: "boom" }] }, limits: { log: 0, commands: 0, errors: 0 } });
    expect(prompt).toContain("## Recent log (last 0 of 2 entries)\n\n\n");
    expect(prompt).toContain("## Recent commands (last 0 of 2)\n\n\n");
    expect(prompt).toContain("## Client errors (last 0 of 1)\n\n\n");
  });

  it.fails("warns when git could not read the commit (review F6)", () => {
    expect(feedbackPrompt({ ...input, code: { ...input.code, commit: "unknown" } })).toContain("Warning: the app could not read its git commit. Ask the user which commit they ran.");
  });
});
