// Cross-file package checks (04 s9): V-REF, V-PIECES, V-STACK, V-LINKS, V-PARAM, V-FACTIONS, V-RANGE.
// Input has passed V-SCHEMA. Each issue names file, path, element ID and one sentence.
import type { PackageFileData } from "./schema/index.ts";

export type IssueCode = "V-SCHEMA" | "V-REF" | "V-PIECES" | "V-STACK" | "V-LINKS" | "V-PARAM" | "V-FACTIONS" | "V-RANGE";

export interface PackageIssue {
  readonly level: "error" | "warning";
  readonly code: IssueCode;
  /** File path inside the package, for example `scenarios/s0.yaml`. */
  readonly file: string;
  /** Dot path inside the file. Empty for the file root. */
  readonly path: string;
  /** ID of the element the issue is about. Null when no element applies. */
  readonly id: string | null;
  readonly message: string;
}

export interface PackageData {
  readonly manifest: PackageFileData<"manifest">;
  readonly parameters: PackageFileData<"parameters">;
  readonly factions: PackageFileData<"factions">;
  readonly pieces: PackageFileData<"pieces">;
  readonly map: PackageFileData<"map">;
  readonly tracks: PackageFileData<"tracks">;
  readonly markers: PackageFileData<"markers">;
  /** By file path, for example `scenarios/s0.yaml`. */
  readonly scenarios: Readonly<Record<string, PackageFileData<"scenario">>>;
}

/** Player faction counts the package format allows (04 s4.1). The sequence model check comes with P2-03. */
const PLAYER_FACTIONS = { min: 2, max: 4 };

type Space = PackageFileData<"map">["spaces"][number];
type FaceCounts = number | Readonly<Record<string, number>>;

/** Own entry only: a key such as `constructor` must not read an Object property. */
function own<T>(record: Readonly<Record<string, T>> | undefined, key: string): T | undefined {
  return record !== undefined && Object.hasOwn(record, key) ? record[key] : undefined;
}

function total(faces: FaceCounts): number {
  return typeof faces === "number" ? faces : Object.values(faces).reduce((sum, n) => sum + n, 0);
}

/** All checks in a fixed order, so the same package always gives the same list. */
export function validatePackage(pkg: PackageData): PackageIssue[] {
  const issues: PackageIssue[] = [];
  const error = (code: IssueCode, file: string, path: string, id: string | null, message: string): void => {
    issues.push({ level: "error", code, file, path, id, message });
  };

  const factions = new Map(pkg.factions.map((f) => [f.id, f]));
  const pieces = new Map(pkg.pieces.map((p) => [p.id, p]));
  const spaces = new Map(pkg.map.spaces.map((s) => [s.id, s]));
  const tracks = new Map(pkg.tracks.map((t) => [t.id, t]));
  const markers = new Map(pkg.markers.map((m) => [m.id, m]));

  /** V-REF: `value` must be a key of `known`. */
  const ref = (known: ReadonlyMap<string, unknown>, kind: string, value: string, file: string, path: string, id: string): void => {
    if (!known.has(value)) error("V-REF", file, path, id, `Unknown ${kind} "${value}".`);
  };
  /** V-REF: `value` must be one of `faces`. */
  const face = (faces: readonly string[], kind: string, value: string, file: string, path: string, id: string): void => {
    if (!faces.includes(value)) error("V-REF", file, path, id, `Unknown ${kind} "${value}". Use one of: ${faces.join(", ") || "none"}.`);
  };

  // V-FACTIONS
  const players = pkg.factions.filter((f) => f.kind === "player").length;
  if (players < PLAYER_FACTIONS.min || players > PLAYER_FACTIONS.max) {
    error("V-FACTIONS", "factions.yaml", "", null, `Found ${String(players)} player factions. Use ${String(PLAYER_FACTIONS.min)} to ${String(PLAYER_FACTIONS.max)}.`);
  }
  pkg.factions.forEach((f, i) => {
    if (f.resourcesTrack !== undefined) ref(tracks, "track", f.resourcesTrack, "factions.yaml", `${String(i)}.resourcesTrack`, f.id);
  });

  // V-PARAM
  pkg.parameters.forEach((p, i) => {
    if (p.tune && p.value === undefined) error("V-PARAM", "parameters.yaml", `${String(i)}.value`, p.id, "A tune parameter needs a value.");
  });

  // V-REF: pieces, tracks
  pkg.pieces.forEach((p, i) => {
    const at = (field: string): string => `${String(i)}.${field}`;
    ref(factions, "faction", p.faction, "pieces.yaml", at("faction"), p.id);
    if (p.placedAs !== undefined) face(p.states ?? [], "flip state", p.placedAs, "pieces.yaml", at("placedAs"), p.id);
    if (p.emblemState !== undefined) face(p.states ?? [], "flip state", p.emblemState, "pieces.yaml", at("emblemState"), p.id);
  });
  const parameters = new Map(pkg.parameters.map((p) => [p.id, p]));
  pkg.tracks.forEach((t, i) => {
    if (t.owner !== undefined) ref(factions, "faction", t.owner, "tracks.yaml", `${String(i)}.owner`, t.id);
    if (t.kind !== "numeric" || t.overflow === undefined) return;
    const at = (field: string): string => `${String(i)}.overflow.${field}`;
    const target = tracks.get(t.overflow.track);
    if (target?.kind !== "numeric" || target.id === t.id) {
      error("V-REF", "tracks.yaml", at("track"), t.id, `Overflow track "${t.overflow.track}" must be another numeric track.`);
    }
    const cost = parameters.get(t.overflow.costParam);
    if (cost === undefined) {
      ref(parameters, "parameter", t.overflow.costParam, "tracks.yaml", at("costParam"), t.id);
    } else if (typeof cost.value !== "number" || cost.value < 1) {
      error("V-PARAM", "tracks.yaml", at("costParam"), t.id, `Parameter "${cost.id}" must hold a positive integer.`);
    }
  });

  // V-LINKS, V-REF: map
  const pairs = new Set<string>();
  pkg.map.links.forEach((link, i) => {
    const at = (field: string): string => `links.${String(i)}.${field}`;
    const id = `${link.a}-${link.b}`;
    for (const end of ["a", "b"] as const) {
      if (!spaces.has(link[end])) error("V-LINKS", "map.yaml", at(end), id, `Link to unknown space "${link[end]}".`);
    }
    if (link.a === link.b) error("V-LINKS", "map.yaml", at("b"), id, "A space cannot link to itself.");
    const key = [link.a, link.b].sort().join("\u0000");
    if (pairs.has(key)) error("V-LINKS", "map.yaml", `links.${String(i)}`, id, "This pair is already linked. List each link once; links work both ways.");
    pairs.add(key);
    if (link.gate !== undefined) {
      const track = tracks.get(link.gate.track);
      if (track === undefined) {
        ref(tracks, "track", link.gate.track, "map.yaml", at("gate.track"), id);
      } else if (track.kind !== "ordinal") {
        error("V-REF", "map.yaml", at("gate.track"), id, `Gate track "${track.id}" must be ordinal.`);
      } else {
        link.gate.steps.forEach((step, j) => { face(track.steps, "step", step, "map.yaml", at(`gate.steps.${String(j)}`), id); });
      }
    }
  });
  pkg.map.stacking.forEach((rule, i) => {
    const id = `stacking.${String(i)}`;
    rule.pieces.forEach((p, j) => { ref(pieces, "piece", p, "map.yaml", `${id}.pieces.${String(j)}`, id); });
    rule.spaces?.forEach((s, j) => { ref(spaces, "space", s, "map.yaml", `${id}.spaces.${String(j)}`, id); });
  });
  const levelRange = pkg.map.supportLevels === undefined ? null : (pkg.map.supportLevels.length - 1) / 2;
  pkg.map.spaces.forEach((s, i) => {
    if (s.hasSupportScale && levelRange === null) {
      error("V-RANGE", "map.yaml", `spaces.${String(i)}.hasSupportScale`, s.id, "A space with a support scale needs supportLevels in map.yaml.");
    }
  });

  for (const [file, scenario] of Object.entries(pkg.scenarios)) {
    const onMap = new Map<string, number>();
    const markersOnMap = new Map<string, number>();

    for (const [trackId, value] of Object.entries(scenario.tracks)) {
      const path = `tracks.${trackId}`;
      const track = tracks.get(trackId);
      if (track === undefined) {
        ref(tracks, "track", trackId, file, path, trackId);
      } else if (track.kind === "numeric") {
        if (typeof value !== "number" || value < track.min || value > track.max) {
          error("V-RANGE", file, path, trackId, `Use a number from ${String(track.min)} to ${String(track.max)}.`);
        }
      } else if (typeof value !== "string") {
        error("V-RANGE", file, path, trackId, `Use a step ID: ${track.steps.join(", ")}.`);
      } else {
        face(track.steps, "step", value, file, path, trackId);
      }
    }

    for (const [spaceId, setup] of Object.entries(scenario.spaces)) {
      const at = `spaces.${spaceId}`;
      const space = spaces.get(spaceId);
      if (space === undefined) {
        ref(spaces, "space", spaceId, file, at, spaceId);
        continue;
      }
      if (setup.level !== undefined) {
        // A support scale space without supportLevels is already reported for map.yaml.
        if (!space.hasSupportScale) {
          error("V-RANGE", file, `${at}.level`, spaceId, "This space has no support scale, so it has no level.");
        } else if (levelRange !== null && Math.abs(setup.level) > levelRange) {
          error("V-RANGE", file, `${at}.level`, spaceId, `Use a level from ${String(-levelRange)} to ${String(levelRange)}.`);
        }
      }
      for (const [pieceId, faces] of Object.entries(setup.pieces ?? {})) {
        const piece = pieces.get(pieceId);
        if (piece === undefined) {
          ref(pieces, "piece", pieceId, file, `${at}.pieces.${pieceId}`, spaceId);
          continue;
        }
        // A bare count places pieces on their placedAs face (05 s7).
        if (typeof faces !== "number") {
          for (const key of Object.keys(faces)) face(piece.states ?? [], "flip state", key, file, `${at}.pieces.${pieceId}.${key}`, spaceId);
        }
        onMap.set(pieceId, (onMap.get(pieceId) ?? 0) + total(faces));
      }
      for (const [markerId, faces] of Object.entries(setup.markers ?? {})) {
        const marker = markers.get(markerId);
        if (marker === undefined) {
          ref(markers, "marker", markerId, file, `${at}.markers.${markerId}`, spaceId);
          continue;
        }
        if (typeof faces === "number" && marker.sides !== undefined) {
          error("V-REF", file, `${at}.markers.${markerId}`, spaceId, `Give counts per side: ${marker.sides.join(", ")}.`);
        } else if (typeof faces !== "number") {
          for (const key of Object.keys(faces)) face(marker.sides ?? [], "side", key, file, `${at}.markers.${markerId}.${key}`, spaceId);
        }
        markersOnMap.set(markerId, (markersOnMap.get(markerId) ?? 0) + total(faces));
      }
      checkStacking(space, setup.pieces ?? {}, (message) => { error("V-STACK", file, `${at}.pieces`, spaceId, message); });
    }

    for (const pool of ["available", "outOfPlay"] as const) {
      for (const pieceId of Object.keys(scenario[pool] ?? {})) ref(pieces, "piece", pieceId, file, `${pool}.${pieceId}`, pieceId);
    }
    for (const [key, kind] of [["pivotals", "faction"], ["thresholds", "faction"]] as const) {
      for (const factionId of Object.keys(scenario[key] ?? {})) ref(factions, kind, factionId, file, `${key}.${factionId}`, factionId);
    }

    // V-PIECES: map plus pools equals the total of each piece type. Markers on the map fit their supply.
    for (const piece of pkg.pieces) {
      const map = onMap.get(piece.id) ?? 0;
      const available = own(scenario.available, piece.id) ?? 0;
      const outOfPlay = own(scenario.outOfPlay, piece.id) ?? 0;
      if (map + available + outOfPlay !== piece.count) {
        error("V-PIECES", file, "", piece.id, `${String(map)} on the map + ${String(available)} available + ${String(outOfPlay)} out of play = ${String(map + available + outOfPlay)}, but pieces.yaml has ${String(piece.count)}.`);
      }
    }
    for (const marker of pkg.markers) {
      const used = markersOnMap.get(marker.id) ?? 0;
      if (used > marker.count) error("V-PIECES", file, "", marker.id, `${String(used)} on the map, but markers.yaml has ${String(marker.count)}.`);
    }
  }

  function checkStacking(space: Space, placed: Readonly<Record<string, FaceCounts>>, report: (message: string) => void): void {
    pkg.map.stacking.forEach((rule, i) => {
      if (rule.spaceKind !== undefined && rule.spaceKind !== space.kind) return;
      if (rule.terrain !== undefined && (space.terrain === undefined || !rule.terrain.includes(space.terrain))) return;
      if (rule.spaces !== undefined && !rule.spaces.includes(space.id)) return;
      const count = rule.pieces.reduce((sum, p) => sum + total(own(placed, p) ?? 0), 0);
      if (count > rule.max) report(`${String(count)} of ${rule.pieces.join(", ")} exceed the limit of ${String(rule.max)} (map.yaml stacking.${String(i)}).`);
    });
  }

  return issues;
}
