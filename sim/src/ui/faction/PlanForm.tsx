// Plan form (UC-5): the spaces, moves and choices of one action and its SA, all by mouse. Map
// clicks pick spaces, a drag on the map adds a move, steppers set counts, buttons set choices.
import type { BoardView, FormField } from "../api.ts";
import { words } from "../common/names.ts";
import { Stepper } from "../common/Stepper.tsx";
import { dragMode, type PlanEvent, type PlanState, type Side, type Values } from "./plan.ts";

/** Choice buttons for a fixed list of options; the pressed one is the value. */
export function Choice({ label, name = label, options, value, onChange }: { readonly label: string; readonly name?: string; readonly options: readonly string[]; readonly value: string; readonly onChange: (v: string) => void }) {
  return (
    <span className="choice" role="group" aria-label={name}>
      <span className="stepper-label">{label}</span>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={() => { onChange(value === o ? "" : o); }}>
          {words(o)}
        </button>
      ))}
    </span>
  );
}

/** One location's choices: buttons for options, steppers for numbers. Moves come from the map. */
export function Fields({ fields, values, onChange, at }: { readonly fields: readonly FormField[]; readonly values: Values; readonly onChange: (key: string, value: string) => void; readonly at?: string }) {
  const name = (label: string): string => (at === undefined ? label : `${at} ${label}`);
  return fields.map((f) =>
    f.kind === "select" ? (
      <Choice key={f.key} label={f.label} name={name(f.label)} options={f.options ?? []} value={values[f.key] ?? ""} onChange={(v) => { onChange(f.key, v); }} />
    ) : f.kind === "number" ? (
      <Stepper key={f.key} label={f.label} name={name(f.label)} value={values[f.key] ?? ""} onChange={(v) => { onChange(f.key, v); }} {...(f.blank === undefined ? {} : { blank: f.blank })} />
    ) : null,
  );
}

export interface PlanFormProps {
  readonly view: BoardView;
  readonly faction: string;
  readonly op: { readonly id: string; readonly label: string; readonly fields: readonly FormField[] };
  readonly sa?: { readonly id: string; readonly label: string; readonly fields: readonly FormField[] } | undefined;
  readonly plan: PlanState;
  readonly dispatch: (event: PlanEvent) => void;
}

export function PlanForm({ view, faction, op, sa, plan, dispatch }: PlanFormProps) {
  const name = (id: string): string => view.spaces.find((s) => s.id === id)?.name ?? words(id);
  /** Faces this faction's mobile pieces can show, from the piece data: a preceding SA can flip
   * pieces, so the faces at the origin now are not the limit. */
  const faces = [...new Set(view.forces.filter((p) => p.faction === faction && !p.isBase).flatMap((p) => p.states))];
  const part = (side: Side, form: NonNullable<PlanFormProps["sa"]>) => {
    const p = plan[side];
    const mode = dragMode(form.fields, form.id);
    const target = plan.target === side;
    return (
      <div aria-label={side === "op" ? "Plan" : "SA plan"} className="plan-part">
        <p className="hint">
          <strong>{form.label}:</strong>{" "}
          {target
            ? mode === null
              ? "click spaces on the map (Shift-click adds more)."
              : "drag on the map from a space to the destination of the pieces. Each drag adds 1 piece."
            : "click the button above to build this part on the map."}
        </p>
        {p.locations.length === 0 && <p className="muted">No spaces yet.</p>}
        {p.locations.map((loc) => (
          <div key={loc} className="plan-loc">
            <div className="row">
              <strong>{name(loc)}</strong>
              <Fields fields={form.fields} at={name(loc)} values={p.values[loc] ?? {}} onChange={(key, value) => { dispatch({ type: "value", side, loc, key, value }); }} />
            </div>
            {(p.moves[loc] ?? []).map((m, index) => {
              const label = `${name(m.from)} to ${name(m.to ?? loc)}`;
              const options = faces.length > 1 ? faces : [];
              return (
                <div key={`${m.from}-${m.to ?? ""}-${String(index)}`} className="row plan-move" aria-label={`Move ${label}`}>
                  <span>
                    {name(m.from)} → {name(m.to ?? loc)}
                  </span>
                  <Stepper label="Pieces" name={`Pieces ${label}`} value={String(m.count)} onChange={(v) => { dispatch({ type: "move", side, loc, index, count: Number(v) }); }} />
                  {options.length > 0 && <Choice label="Face" name={`Face ${label}`} options={options} value={m.face ?? ""} onChange={(v) => { dispatch({ type: "move", side, loc, index, count: m.count, face: v === "" ? null : v }); }} />}
                  <button type="button" aria-label={`Remove move ${label}`} onClick={() => { dispatch({ type: "move", side, loc, index, count: 0 }); }}>
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="plan-form">
      {sa !== undefined && (
        <div className="row" role="group" aria-label="Map builds">
          <span>Map builds:</span>
          <button type="button" aria-pressed={plan.target === "op"} onClick={() => { dispatch({ type: "target", target: "op" }); }}>
            {op.label} spaces
          </button>
          <button type="button" aria-pressed={plan.target === "sa"} onClick={() => { dispatch({ type: "target", target: "sa" }); }}>
            {sa.label} spaces
          </button>
        </div>
      )}
      {part("op", op)}
      {sa !== undefined && part("sa", sa)}
    </div>
  );
}
