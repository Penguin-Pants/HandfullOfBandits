// Operation and Special Activity handlers by action ID (04 s4.7).
import type { ActionHandler } from "./action.ts";
import { assault } from "./state/assault.ts";
import { garrison } from "./state/garrison.ts";
import { sweep } from "./state/sweep.ts";
import { train } from "./state/train.ts";

export const actionHandlers: Readonly<Record<string, ActionHandler>> = Object.fromEntries([train, garrison, sweep, assault].map((h) => [h.id, h]));
