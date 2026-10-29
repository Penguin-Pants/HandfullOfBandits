// Plain-language log lines (UI clarity round R1): one short past-tense sentence per stored log
// entry, with display names, the cause when known and before -> after for tracks. Rule and
// assumption references go to `ref` (tooltip), never into the sentence. Built at display time
// from the stored `kind` and `data`, so older sessions read the same way.
import type { BoardView, HistoryEntry } from "../api.ts";
import { counted, words } from "../common/names.ts";
import { guideOf } from "../propaganda/phases.ts";

export interface PlainLine {
  readonly id: string;
  readonly text: string;
  /** Rule and assumption references for the tooltip, or null. */
  readonly ref: string | null;
}

/** Bookkeeping kinds: History shows them, the Last action box does not (R1.7). */
const BOOKKEEPING = new Set(["PhaseStarted", "PhaseEnded", "ValidationPassed", "DecisionOpened", "DecisionAnswered", "RoundMetrics", "StopRuleFlag"]);

type Data = Readonly<Record<string, unknown>>;

function str(value: unknown): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

/** Names from the board view, with the words fallback for IDs it does not know. */
function namer(view: BoardView) {
  const faction = (id: unknown): string => view.factions.find((f) => f.id === id)?.name ?? (id === null || id === undefined ? "no one" : words(str(id)));
  const space = (id: unknown): string => view.spaces.find((s) => s.id === id)?.name ?? words(str(id));
  const track = (id: unknown): string => view.status.tracks.find((t) => t.id === id)?.display ?? words(str(id));
  const owner = (piece: unknown): string | null => {
    const f = view.forces.find((p) => p.piece === piece)?.faction;
    return f === undefined ? null : faction(f);
  };
  const middle = (view.supportLevels.length - 1) / 2;
  const level = (n: unknown): string => {
    const id = typeof n === "number" ? view.supportLevels[middle + n] : undefined;
    return id === undefined ? str(n) : words(id);
  };
  return { faction, space, track, owner, level };
}

function causeText(cause: HistoryEntry["cause"]): string | null {
  if (cause === null) return null;
  if (cause.kind === "event") return `Event "${cause.title}"${cause.side === "Always" ? ", Always line" : `, ${cause.side}`}`;
  if (cause.kind === "action") return cause.label;
  return `${guideOf(cause.id).title} phase`;
}

/** "Underground Guerrilla" style name for a piece on one face. */
function piece(n: number, id: unknown, face: unknown): string {
  const f = str(face);
  const text = counted(n, str(id));
  return f === "" || f === "default" ? text : text.replace(/^(\d+) /, `$1 ${words(f)} `);
}

function sentence(e: HistoryEntry, d: Data, view: BoardView, actor: string | null): string {
  const n = namer(view);
  const why = causeText(e.cause);
  const by = (text: string): string => (why === null ? `${text}.` : `${text} (${why}).`);
  const who = (pieceId: unknown): string => n.owner(pieceId) ?? actor ?? "";
  const lead = (subject: string, rest: string): string => (subject === "" ? rest.charAt(0).toUpperCase() + rest.slice(1) : `${subject} ${rest}`);
  switch (e.kind) {
    case "CardRevealed":
      return `${d["type"] === "propaganda" ? "Propaganda card" : "Card"} "${e.cardTitle ?? str(d["card"])}" revealed.`;
    case "ChoiceMade": {
      // Free-action choices carry no faction (coin/events.ts); the acting faction made them.
      const f = n.faction(d["faction"] ?? actor);
      if (d["box"] !== undefined) {
        const event = d["box"] === "event" && e.cardTitle !== null ? `: "${e.cardTitle}"${d["side"] === undefined ? "" : `, ${str(d["side"])}`}` : "";
        return `${f} chose ${words(str(d["box"]))}${event}.`;
      }
      if (d["choice"] !== undefined) return by(`${f} chose "${str(d["choice"])}"`);
      if (Array.isArray(d["spaces"])) return by(`${f} picked ${(d["spaces"] as unknown[]).map(n.space).join(", ") || "no spaces"}`);
      if (d["freeAction"] !== undefined) return by(`${f} planned a free ${words(str(d["freeAction"]).split(".").pop() ?? "")} in ${(Array.isArray(d["locations"]) ? (d["locations"] as unknown[]) : []).map(n.space).join(", ")}`);
      return by(`${f} made a choice`);
    }
    case "CostPaid": {
      const amount = num(d["amount"]);
      const where = d["location"] === null || d["location"] === undefined ? "" : ` in ${n.space(d["location"])}`;
      return `${n.faction(d["faction"])} spent ${String(amount)} Resource${amount === 1 ? "" : "s"}${why === null ? "" : ` for ${why}`}${where}`;
    }
    case "DieRolled":
      if (d["purpose"] === "attackResult") {
        return `Attack in ${n.space(d["space"])}: rolled ${str(d["roll"])} against ${str(d["guerrillas"])} Guerrillas, ${d["hit"] === true ? "a hit" : "a miss"}.`;
      }
      return by(`Rolled ${str(d["result"] ?? d["roll"] ?? d["picked"])} for ${words(str(d["purpose"]))}`);
    case "ControlChanged":
      return `${n.space(d["space"])}: Control passed from ${n.faction(d["before"])} to ${n.faction(d["after"])}.`;
    case "EligibilityChanged":
      return `Next card: ${n.faction(d["firstEligible"])} is First Eligible, ${n.faction(d["secondEligible"])} is Second Eligible.`;
    case "PhaseStarted":
      return `${d["phase"] === "setup" ? "Setup" : `${guideOf(str(d["phase"])).title} phase`} started.`;
    case "PhaseEnded":
      return `${guideOf(str(d["phase"])).title} phase ended.`;
    case "ValidationPassed":
      return "The move was checked and is legal.";
    case "ScoreCheck": {
      const rows = Array.isArray(d["standings"]) ? (d["standings"] as Data[]) : [];
      return `Victory check: ${rows.map((r) => `${n.faction(r["faction"])} ${str(r["score"])}${r["threshold"] === undefined ? "" : ` of ${str(r["threshold"])}`}`).join(", ")}.`;
    }
    case "GameEnded":
      return `Game over: ${d["winner"] === null || d["winner"] === undefined ? "no winner" : `${n.faction(d["winner"])} wins`}${d["reason"] === undefined ? "" : ` (${words(str(d["reason"]))})`}.`;
    case "StopRuleFlag":
      return `Design note: stop rule ${str(d["rule"])} flagged for ${n.faction(d["faction"])}.`;
    case "Undo":
      return "The last action was undone.";
    case "EffectSkipped":
      return skipped(d, n, why);
    case "EffectApplied":
      return applied(d, n, by, who, lead);
    default:
      return by(words(e.kind));
  }
}

function skipped(d: Data, n: ReturnType<typeof namer>, why: string | null): string {
  const tail = why === null ? "" : ` (${why})`;
  switch (d["effect"]) {
    case "freeAction":
      return `The free ${words(str(d["action"]).split(".").pop() ?? "")} was declined${tail}.`;
    case "legalPolitics":
      return "Legal Politics skipped: Legal Space is Absent.";
    case "victoryCheck":
      return "No victory check in the first Propaganda round.";
    case "revealCard":
      return "No card left to reveal.";
    case "always":
      return `The Always line of "${str(d["card"])}" needs a choice and was skipped.`;
    case "specialActivity": {
      const reasons = str(d["reason"]).split(",").filter((r) => r !== "").map(words);
      return `The ${words(str(d["action"]).split(".").pop() ?? "")} Special Activity was not carried out${reasons.length === 0 ? "" : `: ${reasons.join(", ")}`}.`;
    }
    case "coerceShift":
      return `Coerce could not shift ${n.space(d["space"])}: a marker blocks it.`;
    case "assault":
      return `Assault in ${n.space(d["space"])}: ${str(d["count"])} hit(s) found no target.`;
    default:
      return `${words(str(d["effect"]) || "effect")} skipped${d["reason"] === undefined ? "" : ` (${words(str(d["reason"]))})`}${tail}.`;
  }
}

function applied(d: Data, n: ReturnType<typeof namer>, by: (t: string) => string, who: (p: unknown) => string, lead: (s: string, r: string) => string): string {
  const count = num(d["count"]);
  switch (d["effect"]) {
    case "adjustTrack":
    case "overflow": {
      const delta = num(d["after"]) - num(d["before"]);
      const lost = num(d["lost"]) > 0 ? `, ${str(d["lost"])} over the track limit` : "";
      if (delta === 0) return by(`${n.track(d["track"])} stayed at ${str(d["after"])}${lost === "" ? "" : ` (${lost.slice(2)})`}`);
      return by(`${n.track(d["track"])} ${delta > 0 ? "rose" : "fell"} by ${String(Math.abs(delta))} (${str(d["before"])} → ${str(d["after"])}${lost})`);
    }
    case "setTrack":
    case "stepOrdinal":
      return d["before"] === d["after"]
        ? by(`${n.track(d["track"])} stayed at ${words(str(d["after"]))}`)
        : by(`${n.track(d["track"])} changed from ${words(str(d["before"]))} to ${words(str(d["after"]))}`);
    case "setFlag":
      return by(`${words(str(d["flag"]))} is now ${d["after"] === true ? "in force" : "off"}`);
    case "placePieces":
      return by(lead(who(d["piece"]), `placed ${piece(count, d["piece"], d["face"])} in ${n.space(d["space"])}`));
    case "movePieces": {
      const flipped = d["arrive"] !== undefined && d["arrive"] !== d["face"] ? `, now ${words(str(d["arrive"]))}` : "";
      return by(lead(who(d["piece"]), `moved ${piece(count, d["piece"], d["face"])} from ${n.space(d["from"])} to ${n.space(d["to"])}${flipped}`));
    }
    case "removePieces": {
      const to = d["to"] === undefined || d["to"] === "available" ? "" : ` to ${words(str(d["to"]))}`;
      return by(`${piece(count, d["piece"], d["face"])} removed from ${n.space(d["space"])}${to}`);
    }
    case "setPieceState":
      return by(`${counted(count, str(d["piece"]))} in ${n.space(d["space"])} flipped from ${words(str(d["from"]))} to ${words(str(d["to"]))}`);
    case "placeMarker":
      return by(`${markerName(d)} marker placed in ${n.space(d["space"])}`);
    case "removeMarker":
      return by(`${markerName(d)} marker removed from ${n.space(d["space"])}`);
    case "flipMarker":
      return by(`${words(str(d["marker"]))} marker in ${n.space(d["space"])} flipped from ${words(str(d["from"]))} to ${words(str(d["to"]))}`);
    case "shiftLevel":
      return by(`${n.space(d["space"])} shifted from ${n.level(d["before"])} to ${n.level(d["after"])}`);
    case "transferPool":
      return by(`${counted(count, str(d["piece"]))} moved from ${words(str(d["from"]))} to ${words(str(d["to"]))}`);
    default:
      return by(`${words(str(d["effect"]) || "effect")} applied`);
  }
}

function markerName(d: Data): string {
  const side = d["side"] === undefined || d["side"] === "default" ? "" : ` (${words(str(d["side"]))})`;
  return `${words(str(d["marker"]))}${side}`;
}

function parse(e: HistoryEntry): Data {
  try {
    const d = JSON.parse(e.data) as unknown;
    return typeof d === "object" && d !== null ? (d as Data) : {};
  } catch {
    return {};
  }
}

/**
 * Plain lines for one action's entries. `playerOnly` drops bookkeeping (Last action box). A cost
 * folds in the Resources change that follows it, so "spent 1 Resource ... (5 → 4)" is one line.
 */
export function plainLines(entries: readonly HistoryEntry[], view: BoardView, actor: string | null, playerOnly: boolean): PlainLine[] {
  const out: PlainLine[] = [];
  const data = entries.map(parse);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const d = data[i] ?? {};
    if (e === undefined || (playerOnly && BOOKKEEPING.has(e.kind))) continue;
    const ref = [e.rule_ref, e.assumption_ref === null ? null : `Prototype assumption ${e.assumption_ref}`].filter((r) => r !== null).join(" · ") || null;
    let text = sentence(e, d, view, actor);
    const next = data[i + 1];
    if (e.kind === "CostPaid" && next?.["effect"] === "adjustTrack" && next["track"] === d["track"]) {
      text = `${text} (${str(next["before"])} → ${str(next["after"])}).`;
      i++;
    } else if (e.kind === "CostPaid") {
      text = `${text}.`;
    }
    out.push({ id: e.entry_id, text, ref });
  }
  return out;
}

/** Plain heading for one action, from its faction and box ("PKK took the Event"). */
export function actionTitle(action: { readonly faction: string | null; readonly box: string | null; readonly summary: string; readonly phase: string }, view: BoardView): string {
  const who = view.factions.find((f) => f.id === action.faction)?.name ?? (action.faction === null ? null : words(action.faction));
  if (who === null) return action.phase === "propaganda" ? "Propaganda step" : action.summary.startsWith("Setup") ? "Game set up" : "Game advanced";
  if (action.box === "event") return `${who} took the Event`;
  if (action.box === "pass") return `${who} passed`;
  return action.box === null ? `${who} acted` : `${who} chose ${words(action.box)}`;
}
