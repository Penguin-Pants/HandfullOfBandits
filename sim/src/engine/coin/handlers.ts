// Production command handlers by command type (05 s3).
import type { CommandHandler } from "../core/types.ts";
import { passHandler } from "./sequence/pass.ts";

export const coinHandlers: Readonly<Record<string, CommandHandler>> = {
  Pass: passHandler,
};
