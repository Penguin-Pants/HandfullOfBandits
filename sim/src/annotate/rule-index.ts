// Rule index (11 P4-08; DEC-34): maps a log rule ref such as "06 s3.2 item 3" to the text of the
// research section it cites. Pure. The index comes from the package `rules.yaml` entries
// (`ruleIndexOf`). `buildRuleIndex` and `ruleEntries` turn the research documents into those
// entries (`sim rules`).

/** One research section a ref cites. */
export interface RuleSection {
  /** Citation as written, for example `06 s3.2`. */
  readonly cite: string;
  /** Research file the section is in. */
  readonly file: string;
  readonly section: string;
  readonly heading: string;
  /** Text under the heading, up to the next heading. */
  readonly text: string;
  /** Titles of the sections directly below this one, for example `6.1 Setup`. */
  readonly subsections: readonly string[];
}

export interface RuleLookup {
  readonly ref: string;
  readonly sections: readonly RuleSection[];
  /** Cited sections the research files do not have. */
  readonly missing: readonly string[];
  /** Parts of the ref that cite no research section, for example `DD-19.4` or `debug.adjustTrack`. */
  readonly other: readonly string[];
}

/** One `rules.yaml` entry (11 P4-08): a section keyed by its cite. */
export interface RuleEntry {
  readonly id: string;
  readonly file: string;
  readonly heading: string;
  readonly text: string;
  readonly subsections: readonly string[];
}

export type RuleIndex = ReadonlyMap<string, ReadonlyMap<string, RuleSection>>;

const FILE = /^(\d{2})-.+\.md$/;
const HEADING = /^#{1,6}\s/;
const NUMBERED = /^#{2,4}\s+(\d+(?:\.\d+)*)\.?\s+(.+?)\s*$/;
/** `06 s3.2` or a bare `s3.4` that continues the document of the cite before it. */
const CITE = /(?:(?<!\d)(\d{2}) )?(?<![A-Za-z0-9])s(\d+(?:\.\d+)*)/g;

export function buildRuleIndex(docs: Readonly<Record<string, string>>): RuleIndex {
  const index = new Map<string, Map<string, RuleSection>>();
  for (const [file, content] of Object.entries(docs)) {
    const doc = FILE.exec(file)?.[1];
    if (doc === undefined) continue;
    const lines = content.split(/\r?\n/);
    const sections = new Map<string, RuleSection>();
    for (let i = 0; i < lines.length; i++) {
      const m = NUMBERED.exec(lines[i] ?? "");
      const section = m?.[1];
      const heading = m?.[2];
      if (section === undefined || heading === undefined || sections.has(section)) continue;
      let end = i + 1;
      while (end < lines.length && !HEADING.test(lines[end] ?? "")) end++;
      const subsections: string[] = [];
      for (let j = end; j < lines.length; j++) {
        const sub = NUMBERED.exec(lines[j] ?? "");
        if (sub === null) continue;
        if (!(sub[1] ?? "").startsWith(`${section}.`)) break;
        if ((sub[1] ?? "").split(".").length === section.split(".").length + 1) subsections.push(`${sub[1] ?? ""} ${sub[2] ?? ""}`);
      }
      sections.set(section, { cite: `${doc} s${section}`, file, section, heading, text: lines.slice(i + 1, end).join("\n").trim(), subsections });
    }
    index.set(doc, sections);
  }
  return index;
}

export function lookupRule(index: RuleIndex, ref: string): RuleLookup {
  const found = new Map<string, RuleSection>();
  const missing: string[] = [];
  const other: string[] = [];
  let doc: string | undefined;
  for (const part of ref.split(";")) {
    let cited = false;
    for (const m of part.matchAll(CITE)) {
      cited = true;
      doc = m[1] ?? doc;
      const cite = `${doc ?? "??"} s${m[2] ?? ""}`;
      const section = doc === undefined ? undefined : index.get(doc)?.get(m[2] ?? "");
      if (section !== undefined) found.set(cite, section);
      else if (!missing.includes(cite)) missing.push(cite);
    }
    if (!cited && part.trim() !== "") other.push(part.trim());
  }
  return { ref, sections: [...found.values()], missing, other };
}

/** One line naming the research sections a ref cites, or undefined when none resolve. */
export function ruleSource(lookup: RuleLookup): string | undefined {
  return lookup.sections.length === 0 ? undefined : lookup.sections.map((s) => `${s.file} s${s.section} ${s.heading}`).join("; ");
}

/** The `rules.yaml` entries of an index, in document and section order. */
export function ruleEntries(index: RuleIndex): RuleEntry[] {
  return [...index.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([, sections]) => [...sections.values()].map((s) => ({ id: s.cite, file: s.file, heading: s.heading, text: s.text, subsections: s.subsections })));
}

/** The index of a package: its `rules.yaml` entries. No entries, no index. */
export function ruleIndexOf(entries: readonly RuleEntry[] | undefined): RuleIndex {
  const index = new Map<string, Map<string, RuleSection>>();
  for (const e of entries ?? []) {
    const m = /^(\d{2}) s(\d+(?:\.\d+)*)$/.exec(e.id);
    const doc = m?.[1];
    const section = m?.[2];
    if (doc === undefined || section === undefined) continue;
    const sections = index.get(doc) ?? new Map<string, RuleSection>();
    sections.set(section, { cite: e.id, file: e.file, section, heading: e.heading, text: e.text, subsections: e.subsections });
    index.set(doc, sections);
  }
  return index;
}
