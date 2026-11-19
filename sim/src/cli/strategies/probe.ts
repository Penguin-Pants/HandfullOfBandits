// Probe players (audit Plan 1 D-04; Plan 3 A4). Diagnostic baselines that steer play into the rare
// systems the qualified roster almost never uses, so the coverage ledger sees them in real games:
// Cross-Border and hot pursuit, Diplomacy and host postures, Restricted entry, Host Pressure and the
// Leadership, Village Clearance, Strike Collaborators after the Operation, Guard Abuse (DK-006
// shaded), the Europe Ban (DK-064) and Coercive Diplomacy (DK-098). Each decision takes the
// candidate with the highest probe score; ties and unscored decisions are random among the
// candidates. Probes are role "baseline": they never enter headline results (19 s4).
import { asObject } from "../../engine/coin/ops/plan.ts";
import type { FactionId, JsonObject } from "../../engine/core/types.ts";
import { GENERATOR_VERSION, type Candidate } from "../candidates.ts";
import type { Observation } from "../player-observation.ts";
import type { ObservationPlayer } from "../players.ts";

// Card slots of the Op + SA rotation: 0 Village Clearance, 1 Cross-Border, 2 and 3 Diplomacy.
const SA_SLOTS = 4;
const POSTURES = ["host", "tolerant", "restricted", "hostile", "aligned"];
const BOXES: Readonly<Record<string, string>> = { "syria-bekaa": "posture.syria", "kdp-zone": "posture.kdp", "puk-zone": "posture.puk" };

const plan = (c: Candidate): JsonObject => asObject(c.command["plan"]) ?? {};
const saPart = (c: Candidate): JsonObject => asObject(plan(c)["sa"]) ?? {};
const locations = (part: JsonObject): string[] => (Array.isArray(part["locations"]) ? part["locations"].filter((l): l is string => typeof l === "string") : []);
const event = (c: Candidate, o: Observation, card: string, side: string): boolean => c.command.type === "ChooseEvent" && o.currentCard === card && c.command["side"] === side;

/**
 * The Iraqi host this game pushes: from the first revealed card, so it is fixed for the game and
 * varies by seed. PUK in two games of three, because KDP Diplomacy gets +1 from C3 (06 s3.3).
 */
export function focusHost(o: Observation): string {
  const first = o.played[0] ?? o.currentCard ?? "";
  return Number(first.replace(/\D/g, "")) % 3 === 0 ? "kdp-zone" : "puk-zone";
}

/** Probe score of `c`: 0 when it exercises no target. */
export function probeScore(c: Candidate, o: Observation): number {
  const action = saPart(c)["action"];
  const sa = typeof action === "string" ? action : null;
  if (o.viewer === "state") {
    if (c.family === "pivotal:play:DK-098") return 100;
    if (event(c, o, "DK-064", "unshaded")) return 90;
    // One Special Activity per Op + SA: the favored family rotates by card, so none crowds out the others.
    const slot = o.turn.cardIndex % SA_SLOTS;
    const favored = (family: number): number => (slot === family || (family === 2 && slot === 3) ? 30 : 0);
    if (sa === "state.village-clearance") return 50 + favored(0);
    if (sa === "state.cross-border") return 45 + favored(1);
    if (sa === "state.diplomacy") {
      // One Iraqi host per game, so it reaches Hostile and Aligned; then the most advanced host.
      // Syria to Restricted from C4, because DK-098 needs Syria at Tolerant or Restricted (rules
      // 5.3). Decision 18 removes a host at its last step.
      const target = locations(saPart(c))[0] ?? "";
      const late = ["C4", "C5"].includes(o.turn.campaign ?? "") && ["host", "tolerant"].includes(String(o.tracks["posture.syria"]));
      const step = (track: string): number => POSTURES.indexOf(String(o.tracks[track]));
      const base = target === "syria-bekaa" ? (late ? 49 : 36) : target === "europe" ? 30 : 40 + step(BOXES[target] ?? "") * 2 + (target === focusHost(o) ? 9 : 0);
      return base + favored(2);
    }
    // Legal Politics: no State filing, so the Prosecutor files at the Office limit (rules 8.5 line 6).
    if (c.family === "propaganda:legalPolitics" && c.command.type === "Advance") return 10;
    return 0;
  }
  if (event(c, o, "DK-006", "shaded")) return 100;
  if (sa === "pkk.strike-collaborators" && saPart(c)["timing"] === "after") return 90;
  const restricted = (l: string): boolean => BOXES[l] !== undefined && o.tracks[BOXES[l] ?? ""] === "restricted";
  const march = plan(c)["op"] === "pkk.march" ? locations(plan(c)).filter(restricted) : [];
  // Host Pressure before the Operation in the same box, one step before it closes (Rally at
  // Tolerant, March at Restricted): a backfire closes the box and interrupts the Operation (DEC-54,
  // DEC-56). Elsewhere Host Pressure would undo the State probe's posture shifts.
  const closing = plan(c)["op"] === "pkk.rally" ? locations(plan(c)).filter((l) => BOXES[l] !== undefined && o.tracks[BOXES[l] ?? ""] === "tolerant") : march;
  if (sa === "pkk.host-pressure" && saPart(c)["timing"] === "before" && locations(saPart(c)).some((l) => closing.includes(l))) return 88;
  if (march.length > 0) return 85;
  return 0;
}

export function probePlayer(faction: FactionId): ObservationPlayer {
  const prefix = faction === "state" ? "S" : "P";
  return {
    spec: {
      id: `${prefix}-PROBE@1`, family: `${prefix}-PROBE`, version: 1, faction, role: "baseline", access: "observation", params: {}, generatorVersion: GENERATOR_VERSION, budget: 0,
      description: "Takes a candidate that exercises a rare system whenever one is legal; otherwise random among candidates (diagnostic baseline, audit D-04).",
    },
    decide(request, ctx) {
      const scored = request.candidates.map((c) => ({ c, v: probeScore(c, request.observation) }));
      const best = Math.max(...scored.map((x) => x.v));
      const top = scored.filter((x) => x.v === best);
      const pick = top[ctx.rng.int(top.length)];
      if (pick === undefined) throw new Error("probePlayer received no candidates");
      return { candidateId: pick.c.id, value: best, components: {}, topAlternative: null, notes: best > 0 ? [`probe ${String(best)}`] : [] };
    },
  };
}
