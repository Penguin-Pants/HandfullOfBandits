// Operation and Special Activity handlers by action ID (04 s4.7).
import type { ActionHandler } from "./action.ts";
import { attack } from "./pkk/attack.ts";
import { coerce } from "./pkk/coerce.ts";
import { march } from "./pkk/march.ts";
import { rally } from "./pkk/rally.ts";
import { assault } from "./state/assault.ts";
import { garrison } from "./state/garrison.ts";
import { sweep } from "./state/sweep.ts";
import { train } from "./state/train.ts";

export const actionHandlers: Readonly<Record<string, ActionHandler>> = Object.fromEntries([train, garrison, sweep, assault, rally, march, attack, coerce].map((h) => [h.id, h]));
