// Full campaign setup state built by hand from research for the P1-03 size check.
// Sources: research 03 s1 to s2 (spaces), 04 s2 to s4 (pieces, tracks, markers),
// 10 s2 (1984 setup), data/prototype-deck.csv (100 cards). Replaced by the real
// package and scenario in P2-01 and P2-02.
import { emptyState, SINGLE_FACE } from "../src/engine/core/state.ts";
import type { GameState, Ruleset, SpaceState } from "../src/engine/core/types.ts";

const domestic = [
  "hakkari",
  "botan",
  "mardin-batman",
  "diyarbakir-city",
  "diyarbakir-rural",
  "sanliurfa",
  "adiyaman",
  "elazig",
  "dersim",
  "bingol-mus",
  "van-bitlis",
  "agri",
  "western-cities",
];
const external = ["syria-bekaa", "kdp-zone", "puk-zone", "iran", "europe"];
const postures = ["host", "tolerant", "restricted", "hostile", "aligned"];

export const fullRuleset: Ruleset = {
  packageHash: "0".repeat(64),
  rulesetVersion: "R1",
  factions: [
    { id: "state", kind: "player" },
    { id: "pkk", kind: "player" },
  ],
  pieces: [
    { id: "troops", faction: "state", count: 30, states: [], startPool: "available" },
    { id: "police", faction: "state", count: 24, states: [], startPool: "available" },
    { id: "guards", faction: "state", count: 16, states: [], startPool: "outOfPlay" },
    { id: "stateBase", faction: "state", count: 8, states: [], startPool: "available" },
    { id: "guerrilla", faction: "pkk", count: 30, states: ["underground", "active"], startPool: "available" },
    { id: "pkkBase", faction: "pkk", count: 12, states: [], startPool: "available" },
  ],
  spaces: [
    ...domestic.map((id) => ({ id, hasSupportScale: true })),
    ...external.map((id) => ({ id, hasSupportScale: false })),
  ],
  tracks: [
    { id: "resources.state", kind: "numeric", min: 0, max: 50 },
    { id: "resources.pkk", kind: "numeric", min: 0, max: 50 },
    { id: "legitimacy", kind: "numeric", min: 0, max: 20 },
    { id: "europe", kind: "numeric", min: 0, max: 5 },
    { id: "emergencyRule", kind: "ordinal", steps: ["martialLaw", "ohal", "ohalExtendedPowers", "normalizing"] },
    { id: "posture.syria", kind: "ordinal", steps: postures.slice(0, 4) },
    { id: "posture.kdp", kind: "ordinal", steps: postures },
    { id: "posture.puk", kind: "ordinal", steps: postures },
    { id: "ceasefire", kind: "ordinal", steps: ["none", "declared", "reciprocalRestraint", "talks"] },
    { id: "legalSpace", kind: "ordinal", steps: ["absent", "open", "prosecuted", "banned"] },
  ],
  // Research 04 s4, all rows except Support, Opposition (space level) and initiative cylinders.
  markers: [
    { id: "stateHarm", count: 12, sides: [] },
    { id: "pkkHarm", count: 12, sides: [] },
    { id: "disputedHarm", count: 6, sides: [] },
    { id: "coercion", count: 8, sides: [] },
    { id: "displacement", count: 10, sides: ["new", "old"] },
    { id: "reception", count: 8, sides: [] },
    { id: "covert", count: 6, sides: ["faceDown", "revealed"] },
    { id: "office", count: 8, sides: [] },
    { id: "closureCase", count: 1, sides: [] },
    { id: "successor", count: 1, sides: [] },
    { id: "ban", count: 1, sides: [] },
    { id: "restraintBroken", count: 2, sides: ["state", "pkk"] },
    { id: "capability", count: 12, sides: ["state", "pkk"] },
    { id: "momentum", count: 8, sides: [] },
    { id: "leadership", count: 1, sides: ["present", "abroad"] },
  ],
};

type Setup = Readonly<Record<string, { level?: number; pieces: Readonly<Record<string, number>> }>>;

// Research 10 s2.2. Guerrillas start Underground (research 04 s2.1 item 2).
const setup: Setup = {
  hakkari: { level: -1, pieces: { troops: 2, police: 1, guerrilla: 2 } },
  botan: { level: -1, pieces: { troops: 2, police: 1, guerrilla: 2, pkkBase: 1 } },
  "mardin-batman": { pieces: { troops: 1, police: 1, guerrilla: 1 } },
  "diyarbakir-city": { pieces: { troops: 3, police: 2, stateBase: 1 } },
  "diyarbakir-rural": { pieces: { police: 1 } },
  sanliurfa: { level: 1, pieces: { police: 2 } },
  adiyaman: { level: 1, pieces: { police: 1 } },
  elazig: { level: 1, pieces: { troops: 1, police: 1, stateBase: 1 } },
  dersim: { pieces: { troops: 1, police: 1 } },
  "bingol-mus": { pieces: { troops: 1, police: 1 } },
  "van-bitlis": { pieces: { troops: 2, police: 1, stateBase: 1 } },
  agri: { pieces: { troops: 1, police: 1 } },
  "western-cities": { level: 1, pieces: { troops: 2, police: 2, stateBase: 1 } },
  "kdp-zone": { pieces: { guerrilla: 3, pkkBase: 1 } },
  "syria-bekaa": { pieces: { guerrilla: 2, pkkBase: 1 } },
};

function placed(space: SpaceState, id: string): SpaceState {
  const entry = setup[id];
  if (entry === undefined) return space;
  const pieces = Object.fromEntries(
    Object.entries(space.pieces).map(([piece, faces]) => {
      const n = entry.pieces[piece] ?? 0;
      const face = piece === "guerrilla" ? "underground" : SINGLE_FACE;
      return [piece, { ...faces, [face]: n }];
    }),
  );
  const markers =
    id === "syria-bekaa" ? { ...space.markers, leadership: { present: 1, abroad: 0 } } : space.markers;
  return { pieces, level: entry.level ?? space.level, markers };
}

/** Full campaign setup: research 10 s2 placed on the empty state, 100 cards in five piles. */
export function fullSetupState(): GameState {
  const base = emptyState(fullRuleset, "full-campaign", 2 ** 53 - 1);
  const onMap = (piece: string): number =>
    Object.values(setup).reduce((sum, entry) => sum + (entry.pieces[piece] ?? 0), 0);
  const cards = Array.from({ length: 100 }, (_, i) => `DK-${String(i + 1).padStart(3, "0")}`);
  return {
    ...base,
    turn: { ...base.turn, campaign: "C1" },
    deck: { ...base.deck, piles: [0, 1, 2, 3, 4].map((p) => cards.slice(p * 20, p * 20 + 20)) },
    hands: { state: ["DK-090", "DK-091"], pkk: ["DK-092", "DK-093"] },
    spaces: Object.fromEntries(Object.entries(base.spaces).map(([id, space]) => [id, placed(space, id)])),
    pools: Object.fromEntries(
      Object.entries(base.pools).map(([piece, pool]) => [
        piece,
        { available: pool.available - onMap(piece), outOfPlay: pool.outOfPlay },
      ]),
    ),
    markerPools: { ...base.markerPools, leadership: 0 },
    tracks: {
      ...base.tracks,
      "resources.state": 12,
      "resources.pkk": 5,
      legitimacy: 10,
      europe: 1,
      "posture.puk": "tolerant",
    },
  };
}
