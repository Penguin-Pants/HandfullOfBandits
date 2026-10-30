// Research 12 s7 adversarial policies for Scenario A. These are screens, not strong opponents.
import type { AnyCommand, GameState, JsonObject, Ruleset } from "../../engine/core/types.ts";
import type { Engine } from "../../engine/index.ts";
import { activeFaction, legalBoxes } from "../../engine/coin/sequence/ct.ts";
import { HOST_OF } from "../../engine/coin/ops/ids.ts";
import { count, markers } from "../../engine/coin/ops/common.ts";
import { neighbors } from "../../engine/core/terms.ts";
import { param } from "../../engine/core/params.ts";
import { emergencyMoves } from "../../engine/coin/propaganda/legitimacy.ts";
import { scriptedPolicy, type Policy } from "../play.ts";

export const strategyNames = ["scripted", "concentration", "civic-action", "emergency-rule", "sanctuary", "concealment", "coerce-only"] as const;
const statePolicies = ["concentration", "civic-action", "emergency-rule"];

/** Every candidate goes through engine validation; opposite-faction seats use the scripted policy. */
export function strategy(name: string): Policy {
  if (!(strategyNames as readonly string[]).includes(name)) throw new RangeError(`Unknown strategy ${name}. Choose ${strategyNames.join(", ")}.`);
  if (name === "scripted") return scriptedPolicy;
  const preferred = statePolicies.includes(name) ? "state" : "pkk";
  return (engine, ruleset, state) => {
    const phase = state.turn.phase === "propaganda" ? ruleset.sequence.propagandaPhases[state.turn.step] : null;
    if (name === "emergency-rule" && phase === "legitimacy") {
      const step = emergencyMoves(ruleset,state)[0];
      if (step !== undefined) return {type: "PropagandaChoice",phase,choice: {emergencyStep: step}};
    }
    if (state.turn.phase === "pivotal" && state.pending?.faction === preferred && preferred === "pkk") {
      const base = ruleset.spaces.find(s => count(state,s.id,"pkkBase") > 0);
      const command = {type: "PlayPivotal",faction: preferred,card: "DK-015",placements: base === undefined ? {} : {[base.id]: param(ruleset,"argk.maxPlace","number")}};
      return engine.validate(ruleset,state,command).ok ? command : scriptedPolicy(engine,ruleset,state);
    }
    const faction = activeFaction(state);
    if (faction !== preferred) return scriptedPolicy(engine,ruleset,state);
    const candidates = proposals(ruleset,state,faction,name);
    const legal = candidates.find(c => engine.validate(ruleset,state,c).ok);
    return legal ?? (name === "coerce-only" ? {type: "Pass",faction} : scriptedPolicy(engine,ruleset,state));
  };
}

function proposals(r: Ruleset, s: GameState, faction: string, name: string): AnyCommand[] {
  const box = ["opOnly","opSa","limitedOp"].find(b => legalBoxes(r,s,faction).includes(b));
  if (box === undefined) return [];
  const out: AnyCommand[] = [];
  const add = (op: string, loc: string, choice: JsonObject = {}, subActions: readonly JsonObject[] = []) => {
    out.push({type: "ChooseOperation",faction,box,plan: {op,locations: [loc],perLocation: {[loc]: choice},sa: null,subActions}});
  };
  const spaces = [...r.spaces];
  if (name === "concentration") {
    spaces.sort((a,b) => count(s,b.id,"guerrilla")-count(s,a.id,"guerrilla"));
    for (const loc of spaces) if (count(s,loc.id,"guerrilla","active") + count(s,loc.id,"pkkBase") > 0) add("state.assault",loc.id);
    for (const loc of spaces) if (count(s,loc.id,"guerrilla","underground") > 0) {
      const moves = neighbors(r,loc.id).filter(from => count(s,from,"troops") > 0).map(from => ({from,count: count(s,from,"troops")}));
      add("state.sweep",loc.id,{moves});
    }
    for (const loc of spaces) add("state.train",loc.id,{option: "place",troops: Math.min(param(r,"train.maxPlace","number"),s.pools["troops"]?.available ?? 0)});
  } else if (name === "civic-action") {
    spaces.sort((a,b) => security(s,a.id)-security(s,b.id));
    for (const loc of spaces) add("state.train",loc.id,{option: "place",police: 1},[{action: "civicAction",space: loc.id,params: {shifts: 1,coercion: markers(s,loc.id,"coercion"),reception: markers(s,loc.id,"reception")}}]);
  } else if (name === "sanctuary") {
    for (const loc of spaces.filter(x => Object.hasOwn(HOST_OF,x.id))) {
      add("pkk.rally",loc.id,{option: "base"});
      add("pkk.rally",loc.id,{option: "grow"});
      add("pkk.rally",loc.id,{option: "place"});
    }
  } else if (name === "concealment") {
    for (const loc of spaces) if (count(s,loc.id,"guerrilla","active") > 0) add("pkk.rally",loc.id,{option: "flip"});
    for (const loc of spaces.filter(x => count(s,x.id,"pkkBase") > 0)) {
      for (const from of neighbors(r,loc.id)) if (count(s,from,"guerrilla","active") > 0) add("pkk.march",loc.id,{moves: [{from,count: count(s,from,"guerrilla","active"),face: "active"}]});
      add("pkk.rally",loc.id,{option: "grow"});
    }
  } else if (name === "coerce-only") {
    for (const loc of spaces) add("pkk.coerce",loc.id);
  }
  return out;
}
function security(s: GameState, loc: string): number {return count(s,loc,"troops")+count(s,loc,"police")+count(s,loc,"guards");}

/** Resolve the remaining part of a saved Op without re-running its SA (DEC-54, DEC-56). */
export function resumeOperation(engine: Engine, r: Ruleset, s: GameState): AnyCommand | null {
  const pending = s.pending;
  if (pending?.resume === undefined) return null;
  const {op,box} = pending.resume;
  for (const space of r.spaces) {
    const choices: JsonObject[] = op === "pkk.rally" ? [{option: "place"},{option: "flip"},{option: "grow"},{option: "base"}] : neighbors(r,space.id).flatMap(from => ["underground","active"].map(face => ({moves: [{from,count: 1,face}]})));
    for (const choice of choices) {
      const c = {type: "ChooseOperation",faction: pending.faction,box,plan: {op,locations: [space.id],perLocation: {[space.id]: choice},sa: null}};
      if (engine.validate(r,s,c).ok) return c;
    }
  }
  throw new Error(`No legal replacement for ${op} after Host Pressure; seed ${String(s.meta.seed)}.`);
}

/** Which seat's policy handles a Propaganda decision when no faction is active. */
export function decisionFaction(r: Ruleset, s: GameState): string | null {
  if (s.pending !== null) return s.pending.faction;
  const faction = activeFaction(s);
  if (faction !== null) return faction;
  const phase = s.turn.phase === "propaganda" ? r.sequence.propagandaPhases[s.turn.step] : null;
  return phase === "agitation" ? "pkk" : "state";
}
