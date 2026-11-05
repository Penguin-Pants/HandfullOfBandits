import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { exportCommand } from "../src/cli/export.ts";
import { scriptedPolicy } from "../src/cli/play.ts";
import { exportCsv } from "../src/export/csv.ts";
import { exportJson } from "../src/export/json.ts";
import { exportMarkdown } from "../src/export/markdown.ts";
import { SessionService } from "../src/server/service.ts";
import { openStore } from "../src/store/migrate.ts";
import { engine, ruleset } from "./board.ts";
import { kurdishDir } from "./kurdish-package.ts";

// P4-02: full Markdown (07 s8.2 sections 1 to 6) and CSV (07 s8.3). Acceptance (DEC-82): the
// sections are present and the export holds the research 12 s4 logging sheet inputs that 06 s4
// maps to notes, actions and sessions (items 1 to 5, 14 and 16 to 19).
const dir = mkdtempSync(join(tmpdir(), "hob-export-full-"));
const file = join(dir, "store.sqlite");
const db = openStore(file);
const service = new SessionService(db, join(kurdishDir, "..", ".."));
afterAll(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});
const focus = { panel: "board" as const, selectedSpace: null, selectedPieces: [], hoveredActionId: null };

const { sessionId, head } = service.createSession({ dir: kurdishDir, scenarioId: "s0", seed: 7, name: "full export" });
let state = head.state;
let headId = head.actionId;
let firstOp = "";
let undone = "";
while (state.ended === null) {
  const command = scriptedPolicy(engine, ruleset, state);
  const res = service.submit(sessionId, command, headId);
  if (undone === "" && command.type === "ChooseOperation") {
    // One undone Operation: the counts and the CSV must keep it apart from committed play.
    undone = res.actionId;
    headId = service.undo(sessionId, res.actionId).state.actionId;
    continue;
  }
  if (firstOp === "" && command.type === "ChooseOperation") firstOp = res.actionId;
  state = res.head.state;
  headId = res.actionId;
}
const alternative = service.annotate(sessionId, { anchor: "executed", actionId: firstOp, text: "Best alternative: March, because \"Train\" did little,\nsecond line.", categoryIds: ["alternative", "balance"], focus });
const question = service.annotate(sessionId, { anchor: "executed", actionId: firstOp, text: "Rule question: can Police Train here? Answer source: 05 s3.", categoryIds: ["rule-ambiguity"], focus });
const content = service.annotate(sessionId, { anchor: "state", actionId: null, text: "The Village Guards card felt wrong.", categoryIds: ["historical"], focus });
const general = service.annotate(sessionId, { anchor: "session", actionId: null, text: "General remark.", categoryIds: [], focus });
service.endSession(sessionId, "Debrief: short slice.");
const data = exportJson(db, { sessionIds: [sessionId], withStates: false, appVersion: "0.1.0", exportedAt: "2026-11-05T00:00:00Z" });
const md = exportMarkdown(data);
const csv = exportCsv(data);

/** Minimal RFC 4180 reader for the assertions. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\r" && text[i + 1] === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; i++; }
    else cell += c;
  }
  return rows;
}
const records = (text: string): Record<string, string>[] => {
  const [header, ...rest] = parseCsv(text);
  return rest.map((r) => Object.fromEntries((header ?? []).map((h, i) => [h, r[i] ?? ""])));
};
const section = (heading: string): string => {
  const start = md.search(new RegExp(`\n${heading}( \\[.*\\])?\n`));
  if (start < 0) return "";
  const next = md.indexOf("\n## ", start + heading.length + 2);
  return md.slice(start, next < 0 ? undefined : next);
};
const committedOps = data.actions.filter((a) => a["status"] === "committed" && (a["commands"] as { type: string }[])[0]?.type === "ChooseOperation");

describe("Markdown export, 07 s8.2 sections", () => {
  it("has the six sections in order", () => {
    const headings = ["## Scope", "## Prototype assumptions", "## Session: full export", "## Notes by category", "## Round metrics", "## Action use by faction"];
    const at = headings.map((h) => md.indexOf(`\n${h}`));
    expect(at.every((n) => n >= 0), JSON.stringify(at)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("section 1 names the scope, versions, scenario, seed and result", () => {
    const scope = section("## Scope");
    expect(scope).toContain(sessionId);
    expect(scope).toContain("kurdish-coin 0.1.0");
    expect(scope).toContain("Scenario s0");
    expect(scope).toContain("seed 7");
    expect(scope).toMatch(/Winner: (state|pkk|none)/);
  });

  it("section 4 groups notes by category label with turn position, faction, card, action, state changes and rule refs", () => {
    const notes = section("## Notes by category");
    const alt = notes.slice(notes.indexOf("### Best alternative and why"));
    const line = alt.split("\n").find((l) => l.includes(alternative)) ?? "";
    const action = data.actions.find((a) => a["action_id"] === firstOp) ?? {};
    expect(line).toContain(`${firstOp}; ${String(action["card_id"])}; rule `);
    expect(alt).toContain(`${String(action["campaign"])} round ${String(action["propaganda_round"])} card ${String(action["card_index"])}`);
    expect(alt).toContain(`Faction: ${String(action["faction"])}`);
    expect(alt).toContain("State changes:");
    expect(alt).toMatch(/resources\.state \d+ to \d+/);
    expect(alt).toContain("did little,\n  second line.");
    expect(notes.slice(notes.indexOf("### Unrealistic historical behavior"))).toContain("Faction: none.");
    expect(notes.slice(notes.indexOf("### Unrealistic historical behavior"))).toContain(`Session: ${sessionId}. Turn: `);
    expect(notes.indexOf(alternative, notes.indexOf("### Balance concern"))).toBeGreaterThan(0);
    expect(notes.slice(notes.indexOf("### General observation"))).toContain(general);
    expect(notes.slice(notes.indexOf("### Rule ambiguity"))).toContain(question);
  });

  it("section 5 has one table row per metrics row with scores and margins", () => {
    const table = section("## Round metrics").split("\n").filter((l) => l.startsWith(`| ${sessionId}`));
    expect(table).toHaveLength(data.metrics.filter((m) => m["propaganda_round"] !== undefined).length);
    const m = (data.metrics[0]?.["data"] ?? {}) as { scores: Record<string, number>; margins: Record<string, number> };
    expect(table[0]).toContain(`| ${String(m.scores["state"])} | ${String(m.scores["pkk"])} | ${String(m.margins["state"])} | ${String(m.margins["pkk"])} |`);
  });

  it("section 6 counts committed actions by faction and action, without undone actions", () => {
    const uses = section("## Action use by faction");
    const trains = committedOps.filter((a) => (a["commands"] as { payload: { plan: { op: string } } }[])[0]?.payload.plan.op === "state.train").length;
    expect(trains).toBeGreaterThan(0);
    expect(uses).toContain(`| ${sessionId} | state | state.train | ${String(trains)} |`);
  });
});

describe("logging sheet inputs (research 12 s4 through 06 s4; DEC-82)", () => {
  const session = section("## Session: full export");
  it("items 1 and 2: scenario, rules version, seed, card order and options", () => {
    expect(md).toContain("rules R");
    const cards = data.actions.filter((a) => a["status"] === "committed" && a["card_id"] !== null).map((a) => String(a["card_id"]));
    expect(session).toContain(`Card order: ${[...new Set(cards)].join(", ")}`);
    expect(session).toContain("Options: ");
  });
  it("item 3: each action line has card, faction and box; undone actions are marked", () => {
    const line = session.split("\n").find((l) => l.includes(firstOp)) ?? "";
    const action = data.actions.find((a) => a["action_id"] === firstOp) ?? {};
    expect(line).toContain(`${String(action["faction"])} ${String(action["box"])} state.train:`);
    expect(session).not.toMatch(/card \d+, +:/);
    expect(session.split("\n").find((l) => l.includes(undone))).toContain("(undone)");
  });
  it("items 4, 5 and 19: alternative, rule question and content notes are in their category groups", () => {
    const notes = section("## Notes by category");
    expect(notes.slice(notes.indexOf("### Unrealistic historical behavior"))).toContain(content);
    expect(notes).toContain("Answer source: 05 s3");
  });
  it("items 16 to 18: result, record sheet and play time", () => {
    expect(session).toMatch(/Result: winner (state|pkk|none), reason final scoring/);
    const sheet = Object.keys((data.sessions[0]?.["result"] as { recordSheet: object }).recordSheet);
    expect(sheet.length).toBeGreaterThan(0);
    for (const key of sheet) expect(session).toContain(`${key}=`);
    expect(session).toMatch(/Play time: \d+ min \(started .+, last change .+\)/);
  });
  it("debrief comes first in the session section (07 s8.2 item 3)", () => {
    expect(session.indexOf("Debrief: short slice.")).toBeLessThan(session.indexOf("### Actions"));
  });
});

describe("CSV export, 07 s8.3", () => {
  it("annotations.csv has one row per note with flattened context", () => {
    const rows = records(csv.annotations);
    expect(rows.map((r) => r["annotation_id"]).sort()).toEqual(data.annotations.map((a) => String(a["annotation_id"])).sort());
    const alt = rows.find((r) => r["annotation_id"] === alternative) ?? {};
    expect(alt["text"]).toBe("Best alternative: March, because \"Train\" did little,\nsecond line.");
    expect(alt["category_ids"]).toBe("alternative; balance");
    expect(alt["context.action_id"]).toBe(firstOp);
    expect(Number(alt["context.scores.state"])).toBeTypeOf("number");
    expect(rows.find((r) => r["annotation_id"] === content)?.["context.action_id"]).toBe("");
  });

  it("actions.csv has one row per action with status, op, costs and key changes", () => {
    const rows = records(csv.actions);
    expect(rows.map((r) => r["action_id"])).toEqual(data.actions.map((a) => String(a["action_id"])));
    expect(rows.find((r) => r["action_id"] === undone)?.["status"]).toBe("undone");
    const op = rows.find((r) => r["action_id"] === firstOp) ?? {};
    expect(op["op"]).toBe("state.train");
    expect(op["notes"]).toBe("2");
    expect(Object.keys(rows[0] ?? {})).toEqual(expect.arrayContaining(["costs", "score_changes", "harm_changes", "control_changes"]));
    const paid = rows.filter((r) => r["costs"] !== "");
    expect(paid.length).toBeGreaterThan(0);
  });

  it("the CLI writes both files into the --out folder and needs --out", () => {
    db.pragma("wal_checkpoint(TRUNCATE)");
    const out = join(dir, "csv");
    expect(exportCommand([sessionId], file, false, out, "0.1.0", "csv").exitCode).toBe(0);
    expect(records(readFileSync(join(out, "annotations.csv"), "utf8"))).toHaveLength(data.annotations.length);
    expect(records(readFileSync(join(out, "actions.csv"), "utf8"))).toHaveLength(data.actions.length);
    expect(exportCommand([sessionId], file, false, null, "0.1.0", "csv")).toEqual({ exitCode: 1, lines: ["error: --format csv needs --out <folder>"] });
  });
});
