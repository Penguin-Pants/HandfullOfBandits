// Readable names for IDs on screen (UI clarity round R1.2, R4.5). A table for names that the
// fallback gets wrong; every other ID becomes words ("passiveSupport" -> "Passive Support").

const NAMES: Readonly<Record<string, string>> = {
  pkk: "PKK",
  kdp: "KDP",
  puk: "PUK",
  ohal: "OHAL",
  ohalExtendedPowers: "OHAL Extended Powers",
  stateBase: "State Base",
  pkkBase: "PKK Base",
  guards: "Village Guard",
  stateHarm: "State Harm",
  pkkHarm: "PKK Harm",
  disputedHarm: "Disputed Harm",
  limitedOp: "Limited Op",
  opOnly: "Op Only",
  opSa: "Op + SA",
  outOfPlay: "Out of Play",
  law3175: "Law 3175",
};

/** "passiveSupport" or "resources.pkk" or "kdp-zone" as words in title case. */
export function words(id: string): string {
  const known = NAMES[id];
  if (known !== undefined) return known;
  return id
    .split(/[.\-_]/)
    .map((part) => NAMES[part] ?? part.replace(/([a-z])([A-Z0-9])/g, "$1 $2"))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** One piece, where the ID is already plural. */
const SINGULAR: Readonly<Record<string, string>> = { troops: "Troop" };

/** "1 Guerrilla", "2 Guerrillas", "1 Troop", "3 Troops", "2 Police". */
export function counted(n: number, id: string): string {
  const name = words(id);
  if (n === 1) return `1 ${SINGULAR[id] ?? name}`;
  return `${String(n)} ${/(s|Police)$/.test(name) ? name : `${name}s`}`;
}
