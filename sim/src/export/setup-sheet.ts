// Printable setup sheet (audit Plan 4 V4; 7.5): a scenario's start position in the rule 10.2 layout,
// with the change list of a variant. Pure text from stored package content (the JSON the package
// hash covers). The export layer reads no package or engine code, so the caller gives the derived
// start: pools, scores, margins, Harm and Control. The session export prints the same change text.

type Json = Readonly<Record<string, unknown>>;

/** One setup change as the package stores it in a variant record (package/diff.ts SetupChange). */
export interface SheetChange {
  readonly kind: "threshold" | "track" | "level" | "piece" | "marker" | "available" | "outOfPlay" | "total";
  readonly space: string | null;
  readonly id: string | null;
  readonly face: string | null;
  readonly from: number | string | null;
  readonly to: number | string | null;
}

/** The start position as the engine sets it up: Available pools and the derived view. */
export interface SheetStart {
  readonly available: Readonly<Record<string, number>>;
  readonly scores: Readonly<Record<string, number>>;
  readonly margins: Readonly<Record<string, number>>;
  readonly harm: Readonly<Record<string, number>>;
  readonly control: Readonly<Record<string, string | null>>;
}

/** Abbreviation and names of the Kurdish COIN pieces, as rule 10.2 writes them. Other IDs use their words. */
const PIECES: Readonly<Record<string, { readonly abbr: string; readonly legend: string; readonly one: string; readonly many: string }>> = {
  troops: { abbr: "T", legend: "Troops", one: "Troop", many: "Troops" },
  police: { abbr: "P", legend: "Police", one: "Police", many: "Police" },
  guards: { abbr: "V", legend: "Guards", one: "Guard", many: "Guards" },
  stateBase: { abbr: "B", legend: "State Base", one: "State Base", many: "State Bases" },
  guerrilla: { abbr: "G", legend: "Guerrillas", one: "Guerrilla", many: "Guerrillas" },
  pkkBase: { abbr: "B", legend: "PKK Base", one: "PKK Base", many: "PKK Bases" },
};

/**
 * Marker types rule 10.2 names as absent at the start, by printed name. A type leaves the sentence
 * when the scenario places one. IDs the package does not define are skipped.
 */
const START_MARKERS: readonly (readonly [string, readonly string[]])[] = [
  ["Harm", ["stateHarm", "pkkHarm", "disputedHarm"]],
  ["Coercion", ["coercion"]],
  ["Reception", ["reception"]],
  ["Displacement", ["displacement"]],
  ["Covert", ["covert"]],
  ["Office", ["office"]],
];

/** "martialLaw" or "posture.kdp" as words in title case. */
const words = (id: string): string => id.split(/[.\-_]/).map((p) => p.replace(/([a-z])([A-Z0-9])/g, "$1 $2")).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
/** "a, b and c". */
const list = (items: readonly string[]): string => (items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1] ?? ""}`);
/** A signed number with a true minus sign, as rule 10.2 writes margins. */
const signed = (n: number): string => (n < 0 ? `−${String(-n)}` : String(n));
const arr = (v: unknown): Json[] => (Array.isArray(v) ? (v as Json[]) : []);
const obj = (v: unknown): Json => (typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Json) : {});
const str = (v: unknown): string => (typeof v === "string" || typeof v === "number" ? String(v) : "");

/** Names the sheet needs, read from package content. */
function namesOf(content: Json) {
  const map = obj(content["map.yaml"]);
  const spaces = arr(map["spaces"]);
  const levels = (map["supportLevels"] as string[] | undefined) ?? [];
  const mid = (levels.length - 1) / 2;
  const named = (file: string, field: string) => new Map(arr(content[file]).map((x) => [str(x["id"]), str(x[field])]));
  const factions = named("factions.yaml", "name");
  const tracks = named("tracks.yaml", "display");
  const piece = (id: string) => PIECES[id] ?? { abbr: id, legend: words(id), one: words(id), many: words(id) };
  return {
    spaces,
    // Rule 10.2 writes a space without its other name: "Diyarbakır City (Amed)" is "Diyarbakır City" (P4-1).
    space: (id: string): string => str(spaces.find((s) => s["id"] === id)?.["name"]).replace(/ \([^)]*\)$/, "") || words(id),
    faction: (id: string): string => factions.get(id) ?? words(id),
    track: (id: string): string => tracks.get(id) ?? words(id),
    level: (n: number | null): string => words(levels[(n ?? 0) + mid] ?? String(n)),
    piece,
    counted: (n: number, id: string): string => `${String(n)} ${n === 1 ? piece(id).one : piece(id).many}`,
  };
}

/**
 * A variant's changes as sheet lines, for example "Siirt: +1 Police (from Available)." An added
 * piece came from Available when that pool fell and the piece total stayed.
 */
export function changeLines(changes: readonly SheetChange[], content: Json): string[] {
  const n = namesOf(content);
  const value = (v: number | string | null): string => (v === null ? "none" : typeof v === "string" ? words(v) : String(v));
  const pool = (id: string | null, kind: "available"): SheetChange | undefined => changes.find((c) => c.kind === kind && c.id === id);
  return changes.map((c) => {
    const id = c.id ?? "";
    const was = `${value(c.to)} (was ${value(c.from)})`;
    switch (c.kind) {
      case "threshold": return `${n.faction(id)} threshold ${was}.`;
      case "track": return `${n.track(id)} ${was}.`;
      case "level": return `${n.space(c.space ?? "")}: ${n.level(c.to as number | null)} (was ${n.level(c.from as number | null)}).`;
      case "available": return `Available ${n.piece(id).many}: ${was}.`;
      case "outOfPlay": return `Out of Play ${n.piece(id).many}: ${was}.`;
      case "total": return `${n.piece(id).many} total: ${was}.`;
      case "piece":
      case "marker": {
        const delta = Number(c.to) - Number(c.from);
        const face = c.face === null ? "" : ` (${words(c.face)})`;
        const name = c.kind === "piece" ? n.counted(Math.abs(delta), id).replace(/^\d+ /, "") : words(id);
        const avail = c.kind === "piece" ? pool(c.id, "available") : undefined;
        const kept = !changes.some((x) => x.kind === "total" && x.id === c.id);
        const from = avail !== undefined && kept && Math.sign(Number(avail.to) - Number(avail.from)) === -Math.sign(delta) ? (delta > 0 ? " (from Available)" : " (to Available)") : "";
        return `${n.space(c.space ?? "")}: ${delta > 0 ? "+" : "−"}${String(Math.abs(delta))} ${name}${face}${from}.`;
      }
    }
  });
}

/** The variant record of each scenario in package content, with its change lines (session export). */
export function variantsOf(content: Json): { readonly scenario: string; readonly name: string; readonly base: string; readonly changes: readonly string[] }[] {
  return Object.entries(content).flatMap(([path, v]) => {
    const record = obj(v)["variant"];
    if (!path.startsWith("scenarios/") || record === undefined) return [];
    return [{ scenario: str(obj(v)["id"]), name: str(obj(record)["name"]), base: str(obj(record)["base"]), changes: changeLines(arr(obj(record)["changes"]) as unknown as SheetChange[], content) }];
  });
}

/** One table cell: counts by abbreviation in pieces.yaml order, then markers in the last column. */
function cell(setup: Json, pieces: readonly Json[], faction: string, last: boolean, names: ReturnType<typeof namesOf>): string {
  const counts = obj(setup["pieces"]);
  const parts = pieces.filter((p) => p["faction"] === faction).flatMap((p) => {
    const id = str(p["id"]);
    const v = counts[id];
    if (v === undefined) return [];
    const faces = typeof v === "number" ? { [str(p["placedAs"])]: v } : obj(v);
    const total = Object.values(faces).reduce<number>((a, b) => a + Number(b), 0);
    const other = Object.entries(faces).filter(([f, c]) => f !== str(p["placedAs"]) && Number(c) > 0).map(([f, c]) => `${str(c)} ${words(f)}`);
    return total === 0 ? [] : [`${String(total)}${names.piece(id).abbr}${other.length === 0 ? "" : ` (${other.join(", ")})`}`];
  });
  const markers = last ? Object.entries(obj(setup["markers"])).flatMap(([id, v]) => (typeof v === "number" ? (v > 0 ? [`${v > 1 ? `${String(v)} ` : ""}${words(id)}`] : []) : Object.entries(obj(v)).filter(([, c]) => Number(c) > 0).map(([side, c]) => `${Number(c) > 1 ? `${str(c)} ` : ""}${words(id)} ${words(side)}`))) : [];
  const all = [...parts, ...markers];
  return all.length === 0 ? "—" : all.join(", ");
}

/**
 * Setup sheet of scenario `scenarioId` in the package `content` (hash `hash`): the rule 10.2 layout,
 * plus the change list when the scenario is a variant.
 */
export function setupSheet(content: Json, hash: string, scenarioId: string, start: SheetStart): string {
  const names = namesOf(content);
  const scenario = Object.entries(content).find(([path, v]) => path.startsWith("scenarios/") && obj(v)["id"] === scenarioId)?.[1];
  if (scenario === undefined) throw new RangeError(`Unknown scenario "${scenarioId}"`);
  const s = obj(scenario);
  const manifest = obj(content["manifest.yaml"]);
  const pieces = arr(content["pieces.yaml"]);
  const factions = arr(content["factions.yaml"]).filter((f) => f["kind"] === "player").map((f) => str(f["id"]));
  const variant = s["variant"] === undefined ? null : obj(s["variant"]);
  const setups = obj(s["spaces"]);
  const tracks = obj(s["tracks"]);
  const trackKinds = new Map(arr(content["tracks.yaml"]).map((t) => [str(t["id"]), str(t["kind"])]));
  const campaigns = (s["campaigns"] as string[] | undefined) ?? [];

  // Rows: the scenario's spaces in its own order, then each other space that can hold pieces.
  const listed = Object.keys(setups);
  const open = names.spaces.filter((sp) => !listed.includes(str(sp["id"])) && !arr(sp["tags"]).some((t) => ["noPieces", "eventsOnly"].includes(str(t)))).map((sp) => str(sp["id"]));
  const rows = [...listed, ...open].map((id) => `| ${names.space(id)} | ${factions.map((f, i) => cell(obj(setups[id]), pieces, f, i === factions.length - 1, names)).join(" | ")} |`);

  const numeric = Object.entries(tracks).filter(([id]) => trackKinds.get(id) === "numeric").map(([id, v]) => `${names.track(id)} ${str(v)}`);
  // Ordinal tracks in runs, in scenario order, one sentence each: "Legal Space is Absent and Ceasefire
  // None." Tracks that share an ID prefix (posture.) form their own run and drop the name words they
  // share: "Syria is Host, KDP Host and PUK Tolerant." A numeric track ends a run.
  const runs: string[][] = [];
  let runKey: string | null = null;
  for (const id of Object.keys(tracks)) {
    if (trackKinds.get(id) !== "ordinal") {
      runKey = null;
      continue;
    }
    const key = id.includes(".") ? (id.split(".")[0] ?? "") : "";
    const last = runs[runs.length - 1];
    if (last !== undefined && key === runKey) last.push(id);
    else runs.push([id]);
    runKey = key;
  }
  const ordinal = runs.map((run) => {
    const split = run.map((id) => names.track(id).split(" "));
    const tail = (w: readonly string[], n: number): string | undefined => w[w.length - 1 - n];
    let shared = 0;
    while (run.length > 1 && split.every((w) => w.length > shared + 1 && tail(w, shared) === tail(split[0] ?? [], shared))) shared += 1;
    const items = run.map((id, i) => `${(split[i] ?? []).slice(0, (split[i]?.length ?? 0) - shared).join(" ")}${i === 0 ? " is" : ""} ${words(str(tracks[id]))}`);
    return `${list(items)}.`;
  });
  const placed = new Set(Object.values(setups).flatMap((x) => Object.entries(obj(obj(x)["markers"])).filter(([, v]) => (typeof v === "number" ? v : Object.values(obj(v)).reduce<number>((a, b) => a + Number(b), 0)) > 0).map(([id]) => id)));
  const known = new Set(arr(content["markers.yaml"]).map((m) => str(m["id"])));
  const absent = START_MARKERS.filter(([, ids]) => ids.some((id) => known.has(id)) && !ids.some((id) => placed.has(id))).map(([name]) => name);
  const noMarkers = absent.length === 0 ? [] : [`There are no ${list(absent).replace(/ and (?=[^,]*$)/, " or ")} markers.`];
  const present = new Set(Object.values(setups).flatMap((x) => Object.keys(obj(obj(x)["pieces"]))));
  const legend = factions.map((f, i) => {
    const used = pieces.filter((p) => p["faction"] === f && present.has(str(p["id"]))).map((p) => `${names.piece(str(p["id"])).abbr} = ${names.piece(str(p["id"])).legend}`);
    return `${i === 0 ? `${names.faction(f)} abbreviations` : names.faction(f)}: ${used.join(", ")}.`;
  });
  const flipped = pieces.filter((p) => Array.isArray(p["states"]));
  // A count on another face shows in its cell, for example "3G (1 Active)".
  const otherFace = (p: Json): boolean => Object.values(setups).some((x) => { const v = obj(obj(x)["pieces"])[str(p["id"])]; return typeof v === "object" && Object.entries(obj(v)).some(([f, c]) => f !== str(p["placedAs"]) && Number(c) > 0); });
  const faces = flipped.map((p) => `All ${names.piece(str(p["id"])).many} below start ${words(str(p["placedAs"]))}${otherFace(p) ? " unless their cell names another state" : ""}.`);

  const levels = new Map<number, string[]>();
  for (const id of listed) {
    const level = obj(setups[id])["level"];
    if (typeof level === "number" && level !== 0) levels.set(level, [...(levels.get(level) ?? []), names.space(id)]);
  }
  const levelText = [...levels.keys()].sort((a, b) => a - b).map((l) => `Set **${names.level(l)}** in ${list(levels.get(l) ?? [])}.`);

  const available = pieces.filter((p) => (start.available[str(p["id"])] ?? 0) > 0).map((p) => names.counted(start.available[str(p["id"])] ?? 0, str(p["id"])));
  const outOfPlay = Object.entries(obj(s["outOfPlay"])).filter(([, c]) => Number(c) > 0).map(([id, c]) => {
    const total = Number(pieces.find((p) => p["id"] === id)?.["count"]);
    return Number(c) === total ? `All ${names.counted(total, id)} are Out of Play.` : `${names.counted(Number(c), id)} ${Number(c) === 1 ? "is" : "are"} Out of Play.`;
  });
  const harm = factions.every((f) => (start.harm[f] ?? 0) === 0) ? "Harm counts: zero each." : `Harm counts: ${factions.map((f) => `${names.faction(f)} ${String(start.harm[f] ?? 0)}`).join("; ")}.`;
  // Control of occupied domestic spaces: the most common controller is "all other".
  const pieceTotal = (id: string): number => Object.values(obj(obj(setups[id])["pieces"])).reduce<number>((sum, v) => sum + (typeof v === "number" ? v : Object.values(obj(v)).reduce<number>((a, b) => a + Number(b), 0)), 0);
  const occupied = [...listed, ...open].filter((id) => names.spaces.find((sp) => sp["id"] === id)?.["kind"] === "domestic" && pieceTotal(id) > 0);
  const byController = new Map<string | null, string[]>();
  for (const id of occupied) byController.set(start.control[id] ?? null, [...(byController.get(start.control[id] ?? null) ?? []), names.space(id)]);
  const main = [...byController.entries()].filter(([f]) => f !== null).sort((a, b) => b[1].length - a[1].length)[0]?.[0] ?? null;
  const control = [
    ...factions.filter((f) => f !== main && byController.has(f)).map((f) => `The ${names.faction(f)} Controls ${list(byController.get(f) ?? [])}.`),
    ...(byController.has(null) ? [`${list(byController.get(null) ?? [])} ${(byController.get(null) ?? []).length === 1 ? "has" : "have"} no Control.`] : []),
    ...(main === null ? [] : [`All other occupied domestic spaces are ${names.faction(main)}-Controlled.`]),
  ];
  const changes = variant === null ? [] : changeLines(arr(variant["changes"]) as unknown as SheetChange[], content);

  return [
    `# Setup sheet: ${str(s["title"])}${variant === null ? "" : `, variant ${str(variant["name"])}`}`,
    "",
    `${str(manifest["title"])} ${str(manifest["version"])}, content hash \`${hash.slice(0, 12)}\`.${variant === null ? "" : ` Variant \`${str(variant["name"])}\`, made on package \`${str(variant["base"]).slice(0, 12)}\`.`}`,
    "",
    `Campaigns ${list(campaigns)}. Final round ${str(s["finalRound"])}. Thresholds: ${factions.map((f) => `${names.faction(f)} ${str(obj(s["thresholds"])[f])}`).join(", ")}.`,
    "",
    ...(variant === null ? [] : ["## Changes from the package setup", "", ...(changes.length === 0 ? ["None."] : changes.map((l) => `- ${l}`)), ""]),
    "## Starting Position",
    "",
    [`Set ${list([...numeric, `Campaign ${campaigns[0] ?? ""}`])}.`, ...ordinal, ...noMarkers].join(" "),
    "",
    [...faces, "Unlisted spaces or piece types are empty.", ...legend].join(" "),
    "",
    `| Space | ${factions.map((f) => names.faction(f)).join(" | ")} |`,
    `|:---|${factions.map(() => ":---").join("|")}|`,
    ...rows,
    "",
    [...levelText, "All other domestic spaces are Neutral."].join(" "),
    "",
    [`Available: ${available.length === 0 ? "none" : list(available)}.`, ...outOfPlay, `Starting scores: ${factions.map((f) => `${names.faction(f)} ${String(start.scores[f] ?? 0)}`).join("; ")}.`, `Starting margins: ${list(factions.map((f) => signed(start.margins[f] ?? 0)))}.`, harm, ...control].join(" "),
    "",
  ].join("\n");
}
