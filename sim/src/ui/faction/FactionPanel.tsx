// Faction panel (08 s3.2): boxes, Op list with OK or the first violation (T-UI-03), plan building
// with board locations, live validation, preview, commit with Enter.
import { useEffect, useState } from "react";
import type { Api, AnyCommand, FormField, LegalChoices, ValidationResult } from "../api.ts";
import { perLocation, toCommand, type Draft, type Values } from "./plan.ts";

export interface FactionPanelProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly legal: LegalChoices;
  /** Board selection: the plan's locations. */
  readonly selected: readonly string[];
  readonly onCommit: (command: AnyCommand) => void;
  readonly onDraft: (command: AnyCommand | null) => void;
}

const OP_BOXES = ["limitedOp", "opOnly", "opSa"];
const LABEL: Readonly<Record<string, string>> = { event: "Event", limitedOp: "Limited Op", opOnly: "Op Only", opSa: "Op + SA", pass: "Pass" };

/** One row of form fields for one location (op, SA or sub-action). */
function Fields({ fields, values, onChange }: { fields: readonly FormField[]; values: Values; onChange: (key: string, value: string) => void }) {
  return fields.map((f) => (
    <label key={f.key}>
      {f.label}{" "}
      {f.kind === "select" ? (
        <select value={values[f.key] ?? ""} onChange={(e) => { onChange(f.key, e.target.value); }}>
          <option value="" />
          {f.options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input size={f.kind === "number" ? 3 : 18} value={values[f.key] ?? ""} onChange={(e) => { onChange(f.key, e.target.value); }} />
      )}
    </label>
  ));
}

const list = (text: string): string[] => text.split(",").map((x) => x.trim()).filter((x) => x !== "");

export function FactionPanel({ api, sessionId, legal, selected, onCommit, onDraft }: FactionPanelProps) {
  const faction = legal.faction ?? "";
  const boxes = legal.boxes ?? [];
  const actions = legal.actions ?? [];
  const [box, setBox] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Values>>({});
  const [sa, setSa] = useState<string | null>(null);
  const [saSpaces, setSaSpaces] = useState("");
  const [saValues, setSaValues] = useState<Record<string, Values>>({});
  const [saTiming, setSaTiming] = useState<"before" | "after">("after");
  const [subSpace, setSubSpace] = useState("");
  const [subValues, setSubValues] = useState<Values>({});
  const [result, setResult] = useState<ValidationResult | null>(null);
  const form = actions.find((a) => a.id === op);
  const saForm = actions.find((a) => a.id === sa);
  const draft: Draft | null =
    box === null || op === null
      ? null
      : {
          box, op, locations: selected, values,
          sa: sa === null ? null : { action: sa, locations: list(saSpaces), values: saValues, timing: saForm?.timing ?? saTiming },
          subAction: form === undefined || form.subAction === null || subSpace === "" ? null : { action: form.subAction.id, space: subSpace, params: perLocation(form.subAction.fields, subValues) as Record<string, number> },
        };
  const command = draft === null ? null : toCommand(faction, draft, actions);
  const key = JSON.stringify(command);

  useEffect(() => {
    onDraft(command);
    if (command === null) {
      setResult(null);
      return;
    }
    let live = true;
    void api.validate(sessionId, command).then((r) => { if (live) setResult(r); });
    return () => { live = false; };
    // The command is rebuilt each render; `key` is its stable identity, so it is the only dependency.
  }, [key]);

  const clear = (): void => {
    setBox(null);
    setOp(null);
    setValues({});
    setSa(null);
    setSaSpaces("");
    setSaValues({});
    setSaTiming("after");
    setSubSpace("");
    setSubValues({});
  };
  // Enter commits a valid plan and Esc clears it, anywhere on the page except the note bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.tagName === "TEXTAREA") return;
      if (e.key === "Escape") clear();
      // A focused button (HTML or role="button", such as a map space) already acts on Enter.
      if (target?.tagName === "BUTTON" || target?.getAttribute("role") === "button") return;
      if (e.key === "Enter" && command !== null && result?.ok === true) {
        e.preventDefault();
        onCommit(command);
        clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  });
  const pickBox = (b: string): void => {
    if (b === "pass") onCommit({ type: "Pass", faction });
    else if (b !== "event") setBox(b);
  };

  return (
    <section className="panel" aria-label="Faction panel">
      <h3>
        {faction} <span className="muted">{legal.first === true ? "First Eligible" : "Second Eligible"}</span>
      </h3>
      <p className="hint" aria-live="polite">
        {box === null
          ? "Step 1: pick a box. For the Event, use the card panel above."
          : op === null
            ? "Step 2: pick an Operation."
            : selected.length === 0
              ? "Step 3: click spaces on the map (Shift-click adds more)."
              : result?.ok === true
                ? "Step 4: check the preview, then Commit."
                : "Fix the problems shown below, or change the plan."}
      </p>
      <div className="elig-track" role="group" aria-label="Boxes">
        {boxes.map((b) => {
          const here = Object.entries(legal.placed ?? {}).filter(([, at]) => at === b.box).map(([f]) => f);
          return (
            <div key={b.box} className={`elig-box${b.allowed ? "" : " closed"}`} aria-label={`${LABEL[b.box] ?? b.box} box`}>
              <button type="button" disabled={!b.allowed || b.box === "event"} title={b.reason ?? (b.box === "event" ? "Use the event panel." : "")} aria-pressed={box === b.box} onClick={() => { pickBox(b.box); }}>
                {LABEL[b.box] ?? b.box}
              </button>
              {here.map((f) => (
                <span key={f} className="elig-cylinder">{f}</span>
              ))}
              {b.allowed && b.otherMay != null && (
                <span className="elig-note">
                  Then {legal.other}: {b.otherMay.map((o) => LABEL[o] ?? o).join(", ")}
                </span>
              )}
              {b.allowed && b.nextFirst != null && <span className="elig-note">Next card 1st: {b.nextFirst}</span>}
              {!b.allowed && <span className="elig-note">Closed</span>}
            </div>
          );
        })}
      </div>
      {box !== null && OP_BOXES.includes(box) && (
        <ul aria-label="Operations">
          {actions.filter((a) => a.kind === "op").map((a) => (
            <li key={a.id}>
              <button type="button" disabled={!a.ok && box !== "opSa"} title={a.ok || box !== "opSa" ? "" : "No legal standalone plan; a preceding SA may make one."} aria-pressed={op === a.id} onClick={() => { setOp(a.id); }}>
                {a.label}
              </button>{" "}
              <span className="muted">{a.cost}</span> {a.ok ? <span>OK ({a.locations.join(", ")})</span> : <span className="bad">{a.reason}</span>}
            </li>
          ))}
        </ul>
      )}
      {form !== undefined && (
        <div aria-label="Plan">
          <p>Locations: {selected.length === 0 ? "select spaces on the board" : selected.join(", ")}</p>
          {selected.map((loc) => (
            <div key={loc} className="row">
              <span>{loc}</span>
              <Fields fields={form.fields} values={values[loc] ?? {}} onChange={(k, v) => { setValues({ ...values, [loc]: { ...values[loc], [k]: v } }); }} />
            </div>
          ))}
          {form.subAction !== null && (
            <div className="row" aria-label="Sub-action">
              <label>
                {form.subAction.id} space{" "}
                <select value={subSpace} onChange={(e) => { setSubSpace(e.target.value); }}>
                  <option value="">none</option>
                  {selected.map((loc) => <option key={loc}>{loc}</option>)}
                </select>
              </label>
              {subSpace !== "" && <Fields fields={form.subAction.fields} values={subValues} onChange={(k, v) => { setSubValues({ ...subValues, [k]: v }); }} />}
            </div>
          )}
          {box === "opSa" && (
            <div className="row">
              <label>
                SA{" "}
                <select value={sa ?? ""} onChange={(e) => { setSa(e.target.value === "" ? null : e.target.value); }}>
                  <option value="">none</option>
                  {actions.filter((a) => a.kind === "sa").map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </label>
              {sa !== null && (
                <label>
                  SA spaces <input value={saSpaces} onChange={(e) => { setSaSpaces(e.target.value); }} />
                </label>
              )}
              {saForm !== undefined && saForm.timing === undefined && (
                <label>
                  SA timing{" "}
                  <select value={saTiming} onChange={(e) => { setSaTiming(e.target.value === "before" ? "before" : "after"); }}>
                    <option value="before">before the Op</option>
                    <option value="after">after the Op</option>
                  </select>
                </label>
              )}
            </div>
          )}
          {saForm !== undefined && saForm.fields.length > 0 && list(saSpaces).map((loc) => (
            <div key={loc} className="row" aria-label={`SA ${loc}`}>
              <span>{loc}</span>
              <Fields fields={saForm.fields} values={saValues[loc] ?? {}} onChange={(k, v) => { setSaValues({ ...saValues, [loc]: { ...saValues[loc], [k]: v } }); }} />
            </div>
          ))}
        </div>
      )}
      {result !== null && (
        <div aria-label="Validation">
          {result.violations.map((v, i) => (
            <p key={i} className="bad">
              {v.location === null ? "" : `${v.location}: `}
              {v.message} {v.ruleRef === null ? "" : `(${v.ruleRef})`}
            </p>
          ))}
          {result.ok && (
            <ul aria-label="Preview">
              {result.preview.effects.map((e, i) => <li key={i}>{JSON.stringify({ ...e, ruleRef: undefined, assumptionRef: undefined })}</li>)}
            </ul>
          )}
        </div>
      )}
      <div className="row">
        <button type="button" className="primary" disabled={command === null || result?.ok !== true} onClick={() => { if (command !== null) { onCommit(command); clear(); } }}>
          Commit (Enter)
        </button>
        <button type="button" onClick={clear}>
          Clear (Esc)
        </button>
        <button type="button" onClick={() => { onCommit({ type: "Pass", faction }); }}>
          Pass
        </button>
      </div>
    </section>
  );
}
