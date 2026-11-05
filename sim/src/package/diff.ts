// Package diff (04 s10.1 item 3; 11 P4-05). Pure: compares two loaded packages by element ID.
// Handlers are what the package selects from the app's code: the sequence model, the Propaganda
// phase list and the procedures and modifiers that card effects name. Operations and SAs are code.
import { canonicalJson } from "../engine/core/canonical.ts";
import { packageContent } from "./load.ts";
import type { PackageData } from "./validate.ts";

export interface Changes<Item, Changed> {
  readonly added: readonly Item[];
  readonly removed: readonly Item[];
  readonly changed: readonly Changed[];
}
export interface ParameterChange { readonly id: string; readonly fields: readonly string[]; readonly from: unknown; readonly to: unknown }
export interface HandlerUse { readonly id: string; readonly where: string }
export interface ValueChange { readonly id: string; readonly from: string; readonly to: string }

export interface PackageDiff {
  readonly parameters: Changes<{ readonly id: string; readonly value: unknown }, ParameterChange>;
  readonly cards: Changes<{ readonly id: string; readonly file: string }, { readonly id: string; readonly fields: readonly string[] }>;
  readonly handlers: Changes<HandlerUse, ValueChange>;
  readonly modules: Changes<string, ValueChange>;
  /** Files outside parameters and cards whose content differs, for example a scenario. */
  readonly otherFiles: readonly string[];
}

/** An absent field equals only an absent field. */
const same = (a: unknown, b: unknown): boolean => (a === undefined || b === undefined ? a === b : canonicalJson(a) === canonicalJson(b));
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Dotted paths of the fields that differ, two levels deep (card sides). Lists compare whole. */
function changedFields(a: unknown, b: unknown, depth = 2, at = ""): string[] {
  if (same(a, b)) return [];
  if (depth === 0 || !isRecord(a) || !isRecord(b)) return [at];
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  return keys.flatMap((k) => changedFields(a[k], b[k], depth - 1, at === "" ? k : `${at}.${k}`));
}

/** Added, removed and changed entries of two maps keyed by ID. */
function compare<T, Item, Changed>(old: ReadonlyMap<string, T>, next: ReadonlyMap<string, T>, item: (id: string, v: T) => Item, change: (id: string, a: T, b: T) => Changed | null): Changes<Item, Changed> {
  const ids = (m: ReadonlyMap<string, T>): string[] => [...m.keys()].sort();
  return {
    added: ids(next).filter((id) => !old.has(id)).map((id) => item(id, next.get(id) as T)),
    removed: ids(old).filter((id) => !next.has(id)).map((id) => item(id, old.get(id) as T)),
    changed: ids(old).flatMap((id) => {
      const b = next.get(id);
      const c = b === undefined ? null : change(id, old.get(id) as T, b);
      return c === null ? [] : [c];
    }),
  };
}

function cardsOf(data: PackageData): Map<string, { readonly file: string; readonly card: unknown }> {
  return new Map(Object.entries(data.cards).flatMap(([file, list]) => list.map((card) => [card.id, { file, card }] as const)));
}

/** Every `procedure` and `addModifier` effect anywhere in a card, as `kind id`. */
function cardHandlers(card: unknown, found: Set<string>): Set<string> {
  if (Array.isArray(card)) for (const v of card) cardHandlers(v, found);
  else if (isRecord(card)) {
    if (card["type"] === "procedure" && typeof card["id"] === "string") found.add(`procedure ${card["id"]}`);
    if (card["type"] === "addModifier" && typeof card["id"] === "string") found.add(`modifier ${card["id"]}`);
    for (const v of Object.values(card)) cardHandlers(v, found);
  }
  return found;
}

/** Handler selections with where the package makes them: card IDs, or `sequence.yaml`. */
function handlersOf(data: PackageData): Map<string, string> {
  const uses = new Map<string, string[]>(data.sequence.propagandaPhases.map((p) => [`propaganda phase ${p}`, ["sequence.yaml"]]));
  for (const [id, { card }] of [...cardsOf(data)].sort(([a], [b]) => a.localeCompare(b))) {
    for (const h of cardHandlers(card, new Set())) uses.set(h, [...(uses.get(h) ?? []), id]);
  }
  return new Map([...uses].map(([h, where]) => [h, where.join(", ")]));
}

function modulesOf(data: PackageData): Map<string, string> {
  return new Map(data.manifest.modules.map((m) => { const at = m.lastIndexOf("@"); return [m.slice(0, at), m.slice(at + 1)]; }));
}

export function diffPackages(old: PackageData, next: PackageData): PackageDiff {
  const params = (d: PackageData) => new Map(d.parameters.map((p) => [p.id, p]));
  const parameters = compare(params(old), params(next), (id, p) => ({ id, value: p.value }), (id, a, b) => {
    const fields = changedFields(a, b, 1);
    return fields.length === 0 ? null : { id, fields, from: a.value, to: b.value };
  });
  const cards = compare(cardsOf(old), cardsOf(next), (id, c) => ({ id, file: c.file }), (id, a, b) => {
    const fields = [...(a.file === b.file ? [] : [`file ${a.file} to ${b.file}`]), ...changedFields(a.card, b.card)];
    return fields.length === 0 ? null : { id, fields };
  });
  const listed = compare(handlersOf(old), handlersOf(next), (id, where) => ({ id, where }), () => null);
  const order = (d: PackageData): string => d.sequence.propagandaPhases.join(", ");
  const handlers = {
    ...listed,
    changed: [
      ...(order(old) === order(next) ? [] : [{ id: "propaganda phase order", from: order(old), to: order(next) }]),
      ...(old.sequence.model === next.sequence.model ? [] : [{ id: "sequence model", from: old.sequence.model, to: next.sequence.model }]),
    ],
  };
  const modules = compare(modulesOf(old), modulesOf(next), (id, major) => `${id}@${major}`, (id, from, to) => (from === to ? null : { id, from, to }));
  const [a, b] = [packageContent(old), packageContent(next)];
  const otherFiles = [...new Set([...Object.keys(a), ...Object.keys(b)])]
    .filter((f) => f !== "parameters.yaml" && !f.startsWith("cards/") && !same(a[f], b[f]))
    .sort();
  return { parameters, cards, handlers, modules, otherFiles };
}
