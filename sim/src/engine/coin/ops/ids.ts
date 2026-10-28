// Package IDs the Kurdish COIN handlers read (DEC-52). Handlers are procedures (DEC-02) written for
// these IDs; every number they use is a parameter. One place to change if the package renames an ID.
export const FACTION = { state: "state", pkk: "pkk" } as const;
export const PIECE = {
  troops: "troops",
  police: "police",
  guards: "guards",
  stateBase: "stateBase",
  guerrilla: "guerrilla",
  pkkBase: "pkkBase",
} as const;
export const FACE = { underground: "underground", active: "active" } as const;
export const MARKER = {
  stateHarm: "stateHarm",
  pkkHarm: "pkkHarm",
  disputedHarm: "disputedHarm",
  coercion: "coercion",
  displacement: "displacement",
  reception: "reception",
  covert: "covert",
  office: "office",
  ban: "ban",
  leadership: "leadership",
} as const;
export const TRACK = {
  legitimacy: "legitimacy",
  emergencyRule: "emergencyRule",
  europe: "europe",
  syria: "posture.syria",
  kdp: "posture.kdp",
  puk: "posture.puk",
} as const;
export const FLAG = { law3175: "law3175" } as const;
export const TAG = { noLandLinks: "noLandLinks", noPieces: "noPieces", eventsOnly: "eventsOnly", receptionTarget: "receptionTarget" } as const;
export const TERRAIN = { mountain: "mountain", plain: "plain", city: "city" } as const;
export const EMERGENCY = { martialLaw: "martialLaw", ohal: "ohal", ohalExtendedPowers: "ohalExtendedPowers", normalizing: "normalizing" } as const;
