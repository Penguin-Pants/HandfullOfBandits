// One plain sentence per engine log entry for the history view (05 s10; 07 s6).
import type { LogEntry } from "../engine/core/types.ts";

function v(value: unknown): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value);
}

export function entryText(e: LogEntry): string {
  const d = e.data;
  const pa = e.assumptionRef === null ? "" : ` Prototype assumption ${e.assumptionRef}.`;
  const ref = e.ruleRef === null ? "" : ` (${e.ruleRef})`;
  switch (e.kind) {
    case "CardRevealed":
      return `Card ${v(d["card"])} revealed.${ref}`;
    case "ChoiceMade":
      return `${v(d["faction"] ?? "")} chose ${v(d["box"] ?? d["choice"] ?? d["spaces"] ?? d["freeAction"] ?? "")}.${ref}${pa}`;
    case "CostPaid":
      return `${v(d["faction"])} paid ${v(d["amount"])} Resources${d["location"] === null || d["location"] === undefined ? "" : ` in ${v(d["location"])}`}.${ref}`;
    case "EffectApplied":
      return `${v(d["effect"])}: ${Object.entries(d).filter(([k]) => k !== "effect").map(([k, x]) => `${k} ${v(x)}`).join(", ")}.${ref}${pa}`;
    case "EffectSkipped":
      return `${v(d["effect"])} skipped: ${v(d["reason"])}.${ref}${pa}`;
    case "DieRolled":
      return `Die for ${v(d["purpose"])}: ${v(d["result"] ?? d["roll"] ?? d["picked"])}.${ref}${pa}`;
    case "ControlChanged":
      return `Control of ${v(d["space"])}: ${v(d["before"] ?? "none")} to ${v(d["after"] ?? "none")}.`;
    case "EligibilityChanged":
      return `First Eligible: ${v(d["firstEligible"])}; Second Eligible: ${v(d["secondEligible"])}.${ref}`;
    case "PhaseStarted":
      return `Phase ${v(d["phase"])} started.${ref}`;
    case "PhaseEnded":
      return `Phase ${v(d["phase"])} ended.${ref}`;
    case "GameEnded":
      return `Game ended: ${v(d["winner"] ?? "no winner")} (${v(d["reason"])}).`;
    case "StopRuleFlag":
      return `Stop rule ${v(d["rule"])} flagged for ${v(d["faction"])}.${ref}`;
    default:
      return `${e.kind}${ref}.${pa}`;
  }
}
