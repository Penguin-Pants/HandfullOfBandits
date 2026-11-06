// Research text behind a log rule ref (11 P4-08): the section each cite names, with the cites that
// have no text listed below it.
import { useEffect, useState } from "react";
import type { RuleLookup } from "../api.ts";

export function RuleText({ rule, lookup }: { readonly rule: string; readonly lookup: (ref: string) => Promise<RuleLookup> }) {
  const [found, setFound] = useState<RuleLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    lookup(rule).then(
      (r) => { if (live) setFound(r); },
      (e: unknown) => { if (live) setError(e instanceof Error ? e.message : String(e)); },
    );
    return () => { live = false; };
  }, [rule, lookup]);
  if (error !== null) return <p className="warn" role="alert">Rule text not available: {error}</p>;
  if (found === null) return <p className="muted">Loading rule text.</p>;
  return (
    <div className="rule-text">
      {found.sections.map((s) => (
        <div key={s.cite}>
          <strong>{`${s.cite} ${s.heading} (${s.file})`}</strong>
          {s.text !== "" && <p style={{ whiteSpace: "pre-wrap" }}>{s.text}</p>}
          {s.subsections.length > 0 && <p className="muted">{`Subsections: ${s.subsections.join("; ")}`}</p>}
        </div>
      ))}
      {found.missing.length > 0 && <p className="muted">{`Not in the research files: ${found.missing.join(", ")}`}</p>}
      {found.other.length > 0 && <p className="muted">{`No research section cited: ${found.other.join("; ")}`}</p>}
    </div>
  );
}
