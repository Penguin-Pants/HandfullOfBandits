// Candidate plans for every Scenario A decision family (19 s5; 20 Phase 4). The generator reads
// only public state: the runner calls it on a determinized projection of the player's observation
// and then validates each survivor on the live state. Every emitted command passed engine
// validation; legality is never copied here. Pruning is bounded and documented per family below;
// each action family keeps its own cap so one family cannot consume the whole budget.
import { canonicalHash, canonicalJson } from "../engine/core/canonical.ts";
import { param } from "../engine/core/params.ts";
import { neighbors } from "../engine/core/terms.ts";
import type { AnyCommand, FactionId, GameState, JsonObject, JsonValue, Question, Ruleset } from "../engine/core/types.ts";
import type { Engine } from "../engine/index.ts";
import { controlOf, count, isTerrain, markers, resources } from "../engine/coin/ops/common.ts";
import { postureOf } from "../engine/coin/ops/common-pkk.ts";
import { actionHandlers } from "../engine/coin/ops/registry.ts";
import { emergencyMoves } from "../engine/coin/propaganda/legitimacy.ts";
import { activeFaction, BOX, legalBoxes } from "../engine/coin/sequence/ct.ts";

export const GENERATOR_VERSION = "cand-2";

export type DecisionKind = "card" | "pivotal" | "resume" | "upkeep" | "legitimacy" | "civicAction" | "agitation" | "redeployState" | "redeployPkk";

/** What the game needs next. `auto`: one command with no choice (not a fallback, 19 s5). */
export type DecisionPoint =
  | { readonly kind: "auto"; readonly command: AnyCommand; readonly reason: string }
  | { readonly kind: DecisionKind; readonly faction: FactionId }
  | { readonly kind: "none"; readonly reason: string };

export interface Candidate {
  readonly id: string;
  readonly family: string;
  readonly command: AnyCommand;
}

export interface FamilyStats { proposed: number; rejected: number; pruned: number; retained: number }

export interface CandidateSet {
  readonly kind: DecisionKind;
  readonly faction: FactionId;
  readonly candidates: readonly Candidate[];
  readonly families: Readonly<Record<string, FamilyStats>>;
  /** Up to ten rejected proposals with their first violation code (19 s5: rejection is normal). */
  readonly rejected: readonly { readonly family: string; readonly code: string }[];
}

export interface GeneratorOptions {
  /** Retained candidates per family. Broad mode multiplies every bound (20 Phase 4 comparison). */
  readonly familyCap: number;
  readonly broad: boolean;
  /** Redeploy: the State's chosen part, which the PKK part extends. */
  readonly stateRedeploy?: JsonObject;
}

export const DEFAULT_OPTIONS: GeneratorOptions = { familyCap: 14, broad: false };

const AUTO_PHASES = new Set(["victory", "resources", "legalPolitics", "reset"]);
const ZONES = ["kdp-zone", "puk-zone"];
const HOSTS = ["syria-bekaa", "kdp-zone", "puk-zone"];

/** The decision owner for the current state (rules 2.0, 5.3, 6.0). */
export function decisionPoint(engine: Engine, r: Ruleset, s: GameState): DecisionPoint {
  if (s.ended !== null) return { kind: "none", reason: "ended" };
  if (s.turn.phase === "setup") return { kind: "auto", command: { type: "Advance" }, reason: "setup" };
  if (s.turn.phase === "pivotal" && s.pending !== null) return { kind: "pivotal", faction: s.pending.faction };
  if (s.pending?.resume !== undefined) return { kind: "resume", faction: s.pending.faction };
  if (s.turn.phase === "card") {
    const faction = activeFaction(s);
    return faction === null ? { kind: "none", reason: "no active faction on a card" } : { kind: "card", faction };
  }
  if (s.turn.phase === "propaganda") {
    const phase = r.sequence.propagandaPhases[s.turn.step] ?? "";
    if (AUTO_PHASES.has(phase)) return { kind: "auto", command: { type: "Advance" }, reason: phase };
    if (phase === "upkeep") return engine.validate(r, s, { type: "Advance" }).ok ? { kind: "auto", command: { type: "Advance" }, reason: "upkeep paid in full" } : { kind: "upkeep", faction: "state" };
    if (phase === "legitimacy") return emergencyMoves(r, s).length === 0 ? { kind: "auto", command: { type: "Advance" }, reason: "no Emergency Rule move" } : { kind: "legitimacy", faction: "state" };
    if (phase === "civicAction") return { kind: "civicAction", faction: "state" };
    if (phase === "agitation") return { kind: "agitation", faction: "pkk" };
    if (phase === "redeploy") return { kind: "redeployState", faction: "state" };
  }
  return { kind: "none", reason: `no decision rule for phase ${s.turn.phase}` };
}

// ---------------------------------------------------------------- helpers

function combos<T>(items: readonly T[], k: number, cap: number): T[][] {
  const out: T[][] = [];
  const walk = (start: number, acc: T[]): void => {
    if (out.length >= cap) return;
    if (acc.length === k) { out.push([...acc]); return; }
    for (let i = start; i < items.length; i++) walk(i + 1, [...acc, items[i] as T]);
  };
  walk(0, []);
  return out;
}

/** Round-robin merge, so a cap keeps variety across locations. */
/** Atoms reordered so the k-th atom of every option kind precedes the (k+1)-th of any kind. */
function byKindRank(atoms: readonly JsonObject[]): JsonObject[] {
  const rank = new Map<string, number>();
  return atoms.map((a, i) => { const k = JSON.stringify(a["option"] ?? null); const r = rank.get(k) ?? 0; rank.set(k, r + 1); return { a, r, i }; }).sort((x, y) => x.r - y.r || x.i - y.i).map((x) => x.a);
}

/** The first atom of each option kind, so a sub-action variant exists for every kind. */
function firstPerOption(atoms: readonly JsonObject[]): JsonObject[] {
  const seen = new Set<string>();
  return atoms.filter((a) => { const k = JSON.stringify(a["option"] ?? null); if (seen.has(k)) return false; seen.add(k); return true; });
}

function interleave<T>(lists: readonly (readonly T[])[]): T[] {
  const out: T[] = [];
  for (let i = 0; lists.some((l) => i < l.length); i++) for (const l of lists) if (i < l.length) out.push(l[i] as T);
  return out;
}

const domestic = (r: Ruleset): string[] => r.spaces.filter((x) => x.kind === "domestic").sort((a, b) => b.pop - a.pop || a.id.localeCompare(b.id)).map((x) => x.id);
const pop = (r: Ruleset, id: string): number => r.spaces.find((x) => x.id === id)?.pop ?? 0;
const level = (s: GameState, id: string): number => s.spaces[id]?.level ?? 0;
const avail = (s: GameState, piece: string): number => s.pools[piece]?.available ?? 0;
const landLinked = (r: Ruleset, id: string): boolean => !(r.spaces.find((x) => x.id === id)?.tags.includes("noLandLinks") ?? false);

interface Part { locations: string[]; perLocation: Record<string, JsonObject> }
/** `variant` names a sub-family (Civic Action, Agitate) with its own cap, so it is never crowded out. */
interface Plan extends Part { sa: (Part & { action: string; timing: "before" | "after" }) | null; subActions: JsonObject[]; variant?: string }

/** Sub-family of a plan: several locations, Europe, and the political sub-action, each capped separately. */
function variantOf(locations: readonly string[], perLocation: Readonly<Record<string, JsonObject>>, subActions: readonly JsonObject[]): string | null {
  const option = locations.length === 1 ? perLocation[locations[0] ?? ""]?.["option"] : undefined;
  const kind = locations.length > 1 ? "multi" : locations[0] === "europe" ? "europe" : typeof option === "string" && option !== "place" ? option : null;
  const parts = [kind, typeof subActions[0]?.["action"] === "string" ? subActions[0]["action"] : null].filter((x) => x !== null);
  return parts.length === 0 ? null : parts.join("+");
}
const plan = (locations: string[], perLocation: Record<string, JsonObject>, subActions: JsonObject[] = []): Plan => {
  const variant = variantOf(locations, perLocation, subActions);
  return { locations, perLocation, sa: null, subActions, ...(variant === null ? {} : { variant }) };
};

// ---------------------------------------------------------------- Operations

/** Civic Action spend that clears every block, then shifts `shifts` (rules 3.6.1). */
function civicSpend(s: GameState, loc: string, shifts: number): JsonObject {
  return { coercion: markers(s, loc, "coercion"), reception: markers(s, loc, "reception"), stateHarm: markers(s, loc, "stateHarm"), displacement: 0, shifts };
}
/** Agitation spend that clears every block, then shifts `shifts` (rules 3.6.2). */
function agitationSpend(s: GameState, loc: string, shifts: number): JsonObject {
  return { coercion: markers(s, loc, "coercion"), pkkHarm: markers(s, loc, "pkkHarm"), shifts };
}

/**
 * Families split by option, multi-location plans and sub-actions, each with its own cap.
 * Train: per space, mixes of Troops/Police (place), 1-2 Guards, or a Base; optional Civic Action
 * of 1 or 2 shifts in one Train space. Multi-space plans pair the highest-Pop eligible spaces.
 */
function trainPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const law = s.flags["law3175"] === true;
  const atoms = (loc: string): JsonObject[] => {
    const out: JsonObject[] = [];
    if (isTerrain(r, loc, "city") || count(s, loc, "stateBase") > 0) {
      for (const [troops, police] of [[2, 1], [1, 2], [3, 0], [0, 3], [1, 1], [0, 1]] as const) if (troops <= avail(s, "troops") && police <= avail(s, "police")) out.push({ option: "place", troops, police });
    }
    if (law && !isTerrain(r, loc, "city")) out.push({ option: "guards", count: 2 }, { option: "guards", count: 1 });
    if (!isTerrain(r, loc, "city") && count(s, loc, "police") >= 2) out.push({ option: "base" });
    return out;
  };
  const locs = domestic(r).filter((l) => atoms(l).length > 0);
  const civic = (loc: string): JsonObject[] => level(s, loc) >= 2 ? [] : [1, 2].filter((n) => level(s, loc) + n <= 2).map((n) => ({ action: "civicAction", space: loc, params: civicSpend(s, loc, n) }));
  const singles = locs.map((loc) => {
    // Every atom is offered; option kinds are separate capped families (cand-2: no per-space slice).
    const list = byKindRank(atoms(loc)).map((a) => plan([loc], { [loc]: a }));
    for (const a of firstPerOption(atoms(loc))) for (const c of civic(loc)) list.push(plan([loc], { [loc]: a }, [c]));
    return list;
  });
  const out = interleave(singles);
  if (!limited) {
    const most = Math.min(4, Math.floor(resources(r, s, "state") / param(r, "train.costPerSpace", "number")));
    for (let k = 2; k <= most; k++) {
      for (const set of combos(locs, k, 6 * wide)) {
        const per = Object.fromEntries(set.map((l) => [l, atoms(l)[0] ?? {}]));
        out.push(plan(set, per));
        for (const l of set.slice(0, 2)) for (const c of civic(l)) out.push(plan(set, per, [c]));
      }
    }
  }
  return out;
}

/** Garrison: activation in a space with Underground Guerrillas, with 0 or enough Police moved in. */
function garrisonPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const max = param(r, "garrison.maxPolice", "number");
  const targets = domestic(r).filter((l) => landLinked(r, l) && count(s, l, "guerrilla", "underground") > 0);
  const sources = domestic(r).filter((l) => landLinked(r, l) && count(s, l, "police") > 1);
  return interleave(targets.map((t) => {
    const need = count(s, t, "guerrilla", "underground") * (isTerrain(r, t, "mountain") ? 2 : 1) - count(s, t, "police") - count(s, t, "guards");
    const out = [plan([t], { [t]: { moves: [] } })];
    const moves: JsonObject[] = [];
    let moved = 0;
    for (const from of sources.filter((x) => x !== t)) {
      if (moved >= Math.min(max, Math.max(1, need))) break;
      const n = Math.min(count(s, from, "police") - 1, max - moved, Math.max(1, need) - moved);
      if (n > 0) { moves.push({ from, count: n, ...(limited ? {} : { to: t }) }); moved += n; }
    }
    if (moves.length > 0) out.push(plan([t], { [t]: { moves } }));
    return out.slice(0, 2 * wide);
  }));
}

/** Sweep: each target with Underground Guerrillas, with no Troops moved, all adjacent, or half. */
function sweepPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const targets = domestic(r).filter((l) => landLinked(r, l) && count(s, l, "guerrilla", "underground") > 0);
  const movesInto = (t: string, share: number, used: Map<string, number>): JsonObject[] => neighbors(r, t).flatMap((from) => {
    const left = count(s, from, "troops") - (used.get(from) ?? 0);
    const n = Math.floor(left * share);
    if (n < 1 || r.spaces.find((x) => x.id === from)?.kind !== "domestic") return [];
    used.set(from, (used.get(from) ?? 0) + n);
    return [{ from, count: n }];
  });
  const out = interleave(targets.map((t) => [plan([t], { [t]: { moves: movesInto(t, 1, new Map()) } }), plan([t], { [t]: { moves: [] } }), plan([t], { [t]: { moves: movesInto(t, 0.5, new Map()) } })]));
  if (!limited) {
    const most = Math.min(3, Math.floor(resources(r, s, "state") / param(r, "sweep.costPerSpace", "number")));
    for (let k = 2; k <= most; k++) {
      for (const set of combos(targets, k, 4 * wide)) {
        const used = new Map<string, number>();
        out.push(plan(set, Object.fromEntries(set.map((t) => [t, { moves: movesInto(t, 1, used) }]))));
      }
    }
  }
  return out;
}

/** Assault: every space with an Active target, singly, all affordable together, and pairs. */
function assaultPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const targets = domestic(r).filter((l) => count(s, l, "guerrilla", "active") > 0 || (count(s, l, "pkkBase") > 0 && count(s, l, "guerrilla") === 0));
  const out = targets.map((t) => plan([t], { [t]: {} }));
  if (!limited) {
    const most = Math.floor(resources(r, s, "state") / param(r, "assault.costPerSpace", "number"));
    if (targets.length > 1 && most > 1) out.push(plan(targets.slice(0, most), {}));
    for (const pair of combos(targets, 2, 3 * wide)) out.push(plan(pair, {}));
  }
  return out;
}

/**
 * Rally: per location place / base / grow (maximum) / flip, Europe +1, Academy extras; optional
 * Agitate (1 or 2 shifts) in one Rally space, two with Extra Agitate. Multi-location plans use the
 * best option per location.
 */
function rallyPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const open = (l: string): boolean => {
    const space = r.spaces.find((x) => x.id === l);
    if (space === undefined) return false;
    if (l === "europe") return true;
    if (space.kind === "external") { const p = postureOf(s, l); return p === "host" || p === "tolerant"; }
    return markers(s, l, "displacement") === 0 && !(isTerrain(r, l, "city") && level(s, l) > 0 && !space.tags.includes("rallyAtSupport"));
  };
  const atoms = (l: string): JsonObject[] => {
    if (l === "europe") return [{}];
    const out: JsonObject[] = [];
    const base = count(s, l, "pkkBase") > 0;
    const academy = l === "syria-bekaa" && s.modifiers.some((m) => m.id === "academy") ? 2 : 0; // literal-ok: Academy extra recruits (rules 5.2)
    if (base) out.push({ option: "grow", ...(academy > 0 ? { extra: academy } : {}) });
    if (count(s, l, "guerrilla") >= 2 && l !== "western-cities") out.push({ option: "base" });
    out.push({ option: "place" });
    if (base && count(s, l, "guerrilla", "active") > 0) out.push({ option: "flip" });
    return out;
  };
  const locs = [...domestic(r), ...HOSTS, "europe"].filter(open).sort((a, b) => Number(count(s, b, "pkkBase") > 0) - Number(count(s, a, "pkkBase") > 0));
  const agitate = (l: string): JsonObject[] => r.spaces.find((x) => x.id === l)?.kind !== "domestic" ? [] : [1, 2].filter((n) => level(s, l) - n >= -2).map((n) => ({ action: "agitate", space: l, params: agitationSpend(s, l, n) }));
  const singles = locs.map((l) => {
    const list = byKindRank(atoms(l)).map((a) => plan([l], { [l]: a }));
    for (const a of firstPerOption(atoms(l))) for (const g of agitate(l)) list.push(plan([l], { [l]: a }, [g]));
    return list;
  });
  const out = interleave(singles);
  if (!limited) {
    const most = Math.min(4, resources(r, s, "pkk"));
    const ranked = [...locs].sort((a, b) => Number(count(s, b, "pkkBase") > 0) - Number(count(s, a, "pkkBase") > 0) || pop(r, b) - pop(r, a));
    for (let k = 2; k <= most; k++) {
      for (const set of combos(ranked.slice(0, 7), k, 5 * wide)) {
        const per = Object.fromEntries(set.map((l) => [l, atoms(l)[0] ?? {}]));
        out.push(plan(set, per));
        const domesticSet = set.filter((l) => agitate(l).length > 0);
        for (const l of domesticSet.slice(0, 2)) out.push(plan(set, per, agitate(l).slice(-1)));
        const extra = s.modifiers.some((m) => m.id === "extra-agitate");
        if (extra && domesticSet.length >= 2) out.push(plan(set, per, domesticSet.slice(0, 2).flatMap((l) => agitate(l).slice(0, 1))));
      }
    }
  }
  return out;
}

/** March: into each destination from adjacent origins: all, Underground only, or groups of 3 (concealment). */
function marchPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const dests = [...domestic(r), ...HOSTS].filter((d) => landLinked(r, d) && neighbors(r, d).some((n) => count(s, n, "guerrilla") > 0));
  const variants = (d: string): JsonObject[][] => {
    const from = neighbors(r, d).filter((n) => count(s, n, "guerrilla") > 0);
    const all = from.map((f) => ({ from: f, count: count(s, f, "guerrilla") }));
    const under = from.filter((f) => count(s, f, "guerrilla", "underground") > 0).map((f) => ({ from: f, count: count(s, f, "guerrilla", "underground"), face: "underground" }));
    const small = from.map((f) => ({ from: f, count: Math.min(2, count(s, f, "guerrilla")) }));
    const keep = from.filter((f) => count(s, f, "guerrilla") > 1).map((f) => ({ from: f, count: count(s, f, "guerrilla") - 1 }));
    const seen = new Set<string>();
    return [all, under, small, keep].filter((m) => {
      const key = canonicalJson(m);
      if (m.length === 0 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const out = interleave(dests.map((d) => variants(d).map((moves) => plan([d], { [d]: { moves } }))));
  if (!limited) {
    for (const pair of combos(dests.filter((d) => r.spaces.find((x) => x.id === d)?.kind === "domestic"), 2, 8 * wide)) {
      const [a, b] = pair as [string, string];
      const fa = neighbors(r, a).filter((n) => count(s, n, "guerrilla") > 0);
      const fb = neighbors(r, b).filter((n) => count(s, n, "guerrilla") > 0 && !fa.includes(n));
      if (fa.length === 0 || fb.length === 0) continue;
      out.push(plan([a, b], { [a]: { moves: fa.map((f) => ({ from: f, count: count(s, f, "guerrilla") })) }, [b]: { moves: fb.map((f) => ({ from: f, count: count(s, f, "guerrilla") })) } }));
    }
  }
  return out;
}

/** Attack: each space with Guerrillas and State pieces, all affordable together, and pairs. */
function attackPlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const stateHere = (l: string): number => ["troops", "police", "guards", "stateBase"].reduce((n, p) => n + count(s, l, p), 0);
  const targets = [...domestic(r), ...ZONES].filter((l) => count(s, l, "guerrilla") > 0 && stateHere(l) > 0).sort((a, b) => count(s, b, "guerrilla") - count(s, a, "guerrilla"));
  const out = targets.flatMap((t) => [plan([t], { [t]: {} }), ...(count(s, t, "police") > 0 && count(s, t, "troops") > 0 ? [plan([t], { [t]: { prefer: "police" } })] : [])]);
  if (!limited) {
    const most = resources(r, s, "pkk");
    if (targets.length > 1 && most > 1) out.push(plan(targets.slice(0, most), {}));
    for (const pair of combos(targets, 2, 3 * wide)) out.push(plan(pair, {}));
  }
  return out;
}

/** Coerce: each eligible space, the two highest-Pop together, and all affordable. */
function coercePlans(r: Ruleset, s: GameState, limited: boolean, wide: number): Plan[] {
  const targets = domestic(r).filter((l) => level(s, l) >= 0 && count(s, l, "guerrilla", "underground") > 0);
  const out = targets.map((t) => plan([t], { [t]: {} }));
  if (!limited) {
    for (const pair of combos(targets, 2, 3 * wide)) out.push(plan(pair, {}));
    if (targets.length > 2) out.push(plan(targets, {}));
  }
  return out;
}

const OP_PLANS: Readonly<Record<string, (r: Ruleset, s: GameState, limited: boolean, wide: number) => Plan[]>> = {
  "state.train": trainPlans, "state.garrison": garrisonPlans, "state.sweep": sweepPlans, "state.assault": assaultPlans,
  "pkk.rally": rallyPlans, "pkk.march": marchPlans, "pkk.attack": attackPlans, "pkk.coerce": coercePlans,
};

/** Cross-Border variants: Sweep or Assault in one Iraqi zone with a lift from Hakkari/Botan (rules 4.2.2). */
function crossBorderPlans(s: GameState, op: string): Plan[] {
  if (op !== "state.sweep" && op !== "state.assault") return [];
  const lift = (n: number): JsonObject[] => {
    const h = Math.min(n, count(s, "hakkari", "troops"));
    const b = Math.min(n - h, count(s, "botan", "troops"));
    return [...(h > 0 ? [{ from: "hakkari", count: h }] : []), ...(b > 0 ? [{ from: "botan", count: b }] : [])];
  };
  return ZONES.flatMap((zone) => [0, 2, 3, 6].map((n) => { // literal-ok: lift sizes (none, small, hot pursuit limit, full lift)
    const moves = lift(n);
    return { ...plan([zone], { [zone]: op === "state.sweep" ? { moves: [] } : {} }), sa: { action: "state.cross-border", locations: [zone], perLocation: { [zone]: { moves } }, timing: "before" as const } };
  }));
}

/** SA variants for an Op plan (rules 4.0). Bounded: a few targets per SA, both timings where they differ. */
function saVariants(r: Ruleset, s: GameState, sa: string, base: Plan): Plan[] {
  const withSa = (action: string, locations: string[], perLocation: Record<string, JsonObject>, timing: "before" | "after"): Plan => ({ ...base, sa: { action, locations, perLocation, timing } });
  switch (sa) {
    case "state.air-mobility": {
      const dest = base.locations.find((l) => r.spaces.find((x) => x.id === l)?.kind === "domestic");
      if (dest === undefined) return [];
      const max = s.modifiers.some((m) => m.id === "strike-force") ? 6 : param(r, "airMobility.maxTroops", "number"); // literal-ok: Strike Force limit (rules 5.2)
      const sources = domestic(r).filter((l) => l !== dest && count(s, l, "troops") > 1).sort((a, b) => count(s, b, "troops") - count(s, a, "troops")).slice(0, 2);
      return sources.flatMap((from) => {
        const n = Math.min(max, count(s, from, "troops") - 1);
        return n < 1 ? [] : [withSa(sa, [from, dest], { [dest]: { moves: [{ from, count: n }] } }, "before")];
      });
    }
    case "state.diplomacy":
      return ["syria-bekaa", "kdp-zone", "europe", "puk-zone"].map((t) => withSa(sa, [t], {}, "after"));
    case "pkk.ambush": {
      const locs = base.locations.filter((l) => count(s, l, "guerrilla", "underground") > 0).slice(0, s.modifiers.some((m) => m.id === "ambush") ? 3 : 2); // literal-ok: Ambush Momentum limit (rules 5.2)
      return locs.length === 0 ? [] : [withSa(sa, locs, {}, "before")];
    }
    case "pkk.extort": {
      const ok = (l: string): boolean => count(s, l, "guerrilla", "underground") > 0 && (r.spaces.find((x) => x.id === l)?.kind === "domestic" ? pop(r, l) > 0 && controlOf(r, s, l) === "pkk" && markers(s, l, "displacement") === 0 : ["host", "tolerant"].includes(postureOf(s, l) ?? ""));
      const locs = [...domestic(r), ...HOSTS].filter(ok);
      return locs.length === 0 ? [] : [withSa(sa, locs, {}, "after"), withSa(sa, locs, {}, "before")];
    }
    case "pkk.strike-collaborators": {
      if (s.flags["law3175"] !== true) return [];
      const locs = domestic(r).filter((l) => count(s, l, "guards") > 0 && count(s, l, "guerrilla", "underground") > 0).sort((a, b) => count(s, b, "guards") - count(s, a, "guards"));
      return [...locs.map((l) => withSa(sa, [l], { [l]: { guards: Math.min(2, count(s, l, "guards")) } }, "before")), ...combos(locs, 2, 2).map((pair) => withSa(sa, pair, Object.fromEntries(pair.map((l) => [l, { guards: 1 }])), "before"))];
    }
    case "pkk.host-pressure":
      return HOSTS.filter((h) => count(s, h, "guerrilla") + count(s, h, "pkkBase") > 0).flatMap((h) => [withSa(sa, [h], {}, "before"), withSa(sa, [h], {}, "after")]);
    default:
      return [];
  }
}

function opCommand(faction: FactionId, box: string, op: string, p: Plan): AnyCommand {
  return { type: "ChooseOperation", faction, box, plan: { op, locations: p.locations, perLocation: p.perLocation, sa: p.sa, subActions: p.subActions } };
}

// ---------------------------------------------------------------- Events

/** Answers to try for one question. Bounded: counts at most 5 values; space sets at most 8 subsets. */
function answers(r: Ruleset, s: GameState, q: Question, wide: number): JsonValue[] {
  switch (q.kind) {
    case "option":
      return [...q.options];
    case "count": {
      const all = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
      return all.length <= 5 * wide ? all : [q.min, q.max, Math.floor((q.min + q.max) / 2), q.min + 1, q.max - 1];
    }
    case "spaces": {
      const ranked = [...q.options].sort((a, b) => pop(r, b) - pop(r, a));
      const out: JsonValue[] = [];
      for (let k = q.max; k >= q.min && out.length < 8 * wide; k--) for (const set of combos(ranked, k, 4 * wide)) out.push(set);
      return out;
    }
    case "plan": {
      const op = q.action ?? "";
      const plans = (OP_PLANS[op]?.(r, s, false, wide) ?? []).slice(0, 8 * wide);
      const sa = q.sa;
      return [null, ...plans.flatMap((p): JsonValue[] => {
        const part = { locations: p.locations, perLocation: p.perLocation };
        if (sa === undefined) return [part];
        const v = saVariants(r, s, sa, p).map((x) => x.sa);
        return v.length === 0 ? [{ ...part, sa: { locations: p.locations, perLocation: {} } }] : v.map((x) => ({ ...part, sa: { locations: x?.locations ?? [], perLocation: x?.perLocation ?? {} } }));
      })];
    }
  }
}

/** Expand an Event command through its questions, depth first, keeping every legal completion. */
function eventCompletions(engine: Engine, r: Ruleset, s: GameState, command: AnyCommand, wide: number, limit: number): AnyCommand[] {
  const out: AnyCommand[] = [];
  let nodes = 0;
  const walk = (current: AnyCommand): void => {
    if (out.length >= limit || nodes++ > 60 * wide) return;
    const [first] = engine.validate(r, s, current).violations;
    if (first === undefined) { out.push(current); return; }
    if (first.code !== "needsAnswer" || first.question === undefined) return;
    const prior = Array.isArray(current["answers"]) ? (current["answers"] as JsonValue[]) : [];
    for (const a of answers(r, s, first.question, wide)) walk({ ...current, answers: [...prior, a] });
  };
  walk(command);
  return out;
}

// ---------------------------------------------------------------- Propaganda

interface Spend { loc: string; cost: number; value: number; params: JsonObject }

/** Best allocation for every total cost up to `budget` (exact over at most 3^9 options, else greedy). */
function frontier(options: readonly (readonly Spend[])[], budget: number): Spend[][] {
  const best = new Map<number, { value: number; picks: Spend[] }>([[0, { value: 0, picks: [] }]]);
  if (options.length <= 9) { // literal-ok: exhaustive search bound
    const walk = (i: number, cost: number, value: number, picks: Spend[]): void => {
      if (cost > budget) return;
      if (i === options.length) {
        const old = best.get(cost);
        if (old === undefined || value > old.value) best.set(cost, { value, picks });
        return;
      }
      walk(i + 1, cost, value, picks);
      for (const o of options[i] ?? []) walk(i + 1, cost + o.cost, value + o.value, [...picks, o]);
    };
    walk(0, 0, 0, []);
  } else {
    const flat = options.map((o) => [...o].sort((a, b) => b.value / b.cost - a.value / a.cost)[0]).filter((o): o is Spend => o !== undefined).sort((a, b) => b.value / b.cost - a.value / a.cost);
    let cost = 0;
    const picks: Spend[] = [];
    for (const o of flat) if (cost + o.cost <= budget) { cost += o.cost; picks.push(o); best.set(cost, { value: picks.reduce((n, p) => n + p.value, 0), picks: [...picks] }); }
  }
  // Keep only allocations that are better than every cheaper one, best first, so a family cap
  // prunes the cheapest allocations, never the maximum (cand-2).
  const out: Spend[][] = [];
  let top = -1;
  for (const cost of [...best.keys()].sort((a, b) => a - b)) {
    const entry = best.get(cost);
    if (entry !== undefined && entry.value > top) { top = entry.value; out.push(entry.picks); }
  }
  return out.reverse();
}

/** Civic Action phase: State-Controlled spaces with Troops and Police; value = Pop per level gained. */
function civicChoices(r: Ruleset, s: GameState): JsonObject[] {
  const cap = Math.min(Math.floor(Number(s.tracks["legitimacy"]) / param(r, "civicAction.capDivisor", "number")), resources(r, s, "state"));
  const options = domestic(r).filter((l) => controlOf(r, s, l) === "state" && count(s, l, "troops") > 0 && count(s, l, "police") > 0 && level(s, l) < 2).map((l) => [1, 2].filter((n) => level(s, l) + n <= 2).map((n): Spend => {
    const params = civicSpend(s, l, n);
    const cost = Number(params["coercion"]) + Number(params["reception"]) + 3 * Number(params["stateHarm"]) + 2 * n; // literal-ok: rules 3.6.1 costs, checked by validation
    return { loc: l, cost, value: n * pop(r, l), params };
  }));
  return withRedress(frontier(options, cap), redressUnits(r, s, "state", 3), cap, civicSpend, s).map((picks) => ({ spaces: Object.fromEntries(picks.map((p) => [p.loc, p.params])) })); // literal-ok: rules 3.6.1 redress cost
}

/**
 * Removal-only units for a faction whose Harm exceeds the limit (rules 7.3: 2 margin per excess
 * marker): one marker per unit, up to the excess, where the faction may spend.
 */
interface Unit { readonly loc: string; readonly key: string; readonly cost: number }
function redressUnits(r: Ruleset, s: GameState, faction: "state" | "pkk", harmCost: number): Unit[] {
  const keys = faction === "pkk" ? [["coercion", 1], ["pkkHarm", harmCost]] as const : [["stateHarm", harmCost]] as const;
  const total = r.spaces.reduce((n, x) => n + keys.reduce((m, [k]) => m + markers(s, x.id, k), 0), 0);
  let excess = total - param(r, "harm.limit", "number");
  const out: Unit[] = [];
  for (const [key, cost] of keys) {
    for (const loc of domestic(r)) {
      const allowed = faction === "pkk" ? count(s, loc, "pkkBase") > 0 || controlOf(r, s, loc) === "pkk" : controlOf(r, s, loc) === "state" && count(s, loc, "police") > 0 && count(s, loc, "troops") > 0;
      for (let i = 0; allowed && i < markers(s, loc, key) && excess > 0; i++, excess--) out.push({ loc, key, cost });
    }
  }
  return out;
}

/** Frontier allocations plus allocations that first buy back excess Harm unit by unit, then spend the rest. */
function withRedress(base: Spend[][], units: readonly Unit[], budget: number, spend: (s: GameState, loc: string, shifts: number) => JsonObject, s: GameState): Spend[][] {
  const extra: Spend[][] = [];
  const zero = (loc: string): JsonObject => Object.fromEntries(Object.entries(spend(s, loc, 0)).map(([k]) => [k, 0]));
  const picked = new Map<string, Record<string, number>>();
  let cost = 0;
  for (const u of units) {
    if (cost + u.cost > budget) continue;
    cost += u.cost;
    const entry = picked.get(u.loc) ?? {};
    entry[u.key] = (entry[u.key] ?? 0) + 1;
    picked.set(u.loc, entry);
    const removal: Spend[] = [...picked].map(([loc, keys]) => ({ loc, cost: 0, value: 0, params: { ...zero(loc), ...keys } }));
    extra.push(removal);
    const rest = base.find((b) => b.reduce((n, x) => n + x.cost, 0) <= budget - cost && b.every((x) => !picked.has(x.loc)));
    if (rest !== undefined && rest.length > 0) extra.push([...removal, ...rest]);
  }
  // Redress allocations interleave with the best frontier allocations so the cap keeps both.
  return interleave([base, extra]);
}

/** Agitation phase: spaces with a PKK Base or PKK Control; value = Pop per level gained. */
function agitationChoices(r: Ruleset, s: GameState): JsonObject[] {
  const options = domestic(r).filter((l) => (count(s, l, "pkkBase") > 0 || controlOf(r, s, l) === "pkk") && level(s, l) > -2).map((l) => [1, 2].filter((n) => level(s, l) - n >= -2).map((n): Spend => {
    const params = agitationSpend(s, l, n);
    return { loc: l, cost: Number(params["coercion"]) + 2 * Number(params["pkkHarm"]) + n, value: n * pop(r, l), params }; // literal-ok: rules 3.6.2 redress cost
  }));
  return withRedress(frontier(options, resources(r, s, "pkk")), redressUnits(r, s, "pkk", 2), resources(r, s, "pkk"), agitationSpend, s).map((picks) => ({ spaces: Object.fromEntries(picks.map((p) => [p.loc, p.params])) })); // literal-ok: rules 3.6.2 redress cost
}

/** Upkeep shortfall: remove the fewest Guards, from low-Pop spaces first or from crowded spaces first. */
function upkeepChoices(r: Ruleset, s: GameState): JsonObject[] {
  const per = param(r, "upkeep.guardsPerResource", "number");
  const spaces = domestic(r).filter((l) => count(s, l, "guards") > 0);
  const total = spaces.reduce((n, l) => n + count(s, l, "guards"), 0);
  const keep = Math.min(total, resources(r, s, "state") * per);
  return [[...spaces].reverse(), [...spaces].sort((a, b) => count(s, b, "guards") - count(s, a, "guards"))].map((order) => {
    let remove = total - keep;
    const out: Record<string, number> = {};
    for (const l of order) { const n = Math.min(remove, count(s, l, "guards")); if (n > 0) { out[l] = n; remove -= n; } }
    return { removeGuards: out };
  });
}

/** State Redeploy: required Iraqi exits to each legal destination, plus optional consolidation. */
function stateRedeployChoices(r: Ruleset, s: GameState): JsonObject[] {
  const dests = domestic(r).filter((l) => isTerrain(r, l, "city") || count(s, l, "stateBase") > 0);
  const exits = (to: string): JsonObject[] => ZONES.filter((z) => count(s, z, "troops") > 0).map((z) => ({ from: z, to, count: count(s, z, "troops") }));
  const threatened = [...dests].sort((a, b) => neighbors(r, b).reduce((n, x) => n + count(s, x, "guerrilla"), 0) - neighbors(r, a).reduce((n, x) => n + count(s, x, "guerrilla"), 0));
  const out: JsonObject[] = dests.slice(0, 4).map((d) => ({ troops: exits(d), police: [] }));
  const front = threatened[0];
  if (front !== undefined) {
    const spare = dests.filter((d) => d !== front && count(s, d, "troops") > 2).map((d) => ({ from: d, to: front, count: count(s, d, "troops") - 2 }));
    out.push({ troops: [...exits(front), ...spare], police: [] });
  }
  const needPolice = domestic(r).filter((l) => controlOf(r, s, l) === "state" && count(s, l, "police") === 0);
  const extraPolice = domestic(r).filter((l) => count(s, l, "police") > 2);
  if (needPolice.length > 0 && extraPolice.length > 0) out.push({ troops: exits(dests[0] ?? "diyarbakir-city"), police: needPolice.slice(0, extraPolice.length).map((to, i) => ({ from: extraPolice[i] ?? "", to, count: 1 })) });
  return out;
}

/** PKK Redeploy: none, or Guerrillas into adjacent PKK Base spaces (domestic Bases first). */
function pkkRedeployChoices(r: Ruleset, s: GameState): JsonValue[] {
  const bases = [...domestic(r), ...HOSTS].filter((l) => count(s, l, "pkkBase") > 0);
  const moves = (only: (from: string) => boolean): JsonObject[] => {
    const used = new Set<string>();
    return bases.flatMap((b) => neighbors(r, b).filter((f) => !used.has(f) && count(s, f, "pkkBase") === 0 && count(s, f, "guerrilla") > 0 && only(f)).map((f) => { used.add(f); return { from: f, to: b, count: count(s, f, "guerrilla") }; }));
  };
  const external = (f: string): boolean => r.spaces.find((x) => x.id === f)?.kind === "external";
  return [[], moves(() => true), moves(external), moves((f) => !external(f))];
}

// ---------------------------------------------------------------- assembly

/** Every candidate for the decision, validated on `s`. */
export function generateCandidates(engine: Engine, r: Ruleset, s: GameState, kind: DecisionKind, faction: FactionId, options: GeneratorOptions = DEFAULT_OPTIONS): CandidateSet {
  const wide = options.broad ? 4 : 1;
  const cap = options.familyCap * wide;
  const families: Record<string, FamilyStats> = {};
  const rejected: { family: string; code: string }[] = [];
  const kept: Candidate[] = [];
  const seen = new Set<string>();
  const offer = (family: string, commands: readonly AnyCommand[], prevalidated = false): void => {
    const stats = (families[family] ??= { proposed: 0, rejected: 0, pruned: 0, retained: 0 });
    for (const command of commands) {
      const key = canonicalJson(command);
      if (seen.has(key)) continue;
      seen.add(key);
      stats.proposed++;
      if (stats.retained >= cap) { stats.pruned++; continue; }
      const v = prevalidated ? null : engine.validate(r, s, command);
      if (v !== null && !v.ok) {
        stats.rejected++;
        if (rejected.length < 10) rejected.push({ family, code: v.violations[0]?.code ?? "unknown" }); // literal-ok: diagnostic sample size
        continue;
      }
      stats.retained++;
      kept.push({ id: `${family}#${canonicalHash(command).slice(0, 10)}`, family, command });
    }
  };
  const propaganda = (phase: string, choice: JsonObject): AnyCommand => ({ type: "PropagandaChoice", phase, choice });

  if (kind === "card") {
    const boxes = legalBoxes(r, s, faction);
    if (boxes.includes(BOX.pass)) offer("pass", [{ type: "Pass", faction }]);
    const card = s.deck.currentCard === null ? undefined : r.cards[s.deck.currentCard];
    if (boxes.includes(BOX.event) && card !== undefined) {
      for (const side of ["unshaded", "shaded"] as const) if (card[side] !== null) offer(`event:${side}`, eventCompletions(engine, r, s, { type: "ChooseEvent", faction, side, answers: [] }, wide, cap), true);
    }
    for (const box of [BOX.limitedOp, BOX.opOnly, BOX.opSa]) {
      if (!boxes.includes(box)) continue;
      for (const op of Object.keys(OP_PLANS).filter((id) => actionHandlers[id]?.faction === faction)) {
        const plans = OP_PLANS[op]?.(r, s, box === BOX.limitedOp, wide) ?? [];
        const byVariant = (prefix: string): void => {
          for (const variant of new Set(plans.map((p) => p.variant))) offer(`${prefix}${variant === undefined ? "" : `/${variant}`}@${box}`, plans.filter((p) => p.variant === variant).map((p) => opCommand(faction, box, op, p)));
        };
        if (box !== BOX.opSa) { byVariant(`op:${op}`); continue; }
        if (!boxes.includes(BOX.opOnly)) byVariant(`op:${op}`);
        for (const sa of Object.values(actionHandlers).filter((h) => h.kind === "sa" && h.faction === faction && (h.accompanies === "any" || h.accompanies.includes(op)))) {
          const variants = sa.id === "state.cross-border" ? crossBorderPlans(s, op) : plans.slice(0, 6 * wide).flatMap((p) => saVariants(r, s, sa.id, p));
          offer(`op:${op}+${sa.id}@${box}`, variants.map((p) => opCommand(faction, box, op, p)));
        }
      }
    }
  } else if (kind === "pivotal") {
    const id = s.pending?.id ?? "";
    offer("pivotal:decline", [{ type: "ResolveDecision", decisionId: id, answer: "decline" }]);
    const max = param(r, "argk.maxPlace", "number");
    const bases = [...domestic(r), ...HOSTS].filter((l) => count(s, l, "pkkBase") > 0);
    const n = Math.min(max, avail(s, "guerrilla"));
    const spreads: Record<string, number>[] = [...bases.map((b) => ({ [b]: n })), ...combos(bases, 2, 6 * wide).map(([a, b]) => ({ [a ?? ""]: Math.ceil(n / 2), [b ?? ""]: Math.floor(n / 2) })), Object.fromEntries(bases.slice(0, n).map((b) => [b, 1]))];
    offer("pivotal:play", spreads.map((placements) => ({ type: "PlayPivotal", faction, card: "DK-015", placements: Object.fromEntries(Object.entries(placements).filter(([, v]) => v > 0)) })));
  } else if (kind === "resume") {
    const resume = s.pending?.resume;
    if (resume !== undefined) offer(`resume:${resume.op}`, (OP_PLANS[resume.op]?.(r, s, resume.box === BOX.limitedOp, wide) ?? []).map((p) => opCommand(faction, resume.box, resume.op, p)));
  } else if (kind === "upkeep") {
    offer("propaganda:upkeep", upkeepChoices(r, s).map((c) => propaganda("upkeep", c)));
  } else if (kind === "legitimacy") {
    offer("propaganda:legitimacy", [{ type: "Advance" }, ...emergencyMoves(r, s).map((step) => propaganda("legitimacy", { emergencyStep: step }))]);
  } else if (kind === "civicAction") {
    offer("propaganda:civicAction", civicChoices(r, s).map((c) => propaganda("civicAction", c)));
  } else if (kind === "agitation") {
    offer("propaganda:agitation", agitationChoices(r, s).map((c) => propaganda("agitation", c)));
  } else if (kind === "redeployState") {
    offer("redeploy:state", stateRedeployChoices(r, s).map((c) => propaganda("redeploy", { ...c, guerrilla: [] })));
  } else {
    const base = options.stateRedeploy ?? { troops: [], police: [] };
    offer("redeploy:pkk", pkkRedeployChoices(r, s).map((g) => propaganda("redeploy", { ...base, guerrilla: g })));
  }
  return { kind, faction, candidates: kept, families, rejected };
}
