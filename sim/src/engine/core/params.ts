// Parameter access (04 s4.5, 11 P1-08). A handler reads a game number only through its
// parameter ID, never as a literal (lint rule local/no-game-literals). A wrong ID or kind
// is a defect in the handler (package data is validated on load), so it throws.
import type { ParamValue, Ruleset } from "./types.ts";

interface ParamKinds {
  readonly number: number;
  readonly string: string;
  readonly list: readonly (number | string)[];
}

function kindOf(value: ParamValue): keyof ParamKinds {
  if (Array.isArray(value)) return "list";
  return typeof value === "number" ? "number" : "string";
}

/** The value of parameter `id`, which must be of `kind`. */
export function param<K extends keyof ParamKinds>(ruleset: Ruleset, id: string, kind: K): ParamKinds[K] {
  if (!Object.hasOwn(ruleset.parameters, id)) throw new RangeError(`Unknown parameter "${id}"`);
  const value = ruleset.parameters[id] ?? null;
  if (value === null) throw new RangeError(`Parameter "${id}" has no value`);
  const actual = kindOf(value);
  if (actual !== kind) throw new TypeError(`Parameter "${id}" must be a ${kind}, got ${actual}`);
  return value as ParamKinds[K];
}
