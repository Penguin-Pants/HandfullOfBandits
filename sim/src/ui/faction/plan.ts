// Plan building helpers (05 s3.1): turn form values into a ChooseOperation command.
import type { AnyCommand, FormField } from "../api.ts";

export type Values = Readonly<Record<string, string>>;

/** "from:count, from:count[:face]" to moves. Null: malformed. */
export function parseMoves(text: string): { from: string; count: number; face?: string }[] | null {
  if (text.trim() === "") return [];
  const out = [];
  for (const part of text.split(",")) {
    const [from = "", n = "", face] = part.trim().split(":");
    const count = Number(n);
    if (from === "" || !Number.isInteger(count) || count < 1) return null;
    out.push(face === undefined ? { from, count } : { from, count, face });
  }
  return out;
}

/** One location's per-location object from its form values. */
export function perLocation(fields: readonly FormField[], values: Values): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.key];
    if (v === undefined || v === "") continue;
    if (f.kind === "number") out[f.key] = Number(v);
    else if (f.kind === "moves") out[f.key] = parseMoves(v) ?? v;
    else out[f.key] = v;
  }
  return out;
}

export interface Draft {
  readonly box: string;
  readonly op: string;
  readonly locations: readonly string[];
  readonly values: Readonly<Record<string, Values>>;
  readonly sa: { readonly action: string; readonly locations: readonly string[]; readonly values: Readonly<Record<string, Values>>; readonly timing: "before" | "after" } | null;
  readonly subAction: { readonly action: string; readonly space: string; readonly params: Readonly<Record<string, number>> } | null;
}

export function toCommand(faction: string, draft: Draft, forms: readonly { id: string; fields: readonly FormField[] }[]): AnyCommand {
  const fields = (id: string): readonly FormField[] => forms.find((f) => f.id === id)?.fields ?? [];
  const per = (id: string, locations: readonly string[], values: Draft["values"]): Record<string, unknown> =>
    Object.fromEntries(locations.map((l) => [l, perLocation(fields(id), values[l] ?? {})]));
  return {
    type: "ChooseOperation",
    faction,
    box: draft.box,
    plan: {
      op: draft.op,
      locations: draft.locations,
      perLocation: per(draft.op, draft.locations, draft.values),
      sa: draft.sa === null ? null : { action: draft.sa.action, locations: draft.sa.locations, perLocation: per(draft.sa.action, draft.sa.locations, draft.sa.values), timing: draft.sa.timing },
      subActions: draft.subAction === null ? [] : [draft.subAction],
    },
  };
}
