// Faction panel (08 s3.2): boxes, Op list with OK or the first violation (T-UI-03), plan building
// on the map by mouse (UC-5), live validation, preview, commit with Enter.
import { useEffect, useRef, useState } from "react";
import type { Api, AnyCommand, BoardView, LegalChoices, ValidationResult } from "../api.ts";
import { words } from "../common/names.ts";
import { previewLine } from "../log/plain.ts";
import { EligibilityTrack } from "./EligibilityTrack.tsx";
import { Fields, PlanForm } from "./PlanForm.tsx";
import { dragMode, perLocation, toCommand, type Draft, type PlanEvent, type PlanState, type Values } from "./plan.ts";

export interface FactionPanelProps {
  readonly api: Api;
  readonly sessionId: string;
  readonly view: BoardView;
  readonly legal: LegalChoices;
  /** The map-built part of the plan (spaces, values, moves), shared with the board. */
  readonly plan: PlanState;
  readonly dispatch: (event: PlanEvent) => void;
  readonly onCommit: (command: AnyCommand) => void;
  readonly onDraft: (command: AnyCommand | null) => void;
}

const OP_BOXES = ["limitedOp", "opOnly", "opSa"];

export function FactionPanel({ api, sessionId, view, legal, plan, dispatch, onCommit, onDraft }: FactionPanelProps) {
  const resume = view.status.pending?.resume;
  const faction = legal.faction ?? "";
  const actions = legal.actions ?? [];
  const [box, setBox] = useState<string | null>(resume?.box ?? null);
  const [op, setOp] = useState<string | null>(resume?.op ?? null);
  const [sa, setSa] = useState<string | null>(null);
  const [saTiming, setSaTiming] = useState<"before" | "after">("after");
  const [subSpaces, setSubSpaces] = useState<readonly string[]>([]);
  const [subValues, setSubValues] = useState<Readonly<Record<string, Values>>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);
  useEffect(() => {
    if (resume !== undefined) {setBox(resume.box); setOp(resume.op); setSa(null);}
  }, [view.status.pending?.id]);
  const form = actions.find((a) => a.id === op);
  const sub = form?.subAction ?? null;
  const saForm = actions.find((a) => a.id === sa);
  const locations = plan.op.locations;
  const draft: Draft | null =
    box === null || op === null
      ? null
      : {
          box, op, plan,
          sa: sa === null ? null : { action: sa, timing: saForm?.timing ?? saTiming },
          subActions: sub === null ? [] : subSpaces.filter(s => locations.includes(s)).map(space => ({action: sub.id, space, params: perLocation(sub.fields, subValues[space] ?? {}) as Record<string, number>})),
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

  // Drags on the map add moves only for an action that moves pieces (UC-5).
  useEffect(() => {
    dispatch({ type: "modes", op: dragMode(form?.fields, op), sa: dragMode(saForm?.fields, sa) });
  }, [op, sa]);

  const clear = (): void => {
    setBox(resume?.box ?? null);
    setOp(resume?.op ?? null);
    setSa(null);
    setSaTiming("after");
    setSubSpaces([]);
    setSubValues({});
    dispatch({ type: "reset" });
  };
  // The key listener is registered once and reads the latest render through this ref, so a key
  // pressed right after a validation result arrives never sees an older plan.
  const latest = useRef({ command, result, onCommit, clear });
  latest.current = { command, result, onCommit, clear };
  // Enter commits a valid plan and Esc clears it, anywhere on the page except the note bar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.tagName === "TEXTAREA") return;
      const { command, result, onCommit, clear } = latest.current;
      if (e.key === "Escape") clear();
      // Enter commits only from the page itself. Buttons and map spaces keep Enter for their own action.
      if (target !== null && target !== document.body) return;
      if (e.key === "Enter" && command !== null && result?.ok === true) {
        e.preventDefault();
        onCommit(command);
        clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, []);
  const pickBox = (b: string): void => {
    if (b === "pass") onCommit({ type: "Pass", faction });
    else if (b !== "event") setBox(b);
  };

  const spaceName = (id: string): string => view.spaces.find((s) => s.id === id)?.name ?? words(id);
  /** "OK in A, B, C and 2 more": names, with a long list cut so the plan stays in view (UC-9). */
  const where = (ids: readonly string[]): string => {
    const names = ids.map(spaceName);
    return names.length <= 4 ? names.join(", ") : `${names.slice(0, 3).join(", ")} and ${String(names.length - 3)} more`;
  };
  return (
    <section className="panel" aria-label="Faction panel">
      <h3>
        {words(faction)} <span className="muted">{legal.first === true ? "First Eligible" : "Second Eligible"}</span>
      </h3>
      <p className="hint" aria-live="polite">
        {box === null
          ? "Step 1: pick a box. For the Event, use the card panel above."
          : op === null
            ? "Step 2: pick an Operation."
            : locations.length === 0
              ? "Step 3: build the plan on the map (see below)."
              : result?.ok === true
                ? "Step 4: check the preview, then Commit."
                : "Fix the problems shown below, or change the plan."}
      </p>
      {view.status.pending?.resume !== undefined && <p role="status">{view.status.pending.prompt}</p>}
      <EligibilityTrack legal={legal} view={view} picked={box} onPick={pickBox} />
      {box !== null && OP_BOXES.includes(box) && (
        <ul aria-label="Operations">
          {actions.filter((a) => a.kind === "op").map((a) => (
            <li key={a.id}>
              <button type="button" disabled={!a.ok && box !== "opSa"} title={a.ok || box !== "opSa" ? a.summary : `${a.summary} No legal standalone plan; a preceding SA may make one.`} aria-pressed={op === a.id} onClick={() => { setOp(a.id); }}>
                {a.label}
              </button>{" "}
              <span className="muted">{a.cost}</span> {a.ok ? <span title={a.locations.map(spaceName).join(", ")}>OK{a.locations.length === 0 ? "" : ` in ${where(a.locations)}`}</span> : <span className="bad">{a.reason}</span>}
            </li>
          ))}
        </ul>
      )}
      {form !== undefined && (
        <>
          {box === "opSa" && (
            <div className="row" role="group" aria-label="SA">
              <span className="stepper-label">SA</span>
              {actions.filter((a) => a.kind === "sa").map((a) => (
                <button key={a.id} type="button" title={a.summary} aria-pressed={sa === a.id} onClick={() => { setSa(sa === a.id ? null : a.id); dispatch({ type: "clear", side: "sa" }); }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {saForm !== undefined && saForm.timing === undefined && (
            <div className="row" role="group" aria-label="SA timing">
              <span className="stepper-label">SA timing</span>
              <button type="button" aria-pressed={saTiming === "before"} onClick={() => { setSaTiming("before"); }}>
                Before the Op
              </button>
              <button type="button" aria-pressed={saTiming === "after"} onClick={() => { setSaTiming("after"); }}>
                After the Op
              </button>
            </div>
          )}
          <PlanForm view={view} faction={faction} op={form} sa={saForm} plan={plan} dispatch={dispatch} />
          {form.subAction !== null && locations.length > 0 && (
            <div className="row" role="group" aria-label="Sub-action">
              <span className="stepper-label">{words(form.subAction.id)} in</span>
              {locations.map((loc) => (
                <button key={loc} type="button" aria-pressed={subSpaces.includes(loc)} onClick={() => { setSubSpaces(subSpaces.includes(loc) ? subSpaces.filter(s => s !== loc) : (form.subAction?.maxSpaces ?? 1) === 1 ? [loc] : [...subSpaces, loc].slice(-(form.subAction?.maxSpaces ?? 1))); }}>
                  {view.spaces.find((s) => s.id === loc)?.name ?? words(loc)}
                </button>
              ))}
              {subSpaces.filter(s => locations.includes(s)).map(space => <Fields key={space} at={view.spaces.find(s => s.id === space)?.name ?? words(space)} fields={sub?.fields ?? []} values={subValues[space] ?? {}} onChange={(k, v) => { setSubValues({...subValues, [space]: {...subValues[space], [k]: v}}); }} />)}
            </div>
          )}
        </>
      )}
      {result !== null && (
        <div aria-label="Validation">
          {result.violations.map((v, i) => (
            <p key={i} className="bad">
              {v.location === null ? "" : `${spaceName(v.location)}: `}
              {v.message} {v.ruleRef === null ? "" : `(${v.ruleRef})`}
            </p>
          ))}
          {result.ok && (
            <ul aria-label="Preview">
              {result.preview.effects.map((e, i) => <li key={i}>{previewLine(e, view)}</li>)}
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
        <button type="button" disabled={resume !== undefined} onClick={() => { onCommit({ type: "Pass", faction }); }}>
          Pass
        </button>
      </div>
    </section>
  );
}
