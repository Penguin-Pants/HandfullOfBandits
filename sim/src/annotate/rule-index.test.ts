import { describe, expect, it } from "vitest";
import { buildRuleIndex, lookupRule, ruleSource } from "./rule-index.ts";

const docs = {
  "06-operations.md": [
    "# 06 Operations",
    "",
    "Intro text.",
    "",
    "## 3. State Special Activities",
    "",
    "Three activities.",
    "",
    "### 3.2 Cross-Border",
    "",
    "Accompanies: Sweep or Assault.",
    "",
    "1. Pay 2 Resources.",
    "2. Move up to 6 Troops.",
    "",
    "### 3.3 Diplomacy",
    "",
    "Talks text.",
    "",
    "### 3.4 Village Clearance",
    "",
    "Clearance text.",
    "",
  ].join("\n"),
  "05-sequence.md": "# 05 Sequence\n\n## 6. Propaganda round\n\nSix phases.\n\n### 6.1 Victory check\n\nCheck text.\n",
  "notes.txt": "not a research file",
};
const index = buildRuleIndex(docs);

describe("lookupRule", () => {
  it("returns the text under the cited heading and stops at the next heading", () => {
    const r = lookupRule(index, "06 s3.2");
    expect(r.sections).toHaveLength(1);
    expect(r.sections[0]).toMatchObject({ cite: "06 s3.2", file: "06-operations.md", section: "3.2", heading: "Cross-Border" });
    expect(r.sections[0]?.text).toBe("Accompanies: Sweep or Assault.\n\n1. Pay 2 Resources.\n2. Move up to 6 Troops.");
    expect(r.missing).toEqual([]);
    expect(r.other).toEqual([]);
  });

  it("lists the subsections of a top-level section and keeps its own text short", () => {
    const r = lookupRule(index, "06 s3");
    expect(r.sections[0]?.heading).toBe("State Special Activities");
    expect(r.sections[0]?.text).toBe("Three activities.");
    expect(r.sections[0]?.subsections).toEqual(["3.2 Cross-Border", "3.3 Diplomacy", "3.4 Village Clearance"]);
  });

  it("ignores the qualifier after the section (item, step, effect, row)", () => {
    expect(lookupRule(index, "06 s3.2 item 3").sections.map((s) => s.cite)).toEqual(["06 s3.2"]);
  });

  it("resolves a bare section after a comma or semicolon in the document of the cite before it", () => {
    const r = lookupRule(index, "05 s6.1; 06 s3.3, s3.4 effect 2; s3");
    expect(r.sections.map((s) => s.cite)).toEqual(["05 s6.1", "06 s3.3", "06 s3.4", "06 s3"]);
  });

  it("lists each section once", () => {
    expect(lookupRule(index, "06 s3.2, s3.2 note 1").sections).toHaveLength(1);
  });

  it("reports a cited section or file that is not in the index", () => {
    const r = lookupRule(index, "06 s9.9; 99 s1");
    expect(r.sections).toEqual([]);
    expect(r.missing).toEqual(["06 s9.9", "99 s1"]);
  });

  it("keeps parts that cite no research section", () => {
    expect(lookupRule(index, "06 s3.3; DD-19.4").other).toEqual(["DD-19.4"]);
    expect(lookupRule(index, "debug.adjustTrack")).toMatchObject({ sections: [], missing: [], other: ["debug.adjustTrack"] });
  });

  it("does not read a word that ends in s and a number as a citation", () => {
    expect(lookupRule(index, "tests1.2").sections).toEqual([]);
  });

  it("ignores files that are not numbered research documents", () => {
    expect(lookupRule(index, "06 s3.2").sections).toHaveLength(1);
    expect(buildRuleIndex({ "readme.md": "## 1. A\n\ntext" }).size).toBe(0);
  });

  it("reads a document with Windows line endings", () => {
    const crlf = buildRuleIndex({ "06-operations.md": docs["06-operations.md"].replaceAll("\n", "\r\n") });
    const r = lookupRule(crlf, "06 s3.2");
    expect(r.sections[0]?.heading).toBe("Cross-Border");
    expect(r.sections[0]?.text).toBe("Accompanies: Sweep or Assault.\n\n1. Pay 2 Resources.\n2. Move up to 6 Troops.");
    expect(lookupRule(crlf, "06 s3").sections[0]?.subsections).toEqual(["3.2 Cross-Border", "3.3 Diplomacy", "3.4 Village Clearance"]);
  });

  it("returns nothing for an empty ref", () => {
    expect(lookupRule(index, "")).toEqual({ ref: "", sections: [], missing: [], other: [] });
  });
});

describe("ruleSource", () => {
  it("names file, section and heading for each resolved section", () => {
    expect(ruleSource(lookupRule(index, "06 s3.2; 05 s6.1"))).toBe("06-operations.md s3.2 Cross-Border; 05-sequence.md s6.1 Victory check");
  });

  it("is undefined when nothing resolves", () => {
    expect(ruleSource(lookupRule(index, "DD-19.4"))).toBeUndefined();
    expect(ruleSource(lookupRule(index, "06 s9.9"))).toBeUndefined();
  });
});
