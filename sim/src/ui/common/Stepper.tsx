// Count picker with - and + buttons (UC-5): no typed numbers. "" is the unset value; with `blank`
// it shows that word (such as "max") and - from the minimum returns to it.
export interface StepperProps {
  readonly label: string;
  /** Full accessible name when the label repeats (one stepper per space); default: the label. */
  readonly name?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly min?: number;
  readonly max?: number;
  /** Word for the unset value; absent: unset shows the minimum. */
  readonly blank?: string;
}

export function Stepper({ label, name = label, value, onChange, min = 0, max, blank }: StepperProps) {
  const n = value === "" ? null : Number(value);
  const down = (): void => {
    if (n === null) return;
    onChange(n <= min ? (blank === undefined ? String(min) : "") : String(n - 1));
  };
  const up = (): void => {
    const next = n === null ? (blank === undefined ? min + 1 : min) : n + 1;
    if (max === undefined || next <= max) onChange(String(next));
  };
  return (
    <span className="stepper" role="group" aria-label={name}>
      <span className="stepper-label">{label}</span>
      <button type="button" aria-label={`Less ${name}`} disabled={n === null || (blank === undefined && n <= min)} onClick={down}>
        −
      </button>
      <output aria-live="polite">{n === null ? (blank ?? String(min)) : n}</output>
      <button type="button" aria-label={`More ${name}`} disabled={max !== undefined && n !== null && n >= max} onClick={up}>
        +
      </button>
    </span>
  );
}
