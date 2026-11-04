// Rule procedures that a card effect may run by name (`procedure` effect; docs/prototype/31 s8 item 3).
import type { Exec } from "../core/exec.ts";
import { officeLines } from "./propaganda/legal-politics.ts";

export const procedures: Readonly<Record<string, (ctx: Exec) => void>> = {
  "legal.officeLines": officeLines,
};
