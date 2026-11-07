import { useState, type ReactNode } from "react";
import { presentation } from "./layout.ts";
import { usesAtlas } from "./region.ts";
import { Board, type BoardProps } from "./Board.tsx";

/** Local camera and layer controls never alter game state or operation plans. */
export function MapCanvas({tools, ...props}: BoardProps & {readonly tools?: ReactNode}) {
  const geographic = usesAtlas(props.view.spaces);
  const centreX = geographic ? 640 : 500;
  const centreY = geographic ? 480 : 350;
  const anchor = (space: BoardProps["view"]["spaces"][number]) => geographic ? presentation(space) : {x:space.x,y:space.y,width:0,height:0};
  const [camera, setCamera] = useState({zoom:typeof window === "undefined" ? 1 : window.innerWidth < 1450 ? 2.5 : window.innerWidth < 1600 || window.innerHeight < 900 ? 2 : window.innerWidth < 2000 || window.innerHeight < 1200 ? 1.5 : 1,x:0,y:0});
  const [mode, setMode] = useState<"full" | "forces" | "political" | "terrain">("full");
  const zoom = (by: number): void => {setCamera(c => ({...c,zoom:Math.max(1,Math.min(3,c.zoom+by))}));};
  return <>
    <div className="map-navigation" aria-label="Map navigation">
      <strong className="board-title">SOUTHEASTERN TURKEY <span>1984–1999</span></strong>
      <div className="row" role="group" aria-label="Display mode">
        {(["full","forces","political","terrain"] as const).map(m => <button key={m} type="button" aria-pressed={mode === m} onClick={() => {setMode(m);}}>{m[0]?.toUpperCase()}{m.slice(1)}</button>)}
      </div>
      <div className="row">
        <label className="find-space">Find space <select aria-label="Find space" value="" onChange={e => {
          const space = props.view.spaces.find(s => s.id === e.target.value);
          if (space === undefined) return;
          props.onSelect(space.id,false);
          setCamera(c => c.zoom <= 1 ? c : {...c,x:anchor(space).x+anchor(space).width/2-centreX,y:anchor(space).y+anchor(space).height/2-centreY});
        }}><option value="">Select a space…</option>{props.view.spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <button type="button" aria-label="Zoom out" disabled={camera.zoom <= 1} onClick={() => {zoom(-.25);}}>−</button>
        <output aria-label="Map zoom">{Math.round(camera.zoom*100)}%</output>
        <button type="button" aria-label="Zoom in" disabled={camera.zoom >= 3} onClick={() => {zoom(.25);}}>+</button>
        <button type="button" onClick={() => {setCamera({zoom:1,x:0,y:0});}}>Fit map</button>
      </div>
      {tools}
    </div>
    <div className="map-window">
      <Board {...props} onReveal={id => {const space=props.view.spaces.find(s => s.id === id); if (space !== undefined) setCamera(c => c.zoom <= 1 ? c : {...c,x:anchor(space).x+anchor(space).width/2-centreX,y:anchor(space).y+anchor(space).height/2-centreY});}} mode={mode} camera={camera} onPan={(dx,dy) => {setCamera(c => ({...c,x:Math.max(-640,Math.min(640,c.x+dx)),y:Math.max(-480,Math.min(480,c.y+dy))}));}} />
    </div>
    <div className="map-caption">{props.eligible != null && <strong>{props.eligible.length} candidate targets · Outlined on map · Validate the full plan</strong>}{mode === "terrain" ? "Terrain view · Select any space to inspect its live state." : "Select to inspect · Shift-click to add · Drag pieces to plan a move"}<span>Alt-drag or focus board + arrow keys to pan</span></div>
  </>;
}
