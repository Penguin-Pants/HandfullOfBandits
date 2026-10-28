// Train (research 06 s2.1): per selected space one of three options, then optional Civic Action in
// one selected space (07 s1.3).
import { stackingRoom } from "../../../core/effects/common.ts";
import { param } from "../../../core/params.ts";
import type { GameState, Ruleset, Violation } from "../../../core/types.ts";
import { at, type ActionHandler, type ActionOptions, type ActionPart } from "../action.ts";
import { controlOf, count, isTerrain, pay, space } from "../common.ts";
import { FACTION, FLAG, PIECE, TERRAIN } from "../ids.ts";
import { asCount, asString } from "../plan.ts";
import { civicCost, civicExecute, civicViolations, readCivic, type CivicSpend } from "./civic-action.ts";

const ruleRef = "06 s2.1";
const CIVIC = "civicAction";

type Choice = { option: "place"; troops: number; police: number } | { option: "guards"; count: number } | { option: "base" };

function read(part: ActionPart, location: string): Choice | null {
  const o = part.perLocation[location] ?? {};
  const option = asString(o["option"]);
  if (option === "place") {
    const troops = asCount(o["troops"]);
    const police = asCount(o["police"]);
    return troops === null || police === null ? null : { option, troops, police };
  }
  if (option === "guards") {
    const n = asCount(o["count"]);
    return n === null ? null : { option, count: n };
  }
  return option === "base" ? { option } : null;
}

function civic(options: ActionOptions): { space: string; spend: CivicSpend | null }[] {
  return options.subActions.filter((s) => s.action === CIVIC).map((s) => ({ space: s.space, spend: readCivic(s.params) }));
}

export const train: ActionHandler = {
  id: "state.train",
  faction: FACTION.state,
  kind: "op",
  ruleRef,
  accompanies: [],
  check(ruleset, state, part, options) {
    const out: Violation[] = [];
    const need = new Map<string, number>();
    const add = (piece: string, n: number): void => { need.set(piece, (need.get(piece) ?? 0) + n); };
    for (const loc of part.locations) {
      const v = (code: string, message: string): void => { out.push(at(loc, code, message, ruleRef)); };
      if (space(ruleset, loc)?.kind !== "domestic") {
        v("trainDomestic", "Train selects domestic spaces.");
        continue;
      }
      const choice = read(part, loc);
      if (choice === null) {
        v("trainOption", "Choose option place (troops, police), guards (count) or base.");
        continue;
      }
      const mountainOrPlain = isTerrain(ruleset, loc, TERRAIN.mountain, TERRAIN.plain);
      const controlled = controlOf(ruleset, state, loc) === FACTION.state;
      if (choice.option === "place") {
        const n = choice.troops + choice.police;
        const max = param(ruleset, "train.maxPlace", "number");
        if (!isTerrain(ruleset, loc, TERRAIN.city) && count(state, loc, PIECE.stateBase) === 0) v("trainPlaceWhere", "Place needs a City or a State Base.");
        if (n < 1 || n > max) v("trainPlaceCount", `Place 1 to ${String(max)} Troops and Police.`);
        add(PIECE.troops, choice.troops);
        add(PIECE.police, choice.police);
      } else if (choice.option === "guards") {
        const max = param(ruleset, "train.maxGuards", "number");
        if (state.flags[FLAG.law3175] !== true) v("trainGuardsLaw", "Village Guards need the Law 3175 event (06 s2.1 item 2).");
        if (!mountainOrPlain || !controlled || count(state, loc, PIECE.police) === 0) v("trainGuardsWhere", "Guards need a Mountain or Plain space with State Control and Police.");
        if (choice.count < 1 || choice.count > max) v("trainGuardsCount", `Place 1 to ${String(max)} Village Guards.`);
        if (choice.count > stackingRoom(ruleset, state, loc, PIECE.guards)) v("trainGuardsStacking", "Guard stacking limit (03 s5 item 4).");
        add(PIECE.guards, choice.count);
      } else {
        const police = param(ruleset, "train.baseFromPolice", "number");
        if (!mountainOrPlain || !controlled) v("trainBaseWhere", "A Base needs a Mountain or Plain space with State Control.");
        if (count(state, loc, PIECE.police) < police) v("trainBasePolice", `A Base replaces ${String(police)} Police.`);
        if (count(state, loc, PIECE.stateBase) >= param(ruleset, "train.baseLimit", "number")) v("trainBaseLimit", "The space has too many State Bases.");
        add(PIECE.stateBase, 1);
      }
    }
    for (const [piece, n] of need) {
      const available = state.pools[piece]?.available ?? 0;
      if (n > available) out.push(at(null, "trainSupply", `${String(n)} ${piece} needed, ${String(available)} Available.`, ruleRef));
    }
    const civics = civic(options);
    if (civics.length > 1 || options.subActions.length > civics.length) out.push(at(null, "trainSubAction", "Train allows one Civic Action in one space.", ruleRef));
    for (const c of civics) {
      if (!part.locations.includes(c.space)) out.push(at(c.space, "civicNotSelected", "Civic Action must be in a Train space.", ruleRef));
      if (c.spend === null) out.push(at(c.space, "civicBadSpend", "Civic Action spend is not well formed.", "07 s1.3"));
      else out.push(...civicViolations(ruleset, state, c.space, c.spend, false));
    }
    return out;
  },
  cost(ruleset: Ruleset, _state: GameState, part, options) {
    const op = options.free ? 0 : part.locations.length * param(ruleset, "train.costPerSpace", "number");
    return op + civic(options).reduce((sum, c) => sum + (c.spend === null ? 0 : civicCost(ruleset, c.spend)), 0);
  },
  execute(ctx, part, options) {
    for (const loc of part.locations) {
      if (!options.free) pay(ctx, FACTION.state, param(ctx.ruleset, "train.costPerSpace", "number"), ruleRef, loc);
      const choice = read(part, loc);
      const place = (piece: string, n: number): void => {
        if (n > 0) ctx.apply({ type: "placePieces", piece, count: n, space: loc, state: null, ruleRef, assumptionRef: null });
      };
      if (choice?.option === "place") {
        place(PIECE.troops, choice.troops);
        place(PIECE.police, choice.police);
      } else if (choice?.option === "guards") {
        place(PIECE.guards, choice.count);
      } else if (choice?.option === "base") {
        ctx.apply({ type: "removePieces", piece: PIECE.police, state: null, count: param(ctx.ruleset, "train.baseFromPolice", "number"), space: loc, to: "available", ruleRef, assumptionRef: null });
        place(PIECE.stateBase, 1);
      }
    }
    for (const c of civic(options)) if (c.spend !== null) civicExecute(ctx, c.space, c.spend);
  },
};
