// Minimal Markdown (07 s8.2, P3a-08): scope, assumptions, debrief, actions and linked notes.
import type { CoinSimExport } from "./json.ts";
const escaped = (value: unknown): string => (typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : value == null ? "" : JSON.stringify(value)).replace(/([\\`*_{}[\]<>#|])/g, "\\$1");
const note = (n: Record<string, unknown>): string => `- [${escaped(n["annotation_id"])}; ${escaped(n["action_id"] ?? n["state_hash"] ?? n["session_id"])}; ${escaped(n["anchor"])}] ${escaped(n["text"]).replace(/\n/g, "\n  ")}\n`;

export function exportMarkdown(data: CoinSimExport): string {
  const lines = ["# Playtest export\n", `Exported: ${escaped(data.exportMeta.exportedAt)}. App: ${escaped(data.exportMeta.appVersion)}.\n`, "## Prototype assumptions\n"];
  for (const p of data.packages) {
    const manifest = p["manifest"] as Record<string, unknown> | null;
    lines.push(`Package ${escaped(manifest?.["packageId"])} ${escaped(manifest?.["version"])} / ${escaped(manifest?.["rulesetVersion"])} (${escaped(p["package_hash"])}).\n`);
    for (const a of (p["assumptions"] ?? []) as Record<string, unknown>[]) lines.push(`- [${escaped(a["id"])}; ${escaped(a["status"])}] ${escaped(a["text"])}\n`);
  }
  for (const s of data.sessions) {
    const notes = data.annotations.filter((n) => n["session_id"] === s["session_id"]);
    lines.push(`## ${escaped(s["name"])} [${escaped(s["session_id"])}]\n`, `Scenario: ${escaped(s["scenario_id"])}. Seed: ${escaped(s["seed"])}. Result: ${escaped(JSON.stringify(s["result"]))}.\n`, "### Debrief\n");
    for (const n of notes.filter((n) => n["anchor"] === "debrief")) lines.push(note(n));
    lines.push("### Actions\n");
    for (const a of data.actions.filter((a) => a["session_id"] === s["session_id"])) {
      const refs = [...new Set((a["entries"] as Record<string, unknown>[]).flatMap((e) => [e["rule_ref"], e["assumption_ref"]]).filter((x) => typeof x === "string"))];
      lines.push(`- [${escaped(a["action_id"])}; ${escaped(a["card_id"])}; ${refs.map(escaped).join("; ")}] ${escaped(a["summary"])} (${escaped(a["status"])}).\n`);
      for (const n of notes.filter((n) => n["action_id"] === a["action_id"])) lines.push(note(n).split("\n").map((line) => line === "" ? "" : `  ${line}`).join("\n"));
    }
    lines.push("### Other notes\n");
    for (const n of notes.filter((n) => n["action_id"] === null && n["anchor"] !== "debrief")) lines.push(note(n));
  }
  return `${lines.join("\n")}\n`;
}
