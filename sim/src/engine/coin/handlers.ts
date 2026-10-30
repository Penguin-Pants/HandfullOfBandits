// Production command handlers by command type (05 s3).
import type { CommandHandler } from "../core/types.ts";
import { advanceHandler } from "./advance.ts";
import { chooseEventHandler } from "./event-command.ts";
import { chooseOperationHandler } from "./ops/choose-operation.ts";
import { propagandaChoiceHandler } from "./propaganda/pipeline.ts";
import { playPivotalHandler, pivotalDecisionHandler } from "./pivotal.ts";
import { passHandler } from "./sequence/pass.ts";

export const coinHandlers: Readonly<Record<string, CommandHandler>> = {
  Pass: passHandler,
  PlayPivotal: playPivotalHandler,
  ResolveDecision: pivotalDecisionHandler,
  ChooseOperation: chooseOperationHandler,
  ChooseEvent: chooseEventHandler,
  Advance: advanceHandler,
  PropagandaChoice: propagandaChoiceHandler,
};
