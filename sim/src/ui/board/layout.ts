// Presentation bounds only. No rules, links or stored coordinates are modified.
import type { SpaceView } from "../api.ts";
import { ATLAS } from "./atlas-data.ts";
import { isEuropeTrack } from "../status/tracks.ts";

export interface SpaceLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly callout: boolean;
}
/** Information anchors for geographic spaces, Western Cities and the Europe track. */
export function presentation(space: SpaceView): SpaceLayout {
  if (isEuropeTrack(space)) return {x:10,y:315,width:108,height:280,callout:true};
  const area = ATLAS.spaces[space.id] ?? ATLAS.insets[space.id];
  if (area === undefined) return {x:space.x-55,y:space.y-40,width:110,height:22,callout:false};
  const [x,y,width] = area.info;
  const lines = ["diyarbakir-rural","diyarbakir-city","western-cities"].includes(space.id) ? 2 : 1;
  return {x,y,width,height:lines*24,callout:ATLAS.insets[space.id] !== undefined};
}

/** A consistent name → control/population → political alignment hierarchy. */
export function statusLayout(space: SpaceView): readonly SpaceLayout[] {
  if (space.kind !== "domestic") return [];
  const p=presentation(space);
  const y = p.y + 20 + p.height - 10;
  return [{...p,x:p.x+4,y:y+1,width:p.width-34,height:21},{...p,y:y+27,height:22},{...p,x:p.x+p.width-24,y,width:22,height:23}];
}
