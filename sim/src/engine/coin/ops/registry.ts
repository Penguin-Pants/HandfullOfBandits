// Operation and Special Activity handlers by action ID (04 s4.7).
import type { ActionHandler } from "./action.ts";
import { attack } from "./pkk/attack.ts";
import { coerce } from "./pkk/coerce.ts";
import { march } from "./pkk/march.ts";
import { rally } from "./pkk/rally.ts";
import { airMobility } from "./sa/air-mobility.ts";
import { ambush } from "./sa/ambush.ts";
import { diplomacy, hostPressure } from "./sa/host-actions.ts";
import { crossBorder } from "./sa/cross-border.ts";
import { extort } from "./sa/extort.ts";
import { strikeCollaborators } from "./sa/strike-collaborators.ts";
import { assault } from "./state/assault.ts";
import { garrison } from "./state/garrison.ts";
import { sweep } from "./state/sweep.ts";
import { train } from "./state/train.ts";

export const actionHandlers: Readonly<Record<string, ActionHandler>> = Object.fromEntries([crossBorder, diplomacy, hostPressure, train, garrison, sweep, assault, rally, march, attack, coerce, airMobility, ambush, extort, strikeCollaborators].map((h) => [h.id, h]));
