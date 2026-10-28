// Log entry builder (05 s10). Every engine entry carries its kind, the stateSeq it belongs to,
// its rule and PA refs and a data body. The store adds entryId and the action ID (06 s3.6).
import type { AssumptionRef, GameState, JsonValue, LogEntry, LogKind, RuleRef } from "./types.ts";

export function logEntry(
  state: GameState,
  kind: LogKind,
  data: Readonly<Record<string, JsonValue>>,
  ruleRef: RuleRef | null = null,
  assumptionRef: AssumptionRef | null = null,
): LogEntry {
  return { kind, stateSeq: state.meta.stateSeq, ruleRef, assumptionRef, data };
}
