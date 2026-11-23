import { describe, expect, it } from "vitest";
import { feedbackPrompt, type FeedbackInput } from "./feedback-prompt.ts";
import type { CoinSimExport } from "./json.ts";

// Mock data (tests only): one session, two actions, one note on the second action.
const context = {
  session_id: "S1", scenario_id: "full-campaign", campaign: "C2", propaganda_round: 2, card_index: 3, phase: "card", active_faction: "pkk",
  first_eligible: "pkk", second_eligible: "state", current_card_id: "DK-012", current_card_title: "Mountain Raid", state_hash: "h2",
  resources: { state: 14, pkk: 6 }, tracks: { legitimacy: 9, europe: 2, legalSpace: "open", ceasefire: "none" },
  scores: { state: 21, pkk: 17 }, thresholds: { state: 30, pkk: 25 }, harm_counts: { civilian: 3 }, selected_space: "hakkari",
};
const annotation = { annotation_id: "N1", session_id: "S1", action_id: "A2", anchor: "executed", state_hash: "h2", text: "PKK Rally put a Guerrilla in a Controlled space.", category_ids: ["feedback"], context };
const data = {
  exportMeta: { schema: "coin-sim-export/1", appVersion: "0.1.0", exportedAt: "2026-11-23T00:00:00Z", filter: { sessionIds: ["S1"], withStates: true } },
  packages: [], categories: [], metrics: [], index: { annotations: [] },
  sessions: [{ session_id: "S1", scenario_id: "full-campaign", seed: 7, package_hash: "p1", code_fingerprint: "f1", app_version: "0.1.0", seats: { pkk: "pkk-heuristic@1" }, head_action_id: "A2" }],
  branches: [{ branch_id: "B1", session_id: "S1", forked_from_action_id: null }],
  actions: [],
  states: [],
  annotations: [annotation],
} as unknown as CoinSimExport;
const input: FeedbackInput = { annotation, data };

describe("feedbackPrompt", () => {
  it("starts with the user's text, then the task line (AC2.1)", () => {
    const lines = feedbackPrompt(input).split("\n").filter((l) => l !== "");
    expect(lines.slice(0, 3)).toEqual(["# Feedback from play", "> PKK Rally put a Guerrilla in a Controlled space.", "Task: Find the root cause, write a failing test, fix it."]);
  });
});
