// Map tracks (UC-7): Europe has a separate scale. Host postures appear on their external boxes
// (Syria-Bekaa, KDP Zone, PUK Zone). Other tracks go in the Resources and politics card.
import type { BoardView } from "../api.ts";

type Space = BoardView["spaces"][number];

/** Europe has a legacy map entry, but represents a track rather than a playable space. */
export function isEuropeTrack(space: Space): boolean {
  return space.id === "europe" && space.tags.includes("noPieces");
}

/** The legacy map entry associated with this track, or undefined. */
export function spaceOfTrack(trackId: string, spaces: readonly Space[]): Space | undefined {
  const direct = spaces.find((s) => s.id === trackId);
  if (direct !== undefined) return direct;
  const host = /^posture\.(.+)$/.exec(trackId)?.[1];
  return host === undefined ? undefined : spaces.find((s) => s.kind === "external" && s.id.startsWith(host));
}
