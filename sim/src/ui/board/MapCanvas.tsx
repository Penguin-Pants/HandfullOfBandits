import { useState, type ReactNode } from "react";
import { presentation } from "./layout.ts";
import { usesAtlas } from "./region.ts";
import { Board, type BoardProps } from "./Board.tsx";
import { isEuropeTrack } from "../status/tracks.ts";

const MAX_ZOOM = 4;

/** Local camera and layer controls never alter game state or operation plans. */
export function MapCanvas({tools, ...props}: BoardProps & {readonly tools?: ReactNode}) {
  const geographic = usesAtlas(props.view.spaces);
  const centreX = geographic ? 640 : 500;
  const centreY = geographic ? 480 : 350;
  const anchor = (space: BoardProps["view"]["spaces"][number]) => geographic || isEuropeTrack(space) ? presentation(space) : {x:space.x,y:space.y,width:0,height:0};
  // Start at the smallest zoom (in quarter steps) that keeps the printed names readable at this window size.
  const [camera, setCamera] = useState(() => {
    if (typeof window === "undefined") return {zoom:1,x:0,y:0};
    const side = Math.min(420, Math.max(340, window.innerWidth * .23));
    const scale = Math.min((window.innerWidth - side - 14) / (2*centreX), (window.innerHeight - 200) / (2*centreY));
    return {zoom:Math.min(MAX_ZOOM,Math.max(1,Math.ceil(4 / scale) / 4)),x:0,y:0};
  });
  const [mode, setMode] = useState<"full" | "forces" | "political" | "terrain">("full");
  // The view never shows more than the board: the centre may move only while zoomed in.
  const keep = (c: {zoom: number; x: number; y: number}): typeof c => {
    const room = 1 - 1 / c.zoom;
    return {zoom:c.zoom,x:Math.max(-centreX*room,Math.min(centreX*room,c.x)),y:Math.max(-centreY*room,Math.min(centreY*room,c.y))};
  };
  /** Zoom by a step. `at` is the pointer offset from the view centre in map units; that map point stays under the pointer. */
  const zoom = (by: number, at = {x:0,y:0}): void => {setCamera(c => {
    const next = Math.max(1,Math.min(MAX_ZOOM,c.zoom+by));
    const k = 1 - c.zoom / next;
    return next === c.zoom ? c : keep({zoom:next,x:c.x+at.x*k,y:c.y+at.y*k});
  });};
  return <>
    <div className="map-navigation" aria-label="Map navigation">
      <strong className="board-title">SOUTHEASTERN TURKEY <span>1984–1999</span></strong>
      <div className="row" role="group" aria-label="Display mode">
        {(["full","forces","political","terrain"] as const).map(m => <button key={m} type="button" aria-pressed={mode === m} onClick={() => {setMode(m);}}>{m[0]?.toUpperCase()}{m.slice(1)}</button>)}
      </div>
      <div className="row">
        <label className="find-space"><span>Find space</span> <select aria-label="Find space" value="" onChange={e => {
          const space = props.view.spaces.find(s => s.id === e.target.value);
          if (space === undefined) return;
          if (!isEuropeTrack(space)) props.onSelect(space.id,false);
          setCamera(c => c.zoom <= 1 ? c : keep({...c,x:anchor(space).x+anchor(space).width/2-centreX,y:anchor(space).y+anchor(space).height/2-centreY}));
        }}><option value="">Select a space…</option><optgroup label="Spaces">{props.view.spaces.filter(s => !isEuropeTrack(s)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup><optgroup label="Tracks">{props.view.spaces.filter(isEuropeTrack).map(s => <option key={s.id} value={s.id}>{s.name} track</option>)}</optgroup></select></label>
        <button type="button" aria-label="Zoom out" disabled={camera.zoom <= 1} onClick={() => {zoom(-.25);}}>−</button>
        <output aria-label="Map zoom">{Math.round(camera.zoom*100)}%</output>
        <button type="button" aria-label="Zoom in" disabled={camera.zoom >= MAX_ZOOM} onClick={() => {zoom(.25);}}>+</button>
        <button type="button" onClick={() => {setCamera({zoom:1,x:0,y:0});}}>Fit map</button>
      </div>
      {tools}
    </div>
    <div className="map-window">
      <Board {...props} onReveal={id => {const space=props.view.spaces.find(s => s.id === id); if (space !== undefined) setCamera(c => c.zoom <= 1 ? c : keep({...c,x:anchor(space).x+anchor(space).width/2-centreX,y:anchor(space).y+anchor(space).height/2-centreY}));}} mode={mode} camera={camera} onZoom={(dir,at) => {zoom(dir*.25,at);}} onPan={(dx,dy) => {setCamera(c => keep({...c,x:c.x+dx,y:c.y+dy}));}} />
    </div>
    <div className="map-caption">{props.eligible != null && <strong>{props.eligible.length} candidate targets · Outlined on map · Validate the full plan</strong>}{mode === "terrain" ? "Terrain view · Select any space to inspect its live state." : "Right-click or long press for space details · Shift-click to add · Drag pieces to plan a move"}<span>Wheel to zoom · Drag to pan · Arrow keys pan</span></div>
  </>;
}
