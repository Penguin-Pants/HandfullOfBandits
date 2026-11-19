// Print drift check: the card catalogue, the rulebook appendix and both PDFs follow the package card
// text and the rules 5.4 Always table (docs/printdata.py). Rebuild them with `make print`.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { kurdish } from "./kurdish-package.ts";

const root = join(process.cwd(), "..");
const read = (path: string): string => readFileSync(join(root, path), "utf8").replace(/\r\n/g, "\n");
const flat = (s: string): string => s.split(/\s+/).filter(Boolean).join(" ");
/** Python html.escape with quote=True, as docs/card-catalogue/generate.py writes the HTML. */
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const REBUILD = "Rebuild the print set: make print";
const PROPAGANDA_TEXT = "Conduct a Propaganda round (6.0). No player Event choice.";

const always = new Map([...read("docs/rules/prototype-rules.md").matchAll(/^\| C\d: (DK-\d{3}) [^|]+\| (.+?) \|$/gm)].map((m) => [m[1] ?? "", m[2] ?? ""]));
const cards = Object.values(kurdish.ruleset.cards);

/** The text each card prints: title, Always line and sides (docs/printdata.py `cards`). */
function printed(id: string): string[] {
  const card = kurdish.ruleset.cards[id];
  if (card === undefined) throw new RangeError(id);
  const notes = card.always.flatMap((e) => (e.type === "note" ? [e.text] : []));
  const line = card.always.length > 0 ? [[always.get(id) ?? `missing rules 5.4 row for ${id}`, ...notes].join(" ")] : [];
  const sides = card.type === "propaganda" ? [PROPAGANDA_TEXT] : card.type === "pivotal" ? [card.unshaded?.text ?? ""] : [card.unshaded?.text ?? "", card.shaded?.text ?? ""];
  return [card.title, ...line, ...sides.map(flat)];
}

describe("print drift (docs/printdata.py)", () => {
  it("the catalogue lists every package card once and holds only editorial fields", () => {
    const catalogue = JSON.parse(read("docs/card-catalogue/catalogue.json")) as { cards: { id: string; printed: Record<string, unknown> }[] };
    expect(catalogue.cards.map((c) => c.id).sort()).toEqual(cards.map((c) => c.id).sort());
    for (const c of catalogue.cards) {
      expect(Object.keys(c).sort(), c.id).toEqual(["id", "image", "printed", "source_references", "unresolved_questions"]);
      expect(Object.keys(c.printed).sort(), c.id).toEqual(["flavor", "flavor_source_kind"]);
    }
  });

  it("the catalogue HTML prints the package text of every card", () => {
    const html = read("docs/card-catalogue/index.html");
    const missing = cards.flatMap((c) => printed(c.id).filter((t) => !html.includes(esc(t))).map((t) => `${c.id}: ${t}`));
    expect(missing, REBUILD).toEqual([]);
  });

  it("rules Appendix A prints the package text of every card", () => {
    const appendix = flat(read("docs/rules/prototype-card-reference.md"));
    const missing = cards.flatMap((c) => [`### ${c.id} · ${c.title}`, ...printed(c.id)].filter((t) => !appendix.includes(flat(t))).map((t) => `${c.id}: ${t}`));
    expect(missing, REBUILD).toEqual([]);
  });

  it.each(["docs/card-catalogue/cards-a4.pdf", "docs/rules/handful-of-bandits-rules-a4.pdf"])("%s is the PDF built from the current inputs", (pdf) => {
    const stamp = JSON.parse(read(`${pdf}.inputs.json`)) as { inputs: string[]; sha256: string; output_sha256: string };
    expect(createHash("sha256").update(readFileSync(join(root, pdf))).digest("hex"), `${pdf} is not the PDF that the stamp records. ${REBUILD}`).toBe(stamp.output_sha256);
    for (const file of ["c1", "c2", "c3", "c4", "c5", "pivotal"]) expect(stamp.inputs).toContain(`game-packages/kurdish-coin/0.1.0/cards/${file}.yaml`);
    expect(stamp.inputs).toContain("docs/rules/prototype-rules.md");
    const hash = createHash("sha256");
    for (const name of stamp.inputs) hash.update(`${name}\n${read(name)}\n`, "utf8");
    expect(hash.digest("hex"), REBUILD).toBe(stamp.sha256);
  });
});
