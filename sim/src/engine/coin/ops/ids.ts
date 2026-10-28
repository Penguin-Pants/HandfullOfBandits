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
export const TAG = { noLandLinks: "noLandLinks", noPieces: "noPieces", eventsOnly: "eventsOnly", receptionTarget: "receptionTarget", rallyAtSupport: "rallyAtSupport" } as const;
export const TERRAIN = { mountain: "mountain", plain: "plain", city: "city" } as const;
export const EMERGENCY = { martialLaw: "martialLaw", ohal: "ohal", ohalExtendedPowers: "ohalExtendedPowers", normalizing: "normalizing" } as const;
export const POSTURE = { host: "host", tolerant: "tolerant", restricted: "restricted", hostile: "hostile", aligned: "aligned" } as const;
/** External box -> its host posture track (research 07 s5). */
export const HOST_OF: Readonly<Record<string, string>> = { "syria-bekaa": TRACK.syria, "kdp-zone": TRACK.kdp, "puk-zone": TRACK.puk };
export const SYRIA_BOX = "syria-bekaa";
export const EUROPE_SPACE = "europe";
export const FLAG_VACUUM = "northernIraqVacuum";
export const OPTION = { syriaMarchRestricted: "syriaMarchRestricted" } as const;
