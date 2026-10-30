// Which tracks the map draws on a box (UC-7): a track whose ID is a space ID (Europe), or a host
// posture `posture.<host>` on the external box whose ID starts with that host (Syria-Bekaa, KDP
// Zone, PUK Zone). The other tracks go in the Resources and politics card.
import type { BoardView } from "../api.ts";

type Space = BoardView["spaces"][number];

/** The space that shows this track, or undefined. */
export function spaceOfTrack(trackId: string, spaces: readonly Space[]): Space | undefined {
  const direct = spaces.find((s) => s.id === trackId);
  if (direct !== undefined) return direct;
  const host = /^posture\.(.+)$/.exec(trackId)?.[1];
  return host === undefined ? undefined : spaces.find((s) => s.kind === "external" && s.id.startsWith(host));
}
